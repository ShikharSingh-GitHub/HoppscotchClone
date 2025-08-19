// Live demonstration of Basic Auth and OAuth 2.0 with actual HTTP requests
import { generateAuthHeaders } from "./src/services/requestAuthService.js";

const SERVER_URL = "http://localhost:3001/api/test-auth";

// Function to make HTTP request with auth headers
async function testAuthRequest(authConfig, testName) {
  console.log(`\n🧪 ${testName}`);
  console.log("=".repeat(50));

  const headers = generateAuthHeaders(authConfig);
  console.log("📝 Auth Config:", JSON.stringify(authConfig, null, 2));
  console.log("🔐 Generated Headers:", headers);

  try {
    const response = await fetch(SERVER_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    const result = await response.json();
    console.log("🌐 Server Response:", JSON.stringify(result, null, 2));

    if (result.success) {
      console.log("✅ Authentication successful!");
    } else {
      console.log("❌ Authentication failed");
    }
  } catch (error) {
    console.log("💥 Request failed:", error.message);
  }
}

// Demo function
async function runAuthDemo() {
  console.log("🔐 LIVE AUTHENTICATION DEMONSTRATION");
  console.log("====================================");
  console.log("Testing against server: " + SERVER_URL);

  // Test 1: Basic Authentication
  const basicAuthConfig = {
    authActive: true,
    authType: "basic",
    username: "demouser",
    password: "demopass123",
  };

  await testAuthRequest(basicAuthConfig, "BASIC AUTHENTICATION TEST");

  // Test 2: OAuth 2.0 Authorization Code
  const oauth2AuthCodeConfig = {
    authActive: true,
    authType: "oauth-2",
    grantTypeInfo: {
      token: "oauth2_auth_code_token_demo_abc123",
      grantType: "authorization_code",
    },
  };

  await testAuthRequest(
    oauth2AuthCodeConfig,
    "OAUTH 2.0 AUTHORIZATION CODE TEST"
  );

  // Test 3: OAuth 2.0 Client Credentials
  const oauth2ClientCredConfig = {
    authActive: true,
    authType: "oauth-2",
    grantTypeInfo: {
      token: "oauth2_client_cred_token_demo_xyz789",
      grantType: "client_credentials",
    },
  };

  await testAuthRequest(
    oauth2ClientCredConfig,
    "OAUTH 2.0 CLIENT CREDENTIALS TEST"
  );

  // Test 4: OAuth 2.0 Implicit Flow
  const oauth2ImplicitConfig = {
    authActive: true,
    authType: "oauth-2",
    grantTypeInfo: {
      token: "oauth2_implicit_token_demo_qwe456",
      grantType: "implicit",
    },
  };

  await testAuthRequest(oauth2ImplicitConfig, "OAUTH 2.0 IMPLICIT FLOW TEST");

  // Test 5: No Authentication
  console.log("\n🚫 NO AUTHENTICATION TEST");
  console.log("=".repeat(50));

  try {
    const response = await fetch(SERVER_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    console.log(
      "🌐 Server Response (No Auth):",
      JSON.stringify(result, null, 2)
    );
  } catch (error) {
    console.log("💥 Request failed:", error.message);
  }

  console.log("\n🎉 Live demonstration completed!");
  console.log(
    "🔍 Check the browser at http://localhost:5175 to test in the UI"
  );
}

// Run the demo
runAuthDemo().catch(console.error);
