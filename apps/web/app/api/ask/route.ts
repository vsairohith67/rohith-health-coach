import { DEMO_PROFILE } from "@rohith-health/domain";
import { generateCoachFindings } from "@rohith-health/coach";
import { getVerifiedUser } from "../../../lib/auth/server";
import { isDemoMode } from "../../../lib/runtime-mode";

export async function POST(request: Request) {
  if (!isDemoMode()) {
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
    return Response.json(
      { error: "FEATURE_DISABLED" },
      {
        status: 403,
        headers: { "cache-control": "private, no-store, max-age=0" },
      },
    );
  }
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 4_096)
    return Response.json({ error: "REQUEST_TOO_LARGE" }, { status: 413 });
  const body: unknown = await request.json().catch(() => null);
  if (
    typeof body !== "object" ||
    body === null ||
    !("question" in body) ||
    typeof body.question !== "string" ||
    body.question.length > 240
  )
    return Response.json({ error: "INVALID_REQUEST" }, { status: 400 });
  return Response.json(
    {
      provider: "deterministic",
      dateRange: { start: "2026-08-15", end: "2026-08-28" },
      freshness: "partial",
      findings: generateCoachFindings(DEMO_PROFILE.days),
      limitations: [
        "Informational wearable-derived trends; no diagnosis or medication advice.",
      ],
      historyStored: false,
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}
