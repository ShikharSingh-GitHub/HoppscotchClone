/**
 * OAuth 2.0 Service
 * Comprehensive implementation following Hoppscotch patterns
 * Supports Authorization Code, Client Credentials, Password, and Implicit flows
 */

/**
 * Generate a cryptographically secure code verifier for PKCE
 * @returns {string} Code verifier
 */
export const generateCodeVerifier = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const length = Math.floor(Math.random() * (128 - 43 + 1)) + 43; // Random length between 43 and 128
  let codeVerifier = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    codeVerifier += characters[randomIndex];
  }

  return codeVerifier;
};

/**
 * Generate code challenge from code verifier
 * @param {string} codeVerifier - The code verifier
 * @param {string} method - Challenge method ('S256' or 'plain')
 * @returns {Promise<string>} Code challenge
 */
export const generateCodeChallenge = async (codeVerifier, method = "S256") => {
  if (method === "plain") {
    return codeVerifier;
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const buffer = await crypto.subtle.digest("SHA-256", data);

  return encodeArrayBufferAsUrlEncodedBase64(buffer);
};

/**
 * Encode ArrayBuffer as URL-safe Base64
 * @param {ArrayBuffer} buffer - Buffer to encode
 * @returns {string} URL-safe Base64 encoded string
 */
const encodeArrayBufferAsUrlEncodedBase64 = (buffer) => {
  const hashArray = Array.from(new Uint8Array(buffer));
  const hashBase64URL = btoa(String.fromCharCode(...hashArray))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return hashBase64URL;
};

/**
 * Encode component for Basic Auth in OAuth 2.0
 * @param {string} component - Component to encode
 * @returns {string} Encoded component
 */
const encodeBasicAuthComponent = (component) => {
  // application/x-www-form-urlencoded expects spaces to be encoded as '+', but
  // encodeURIComponent encodes them as '%20'.
  return encodeURIComponent(component).replace(/%20/g, "+");
};

/**
 * Client Credentials Flow - Get token using client credentials
 * @param {Object} params - Flow parameters
 * @returns {Promise<Object>} Token response
 */
export const clientCredentialsFlow = async (params) => {
  const {
    tokenEndpoint,
    clientID,
    clientSecret,
    scopes,
    clientAuthentication = "AS_BASIC_AUTH_HEADERS",
  } = params;

  if (!tokenEndpoint || !clientID) {
    throw new Error("Token endpoint and client ID are required");
  }

  let headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  let body = {
    grant_type: "client_credentials",
  };

  // Handle client authentication
  if (clientAuthentication === "AS_BASIC_AUTH_HEADERS") {
    // Send credentials as Basic Auth header
    const encodedClientID = encodeBasicAuthComponent(clientID);
    const encodedClientSecret = encodeBasicAuthComponent(clientSecret || "");
    const basicAuthToken = btoa(`${encodedClientID}:${encodedClientSecret}`);

    headers.Authorization = `Basic ${basicAuthToken}`;

    if (scopes) {
      body.scope = scopes;
    }
  } else {
    // Send credentials in request body
    body.client_id = clientID;
    if (clientSecret) {
      body.client_secret = clientSecret;
    }
    if (scopes) {
      body.scope = scopes;
    }
  }

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers,
    body: new URLSearchParams(body),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(
      `Token request failed: ${response.status} ${response.statusText} - ${errorData}`
    );
  }

  return await response.json();
};

/**
 * Authorization Code Flow - Generate authorization URL
 * @param {Object} params - Flow parameters
 * @returns {string} Authorization URL
 */
export const generateAuthorizationURL = async (params) => {
  const {
    authEndpoint,
    clientID,
    redirectURI,
    scopes,
    state,
    isPKCE = false,
    codeVerifier,
    codeChallengeMethod = "S256",
    additionalParams = [],
  } = params;

  if (!authEndpoint || !clientID) {
    throw new Error("Authorization endpoint and client ID are required");
  }

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

  // PKCE support
  if (isPKCE && codeVerifier) {
    const codeChallenge = await generateCodeChallenge(
      codeVerifier,
      codeChallengeMethod
    );
    url.searchParams.set("code_challenge", codeChallenge);
    url.searchParams.set("code_challenge_method", codeChallengeMethod);
  }

  // Add additional parameters
  additionalParams.forEach((param) => {
    if (param.key && param.value && param.active) {
      url.searchParams.set(param.key, param.value);
    }
  });

  return url.toString();
};

