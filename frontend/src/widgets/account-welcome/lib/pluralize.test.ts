import { describe, expect, it } from "vitest";
import { pluralize } from "./pluralize";

const forms = ["заявка", "заявки", "заявок"] as const;

describe("pluralize", () => {
  it.each([
    [0, "заявок"],
    [1, "заявка"],
    [2, "заявки"],
    [4, "заявки"],
    [5, "заявок"],
    [11, "заявок"],
    [12, "заявок"],
    [21, "заявка"],
    [22, "заявки"],
    [111, "заявок"],
  ])("%i → %s", (count, expected) => {
    expect(pluralize(count, forms)).toBe(expected);
  });
});
