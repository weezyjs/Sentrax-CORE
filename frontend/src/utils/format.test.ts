import { describe, expect, it } from "vitest";
import { formatSeverity } from "./format";

describe("formatSeverity", () => {
  it("uppercases values", () => {
    expect(formatSeverity("high")).toBe("HIGH");
  });
});
