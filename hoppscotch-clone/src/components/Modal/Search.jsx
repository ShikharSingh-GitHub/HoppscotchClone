import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  CornerUpLeft,
  Search,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";

const demoFiles = [
  { id: 1, name: "Frontend developer with 3 years of experience" },
  { id: 2, name: "Skills React, TypeScript, Tailwind CSS, Bootstrap..." },
  { id: 3, name: "Good at crating seamless UI" },
  { id: 4, name: "Hard worker and good problem solver" },
  { id: 5, name: "Believer" },
];

const SearchModal = ({ onClose }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const debounceTimer = useRef(null); // Timer ref

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Debounce the search keyword
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword);
    }, 100);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchKeyword]);

  // Filter files based on the debounced search keyword
  useEffect(() => {
    if (debouncedSearchKeyword) {
      const results = demoFiles.filter((file) =>
        file.name.toLowerCase().includes(debouncedSearchKeyword.toLowerCase())
      );
      setFilteredFiles(results);
      setSearchNotFound(results.length === 0); // Set "search not found" if no results
    } else {
      setFilteredFiles([]);
      setSearchNotFound(false);
    }
  }, [debouncedSearchKeyword]);

  return (
    <>
      <div
        onClick={() => onClose()}
        className="bg-neutral-800/50 fixed z-30 top-0 left-0 w-full h-[100dvh]"
      ></div>

      <div className="fixed z-40 w-full">
        <div className="flex justify-center">
          <div
            className={`relative lg:w-[35%] w-[95%] h-auto bg-primary border-2 border-search-bg rounded-2xl mt-16`}
          >
            <div className="lg:px-6 lg:py-5 py-7 px-5 border-b border-search-bg">
              <input
                type="text"
                className="w-full focus:outline-none text font-semibold placeholder:text-zinc-500"
                placeholder="Type a command or search..."
                autoFocus
                onChange={(e) => setSearchKeyword(e.currentTarget.value)}
                value={searchKeyword}
              />
            </div>

            {/* Display search results */}
            {searchKeyword && (
              <div className="px-5 py-2">
                <p className="text-xs text-zinc-500 font-semibold mb-2">
                  Documentation
                </p>
                {searchNotFound ? (
                  <div className="flex justify-center items-center">
                    <div className="text-center">
                      <p className="text-gray-500 flex justify-center w-full mb-1">
                        <Search size={19} className="" />
                      </p>

                      <p className="text-zinc-500 text-[12px] font-semibold">
                        Nothing found for "${searchKeyword}"
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredFiles.length > 0 && (
                    <div className="space-y-2">
                      {filteredFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex space-x-2 hover:bg-stone-800 p-2 rounded cursor-pointer"
                        >
                          <button className="text-zinc-300">
                            <ArrowUpRight size={16} />
                          </button>
                          <p className="text-zinc-300 font-semibold hover:text-white text-xs">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            )}

            <div className="flex justify-between p-5">
              <div className="flex space-x-2">
                <p className="text-zinc-500 bg-stone-800 rounded p-[2px]">
                  <ArrowUp size={15} />
                </p>
                <p className="text-zinc-500 bg-stone-800 rounded p-[2px]">
                  <ArrowDown size={15} />
                </p>
                <p className="text-xs text-zinc-500 font-semibold">
                  to navigate
                </p>
                <p className="text-zinc-500 bg-stone-800 rounded p-[2px]">
                  <CornerUpLeft size={15} />
                </p>
                <p className="text-xs text-zinc-500 font-semibold">to select</p>
              </div>

              <div className="flex space-x-2 items-center">
                <p className="text-zinc-500 bg-stone-800 rounded p-[2px] text-xs w-6">
                  ESC
                </p>
                <p className="text-xs text-zinc-500 font-semibold">to close</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchModal;
