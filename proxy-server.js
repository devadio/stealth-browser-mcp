const express = require('express');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const app = express();
app.use(express.json());

const STEALTH_URL = process.env.STEALTH_URL || 'http://stealth-mcp:8000/mcp/tools/call';

app.post('/proxy', async (req, res) => {
    const postData = JSON.stringify(req.body);
    const url = new URL(STEALTH_URL);

    const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/event-stream',
            'Content-Length': Buffer.byteLength(postData)
        },
        rejectUnauthorized: false
    };

    // Use http or https based on protocol
    const protocol = url.protocol === 'https:' ? https : http;

    const proxyReq = protocol.request(options, (proxyRes) => {
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
