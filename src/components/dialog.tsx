import { useEffect } from "react";
import { IconCloseSmall } from "./icons";

export type DialogProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  dialogHeader: React.ReactNode;
  dialogContent: React.ReactNode;
  buttons: React.ReactNode[];
} & React.HTMLAttributes<HTMLDivElement>;

export default function Dialog({
  visible,
  setVisible,
  dialogHeader,
  dialogContent,
  buttons,
}: DialogProps) {
  if (!visible) return null;

  // Register Esc to close dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVisible(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setVisible]);

  // If a button has the data-focus="true" attribute, focus on it when the dialog is rendered
  useEffect(() => {
    const focusedButton = document.querySelector(
      'button[data-focus="true"]'
    ) as HTMLButtonElement | null;
    if (focusedButton) {
      focusedButton.focus();
    }
  }, []);

  return (
    // Modal background
    <div
      className="z-40 transition-all absolute top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setVisible(false);
        }
      }}
    >

      {/* Box */}
      <div className="flex flex-col gap-y-3 bg-abyss-800 rounded-sm w-10/12 md:w-4/12 min-h-48 mb-[5%]">
        {/* Header */}
        <div className="flex flex-row justify-start items-center w-full bg-abyss-500 p-4 pb-3 pe-3 rounded-t-sm">
          {dialogHeader}

          <span className="flex-1"></span>

          {/* X button */}
          <button
            className="€clear hover:text-command-500"
            onClick={() => setVisible(false)}
          >
            <IconCloseSmall className="inline size-8 scale-110" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-3">
          {dialogContent}
        </div>

        {/* Option buttons */}
        <div className="flex flex-row justify-end pb-4 px-4">
          {buttons.map((button, index) => (
            <div key={index} className="ms-2" tabIndex={0}>
              {button}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}