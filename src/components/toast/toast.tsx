import { useCallback, useContext, useState } from "react";
import type { ToastMessage, ToastOptions } from "@/components/toast";
import { DefaultToastOptions, isToastOptions, ToastContext } from "@/components/toast";
import { IconCloseSmall } from "@/components/icons.tsx";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((
    content: React.ReactNode,
    options?: Partial<ToastOptions>,
  ) => {
    options = { ...options, ...DefaultToastOptions, }; // Hihi, side effects :3

    if (!isToastOptions(options)) throw new Error("Invalid toast options");

    const id = Math.random().toString(36).slice(2, 9);
    const newToast: ToastMessage = { id, content, mood: options.mood, };

    setToasts(current => [...current, newToast]);

    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== id));
    }, options.timeout);

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
    <ul className="z-50 flex flex-col gap-y-2 fixed w-full justify-center items-center bottom-2 pointer-events-none transition-all">
      {toasts.map((t) => (
        <li
          key={t.id}
          className={`
            bg-abyss-900
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
        </li>
      ))}
    </ul>
  );
}
