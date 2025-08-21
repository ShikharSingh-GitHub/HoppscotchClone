/**
 * Request Authorization Service
 * Handles generation of authorization headers and query parameters for different auth types in API requests
 */

/**
 * Generates authorization headers based on auth configuration
 * @param {Object} auth - Authorization configuration
 * @returns {Object} Headers object
 */
export const generateAuthHeaders = (auth) => {
  if (
    !auth ||
    !auth.authActive ||
    auth.authType === "none" ||
    auth.authType === "inherit"
  ) {
    return {};
  }

  switch (auth.authType) {
    case "basic":
      return generateBasicAuthHeaders(auth);
    case "bearer":
      return generateBearerTokenHeaders(auth);
    case "oauth-2":
      return generateOAuth2Headers(auth);
    case "api-key":
      return auth.addTo === "HEADERS" ? generateAPIKeyHeaders(auth) : {};
    case "aws-signature":
      return auth.addTo === "HEADERS" ? generateAWSSignatureHeaders(auth) : {};
    case "digest":
      return generateDigestAuthHeaders(auth);
    case "hawk":
      return generateHAWKHeaders(auth);
    case "jwt":
      return auth.addTo === "HEADERS" ? generateJWTHeaders(auth) : {};
    default:
      return {};
  }
};

/**
 * Generates authorization query parameters based on auth configuration
 * @param {Object} auth - Authorization configuration
 * @returns {Object} Query parameters object
 */
export const generateAuthParams = (auth) => {
  if (
    !auth ||
    !auth.authActive ||
    auth.authType === "none" ||
    auth.authType === "inherit"
  ) {
    return {};
  }

  switch (auth.authType) {
    case "oauth-2":
      return auth.addTo === "QUERY_PARAMS" ? generateOAuth2Params(auth) : {};
    case "api-key":
      return auth.addTo === "QUERY_PARAMS" ? generateAPIKeyParams(auth) : {};
    case "aws-signature":
      return auth.addTo === "QUERY_PARAMS"
        ? generateAWSSignatureParams(auth)
        : {};
    case "jwt":
      return auth.addTo === "QUERY_PARAMS" ? generateJWTParams(auth) : {};
    default:
      return {};
  }
};

// Basic Auth - Enhanced implementation following Hoppscotch patterns
const generateBasicAuthHeaders = (auth) => {
  if (!auth.username && !auth.password) return {};

  // Handle case where username might be empty but password exists (edge case)
  const username = auth.username || "";
  const password = auth.password || "";

  try {
    // Create credentials string in format "username:password"
    const credentialsString = `${username}:${password}`;

    // Base64 encode the credentials
    const encodedCredentials = btoa(credentialsString);

    return {
      Authorization: `Basic ${encodedCredentials}`,
    };
  } catch (error) {
    console.error("Error generating Basic Auth header:", error);
    return {};
  }
};

// Bearer Token
const generateBearerTokenHeaders = (auth) => {
  if (!auth.token) return {};

  return {
    Authorization: `Bearer ${auth.token}`,
  };
};

// OAuth 2.0 - Enhanced implementation following Hoppscotch patterns
const generateOAuth2Headers = (auth) => {
  const nestedToken = auth.grantTypeInfo?.token;
  const topLevelToken = auth.token;
  const token = nestedToken || topLevelToken;
  if (!token) return {};

  return {
    Authorization: `Bearer ${token}`,
  };
};

const generateOAuth2Params = (auth) => {
  if (!auth.grantTypeInfo?.token) return {};

  return {
    access_token: auth.grantTypeInfo.token,
  };
};

// API Key
const generateAPIKeyHeaders = (auth) => {
  if (!auth.key || !auth.value) return {};

  return {
    [auth.key]: auth.value,
  };
};

const generateAPIKeyParams = (auth) => {
  if (!auth.key || !auth.value) return {};

  return {
    [auth.key]: auth.value,
  };
};

// AWS Signature V4 (Simplified - in production, this would be more complex)
const generateAWSSignatureHeaders = (auth) => {
  if (!auth.accessKey || !auth.secretKey) return {};

  // This is a simplified implementation
  // In a real application, you'd implement the full AWS Signature V4 algorithm
  const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "");
  const dateStamp = timestamp.substr(0, 8);

  return {
    Authorization: `AWS4-HMAC-SHA256 Credential=${auth.accessKey}/${dateStamp}/${auth.region}/${auth.serviceName}/aws4_request`,
    "X-Amz-Date": timestamp,
    "X-Amz-Content-Sha256": "UNSIGNED-PAYLOAD",
  };
};

