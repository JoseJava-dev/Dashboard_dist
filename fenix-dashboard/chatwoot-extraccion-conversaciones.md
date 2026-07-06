# Extracción de conversaciones de Chatwoot filtradas por día/mes

Documento de referencia técnica basado en la documentación oficial de Chatwoot
(`developers.chatwoot.com`) y el código fuente del proyecto. Pensado para pasarle
a un LLM/agente que va a implementar esto dentro del flujo de n8n de Fenix.

---

## 1. Autenticación

Todos los endpoints requieren el header:

```
api_access_token: <tu_token>
```

El token se obtiene desde el perfil del usuario en Chatwoot (Profile Settings → Access Token).
También hace falta el `account_id` numérico de la cuenta de Chatwoot.

Base URL: si Chatwoot está self-hosted (como en Fenix), reemplazar
`https://app.chatwoot.com` por el dominio propio, ej.
`https://dfchatwoot.sistemadistribuidorafenix.com`.

---

## 2. Hallazgo clave (por qué el diseño es así)

Antes de mostrar el código, esto es importante para que el LLM no intente "atajos" que no funcionan:

- El endpoint de filtro avanzado (`POST /conversations/filter`) sí permite filtrar por el
  atributo `created_at`, pero el único operador documentado para atributos de tipo fecha es
  `days_before` (relativo: "creada hace más de N días"). **No soporta un rango absoluto
  desde–hasta.** Por eso no sirve para pedir "todas las conversaciones de julio" de forma directa.
- El endpoint de listado (`GET /conversations`) tampoco acepta parámetros de rango de fechas;
  sus únicos filtros documentados son `assignee_type`, `status`, `q`, `inbox_id`, `team_id`,
  `labels` y `page`.
- Por lo tanto, para traer **conversaciones exactas de un día o un mes**, la única vía confiable
  es: paginar el listado completo y filtrar por `created_at` en el propio código.
- Para **conteos agregados** (cuántas conversaciones entraron en un rango), sí existe un endpoint
  de Reportes que acepta `since`/`until` como timestamps Unix y devuelve el total directamente,
  sin necesidad de traer conversación por conversación.
- Todos los campos `created_at` que devuelve Chatwoot son **timestamps Unix en segundos**
  (no milisegundos, no ISO string).

---

## 3. Endpoints a usar

| Propósito | Método | Endpoint |
|---|---|---|
| Conteo agregado de conversaciones en un rango de fechas | GET | `/api/v2/accounts/{account_id}/reports?metric=conversations_count&type=account&since={unix}&until={unix}` |
| Listado paginado de conversaciones (para filtrar por fecha exacta) | GET | `/api/v1/accounts/{account_id}/conversations?status=all&assignee_type=all&page={n}` |
| Detalle de una conversación puntual | GET | `/api/v1/accounts/{account_id}/conversations/{conversation_id}` |

El listado pagina de a 25 conversaciones por página. Hay que seguir pidiendo páginas
hasta que el `payload` venga vacío.

**Nota sobre orden:** la API no documenta el criterio de orden del listado, así que el código
no asume que viene ordenado por fecha de creación — recorre todas las páginas sin cortar antes de tiempo.
Si el volumen de conversaciones crece mucho, esto se puede optimizar más adelante una vez que se
confirme el orden real devuelto por la instancia self-hosted.

---

## 4. Supuestos del entorno de ejecución (n8n Code node)

El código de abajo asume que corre en un nodo **Code** de n8n con runtime Node.js, donde:

- `fetch` está disponible globalmente (Node 18+, que es lo que usa n8n desde hace varias versiones).
- `DateTime` de **Luxon** está disponible globalmente (n8n lo expone sin necesidad de `require`),
  y se usa acá para calcular límites de día/mes respetando la zona horaria de Argentina
  (`America/Argentina/Buenos_Aires`) y evitar errores de UTC manual.

Si el LLM que arma el flujo detecta que alguna de estas dos cosas no está disponible en la
versión de n8n que estás usando, hay que reemplazar `fetch` por el nodo HTTP Request de n8n,
y `Luxon` por cálculo manual de offset UTC-3.

---

## 5. Funciones

### 5.1 Calcular el rango de un día específico

```javascript
function getDayRange(fechaISO, zona = 'America/Argentina/Buenos_Aires') {
  // fechaISO: 'YYYY-MM-DD', ej. '2026-07-04'
  const inicio = DateTime.fromISO(fechaISO, { zone: zona }).startOf('day');
  const fin = inicio.endOf('day');
  return {
    desde: Math.floor(inicio.toSeconds()),
    hasta: Math.floor(fin.toSeconds()),
  };
}
```

### 5.2 Calcular el rango de un mes específico

```javascript
function getMonthRange(anio, mes, zona = 'America/Argentina/Buenos_Aires') {
  // mes: 1-12
  const inicio = DateTime.fromObject(
    { year: anio, month: mes, day: 1 },
    { zone: zona }
  ).startOf('day');
  const fin = inicio.endOf('month');
  return {
    desde: Math.floor(inicio.toSeconds()),
    hasta: Math.floor(fin.toSeconds()),
  };
}
```

