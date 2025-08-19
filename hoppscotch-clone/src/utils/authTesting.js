/**
 * Auth Testing Utilities
 * Helper functions to test and demonstrate Basic Auth and OAuth 2.0 implementations
 */

/**
 * Test Basic Auth implementation
 * @param {string} username - Username for Basic Auth
 * @param {string} password - Password for Basic Auth
 * @returns {Object} Test result
 */
export const testBasicAuth = (username, password) => {
  try {
    // Create the authorization header as would be done in the app
    const credentialsString = `${username}:${password}`;
    const encodedCredentials = btoa(credentialsString);
    const authHeader = `Basic ${encodedCredentials}`;

    console.log("🔐 Basic Auth Test:");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`Credentials String: ${credentialsString}`);
    console.log(`Base64 Encoded: ${encodedCredentials}`);
    console.log(`Authorization Header: ${authHeader}`);

    // Verify by decoding
    const decoded = atob(encodedCredentials);
    const isValid = decoded === credentialsString;

    return {
      success: true,
      authHeader,
      decoded,
      isValid,
      message: isValid
        ? "Basic Auth header generated successfully"
        : "Validation failed",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "Basic Auth generation failed",
    };
  }
};

/**
 * Test OAuth 2.0 Client Credentials Flow
 * @param {Object} config - OAuth2 configuration
 * @returns {Object} Test configuration
 */
export const testOAuth2ClientCredentials = (config) => {
  const {
    tokenEndpoint,
    clientID,
    clientSecret,
    scopes,
    clientAuthentication = "AS_BASIC_AUTH_HEADERS",
  } = config;

  console.log("🚀 OAuth 2.0 Client Credentials Test:");
  console.log("Configuration:", config);

  // Simulate what would be sent in the request
  let headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  let body = {
    grant_type: "client_credentials",
  };

  if (clientAuthentication === "AS_BASIC_AUTH_HEADERS") {
    // Encode client credentials for Basic Auth
    const credentialsString = `${encodeURIComponent(
      clientID
    )}:${encodeURIComponent(clientSecret || "")}`;
    const encodedCredentials = btoa(credentialsString);
    headers.Authorization = `Basic ${encodedCredentials}`;

    if (scopes) {
      body.scope = scopes;
    }
  } else {
    // Send in body
    body.client_id = clientID;
    if (clientSecret) {
      body.client_secret = clientSecret;
    }
    if (scopes) {
      body.scope = scopes;
    }
  }

  const requestConfig = {
    url: tokenEndpoint,
    method: "POST",
    headers,
    body: new URLSearchParams(body).toString(),
  };

  console.log("Request Configuration:", requestConfig);

  return {
    success: true,
    requestConfig,
    message: "OAuth 2.0 Client Credentials request configuration generated",
  };
};

/**
 * Test OAuth 2.0 Authorization Code Flow URL generation
 * @param {Object} config - OAuth2 configuration
 * @returns {Object} Test result with authorization URL
 */
export const testOAuth2AuthorizationCode = async (config) => {
  const {
    authEndpoint,
    clientID,
    redirectURI,
    scopes,
    state,
    isPKCE,
    codeChallengeMethod = "S256",
  } = config;

  console.log("🔑 OAuth 2.0 Authorization Code Test:");
  console.log("Configuration:", config);

  try {
    // Generate code verifier if PKCE is enabled
    let codeVerifier, codeChallenge;

    if (isPKCE) {
      // Generate code verifier
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
      const length = Math.floor(Math.random() * (128 - 43 + 1)) + 43;
      codeVerifier = "";

      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        codeVerifier += characters[randomIndex];
      }

      // Generate code challenge
      if (codeChallengeMethod === "S256") {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const buffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(buffer));
        codeChallenge = btoa(String.fromCharCode(...hashArray))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=/g, "");
      } else {
        codeChallenge = codeVerifier;
      }
    }

    // Build authorization URL
    const url = new URL(authEndpoint);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", clientID);

    if (redirectURI) {
      url.searchParams.set("redirect_uri", redirectURI);
    }

    if (scopes) {
      url.searchParams.set("scope", scopes);
    }

    if (state) {
      url.searchParams.set("state", state);
    }

    if (isPKCE && codeChallenge) {
      url.searchParams.set("code_challenge", codeChallenge);
      url.searchParams.set("code_challenge_method", codeChallengeMethod);
    }

    const authUrl = url.toString();

    console.log("Generated Authorization URL:", authUrl);
    if (isPKCE) {
      console.log("Code Verifier (store this):", codeVerifier);
      console.log("Code Challenge:", codeChallenge);
    }

    return {
      success: true,
      authUrl,
      codeVerifier,
      codeChallenge,
      message: "Authorization URL generated successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "Authorization URL generation failed",
    };
  }
};

