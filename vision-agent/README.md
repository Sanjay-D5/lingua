# vision-agent

The Lingua AI teacher: a voice-only [Vision Agents](https://visionagents.ai)
agent that joins a Stream call and teaches the student's target language
through English, using Gemini Realtime (Live API) as the LLM and Stream Edge
as the transport.

## Setup

1. Copy `.env.example` to `.env` and fill in the keys:
   - `STREAM_API_KEY` / `STREAM_API_SECRET` — same values as the parent app's
     `.env` (see `../.env.example`).
   - `GEMINI_API_KEY` — from [Google AI Studio](https://aistudio.google.com/apikey).
   - `VISION_AGENT_SHARED_SECRET` — same value as the parent app's `.env`.
     Checked on every `/calls/*/sessions` request from the Expo API routes
     (`src/app/api/agent/*`); leave unset to disable the check locally.
2. Install dependencies:

   ```bash
   uv sync
   ```

3. Run the agent:

   ```bash
   uv run agent.py run     # single-call console
   uv run agent.py serve   # HTTP server — what the Expo app talks to
   ```

   With `serve` running (default `http://localhost:8000`), set
   `VISION_AGENT_URL` in the parent app's `.env` to that address so
   `src/app/api/agent/start+api.ts` / `stop+api.ts` can reach it.

4. Run the tests:

   ```bash
   uv run pytest
   ```

## Docker

```bash
docker build -t vision-agent .
docker run --env-file .env -p 8000:8000 vision-agent
```
