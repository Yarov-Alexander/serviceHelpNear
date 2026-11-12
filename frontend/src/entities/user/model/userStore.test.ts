import { beforeEach, describe, expect, it } from "vitest";
import { useUserStore } from "./userStore";

describe("user store", () => {
  beforeEach(() => {
    useUserStore.getState().clearUser();
  });

  it("sets and clears the current user", () => {
    const user = { id: 1, email: "person@example.com", role: "customer" as const };

    useUserStore.getState().setUser(user);
    expect(useUserStore.getState().currentUser).toEqual(user);

    useUserStore.getState().clearUser();
    expect(useUserStore.getState().currentUser).toBeNull();
  });
});
