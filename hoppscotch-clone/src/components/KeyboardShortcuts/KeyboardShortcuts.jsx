import { CornerDownLeft, ExternalLink } from "lucide-react";

const KeyboardShortcuts = ({
  docUrl = "https://docs.hoppscotch.io/documentation",
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-zinc-400 flex-1">
      {/* Keyboard Shortcuts - Two Column Layout */}
      <div className="mb-4 flex space-x-2">
        {/* Left Column - Text Labels (Right Aligned) */}
        <div className="flex flex-col items-end space-y-4 text-right">
          <span className="flex flex-1 items-center text-xs font-medium">
            Send Request
          </span>
          <span className="flex flex-1 items-center text-xs font-medium">
            Keyboard shortcuts
          </span>
          <span className="flex flex-1 items-center text-xs font-medium">
            Search & command menu
          </span>
          <span className="flex flex-1 items-center text-xs font-medium">
            Help menu
          </span>
        </div>

        {/* Right Column - Keyboard Shortcuts (Left Aligned) */}
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-1">
            <span className="text-[10px] bg-stone-800 rounded px-2 py-1 text-zinc-500 font-medium">
              Ctrl
            </span>
            <span className="text-[10px] bg-stone-800 rounded px-2 pt-2 text-zinc-500">
              <CornerDownLeft size={10} />
            </span>
          </div>
          <div className="flex space-x-1">
            <span className="text-[10px] bg-stone-800 rounded px-2 py-1 text-zinc-500 font-medium">
              Ctrl
            </span>
            <span className="text-[10px] bg-stone-800 rounded px-2 py-1 text-zinc-500 font-medium">
              K
            </span>
          </div>
          <div className="flex space-x-1">
            <span className="text-[10px] bg-stone-800 rounded px-2 py-1 text-zinc-500 font-medium">
              Ctrl
            </span>
            <span className="text-[10px] bg-stone-800 rounded px-2 py-1 text-zinc-500 font-medium">
              /
            </span>
          </div>
          <div className="flex space-x-1">
            <span className="text-[10px] bg-stone-800 rounded px-2 py-1 text-zinc-500 font-medium">
              ?
            </span>
          </div>
        </div>
      </div>

      {/* Documentation Button */}
      <a
        href={docUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none text-zinc-400 hover:text-zinc-300 focus-visible:text-zinc-300 rounded px-4 py-2 flex-row-reverse border border-zinc-700 hover:border-zinc-600 focus-visible:border-zinc-600 text-xs">
        <span className="inline-flex items-center justify-center whitespace-nowrap flex-row-reverse">
          <ExternalLink size={16} className="ml-2" />
          <div className="truncate max-w-[16rem]">Documentation</div>
        </span>
      </a>
    </div>
  );
};

export default KeyboardShortcuts;
