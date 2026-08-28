import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { StreamVideo, StreamVideoClient, type DeepPartial, type Theme, type User } from "@stream-io/video-react-native-sdk";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { PostHogProvider } from "posthog-react-native";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { posthog } from "../config/posthog";
import "../global.css";
import { fetchStreamSession } from "../lib/stream";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Bridges device safe-area insets into StreamVideo's theme so CallContent /
// RingingCallContent (and our own call screen, via useTheme()) respect
// notches and system bars.
function StreamVideoWithInsets({ children, client }: { children: ReactNode; client: StreamVideoClient }) {
  const { top, right, bottom, left } = useSafeAreaInsets();
  const theme: DeepPartial<Theme> = { variants: { insets: { top, right, bottom, left } } };
  return (
    <StreamVideo client={client} style={theme}>
      {children}
    </StreamVideo>
  );
}

// Creates the Stream Video client once per signed-in Clerk user (never per
// screen — see AGENTS.md prompts/13) and tears it down on sign-out. Renders
// children unwrapped while signed out or still connecting; the lesson screen
// reads the client via useStreamVideoClient() and handles it being undefined.
function StreamVideoGate({ children }: { children: ReactNode }) {
  const { isLoaded: isAuthLoaded, isSignedIn, getToken } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const [client, setClient] = useState<StreamVideoClient>();

  useEffect(() => {
    // No client to create yet — nothing to clear either: the initial state is
    // already undefined, and a prior signed-in run's cleanup below already
    // disconnected and cleared the client when isSignedIn flipped to false.
    if (!isAuthLoaded || !isUserLoaded || !isSignedIn || !user) {
      return;
    }

    let cancelled = false;
    let current: StreamVideoClient | undefined;

    (async () => {
      const session = await fetchStreamSession(getToken);
      if (cancelled) return;
      const streamUser: User = { id: session.userId, name: user.fullName ?? session.userId, image: user.imageUrl };
      // Re-hits /api/stream/token on refresh — the server re-derives the
      // Stream user id from the Clerk session each time, never from a value
      // cached on the client.
      const tokenProvider = async () => (await fetchStreamSession(getToken)).token;
      current = StreamVideoClient.getOrCreateInstance({ apiKey: session.apiKey, user: streamUser, tokenProvider });
      setClient(current);
    })().catch((err) => console.error("Failed to start Stream session", err));

    return () => {
      cancelled = true;
      current?.disconnectUser().catch((err) => console.error(err));
      setClient(undefined);
    };
    // `getToken` is Clerk's session accessor and stable enough for this purpose;
    // including it would reconnect on every render since Clerk returns a new
    // function identity each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoaded, isUserLoaded, isSignedIn, user?.id]);

  if (!client) {
    return <>{children}</>;
  }
  return <StreamVideoWithInsets client={client}>{children}</StreamVideoWithInsets>;
}

function PostHogIdentity() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { isLoaded: isUserLoaded, user } = useUser();
  const identifiedUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!posthog || !isAuthLoaded || !isUserLoaded) {
      return;
    }

    if (!isSignedIn || !user) {
      if (identifiedUserId.current !== null) {
        posthog.reset();
        identifiedUserId.current = null;
      }
      return;
    }

    if (identifiedUserId.current === user.id) {
      return;
    }

    if (identifiedUserId.current) {
      posthog.reset();
    }

    const personProperties = {
      ...(user.primaryEmailAddress ? { email: user.primaryEmailAddress.emailAddress } : {}),
      ...(user.fullName ? { name: user.fullName } : {}),
    };
    posthog.identify(user.id, { $set: personProperties });
    identifiedUserId.current = user.id;
  }, [isAuthLoaded, isSignedIn, isUserLoaded, user]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const content = (
    <StreamVideoGate>
      <Stack screenOptions={{ headerShown: false }} />
    </StreamVideoGate>
  );

  return (
    <ClerkProvider publishableKey={publishableKey!} tokenCache={tokenCache}>
      <SafeAreaProvider>
        {posthog ? (
          <PostHogProvider client={posthog}>
            <PostHogIdentity />
            {content}
          </PostHogProvider>
        ) : (
          content
        )}
      </SafeAreaProvider>
    </ClerkProvider>
  );
}
