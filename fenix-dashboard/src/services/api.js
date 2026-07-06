import { createClient } from '@supabase/supabase-js';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getDashboardData = async (period) => {
  try {
    const now = new Date();
    let startDate = null;
    let endDate = now;

    if (period === 'hoy') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'esta_semana') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now);
      startDate.setDate(diff);
      startDate.setHours(0,0,0,0);
      
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      if (startDate < firstDayOfMonth) {
        startDate = firstDayOfMonth;
      }
    } else if (period === 'este_mes') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period.startsWith('mes_')) {
      const targetMonth = parseInt(period.split('_')[1], 10);
      startDate = new Date(now.getFullYear(), targetMonth, 1);
      endDate = new Date(now.getFullYear(), targetMonth + 1, 0, 23, 59, 59, 999);
    } else if (period === 'todo') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    let prodQuery = supabase.from('vw_productos_procesados').select('*', { count: 'exact' });
    let factQuery = supabase.from('vw_facturas_procesadas').select('*', { count: 'exact' });
    let imgQuery = supabase.from('vw_imagenes_generadas').select('*', { count: 'exact' });

    if (startDate) {
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();
      prodQuery = prodQuery.gte('creado_en', startISO).lte('creado_en', endISO);
      factQuery = factQuery.gte('creado_en', startISO).lte('creado_en', endISO);
      imgQuery = imgQuery.gte('creado_en', startISO).lte('creado_en', endISO);
    }

    // Limit for detail list (50) or charts historical (1000)
    const limitRows = period === 'todo' ? 1000 : 50;
    prodQuery = prodQuery.order('creado_en', { ascending: false }).limit(limitRows);
    factQuery = factQuery.order('creado_en', { ascending: false }).limit(limitRows);
    imgQuery = imgQuery.order('creado_en', { ascending: false }).limit(limitRows);

    const [prodRes, factRes, imgRes] = await Promise.all([prodQuery, factQuery, imgQuery]);

    if (prodRes.error) console.error("Error productos:", prodRes.error);
    if (factRes.error) console.error("Error facturas:", factRes.error);
    if (imgRes.error) console.error("Error imagenes:", imgRes.error);

    return {
      productosProcesados: {
        total: prodRes.count || 0,
        previo: null,
        desglose: [],
        tendencia_diaria: [],
        items: prodRes.data || []
      },
      facturasProcesadas: {
        total: factRes.count || 0,
        previo: null,
        promedioItems: 0, 
        maxItems: 0,
        minItems: 0,
        items: factRes.data || []
      },
      imagenesGeneradas: {
        total: imgRes.count || 0,
        previo: null,
        relacionProducto: (imgRes.count && prodRes.count) ? (imgRes.count / prodRes.count).toFixed(2) : 0,
        items: imgRes.data || []
      }
    };
  } catch (err) {
    console.error("Error obteniendo datos de Supabase:", err);
    throw err;
  }
};

export const getLeadsData = async (period) => {
  try {
    const now = new Date();
    let startDate = null;
    let endDate = now;

    if (period === 'hoy') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'esta_semana') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now);
      startDate.setDate(diff);
      startDate.setHours(0,0,0,0);
      
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      if (startDate < firstDayOfMonth) {
        startDate = firstDayOfMonth;
      }
    } else if (period === 'este_mes') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period.startsWith('mes_')) {
      const targetMonth = parseInt(period.split('_')[1], 10);
      startDate = new Date(now.getFullYear(), targetMonth, 1);
      endDate = new Date(now.getFullYear(), targetMonth + 1, 0, 23, 59, 59, 999);
    } else if (period === 'todo') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    let query = supabase.from('leads_crm').select('creado_en', { count: 'exact' });

    if (startDate) {
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();
      query = query.gte('creado_en', startISO).lte('creado_en', endISO);
    }

    const { data, count, error } = await query;
    if (error) {
      console.error("Error obteniendo leads de Supabase:", error);
      return { total: 0, items: [] };
    }

    // Retornamos el total y los items para poder graficar
    return {
      total: count || 0,
      items: data || []
    };
  } catch (err) {
    console.error("Error en getLeadsData:", err);
    return { total: 0, items: [] }; 
  }
};

export const getBaserowData = async () => {
  try {
    const isDev = import.meta.env.DEV;
    const url = isDev ? '/api/baserow' : '/.netlify/functions/baserow';
    
    const res = await fetch(url);
    const data = await res.json();
    
    return {
      productosTotal: data.productos_dux || 0,
      proveedoresTotal: data.proveedores_dux || 0
    };
  } catch (err) {
    console.error("Error obteniendo datos de Baserow:", err);
    return { productosTotal: 0, proveedoresTotal: 0 };
  }
};

