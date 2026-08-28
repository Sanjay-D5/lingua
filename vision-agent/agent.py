import os

from dotenv import load_dotenv
from fastapi import HTTPException, Request, status
from vision_agents.core import Agent, Runner, User
from vision_agents.core.agents import AgentLauncher
from vision_agents.core.instructions import Instructions
from vision_agents.core.runner import ServeOptions
from vision_agents.plugins import gemini, getstream

load_dotenv()

AGENT_USER_ID = "lingua-ai-teacher"  # must match AI_TEACHER_USER_ID in src/lib/stream-server.ts

# Fallback used only if a call has no lesson custom data yet (e.g. running
# `agent.py run` standalone without the Expo app). Real lessons always
# override this — see _build_instructions() below.
DEFAULT_INSTRUCTIONS = (
    "You are Lingua, a warm and encouraging AI language teacher having a live "
    "voice conversation with a student inside the Lingua app. "
    "Always speak in English, and teach the student's target language through "
    "English: introduce a word or phrase, explain what it means, have the "
    "student repeat it, then gently build on it. "
    "Keep replies short and conversational — a sentence or two — since this "
    "is spoken aloud, not read. Never use markdown, bullet points, or special "
    "characters."
)


def _build_instructions(custom: dict) -> str:
    """Turns the lesson's call custom data (packed by
    src/app/api/stream/call+api.ts) into the AI teacher's system prompt,
    scoped strictly to that lesson's language, goal, vocabulary and phrases.
    """
    persona = custom.get("aiTeacherPersona")
    focus = custom.get("aiTeacherFocus")
    kickoff = custom.get("aiTeacherKickoffPrompt")
    if not (persona and focus and kickoff):
        return DEFAULT_INSTRUCTIONS

    language_name = custom.get("languageName") or "the target language"
    lesson_title = custom.get("lessonTitle") or "this lesson"
    goal = custom.get("lessonGoal")

    vocabulary = custom.get("vocabulary") or []
    vocabulary_lines = "\n".join(
        f"- {item.get('term')} ({item.get('pronunciation')}) — {item.get('translation')}"
        if item.get("pronunciation")
        else f"- {item.get('term')} — {item.get('translation')}"
        for item in vocabulary
        if item.get("term")
    )

    phrases = custom.get("phrases") or []
    phrase_lines = "\n".join(
        f"- \"{item.get('text')}\" — {item.get('translation')}"
        for item in phrases
        if item.get("text")
    )

    return (
        f"You are Lingua, {persona}, having a live voice conversation with a "
        f"student inside the Lingua app. "
        f"Lesson: \"{lesson_title}\" ({language_name}). Your focus: {focus}. "
        + (f"Goal: {goal}. " if goal else "")
        + "Always speak in English, and teach through English: introduce a "
        "word or phrase from this lesson slowly with its translation, have "
        "the student repeat it, then gently build on it. Stay strictly "
        "within this lesson's vocabulary and phrases below — do not teach "
        "unrelated topics or switch to another language.\n\n"
        f"Vocabulary for this lesson:\n{vocabulary_lines or '(none)'}\n\n"
        f"Phrases for this lesson:\n{phrase_lines or '(none)'}\n\n"
        f"How to start: {kickoff}\n\n"
        "Keep replies short and conversational — a sentence or two — since "
        "this is spoken aloud, not read. Never use markdown, bullet points, "
        "or special characters."
    )


async def create_agent(**kwargs) -> Agent:
    return Agent(
        edge=getstream.Edge(),
        agent_user=User(name="Lingua AI Teacher", id=AGENT_USER_ID),
        instructions=DEFAULT_INSTRUCTIONS,
        # Voice-only lesson: the realtime model handles speech in and out
        # directly. There's no video track to forward (the lesson call never
        # publishes camera), so the agent stays audio-only automatically.
        llm=gemini.Realtime(),
    )


async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs) -> None:
    call = await agent.create_call(call_type, call_id)

    # The call already carries this lesson's context (see
    # src/app/api/stream/call+api.ts) — read it back and scope the agent's
    # instructions to it before joining, so each session teaches exactly the
    # lesson the student picked instead of the generic default above.
    custom: dict = {}
    try:
        response = await call.get()
        custom = response.data.call.custom or {}
    except Exception:
        agent.logger.exception("Failed to read lesson custom data from call %s", call_id)

    agent.instructions = Instructions(input_text=_build_instructions(custom))

    async with agent.join(call):
        await agent.simple_response(
            text="Greet the student warmly in English and start the lesson."
        )
        await agent.finish()


def _check_shared_secret(request: Request) -> None:
    """Rejects /calls/*/sessions requests that don't carry the shared secret
    the Expo API routes send (src/lib/stream-server.ts getVisionAgentConfig).
    Unset VISION_AGENT_SHARED_SECRET disables the check for local dev.
    """
    expected = os.environ.get("VISION_AGENT_SHARED_SECRET")
    if not expected:
        return
    if request.headers.get("x-agent-shared-secret") != expected:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


runner = Runner(
    AgentLauncher(create_agent=create_agent, join_call=join_call),
    serve_options=ServeOptions(
        can_start_session=_check_shared_secret,
        can_close_session=_check_shared_secret,
    ),
)


if __name__ == "__main__":
    runner.cli()
