import { getStreamServerClient, requireClerkUserId } from "@/lib/stream-server";

// Mints a short-lived Stream user token for the signed-in Clerk user. Wired
// as the StreamVideoClient `tokenProvider` — the client re-hits this on
// reconnect/refresh, so it must stay cheap and must not create anything.
export async function GET(request: Request) {
  let userId: string;
  try {
    userId = await requireClerkUserId(request);
  } catch (error) {
    console.error("Stream token request rejected", error);
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { client, apiKey } = getStreamServerClient();
    const token = client.generateUserToken({
      user_id: userId,
      validity_in_seconds: 60 * 60 * 4,
    });
    return Response.json({ apiKey, token, userId });
  } catch (error) {
    console.error("Failed to generate Stream token", error);
    return Response.json({ error: "Stream is not configured" }, { status: 500 });
  }
}