### 5.3 Conteo agregado (rápido) vía Reports API

```javascript
async function getConteoConversaciones({ baseUrl, accountId, apiToken, desde, hasta }) {
  const url = `${baseUrl}/api/v2/accounts/${accountId}/reports` +
    `?metric=conversations_count&type=account&since=${desde}&until=${hasta}`;

  const respuesta = await fetch(url, {
    method: 'GET',
    headers: { api_access_token: apiToken },
  });

  if (!respuesta.ok) {
    throw new Error(`Error consultando reportes de Chatwoot: ${respuesta.status}`);
  }

  const datos = await respuesta.json();
  // datos es un array de { value, timestamp } — uno por cada bucket que devuelva Chatwoot
  const total = datos.reduce((acc, punto) => acc + Number(punto.value || 0), 0);

  return { total, detalle: datos };
}
```

### 5.4 Listado completo de conversaciones en un rango exacto (paginando y filtrando)

```javascript
async function getConversacionesEnRango({ baseUrl, accountId, apiToken, desde, hasta }) {
  const conversacionesFiltradas = [];
  let pagina = 1;
  let seguirPaginando = true;

  while (seguirPaginando) {
    const url = `${baseUrl}/api/v1/accounts/${accountId}/conversations` +
      `?status=all&assignee_type=all&page=${pagina}`;

    const respuesta = await fetch(url, {
      method: 'GET',
      headers: { api_access_token: apiToken },
    });

    if (!respuesta.ok) {
      throw new Error(`Error consultando conversaciones de Chatwoot: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    const conversaciones = datos?.data?.payload ?? [];

    if (conversaciones.length === 0) {
      seguirPaginando = false;
      break;
    }

    for (const conversacion of conversaciones) {
      // created_at viene en segundos (epoch Unix)
      if (conversacion.created_at >= desde && conversacion.created_at <= hasta) {
        conversacionesFiltradas.push(conversacion);
      }
    }

    pagina += 1;
  }

  return conversacionesFiltradas;
}
```

### 5.5 Agrupar conversaciones ya traídas, por día o por mes

Útil cuando ya trajiste un rango amplio (ej. "todo el mes") y necesitás la planilla
desglosada por día, sin volver a golpear la API.

```javascript
function agruparPorDia(conversaciones, zona = 'America/Argentina/Buenos_Aires') {
  const grupos = {};

  for (const conversacion of conversaciones) {
    const clave = DateTime.fromSeconds(conversacion.created_at, { zone: zona }).toFormat('yyyy-MM-dd');
    if (!grupos[clave]) grupos[clave] = [];
    grupos[clave].push(conversacion);
  }

  return grupos; // ej. { '2026-07-01': [...], '2026-07-02': [...] }
}

function agruparPorMes(conversaciones, zona = 'America/Argentina/Buenos_Aires') {
  const grupos = {};

  for (const conversacion of conversaciones) {
    const clave = DateTime.fromSeconds(conversacion.created_at, { zone: zona }).toFormat('yyyy-MM');
    if (!grupos[clave]) grupos[clave] = [];
    grupos[clave].push(conversacion);
  }

  return grupos; // ej. { '2026-07': [...], '2026-06': [...] }
}
```

---

## 6. Ejemplo de uso completo (nodo Code de n8n)

```javascript
const CONFIG = {
  baseUrl: 'https://dfchatwoot.sistemadistribuidorafenix.com',
  accountId: 1,               // reemplazar por el account_id real
  apiToken: '{{TU_API_TOKEN}}', // idealmente desde una credencial/variable de entorno de n8n
};

// Ejemplo: conversaciones de hoy
const rangoHoy = getDayRange('2026-07-04');
const conteoHoy = await getConteoConversaciones({ ...CONFIG, ...rangoHoy });
const conversacionesHoy = await getConversacionesEnRango({ ...CONFIG, ...rangoHoy });

// Ejemplo: conversaciones de julio 2026, desglosadas por día
const rangoMes = getMonthRange(2026, 7);
const conversacionesDelMes = await getConversacionesEnRango({ ...CONFIG, ...rangoMes });
const porDia = agruparPorDia(conversacionesDelMes);

return [{
  json: {
    total_hoy: conteoHoy.total,
    conversaciones_hoy: conversacionesHoy,
    conversaciones_por_dia_julio: porDia,
  },
}];
```

---

## 7. Resumen para el LLM que arma el flujo

- Usar `getConteoConversaciones` cuando solo se necesite un número (para las tarjetas KPI del dashboard).
- Usar `getConversacionesEnRango` cuando se necesite el detalle real de cada conversación
  (para armar las 5 planillas).
- No intentar filtrar por fecha directamente en la API de Chatwoot con un rango absoluto —
  no está soportado; el filtrado por fecha exacta se hace siempre del lado del código, sobre
  el campo `created_at` (Unix, segundos).
- Si el volumen de conversaciones históricas es muy grande, considerar cachear los resultados
  ya procesados (por ejemplo, en la tabla `eventos_automatizacion` de Supabase que ya armamos)
  en lugar de repaginar todo Chatwoot en cada corrida.
