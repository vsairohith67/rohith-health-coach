import {
  createHash,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

export interface AuthorizationCodeRecord {
  codeHash: string;
  subject: string;
  scopes: string[];
  resource: string;
  redirectUri: string;
  codeChallenge: string;
  expiresAt: number;
  usedAt: number | null;
}

export interface AccessTokenRecord {
  tokenHash: string;
  subject: string;
  scopes: string[];
  audience: string;
  issuer: string;
  expiresAt: number;
  revokedAt: number | null;
  rotationFamily: string;
}

const sha256 = (value: string): string =>
  createHash("sha256").update(value).digest("base64url");

export function createPkceChallenge(verifier: string): string {
  if (
    verifier.length < 43 ||
    verifier.length > 128 ||
    !/^[A-Za-z0-9._~-]+$/.test(verifier)
  )
    throw new Error("INVALID_VERIFIER");
  return sha256(verifier);
}

export function verifyPkce(verifier: string, challenge: string): boolean {
  try {
    const actual = Buffer.from(createPkceChallenge(verifier));
    const expected = Buffer.from(challenge);
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}

export class InMemoryOAuthAuthority {
  private readonly codes = new Map<string, AuthorizationCodeRecord>();
  private readonly tokens = new Map<string, AccessTokenRecord>();

  constructor(
    private readonly issuer: string,
    private readonly audience: string,
    private readonly now: () => number = Date.now,
  ) {}

  issueCode(
    input: Omit<AuthorizationCodeRecord, "codeHash" | "expiresAt" | "usedAt">,
  ): string {
    if (input.resource !== this.audience) throw new Error("AUDIENCE_MISMATCH");
    if (
      !input.redirectUri.startsWith("https://chatgpt.com/") &&
      !input.redirectUri.startsWith("http://127.0.0.1/")
    )
      throw new Error("REDIRECT_URI_DENIED");
    const code = randomBytes(32).toString("base64url");
    this.codes.set(sha256(code), {
      ...input,
      codeHash: sha256(code),
      expiresAt: this.now() + 120_000,
      usedAt: null,
    });
    return code;
  }

  exchangeCode(input: {
    code: string;
    verifier: string;
    redirectUri: string;
    resource: string;
  }): { accessToken: string; record: AccessTokenRecord } {
    const record = this.codes.get(sha256(input.code));
    if (!record || record.usedAt !== null || record.expiresAt <= this.now())
      throw new Error("CODE_INVALID_OR_REPLAYED");
    if (
      record.redirectUri !== input.redirectUri ||
      record.resource !== input.resource
    )
      throw new Error("CODE_CONTEXT_MISMATCH");
    if (!verifyPkce(input.verifier, record.codeChallenge))
      throw new Error("PKCE_FAILED");
    record.usedAt = this.now();
    const accessToken = randomBytes(32).toString("base64url");
    const token: AccessTokenRecord = {
      tokenHash: sha256(accessToken),
      subject: record.subject,
      scopes: record.scopes,
      audience: this.audience,
      issuer: this.issuer,
      expiresAt: this.now() + 15 * 60_000,
      revokedAt: null,
      rotationFamily: randomUUID(),
    };
    this.tokens.set(token.tokenHash, token);
    return { accessToken, record: token };
  }

  validate(accessToken: string, requiredScope: string): AccessTokenRecord {
    const record = this.tokens.get(sha256(accessToken));
    if (!record || record.revokedAt !== null || record.expiresAt <= this.now())
      throw new Error("TOKEN_INVALID");
    if (record.issuer !== this.issuer || record.audience !== this.audience)
      throw new Error("TOKEN_CONTEXT_INVALID");
    if (!record.scopes.includes(requiredScope)) throw new Error("SCOPE_DENIED");
    return record;
  }

  revoke(accessToken: string): void {
    const record = this.tokens.get(sha256(accessToken));
    if (record) record.revokedAt = this.now();
  }
}

export function protectedResourceMetadata(
  resource: string,
  issuer: string,
): Record<string, unknown> {
  return {
    resource,
    authorization_servers: [issuer],
    scopes_supported: [
      "health.freshness.read",
      "health.summary.read",
      "health.sleep.read",
      "health.activity.read",
      "health.heart.read",
      "health.baseline.read",
      "health.coach.read",
      "health.reports.read",
    ],
    resource_documentation: `${resource}/docs`,
  };
}

export function authorizationServerMetadata(
  issuer: string,
): Record<string, unknown> {
  return {
    issuer,
    authorization_response_iss_parameter_supported: true,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    revocation_endpoint: `${issuer}/revoke`,
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: [
      "health.freshness.read",
      "health.summary.read",
      "health.sleep.read",
      "health.activity.read",
      "health.heart.read",
      "health.baseline.read",
      "health.coach.read",
      "health.reports.read",
    ],
  };
}
