import Tippy from "@tippyjs/react";
import { CircleUserRound, CloudUpload, Download, Search } from "lucide-react";
import { useState } from "react";
import "tippy.js/dist/tippy.css";
import AuthStatusIndicator from "../Auth/AuthStatusIndicator";
import SearchModal from "../Modal/Search";

const Navbar = () => {
  const [search, setSearch] = useState(false);

  return (
    <>
      {/* Search Modal */}
      {search && <SearchModal onClose={() => setSearch(false)} />}

      <header className="grid grid-cols-5 p-2 gap-x-4 h-[6.5dvh]">
        <div className="col-span-2">
          <a
            href="/"
            className="uppercase lg:text-[13px] text-[12px] font-semibold ms-3">
            hoppscotch
          </a>
        </div>

        <div className="col-span-1">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setSearch(true)}
              className="relative flex flex-1 cursor-text items-center justify-between self-stretch rounded px-2 hover:text-gray-400 text-zinc-500 transition overflow-hidden h-8 hover:bg-search-bg-hover bg-search-bg">
              <div className="flex items-center space-x-2 font-semibold">
                <Search size={16} />
                <span className="text-xs font-semibold">Search</span>
              </div>

              <div className="flex space-x-2">
                <span className="rounded bg-zinc-900 px-1 text-[10px]">
                  Ctrl
                </span>
                <span className="rounded bg-zinc-900 px-1 text-[10px]">K</span>
              </div>
            </button>
          </div>
        </div>

        <div className="col-span-2 flex justify-between items-center">
          <div className="flex items-center gap-x-4">
            <Tippy
              content={
                <span className="text-[10px] font-semibold">Install App</span>
              }
              theme="light">
              <button className="lg:block hidden text-gray-400 hover:text-white">
                <Download size={15} />
              </button>
            </Tippy>

            <Tippy
              content={
                <span className="text-[10px] font-semibold">Support ?</span>
              }
              theme="light">
              <button className="text-gray-400 hover:text-white">
                <CircleUserRound size={15} />
              </button>
            </Tippy>
          </div>

          <div className="flex space-x-2 items-center">
            <button className="lg:flex hidden items-center justify-center font-semibold transition rounded px-4 py-2 hover:text-emerald-600 h-8 border border-emerald-600/25 bg-emerald-500/10 !text-emerald-500 hover:border-emerald-600/20 hover:bg-emerald-600/20 focus-visible:border-emerald-600/20 focus-visible:bg-emerald-600/20 text-xs">
              <CloudUpload className="me-2" size={14} />
              <span className="font-semibold">Save My Workspace</span>
            </button>

            {/* Authentication Status Indicator */}
            <AuthStatusIndicator />
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
