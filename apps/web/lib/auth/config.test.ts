import { afterEach, describe, expect, it, vi } from "vitest";
import { getAuthCookieOptions } from "./config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("private Auth cookies", () => {
  it("uses HttpOnly, SameSite=Lax cookies scoped to the whole app", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(getAuthCookieOptions()).toEqual({
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: false,
    });
  });

  it("requires Secure cookies in Production", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(getAuthCookieOptions().secure).toBe(true);
  });
});
