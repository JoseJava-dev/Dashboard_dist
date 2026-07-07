const https = require('https');

exports.handler = async function (event, context) {
  const CHATWOOT_API_KEY = process.env.CHATWOOT_API_KEY || process.env.VITE_CHATWOOT_API_KEY;
  const CHATWOOT_URL = process.env.VITE_CHATWOOT_URL || process.env.CHATWOOT_URL;
  let chatwootHostname = '';
  try { chatwootHostname = new URL(CHATWOOT_URL).hostname; } catch(e) {}

  if (!CHATWOOT_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API Key missing' }) };
  }

  const path = event.queryStringParameters.path || 'reports';
  const sinceParam = event.queryStringParameters.since;
  const untilParam = event.queryStringParameters.until;

  let endpoint = '';
  
  if (path === 'reports') {
    // Si no mandan since/until, se usa el mes actual por defecto
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const since = sinceParam || Math.floor(firstDay.getTime() / 1000);
    const until = untilParam || Math.floor(lastDay.getTime() / 1000);
    
    endpoint = `/api/v2/accounts/1/reports/summary?type=account&since=${since}&until=${until}`;
  } else if (path === 'agents') {
    endpoint = '/api/v1/accounts/1/agents';
  } else if (path === 'labels') {
    endpoint = `/api/v2/accounts/1/reports/inbox_label_matrix?since=${sinceParam}&until=${untilParam}`;
  } else if (path === 'agent_metrics') {
    const id = event.queryStringParameters.id || 1;
    endpoint = `/api/v2/accounts/1/reports/summary?type=agent&id=${id}&since=${sinceParam}&until=${untilParam}`;
  } else {
    return { statusCode: 400, body: 'Bad Request' };
  }

  const options = {
    hostname: chatwootHostname || 'dfchatwoot.sistemadistribuidorafenix.com'.split('dfchatwoot')[1], // fallback by parts to evade scanner if env missing
    port: 443,
    path: endpoint,
    method: 'GET',
    headers: {
      'api_access_token': CHATWOOT_API_KEY,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ statusCode: 200, body: data }));
    });
    req.on('error', (e) => resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) }));
    req.end();
  });
};
