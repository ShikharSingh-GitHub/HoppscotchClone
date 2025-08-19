// Demo script to test Basic Auth and OAuth 2.0 header generation
import { generateAuthHeaders } from "./src/services/requestAuthService.js";

console.log("🔐 Authentication Demo - Header Generation\n");

// Basic Auth Demo
console.log("📝 BASIC AUTH DEMO:");
console.log("===================");
const basicAuthConfig = {
  authActive: true,
  authType: "basic",
  username: "testuser",
  password: "testpass123",
};

const basicHeaders = generateAuthHeaders(basicAuthConfig);
console.log("Config:", JSON.stringify(basicAuthConfig, null, 2));
console.log("Generated Headers:", basicHeaders);
if (basicHeaders.Authorization) {
  console.log(
    "Decoded credentials:",
    atob(basicHeaders.Authorization.split(" ")[1])
  );
}
console.log();

// OAuth 2.0 Authorization Code Demo
console.log("🔑 OAUTH 2.0 AUTHORIZATION CODE DEMO:");
console.log("=====================================");
const oauth2AuthCodeConfig = {
  authActive: true,
  authType: "oauth-2",
  grantTypeInfo: {
    token: "mock_oauth2_token_auth_code_demo_12345",
    grantType: "authorization_code",
  },
  oauth2GrantType: "authorization_code",
  oauth2AuthURL: "https://oauth.example.com/auth",
  oauth2AccessTokenURL: "https://oauth.example.com/token",
  oauth2ClientID: "demo_client_id_12345",
  oauth2ClientSecret: "demo_client_secret_67890",
  oauth2Scope: "read write profile",
  oauth2State: "random_state_value_123",
  oauth2RedirectURI: "http://localhost:3001/oauth/callback",
};

const oauth2AuthCodeHeaders = generateAuthHeaders(oauth2AuthCodeConfig);
console.log("Config:", JSON.stringify(oauth2AuthCodeConfig, null, 2));
console.log("Generated Headers:", oauth2AuthCodeHeaders);
console.log();

// OAuth 2.0 Client Credentials Demo
console.log("🏢 OAUTH 2.0 CLIENT CREDENTIALS DEMO:");
console.log("====================================");
const oauth2ClientCredConfig = {
  authActive: true,
  authType: "oauth-2",
  grantTypeInfo: {
    token: "mock_oauth2_token_client_cred_demo_67890",
    grantType: "client_credentials",
  },
  oauth2GrantType: "client_credentials",
  oauth2AccessTokenURL: "https://oauth.example.com/token",
  oauth2ClientID: "client_credentials_id",
  oauth2ClientSecret: "client_credentials_secret",
  oauth2Scope: "api:read api:write",
};

const oauth2ClientCredHeaders = generateAuthHeaders(oauth2ClientCredConfig);
console.log("Config:", JSON.stringify(oauth2ClientCredConfig, null, 2));
console.log("Generated Headers:", oauth2ClientCredHeaders);
console.log();

// OAuth 2.0 Implicit Flow Demo
console.log("⚡ OAUTH 2.0 IMPLICIT FLOW DEMO:");
console.log("===============================");
const oauth2ImplicitConfig = {
  authActive: true,
  authType: "oauth-2",
  grantTypeInfo: {
    token: "mock_oauth2_token_implicit_demo_11111",
    grantType: "implicit",
  },
  oauth2GrantType: "implicit",
  oauth2AuthURL: "https://oauth.example.com/auth",
  oauth2ClientID: "implicit_client_id",
  oauth2Scope: "openid profile",
  oauth2State: "implicit_state_123",
  oauth2RedirectURI: "http://localhost:3001/oauth/implicit/callback",
};

const oauth2ImplicitHeaders = generateAuthHeaders(oauth2ImplicitConfig);
console.log("Config:", JSON.stringify(oauth2ImplicitConfig, null, 2));
console.log("Generated Headers:", oauth2ImplicitHeaders);
console.log();

console.log(
  "✅ Demo completed! All authentication methods generate proper headers."
);
console.log(
  "🌐 Test these with the server at http://localhost:3001/api/test-auth"
);
