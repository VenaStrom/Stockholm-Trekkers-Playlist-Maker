import { isStandardObject } from "@/types";
import { createContext } from "react";

export const Mood = {
  info: "info",
  happy: "happy",
  angry: "angry",
} as const;
export type Mood = typeof Mood[keyof typeof Mood];
export type ToastMessage = {
  id: string;
  content: React.ReactNode;
  mood: Mood;
};
export type ToastOptions = {
  timeout: number;
  mood: Mood;
};
export function isToastOptions(obj: unknown): obj is ToastOptions {
  if (!isStandardObject(obj)) return false;
  if (typeof obj.timeout !== "number") return false;
  if (typeof obj.mood !== "string") return false;
  if (!Mood[obj.mood as Mood]) return false;
  return true;
}
export const DefaultToastTimeout = 5000 as const;
export const DefaultToastOptions: ToastOptions = {
  timeout: DefaultToastTimeout,
  mood: Mood.info,
} as const;
export type ToastContextValue = {
  toast: (
    content: React.ReactNode,
    options?: Partial<ToastOptions>,
  ) => string;
  removeToast: (id: string) => void;
  toasts: ToastMessage[];
};
export const ToastContext = createContext<ToastContextValue | null>(null);
