# Dashboard Fenix — Instrucciones de Desarrollo (Fase 1)

**Proyecto:** Automatización de gestión de stock — Distribuidora Fenix
**Alcance de esta fase:** Dashboard web con 1 sección activa (Volumen y Throughput) + secciones de expansión bloqueadas para roadmap futuro.
**Audiencia de este documento:** equipo de desarrollo frontend.

---

## 1. Contexto del proyecto

El dashboard muestra el rendimiento de una automatización que corre sobre WhatsApp → Chatwoot → n8n. La automatización recibe fotos de productos, facturas y códigos de barra, y genera plantillas para WooCommerce y Dux. Este dashboard **no** ejecuta la automatización — solo consume y visualiza las métricas que esa automatización va generando.

Por ahora el dashboard tiene **una sola sección con datos reales** (Volumen y Throughput) y **cinco secciones de roadmap** que deben estar visibles en la navegación pero bloqueadas, para comunicar al cliente que el producto va a seguir creciendo.

No se debe construir ninguna lógica de negocio para las secciones de expansión: son solo destinos de navegación con un estado "bloqueado".

---

## 2. Arquitectura general

- Construir como aplicación de una sola página (SPA), con navegación entre secciones sin recarga completa.
- Separar claramente tres capas:
  1. **Capa de datos**: un módulo que obtiene las métricas (por ahora puede ser un mock/JSON estático o un endpoint temporal; dejar preparado el punto de conexión para que más adelante se reemplace por la fuente real, sin tener que tocar los componentes visuales).
  2. **Capa de estado**: maneja el período seleccionado (Hoy / Esta semana / Este mes / Todo) y dispara la recarga de datos cuando cambia.
  3. **Capa de presentación**: componentes puramente visuales, que reciben datos ya procesados y no saben de dónde vienen.
- Cada componente visual debe ser independiente y reutilizable. En particular, la tarjeta de KPI (número + label + subtítulo) va a reutilizarse en las futuras secciones, así que debe construirse genérica desde el día uno, no atada a los datos de Volumen y Throughput.
- No hardcodear textos de métricas dentro de los componentes de layout (sidebar, header). Toda esa información debe entrar como configuración/datos.

---

## 3. Sistema de diseño — Paleta de colores

Usar exclusivamente esta paleta como base de marca. No reutilizar los colores del dashboard de referencia (SYK) que se mostró como inspiración de layout — ese fue solo un ejemplo estructural, no de estilo visual.

| Uso | Nombre | Hex |
|---|---|---|
| Acento principal / CTA / elementos destacados | Naranja Principal | `#E18E11` |
| Detalles secundarios, subtextos destacados | Dorado/Amarillo Secundario | `#F6B83B` |
| Texto principal | Negro/Antracita | `#1E1E1E` |
| Fondo general de la app | Fondo Claro/Crema | `#FDF9F3` |
| Tarjetas y superficies limpias | Blanco Puro | `#FFFFFF` |

### Colores complementarios a definir (no vienen en la paleta original)

La paleta de marca no incluye grises neutros ni colores funcionales (positivo/negativo/bloqueado), que el dashboard sí necesita. Definir estos antes de construir, manteniendo la temperatura cálida de la marca:

- **Texto secundario / labels**: un gris cálido oscuro, no gris frío puro (para no romper la paleta crema). Ejemplo de rango a usar: un gris con tinte marrón claro, más suave que el `#1E1E1E`.
- **Bordes y separadores**: un tono muy sutil, apenas por encima del fondo crema, casi imperceptible.
- **Indicador de tendencia positiva**: puede resolverse con el mismo naranja/dorado de marca (ej. flecha o badge en `#E18E11`) para no introducir un verde que no pertenece a la identidad. Si se prefiere diferenciar positivo/negativo con color, usar un verde apagado solo para positivo y un rojo apagado solo para alertas/negativo, ambos de baja saturación para no competir con el naranja principal.
- **Estado bloqueado (secciones de expansión)**: usar una versión desaturada/opaca de los colores de marca (no gris genérico de sistema), para que las secciones bloqueadas se vean "apagadas" pero sigan perteneciendo visualmente a Fenix.

Confirmar estos tonos con diseño antes de implementar si hay dudas; si no hay definición de diseño disponible, el equipo de desarrollo puede resolverlos por su cuenta siguiendo el criterio anterior.

