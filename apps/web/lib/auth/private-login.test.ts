import { describe, expect, it, vi } from "vitest";
import {
  PRIVATE_SIGN_IN_RESPONSE,
  requestPrivateSignInLink,
} from "./private-login";

describe("private passwordless login", () => {
  it("always disables implicit account creation", async () => {
    const signInWithOtp = vi.fn().mockResolvedValue({ error: null });
    const response = await requestPrivateSignInLink(
      { auth: { signInWithOtp } },
      "unknown@example.invalid",
      "https://health.example/auth/callback",
    );

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "unknown@example.invalid",
      options: {
        shouldCreateUser: false,
        emailRedirectTo: "https://health.example/auth/callback",
      },
    });
    expect(response).toBe(PRIVATE_SIGN_IN_RESPONSE);
  });

  it("returns the same generic response when the provider rejects the email", async () => {
    const signInWithOtp = vi.fn().mockRejectedValue(new Error("not found"));
    await expect(
      requestPrivateSignInLink(
        { auth: { signInWithOtp } },
        "unknown@example.invalid",
        "https://health.example/auth/callback",
      ),
    ).resolves.toBe(PRIVATE_SIGN_IN_RESPONSE);
  });
});
