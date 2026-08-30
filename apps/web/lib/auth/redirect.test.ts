import { describe, expect, it } from "vitest";
import { hasOnlyExpectedParameters, safeInternalPath } from "./redirect";

describe("Auth callback redirect validation", () => {
  it.each([
    "https://evil.example",
    "//evil.example",
    "%2f%2fevil.example",
    "%252f%252fevil.example",
    "javascript:alert(1)",
    "data:text/html,unsafe",
    "\\\\evil.example",
    "/%5c%5cevil.example",
    "%68%74%74%70%73%3A%2F%2Fevil.example",
    "%E0%A4%A",
  ])("rejects unsafe next destination %s", (candidate) => {
    expect(safeInternalPath(candidate)).toBe("/today");
  });

  it("preserves a same-origin path and query while stripping fragments", () => {
    expect(safeInternalPath("/sleep?range=7d#token")).toBe("/sleep?range=7d");
  });

  it("rejects unexpected or repeated callback parameters", () => {
    const allowed = new Set(["code", "next"]);
    expect(
      hasOnlyExpectedParameters(
        new URLSearchParams("code=one&next=%2Ftoday"),
        allowed,
      ),
    ).toBe(true);
    expect(
      hasOnlyExpectedParameters(
        new URLSearchParams("code=one&code=two"),
        allowed,
      ),
    ).toBe(false);
    expect(
      hasOnlyExpectedParameters(
        new URLSearchParams("code=one&redirect=https%3A%2F%2Fevil.example"),
        allowed,
      ),
    ).toBe(false);
  });
});
