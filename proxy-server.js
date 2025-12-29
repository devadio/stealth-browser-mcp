const express = require('express');
const https = require('https');

const app = express();
app.use(express.json());

const STEALTH_URL = process.env.STEALTH_URL || 'https://abdullah-test-apps-stealth-yqj4bt-2ef3f5-85-208-48-61.traefik.me/mcp/tools/call';

app.post('/proxy', async (req, res) => {
  const postData = JSON.stringify(req.body);
  
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Content-Length': Buffer.byteLength(postData)
    },
    rejectUnauthorized: false
  };

  const proxyReq = https.request(STEALTH_URL, options, (proxyRes) => {
    let body = '';
    proxyRes.on('data', chunk => body += chunk);
    proxyRes.on('end', () => {
      res.status(proxyRes.statusCode).send(body);
    });
  });

  proxyReq.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });

  proxyReq.write(postData);
  proxyReq.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