export const getChatwootLabelMetrics = async (period) => {
  try {
    const url = import.meta.env.VITE_CHATWOOT_URL;
    const apiKey = import.meta.env.VITE_CHATWOOT_API_KEY;
    const accountId = import.meta.env.VITE_CHATWOOT_ACCOUNT_ID;

    if (!url || !apiKey || !accountId || url.includes('YOUR_') || accountId.includes('YOUR_')) {
      console.warn("Chatwoot credentials not fully configured.");
      return [];
    }

    const now = new Date();
    let startDate = null;
    let endDate = now;

    if (period === 'hoy') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'esta_semana') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now);
      startDate.setDate(diff);
      startDate.setHours(0,0,0,0);
      
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      if (startDate < firstDayOfMonth) {
        startDate = firstDayOfMonth;
      }
    } else if (period === 'este_mes') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period.startsWith('mes_')) {
      const targetMonth = parseInt(period.split('_')[1], 10);
      startDate = new Date(now.getFullYear(), targetMonth, 1);
      endDate = new Date(now.getFullYear(), targetMonth + 1, 0, 23, 59, 59, 999);
    } else if (period === 'todo') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    if (!startDate) return [];

    const since = Math.floor(startDate.getTime() / 1000);
    const until = Math.floor(endDate.getTime() / 1000);

    const isDev = import.meta.env.DEV;
    let endpointUrl = '';
    let fetchOptions = {};

    if (isDev) {
      // In dev, use the vite proxy and pass the api key if it's available or let proxy use env
      endpointUrl = `/api/chatwoot/api/v2/accounts/${accountId}/reports/inbox_label_matrix?since=${since}&until=${until}`;
      fetchOptions = {
        headers: {
          'api_access_token': apiKey,
          'Content-Type': 'application/json'
        }
      };
    } else {
      // In prod, use Netlify function to bypass CORS
      endpointUrl = `/.netlify/functions/chatwoot?path=labels&since=${since}&until=${until}`;
    }

    const res = await fetch(endpointUrl, fetchOptions);

    if (!res.ok) {
      console.error("Chatwoot API error:", res.statusText);
      return [];
    }

    const data = await res.json();
    
    // Process the matrix to get flat totals per label
    if (!data.labels || !data.matrix || !data.inboxes) return [];

    const labelCounts = data.labels.map((label, labelIndex) => {
      let count = 0;
      // matrix is a 2D array: matrix[inboxIndex][labelIndex]
      data.inboxes.forEach((inbox, inboxIndex) => {
        if (data.matrix[inboxIndex] && data.matrix[inboxIndex][labelIndex] !== undefined) {
          count += data.matrix[inboxIndex][labelIndex];
        }
      });
      return {
        id: label.id,
        title: label.title,
        color: label.color,
        count: count
      };
    });

    // filter out zero counts and sort descending
    return labelCounts.filter(l => l.count > 0).sort((a, b) => b.count - a.count);

  } catch (err) {
    console.error("Error fetching Chatwoot label metrics:", err);
    return [];
  }
};

export const getChatwootAgentMetrics = async (period, agentId = 1) => {
  try {
    const url = import.meta.env.VITE_CHATWOOT_URL;
    const apiKey = import.meta.env.VITE_CHATWOOT_API_KEY;
    const accountId = import.meta.env.VITE_CHATWOOT_ACCOUNT_ID;

    if (!url || !apiKey || !accountId || url.includes('YOUR_') || accountId.includes('YOUR_')) {
      return null;
    }

    const now = new Date();
    let startDate = null;
    let endDate = now;

    if (period === 'hoy') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'esta_semana') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now);
      startDate.setDate(diff);
      startDate.setHours(0,0,0,0);
      
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      if (startDate < firstDayOfMonth) {
        startDate = firstDayOfMonth;
      }
    } else if (period === 'este_mes') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period.startsWith('mes_')) {
      const targetMonth = parseInt(period.split('_')[1], 10);
      startDate = new Date(now.getFullYear(), targetMonth, 1);
      endDate = new Date(now.getFullYear(), targetMonth + 1, 0, 23, 59, 59, 999);
    } else if (period === 'todo') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    if (!startDate) return null;

    const since = Math.floor(startDate.getTime() / 1000);
    const until = Math.floor(endDate.getTime() / 1000);

    const isDev = import.meta.env.DEV;
    let endpointUrl = '';
    let fetchOptions = {};

    if (isDev) {
      endpointUrl = `/api/chatwoot/api/v2/accounts/${accountId}/reports/summary?type=agent&id=${agentId}&since=${since}&until=${until}`;
      fetchOptions = {
        headers: {
          'api_access_token': apiKey,
          'Content-Type': 'application/json'
        }
      };
    } else {
      endpointUrl = `/.netlify/functions/chatwoot?path=agent_metrics&id=${agentId}&since=${since}&until=${until}`;
    }

    const res = await fetch(endpointUrl, fetchOptions);

    if (!res.ok) {
      console.error("Chatwoot Agent Metrics API error:", res.statusText);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error fetching Chatwoot agent metrics:", err);
    return null;
  }
};

