
export function isStandardObject(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== "object") return false;
  if (obj === null) return false;
  if (Array.isArray(obj)) return false;
  if (obj instanceof Date) return false;
  if (obj instanceof File) return false;
  return true;
}