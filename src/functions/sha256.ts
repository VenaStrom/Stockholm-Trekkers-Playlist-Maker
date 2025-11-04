import { sha256 } from "js-sha256";

export function generateId(): string {
  const hash = sha256.create();
  hash.update(Date.now().toString());
  hash.update(Math.random().toString());
  return hash.hex().slice(0, 8);
}