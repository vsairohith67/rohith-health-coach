export function GET() {
  return Response.json(
    {
      ok: true,
      service: "rohith-health-web",
      version: "1.0.0-rc4",
      mode: "deterministic",
      syntheticOnly: true,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
