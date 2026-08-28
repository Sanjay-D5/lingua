"""Example tests for vision-agent using `vision_agents.testing`.

Run:
    uv run pytest
"""

import os

import pytest
from dotenv import load_dotenv

from agent import DEFAULT_INSTRUCTIONS as INSTRUCTIONS

from vision_agents.plugins import gemini
from vision_agents.testing import LLMJudge, TestSession

load_dotenv()


pytestmark = [
    pytest.mark.integration,
    pytest.mark.skipif(
        not os.getenv("GEMINI_API_KEY"),
        reason="GEMINI_API_KEY not set",
    ),
]


async def test_greeting_is_friendly():
    """Use `LLMJudge` to verify the agent's greeting intent."""
    judge = LLMJudge(gemini.LLM())

    async with TestSession(llm=gemini.LLM(), instructions=INSTRUCTIONS) as session:
        response = await session.simple_response("Hi there!")

        assert response.output is not None
        assert response.duration_ms > 0
        assert len(response.chat_messages) >= 1

        verdict = await judge.evaluate(
            response.chat_messages[-1],
            intent="A friendly, short greeting from an AI assistant",
        )
        assert verdict.success, verdict.reason


async def test_stays_conversational():
    """Replies should stay short and free of markdown formatting."""
    judge = LLMJudge(gemini.LLM())

    async with TestSession(llm=gemini.LLM(), instructions=INSTRUCTIONS) as session:
        response = await session.simple_response("Tell me about yourself.")
        verdict = await judge.evaluate(
            response.chat_messages[-1],
            intent="A short, conversational reply without markdown, bullets, or lists",
        )
        assert verdict.success, verdict.reason


async def test_remembers_context_across_turns():
    """Within one `TestSession`, conversation history accumulates."""
    judge = LLMJudge(gemini.LLM())

    async with TestSession(llm=gemini.LLM(), instructions=INSTRUCTIONS) as session:
        await session.simple_response("My name is Alex.")
        response = await session.simple_response("What is my name?")

        verdict = await judge.evaluate(
            response.chat_messages[-1],
            intent="The assistant correctly recalls that the user's name is Alex",
        )
        assert verdict.success, verdict.reason
