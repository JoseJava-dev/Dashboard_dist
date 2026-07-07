import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      {
        name: 'mcp-proxy-plugin',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/baserow') {
              try {
                const token = process.env.BASEROW_TOKEN;
                if (!token) throw new Error("Missing BASEROW_TOKEN environment variable");
                const headers = { 'Authorization': `Token ${token}` };
                
                const [prodRes, provRes] = await Promise.all([
                  fetch('https://dfbaserow.sistemadistribuidorafenix.com/api/database/rows/table/902/?size=1', { headers }),
                  fetch('https://dfbaserow.sistemadistribuidorafenix.com/api/database/rows/table/899/?size=1', { headers })
                ]);
                
                const productosData = await prodRes.json();
                const proveedoresData = await provRes.json();
                
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  productos_dux: productosData.count || 0,
                  proveedores_dux: proveedoresData.count || 0
                }));
              } catch (e) {
                console.error("Vite Baserow API Error:", e);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: e.message }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
    server: {
      proxy: {
        '/api/chatwoot': {
          target: env.VITE_CHATWOOT_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/chatwoot/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              if (env.CHATWOOT_API_KEY) {
                proxyReq.setHeader('api_access_token', env.CHATWOOT_API_KEY);
              }
            });
          }
        }
      }
    }
  }
})
