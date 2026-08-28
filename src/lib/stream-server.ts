// Server-only helpers for the Stream API routes (src/app/api/stream/*).
// Never import this from client code — it reads the Stream API secret and
// the Clerk secret key, neither of which may reach the Expo app bundle.

import { verifyToken } from "@clerk/backend";
import { StreamClient } from "@stream-io/node-sdk";

// Must match the `agent_user` id in vision-agent/agent.py — this is how the
// AI teacher's Stream user is granted call membership/permissions below.
export const AI_TEACHER_USER_ID = "lingua-ai-teacher";

export function getStreamServerClient(): { client: StreamClient; apiKey: string } {
  const apiKey = process.env.STREAM_API_KEY;
  const apiSecret = process.env.STREAM_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set on the server.");
  }
  return { client: new StreamClient(apiKey, apiSecret), apiKey };
}

// Derives the Stream user id from the caller's own Clerk session token —
// never from a client-supplied id — so one signed-in user can't mint a
// Stream token for another user.
export async function requireClerkUserId(request: Request): Promise<string> {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CLERK_SECRET_KEY must be set on the server.");
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    throw new Error("Missing Authorization header.");
  }

  const payload = await verifyToken(token, { secretKey });
  return payload.sub;
}

// Where the Python Vision Agent's `serve` HTTP API lives, read by
// src/app/api/agent/*. The shared secret (optional) is forwarded as a header
// so the agent server can reject requests that didn't come from this backend.
export function getVisionAgentConfig(): { baseUrl: string; sharedSecret?: string } {
  const baseUrl = process.env.VISION_AGENT_URL;
  if (!baseUrl) {
    throw new Error("VISION_AGENT_URL must be set on the server.");
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), sharedSecret: process.env.VISION_AGENT_SHARED_SECRET };
}
