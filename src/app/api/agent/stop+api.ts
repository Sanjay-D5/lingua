import { getVisionAgentConfig, requireClerkUserId } from "@/lib/stream-server";

// Requests closure of a Vision Agent session, proxying to the Python agent's
// `serve` HTTP API. Called both when the user ends the call and when the
// lesson screen unmounts (see src/app/lesson/[id].tsx), so it's tolerant of
// a session that's already gone (idled out, or stopped once already).
export async function POST(request: Request) {
  let userId: string;
  try {
    userId = await requireClerkUserId(request);
  } catch (error) {
    console.error("Agent stop request rejected", error);
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : null;
  const sessionId = typeof body?.sessionId === "string" ? body.sessionId : null;
  if (!lessonId || !sessionId) {
    return Response.json({ error: "lessonId and sessionId are required" }, { status: 400 });
  }

  const callId = `lesson-${lessonId}-${userId}`;

  try {
    const { baseUrl, sharedSecret } = getVisionAgentConfig();
    const response = await fetch(`${baseUrl}/calls/${callId}/sessions/${sessionId}`, {
      method: "DELETE",
      headers: sharedSecret ? { "x-agent-shared-secret": sharedSecret } : undefined,
    });
    if (!response.ok && response.status !== 404) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Vision Agent server responded ${response.status}: ${detail}`);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Failed to stop lesson agent", error);
    return Response.json({ error: "Failed to stop AI teacher" }, { status: 502 });
  }
}
