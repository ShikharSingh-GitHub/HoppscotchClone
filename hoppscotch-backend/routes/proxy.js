const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

// Proxy endpoint for OAuth2 token requests
router.post("/oauth2-token", async (req, res) => {
  try {
    const {
      tokenEndpoint,
      clientID,
      clientSecret,
      audience,
      scope,
      clientAuthentication = "AS_BASIC_AUTH_HEADERS",
    } = req.body;

    if (!tokenEndpoint || !clientID || !clientSecret) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    };

    let body = new URLSearchParams({
      grant_type: "client_credentials",
    });

    if (audience) body.append("audience", audience);
    if (scope) body.append("scope", scope);

    if (clientAuthentication === "AS_BASIC_AUTH_HEADERS") {
      const credentials = Buffer.from(`${clientID}:${clientSecret}`).toString(
        "base64"
      );
      headers["Authorization"] = `Basic ${credentials}`;
    } else {
      body.append("client_id", clientID);
      body.append("client_secret", clientSecret);
    }

    // Log outgoing request for debugging
    console.log("[Proxy] Requesting token:", {
      tokenEndpoint,
      clientID,
      audience,
      scope,
      clientAuthentication,
    });

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers,
      body: body.toString(),
    });

    // Log response status and headers
    console.log("[Proxy] Response status:", response.status);
    console.log("[Proxy] Response headers:", response.headers.raw());

    // Always try to parse as JSON, fallback to text
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text || "Empty response from token endpoint" };
    }

    // Log response body
    console.log("[Proxy] Response body:", data);

    res.status(response.status).json(data);
  } catch (error) {
    console.error("[Proxy] Error:", error);
    res.status(500).json({ error: "proxy_error", details: error.message });
  }
});

module.exports = router;
