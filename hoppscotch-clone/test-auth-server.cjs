const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Test endpoint that accepts different authentication methods
app.all('/api/test-auth', (req, res) => {
  const authHeader = req.headers.authorization;
  const apiKey = req.headers['x-api-key'] || req.query['x-api-key'];
  const accessToken = req.query.access_token;
  
  let authType = 'none';
  let authInfo = {};
  
  // Detect auth type
  if (authHeader) {
    if (authHeader.startsWith('Basic ')) {
      authType = 'basic';
      try {
        const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
        const [username, password] = credentials.split(':');
        authInfo = { username, password: password ? '***' : '' };
      } catch (e) {
        authInfo = { error: 'Invalid Basic auth format' };
      }
    } else if (authHeader.startsWith('Bearer ')) {
      authType = 'bearer';
      authInfo = { token: authHeader.slice(7).substring(0, 10) + '...' };
    } else if (authHeader.startsWith('Digest ')) {
      authType = 'digest';
      authInfo = { digest: 'Digest auth detected' };
    } else if (authHeader.startsWith('Hawk ')) {
      authType = 'hawk';
      authInfo = { hawk: 'HAWK auth detected' };
    } else if (authHeader.startsWith('AWS4-HMAC-SHA256')) {
      authType = 'aws-signature';
      authInfo = { aws: 'AWS Signature detected' };
    }
  } else if (apiKey) {
    authType = 'api-key';
    authInfo = { apiKey: apiKey.substring(0, 10) + '...' };
  } else if (accessToken) {
    authType = 'oauth2-query';
    authInfo = { accessToken: accessToken.substring(0, 10) + '...' };
  }
  
  // Response with authentication details
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    authType,
    authInfo,
    headers: {
      authorization: authHeader ? 'Present' : 'Not present',
      'x-api-key': apiKey ? 'Present' : 'Not present',
      'user-agent': req.headers['user-agent'] || 'Unknown'
    },
    query: req.query,
    message: `Request received with ${authType} authentication`
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Auth test server is running' 
  });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🔐 Auth Test Server running on http://localhost:${PORT}`);
  console.log(`📋 Test endpoint: http://localhost:${PORT}/api/test-auth`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
});
