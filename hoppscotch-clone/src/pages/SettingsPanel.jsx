import {
  Check,
  ChevronDown,
  Cloud,
  Globe,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import React, { useState } from "react";

const SettingsPanel = () => {
  const [selectedQuery, setSelectedQuery] = useState("Enable");
  const [selectedInterceptor, setSelectedInterceptor] = useState("Browser");
  const [selectedTheme, setSelectedTheme] = useState(0); // 0 = System/Monitor
  const [selectedAccentColor, setSelectedAccentColor] = useState(0); // 0 = Green
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedNamingStyle, setSelectedNamingStyle] = useState(
    "Descriptive With Spaces"
  );
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isNamingStyleOpen, setIsNamingStyleOpen] = useState(false);

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Korean",
    "Portuguese",
    "Russian",
    "Arabic",
  ];

  const namingStyles = [
    "Descriptive With Spaces",
    "camelCase",
    "snake_case",
    "kebab-case",
    "PascalCase",
    "UPPERCASE",
  ];

  return (
    <div className="w-full h-full overflow-y-auto bg-primary text-white">
      <div className="p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column (Heading) */}
          <div className="md:col-span-1">
            <h1 className="text-lg font-semibold mb-2 text-white">General</h1>
            <p className="text-zinc-400 text-xs">
              General settings used in the application
            </p>
          </div>

          {/* Right Column (Settings) */}
          <div className="md:col-span-2 space-y-8">
            {/* Language */}
            <div className="relative">
              <h2 className="text-sm font-semibold mb-3 text-white">
                Language
              </h2>
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="bg-search-bg border border-zinc-700 px-4 py-2 rounded flex items-center justify-between w-48 text-zinc-300 hover:text-white hover:bg-search-bg-hover transition-colors text-xs">
                  <div className="flex items-center gap-2">
                    <Globe size={16} />
                    {selectedLanguage}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isLanguageOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isLanguageOpen && (
                  <div className="absolute top-full left-0 w-48 mt-1 bg-search-bg border border-zinc-700 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                    {languages.map((language) => (
                      <button
                        key={language}
                        onClick={() => {
                          setSelectedLanguage(language);
                          setIsLanguageOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-zinc-300 hover:text-white hover:bg-search-bg-hover transition-colors flex items-center justify-between">
                        <span>{language}</span>
                        {selectedLanguage === language && (
                          <Check size={14} className="text-btn" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Query Parameters Encoding */}
            <div>
              <h2 className="text-sm font-semibold mb-3 text-white">
                Query Parameters Encoding
              </h2>
              <p className="text-zinc-400 mb-4 text-xs">
                Configure encoding for query parameters in requests
              </p>
              <div className="space-y-3">
                {["Enable", "Disable", "Auto"].map((opt, i) => (
                  <label
                    key={i}
                    className="flex items-center space-x-3 text-zinc-300 hover:text-white cursor-pointer text-xs"
                    onClick={() => setSelectedQuery(opt)}>
                    <div className="relative w-4 h-4">
                      <input
                        type="radio"
                        name="query"
                        value={opt}
                        checked={selectedQuery === opt}
                        onChange={() => setSelectedQuery(opt)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-colors ${
                          selectedQuery === opt
                            ? "border-btn bg-btn"
                            : "border-zinc-600 bg-transparent"
                        }`}>
                        {selectedQuery === opt && (
                          <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>
                    <span className="font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experiments */}
            <div>
              <h2 className="text-sm font-semibold mb-3 text-white">
                Experiments
              </h2>
              <p className="text-zinc-400 mb-6 text-xs">
                This is a collection of experiments we're working on that might
                turn out to be useful, fun, both, or neither. They're not final
                and may not be stable, so if something overly weird happens,
                don't panic. Just turn the dang thing off. Jokes aside,{" "}
                <span className="text-btn underline cursor-pointer hover:text-btn-hover">
                  Contact us
                </span>
                .
              </p>
              <div className="space-y-4">
                <Toggle label="Telemetry" defaultChecked={true} />
                <Toggle label="Expand navigation" defaultChecked={false} />
                <Toggle label="Sidebar on left" defaultChecked={false} />
                <Toggle label="AI Experiments" defaultChecked={true} />
              </div>
            </div>

            {/* Request Naming Style */}
            <div className="relative">
              <h2 className="text-sm font-semibold mb-3 text-white">
                Request Naming Style
              </h2>
              <div className="relative">
                <button
                  onClick={() => setIsNamingStyleOpen(!isNamingStyleOpen)}
                  className="bg-search-bg border border-zinc-700 px-4 py-2 rounded flex items-center justify-between w-64 text-zinc-300 hover:text-white hover:bg-search-bg-hover transition-colors text-xs">
                  <span>{selectedNamingStyle}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isNamingStyleOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isNamingStyleOpen && (
                  <div className="absolute top-full left-0 w-64 mt-1 bg-search-bg border border-zinc-700 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
                    {namingStyles.map((style) => (
                      <button
                        key={style}
                        onClick={() => {
                          setSelectedNamingStyle(style);
                          setIsNamingStyleOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs text-zinc-300 hover:text-white hover:bg-search-bg-hover transition-colors flex items-center justify-between">
                        <span>{style}</span>
                        {selectedNamingStyle === style && (
                          <Check size={14} className="text-btn" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Experimental scripting */}
            <div>
              <Toggle
                label="Experimental scripting sandbox"
                defaultChecked={true}
              />
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="md:col-span-1">
            <h1 className="text-lg font-semibold mb-2 text-white">Theme</h1>
            <p className="text-zinc-400 text-xs">
              Customize your application theme.
            </p>
          </div>

          <div className="md:col-span-2 space-y-8">
            {/* Background Theme */}
            <div>
              <h2 className="text-sm font-semibold mb-2 text-white">
                Background
              </h2>
              <p className="text-zinc-400 mb-4 text-xs">
                {["System (Dark)", "Light", "Cloud", "Dark"][selectedTheme]}
              </p>
              <div className="flex items-center gap-4">
                {[
                  { icon: Monitor, name: "System" },
                  { icon: Sun, name: "Light" },
                  { icon: Cloud, name: "Cloud" },
                  { icon: Moon, name: "Dark" },
                ].map((theme, i) => {
                  const IconComponent = theme.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedTheme(i)}
                      className={`p-2 rounded transition-colors ${
                        selectedTheme === i
                          ? "border border-btn text-btn hover:bg-btn hover:text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}>
                      <IconComponent size={20} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Color Picker */}
            <div>
              <h2 className="text-sm font-semibold mb-2 text-white">
                Accent color
              </h2>
              <p className="text-zinc-400 mb-4 text-xs">
                {
                  [
                    "Green",
                    "Cyan",
                    "Blue",
                    "Indigo",
                    "Purple",
                    "Yellow",
                    "Orange",
                    "Red",
                    "Pink",
                  ][selectedAccentColor]
                }
              </p>
              <div className="flex items-center gap-3">
                {[
                  { color: "text-green-500", name: "Green" },
                  { color: "text-cyan-500", name: "Cyan" },
                  { color: "text-blue-500", name: "Blue" },
                  { color: "text-indigo-500", name: "Indigo" },
                  { color: "text-purple-500", name: "Purple" },
                  { color: "text-yellow-500", name: "Yellow" },
                  { color: "text-orange-500", name: "Orange" },
                  { color: "text-red-500", name: "Red" },
                  { color: "text-pink-500", name: "Pink" },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAccentColor(i)}
                    className={`${
                      item.color
                    } w-6 h-6 hover:scale-110 focus:outline-none transition-transform relative ${
                      selectedAccentColor === i ? "scale-110" : ""
                    }`}
                    title={item.name}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-full h-full">
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
                      {/* Selected indicator - filled circle */}
                      {selectedAccentColor === i && (
                        <circle
                          cx="12"
                          cy="12"
                          r="6"
                          fill="currentColor"
                          opacity="0.3"
                        />
                      )}
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interceptor Section */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pb-8">
          <div className="md:col-span-1">
            <h1 className="text-lg font-semibold mb-2 text-white">
              Interceptor
            </h1>
            <p className="text-zinc-400 text-xs">
              Middleware between application and APIs.
            </p>
          </div>

          <div className="md:col-span-2 space-y-8">
            {/* Interceptor Options */}
            <div>
              <h2 className="text-sm font-semibold mb-3 text-white">
                Interceptor
              </h2>
              <div className="space-y-3">
                {["Browser", "Proxy", "Agent", "Browser extension"].map(
                  (opt, i) => (
                    <label
                      key={i}
                      className="flex items-center space-x-3 text-zinc-300 hover:text-white cursor-pointer text-xs"
                      onClick={() => setSelectedInterceptor(opt)}>
                      <div className="relative w-4 h-4">
                        <input
                          type="radio"
                          name="interceptor"
                          value={opt}
                          checked={selectedInterceptor === opt}
                          onChange={() => setSelectedInterceptor(opt)}
                          className="sr-only"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border-2 transition-colors ${
                            selectedInterceptor === opt
                              ? "border-btn bg-btn"
                              : "border-zinc-600 bg-transparent"
                          }`}>
                          {selectedInterceptor === opt && (
                            <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      </div>
                      <span className="font-medium">{opt}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Proxy Info */}
            <div>
              <h2 className="text-sm font-semibold mb-2 text-white">Proxy</h2>
              <p className="text-zinc-400 mb-4 text-xs">
                Official Proxy is hosted by Hoppscotch. Read the{" "}
                <span className="text-btn underline cursor-pointer hover:text-btn-hover">
                  Proxy privacy policy
                </span>
                .
              </p>
              <div className="relative">
                <label className="text-xs text-zinc-400 absolute -top-2 left-3 bg-primary px-1 font-medium">
                  Proxy URL
                </label>
                <input
                  type="text"
                  readOnly
                  value="https://proxy.hoppscotch.io/"
                  className="w-full bg-search-bg border border-zinc-700 rounded px-4 py-3 mt-2 text-zinc-300 focus:outline-none focus:border-btn text-xs font-medium"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    className="fill-current">
                    <path d="M4 12a8 8 0 0 1 8-8V2.5L16 6l-4 3.5V8a6 6 0 0 0-6 6c0 1 .23 1.94.64 2.78L3.46 18a8 8 0 0 1-.46-6Zm8 8a8 8 0 0 0 8-8v-1.5L24 14l-4 3.5V16a6 6 0 0 1-6 6c-1 0-1.94-.23-2.78-.64L12.54 20a8 8 0 0 0 7.46 0Z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Agent Section */}
            <div>
              <h2 className="text-sm font-semibold mb-3 text-white">Agent</h2>
              <p className="text-sm font-semibold mb-4 text-zinc-300">
                Global Defaults
              </p>
              <div className="space-y-4">
                <Toggle label="Verify Host" defaultChecked={true} />
                <Toggle label="Verify Peer" defaultChecked={true} />
              </div>

              <div className="flex gap-4 mt-6">
                <button className="flex items-center gap-2 border border-zinc-700 px-4 py-2 rounded text-xs text-zinc-300 hover:text-white hover:bg-search-bg-hover transition-colors font-medium">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    className="fill-current">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                  </svg>
                  CA Certificates
                </button>
                <button className="flex items-center gap-2 border border-zinc-700 px-4 py-2 rounded text-xs text-zinc-300 hover:text-white hover:bg-search-bg-hover transition-colors font-medium">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    className="fill-current">
                    <path d="M13 9h5.5L13 3.5V9M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.1.9-2 2-2m9 16v-2H6v2h9m3-4v-2H6v2h12Z" />
                  </svg>
                  Client Certificates
                </button>
              </div>

              <div className="mt-6">
                <Toggle label="Proxy" defaultChecked={false} />
              </div>

              <p className="text-zinc-400 text-xs mt-4">
                Hoppscotch Agent and Desktop App supports HTTP/HTTPS/SOCKS
                proxies with NTLM and Basic Auth support.
              </p>
            </div>

            {/* Browser Extension */}
            <div>
              <h2 className="text-sm font-semibold mb-3 text-white">
                Browser extension
              </h2>
              <p className="text-zinc-400 text-xs mb-4">
                Extension Version: Not Reported
              </p>
              <div className="flex gap-4">
                <button className="flex py-3 px-4 gap-3 items-center border border-zinc-700 text-zinc-300 hover:text-white hover:bg-search-bg-hover rounded transition-colors text-xs font-medium">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 48 48">
                    <path
                      fill="#4caf50"
                      d="M44,24c0,11.044-8.956,20-20,20S4,35.044,4,24S12.956,4,24,4S44,12.956,44,24z"
                    />
                    <path
                      fill="#ffc107"
                      d="M24,4v20l8,4l-8.843,16c0.317,0,0.526,0,0.843,0c11.053,0,20-8.947,20-20S35.053,4,24,4z"
                    />
                    <path
                      fill="#f44336"
                      d="M41.84,15H24v13l-3-1L7.16,13.26H7.14C10.68,7.69,16.91,4,24,4C31.8,4,38.55,8.48,41.84,15z"
                    />
                    <path
                      fill="#fff"
                      d="M33,24c0,4.969-4.031,9-9,9s-9-4.031-9-9s4.031-9,9-9S33,19.031,33,24z"
                    />
                    <path
                      fill="#2196f3"
                      d="M31,24c0,3.867-3.133,7-7,7s-7-3.133-7-7s3.133-7,7-7S31,20.133,31,24z"
                    />
                  </svg>
                  Chrome
                </button>
                <button className="flex py-3 px-4 gap-3 items-center border border-zinc-700 text-zinc-300 hover:text-white hover:bg-search-bg-hover rounded transition-colors text-xs font-medium">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 256 256"
                    xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient
                        id="firefox-gradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%">
                        <stop offset="0%" stopColor="#FF9500" />
                        <stop offset="50%" stopColor="#FF5722" />
                        <stop offset="100%" stopColor="#FF3D00" />
                      </linearGradient>
                    </defs>
                    <path
                      fill="url(#firefox-gradient)"
                      d="M235.5,188.6c1-1.4,2.4-6,3.6-8.1c7.4-12,7.5-21.5,7.5-21.7c4.5-22.3,4.1-31.5,1.3-48.3
                      c-2.2-13.6-11.9-33.1-20.3-42.4c-8.6-9.7-2.6-6.5-10.9-13.6c-7.3-8.1-14.5-16.2-18.3-19.4c-28-23.4-27.4-28.4-26.8-29.2
                      c-0.1,0.1-0.2,0.2-0.4,0.4c-0.3-1.3-0.6-2.4-0.6-2.4S155.2,19.1,152,44.6c-2.1,16.6,4.1,34,13.2,45.1c4.7,5.8,10,11,15.8,15.6l0,0
                      c6.8,9.8,10.6,21.9,10.6,34.9c0,32.6-26.4,58.9-59,58.9c-4.4,0-8.9-0.5-13.2-1.5c-15.4-2.9-24.2-10.7-28.7-16
                      c-2.5-3-3.6-5.2-3.6-5.2c13.8,4.9,29,3.9,38.3-1.2c9.3-5.2,15-9,19.6-7.5c4.5,1.5,8.1-2.9,4.9-7.4c-3.2-4.5-11.4-11-23.6-9.2
                      c-9.3,1.4-17.9,8-30.1,1.6c-0.8-0.4-1.6-0.9-2.3-1.3c-0.8-0.5,2.6,0.7,1.8,0.2c-2.4-1.2-6.6-3.7-7.7-4.6c-0.2-0.2,1.8,0.6,1.7,0.4
                      c-11.4-8.4-10-14.1-9.7-17.7c0.3-2.9,2.4-6.5,5.9-8c1.7,0.8,2.7,1.5,2.7,1.5s-0.7-1.3-1.1-2c0.1-0.1,0.3,0,0.4-0.1
                      c1.4,0.6,4.5,2.1,6.1,3.1c2.1,1.3,2.8,2.5,2.8,2.5s0.6-0.3,0.1-1.4c-0.2-0.5-0.8-2-2.9-3.5h0.1c1.2,0.6,2.4,1.4,3.5,2.2
                      c0.6-1.9,1.6-3.9,1.4-7.5c-0.1-2.5-0.1-3.2-0.6-4.1c-0.4-0.8,0.2-1.2,1-0.3c-0.1-0.7-0.4-1.3-0.7-2V110c1-3,20.3-10.8,21.7-11.7
                      c2.3-1.4,4.2-3.3,5.7-5.5c1.1-1.5,1.9-3.7,2.1-7c0.1-1.5-0.4-2.6-5.5-3.8c-3.1-0.7-7.8-1.3-15.2-2c-5.3-0.5-8.5-3.9-10.3-7.1
                      c-0.3-0.7-0.7-1.3-1-1.9c-0.3-0.7-0.6-1.5-0.8-2.2c3.2-8.4,9-15.5,16.5-20.4c0.4-0.4-1.7,0.1-1.3-0.3c0.5-0.4,3.8-1.6,4.4-1.9
                      c0.8-0.3-3.2-1.8-6.8-1.5c-3.6,0.4-4.3,0.7-6.3,1.5c0.8-0.7,3.3-1.6,2.7-1.6C101,45,96.2,47,92.1,49.3c0-0.4,0.1-0.8,0.2-1.2
                      c-1.9,0.7-6.6,3.7-8,6.2c0.1-0.5,0.1-1,0.1-1.4c-1.4,1.1-2.8,2.3-3.9,3.7l-0.1,0.1c-11.1-4-20.9-4.3-29.1-2.5
                      c-1.8-1.6-4.7-4.1-8.8-12.2c-0.3-0.5-0.4,1-0.6,0.5c-1.6-3.7-2.6-9.8-2.4-14c0,0-3.3,1.5-6,7.8c-0.5,1.1-0.8,1.8-1.2,2.4
                      c-0.2,0.2,0.3-2.1,0.3-1.9c-0.5,0.8-1.7,1.9-2.2,3.4c-0.4,1.1-0.9,1.7-1.2,3l-0.1,0.1c0-0.4,0.1-1.6,0-1.4c-1.3,2.6-2.4,5.3-3.3,8
                      c-1.5,4.8-3.2,11.4-3.5,20c-0.1,0.6,0,1.4-0.1,2c-3.5,4-5.9,7.4-6.8,9.1c-4.5,7-9.5,17.8-14.3,35c2.1-4.7,4.7-9.2,7.7-13.4
                      c-4,9.1-7.9,23.5-8.7,45.5c1-4.6,2.2-9.1,3.7-13.5c-0.7,14.7,1,33,10.3,53.6c5.5,12.1,18.2,36.7,49.3,55.9l0,0
                      c0,0,10.6,7.9,28.7,13.8c1.3,0.5,2.7,1,4.1,1.4c-0.4-0.2-0.9-0.4-1.3-0.5c12.1,3.6,24.6,5.5,37.3,5.5c47,0,60.9-18.9,60.9-18.9
                      l-0.1,0.1c0.7-0.6,1.3-1.3,1.9-1.9c-7.4,7-24.4,7.5-30.7,7c10.8-3.2,17.9-5.9,31.7-11.1c1.6-0.6,3.3-1.3,5-2.1l0.5-0.3
                      c0.3-0.2,0.7-0.3,1-0.5c6.7-3.2,13.1-7.1,18.9-11.8c13.9-11.1,16.9-21.9,18.5-29c-0.2,0.7-0.9,2.3-1.4,3.3
                      c-3.6,7.6-11.5,12.4-20.1,16.4c4.1-5.4,7.9-11,11.4-16.8C232.5,195.9,233.3,191.5,235.5,188.6z"
                    />
                  </svg>
                  Firefox
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Toggle = ({ label, defaultChecked }) => {
  const [isOn, setIsOn] = useState(defaultChecked);

  const handleToggle = (e) => {
    e.preventDefault();
    setIsOn(!isOn);
  };

  return (
    <div
      className="flex items-center space-x-3 cursor-pointer select-none group"
      onClick={handleToggle}>
      {/* Toggle Switch */}
      <div className="relative">
        <input
          type="checkbox"
          checked={isOn}
          onChange={handleToggle}
          className="sr-only"
        />
        {/* Track */}
        <div
          className={`w-10 h-6 rounded-full transition-colors duration-200 ${
            isOn ? "bg-btn" : "bg-zinc-800 border border-zinc-700"
          }`}
        />
        {/* Thumb */}
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transform transition-transform duration-200 shadow-sm ${
            isOn ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </div>

      {/* Label */}
      <span className="text-xs text-zinc-300 group-hover:text-white transition-colors font-medium">
        {label}
      </span>
    </div>
  );
};

export default SettingsPanel;
