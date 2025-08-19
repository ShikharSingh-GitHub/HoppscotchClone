import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [buttonPosition, setButtonPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

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
      if (buttonRef.current && !buttonRef.current.contains(event.target)) {
        // Check if click is inside any dropdown
        const dropdownElements = document.querySelectorAll("[data-dropdown]");
        let isInsideDropdown = false;
        dropdownElements.forEach((dropdown) => {
          if (dropdown.contains(event.target)) {
            isInsideDropdown = true;
          }
        });

        if (!isInsideDropdown) {
          setDropdownOpen(false);
          setGrantTypeDropdownOpen(false);
          setPassByDropdownOpen(false);
        }
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [dropdownOpen]);

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
          <div className="w-full">
            {/* Token Field */}
            <div className="flex flex-1 border-b border-dividerLight">
              <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem]">
                Token
              </label>
              <div className="autocomplete-wrapper">
                <div className="no-scrollbar absolute inset-0 flex flex-1 divide-x divide-dividerLight overflow-x-auto">
                  <div
                    className="flex flex-1 truncate relative ph-no-capture"
                    placeholder="Your OAuth 2.0 Token (e.g. sk_live_abc123xyz789)">
                    <input
                      type="text"
                      value={authConfig.token || ""}
                      onChange={(e) => {
                        const updated = {
                          ...authConfig,
                          token: e.target.value,
                        };
                        setAuthConfig(updated);
                        updateRequest({ auth: updated });
                      }}
                      className="w-full bg-transparent text-primary border-none outline-none p-4"
                      placeholder="Your OAuth 2.0 Token (e.g. sk_live_abc123xyz789)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Grant Type */}
            <div className="flex items-center px-4 border-b border-dividerLight">
              <label className="truncate font-semibold text-secondaryLight">
                Grant Type
              </label>
              <span className="!flex-initial ml-2">
                <div className="select-wrapper relative">
                  <span className="text-xs down-icon absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg viewBox="0 0 24 24" width="1.2em" height="1.2em">
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m6 9l6 6l6-6"></path>
                    </svg>
                  </span>
                  <button
                    onClick={() =>
                      setGrantTypeDropdownOpen(!grantTypeDropdownOpen)
                    }
                    className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark rounded px-4 py-2 ml-2 rounded-none pr-8"
                    tabIndex="0">
                    <span className="inline-flex items-center justify-center whitespace-nowrap">
                      <div className="truncate max-w-[16rem]">
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
                  </button>
                </div>
              </span>
            </div>

            {/* PKCE Toggle and other fields */}
            <div className="flex flex-col">
              <div className="flex flex-1 border-b border-dividerLight">
                <div className="px-4 py-2 flex items-center">
                  <span className="text-secondaryLight font-semibold mr-6">
                    Use PKCE
                  </span>
                  <div
                    className="group inline-flex cursor-pointer flex-nowrap items-center justify-center transition hover:text-secondaryDark text-secondaryLight flex"
                    role="checkbox"
                    aria-checked={authConfig.usePKCE || false}>
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
                    <label className="cursor-pointer truncate pl-0 align-middle font-semibold"></label>
                  </div>
                </div>
              </div>

              {/* Authorization Endpoint */}
              <div className="flex flex-1 border-b border-dividerLight">
                <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem]">
                  Authorization Endpoint
                </label>
                <div className="autocomplete-wrapper px-4">
                  <div className="no-scrollbar absolute inset-0 flex flex-1 divide-x divide-dividerLight overflow-x-auto">
                    <div
                      className="flex flex-1 truncate relative ph-no-capture"
                      placeholder="https://example.com/oauth2/authorize">
                      <input
                        type="text"
                        value={authConfig.authURL || ""}
                        onChange={(e) => {
                          const updated = {
                            ...authConfig,
                            authURL: e.target.value,
                          };
                          setAuthConfig(updated);
                          updateRequest({ auth: updated });
                        }}
                        className="w-full bg-transparent text-primary border-none outline-none p-4"
                        placeholder="https://example.com/oauth2/authorize"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Endpoint */}
              <div className="flex flex-1 border-b border-dividerLight">
                <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem]">
                  Token Endpoint
                </label>
                <div className="autocomplete-wrapper px-4">
                  <div className="no-scrollbar absolute inset-0 flex flex-1 divide-x divide-dividerLight overflow-x-auto">
                    <div
                      className="flex flex-1 truncate relative ph-no-capture"
                      placeholder="https://example.com/oauth2/token">
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
                        className="w-full bg-transparent text-primary border-none outline-none p-4"
                        placeholder="https://example.com/oauth2/token"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Client ID */}
              <div className="flex flex-1 border-b border-dividerLight">
                <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem]">
                  Client ID
                </label>
                <div className="autocomplete-wrapper px-4">
                  <div className="no-scrollbar absolute inset-0 flex flex-1 divide-x divide-dividerLight overflow-x-auto">
                    <div
                      className="flex flex-1 truncate relative ph-no-capture"
                      placeholder="your_client_id_here">
                      <input
                        type="text"
                        value={authConfig.clientID || ""}
                        onChange={(e) => {
                          const updated = {
                            ...authConfig,
                            clientID: e.target.value,
                          };
                          setAuthConfig(updated);
                          updateRequest({ auth: updated });
                        }}
                        className="w-full bg-transparent text-primary border-none outline-none p-4"
                        placeholder="your_client_id_here"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Secret */}
              <div className="flex flex-1 border-b border-dividerLight">
                <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem]">
                  Client Secret
                </label>
                <div className="autocomplete-wrapper px-4">
                  <div className="no-scrollbar absolute inset-0 flex flex-1 divide-x divide-dividerLight overflow-x-auto">
                    <div
                      className="flex flex-1 truncate relative ph-no-capture"
                      placeholder="your_client_secret_here">
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
                        className="w-full bg-transparent text-primary border-none outline-none p-4"
                        placeholder="your_client_secret_here"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Scopes */}
              <div className="flex flex-1 border-b border-dividerLight">
                <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem]">
                  Scopes
                </label>
                <div className="autocomplete-wrapper px-4">
                  <div className="no-scrollbar absolute inset-0 flex flex-1 divide-x divide-dividerLight overflow-x-auto">
                    <div
                      className="flex flex-1 truncate relative ph-no-capture"
                      placeholder="read write">
                      <input
                        type="text"
                        value={authConfig.scope || ""}
                        onChange={(e) => {
                          const updated = {
                            ...authConfig,
                            scope: e.target.value,
                          };
                          setAuthConfig(updated);
                          updateRequest({ auth: updated });
                        }}
                        className="w-full bg-transparent text-primary border-none outline-none p-4"
                        placeholder="read write"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pass by */}
              <div className="flex items-center border-b border-dividerLight">
                <span className="flex items-center">
                  <label className="ml-4 text-secondaryLight">Pass by</label>
                  <span className="ml-2">
                    <div className="select-wrapper relative">
                      <span className="text-xs down-icon absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg viewBox="0 0 24 24" width="1.2em" height="1.2em">
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m6 9l6 6l6-6"></path>
                        </svg>
                      </span>
                      <button
                        onClick={() =>
                          setPassByDropdownOpen(!passByDropdownOpen)
                        }
                        className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark rounded px-4 py-2 ml-2 rounded-none pr-8"
                        tabIndex="0">
                        <span className="inline-flex items-center justify-center whitespace-nowrap">
                          <div className="truncate max-w-[16rem]">
                            {authConfig.addTo === "HEADERS"
                              ? "Headers"
                              : authConfig.addTo === "QUERY_PARAMS"
                              ? "Query Parameters"
                              : "Headers"}
                          </div>
                        </span>
                      </button>
                    </div>
                  </span>
                </span>
              </div>

              {/* Advanced Configuration */}
              <div className="flex flex-col">
                <div className="flex cursor-pointer items-center justify-between py-2 pl-4 text-secondaryLight transition hover:text-secondary">
                  <span className="select-none">Advanced Configuration</span>
                  <svg
                    viewBox="0 0 24 24"
                    width="1.2em"
                    height="1.2em"
                    className="mr-4 opacity-50">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m6 9l6 6l6-6"></path>
                  </svg>
                </div>
                <div style={{ display: "none" }}>
                  {/* Advanced configuration content would go here */}
                </div>
              </div>

              {/* Generate and Refresh Token Buttons */}
              <div className="p-2 gap-1 flex">
                <button
                  className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark rounded px-4 py-2 bg-primaryLight hover:bg-primaryDark focus-visible:bg-primaryDark"
                  tabIndex="0">
                  <span className="inline-flex items-center justify-center whitespace-nowrap">
                    <div className="truncate max-w-[16rem]">Generate Token</div>
                  </span>
                </button>
                <button
                  className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark rounded px-4 py-2 bg-primaryLight hover:bg-primaryDark focus-visible:bg-primaryDark"
                  tabIndex="0">
                  <span className="inline-flex items-center justify-center whitespace-nowrap">
                    <div className="truncate max-w-[16rem]">Refresh Token</div>
                  </span>
                </button>
              </div>
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
        <div className="sticky z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-dividerLight bg-primary pl-4 top-upperMobileSecondaryStickyFold sm:top-upperSecondaryStickyFold">
          <span className="flex items-center">
            <label className="truncate font-semibold text-secondaryLight">
              Authorization Type
            </label>

            <span className="ml-2">
              <div className="select-wrapper relative">
                <span className="text-xs down-icon absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg viewBox="0 0 24 24" width="1.2em" height="1.2em">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m6 9l6 6l6-6"></path>
                  </svg>
                </span>
                <button
                  ref={buttonRef}
                  onClick={() => {
                    console.log(
                      "Dropdown button clicked, current state:",
                      dropdownOpen
                    );
                    toggleDropdown();
                  }}
                  className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark rounded px-4 py-2 ml-2 rounded-none pr-8"
                  tabIndex="0">
                  <span className="inline-flex items-center justify-center whitespace-nowrap">
                    <div className="truncate max-w-[16rem]">
                      {getCurrentAuthLabel()}
                    </div>
                  </span>
                </button>
              </div>
            </span>
          </span>

          <div className="flex">
            <div
              className="group inline-flex cursor-pointer flex-nowrap items-center justify-center transition hover:text-secondaryDark px-2"
              role="checkbox"
              aria-checked={isEnabled}>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={handleEnabledChange}
                className="checkbox"
              />
              <label className="cursor-pointer truncate pl-0 align-middle font-semibold">
                Enabled
              </label>
            </div>

            <a
              href="https://docs.hoppscotch.io/documentation/features/authorization"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark p-2"
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
                <div className="truncate max-w-[16rem]"></div>
              </span>
            </a>

            <button
              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark p-2"
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
                <div className="truncate max-w-[16rem]"></div>
              </span>
            </button>
          </div>
        </div>

        {/* Dropdown Portal */}
        {dropdownOpen &&
          createPortal(
            <div
              data-dropdown
              className="bg-primary border border-dividerLight rounded shadow-lg z-[99999] min-w-[200px]"
              style={{
                position: "absolute",
                top: `${buttonPosition.top + 2}px`,
                left: `${buttonPosition.left}px`,
                minWidth: `${Math.max(buttonPosition.width, 200)}px`,
              }}>
              {authTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => {
                    console.log("Auth type selected:", type.key);
                    handleAuthTypeChange(type.key);
                  }}
                  className="w-full text-left px-4 py-2 text-secondary hover:bg-primaryLight hover:text-secondaryDark transition-colors">
                  {type.label}
                </button>
              ))}
            </div>,
            document.body
          )}

        {/* Content section */}
        <div className="flex flex-1 border-b border-dividerLight">
          <div className="w-2/3 border-r border-dividerLight">
            {renderAuthForm()}
          </div>

          {/* Right Panel - Documentation */}
          <div className="z-[9] sticky top-upperTertiaryStickyFold h-full min-w-[12rem] max-w-1/3 flex-shrink-0 overflow-auto overflow-x-auto bg-primary p-4">
            <div className="pb-2 text-secondaryLight">
              The authorization header will be automatically generated when you
              send the request.
            </div>
            <a
              href="https://docs.hoppscotch.io/documentation/features/authorization"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center focus:outline-none hover:text-secondaryDark focus-visible:text-secondaryDark flex-row-reverse link"
              tabIndex="0">
              <svg
                viewBox="0 0 24 24"
                width="1.2em"
                height="1.2em"
                className="svg-icons ml-2">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 3h6v6m-11 5L21 3m-3 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
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
