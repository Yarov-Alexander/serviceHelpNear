import { describe, expect, it } from "vitest";
import type { ProfileData } from "./types";
import { validatePassword, validateProfile } from "./validation";

const valid: ProfileData = {
  name: "Анна Ковалёва",
  email: "anna@example.com",
  phone: "+7 900 000-00-00",
  district: "Центральный район",
};

describe("validateProfile", () => {
  it("пропускает корректные данные", () => {
    expect(validateProfile(valid)).toEqual({});
  });

  it("телефон необязателен", () => {
    expect(validateProfile({ ...valid, phone: "" })).toEqual({});
  });

  it("находит ошибки в имени, email и телефоне", () => {
    const errors = validateProfile({ ...valid, name: " ", email: "anna@", phone: "123" });
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.phone).toBeDefined();
  });
});

describe("validatePassword", () => {
  it("пропускает корректный пароль", () => {
    expect(validatePassword("old-pass", "new-password", "new-password")).toEqual({});
  });

  it("требует текущий пароль и минимум 8 символов", () => {
    const errors = validatePassword("", "short", "short");
    expect(errors.current).toBeDefined();
    expect(errors.next).toBeDefined();
  });

  it("не принимает тот же пароль и несовпадающее повторение", () => {
    expect(validatePassword("same-password", "same-password", "same-password").next).toBeDefined();
    expect(validatePassword("old-pass", "new-password", "other-password").repeat).toBeDefined();
  });
});
