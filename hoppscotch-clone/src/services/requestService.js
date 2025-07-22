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

    // Create request config
    const config = {
      method: method || "GET",
      url: url,
      headers: headers,
      data: body,
      // Set a reasonable timeout
      timeout: 30000,
      // Accept all status codes to handle in UI
      validateStatus: (status) => true,
    };

    // Make the request
    const response = await axios(config);

    return {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
      config: response.config,
    };
  } catch (error) {
    console.error("API request failed:", error);

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
