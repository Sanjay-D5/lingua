import { lessons } from "@/data/lessons";
import { getVisionAgentConfig, requireClerkUserId } from "@/lib/stream-server";

// Starts a Vision Agent session on the caller's own lesson call, proxying to
// the Python agent's `serve` HTTP API (see vision-agent/agent.py). The call
// id is recomputed from the caller's own Clerk id + lessonId — never taken
// from the client — so a signed-in user can only ever start an agent on
// their own call (same derivation as src/app/api/stream/call+api.ts).
export async function POST(request: Request) {
  let userId: string;
  try {
    userId = await requireClerkUserId(request);
  } catch (error) {
    console.error("Agent start request rejected", error);
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : null;
  if (!lessonId) {
    return Response.json({ error: "lessonId is required" }, { status: 400 });
  }
  if (!lessons.some((item) => item.id === lessonId)) {
    return Response.json({ error: "Unknown lesson" }, { status: 404 });
  }

  const callType = "audio_room";
  const callId = `lesson-${lessonId}-${userId}`;

  try {
    const { baseUrl, sharedSecret } = getVisionAgentConfig();
    const response = await fetch(`${baseUrl}/calls/${callId}/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sharedSecret ? { "x-agent-shared-secret": sharedSecret } : {}),
      },
      body: JSON.stringify({ call_type: callType }),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Vision Agent server responded ${response.status}: ${detail}`);
    }

    const data = await response.json();
    return Response.json({ sessionId: data.session_id, callId });
  } catch (error) {
    console.error("Failed to start lesson agent", error);
    return Response.json({ error: "AI teacher is not available right now" }, { status: 502 });
  }
}