### Tipografía

- Usar una tipografía sans-serif moderna y legible, sin serifas, con buen contraste en tamaños grandes (los números de KPI van a ser el elemento tipográfico más grande de la interfaz).
- Definir una escala clara: título de página, subtítulo de página, número gigante de KPI, label de card, texto de apoyo/subtítulo de card. Cada nivel debe ser inconfundible del anterior en tamaño o peso, no solo en color.
- Los números de KPI deben tener peso bold/extra-bold y ser el elemento visualmente más pesado de cada card.

---

## 4. Estructura general de layout

Dos columnas fijas en desktop:

- **Columna izquierda (sidebar)**: ancho fijo, altura completa de la pantalla, no scrollea con el contenido.
- **Columna derecha (contenido principal)**: ocupa el resto del ancho, scrollea de forma independiente del sidebar.

En mobile/tablet, el sidebar debe colapsar a un menú desplegable u off-canvas (ver sección 13).

---

## 5. Especificación del Sidebar

**Header del sidebar (arriba de todo):**
- Nombre del proyecto: "Fenix", en el color de acento naranja, tipografía grande y bold.
- Debajo, un subtítulo chico y en gris: "Automatización de Stock".

**Navegación, agrupada en tres bloques con un label de categoría en mayúsculas, chico y gris, encima de cada grupo:**

1. **PANEL**
   - Resumen (ítem activo por defecto al cargar el dashboard)

2. **OPERACIÓN**
   - Volumen y Throughput

3. **EXPANSIÓN** (todos bloqueados)
   - Marketing / Ads
   - Leads
   - Ventas de productos
   - Rotación de productos
   - Logística

**Reglas de estado visual:**
- El ítem de navegación activo debe tener un fondo sólido con el color de acento (o una variante), diferenciándose claramente del resto.
- Cada ítem de navegación lleva un ícono a la izquierda del texto, consistente en tamaño entre todos los ítems.
- Los ítems del grupo "EXPANSIÓN" deben verse visualmente distintos desde el primer vistazo (opacidad reducida y/o ícono de candado a la derecha del texto), sin necesidad de hacer clic para darse cuenta de que están bloqueados.

**Footer del sidebar (abajo de todo, fijo):**
- Texto chico en gris indicando el origen de los datos, ej. "Datos generados por la automatización" (ajustar la copy real cuando haya datos productivos; por ahora puede decir "Datos ilustrativos de muestra" mientras se conecta la fuente real).

---

## 6. Header de página (contenido principal, sección Resumen)

- Título de página (H1): "Resumen general".
- Subtítulo debajo, en gris: una frase corta que explique el propósito del panel, ej. "Rendimiento de la automatización de stock de Fenix".

---

## 7. Selector de período

- Fila horizontal de botones tipo "pill" (bordes muy redondeados), alineados a la derecha o debajo del header según el ancho disponible.
- Opciones: **Hoy / Esta semana / Este mes / Todo**.
- El botón correspondiente al período activo debe tener fondo sólido en el color de acento y texto blanco; el resto, fondo transparente o blanco con borde sutil.
- Al cambiar de período, todos los números de la página (hero card + KPI cards + card de detalle) deben recalcularse para ese rango. No debe quedar ningún número "pegado" a un período distinto del seleccionado.
- El período seleccionado debe persistir mientras el usuario navega dentro de la sección Resumen (no resetear a "Hoy" en cada interacción menor).

---

## 8. Hero Card (tarjeta principal destacada)

Esta es la primera tarjeta debajo del selector de período, más grande que el resto, ocupando el ancho completo del contenido.

**Métrica a destacar: Productos procesados**, por ser la métrica más representativa del funcionamiento de la automatización.

**Contenido de la card, de arriba hacia abajo:**
1. Label chico: "Productos procesados · [período seleccionado]".
2. Badge pequeño opcional al lado del label, mostrando variación porcentual vs. el período anterior equivalente (solo si hay datos del período anterior para comparar; si no hay, ocultar el badge en vez de mostrar un valor inventado o en cero).
3. Número gigante: el total de productos procesados en el período.
4. Línea de texto de apoyo debajo del número, con contexto breve (ej. cantidad de facturas asociadas o cantidad de imágenes generadas en el mismo período, a modo de resumen narrativo).
5. Desglose inferior en forma de barras o bloques comparativos por sub-período (ej. si el período seleccionado es "Este mes", mostrar el desglose por semana; si es "Esta semana", desglose por día). Cada fila del desglose debe mostrar la etiqueta del sub-período y su valor absoluto alineado a la derecha.

