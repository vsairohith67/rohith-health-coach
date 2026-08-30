import { getVerifiedUser } from "../../../lib/auth/server";
import { isDemoMode } from "../../../lib/runtime-mode";

export async function GET() {
  const demoMode = isDemoMode();
  if (!demoMode) {
    const user = await getVerifiedUser().catch(() => null);
    if (!user) {
      return Response.json(
        { error: "AUTHENTICATION_REQUIRED" },
        {
          status: 401,
          headers: { "cache-control": "private, no-store, max-age=0" },
        },
      );
    }
  }
  return Response.json(
    {
      ok: true,
      service: "rohith-health-web",
      version: "1.0.0-rc6",
      mode: "deterministic",
      syntheticOnly: demoMode,
      dataConnected: false,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
