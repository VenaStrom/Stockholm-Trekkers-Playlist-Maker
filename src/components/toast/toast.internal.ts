import { createContext } from "react";

export type ToastMessage = {
  id: string;
  content: React.ReactNode;
};

export type ToastContextValue = {
  toast: (text: React.ReactNode) => string;
  removeToast: (id: string) => void;
  toasts: ToastMessage[];
};

export const ToastContext = createContext<ToastContextValue | null>(null);
