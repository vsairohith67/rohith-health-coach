export function isDemoMode(): boolean {
  return process.env.DEMO_MODE !== "false";
}

export function isPublicSignupEnabled(): boolean {
  return process.env.ENABLE_PUBLIC_SIGNUP === "true";
}
