import { useEffect, useRef, useState } from "react";
import { useRequestStore } from "../../store/store";

const Authorization = () => {
  const { currentRequest, updateRequest } = useRequestStore();
  const [authConfig, setAuthConfig] = useState(
    currentRequest?.auth || { authType: "oauth-2", authActive: true }
  );
  const [selectedAuthType, setSelectedAuthType] = useState(
    authConfig.authType || "oauth-2"
  );
  const [isEnabled, setIsEnabled] = useState(authConfig.authActive !== false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [grantTypeDropdownOpen, setGrantTypeDropdownOpen] = useState(false);
  const [passByDropdownOpen, setPassByDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Auth type options
  const authTypes = [
    { key: "none", label: "None" },
    { key: "inherit", label: "Inherit" },
    { key: "basic", label: "Basic Auth" },
    { key: "bearer", label: "Bearer Token" },
    { key: "oauth-2", label: "OAuth 2.0" },
    { key: "api-key", label: "API Key" },
    { key: "aws-signature", label: "AWS Signature" },
    { key: "digest", label: "Digest Auth" },
    { key: "hawk", label: "HAWK" },
    { key: "jwt", label: "JWT" },
  ];

  const getCurrentAuthLabel = () => {
    return (
      authTypes.find((type) => type.key === selectedAuthType)?.label || "None"
    );
  };

  useEffect(() => {
    if (currentRequest?.auth) {
      setAuthConfig(currentRequest.auth);
      setSelectedAuthType(currentRequest.auth.authType);
      setIsEnabled(currentRequest.auth.authActive !== false);
    }
  }, [currentRequest]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setGrantTypeDropdownOpen(false);
        setPassByDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAuthTypeChange = (authType) => {
    console.log("Auth type changed to:", authType);
    setSelectedAuthType(authType);
    setDropdownOpen(false);

    let newAuthConfig = { authType, authActive: isEnabled };

    // Initialize default config based on auth type
    switch (authType) {
      case "basic":
        newAuthConfig = {
          ...newAuthConfig,
          username: "",
          password: "",
        };
        break;
      case "bearer":
        newAuthConfig = {
          ...newAuthConfig,
          token: "",
        };
        break;
      case "oauth-2":
        newAuthConfig = {
          ...newAuthConfig,
          grantType: "authorization_code",
          authURL: "",
          accessTokenURL: "",
          clientID: "",
          clientSecret: "",
          scope: "",
          token: "",
          usePKCE: false,
          addTo: "HEADERS",
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
        newAuthConfig = { authType: authType || "none", authActive: isEnabled };
    }

    setAuthConfig(newAuthConfig);
    updateRequest({ auth: newAuthConfig });
  };

  const handleEnabledChange = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    const updatedConfig = { ...authConfig, authActive: newEnabled };
    setAuthConfig(updatedConfig);
    updateRequest({ auth: updatedConfig });
  };

  const renderAuthForm = () => {
    if (!isEnabled || selectedAuthType === "none") {
      return (
        <div className="p-4">
          <div className="text-center py-8 text-zinc-400">
            <div className="w-12 h-12 mx-auto mb-4 opacity-50">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-xs">No authentication required</p>
          </div>
        </div>
      );
    }

    if (selectedAuthType === "inherit") {
      return (
        <div className="p-4">
          <div className="text-xs text-zinc-400">
            Please save this request in any collection to inherit the
            authorization
          </div>
        </div>
      );
    }

    switch (selectedAuthType) {
      case "basic":
        return (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={authConfig.username || ""}
                onChange={(e) =>
                  setAuthConfig({ ...authConfig, username: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white text-xs focus:outline-none focus:border-blue-500"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={authConfig.password || ""}
                onChange={(e) =>
                  setAuthConfig({ ...authConfig, password: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white text-xs focus:outline-none focus:border-blue-500"
                placeholder="Enter password"
              />
            </div>
          </div>
        );
      case "bearer":
        return (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Token
              </label>
              <input
                type="text"
                value={authConfig.token || ""}
                onChange={(e) =>
                  setAuthConfig({ ...authConfig, token: e.target.value })
                }
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white text-xs focus:outline-none focus:border-blue-500"
                placeholder="Enter bearer token"
              />
            </div>
          </div>
        );
      case "oauth-2":
        return (
          <div className="space-y-0">
            {/* Token Field */}
            <div className="flex border-b border-zinc-700/30">
              <label className="flex items-center ml-4 text-zinc-400 min-w-[6rem] text-xs">
                Token
              </label>
              <div className="flex-1 px-4">
                <input
                  type="text"
                  value={authConfig.token || ""}
                  onChange={(e) => {
                    const updated = { ...authConfig, token: e.target.value };
                    setAuthConfig(updated);
                    updateRequest({ auth: updated });
                  }}
                  className="w-full px-3 py-3 bg-transparent text-white text-xs focus:outline-none border-none"
                  placeholder="Your OAuth 2.0 Token (e.g. sk_live_abc123xyz789)"
                />
              </div>
            </div>

            {/* Grant Type Dropdown */}
            <div className="flex items-center px-4 border-b border-zinc-700/30 py-3">
              <label className="truncate font-semibold text-zinc-400 text-xs">
                Grant Type
              </label>
              <div className="relative ml-2">
                <button
                  onClick={() =>
                    setGrantTypeDropdownOpen(!grantTypeDropdownOpen)
                  }
                  className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-3 py-1.5 text-xs border border-gray-600"
                  tabIndex="0">
                  <span className="inline-flex items-center justify-center whitespace-nowrap">
                    <div className="truncate max-w-[14rem]">
                      {authConfig.grantType === "authorization_code"
                        ? "Authorization Code"
                        : authConfig.grantType === "implicit"
                        ? "Implicit"
                        : authConfig.grantType === "password"
                        ? "Password Credentials"
                        : authConfig.grantType === "client_credentials"
                        ? "Client Credentials"
                        : "Authorization Code"}
                    </div>
                  </span>
                  <span className="text-xs ml-2">
                    <svg viewBox="0 0 24 24" width="1em" height="1em">
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m6 9l6 6l6-6"
                      />
                    </svg>
                  </span>
                </button>

                {grantTypeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 min-w-[200px]">
                    {[
                      {
                        key: "authorization_code",
                        label: "Authorization Code",
                      },
                      { key: "implicit", label: "Implicit" },
                      { key: "password", label: "Password Credentials" },
                      {
                        key: "client_credentials",
                        label: "Client Credentials",
                      },
                    ].map((type) => (
                      <button
                        key={type.key}
                        onClick={() => {
                          const updated = {
                            ...authConfig,
                            grantType: type.key,
                          };
                          setAuthConfig(updated);
                          updateRequest({ auth: updated });
                          setGrantTypeDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 first:rounded-t-md last:rounded-b-md text-xs">
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PKCE Toggle */}
            <div className="flex border-b border-zinc-700/30">
              <div className="px-4 py-3 flex items-center">
                <span className="text-zinc-400 font-semibold mr-6 text-xs">
                  Use PKCE
                </span>
                <input
                  type="checkbox"
                  checked={authConfig.usePKCE || false}
                  onChange={(e) => {
                    const updated = {
                      ...authConfig,
                      usePKCE: e.target.checked,
                    };
                    setAuthConfig(updated);
                    updateRequest({ auth: updated });
                  }}
                  className="checkbox"
                />
              </div>
            </div>

            {/* Authorization Endpoint */}
            <div className="flex border-b border-zinc-700/30">
              <label className="flex items-center ml-4 text-zinc-400 min-w-[6rem] text-xs">
                Authorization Endpoint
              </label>
              <div className="flex-1 px-4">
                <input
                  type="text"
                  value={authConfig.authURL || ""}
                  onChange={(e) => {
                    const updated = { ...authConfig, authURL: e.target.value };
                    setAuthConfig(updated);
                    updateRequest({ auth: updated });
                  }}
                  className="w-full px-3 py-3 bg-transparent text-white text-xs focus:outline-none border-none"
                  placeholder="https://example.com/oauth2/authorize"
                />
              </div>
            </div>

            {/* Token Endpoint */}
            <div className="flex border-b border-zinc-700/30">
              <label className="flex items-center ml-4 text-zinc-400 min-w-[6rem] text-xs">
                Token Endpoint
              </label>
              <div className="flex-1 px-4">
                <input
                  type="text"
                  value={authConfig.accessTokenURL || ""}
                  onChange={(e) => {
                    const updated = {
                      ...authConfig,
                      accessTokenURL: e.target.value,
                    };
                    setAuthConfig(updated);
                    updateRequest({ auth: updated });
                  }}
                  className="w-full px-3 py-3 bg-transparent text-white text-xs focus:outline-none border-none"
                  placeholder="https://example.com/oauth2/token"
                />
              </div>
            </div>

            {/* Client ID */}
            <div className="flex border-b border-zinc-700/30">
              <label className="flex items-center ml-4 text-zinc-400 min-w-[6rem] text-xs">
                Client ID
              </label>
              <div className="flex-1 px-4">
                <input
                  type="text"
                  value={authConfig.clientID || ""}
                  onChange={(e) => {
                    const updated = { ...authConfig, clientID: e.target.value };
                    setAuthConfig(updated);
                    updateRequest({ auth: updated });
                  }}
                  className="w-full px-3 py-3 bg-transparent text-white text-xs focus:outline-none border-none"
                  placeholder="your_client_id_here"
                />
              </div>
            </div>

            {/* Client Secret */}
            <div className="flex border-b border-zinc-700/30">
              <label className="flex items-center ml-4 text-zinc-400 min-w-[6rem] text-xs">
                Client Secret
              </label>
              <div className="flex-1 px-4">
                <input
                  type="password"
                  value={authConfig.clientSecret || ""}
                  onChange={(e) => {
                    const updated = {
                      ...authConfig,
                      clientSecret: e.target.value,
                    };
                    setAuthConfig(updated);
                    updateRequest({ auth: updated });
                  }}
                  className="w-full px-3 py-3 bg-transparent text-white text-xs focus:outline-none border-none"
                  placeholder="your_client_secret_here"
                />
              </div>
            </div>

            {/* Scopes */}
            <div className="flex border-b border-zinc-700/30">
              <label className="flex items-center ml-4 text-zinc-400 min-w-[6rem] text-xs">
                Scopes
              </label>
              <div className="flex-1 px-4">
                <input
                  type="text"
                  value={authConfig.scope || ""}
                  onChange={(e) => {
                    const updated = { ...authConfig, scope: e.target.value };
                    setAuthConfig(updated);
                    updateRequest({ auth: updated });
                  }}
                  className="w-full px-3 py-3 bg-transparent text-white text-xs focus:outline-none border-none"
                  placeholder="read write"
                />
              </div>
            </div>

            {/* Pass by Dropdown */}
            <div className="flex items-center border-b border-zinc-700/30 py-3">
              <span className="flex items-center">
                <label className="ml-4 text-zinc-400 text-xs">Pass by</label>
                <div className="relative ml-2">
                  <button
                    onClick={() => setPassByDropdownOpen(!passByDropdownOpen)}
                    className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-3 py-1.5 text-xs border border-gray-600"
                    tabIndex="0">
                    <span className="inline-flex items-center justify-center whitespace-nowrap">
                      <div className="truncate max-w-[14rem]">
                        {authConfig.addTo === "HEADERS"
                          ? "Headers"
                          : authConfig.addTo === "QUERY_PARAMS"
                          ? "Query Parameters"
                          : "Headers"}
                      </div>
                    </span>
                    <span className="text-xs ml-2">
                      <svg viewBox="0 0 24 24" width="1em" height="1em">
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m6 9l6 6l6-6"
                        />
                      </svg>
                    </span>
                  </button>

                  {passByDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 min-w-[200px]">
                      {[
                        { key: "HEADERS", label: "Headers" },
                        { key: "QUERY_PARAMS", label: "Query Parameters" },
                      ].map((type) => (
                        <button
                          key={type.key}
                          onClick={() => {
                            const updated = { ...authConfig, addTo: type.key };
                            setAuthConfig(updated);
                            updateRequest({ auth: updated });
                            setPassByDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 first:rounded-t-md last:rounded-b-md text-xs">
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </span>
            </div>

            {/* Generate and Refresh Token Buttons */}
            <div className="p-4 gap-2 flex">
              <button
                className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs"
                tabIndex="0">
                <span className="inline-flex items-center justify-center whitespace-nowrap">
                  <div className="truncate max-w-[16rem]">Generate Token</div>
                </span>
              </button>
              <button
                className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs"
                tabIndex="0">
                <span className="inline-flex items-center justify-center whitespace-nowrap">
                  <div className="truncate max-w-[16rem]">Refresh Token</div>
                </span>
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4">
            <div className="text-xs text-zinc-400">
              {selectedAuthType} authentication form will be implemented here
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col">
        {/* Authorization Type Header */}
        <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-zinc-700/30 bg-primary pl-4">
          <span className="flex items-center">
            <label className="truncate font-semibold text-zinc-300 text-xs">
              Authorization Type
            </label>

            <div className="relative ml-2" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-3 py-1.5 text-xs border border-gray-600"
                tabIndex="0">
                <span className="inline-flex items-center justify-center whitespace-nowrap">
                  <div className="truncate max-w-[14rem]">
                    {getCurrentAuthLabel()}
                  </div>
                </span>
                <span className="text-xs ml-2">
                  <svg viewBox="0 0 24 24" width="1em" height="1em">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m6 9l6 6l6-6"
                    />
                  </svg>
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-50 min-w-[200px]">
                  {authTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => handleAuthTypeChange(type.key)}
                      className="w-full text-left px-3 py-2 text-white hover:bg-gray-700 first:rounded-t-md last:rounded-b-md">
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </span>

          <div className="flex">
            <div className="group inline-flex cursor-pointer flex-nowrap items-center justify-center transition hover:text-white px-2">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={handleEnabledChange}
                className="checkbox"
              />
              <label className="cursor-pointer truncate pl-0 align-middle font-semibold text-xs ml-1">
                Enabled
              </label>
            </div>

            {/* Help Icon */}
            <a
              href="https://docs.hoppscotch.io/documentation/features/authorization"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white p-2"
              tabIndex="0">
              <span className="inline-flex items-center justify-center whitespace-nowrap">
                <svg
                  viewBox="0 0 24 24"
                  width="1.2em"
                  height="1.2em"
                  className="svg-icons">
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01"></path>
                  </g>
                </svg>
              </span>
            </a>

            {/* Delete Button */}
            <button
              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-red-400 p-2"
              tabIndex="0"
              onClick={() => handleAuthTypeChange("none")}>
              <span className="inline-flex items-center justify-center whitespace-nowrap">
                <svg
                  viewBox="0 0 24 24"
                  width="1.2em"
                  height="1.2em"
                  className="svg-icons">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"></path>
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Content section */}
        <div className="flex flex-1 border-b border-zinc-700/30">
          <div className="w-2/3 border-r border-zinc-700/30 overflow-y-auto">
            {renderAuthForm()}
          </div>

          {/* Right Panel - Documentation */}
          <div className="w-1/3 bg-zinc-900/50 p-4">
            <div className="pb-2 text-zinc-400 text-xs">
              The authorization header will be automatically generated when you
              send the request.
            </div>
            <a
              href="https://docs.hoppscotch.io/documentation/features/authorization"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center focus:outline-none hover:text-white text-zinc-400 text-xs">
              <svg
                viewBox="0 0 24 24"
                width="1.2em"
                height="1.2em"
                className="ml-2">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 3h6v6m-11 5L21 3m-3 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                />
              </svg>
              Learn how
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authorization;