**Importante:** no inventar una comparación "manual vs. automatizado" a menos que exista un dato base real de referencia (tiempo o volumen de procesamiento manual previo a la automatización). Si ese dato no existe todavía, la card debe apoyarse en la comparación contra el período anterior, no contra un proceso manual hipotético.

---

## 9. Grid de KPI Cards secundarias

Debajo de la hero card, una fila de **3 tarjetas** de igual tamaño (grid de 3 columnas en desktop):

1. **Productos procesados** — número total del período + subtítulo breve (ej. "productos ingresados a stock").
2. **Facturas procesadas** — número total del período + subtítulo con el promedio de ítems extraídos por factura (ej. "prom. X ítems por factura").
3. **Imágenes generadas** — número total del período + subtítulo de contexto (ej. "listas para marketplace").

**Estructura interna, igual para las tres:**
- Ícono representativo arriba, dentro de un contenedor circular o cuadrado con esquinas redondeadas, con un color de fondo suave relacionado a la paleta de marca.
- Label descriptivo.
- Número grande (más chico que el de la hero card, pero claramente el elemento dominante de la tarjeta).
- Subtítulo de una línea, en gris, chico.

Estas tres tarjetas son el componente que más se va a reutilizar cuando se agreguen las secciones de expansión, así que deben construirse como un componente genérico parametrizable (ícono, label, valor, subtítulo como datos de entrada), no como tres bloques distintos copiados y pegados.

---

## 10. Card de detalle — "Detalle de Volumen y Throughput"

Una tarjeta ancha debajo del grid de KPIs, con más profundidad de información que las cards de arriba. Debe incluir tres bloques internos (uno por métrica), separados visualmente entre sí (ya sea con columnas o con separadores horizontales):

**Bloque 1 — Productos procesados**
- Serie temporal simple (por día dentro de la semana, o por semana dentro del mes, según el período activo) mostrando la evolución del volumen.

**Bloque 2 — Facturas procesadas**
- Total de facturas del período.
- Ítems extraídos: promedio, mínimo y máximo por factura.

**Bloque 3 — Imágenes generadas**
- Total de imágenes del período.
- Relación imágenes/producto (para detectar si se están generando múltiples imágenes por producto o exactamente una).

Esta card debe funcionar bien aunque alguno de los tres bloques tenga datos en cero (por ejemplo, si en "Hoy" todavía no se procesó ninguna factura) — mostrar el cero de forma clara, nunca ocultar el bloque completo.

---

## 11. Secciones de expansión (bloqueadas)

Aplica a: Marketing/Ads, Leads, Ventas de productos, Rotación de productos, Logística.

**Comportamiento al hacer clic en cualquiera de estos ítems del sidebar:**
- Navegar a una vista de contenido bloqueado (no un modal/popup que tape la pantalla anterior — debe sentirse como una sección más del dashboard, consistente con el resto de la navegación).
- La vista debe mostrar:
  - Un ícono grande (candado o similar) centrado.
  - Un título con el nombre de la sección (ej. "Marketing / Ads").
  - Un mensaje corto y claro, ej. "Esta sección está planificada como una posible expansión futura del dashboard." (no usar un tono de error ni de "página no encontrada" — es una decisión de producto, no una falla).
- El ítem del sidebar correspondiente permanece marcado como activo mientras el usuario está en esa vista bloqueada, igual que cualquier otra sección.

No se debe construir ningún gráfico, KPI ni dato de ejemplo dentro de estas vistas. Son intencionalmente vacías de contenido funcional.

---

## 12. Estados de carga, vacío y error

- **Carga**: mientras se obtienen los datos de un período nuevo, cada card debe mostrar un estado de carga propio (no bloquear toda la pantalla con un spinner global), para que la interfaz se sienta rápida y viva.
- **Vacío real** (el período seleccionado no tiene datos, ej. "Hoy" antes de que haya actividad): mostrar el número en cero de forma explícita, nunca dejar el espacio en blanco ni ocultar la card.
- **Error de datos** (falla la obtención de métricas): mostrar un mensaje breve dentro de la card afectada, con opción de reintentar, sin tumbar el resto del dashboard.

