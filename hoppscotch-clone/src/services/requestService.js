import axios from "axios";
import useAuthStore from "../store/authStore";
import { applyAuthToRequest } from "./requestAuthService";

/**
 * Makes an HTTP request using the provided request data
 * @param {Object} requestData - The request configuration
 * @returns {Promise<Object>} - The response data
 */
export const makeApiRequest = async (requestData) => {
  try {
    const { method, url, headers = {}, body = null, auth = null } = requestData;

    if (!url) {
      console.error("No URL provided for request");
      throw new Error("URL is required");
    }

    // Apply request-level authorization (Basic Auth, OAuth, etc.)
    let authorizedRequest = { method, url, headers, body };
    if (auth) {
      authorizedRequest = applyAuthToRequest(authorizedRequest, auth);
      console.log("🔐 Applied request authorization:", auth.authType);
    }

    // Get app-level authentication header if available
    const appAuthHeader = useAuthStore.getState().getAuthHeader();

    // Merge headers with app authentication (this is for app-level auth, not request auth)
    const requestHeaders = { ...authorizedRequest.headers };
    if (appAuthHeader) {
      requestHeaders["Authorization"] = appAuthHeader;
      console.log("🔐 Added app-level authentication header");
    }

    // Process the body based on Content-Type
    let processedBody = authorizedRequest.body;
    const contentType =
      requestHeaders["Content-Type"] || requestHeaders["content-type"];

    console.log(`🌐 Making ${method} request to ${authorizedRequest.url}`);
    console.log("📤 Request config:");
    console.log("  - Headers:", requestHeaders);
    console.log("  - Body:", body);
    console.log("  - Content-Type:", contentType);
    console.log("  - Request Auth:", auth?.authType || "none");
    console.log("  - App Authenticated:", !!appAuthHeader);

    if (
      body &&
      typeof body === "string" &&
      contentType === "application/json"
    ) {
      try {
        // Ensure valid JSON for JSON requests
        processedBody = JSON.parse(body);
      } catch (e) {
        console.warn("Invalid JSON body, sending as string");
      }
    }

    // First, try direct request
    const config = {
      method: method || "GET",
      url: authorizedRequest.url,
      headers: requestHeaders,
      data: processedBody,
      timeout: 30000,
      validateStatus: (status) => true,
    };

    try {
      const response = await axios(config);
      return {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
        config: response.config,
      };
    } catch (directError) {
      // Check if it's a CORS error
      if (directError.message && directError.message.includes("cors")) {
        console.log("CORS error detected, trying proxy...");
        return await makeProxyRequest(requestData);
      }
      throw directError;
    }
  } catch (error) {
    console.error("API request failed:", error);

    // Check if it's a network error that might be CORS-related
    if (
      error.code === "ERR_NETWORK" ||
      error.message.includes("cors") ||
      error.message.includes("origin")
    ) {
      console.log("Network/CORS error detected, trying proxy...");
      try {
        return await makeProxyRequest(requestData);
      } catch (proxyError) {
        console.error("Proxy request also failed:", proxyError);
      }
    }

    // Return error response if available
    if (error.response) {
      return error.response;
    }

    // Return formatted error object
    return {
      status: 0,
      statusText: error.message || "Request failed",
      data: null,
      headers: {},
      error: true,
    };
  }
};

/**
 * Makes a request through the backend proxy to bypass CORS
 * @param {Object} requestData - The request configuration
 * @returns {Promise<Object>} - The response data
 */
const makeProxyRequest = async (requestData) => {
  const { method, url, headers = {}, body = null } = requestData;

  // Get authentication header for proxy request
  const authHeader = useAuthStore.getState().getAuthHeader();

  // Merge headers with authentication for proxy request
  const proxyHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (authHeader) {
    proxyHeaders["Authorization"] = authHeader;
    console.log("🔐 Added authentication header to proxy request");
  }

  // Process the body based on Content-Type
  let processedBody = body;
  const contentType = headers["Content-Type"] || headers["content-type"];

  if (body && typeof body === "string" && contentType === "application/json") {
    try {
      // Ensure valid JSON for JSON requests
      processedBody = JSON.parse(body);
    } catch (e) {
      console.warn("Invalid JSON body, sending as string");
    }
  }

  const proxyUrl = "http://localhost:5001/api/proxy";
  const proxyPayload = {
    url: url,
    method: method || "GET",
    headers: headers, // Original headers for the target request
    body: processedBody,
  };

  console.log("🔄 Making proxy request:", proxyPayload);

  const response = await axios.post(proxyUrl, proxyPayload, {
    headers: proxyHeaders, // Headers for the proxy request (including auth)
    timeout: 30000,
    validateStatus: (status) => true,
  });

  // The proxy returns the original response data
  return response.data;
};
