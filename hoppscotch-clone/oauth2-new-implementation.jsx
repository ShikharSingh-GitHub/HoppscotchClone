// New OAuth2Form implementation with professional Hoppscotch styling

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
    <div className="w-2/3 border-r border-dividerLight">
      {/* Token Field */}
      <div className="w-full">
        <div className="flex flex-1 border-b border-dividerLight">
          <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem]">
            Token
          </label>
          <div className="autocomplete-wrapper">
            <div className="no-scrollbar absolute inset-0 flex flex-1 divide-x divide-dividerLight overflow-x-auto">
              <div className="flex flex-1 truncate relative ph-no-capture">
                <CodeMirror
                  value={config.token || ""}
                  onChange={(value) => onChange("token", value)}
                  placeholder="Your OAuth 2.0 Token (e.g. sk_live_abc123xyz789)"
                  theme={hoppscotchTheme}
                  basicSetup={{
                    lineNumbers: false,
                    foldGutter: false,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    indentOnInput: false,
                    bracketMatching: false,
                    closeBrackets: false,
                    autocompletion: false,
                    searchKeymap: false,
                    rectangularSelection: false,
                  }}
                  extensions={[]}
                  className="flex-1 min-h-[2.75rem]"
                  style={{ fontSize: "12px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grant Type Dropdown */}
      <div className="flex items-center px-4 border-b border-dividerLight">
        <label className="truncate font-semibold text-secondaryLight">
          Grant Type
        </label>
        <span className="!flex-initial" aria-expanded="false">
          <div className="select-wrapper">
            <span className="text-xs down-icon">
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
              ref={grantTypeButtonRef}
              onClick={(e) => toggleGrantTypeDropdown(e)}
              className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark rounded px-4 py-2 ml-2 rounded-none pr-8"
              tabIndex="0">
              <span className="inline-flex items-center justify-center whitespace-nowrap">
                <div className="truncate max-w-[16rem]">
                  {getCurrentGrantTypeLabel()}
                </div>
              </span>
            </button>
          </div>
        </span>
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
                  className="w-full px-3 py-2 text-left text-xs text-zinc-100 hover:bg-zinc-700 first:rounded-t last:rounded-b">
                  {type.label}
                </button>
              ))}
            </div>,
            document.body
          )}
      </div>

      {/* Conditional Fields Container */}
      <div className="flex flex-col">
        {/* PKCE Checkbox for Authorization Code */}
        {selectedGrantType === "AUTHORIZATION_CODE" && (
          <div className="flex flex-1 border-b border-dividerLight">
            <div className="px-4 py-2 flex items-center">
              <span className="text-secondaryLight font-semibold mr-6">
                Use PKCE
              </span>
              <div
                className="group inline-flex cursor-pointer flex-nowrap items-center justify-center transition hover:text-secondaryDark text-secondaryLight flex"
                role="checkbox"
                aria-checked="false">
                <input
                  id="checkbox-pkce"
                  type="checkbox"
                  name="checkbox"
                  className="checkbox"
                  checked={config.grantTypeInfo?.usePKCE || false}
                  onChange={(e) =>
                    onNestedChange("grantTypeInfo", "usePKCE", e.target.checked)
                  }
                />
                <label
                  htmlFor="checkbox-pkce"
                  className="cursor-pointer truncate pl-0 align-middle font-semibold"></label>
              </div>
            </div>
          </div>
        )}

        {/* Authorization Endpoint */}
        {selectedGrantType !== "CLIENT_CREDENTIALS" && (
          <div className="flex flex-1 border-b border-dividerLight">
            <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem]">
              Authorization Endpoint
            </label>
            <div className="autocomplete-wrapper px-4">
              <div className="no-scrollbar absolute inset-0 flex flex-1 divide-x divide-dividerLight overflow-x-auto">
                <div className="flex flex-1 truncate relative ph-no-capture">
                  <CodeMirror
                    value={config.grantTypeInfo?.authEndpoint || ""}
                    onChange={(value) =>
                      onNestedChange("grantTypeInfo", "authEndpoint", value)
                    }
                    placeholder="https://example.com/oauth2/authorize"
                    theme={hoppscotchTheme}
                    basicSetup={{
                      lineNumbers: false,
                      foldGutter: false,
                      dropCursor: false,
                      allowMultipleSelections: false,
                      indentOnInput: false,
                      bracketMatching: false,
                      closeBrackets: false,
                      autocompletion: false,
                      searchKeymap: false,
                      rectangularSelection: false,
                    }}
                    extensions={[]}
                    className="flex-1 min-h-[2.75rem]"
                    style={{ fontSize: "12px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Token Endpoint */}
        {(selectedGrantType === "AUTHORIZATION_CODE" ||
          selectedGrantType === "CLIENT_CREDENTIALS" ||
          selectedGrantType === "PASSWORD") && (
          <div className="flex flex-1 border-b border-dividerLight">
            <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem]">
              Token Endpoint
            </label>
            <div className="autocomplete-wrapper px-4">
              <div className="no-scrollbar absolute inset-0 flex flex-1 divide-x divide-dividerLight overflow-x-auto">
                <div className="flex flex-1 truncate relative ph-no-capture">
                  <CodeMirror
                    value={config.grantTypeInfo?.tokenEndpoint || ""}
                    onChange={(value) =>
                      onNestedChange("grantTypeInfo", "tokenEndpoint", value)
                    }
                    placeholder="https://example.com/oauth2/token"
                    theme={hoppscotchTheme}
                    basicSetup={{
                      lineNumbers: false,
                      foldGutter: false,
                      dropCursor: false,
                      allowMultipleSelections: false,
                      indentOnInput: false,
                      bracketMatching: false,
                      closeBrackets: false,
                      autocompletion: false,
                      searchKeymap: false,
                      rectangularSelection: false,
                    }}
                    extensions={[]}
                    className="flex-1 min-h-[2.75rem]"
                    style={{ fontSize: "12px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client ID */}
        <div className="flex flex-1 border-b border-dividerLight">
          <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem]">
            Client ID
          </label>
          <div className="autocomplete-wrapper px-4">
            <div className="no-scrollbar absolute inset-0 flex flex-1 divide-x divide-dividerLight overflow-x-auto">
              <div className="flex flex-1 truncate relative ph-no-capture">
                <CodeMirror
                  value={config.grantTypeInfo?.clientID || ""}
                  onChange={(value) =>
                    onNestedChange("grantTypeInfo", "clientID", value)
                  }
                  placeholder="your_client_id_here"
                  theme={hoppscotchTheme}
                  basicSetup={{
                    lineNumbers: false,
                    foldGutter: false,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    indentOnInput: false,
                    bracketMatching: false,
                    closeBrackets: false,
                    autocompletion: false,
                    searchKeymap: false,
                    rectangularSelection: false,
                  }}
                  extensions={[]}
                  className="flex-1 min-h-[2.75rem]"
                  style={{ fontSize: "12px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Client Secret */}
        {(selectedGrantType === "AUTHORIZATION_CODE" ||
          selectedGrantType === "CLIENT_CREDENTIALS" ||
          selectedGrantType === "PASSWORD") && (
          <div className="flex flex-1 border-b border-dividerLight">
            <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem]">
              Client Secret
            </label>
            <div className="autocomplete-wrapper px-4">
              <div className="no-scrollbar absolute inset-0 flex flex-1 divide-x divide-dividerLight overflow-x-auto">
                <div className="flex flex-1 truncate relative ph-no-capture">
                  <CodeMirror
                    value={config.grantTypeInfo?.clientSecret || ""}
                    onChange={(value) =>
                      onNestedChange("grantTypeInfo", "clientSecret", value)
                    }
                    placeholder="your_client_secret_here"
                    theme={hoppscotchTheme}
                    basicSetup={{
                      lineNumbers: false,
                      foldGutter: false,
                      dropCursor: false,
                      allowMultipleSelections: false,
                      indentOnInput: false,
                      bracketMatching: false,
                      closeBrackets: false,
                      autocompletion: false,
                      searchKeymap: false,
                      rectangularSelection: false,
                    }}
                    extensions={[]}
                    className="flex-1 min-h-[2.75rem]"
                    style={{ fontSize: "12px" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scopes */}
        <div className="flex flex-1 border-b border-dividerLight">
          <label className="flex items-center ml-4 text-secondaryLight min-w-[6rem]">
            Scopes
          </label>
          <div className="autocomplete-wrapper px-4">
            <div className="no-scrollbar absolute inset-0 flex flex-1 divide-x divide-dividerLight overflow-x-auto">
              <div className="flex flex-1 truncate relative ph-no-capture">
                <CodeMirror
                  value={config.grantTypeInfo?.scopes || ""}
                  onChange={(value) =>
                    onNestedChange("grantTypeInfo", "scopes", value)
                  }
                  placeholder="read write"
                  theme={hoppscotchTheme}
                  basicSetup={{
                    lineNumbers: false,
                    foldGutter: false,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    indentOnInput: false,
                    bracketMatching: false,
                    closeBrackets: false,
                    autocompletion: false,
                    searchKeymap: false,
                    rectangularSelection: false,
                  }}
                  extensions={[]}
                  className="flex-1 min-h-[2.75rem]"
                  style={{ fontSize: "12px" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pass By Dropdown */}
        <div className="flex items-center border-b border-dividerLight">
          <span className="flex items-center">
            <label className="ml-4 text-secondaryLight">Pass by</label>
            <span aria-expanded="false">
              <div className="select-wrapper">
                <span className="text-xs down-icon">
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
                  ref={addToButtonRef}
                  onClick={(e) => toggleAddToDropdown(e)}
                  className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark rounded px-4 py-2 ml-2 rounded-none pr-8"
                  tabIndex="0">
                  <span className="inline-flex items-center justify-center whitespace-nowrap">
                    <div className="truncate max-w-[16rem]">
                      {getCurrentAddToLabel()}
                    </div>
                  </span>
                </button>
              </div>
            </span>
          </span>
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
                    className="w-full px-3 py-2 text-left text-xs text-zinc-100 hover:bg-zinc-700 first:rounded-t last:rounded-b">
                    {option.label}
                  </button>
                ))}
              </div>,
              document.body
            )}
        </div>

        {/* Advanced Configuration Section */}
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
          {/* Advanced sections would be implemented here when expanded */}
        </div>
      </div>

      {/* Action Buttons */}
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
  );
};
