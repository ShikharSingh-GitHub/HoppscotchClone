import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRequestStore } from "../../store/store";
import CodeMirror from "@uiw/react-codemirror";
import { hoppscotchTheme } from "../../utils/codeMirrorConfig";

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
  const [grantTypeButtonPosition, setGrantTypeButtonPosition] = useState({ top: 0, left: 0, width: 0 });
  const [addToButtonPosition, setAddToButtonPosition] = useState({ top: 0, left: 0, width: 0 });
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
      if (grantTypeButtonRef.current && !grantTypeButtonRef.current.contains(event.target)) {
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
      if (addToButtonRef.current && !addToButtonRef.current.contains(event.target)) {
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

        {/* Content section with left and right panels */}
        <div className="flex flex-1 border-b border-zinc-700/30">
          {/* Left panel - Main form area */}
          <div className="w-2/3 border-r border-zinc-700/30 overflow-y-auto">
            {renderAuthForm()}
          </div>

          {/* Right panel - Information */}
          <div className="z-[9] sticky top-upperTertiaryStickyFold h-full min-w-[12rem] max-w-1/3 flex-shrink-0 overflow-auto overflow-x-auto bg-primary p-3">
            <div className="pb-2 text-zinc-400 text-[10px]">
              The authorization header will be automatically generated when you
              send the request.
            </div>
            <a
              href="https://docs.hoppscotch.io/documentation/features/authorization"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center text-zinc-300 focus:outline-none hover:text-white focus-visible:text-white flex-row-reverse text-[10px]"
              tabIndex="0">
              <svg viewBox="0 0 24 24" width="12" height="12" className="ml-1">
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

// Basic Auth Form Component
const BasicAuthForm = ({ config, onChange }) => {
  return (
    <div className="w-full border-t border-zinc-700">
      {/* Username Field */}
      <div className="flex flex-1 border-b border-zinc-700">
        <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem] text-xs font-medium py-3">
          Username
        </label>
        <div className="autocomplete-wrapper flex-1 relative">
          <div className="no-scrollbar flex flex-1 divide-x divide-zinc-700 overflow-x-auto">
            <div className="flex flex-1 truncate relative ph-no-capture">
              <CodeMirror
                value={config.username || ""}
                onChange={(value) => onChange("username", value)}
                placeholder="john_doe"
                theme={hoppscotchTheme}
                basicSetup={{
                  lineNumbers: false,
                  highlightActiveLine: false,
                  highlightSelectionMatches: false,
                  searchKeymap: false,
                  foldGutter: false,
                  dropCursor: false,
                  allowMultipleSelections: false,
                  indentOnInput: false,
                  bracketMatching: false,
                  closeBrackets: false,
                  autocompletion: false,
                  rectangularSelection: false,
                }}
                extensions={[]}
                className="flex-1 min-h-[2.75rem]"
                style={{
                  fontSize: '12px',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Password Field */}
      <div className="flex flex-1 border-b border-zinc-700">
        <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem] text-xs font-medium py-3">
          Password
        </label>
        <div className="autocomplete-wrapper flex-1 relative">
          <div className="no-scrollbar flex flex-1 divide-x divide-zinc-700 overflow-x-auto">
            <div className="flex flex-1 truncate relative ph-no-capture">
              <CodeMirror
                value={config.password || ""}
                onChange={(value) => onChange("password", value)}
                placeholder="Enter password"
                theme={hoppscotchTheme}
                basicSetup={{
                  lineNumbers: false,
                  highlightActiveLine: false,
                  highlightSelectionMatches: false,
                  searchKeymap: false,
                  foldGutter: false,
                  dropCursor: false,
                  allowMultipleSelections: false,
                  indentOnInput: false,
                  bracketMatching: false,
                  closeBrackets: false,
                  autocompletion: false,
                  rectangularSelection: false,
                }}
                extensions={[]}
                className="flex-1 min-h-[2.75rem]"
                style={{
                  fontSize: '12px',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bearer Token Form Component
const BearerTokenForm = ({ config, onChange }) => {
  return (
    <div className="p-3">
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Token
        </label>
        <input
          type="text"
          value={config.token || ""}
          onChange={(e) => onChange("token", e.target.value)}
          placeholder="Enter bearer token"
          className="w-full px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded 
                   text-zinc-100 placeholder-zinc-500
                   focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

// OAuth 2.0 Form Component - Enhanced with proper dropdowns
const OAuth2Form = ({ config, onChange, onNestedChange }) => {
  const [selectedGrantType, setSelectedGrantType] = useState(
    config.grantTypeInfo?.grantType || "AUTHORIZATION_CODE"
  );
  const [grantTypeDropdownOpen, setGrantTypeDropdownOpen] = useState(false);
  const [addToDropdownOpen, setAddToDropdownOpen] = useState(false);

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

  const getCurrentGrantTypeLabel = () => {
    return grantTypes.find(type => type.key === selectedGrantType)?.label || "Authorization Code";
  };

  const getCurrentAddToLabel = () => {
    return addToOptions.find(option => option.key === (config.addTo || "HEADERS"))?.label || "Headers";
  };

  return (
    <div className="p-3 space-y-3">
      {/* Add To */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Add Authorization To
        </label>
        <div className="relative">
          <button
            ref={addToButtonRef}
            onClick={(e) => toggleAddToDropdown(e)}
            className="w-full px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded 
                     text-zinc-100 text-left flex items-center justify-between
                     hover:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
          >
            <span>{addToOptions.find(opt => opt.key === (config.addTo || "HEADERS"))?.label || "Headers"}</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {addToDropdownOpen && createPortal(
            <div 
              data-dropdown
              className="fixed bg-zinc-800 border border-zinc-700 rounded shadow-lg z-50 min-w-[120px]"
              style={{
                top: `${addToButtonPosition.top}px`,
                left: `${addToButtonPosition.left}px`,
                width: `${addToButtonPosition.width}px`
              }}
            >
              {addToOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => {
                    onChange("addTo", option.key);
                    setAddToDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-zinc-100 hover:bg-zinc-700 first:rounded-t last:rounded-b"
                >
                  {option.label}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Grant Type */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Grant Type
        </label>
        <div className="relative">
          <button
            ref={grantTypeButtonRef}
            onClick={(e) => toggleGrantTypeDropdown(e)}
            className="w-full px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded 
                     text-zinc-100 text-left flex items-center justify-between
                     hover:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
          >
            <span>{grantTypes.find(type => type.key === selectedGrantType)?.label || "Authorization Code"}</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {grantTypeDropdownOpen && createPortal(
            <div 
              data-dropdown
              className="fixed bg-zinc-800 border border-zinc-700 rounded shadow-lg z-50 min-w-[200px]"
              style={{
                top: `${grantTypeButtonPosition.top}px`,
                left: `${grantTypeButtonPosition.left}px`,
                width: `${grantTypeButtonPosition.width}px`
              }}
            >
              {grantTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => {
                    handleGrantTypeChange(type.key);
                    setGrantTypeDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-zinc-100 hover:bg-zinc-700 first:rounded-t last:rounded-b"
                >
                  {type.label}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>
      </div>

      {/* Authorization Endpoint */}
      {selectedGrantType !== "CLIENT_CREDENTIALS" && (
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Authorization Endpoint
          </label>
          <input
            type="url"
            value={config.grantTypeInfo?.authEndpoint || ""}
            onChange={(e) =>
              onNestedChange("grantTypeInfo", "authEndpoint", e.target.value)
            }
            placeholder="https://auth.example.com/oauth/authorize"
            className="w-full px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded 
                     text-zinc-100 placeholder-zinc-500
                     focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Token Endpoint */}
      {(selectedGrantType === "AUTHORIZATION_CODE" ||
        selectedGrantType === "CLIENT_CREDENTIALS" ||
        selectedGrantType === "PASSWORD") && (
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Token Endpoint
          </label>
          <input
            type="url"
            value={config.grantTypeInfo?.tokenEndpoint || ""}
            onChange={(e) =>
              onNestedChange("grantTypeInfo", "tokenEndpoint", e.target.value)
            }
            placeholder="https://auth.example.com/oauth/token"
            className="w-full px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded 
                     text-zinc-100 placeholder-zinc-500
                     focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Client ID */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Client ID
        </label>
        <input
          type="text"
          value={config.grantTypeInfo?.clientID || ""}
          onChange={(e) =>
            onNestedChange("grantTypeInfo", "clientID", e.target.value)
          }
          placeholder="Enter client ID"
          className="w-full px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded 
                   text-zinc-100 placeholder-zinc-500
                   focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Client Secret */}
      {(selectedGrantType === "AUTHORIZATION_CODE" ||
        selectedGrantType === "CLIENT_CREDENTIALS" ||
        selectedGrantType === "PASSWORD") && (
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1.5">
            Client Secret
          </label>
          <input
            type="password"
            value={config.grantTypeInfo?.clientSecret || ""}
            onChange={(e) =>
              onNestedChange("grantTypeInfo", "clientSecret", e.target.value)
            }
            placeholder="Enter client secret"
            className="w-full px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded 
                     text-zinc-100 placeholder-zinc-500
                     focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Scopes */}
      <div>
        <label className="block text-xs font-medium text-zinc-400 mb-1.5">
          Scopes
        </label>
        <input
          type="text"
          value={config.grantTypeInfo?.scopes || ""}
          onChange={(e) =>
            onNestedChange("grantTypeInfo", "scopes", e.target.value)
          }
          placeholder="read write (space-separated)"
          className="w-full px-3 py-1.5 text-xs bg-zinc-800 border border-zinc-700 rounded 
                   text-zinc-100 placeholder-zinc-500
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Password Grant Type specific fields */}
      {selectedGrantType === "PASSWORD" && (
        <>
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={config.grantTypeInfo?.username || ""}
              onChange={(e) =>
                onNestedChange("grantTypeInfo", "username", e.target.value)
              }
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
              value={config.grantTypeInfo?.password || ""}
              onChange={(e) =>
                onNestedChange("grantTypeInfo", "password", e.target.value)
              }
              placeholder="Enter password"
              className="w-full px-3 py-2 text-xs bg-zinc-800 border border-zinc-700 rounded 
                       text-zinc-100 placeholder-zinc-500
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </>
      )}

      {/* PKCE option for Authorization Code */}
      {selectedGrantType === "AUTHORIZATION_CODE" && (
        <div className="flex items-center">
          <input
            type="checkbox"
            id="pkce"
            checked={config.grantTypeInfo?.isPKCE || false}
            onChange={(e) =>
              onNestedChange("grantTypeInfo", "isPKCE", e.target.checked)
            }
            className="w-4 h-4 text-green-600 bg-zinc-800 border-zinc-600 rounded 
                     focus:ring-green-500 focus:ring-2"
          />
          <label
            htmlFor="pkce"
            className="ml-2 text-xs font-medium text-zinc-300">
            Use PKCE (Proof Key for Code Exchange)
          </label>
        </div>
      )}

      {/* Access Token Display */}
      {config.grantTypeInfo?.token && (
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-2">
            Access Token
          </label>
          <div className="relative">
            <input
              type="text"
              value={config.grantTypeInfo.token}
              readOnly
              className="w-full px-3 py-2 text-xs bg-zinc-700 border border-zinc-600 rounded 
                       text-zinc-300 cursor-not-allowed"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-green-400">
              ✓ Token received
            </span>
          </div>
        </div>
      )}

      {/* OAuth2 Action Buttons */}
      <div className="pt-2 border-t border-zinc-700">
        <button
          type="button"
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded 
                   transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500">
          Get Access Token
        </button>
      </div>
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
