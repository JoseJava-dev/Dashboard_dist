import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export const handler = async (event, context) => {
  try {
    const token = process.env.BASEROW_TOKEN;
    if (!token) throw new Error("Missing BASEROW_TOKEN environment variable");
    const headers = { 'Authorization': `Token ${token}` };
    
    // As Netlify functions (Node 18+) have native fetch, we use it directly
    const [prodRes, provRes] = await Promise.all([
      fetch('https://dfbaserow.sistemadistribuidorafenix.com/api/database/rows/table/902/?size=1', { headers }),
      fetch('https://dfbaserow.sistemadistribuidorafenix.com/api/database/rows/table/899/?size=1', { headers })
    ]);
    
    const productosData = await prodRes.json();
    const proveedoresData = await provRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        productos_dux: productosData.count || 0,
        proveedores_dux: proveedoresData.count || 0
      })
    };
  } catch (error) {
    console.error("Baserow API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
