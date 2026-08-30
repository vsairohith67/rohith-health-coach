export const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });

export const safeError = (
  status: number,
  code: string,
  requestId: string,
): Response =>
  jsonResponse(status, { ok: false, request_id: requestId, error: code });
