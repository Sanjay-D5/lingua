// Client-side helpers for talking to the Stream API routes (src/app/api/stream/*).
// The Stream API secret never leaves the server — these helpers only ever see
// the short-lived user token the backend hands back.

import Constants from "expo-constants";
import { Platform } from "react-native";

export type StreamSession = {
  apiKey: string;
  token: string;
  userId: string;
};

export type StreamLessonCall = {
  callType: string;
  callId: string;
};

export type AgentSession = {
  sessionId: string;
  callId: string;
};

export type AgentStatus = "idle" | "connecting" | "connected" | "failed";

type GetToken = () => Promise<string | null>;

// Expo Router API routes are served from the same origin as the app bundle,
// but on native there's no implicit "same origin" for a bare fetch("/api/...")
// the way there is on web. Resolve an absolute origin instead:
// - EXPO_PUBLIC_API_BASE_URL covers a standalone/production build talking to
//   a deployed API origin.
// - In dev, fall back to the Metro dev server's host (which also serves API
//   routes) via expo-constants.
function resolveApiBaseUrl(): string {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (configuredBaseUrl) {
    return configuredBaseUrl.replace(/\/$/, "");
  }
  if (Platform.OS === "web") {
    return "";
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return `http://${hostUri}`;
  }
  throw new Error("Set EXPO_PUBLIC_API_BASE_URL to reach the Stream API routes from a native build.");
}

async function callStreamApi<T>(path: string, getToken: GetToken, init?: RequestInit): Promise<T> {
  const clerkToken = await getToken();
  if (!clerkToken) {
    throw new Error("You must be signed in to start a lesson call.");
  }

  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${clerkToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Stream request to ${path} failed (${response.status}).`);
  }

  return response.json();
}

// Hit repeatedly as a StreamVideoClient `tokenProvider` — must stay cheap and
// side-effect free (no call creation here).
export function fetchStreamSession(getToken: GetToken): Promise<StreamSession> {
  return callStreamApi<StreamSession>("/api/stream/token", getToken);
}

// Gets-or-creates the audio-only call for this lesson, server-side, so the
// call's members/custom data are set from trusted lesson content rather than
// whatever the client sends.
export function createLessonCall(getToken: GetToken, lessonId: string): Promise<StreamLessonCall> {
  return callStreamApi<StreamLessonCall>("/api/stream/call", getToken, {
    method: "POST",
    body: JSON.stringify({ lessonId }),
  });
}

// Has the Vision Agent (AI teacher) join this lesson's call. Only call this
// after the user has already joined the call themselves.
export function startLessonAgent(getToken: GetToken, lessonId: string): Promise<AgentSession> {
  return callStreamApi<AgentSession>("/api/agent/start", getToken, {
    method: "POST",
    body: JSON.stringify({ lessonId }),
  });
}

// Ends the AI teacher's session. Safe to call more than once for the same
// session (e.g. once on end-call, again on unmount) — an already-closed
// session is not treated as an error.
export async function stopLessonAgent(getToken: GetToken, lessonId: string, sessionId: string): Promise<void> {
  await callStreamApi<{ ok: true }>("/api/agent/stop", getToken, {
    method: "POST",
    body: JSON.stringify({ lessonId, sessionId }),
  });
}
