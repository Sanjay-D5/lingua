import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { AI_TEACHER_USER_ID, getStreamServerClient, requireClerkUserId } from "@/lib/stream-server";

// Gets-or-creates the audio-only Stream call for a lesson. Runs server-side
// so the call's members and custom data come from the trusted hardcoded
// lesson content and the caller's own Clerk session, never from client input
// beyond the lesson id it's asking to join.
export async function POST(request: Request) {
  let userId: string;
  try {
    userId = await requireClerkUserId(request);
  } catch (error) {
    console.error("Stream call request rejected", error);
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const lessonId = typeof body?.lessonId === "string" ? body.lessonId : null;
  if (!lessonId) {
    return Response.json({ error: "lessonId is required" }, { status: 400 });
  }

  const lesson = lessons.find((item) => item.id === lessonId);
  if (!lesson) {
    return Response.json({ error: "Unknown lesson" }, { status: 404 });
  }
  const language = languages.find((item) => item.id === lesson.languageId);

  // "audio_room" restricts who can publish audio by default (unlike
  // "default", which the AI teacher needs an explicit grant for). Both
  // members are made admins so the switch doesn't regress the student's
  // already-working mic, and so the AI teacher (joined by the Python agent,
  // see vision-agent/agent.py) can publish its voice too.
  const callType = "audio_room";
  // Deterministic per (user, lesson) so rejoining the same lesson reuses the
  // same call instead of accumulating orphaned ones.
  const callId = `lesson-${lesson.id}-${userId}`;

  try {
    const { client } = getStreamServerClient();
    const call = client.video.call(callType, callId);
    await call.getOrCreate({
      data: {
        created_by_id: userId,
        // Audio-only lesson: force video off at the call level so no
        // participant can publish a video track, even if a future AI-teacher
        // agent joins with camera capability.
        video: false,
        members: [
          { user_id: userId, role: "admin" },
          { user_id: AI_TEACHER_USER_ID, role: "admin" },
        ],
        // Everything the Vision Agent needs to teach this exact lesson and
        // nothing else — read back in vision-agent/agent.py's join_call().
        custom: {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          lessonGoal: lesson.goal,
          languageId: lesson.languageId,
          languageName: language?.name,
          vocabulary: lesson.vocabulary.map(({ term, translation, pronunciation }) => ({
            term,
            translation,
            pronunciation,
          })),
          phrases: lesson.phrases.map(({ text, translation, context }) => ({
            text,
            translation,
            context,
          })),
          aiTeacherPersona: lesson.aiTeacher.persona,
          aiTeacherFocus: lesson.aiTeacher.focus,
          aiTeacherKickoffPrompt: lesson.aiTeacher.kickoffPrompt,
        },
      },
    });

    // "audio_room" calls start backstage; go live immediately so members can
    // publish audio right away instead of waiting for a host to start it.
    await call.goLive().catch((error) => {
      console.warn("Stream call goLive skipped (likely already live)", error);
    });

    return Response.json({ callType, callId });
  } catch (error) {
    console.error("Failed to create Stream call", error);
    return Response.json({ error: "Stream is not configured" }, { status: 500 });
  }
}
