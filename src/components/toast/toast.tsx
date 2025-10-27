import { useCallback, useContext, useState } from "react";
import { ToastContext, ToastMessage } from "./toast.internal.ts";
import { IconCloseSmall } from "../icons.tsx";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const defaultTimeout = 5000;

  const toast = useCallback((content: React.ReactNode, timeout: number = defaultTimeout) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast: ToastMessage = { id, content };
    setToasts(current => [...current, newToast]);

    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== id));
    }, timeout || defaultTimeout);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(current => current.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{
      toast,
      removeToast,
      toasts,
    }}>
      {children}
    </ToastContext.Provider>
  );
}

export function Toaster() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;

  const { toasts, removeToast } = ctx;

  return (
    <div className="z-50 flex flex-col gap-y-2 absolute w-full justify-center items-center bottom-2 pointer-events-none transition-all">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            bg-abyss-800
            text-lg
            rounded-sm
            p-5
            flex flex-row justify-center items-center gap-x-3
            pointer-events-auto
          `}
        >
          {t.content}

          <button className="€icon" onClick={() => removeToast(t.id)}>
            <IconCloseSmall className="size-8 scale-110 text" />
          </button>
        </div>
      ))}
    </div>
  );
}
