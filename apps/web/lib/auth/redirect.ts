const INTERNAL_BASE = "https://private-app.invalid";

function decodeRepeatedly(value: string): string | null {
  let decoded = value;
  try {
    for (let index = 0; index < 3; index += 1) {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    }
    return decoded;
  } catch {
    return null;
  }
}

function containsControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.charCodeAt(0);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}

export function safeInternalPath(
  candidate: string | null,
  fallback = "/today",
): string {
  if (!candidate || candidate.length > 2_048) return fallback;
  const decoded = decodeRepeatedly(candidate);
  if (
    !decoded ||
    !decoded.startsWith("/") ||
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    containsControlCharacter(decoded)
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(decoded, INTERNAL_BASE);
    if (parsed.origin !== INTERNAL_BASE) return fallback;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return fallback;
  }
}

export function hasOnlyExpectedParameters(
  parameters: URLSearchParams,
  allowed: ReadonlySet<string>,
): boolean {
  for (const key of parameters.keys()) {
    if (!allowed.has(key) || parameters.getAll(key).length !== 1) return false;
  }
  return true;
}
