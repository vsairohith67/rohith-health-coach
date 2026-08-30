import { describe, expect, it } from "vitest";

import { createPkceChallenge, InMemoryOAuthAuthority } from "./oauth";

describe("OAuth 2.1 PKCE authority", () => {
  it("binds code to resource, redirect and one-time exchange", () => {
    let now = 1_000;
    const authority = new InMemoryOAuthAuthority(
      "https://auth.example.invalid",
      "https://health.example.invalid",
      () => now,
    );
    const verifier = "a".repeat(64);
    const code = authority.issueCode({
      subject: "synthetic-user",
      scopes: ["health.summary.read"],
      resource: "https://health.example.invalid",
      redirectUri: "https://chatgpt.com/connector_platform_oauth_redirect",
      codeChallenge: createPkceChallenge(verifier),
    });
    const token = authority.exchangeCode({
      code,
      verifier,
      redirectUri: "https://chatgpt.com/connector_platform_oauth_redirect",
      resource: "https://health.example.invalid",
    });
    expect(
      authority.validate(token.accessToken, "health.summary.read").subject,
    ).toBe("synthetic-user");
    expect(() =>
      authority.exchangeCode({
        code,
        verifier,
        redirectUri: "https://chatgpt.com/connector_platform_oauth_redirect",
        resource: "https://health.example.invalid",
      }),
    ).toThrow("CODE_INVALID_OR_REPLAYED");
    authority.revoke(token.accessToken);
    expect(() =>
      authority.validate(token.accessToken, "health.summary.read"),
    ).toThrow("TOKEN_INVALID");
    now += 1;
  });

  it("rejects mismatched audiences and unsafe redirects", () => {
    const authority = new InMemoryOAuthAuthority(
      "https://auth.example.invalid",
      "https://health.example.invalid",
    );
    const input = {
      subject: "synthetic-user",
      scopes: ["health.summary.read"],
      resource: "https://wrong.example.invalid",
      redirectUri: "https://evil.example.invalid/callback",
      codeChallenge: createPkceChallenge("b".repeat(64)),
    };
    expect(() => authority.issueCode(input)).toThrow();
  });
});
