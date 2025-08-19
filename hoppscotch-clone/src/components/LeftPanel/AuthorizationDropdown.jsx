// Simple Authorization Dropdown Component
import { useEffect, useRef, useState } from "react";
import { useRequestStore } from "../../store/store";

const AuthorizationDropdown = () => {
  const { currentRequest, updateRequest } = useRequestStore();
  const [authConfig, setAuthConfig] = useState(
    currentRequest?.auth || { authType: "none", authActive: true }
  );
  const [selectedAuthType, setSelectedAuthType] = useState(
    authConfig.authType || "none"
  );
  const [isEnabled, setIsEnabled] = useState(authConfig.authActive !== false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
      // Only close if the dropdown is open and the click is outside
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        console.log("Clicking outside dropdown, closing...");
        setDropdownOpen(false);
      }
    };

    // Only add listener when dropdown is open
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleAuthTypeChange = (authType) => {
    console.log("Auth type changed to:", authType);
    setSelectedAuthType(authType);
    setDropdownOpen(false);

    let newAuthConfig = { authType, authActive: isEnabled };

    // Initialize specific configs based on auth type
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
          grantType: "authorization_code",
          authUrl: "",
          accessTokenUrl: "",
          clientId: "",
          scope: "",
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
      // Add other auth types as needed
    }

    console.log("Setting new auth config:", newAuthConfig);
    setAuthConfig(newAuthConfig);
    updateRequest({ auth: newAuthConfig });
  };

  return (
    <div className="sticky top-0 z-10 flex flex-shrink-0 items-center justify-between overflow-x-auto border-b border-zinc-700/30 bg-primary pl-4">
      <span className="flex items-center">
        <label className="truncate font-semibold text-zinc-300 text-xs">
          Authorization Type
        </label>

        <div className="relative ml-2" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log(
                "Dropdown button clicked. Current state:",
                dropdownOpen
              );
              setDropdownOpen(!dropdownOpen);
            }}
            className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark rounded px-4 py-2 bg-primaryLight hover:bg-primaryDark focus-visible:bg-primaryDark"
            tabIndex="0">
            <span className="inline-flex items-center justify-center whitespace-nowrap">
              <svg
                viewBox="0 0 24 24"
                width="1.2em"
                height="1.2em"
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
            <div className="absolute top-full left-0 mt-1 bg-primary border border-dividerLight rounded-md shadow-xl z-[9999] min-w-[200px] max-h-[300px] overflow-y-auto">
              {authTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Dropdown option clicked:", type.key);
                    handleAuthTypeChange(type.key);
                  }}
                  className="w-full flex items-center text-left px-3 py-2 text-secondary hover:bg-primaryLight hover:text-secondaryDark transition-colors first:rounded-t-md last:rounded-b-md">
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
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="checkbox"
          />
          <label className="cursor-pointer truncate pl-0 align-middle font-semibold text-xs ml-1">
            Enabled
          </label>
        </div>
      </div>
    </div>
  );
};

export default AuthorizationDropdown;
