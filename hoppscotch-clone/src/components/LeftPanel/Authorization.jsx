import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRequestStore } from "../../store/store";

const Authorization = () => {
  const { currentRequest, updateRequest } = useRequestStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // OAuth2 dropdown states
  const [grantTypeDropdownOpen, setGrantTypeDropdownOpen] = useState(false);
  const [addToDropdownOpen, setAddToDropdownOpen] = useState(false);
  const [grantTypeButtonPosition, setGrantTypeButtonPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [addToButtonPosition, setAddToButtonPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const grantTypeButtonRef = useRef(null);
  const addToButtonRef = useRef(null);

  // Simplify state - get auth config directly from store
  const authConfig = currentRequest?.auth || {
    authType: "none",
    authActive: true,
  };
  const selectedAuthType = authConfig.authType || "none";
  const isEnabled = authConfig.authActive !== false;

  // Reusable icon component
  const AuthIcon = () => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className="opacity-75 svg-icons mr-3">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );

  // Auth type options - simplified without redundant icons
  const authTypes = [
    { key: "inherit", label: "Inherit" },
    { key: "none", label: "None" },
    { key: "basic", label: "Basic Auth" },
    { key: "digest", label: "Digest Auth" },
    { key: "bearer", label: "Bearer Token" },
    { key: "oauth-2", label: "OAuth 2.0" },
    { key: "api-key", label: "API Key" },
    { key: "aws-signature", label: "AWS Signature" },
    { key: "hawk", label: "HAWK" },
    { key: "jwt", label: "JWT" },
  ];

  const getCurrentAuthLabel = () => {
    return (
      authTypes.find((type) => type.key === selectedAuthType)?.label || "None"
    );
  };

  // Close dropdown when clicking outside - Enhanced version
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check main auth dropdown
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
        }
      }

      // Check OAuth2 grant type dropdown
      if (
        grantTypeButtonRef.current &&
        !grantTypeButtonRef.current.contains(event.target)
      ) {
        const dropdownElements = document.querySelectorAll("[data-dropdown]");
        let isInsideDropdown = false;
        dropdownElements.forEach((dropdown) => {
          if (dropdown.contains(event.target)) {
            isInsideDropdown = true;
          }
        });

        if (!isInsideDropdown) {
          setGrantTypeDropdownOpen(false);
        }
      }

      // Check OAuth2 addTo dropdown
      if (
        addToButtonRef.current &&
        !addToButtonRef.current.contains(event.target)
      ) {
        const dropdownElements = document.querySelectorAll("[data-dropdown]");
        let isInsideDropdown = false;
        dropdownElements.forEach((dropdown) => {
          if (dropdown.contains(event.target)) {
            isInsideDropdown = true;
          }
        });

        if (!isInsideDropdown) {
          setAddToDropdownOpen(false);
        }
      }
    };

    if (dropdownOpen || grantTypeDropdownOpen || addToDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [dropdownOpen, grantTypeDropdownOpen, addToDropdownOpen]);

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

  // OAuth2 dropdown toggle functions
  const toggleGrantTypeDropdown = (e) => {
    e.stopPropagation();
    if (!grantTypeDropdownOpen && grantTypeButtonRef.current) {
      const rect = grantTypeButtonRef.current.getBoundingClientRect();
      setGrantTypeButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setGrantTypeDropdownOpen(!grantTypeDropdownOpen);
  };

  const toggleAddToDropdown = (e) => {
    e.stopPropagation();
    if (!addToDropdownOpen && addToButtonRef.current) {
      const rect = addToButtonRef.current.getBoundingClientRect();
      setAddToButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setAddToDropdownOpen(!addToDropdownOpen);
  };

  const handleAuthTypeChange = (authType) => {
    setDropdownOpen(false); // Close dropdown

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
          addTo: "HEADERS",
          grantTypeInfo: {
            grantType: "AUTHORIZATION_CODE",
            authEndpoint: "",
            tokenEndpoint: "",
            clientID: "",
            clientSecret: "",
            scopes: "",
            token: "",
            isPKCE: false,
          },
        };
        break;
      case "api-key":
        newAuthConfig = {
          ...newAuthConfig,
          addTo: "HEADERS",
          key: "",
          value: "",
        };
        break;
      case "aws-signature":
        newAuthConfig = {
          ...newAuthConfig,
          addTo: "HEADERS",
          accessKey: "",
          secretKey: "",
          region: "",
          serviceName: "",
        };
        break;
      case "digest":
        newAuthConfig = {
          ...newAuthConfig,
          username: "",
          password: "",
          realm: "",
          nonce: "",
          algorithm: "MD5",
          qop: "auth",
          nc: "",
          cnonce: "",
          opaque: "",
          disableRetry: false,
        };
        break;
      case "hawk":
        newAuthConfig = {
          ...newAuthConfig,
          hawkId: "",
          hawkKey: "",
          algorithm: "sha256",
        };
        break;
      case "jwt":
        newAuthConfig = {
          ...newAuthConfig,
          secret: "",
          algorithm: "HS256",
          payload: "{}",
          addTo: "HEADERS",
          isSecretBase64Encoded: false,
          headerPrefix: "Bearer ",
          paramName: "token",
          jwtHeaders: "{}",
        };
        break;
      default:
        newAuthConfig = { authType: authType || "none", authActive: isEnabled };
    }

    updateRequest({ auth: newAuthConfig });
  };

  const handleConfigChange = (field, value) => {
    const updatedConfig = { ...authConfig, [field]: value };
    updateRequest({ auth: updatedConfig });
  };

  const handleNestedConfigChange = (parent, field, value) => {
    const updatedConfig = {
      ...authConfig,
      [parent]: {
        ...authConfig[parent],
        [field]: value,
      },
    };
    updateRequest({ auth: updatedConfig });
  };

  const handleEnabledChange = () => {
    const newEnabled = !isEnabled;
    const updatedConfig = { ...authConfig, authActive: newEnabled };
    updateRequest({ auth: updatedConfig });
    updateRequest({ auth: updatedConfig });
  };

  const handleClear = () => {
    const clearedConfig = { authType: "none", authActive: true };
    setAuthConfig(clearedConfig);
    setSelectedAuthType("none");
    updateRequest({ auth: clearedConfig });
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
      case "aws-signature":
        return (
          <AWSSignatureForm config={authConfig} onChange={handleConfigChange} />
        );
      case "digest":
        return (
          <DigestAuthForm config={authConfig} onChange={handleConfigChange} />
        );
      case "hawk":
        return <HAWKForm config={authConfig} onChange={handleConfigChange} />;
      case "jwt":
        return <JWTForm config={authConfig} onChange={handleConfigChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col">
        {/* Authorization Type Header */}
        <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-dividerLight bg-primary pl-4 top-upperMobileSecondaryStickyFold sm:top-upperSecondaryStickyFold">
          <span className="flex items-center">
            <label className="truncate font-semibold text-zinc-400 text-xs">
              Authorization Type
            </label>

            <span className="ml-2">
              <div className="select-wrapper relative">
                <span className="text-xs down-icon absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg viewBox="0 0 24 24" width="1em" height="1em">
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleDropdown();
                  }}
                  className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-white rounded px-3 py-1.5 ml-2 rounded-none pr-8 text-xs"
                  tabIndex="0">
                  <span className="inline-flex items-center justify-center whitespace-nowrap">
                    <svg
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      className="svg-icons mr-2">
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2l4-4m6 2a9 9 0 1 1-18 0a9 9 0 0 1 18 0z"></path>
                    </svg>
                    <div className="truncate max-w-[14rem]">
                      {getCurrentAuthLabel()}
                    </div>
                  </span>
                </button>
              </div>
            </span>
          </span>

          {/* Enable/Disable Checkbox */}
          <div className="flex">
            <div className="group inline-flex cursor-pointer flex-nowrap items-center justify-center transition hover:text-white px-2">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => {
                  setIsEnabled(e.target.checked);
                  const updatedConfig = {
                    ...authConfig,
                    authActive: e.target.checked,
                  };
                  setAuthConfig(updatedConfig);
                  updateRequest({ auth: updatedConfig });
                }}
                className="form-checkbox h-3 w-3 text-accent border-dividerLight bg-primaryLight rounded focus:ring-accent focus:ring-1"
              />
              <label className="cursor-pointer truncate pl-2 align-middle font-semibold text-zinc-400 text-xs">
                Enabled
              </label>
            </div>
          </div>
        </div>

        {/* Dropdown Portal - Enhanced positioning */}
        {dropdownOpen &&
          createPortal(
            <div
              data-dropdown
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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAuthTypeChange(type.key);
                  }}
                  className="w-full text-left px-3 py-2 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors flex items-center text-xs">
                  <AuthIcon />
                  {type.label}
                </button>
              ))}
            </div>,
            document.body
          )}

        {/* Content section */}
        <div className="flex flex-1 flex-col">{renderAuthForm()}</div>
      </div>
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

