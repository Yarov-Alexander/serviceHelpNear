import { beforeEach, describe, expect, it } from "vitest";
import { tokenStorage } from "./tokenStorage";

describe("tokenStorage", () => {
  beforeEach(() => {
    tokenStorage.clear();
    localStorage.clear();
  });

  it("stores the access token in memory only", () => {
    tokenStorage.set("test-access-token");

    expect(tokenStorage.get()).toBe("test-access-token");
    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("clears the in-memory access token", () => {
    tokenStorage.set("test-access-token");

    tokenStorage.clear();

    expect(tokenStorage.get()).toBeNull();
  });
});
