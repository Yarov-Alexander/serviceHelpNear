import { beforeEach, describe, expect, it } from "vitest";
import { tokenStorage } from "./tokenStorage";

describe("tokenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves an access token", () => {
    tokenStorage.set("test-access-token");

    expect(tokenStorage.get()).toBe("test-access-token");
  });

  it("clears the stored access token", () => {
    tokenStorage.set("test-access-token");

    tokenStorage.clear();

    expect(tokenStorage.get()).toBeNull();
  });
});
