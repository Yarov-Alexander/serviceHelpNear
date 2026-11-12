import { useSyncExternalStore } from "react";
import type { User } from "./types";

let currentUser: User | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((listener) => listener());
}

export function useUser() {
  return useSyncExternalStore(subscribe, () => currentUser, () => null);
}

export function setUser(user: User) {
  currentUser = user;
  notify();
}

export function clearUser() {
  currentUser = null;
  notify();
}