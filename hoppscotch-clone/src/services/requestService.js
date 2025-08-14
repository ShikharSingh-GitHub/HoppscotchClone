import axios from "axios";

/**
 * Makes an HTTP request using the provided request data
 * @param {Object} requestData - The request configuration
 * @returns {Promise<Object>} - The response data
 */
export const makeApiRequest = async (requestData) => {
  try {
    const { method, url, headers = {}, body = null } = requestData;

    if (!url) {
      console.error("No URL provided for request");
      throw new Error("URL is required");
    }

    console.log(`Making ${method} request to ${url}`);

    // First, try direct request
    const config = {
      method: method || "GET",
      url: url,
      headers: headers,
      data: body,
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

  const proxyUrl = "http://localhost:5001/api/proxy";
  const proxyPayload = {
    url: url,
    method: method || "GET",
    headers: headers,
    data: body,
  };

  console.log(`Making proxy request for ${method} ${url}`);

  const response = await axios.post(proxyUrl, proxyPayload, {
    timeout: 30000,
    validateStatus: (status) => true,
  });

  // The proxy returns the original response data
  return response.data;
};