---

## 13. Comportamiento responsive

- **Desktop (ancho amplio)**: sidebar fijo visible + grid de 3 columnas para las KPI cards.
- **Tablet**: sidebar puede colapsar a un ícono de menú en la esquina superior, desplegable; grid de KPIs pasa a 2 columnas.
- **Mobile**: sidebar totalmente oculto por defecto, accesible por un botón de menú; todas las cards (hero, KPIs, detalle) se apilan en una sola columna; el selector de período debe permitir scroll horizontal si no entran todos los botones en el ancho de pantalla.

En todos los tamaños, el número de KPI debe seguir siendo el elemento más grande y legible de su card — no reducirlo de más al achicar la pantalla.

---

## 14. Modelo de datos esperado (descriptivo, sin implementación)

Para que el equipo de datos/n8n sepa qué debe entregarle al dashboard, cada card necesita recibir esta información, ya calculada (el dashboard no debe hacer cálculos de negocio, solo formatear y mostrar):

**Para la Hero Card y las KPI Cards, por cada métrica:**
- Valor total del período seleccionado.
- Valor total del período anterior equivalente (para calcular variación porcentual) — puede venir vacío/nulo si no hay dato histórico todavía.
- Fecha/hora de corte de los datos (para mostrar "actualizado hace X" si se decide agregar más adelante).

**Para el desglose de la Hero Card:**
- Lista de sub-períodos con su etiqueta y su valor (ej. lista de semanas del mes con su total cada una).

**Para la card de detalle:**
- Serie temporal de productos procesados (lista de puntos fecha + valor).
- Total de facturas, y lista de "ítems por factura" para poder calcular promedio/mínimo/máximo en el frontend o recibirlos ya calculados desde el origen (a definir con el equipo de datos).
- Total de imágenes generadas y total de productos del mismo período (para calcular la relación imágenes/producto).

---

## 15. Organización y nombres de componentes

Nombrar los componentes de forma descriptiva y consistente, para que sea fácil reutilizarlos cuando se activen las secciones de expansión:

- `Sidebar`
- `SidebarNavGroup` (agrupador con label de categoría)
- `SidebarNavItem` (ítem individual, con variante "bloqueado")
- `PageHeader`
- `PeriodSelector`
- `HeroMetricCard`
- `KpiCard` (genérica, reutilizable)
- `KpiGrid` (contenedor de 3 `KpiCard`)
- `DetailCard` (contenedor de la card de detalle con sus 3 bloques internos)
- `LockedSectionView` (vista de las secciones de expansión)

Cada componente debe recibir sus datos por props/parámetros de entrada, sin conocer de dónde viene la información ni cómo se calculó.

---

## 16. Accesibilidad mínima

- Todo ítem de navegación y botón de período debe ser accesible por teclado (tab + enter), no solo por clic de mouse.
- Los íconos deben ir acompañados de texto o de una etiqueta accesible; no deben ser el único indicador de significado.
- El contraste de texto sobre el fondo crema (`#FDF9F3`) y sobre las cards blancas debe validarse, especialmente para los textos secundarios en gris.

---

## 17. Checklist de entrega — Fase 1

- [ ] Sidebar con los tres grupos de navegación y estados activo/bloqueado correctamente diferenciados
- [ ] Selector de período funcional, afectando todos los números de la página
- [ ] Hero Card con número principal, comparación vs período anterior (cuando exista dato) y desglose por sub-período
- [ ] Grid de 3 KPI Cards (Productos procesados, Facturas procesadas, Imágenes generadas) como componente reutilizable
- [ ] Card de detalle con los tres bloques (productos, facturas, imágenes)
- [ ] Las 5 secciones de expansión navegables y mostrando el mensaje de "posible expansión futura"
- [ ] Estados de carga, vacío y error cubiertos en todas las cards con datos
- [ ] Responsive validado en desktop, tablet y mobile
- [ ] Paleta de colores de Fenix aplicada consistentemente, incluyendo los complementarios definidos en la sección 3
