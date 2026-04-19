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
    const mergedOptions = { ...DefaultToastOptions, ...options };

    if (!isToastOptions(mergedOptions)) throw new Error("Invalid toast options");

    const id = Math.random().toString(36).slice(2, 9);
    const newToast: ToastMessage = { id, content, mood: mergedOptions.mood };

    setToasts(current => [...current, newToast]);

    setTimeout(() => {
      setToasts(current => current.filter(t => t.id !== id));
    }, mergedOptions.timeout);

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
    <ul className="z-50 flex flex-col gap-y-2 px-8 fixed w-full justify-center items-end bottom-2 pointer-events-none transition-all">
      {toasts.map(t => (
        <li
          key={t.id}
          className={`
            bg-abyss-900
            text-lg
            rounded-sm
            p-5
            flex flex-row justify-center items-center gap-x-3
            pointer-events-auto
            border-l-4
            ${t.mood === "info" && "border-l-command-300"}
            ${t.mood === "happy" && "border-l-spore-500"}
            ${t.mood === "angry" && "border-l-red-alert-500"}
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
