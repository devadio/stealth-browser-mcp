const express = require('express');
const EventSource = require('eventsource');

const app = express();
app.use(express.json());

const MCP_SSE_URL = process.env.MCP_SSE_URL || 'http://stealth-mcp:8000/mcp/sse';
let mcpSession = null;
let sessionId = null;

// Initialize MCP SSE connection
function initializeMCP() {
    console.log('Connecting to MCP server...');

    const eventSource = new EventSource(MCP_SSE_URL);

    eventSource.onopen = () => {
        console.log('✅ Connected to MCP server');
    };

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log('MCP Message:', data);

            // Extract session ID from initialization
            if (data.method === 'initialize' || data.result) {
                sessionId = data.id || sessionId;
                console.log('Session ID:', sessionId);
            }
        } catch (e) {
            console.error('Parse error:', e);
        }
    };

    eventSource.onerror = (error) => {
        console.error('❌ MCP connection error:', error);
        setTimeout(initializeMCP, 5000); // Reconnect after 5s
    };

    mcpSession = eventSource;
}

// Initialize on startup
initializeMCP();

// Simple scraping endpoint
app.post('/api/scrape', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // For now, return a placeholder response
        // TODO: Implement actual MCP tool calling
        res.json({
            success: true,
            message: 'MCP session established, tool calling not yet implemented',
            sessionId: sessionId,
            url: url
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mcpConnected: mcpSession !== null,
        sessionId: sessionId
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`REST API running on port ${PORT}`);
});