/**
 * Authorization Code Flow - Exchange code for token
 * @param {Object} params - Flow parameters
 * @returns {Promise<Object>} Token response
 */
export const exchangeCodeForToken = async (params) => {
  const {
    tokenEndpoint,
    clientID,
    clientSecret,
    code,
    redirectURI,
    codeVerifier,
    additionalParams = [],
  } = params;

  if (!tokenEndpoint || !clientID || !code) {
    throw new Error(
      "Token endpoint, client ID, and authorization code are required"
    );
  }

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  const body = {
    grant_type: "authorization_code",
    client_id: clientID,
    code,
  };

  if (clientSecret) {
    body.client_secret = clientSecret;
  }

  if (redirectURI) {
    body.redirect_uri = redirectURI;
  }

  // PKCE code verifier
  if (codeVerifier) {
    body.code_verifier = codeVerifier;
  }

  // Add additional parameters
  additionalParams.forEach((param) => {
    if (param.key && param.value && param.active) {
      body[param.key] = param.value;
    }
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers,
    body: new URLSearchParams(body),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(
      `Token exchange failed: ${response.status} ${response.statusText} - ${errorData}`
    );
  }

  return await response.json();
};

/**
 * Password Flow - Get token using username/password
 * @param {Object} params - Flow parameters
 * @returns {Promise<Object>} Token response
 */
export const passwordFlow = async (params) => {
  const { tokenEndpoint, clientID, clientSecret, username, password, scopes } =
    params;

  if (!tokenEndpoint || !clientID || !username || !password) {
    throw new Error(
      "Token endpoint, client ID, username, and password are required"
    );
  }

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

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers,
    body: new URLSearchParams(body),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(
      `Password flow failed: ${response.status} ${response.statusText} - ${errorData}`
    );
  }

  return await response.json();
};

/**
 * Refresh Token Flow - Get new access token using refresh token
 * @param {Object} params - Flow parameters
 * @returns {Promise<Object>} Token response
 */
export const refreshTokenFlow = async (params) => {
  const { tokenEndpoint, clientID, clientSecret, refreshToken, scopes } =
    params;

  if (!tokenEndpoint || !clientID || !refreshToken) {
    throw new Error(
      "Token endpoint, client ID, and refresh token are required"
    );
  }

  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };

  const body = {
    grant_type: "refresh_token",
    client_id: clientID,
    refresh_token: refreshToken,
  };

  if (clientSecret) {
    body.client_secret = clientSecret;
  }

  if (scopes) {
    body.scope = scopes;
  }

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers,
    body: new URLSearchParams(body),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(
      `Token refresh failed: ${response.status} ${response.statusText} - ${errorData}`
    );
  }

  return await response.json();
};

/**
 * Implicit Flow - Generate authorization URL for implicit flow
 * @param {Object} params - Flow parameters
 * @returns {string} Authorization URL
 */
export const generateImplicitFlowURL = (params) => {
  const {
    authEndpoint,
    clientID,
    redirectURI,
    scopes,
    state,
    additionalParams = [],
  } = params;

  if (!authEndpoint || !clientID) {
    throw new Error("Authorization endpoint and client ID are required");
  }

  const url = new URL(authEndpoint);
  url.searchParams.set("response_type", "token");
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

  // Add additional parameters
  additionalParams.forEach((param) => {
    if (param.key && param.value && param.active) {
      url.searchParams.set(param.key, param.value);
    }
  });

  return url.toString();
};

/**
 * Parse OAuth 2.0 error response
 * @param {string} errorString - Error string from OAuth provider
 * @returns {Object} Parsed error
 */
export const parseOAuthError = (errorString) => {
  try {
    const error = JSON.parse(errorString);
    return {
      error: error.error || "unknown_error",
      description: error.error_description || "An unknown error occurred",
      uri: error.error_uri || null,
    };
  } catch (e) {
    return {
      error: "parse_error",
      description: errorString || "Failed to parse error response",
      uri: null,
    };
  }
};
