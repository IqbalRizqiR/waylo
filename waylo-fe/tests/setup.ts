import "@testing-library/jest-dom/vitest";
import {beforeEach, afterEach} from "vitest";

// jsdom in this environment does not provide a persistent localStorage, so a
// minimal in-memory implementation is installed for the client session layer.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.get(key) ?? null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

const storage = new MemoryStorage();

Object.defineProperty(window, "localStorage", {
  configurable: true,
  get: () => storage,
});

beforeEach(() => {
  storage.clear();
});

afterEach(() => {
  storage.clear();
});
