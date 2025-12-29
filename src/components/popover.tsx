import { createContext, useContext, useState, useEffect } from "react";
import { IconArrowDropDown, IconCloseSmall } from "./icons";
import { generateId } from "@/functions/sha256";

type PopoverContext = {
  anchorName: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

// Use an undefined default so we can detect missing provider in `usePopover`
const PopoverContext = createContext<PopoverContext | undefined>(undefined);

function usePopover() {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error("usePopover must be used within a PopoverProvider");
  }
  return context;
}

export function PopoverContainer({ children }: { children?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorName] = useState(() => generateId());

  return (
    <PopoverContext.Provider
      value={{
        anchorName,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ text, children }: { text?: string; children?: React.ReactNode }) {
  const { setIsOpen, anchorName } = usePopover();

  if (children) {
    return (
      <span
        role="button"
        tabIndex={0}
        data-popover-anchor={anchorName}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((open) => !open);
          }
        }}
        className="inline-block pe-1.5 ps-3 hover:bg-science-500 bg-abyss-200"
      >
        {children}
        <IconArrowDropDown className="inline size-6 ms-0.5" />
      </span>
    );
  }

  return (
    <button
      type="button"
      className="inline-block pe-1.5 ps-3 hover:bg-science-500 bg-abyss-200"
      onClick={() => setIsOpen((open) => !open)}
      data-popover-anchor={anchorName}
    >
      {text}
      <IconArrowDropDown className="inline size-6 ms-0.5" />
    </button>
  );
}

export function PopoverContent({ children }: { children?: React.ReactNode }) {
  const { isOpen, setIsOpen, anchorName } = usePopover();

  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    let raf = 0;
    function update() {
      const anchorEl = document.querySelector(`[data-popover-anchor="${anchorName}"]`);
      if (!(anchorEl instanceof HTMLElement)) {
        setPos({ x: 0, y: 0 });
        return;
      }
      const rect = anchorEl.getBoundingClientRect();
      setPos({ x: rect.right - rect.width, y: rect.top + 32 });
    }

    if (isOpen) update();

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [anchorName, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        top: pos.y,
        left: pos.x,
      }}
      className="fixed z-50 bg-abyss-500 min-w-24 min-h-24 p-4 pe-6"
    >
      <div className="p-2">{children}</div>
      <button
        type="button"
        className="€cicon absolute top-0 end-0 m-1 hover:text-spore-500"
        onClick={() => setIsOpen(false)}
      >
        <IconCloseSmall className="size-7" />
      </button>
    </div>
  );
}