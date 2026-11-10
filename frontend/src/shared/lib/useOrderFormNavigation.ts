import { useCallback } from "react";

export function useOrderFormNavigation() {
  return useCallback(() => {
    document.querySelector("#order-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => document.querySelector<HTMLInputElement>("#task")?.focus(), 500);
  }, []);
};
