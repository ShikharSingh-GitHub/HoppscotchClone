/**
 * Authentication Validation Utilities
 * Validates auth configurations to ensure proper setup before making requests
 */

/**
 * Validate Basic Auth configuration
 * @param {Object} auth - Basic auth configuration
 * @returns {Object} Validation result
 */
export const validateBasicAuth = (auth) => {
  const errors = [];
  const warnings = [];

  if (!auth.username && !auth.password) {
    errors.push("Username or password is required for Basic Auth");
  }

  if (!auth.username) {
    warnings.push("Username is empty - this may cause authentication failures");
  }

  if (!auth.password) {
    warnings.push("Password is empty - this may cause authentication failures");
  }

  // Check for potentially unsafe characters
  if (auth.username && auth.username.includes(":")) {
    warnings.push(
      "Username contains colon (:) which may cause encoding issues"
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    type: "basic",
  };
};

/**
 * Validate OAuth 2.0 configuration
 * @param {Object} auth - OAuth 2.0 auth configuration
 * @returns {Object} Validation result
 */
export const validateOAuth2 = (auth) => {
  const errors = [];
  const warnings = [];
  const grantType = auth.grantTypeInfo?.grantType;

  if (!grantType) {
    errors.push("Grant type is required for OAuth 2.0");
    return { isValid: false, errors, warnings, type: "oauth2" };
  }

  // Common validations
  if (!auth.grantTypeInfo.clientID) {
    errors.push("Client ID is required");
  }

  // Grant type specific validations
  switch (grantType) {
    case "AUTHORIZATION_CODE":
      validateAuthorizationCodeFlow(auth.grantTypeInfo, errors, warnings);
      break;
    case "CLIENT_CREDENTIALS":
      validateClientCredentialsFlow(auth.grantTypeInfo, errors, warnings);
      break;
    case "PASSWORD":
      validatePasswordFlow(auth.grantTypeInfo, errors, warnings);
      break;
    case "IMPLICIT":
      validateImplicitFlow(auth.grantTypeInfo, errors, warnings);
      break;
    default:
      errors.push(`Unsupported grant type: ${grantType}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    type: "oauth2",
    grantType,
  };
};

/**
 * Validate Authorization Code Flow
 */
const validateAuthorizationCodeFlow = (config, errors, warnings) => {
  if (!config.authEndpoint) {
    errors.push(
      "Authorization endpoint is required for Authorization Code flow"
    );
  } else if (!isValidUrl(config.authEndpoint)) {
    errors.push("Authorization endpoint must be a valid URL");
  }

  if (!config.tokenEndpoint) {
    errors.push("Token endpoint is required for Authorization Code flow");
  } else if (!isValidUrl(config.tokenEndpoint)) {
    errors.push("Token endpoint must be a valid URL");
  }

  if (!config.redirectURI) {
    warnings.push("Redirect URI is recommended for Authorization Code flow");
  } else if (!isValidUrl(config.redirectURI)) {
    warnings.push("Redirect URI should be a valid URL");
  }

  if (config.isPKCE && !config.clientSecret) {
    // PKCE without client secret is good for public clients
    warnings.push("Using PKCE without client secret (public client)");
  }

  if (!config.isPKCE && !config.clientSecret) {
    warnings.push("Consider using PKCE or client secret for better security");
  }
};

/**
 * Validate Client Credentials Flow
 */
const validateClientCredentialsFlow = (config, errors, warnings) => {
  if (!config.tokenEndpoint) {
    errors.push("Token endpoint is required for Client Credentials flow");
  } else if (!isValidUrl(config.tokenEndpoint)) {
    errors.push("Token endpoint must be a valid URL");
  }

  if (!config.clientSecret) {
    errors.push("Client secret is required for Client Credentials flow");
  }

  if (!config.scopes) {
    warnings.push("Scopes are recommended to limit access permissions");
  }
};

/**
 * Validate Password Flow
 */
const validatePasswordFlow = (config, errors, warnings) => {
  if (!config.tokenEndpoint) {
    errors.push("Token endpoint is required for Password flow");
  } else if (!isValidUrl(config.tokenEndpoint)) {
    errors.push("Token endpoint must be a valid URL");
  }

  if (!config.username) {
    errors.push("Username is required for Password flow");
  }

  if (!config.password) {
    errors.push("Password is required for Password flow");
  }

  warnings.push(
    "Password flow is deprecated and should only be used for first-party applications"
  );
};

/**
 * Validate Implicit Flow
 */
const validateImplicitFlow = (config, errors, warnings) => {
  if (!config.authEndpoint) {
    errors.push("Authorization endpoint is required for Implicit flow");
  } else if (!isValidUrl(config.authEndpoint)) {
    errors.push("Authorization endpoint must be a valid URL");
  }

  if (!config.redirectURI) {
    warnings.push("Redirect URI is recommended for Implicit flow");
  }

  warnings.push(
    "Implicit flow is deprecated - consider using Authorization Code flow with PKCE"
  );
};

/**
 * Check if URL is valid
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate any auth configuration
 * @param {Object} auth - Auth configuration
 * @returns {Object} Validation result
 */
export const validateAuth = (auth) => {
  if (!auth || !auth.authActive) {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      type: "none",
      message: "No authentication configured",
    };
  }

  switch (auth.authType) {
    case "basic":
      return validateBasicAuth(auth);
    case "oauth-2":
      return validateOAuth2(auth);
    default:
      return {
        isValid: false,
        errors: [`Unsupported authentication type: ${auth.authType}`],
        warnings: [],
        type: "unknown",
      };
  }
};

/**
 * Get validation message for display
 * @param {Object} validation - Validation result
 * @returns {string} Display message
 */
export const getValidationMessage = (validation) => {
  if (!validation.isValid) {
    return `❌ ${validation.errors.join(", ")}`;
  }

  if (validation.warnings.length > 0) {
    return `⚠️ ${validation.warnings.join(", ")}`;
  }

  return `✅ ${
    validation.type === "none"
      ? "No authentication"
      : `${validation.type} configuration is valid`
  }`;
};

/**
 * Check if auth is ready for requests
 * @param {Object} auth - Auth configuration
 * @returns {boolean} Is ready
 */
export const isAuthReady = (auth) => {
  if (!auth || !auth.authActive || auth.authType === "none") {
    return true; // No auth is always "ready"
  }

  const validation = validateAuth(auth);
  return validation.isValid;
};

/**
 * Get auth configuration suggestions
 * @param {Object} auth - Auth configuration
 * @returns {Array} Array of suggestions
 */
export const getAuthSuggestions = (auth) => {
  const suggestions = [];

  if (!auth || !auth.authActive) {
    return suggestions;
  }

  switch (auth.authType) {
    case "basic":
      suggestions.push(
        "💡 Consider using environment variables for credentials"
      );
      suggestions.push("🔒 Ensure you're using HTTPS in production");
      break;

    case "oauth-2":
      const grantType = auth.grantTypeInfo?.grantType;

      if (grantType === "AUTHORIZATION_CODE") {
        suggestions.push("🔐 Enable PKCE for enhanced security");
        suggestions.push("🎯 Use state parameter to prevent CSRF attacks");
      }

      if (grantType === "CLIENT_CREDENTIALS") {
        suggestions.push("🎯 Define specific scopes to limit permissions");
        suggestions.push("🔑 Use Basic Auth headers for client authentication");
      }

      if (grantType === "PASSWORD") {
        suggestions.push(
          "⚠️ Only use Password flow for first-party applications"
        );
        suggestions.push("🔄 Consider migrating to Authorization Code flow");
      }

      if (grantType === "IMPLICIT") {
        suggestions.push("⚠️ Implicit flow is deprecated");
        suggestions.push("🔄 Migrate to Authorization Code flow with PKCE");
      }

      suggestions.push("💾 Store tokens securely");
      suggestions.push("🔄 Implement token refresh for long-lived access");
      break;
  }

  return suggestions;
};

// Export for global access
if (typeof window !== "undefined") {
  window.authValidation = {
    validateAuth,
    validateBasicAuth,
    validateOAuth2,
    getValidationMessage,
    isAuthReady,
    getAuthSuggestions,
  };
}
