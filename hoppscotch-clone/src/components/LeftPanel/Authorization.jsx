import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTabContext } from "../../contexts/TabContext";
import { useRequestStore } from "../../store/store";

const Authorization = () => {
  const { currentRequest, updateRequest } = useRequestStore();
  const { activeTabId, updateTab } = useTabContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Get auth config from store
  const authConfig = currentRequest?.auth || {
    authType: "none",
    authActive: true,
  };

  // Helper function to update both stores
  const updateAuthConfig = (newAuthConfig) => {
    updateRequest({ auth: newAuthConfig });
    updateTab(activeTabId, { auth: newAuthConfig });
  };
  const selectedAuthType = authConfig.authType || "none";
  const isEnabled = authConfig.authActive !== false;

  // Auth type options
  const authTypes = [
    { key: "inherit", label: "Inherit" },
    { key: "none", label: "None" },
    { key: "basic", label: "Basic Auth" },
    { key: "bearer", label: "Bearer Token" },
    { key: "oauth-2", label: "OAuth 2.0" },
    { key: "api-key", label: "API Key" },
  ];

  const getCurrentAuthLabel = () => {
    return (
      authTypes.find((type) => type.key === selectedAuthType)?.label || "None"
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [dropdownOpen]);

  const toggleDropdown = () => {
    if (!dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setDropdownOpen(!dropdownOpen);
  };

  const handleAuthTypeChange = (authType) => {
    setDropdownOpen(false);

    let newAuthConfig = { authType, authActive: isEnabled };

    // Initialize default config based on auth type
    switch (authType) {
      case "basic":
        newAuthConfig = { ...newAuthConfig, username: "", password: "" };
        break;
      case "bearer":
        newAuthConfig = { ...newAuthConfig, token: "" };
        break;
      case "oauth-2":
        newAuthConfig = {
          ...newAuthConfig,
          token: "",
          grantTypeInfo: {
            grantType: "CLIENT_CREDENTIALS",
            clientID: "",
            clientSecret: "",
            authEndpoint: "",
            tokenEndpoint: "",
            redirectURI: "",
            scope: "",
            audience: "",
            addTo: "HEADERS",
            clientAuthentication: "AS_BASIC_AUTH_HEADERS",
          },
        };
        break;
      case "api-key":
        newAuthConfig = {
          ...newAuthConfig,
          key: "",
          value: "",
          addTo: "HEADERS",
        };
        break;
      default:
        break;
    }

    updateAuthConfig(newAuthConfig);
  };

  const handleConfigChange = (field, value) => {
    const updatedConfig = { ...authConfig, [field]: value };
    updateAuthConfig(updatedConfig);
  };

  const handleNestedConfigChange = (parent, field, value) => {
    const updatedConfig = {
      ...authConfig,
      [parent]: {
        ...authConfig[parent],
        [field]: value,
      },
    };
    updateAuthConfig(updatedConfig);
  };

  const handleEnabledChange = (enabled) => {
    const updatedConfig = { ...authConfig, authActive: enabled };
    updateAuthConfig(updatedConfig);
  };

  const renderAuthForm = () => {
    if (!isEnabled || selectedAuthType === "none") {
      return (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-zinc-400 text-sm">
            {!isEnabled
              ? "Authorization is disabled"
              : "No authorization selected"}
          </span>
        </div>
      );
    }

    if (selectedAuthType === "inherit") {
      return (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-zinc-400 text-sm">
            Inheriting authorization from parent
          </span>
        </div>
      );
    }

    switch (selectedAuthType) {
      case "basic":
        return (
          <BasicAuthForm config={authConfig} onChange={handleConfigChange} />
        );
      case "bearer":
        return (
          <BearerTokenForm config={authConfig} onChange={handleConfigChange} />
        );
      case "oauth-2":
        return (
          <OAuth2Form
            config={authConfig}
            onChange={handleConfigChange}
            onNestedChange={handleNestedConfigChange}
          />
        );
      case "api-key":
        return <APIKeyForm config={authConfig} onChange={handleConfigChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Authorization Header */}
      <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between border-b border-dividerLight bg-primary pl-4">
        <span className="flex items-center">
          <label className="truncate font-semibold text-zinc-400 text-xs">
            Authorization Type
          </label>
          <span className="ml-2">
            <button
              ref={buttonRef}
              onClick={toggleDropdown}
              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-3 py-1.5 text-xs">
              <span className="inline-flex items-center justify-center whitespace-nowrap">
                <div className="truncate max-w-[14rem]">
                  {getCurrentAuthLabel()}
                </div>
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  className="ml-2">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m6 9l6 6l6-6"></path>
                </svg>
              </span>
            </button>
          </span>
        </span>

        {/* Enable/Disable Checkbox */}
        <div className="flex">
          <div className="group inline-flex cursor-pointer flex-nowrap items-center justify-center transition hover:text-white px-2">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => handleEnabledChange(e.target.checked)}
              className="form-checkbox h-3 w-3 text-accent border-dividerLight bg-primaryLight rounded focus:ring-accent focus:ring-1"
            />
            <label className="cursor-pointer truncate pl-2 align-middle font-semibold text-zinc-400 text-xs">
              Enabled
            </label>
          </div>
        </div>
      </div>

      {/* Dropdown Portal */}
      {dropdownOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="bg-zinc-800 border border-zinc-700 rounded shadow-xl z-[99999] min-w-[200px] max-h-[300px] overflow-y-auto"
            style={{
              position: "absolute",
              top: `${buttonPosition.top + 2}px`,
              left: `${buttonPosition.left}px`,
              minWidth: `${Math.max(buttonPosition.width, 200)}px`,
            }}>
            {authTypes.map((type) => (
              <button
                key={type.key}
                onClick={() => handleAuthTypeChange(type.key)}
                className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors flex items-center text-xs">
                {type.label}
              </button>
            ))}
          </div>,
          document.body
        )}

      {/* Content section */}
      <div className="flex flex-1 flex-col">{renderAuthForm()}</div>
    </div>
  );
};

// Basic Auth Form Component
const BasicAuthForm = ({ config, onChange }) => {
  return (
    <div className="flex flex-1 flex-col">
      {/* Username Field */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Username
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg">
            <input
              type="text"
              className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
              placeholder="john_doe"
              value={config.username || ""}
              onChange={(e) => onChange("username", e.target.value)}
            />
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>

      {/* Password Field */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Password
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg">
            <input
              type="password"
              className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
              placeholder="Enter password"
              value={config.password || ""}
              onChange={(e) => onChange("password", e.target.value)}
            />
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>
    </div>
  );
};

// Bearer Token Form Component
const BearerTokenForm = ({ config, onChange }) => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Token
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg">
            <input
              type="text"
              className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
              placeholder="Enter bearer token"
              value={config.token || ""}
              onChange={(e) => onChange("token", e.target.value)}
            />
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>
    </div>
  );
};

// OAuth 2.0 Form Component - Client Credentials Focus
const OAuth2Form = ({ config, onChange, onNestedChange }) => {
  console.log("🔍 OAuth2Form render - config:", config);
  console.log(
    "🔍 OAuth2Form render - grantTypeInfo.token:",
    config.grantTypeInfo?.token
  );

  // Options for client authentication methods
  const clientAuthOptions = [
    { key: "AS_BASIC_AUTH_HEADERS", label: "Send as Basic Auth Header" },
    { key: "IN_BODY", label: "Send client credentials in body" },
  ];
  // Toggle client authentication dropdown
  const toggleClientAuthDropdown = () => {
    setClientAuthDropdownOpen((open) => !open);
  };
  const [clientAuthDropdownOpen, setClientAuthDropdownOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const clientAuthButtonRef = useRef(null);
  const handleGenerateToken = async () => {
    setIsGenerating(true);
    try {
      const tokenEndpoint = config.grantTypeInfo?.tokenEndpoint;
      const clientID = config.grantTypeInfo?.clientID;
      const clientSecret = config.grantTypeInfo?.clientSecret;
      const audience = config.grantTypeInfo?.audience;
      const scope = config.grantTypeInfo?.scope;
      const clientAuth =
        config.grantTypeInfo?.clientAuthentication || "AS_BASIC_AUTH_HEADERS";

      // Validation
      const missingFields = [];
      if (!tokenEndpoint || tokenEndpoint.trim() === "")
        missingFields.push("Token Endpoint");
      if (!clientID || clientID.trim() === "") missingFields.push("Client ID");
      if (!clientSecret || clientSecret.trim() === "")
        missingFields.push("Client Secret");
      if (missingFields.length > 0) {
        alert(
          `Please fill in the following required fields: ${missingFields.join(
            ", "
          )}`
        );
        setIsGenerating(false);
        return;
      }

      // Call backend proxy with fallbacks for different dev modes
      const endpoints = [
        "/api/proxy/oauth2-token",
        "http://localhost:5001/api/proxy/oauth2-token",
        "http://localhost:5000/api/proxy/oauth2-token",
      ];

      let response;
      let lastError;
      for (const endpoint of endpoints) {
        try {
          const resp = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tokenEndpoint,
              clientID,
              clientSecret,
              audience,
              scope,
              clientAuthentication: clientAuth,
            }),
          });
          // Use the first non-404 or OK response
          if (resp.ok || resp.status !== 404) {
            response = resp;
            break;
          } else {
            lastError = new Error(
              `Endpoint ${endpoint} responded with ${resp.status}`
            );
          }
        } catch (e) {
          lastError = e;
        }
      }

      if (!response) {
        throw lastError || new Error("All OAuth2 proxy endpoints failed");
      }
      let data;
      try {
        data = await response.clone().json();
      } catch (e) {
        // If response is not JSON, fallback to text (using clone)
        try {
          const text = await response.text();
          data = { error: text || "Empty response from server" };
        } catch (err) {
          data = { error: "Unable to read response body" };
        }
      }
      if (response.ok && data.access_token) {
        console.log("✅ Token generated successfully:", data.access_token);
        console.log("🔐 Storing token in grantTypeInfo.token");
        onNestedChange("grantTypeInfo", "token", data.access_token);
        console.log("🔐 Storing token in main token field");
        onChange("token", data.access_token); // Also store in main token field
        console.log("🔐 Current auth config after update:", config);
        alert("Token generated successfully!");
      } else {
        alert(
          `Token generation failed: ${
            data.error_description || data.error || "Unknown error"
          }`
        );
      }
    } catch (error) {
      alert(`Error generating token: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate curl command for manual testing
  const generateCurlCommand = () => {
    const tokenEndpoint = config.grantTypeInfo?.tokenEndpoint;
    const clientID = config.grantTypeInfo?.clientID;
    const clientSecret = config.grantTypeInfo?.clientSecret;
    const audience = config.grantTypeInfo?.audience;
    const scope = config.grantTypeInfo?.scope;
    const clientAuth =
      config.grantTypeInfo?.clientAuthentication || "AS_BASIC_AUTH_HEADERS";

    if (!tokenEndpoint || !clientID || !clientSecret) {
      alert(
        "Please fill in Token Endpoint, Client ID, and Client Secret first"
      );
      return;
    }

    let curlCommand = `curl -X POST "${tokenEndpoint}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\`;

    if (clientAuth === "AS_BASIC_AUTH_HEADERS") {
      const credentials = btoa(`${clientID}:${clientSecret}`);
      curlCommand += `
  -H "Authorization: Basic ${credentials}" \\`;
    }

    curlCommand += `
  -d "grant_type=client_credentials"`;

    if (audience && audience.trim() !== "") {
      curlCommand += ` \\
  -d "audience=${encodeURIComponent(audience.trim())}"`;
    }

    if (scope && scope.trim() !== "") {
      curlCommand += ` \\
  -d "scope=${encodeURIComponent(scope.trim())}"`;
    }

    if (clientAuth !== "AS_BASIC_AUTH_HEADERS") {
      curlCommand += ` \\
  -d "client_id=${clientID}" \\
  -d "client_secret=${clientSecret}"`;
    }

    console.log("Generated curl command:");
    console.log(curlCommand);

    // Copy to clipboard if possible
    if (navigator.clipboard) {
      navigator.clipboard.writeText(curlCommand).then(() => {
        alert(
          "Curl command copied to clipboard! Check the console for the full command."
        );
      });
    } else {
      alert("Curl command generated! Check the console to copy it.");
    }
  };

  const getCurrentClientAuthLabel = () => {
    const current =
      config.grantTypeInfo?.clientAuthentication || "AS_BASIC_AUTH_HEADERS";
    return (
      clientAuthOptions.find((option) => option.key === current)?.label ||
      "Send as Basic Auth Header"
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        clientAuthDropdownOpen &&
        clientAuthButtonRef.current &&
        !clientAuthButtonRef.current.contains(event.target)
      ) {
        setClientAuthDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [clientAuthDropdownOpen]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Token Field with Generate Button */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Access Token
            </label>
          </div>
          <div className="col-span-5 border-[0.5px] border-search-bg">
            <input
              type="text"
              className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
              placeholder="Generated OAuth 2.0 Token"
              value={config.grantTypeInfo?.token || config.token || ""}
              onChange={(e) => {
                onNestedChange("grantTypeInfo", "token", e.target.value);
                onChange("token", e.target.value);
              }}
            />
          </div>
          <div className="col-span-3 border-[0.5px] border-search-bg">
            <button
              onClick={handleGenerateToken}
              disabled={isGenerating}
              className="w-full h-full px-1 bg-accent hover:bg-accent/80 disabled:bg-accent/50 text-white text-xs font-semibold transition-colors">
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>

      {/* Scope Field */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Scope
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg">
            <input
              type="text"
              className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
              placeholder="e.g. openid profile email"
              value={config.grantTypeInfo?.scope || ""}
              onChange={(e) =>
                onNestedChange("grantTypeInfo", "scope", e.target.value)
              }
            />
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>

      {/* Grant Type Field - Hardcoded as Client Credentials */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Grant Type
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg flex items-center">
            <span className="ps-2 text-xs text-zinc-100 font-medium">
              Client Credentials
            </span>
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>

      {/* Client ID Field */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Client ID
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg">
            <input
              type="text"
              className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
              placeholder="Enter Client ID"
              value={config.grantTypeInfo?.clientID || ""}
              onChange={(e) =>
                onNestedChange("grantTypeInfo", "clientID", e.target.value)
              }
            />
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>

      {/* Client Secret Field */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Client Secret
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg">
            <input
              type="password"
              className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
              placeholder="Enter Client Secret"
              value={config.grantTypeInfo?.clientSecret || ""}
              onChange={(e) =>
                onNestedChange("grantTypeInfo", "clientSecret", e.target.value)
              }
            />
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>

      {/* Client Authentication Field */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Client Auth
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg relative">
            <button
              ref={clientAuthButtonRef}
              className="w-full h-full px-2 py-1 text-xs text-zinc-100 bg-transparent text-left focus:outline-none flex items-center justify-between"
              onClick={toggleClientAuthDropdown}>
              <span>{getCurrentClientAuthLabel()}</span>
              <svg
                className="w-4 h-4 ml-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>

      {/* Token Endpoint Field */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Token Endpoint
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg">
            <input
              type="text"
              className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
              placeholder="https://example.com/oauth2/token"
              value={config.grantTypeInfo?.tokenEndpoint || ""}
              onChange={(e) =>
                onNestedChange("grantTypeInfo", "tokenEndpoint", e.target.value)
              }
            />
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>

      {/* Audience Field (for Auth0 and similar providers) */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Audience
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg">
            <input
              type="text"
              className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
              placeholder="https://api.example.com"
              value={config.grantTypeInfo?.audience || ""}
              onChange={(e) =>
                onNestedChange("grantTypeInfo", "audience", e.target.value)
              }
            />
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>

      {/* Client Auth Dropdown Portal */}
      {clientAuthDropdownOpen &&
        createPortal(
          <div
            className="fixed bg-zinc-800 border border-zinc-700 rounded shadow-lg z-50 min-w-[200px]"
            style={{
              top: `${clientAuthButtonPosition.top}px`,
              left: `${clientAuthButtonPosition.left}px`,
              width: `${clientAuthButtonPosition.width}px`,
            }}>
            {clientAuthOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => handleClientAuthChange(option.key)}
                className="w-full px-3 py-2 text-left text-xs text-zinc-100 hover:bg-zinc-700 first:rounded-t last:rounded-b">
                {option.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

// API Key Form Component
const APIKeyForm = ({ config, onChange }) => {
  return (
    <div className="flex flex-1 flex-col">
      {/* Key Field */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Key
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg">
            <input
              type="text"
              className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
              placeholder="X-API-Key"
              value={config.key || ""}
              onChange={(e) => onChange("key", e.target.value)}
            />
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>

      {/* Value Field */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Value
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg">
            <input
              type="text"
              className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
              placeholder="Enter API key value"
              value={config.value || ""}
              onChange={(e) => onChange("value", e.target.value)}
            />
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>
    </div>
  );
};

export default Authorization;