const generateAWSSignatureParams = (auth) => {
  if (!auth.accessKey || !auth.secretKey) return {};

  const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, "");

  return {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${auth.accessKey}/${timestamp.substr(0, 8)}/${
      auth.region
    }/${auth.serviceName}/aws4_request`,
    "X-Amz-Date": timestamp,
    "X-Amz-SignedHeaders": "host",
    "X-Amz-Signature": "PLACEHOLDER", // Would be calculated in real implementation
  };
};

// Digest Auth (Simplified)
const generateDigestAuthHeaders = (auth) => {
  if (!auth.username) return {};

  // This is a simplified implementation
  // In a real application, you'd implement the full Digest authentication algorithm
  return {
    Authorization: `Digest username="${auth.username}", realm="${
      auth.realm || ""
    }", nonce="${auth.nonce || ""}", uri="/", algorithm="${
      auth.algorithm || "MD5"
    }"`,
  };
};

// HAWK (Simplified)
const generateHAWKHeaders = (auth) => {
  if (!auth.hawkId || !auth.hawkKey) return {};

  // This is a simplified implementation
  // In a real application, you'd implement the full HAWK authentication algorithm
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = Math.random().toString(36).substring(2, 15);

  return {
    Authorization: `Hawk id="${auth.hawkId}", ts="${timestamp}", nonce="${nonce}", mac="PLACEHOLDER"`,
  };
};

// JWT
const generateJWTHeaders = (auth) => {
  if (!auth.secret) return {};

  try {
    // This is a simplified implementation
    // In a real application, you'd use a proper JWT library
    const header = btoa(
      JSON.stringify({ alg: auth.algorithm || "HS256", typ: "JWT" })
    );
    const payload = btoa(auth.payload || "{}");
    const signature = "PLACEHOLDER"; // Would be calculated using the secret and algorithm

    const token = `${header}.${payload}.${signature}`;
    const prefix = auth.headerPrefix || "Bearer ";

    return {
      Authorization: `${prefix}${token}`,
    };
  } catch (error) {
    console.error("Error generating JWT:", error);
    return {};
  }
};

const generateJWTParams = (auth) => {
  if (!auth.secret) return {};

  try {
    const header = btoa(
      JSON.stringify({ alg: auth.algorithm || "HS256", typ: "JWT" })
    );
    const payload = btoa(auth.payload || "{}");
    const signature = "PLACEHOLDER";

    const token = `${header}.${payload}.${signature}`;
    const paramName = auth.paramName || "token";

    return {
      [paramName]: token,
    };
  } catch (error) {
    console.error("Error generating JWT:", error);
    return {};
  }
};

/**
 * Applies authorization to a request object
 * @param {Object} request - Request object
 * @param {Object} auth - Authorization configuration
 * @returns {Object} Modified request object
 */
export const applyAuthToRequest = (request, auth) => {
  if (!auth || !auth.authActive) {
    return request;
  }

  const authHeaders = generateAuthHeaders(auth);
  const authParams = generateAuthParams(auth);

  // Merge headers
  const headers = {
    ...request.headers,
    ...authHeaders,
  };

  // Merge query parameters (if URL has existing params)
  let url = request.url;
  if (Object.keys(authParams).length > 0) {
    try {
      const urlObj = new URL(
        url.startsWith("http")
          ? url
          : `https://example.com${url.startsWith("/") ? "" : "/"}${url}`
      );

      Object.entries(authParams).forEach(([key, value]) => {
        urlObj.searchParams.set(key, value);
      });

      // If original URL was relative, keep it relative
      if (!url.startsWith("http")) {
        url = urlObj.pathname + urlObj.search + urlObj.hash;
      } else {
        url = urlObj.toString();
      }
    } catch (error) {
      console.warn("Invalid URL for auth params:", url, error);
      // If URL parsing fails, just add params as query string
      const paramString = new URLSearchParams(authParams).toString();
      url = url + (url.includes("?") ? "&" : "?") + paramString;
    }
  }

  return {
    ...request,
    url,
    headers,
  };
};

export default {
  generateAuthHeaders,
  generateAuthParams,
  applyAuthToRequest,
};