/**
 * Test OAuth 2.0 Password Flow
 * @param {Object} config - OAuth2 configuration
 * @returns {Object} Test configuration
 */
export const testOAuth2PasswordFlow = (config) => {
  const { tokenEndpoint, clientID, clientSecret, username, password, scopes } =
    config;

  console.log("🔒 OAuth 2.0 Password Flow Test:");
  console.log("Configuration:", config);

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  const body = {
    grant_type: "password",
    client_id: clientID,
    username,
    password,
  };

  if (clientSecret) {
    body.client_secret = clientSecret;
  }

  if (scopes) {
    body.scope = scopes;
  }

  const requestConfig = {
    url: tokenEndpoint,
    method: "POST",
    headers,
    body: new URLSearchParams(body).toString(),
  };

  console.log("Request Configuration:", requestConfig);

  return {
    success: true,
    requestConfig,
    message: "OAuth 2.0 Password Flow request configuration generated",
  };
};

/**
 * Demonstrate all auth methods with sample data
 */
export const demonstrateAuthMethods = async () => {
  console.log("🎯 Authentication Methods Demonstration");
  console.log("=====================================");

  // Test Basic Auth
  const basicAuthResult = testBasicAuth("testuser", "testpassword");
  console.log("\n1. Basic Auth Result:", basicAuthResult);

  // Test OAuth 2.0 Client Credentials
  const clientCredsResult = testOAuth2ClientCredentials({
    tokenEndpoint: "https://api.example.com/oauth2/token",
    clientID: "test_client_id",
    clientSecret: "test_client_secret",
    scopes: "read write",
    clientAuthentication: "AS_BASIC_AUTH_HEADERS",
  });
  console.log("\n2. OAuth 2.0 Client Credentials Result:", clientCredsResult);

  // Test OAuth 2.0 Authorization Code
  const authCodeResult = await testOAuth2AuthorizationCode({
    authEndpoint: "https://api.example.com/oauth2/authorize",
    clientID: "test_client_id",
    redirectURI: "https://yourapp.com/callback",
    scopes: "read write",
    state: "random_state_123",
    isPKCE: true,
  });
  console.log("\n3. OAuth 2.0 Authorization Code Result:", authCodeResult);

  // Test OAuth 2.0 Password Flow
  const passwordFlowResult = testOAuth2PasswordFlow({
    tokenEndpoint: "https://api.example.com/oauth2/token",
    clientID: "test_client_id",
    clientSecret: "test_client_secret",
    username: "testuser",
    password: "testpassword",
    scopes: "read write",
  });
  console.log("\n4. OAuth 2.0 Password Flow Result:", passwordFlowResult);

  console.log("\n✅ Authentication methods demonstration completed!");
};

// Export for use in console
if (typeof window !== "undefined") {
  window.authTesting = {
    testBasicAuth,
    testOAuth2ClientCredentials,
    testOAuth2AuthorizationCode,
    testOAuth2PasswordFlow,
    demonstrateAuthMethods,
  };
}