// OAuth 2.0 Form Component - Professional Hoppscotch Style
const OAuth2Form = ({ config, onChange, onNestedChange }) => {
  const [selectedGrantType, setSelectedGrantType] = useState(
    config.grantTypeInfo?.grantType || "AUTHORIZATION_CODE"
  );
  const [grantTypeDropdownOpen, setGrantTypeDropdownOpen] = useState(false);
  const [addToDropdownOpen, setAddToDropdownOpen] = useState(false);

  // Refs for dropdown positioning
  const addToButtonRef = useRef(null);
  const grantTypeButtonRef = useRef(null);

  // State for dropdown positioning
  const [addToButtonPosition, setAddToButtonPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const [grantTypeButtonPosition, setGrantTypeButtonPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // Reusable icon component for dropdowns
  const DropdownIcon = () => (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      className="opacity-75 svg-icons mr-3">
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );

  const grantTypes = [
    { key: "AUTHORIZATION_CODE", label: "Authorization Code" },
    { key: "CLIENT_CREDENTIALS", label: "Client Credentials" },
    { key: "PASSWORD", label: "Password" },
    { key: "IMPLICIT", label: "Implicit" },
  ];

  const handleGrantTypeChange = (grantType) => {
    setSelectedGrantType(grantType);
    setGrantTypeDropdownOpen(false);
    onNestedChange("grantTypeInfo", "grantType", grantType);
  };

  const addToOptions = [
    { key: "HEADERS", label: "Headers" },
    { key: "QUERY_PARAMS", label: "Query Parameters" },
  ];

  // Dropdown toggle functions
  const toggleGrantTypeDropdown = (e) => {
    e.stopPropagation();
    if (!grantTypeDropdownOpen && grantTypeButtonRef.current) {
      const rect = grantTypeButtonRef.current.getBoundingClientRect();
      setGrantTypeButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setGrantTypeDropdownOpen(!grantTypeDropdownOpen);
  };

  const toggleAddToDropdown = (e) => {
    e.stopPropagation();
    if (!addToDropdownOpen && addToButtonRef.current) {
      const rect = addToButtonRef.current.getBoundingClientRect();
      setAddToButtonPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setAddToDropdownOpen(!addToDropdownOpen);
  };

  // Handle clicks outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        addToDropdownOpen &&
        addToButtonRef.current &&
        !addToButtonRef.current.contains(event.target)
      ) {
        setAddToDropdownOpen(false);
      }
      if (
        grantTypeDropdownOpen &&
        grantTypeButtonRef.current &&
        !grantTypeButtonRef.current.contains(event.target)
      ) {
        setGrantTypeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [addToDropdownOpen, grantTypeDropdownOpen]);

  const getCurrentGrantTypeLabel = () => {
    return (
      grantTypes.find((type) => type.key === selectedGrantType)?.label ||
      "Authorization Code"
    );
  };

  const getCurrentAddToLabel = () => {
    return (
      addToOptions.find((option) => option.key === (config.addTo || "HEADERS"))
        ?.label || "Headers"
    );
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Token Field */}
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
              placeholder="Your OAuth 2.0 Token (e.g. sk_live_abc123xyz789)"
              value={config.token || ""}
              onChange={(e) => onChange("token", e.target.value)}
            />
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>

      {/* Grant Type Dropdown */}
      <div className="flex justify-between h-9">
        <div className="border-t border-l border-b border-search-bg w-10"></div>
        <div className="w-full grid grid-cols-12">
          <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
            <label className="text-xs font-semibold text-zinc-400 ps-2">
              Grant Type
            </label>
          </div>
          <div className="col-span-9 border-[0.5px] border-search-bg flex items-center ps-2">
            <div className="relative flex-1">
              <button
                ref={grantTypeButtonRef}
                onClick={(e) => toggleGrantTypeDropdown(e)}
                className="flex items-center justify-between w-full text-xs text-zinc-100 hover:text-white focus:outline-none"
                tabIndex="0">
                <span>{getCurrentGrantTypeLabel()}</span>
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
              </button>
              {grantTypeDropdownOpen &&
                createPortal(
                  <div
                    data-dropdown
                    className="fixed bg-zinc-800 border border-zinc-700 rounded shadow-lg z-50 min-w-[200px]"
                    style={{
                      top: `${grantTypeButtonPosition.top}px`,
                      left: `${grantTypeButtonPosition.left}px`,
                      width: `${grantTypeButtonPosition.width}px`,
                    }}>
                    {grantTypes.map((type) => (
                      <button
                        key={type.key}
                        onClick={() => handleGrantTypeChange(type.key)}
                        className="w-full px-3 py-2 text-left text-xs text-zinc-100 hover:bg-zinc-700 first:rounded-t last:rounded-b flex items-center">
                        <DropdownIcon />
                        {type.label}
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
            </div>
          </div>
        </div>
        <div className="border-r border-t border-b border-search-bg w-10"></div>
      </div>

      {/* Conditional Fields Container */}
      <div className="flex flex-col">
        {/* PKCE Checkbox for Authorization Code */}
        {selectedGrantType === "AUTHORIZATION_CODE" && (
          <div className="flex justify-between h-9">
            <div className="border-t border-l border-b border-search-bg w-10"></div>
            <div className="w-full grid grid-cols-12">
              <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
                <label className="text-xs font-semibold text-zinc-400 ps-2">
                  Use PKCE
                </label>
              </div>
              <div className="col-span-9 border-[0.5px] border-search-bg flex items-center ps-2">
                <input
                  id="checkbox-pkce"
                  type="checkbox"
                  name="checkbox"
                  className="w-4 h-4 text-green-500 border-zinc-600 bg-zinc-800 rounded focus:ring-green-500"
                  checked={config.grantTypeInfo?.usePKCE || false}
                  onChange={(e) =>
                    onNestedChange("grantTypeInfo", "usePKCE", e.target.checked)
                  }
                />
              </div>
            </div>
            <div className="border-r border-t border-b border-search-bg w-10"></div>
          </div>
        )}

        {/* Authorization Endpoint */}
        {selectedGrantType !== "CLIENT_CREDENTIALS" && (
          <div className="flex justify-between h-9">
            <div className="border-t border-l border-b border-search-bg w-10"></div>
            <div className="w-full grid grid-cols-12">
              <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
                <label className="text-xs font-semibold text-zinc-400 ps-2">
                  Auth Endpoint
                </label>
              </div>
              <div className="col-span-9 border-[0.5px] border-search-bg">
                <input
                  type="text"
                  className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
                  placeholder="https://example.com/oauth2/authorize"
                  value={config.grantTypeInfo?.authEndpoint || ""}
                  onChange={(e) =>
                    onNestedChange(
                      "grantTypeInfo",
                      "authEndpoint",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
            <div className="border-r border-t border-b border-search-bg w-10"></div>
          </div>
        )}

        {/* Token Endpoint */}
        {(selectedGrantType === "AUTHORIZATION_CODE" ||
          selectedGrantType === "CLIENT_CREDENTIALS" ||
          selectedGrantType === "PASSWORD") && (
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
                    onNestedChange(
                      "grantTypeInfo",
                      "tokenEndpoint",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
            <div className="border-r border-t border-b border-search-bg w-10"></div>
          </div>
        )}

        {/* Client ID */}
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
                value={config.clientID || ""}
                onChange={(e) => onChange("clientID", e.target.value)}
              />
            </div>
          </div>
          <div className="border-r border-t border-b border-search-bg w-10"></div>
        </div>

        {/* Client Secret */}
        {(selectedGrantType === "AUTHORIZATION_CODE" ||
          selectedGrantType === "CLIENT_CREDENTIALS" ||
          selectedGrantType === "PASSWORD") && (
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
                  placeholder="your_client_secret_here"
                  value={config.grantTypeInfo?.clientSecret || ""}
                  onChange={(e) =>
                    onNestedChange(
                      "grantTypeInfo",
                      "clientSecret",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
            <div className="border-r border-t border-b border-search-bg w-10"></div>
          </div>
        )}

        {/* Scopes */}
        <div className="flex justify-between h-9">
          <div className="border-t border-l border-b border-search-bg w-10"></div>
          <div className="w-full grid grid-cols-12">
            <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
              <label className="text-xs font-semibold text-zinc-400 ps-2">
                Scopes
              </label>
            </div>
            <div className="col-span-9 border-[0.5px] border-search-bg">
              <input
                type="text"
                className="w-full ps-2 placeholder:text-xs placeholder-zinc-600 placeholder:font-semibold focus:outline-none h-full text-xs"
                placeholder="read write"
                value={config.grantTypeInfo?.scopes || ""}
                onChange={(e) =>
                  onNestedChange("grantTypeInfo", "scopes", e.target.value)
                }
              />
            </div>
          </div>
          <div className="border-r border-t border-b border-search-bg w-10"></div>
        </div>

        {/* Pass By Dropdown */}
        <div className="flex justify-between h-9">
          <div className="border-t border-l border-b border-search-bg w-10"></div>
          <div className="w-full grid grid-cols-12">
            <div className="col-span-3 border-[0.5px] border-search-bg flex items-center">
              <label className="text-xs font-semibold text-zinc-400 ps-2">
                Pass by
              </label>
            </div>
            <div className="col-span-9 border-[0.5px] border-search-bg flex items-center ps-2">
              <div className="relative flex-1">
                <button
                  ref={addToButtonRef}
                  onClick={(e) => toggleAddToDropdown(e)}
                  className="flex items-center justify-between w-full text-xs text-zinc-100 hover:text-white focus:outline-none"
                  tabIndex="0">
                  <span>{getCurrentAddToLabel()}</span>
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
                </button>
                {addToDropdownOpen &&
                  createPortal(
                    <div
                      data-dropdown
                      className="fixed bg-zinc-800 border border-zinc-700 rounded shadow-lg z-50 min-w-[120px]"
                      style={{
                        top: `${addToButtonPosition.top}px`,
                        left: `${addToButtonPosition.left}px`,
                        width: `${addToButtonPosition.width}px`,
                      }}>
                      {addToOptions.map((option) => (
                        <button
                          key={option.key}
                          onClick={() => {
                            onChange("addTo", option.key);
                            setAddToDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-xs text-zinc-100 hover:bg-zinc-700 first:rounded-t last:rounded-b flex items-center">
                          <DropdownIcon />
                          {option.label}
                        </button>
                      ))}
                    </div>,
                    document.body
                  )}
              </div>
            </div>
          </div>
          <div className="border-r border-t border-b border-search-bg w-10"></div>
        </div>
      </div>

      {/* Advanced Configuration - Only for Authorization Code */}
      {selectedGrantType === "AUTHORIZATION_CODE" && (
        <AdvancedConfiguration
          config={config}
          onNestedChange={onNestedChange}
        />
      )}

      {/* Action Buttons - Outside Advanced Configuration */}
      {selectedGrantType === "AUTHORIZATION_CODE" && (
        <div className="flex items-center gap-2 p-4 border-t border-search-bg bg-zinc-900">
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs">
            Generate Token
          </button>
          <button className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-300 hover:bg-zinc-700 transition-colors text-xs">
            Refresh Token
          </button>
        </div>
      )}
    </div>
  );
};

// Advanced Configuration Component for OAuth2
const AdvancedConfiguration = ({ config, onNestedChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [authRequestParams, setAuthRequestParams] = useState([
    { id: 1, key: "", value: "", active: true },
  ]);
  const [tokenRequestParams, setTokenRequestParams] = useState([
    { id: 1, key: "", value: "", active: true, sendIn: "body" },
  ]);
  const [refreshRequestParams, setRefreshRequestParams] = useState([
    { id: 1, key: "", value: "", active: true, sendIn: "body" },
  ]);
  const [activeSuggestions, setActiveSuggestions] = useState(null);
  const [suggestionPosition, setSuggestionPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  // OAuth2 parameter suggestions
  const authRequestSuggestions = [
    "audience",
    "scope",
    "state",
    "nonce",
    "prompt",
    "max_age",
    "ui_locales",
    "id_token_hint",
    "login_hint",
    "acr_values",
    "response_mode",
    "display",
    "claims",
    "request",
    "request_uri",
  ];

  const tokenRequestSuggestions = [
    "grant_type",
    "code",
    "redirect_uri",
    "client_id",
    "client_secret",
    "code_verifier",
    "username",
    "password",
    "scope",
    "audience",
    "resource",
    "assertion",
    "assertion_type",
    "refresh_token",
  ];

  const refreshRequestSuggestions = [
    "grant_type",
    "refresh_token",
    "client_id",
    "client_secret",
    "scope",
    "audience",
    "resource",
  ];

  const sendInOptions = [
    { label: "Request Body", value: "body" },
    { label: "Request URL", value: "url" },
    { label: "Request Headers", value: "headers" },
  ];

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeSuggestions &&
        !event.target.closest(".suggestions-container")
      ) {
        setActiveSuggestions(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeSuggestions]);

  const showSuggestions = (event, type, paramIndex) => {
    const rect = event.target.getBoundingClientRect();
    setSuggestionPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
    setActiveSuggestions({ type, paramIndex });
  };

  const selectSuggestion = (suggestion, type, paramIndex) => {
    if (type === "auth") {
      updateParam(
        paramIndex,
        "key",
        suggestion,
        setAuthRequestParams,
        authRequestParams
      );
    } else if (type === "token") {
      updateParam(
        paramIndex,
        "key",
        suggestion,
        setTokenRequestParams,
        tokenRequestParams
      );
    } else if (type === "refresh") {
      updateParam(
        paramIndex,
        "key",
        suggestion,
        setRefreshRequestParams,
        refreshRequestParams
      );
    }
    setActiveSuggestions(null);
  };

  const getSuggestions = (type) => {
    switch (type) {
      case "auth":
        return authRequestSuggestions;
      case "token":
        return tokenRequestSuggestions;
      case "refresh":
        return refreshRequestSuggestions;
      default:
        return [];
    }
  };

  // Parameter management functions
  const addParam = (type, setParams, params) => {
    const newId = Math.max(...params.map((p) => p.id), 0) + 1;
    const newParam =
      type === "auth"
        ? { id: newId, key: "", value: "", active: true }
        : { id: newId, key: "", value: "", active: true, sendIn: "body" };
    setParams([...params, newParam]);
  };

  const updateParam = (index, field, value, setParams, params) => {
    const updatedParams = params.map((param, i) =>
      i === index ? { ...param, [field]: value } : param
    );
    setParams(updatedParams);
  };

  const removeParam = (index, setParams, params) => {
    if (params.length > 1) {
      setParams(params.filter((_, i) => i !== index));
    }
  };

  const renderParameterTable = (
    title,
    params,
    setParams,
    showSendIn = false,
    type = "token"
  ) => (
    <div className="border-b border-search-bg">
      <div className="flex items-center justify-between p-4">
        <label className="font-semibold text-zinc-400 text-xs">{title}</label>
      </div>

      {/* Column Headers */}
      <div className="flex border-b border-search-bg bg-zinc-900">
        <span className="w-8"></span>
        <span className="flex-1 px-4 py-2 text-xs font-semibold text-zinc-400">
          Key
        </span>
        <span className="flex-1 px-4 py-2 text-xs font-semibold text-zinc-400">
          Value
        </span>
        {showSendIn && (
          <span className="flex-1 px-4 py-2 text-xs font-semibold text-zinc-400">
            Send In
          </span>
        )}
        <span className="w-8"></span>
        <span className="w-8"></span>
      </div>

      {params.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 text-zinc-400">
          <span className="text-center text-xs">No parameters</span>
          <button
            onClick={() => addParam(type, setParams, params)}
            className="mt-2 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-zinc-300 hover:bg-zinc-700 flex items-center gap-2 text-xs">
            <span>+</span>
            Add
          </button>
        </div>
      ) : (
        <div className="divide-y divide-zinc-700">
          {params.map((param, index) => (
            <div key={param.id} className="flex border-search-bg">
              {/* Active Toggle */}
              <div className="w-8 flex items-center justify-center py-2">
                <input
                  type="checkbox"
                  checked={param.active}
                  onChange={(e) =>
                    updateParam(
                      index,
                      "active",
                      e.target.checked,
                      setParams,
                      params
                    )
                  }
                  className="w-4 h-4 text-green-500 border-zinc-600 bg-zinc-800 rounded focus:ring-green-500"
                />
              </div>

              {/* Key Input */}
              <div className="flex-1 border-l border-search-bg relative">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) =>
                    updateParam(index, "key", e.target.value, setParams, params)
                  }
                  onFocus={(e) => showSuggestions(e, type, index)}
                  placeholder="Key"
                  className="w-full px-4 py-2 bg-transparent border-0 text-zinc-100 text-xs focus:outline-none focus:ring-0"
                />
              </div>

              {/* Value Input */}
              <div className="flex-1 border-l border-search-bg">
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) =>
                    updateParam(
                      index,
                      "value",
                      e.target.value,
                      setParams,
                      params
                    )
                  }
                  placeholder="Value"
                  className="w-full px-4 py-2 bg-transparent border-0 text-zinc-100 text-xs focus:outline-none focus:ring-0"
                />
              </div>

              {/* Send In Dropdown */}
              {showSendIn && (
                <div className="flex-1 border-l border-search-bg">
                  <select
                    value={param.sendIn}
                    onChange={(e) =>
                      updateParam(
                        index,
                        "sendIn",
                        e.target.value,
                        setParams,
                        params
                      )
                    }
                    className="w-full px-4 py-2 bg-transparent border-0 text-zinc-100 text-xs focus:outline-none focus:ring-0"
                    disabled={!param.active}>
                    {sendInOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        className="bg-zinc-800">
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Add Button */}
              <div className="w-8 flex items-center justify-center py-2 border-l border-search-bg">
                <button
                  onClick={() => addParam(type, setParams, params)}
                  className="text-green-500 hover:text-green-400 text-sm"
                  title="Add parameter">
                  +
                </button>
              </div>

              {/* Delete Button */}
              <div className="w-8 flex items-center justify-center py-2 border-l border-search-bg">
                <button
                  onClick={() => removeParam(index, setParams, params)}
                  className="text-red-500 hover:text-red-400 text-sm"
                  title="Delete parameter"
                  disabled={params.length === 1}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="border-t border-search-bg">
      <div
        className="flex cursor-pointer items-center justify-between py-2 pl-4 text-zinc-400 transition hover:text-zinc-300"
        onClick={toggleExpanded}>
        <span className="select-none text-xs">Advanced Configuration</span>
        <svg
          className={`mr-4 w-4 h-4 opacity-50 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
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
      </div>

      {isExpanded && (
        <div className="flex flex-col border-t border-search-bg">
          {/* Auth Request Parameters */}
          {renderParameterTable(
            "Auth Request",
            authRequestParams,
            setAuthRequestParams,
            false,
            "auth"
          )}

          {/* Token Request Parameters */}
          {renderParameterTable(
            "Token Request",
            tokenRequestParams,
            setTokenRequestParams,
            true,
            "token"
          )}

          {/* Refresh Request Parameters */}
          {renderParameterTable(
            "Refresh Request",
            refreshRequestParams,
            setRefreshRequestParams,
            true,
            "refresh"
          )}
        </div>
      )}

      {/* Autocomplete Suggestions */}
      {activeSuggestions &&
        createPortal(
          <div className="suggestions-container">
            <ul
              className="suggestions fixed bg-zinc-800 border border-zinc-700 rounded shadow-lg z-[9999] max-h-48 overflow-y-auto"
              style={{
                top: `${suggestionPosition.top}px`,
                left: `${suggestionPosition.left}px`,
                minWidth: `${suggestionPosition.width}px`,
              }}>
              {getSuggestions(activeSuggestions.type).map(
                (suggestion, index) => (
                  <li
                    key={index}
                    className="cursor-pointer hover:bg-zinc-700 px-3 py-1"
                    onClick={() =>
                      selectSuggestion(
                        suggestion,
                        activeSuggestions.type,
                        activeSuggestions.paramIndex
                      )
                    }>
                    <span className="truncate py-0.5 text-xs text-zinc-300">
                      {suggestion}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
};

// API Key Form Component
const APIKeyForm = ({ config, onChange }) => {
  const addToOptions = [
    { key: "HEADERS", label: "Headers" },
    { key: "QUERY_PARAMS", label: "Query Parameters" },
  ];

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-2">
          Add To
        </label>
        <select
          value={config.addTo || "HEADERS"}
          onChange={(e) => onChange("addTo", e.target.value)}
          className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                   text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
          {addToOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-2">
          Key
        </label>
        <input
          type="text"
          value={config.key || ""}
          onChange={(e) => onChange("key", e.target.value)}
          placeholder="X-API-Key"
          className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                   text-zinc-100 placeholder-zinc-500
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-2">
          Value
        </label>
        <input
          type="text"
          value={config.value || ""}
          onChange={(e) => onChange("value", e.target.value)}
          placeholder="Enter API key value"
          className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                   text-zinc-100 placeholder-zinc-500
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

// AWS Signature Form Component
const AWSSignatureForm = ({ config, onChange }) => (
  <div className="p-4 space-y-4">
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        Access Key
      </label>
      <input
        type="text"
        value={config.accessKey || ""}
        onChange={(e) => onChange("accessKey", e.target.value)}
        placeholder="Enter AWS access key"
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 placeholder-zinc-500
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        Secret Key
      </label>
      <input
        type="password"
        value={config.secretKey || ""}
        onChange={(e) => onChange("secretKey", e.target.value)}
        placeholder="Enter AWS secret key"
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 placeholder-zinc-500
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        Region
      </label>
      <input
        type="text"
        value={config.region || ""}
        onChange={(e) => onChange("region", e.target.value)}
        placeholder="us-east-1"
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 placeholder-zinc-500
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        Service Name
      </label>
      <input
        type="text"
        value={config.serviceName || ""}
        onChange={(e) => onChange("serviceName", e.target.value)}
        placeholder="s3"
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 placeholder-zinc-500
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
  </div>
);

// Digest Auth Form Component
const DigestAuthForm = ({ config, onChange }) => (
  <div className="p-4 space-y-4">
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        Username
      </label>
      <input
        type="text"
        value={config.username || ""}
        onChange={(e) => onChange("username", e.target.value)}
        placeholder="Enter username"
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 placeholder-zinc-500
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        Password
      </label>
      <input
        type="password"
        value={config.password || ""}
        onChange={(e) => onChange("password", e.target.value)}
        placeholder="Enter password"
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 placeholder-zinc-500
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        Algorithm
      </label>
      <select
        value={config.algorithm || "MD5"}
        onChange={(e) => onChange("algorithm", e.target.value)}
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
        <option value="MD5">MD5</option>
        <option value="MD5-sess">MD5-sess</option>
      </select>
    </div>
  </div>
);

// HAWK Form Component
const HAWKForm = ({ config, onChange }) => (
  <div className="p-4 space-y-4">
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        HAWK ID
      </label>
      <input
        type="text"
        value={config.hawkId || ""}
        onChange={(e) => onChange("hawkId", e.target.value)}
        placeholder="Enter HAWK ID"
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 placeholder-zinc-500
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        HAWK Key
      </label>
      <input
        type="password"
        value={config.hawkKey || ""}
        onChange={(e) => onChange("hawkKey", e.target.value)}
        placeholder="Enter HAWK key"
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 placeholder-zinc-500
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        Algorithm
      </label>
      <select
        value={config.algorithm || "sha256"}
        onChange={(e) => onChange("algorithm", e.target.value)}
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
        <option value="sha1">SHA-1</option>
        <option value="sha256">SHA-256</option>
      </select>
    </div>
  </div>
);

// JWT Form Component
const JWTForm = ({ config, onChange }) => (
  <div className="p-4 space-y-4">
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        Secret
      </label>
      <input
        type="password"
        value={config.secret || ""}
        onChange={(e) => onChange("secret", e.target.value)}
        placeholder="Enter JWT secret"
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 placeholder-zinc-500
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        Algorithm
      </label>
      <select
        value={config.algorithm || "HS256"}
        onChange={(e) => onChange("algorithm", e.target.value)}
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent">
        <option value="HS256">HS256</option>
        <option value="HS384">HS384</option>
        <option value="HS512">HS512</option>
        <option value="RS256">RS256</option>
        <option value="RS384">RS384</option>
        <option value="RS512">RS512</option>
      </select>
    </div>
    <div>
      <label className="block text-xs font-medium text-zinc-300 mb-2">
        Payload
      </label>
      <textarea
        value={config.payload || "{}"}
        onChange={(e) => onChange("payload", e.target.value)}
        placeholder='{"sub": "1234567890", "name": "John Doe"}'
        rows={4}
        className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                 text-zinc-100 placeholder-zinc-500
                 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent 
                 resize-none"
      />
    </div>
  </div>
);

export default Authorization;
