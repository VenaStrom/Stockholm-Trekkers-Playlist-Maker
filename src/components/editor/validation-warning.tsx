import { useState } from "react";

/**
 * Floating non-blocking warning below an input, like v3's validation windows.
 * "Ignore" hides the current warning; a different warning shows up again.
 * Render inside a `relative` container.
 */
export default function ValidationWarning({ warning }: { warning: string | null; }) {
  const [ignoredWarning, setIgnoredWarning] = useState<string | null>(null);

  if (!warning || warning === ignoredWarning) return null;

  return (
    <div
      className={`
        absolute top-full left-0 mt-1 z-30
        flex flex-row items-center gap-x-3
        bg-abyss-800 border border-command-500 rounded-sm
        px-2 py-1 text-sm whitespace-nowrap shadow-sm
      `}
      role="alert"
    >
      <span className="text-command-500">{warning}</span>
      <button
        className="text-flare-500 hover:text-flare-500 select-none"
        onClick={() => setIgnoredWarning(warning)}
      >
        Ignore
      </button>
    </div>
  );
}
