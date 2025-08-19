// Quick test of our auth service
import {
  applyAuthToRequest,
  generateAuthHeaders,
} from "./src/services/requestAuth.js";

// Test Basic Auth
const basicAuth = {
  authType: "basic",
  authActive: true,
  username: "testuser",
  password: "testpass123",
};

console.log("Basic Auth Headers:", generateAuthHeaders(basicAuth));

// Test Bearer Token
const bearerAuth = {
  authType: "bearer",
  authActive: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample-token",
};

console.log("Bearer Auth Headers:", generateAuthHeaders(bearerAuth));

// Test API Key
const apiKeyAuth = {
  authType: "api-key",
  authActive: true,
  addTo: "HEADERS",
  key: "X-API-Key",
  value: "sk_test_1234567890abcdef",
};

console.log("API Key Headers:", generateAuthHeaders(apiKeyAuth));

// Test full request application
const testRequest = {
  method: "GET",
  url: "http://localhost:3001/api/test-auth",
  headers: {
    "Content-Type": "application/json",
  },
};

const requestWithAuth = applyAuthToRequest(testRequest, basicAuth);
console.log("Request with Basic Auth:", requestWithAuth);
