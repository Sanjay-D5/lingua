import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { CallingState, useStreamVideoClient, type Call } from "@stream-io/video-react-native-sdk";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { posthog } from "@/config/posthog";
import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { PLAN_ITEM_KINDS, isLessonCompleted } from "@/lib/lesson-progress";
import { createLessonCall, startLessonAgent, stopLessonAgent, type AgentStatus } from "@/lib/stream";
import { useProgressStore } from "@/store/progress-store";
import { colors } from "@/theme";

// Real call lifecycle, driven by Stream Video (see prompts/13-stream-integration.md):
// "connecting" while the call is being created/joined, "joined" once the SFU
// connection is up, "error" if joining failed, "ended" once the user leaves.
type CallStatus = "connecting" | "joined" | "error" | "ended";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

type ControlButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
};

function ControlButton({ icon, label, active, onPress }: ControlButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} accessibilityRole="button" className="items-center gap-2">
      <View
        className={`h-14 w-14 items-center justify-center rounded-full ${
          active ? "border border-border bg-background" : "bg-surface"
        }`}
      >
        <Ionicons name={icon} size={22} color={active ? colors.neutral.textPrimary : colors.neutral.textSecondary} />
      </View>
      <Text className="text--caption text-text-secondary">{label}</Text>
    </TouchableOpacity>
  );
}

// className "shadow-*" utilities aren't used here — see AGENTS.md "Style
// Exception Rules": shadows need StyleSheet with platform-specific props.
const styles = StyleSheet.create({
  cardShadow: Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 14 },
    android: { elevation: 6 },
    default: {},
  }),
});

export default function LessonDetail() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const streamClient = useStreamVideoClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const completedPlanItemIds = useProgressStore((state) => state.completedPlanItemIds);
  const togglePlanItem = useProgressStore((state) => state.togglePlanItem);

  const [call, setCall] = useState<Call>();
  const [callStatus, setCallStatus] = useState<CallStatus>("connecting");
  const [callError, setCallError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [subtitlesOn, setSubtitlesOn] = useState(true);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");
  const agentSessionIdRef = useRef<string | null>(null);

  const lesson = lessons.find((item) => item.id === id);
  const language = lesson ? languages.find((lang) => lang.id === lesson.languageId) : undefined;
  const isJoined = callStatus === "joined";

  // Idempotent: safe to call from both handleEndCall and the join effect's
  // unmount cleanup without double-stopping a session that's already gone.
  async function stopAgentSession() {
    const sessionId = agentSessionIdRef.current;
    if (!sessionId || !lesson) return;
    agentSessionIdRef.current = null;
    try {
      await stopLessonAgent(getToken, lesson.id, sessionId);
    } catch (err) {
      console.error("Failed to stop lesson agent", err);
    }
  }

  useEffect(() => {
    if (!streamClient || !lesson) return;

    let cancelled = false;
    let joinedCall: Call | undefined;

    (async () => {
      setCallStatus("connecting");
      setCallError(null);
      setAgentStatus("idle");
      try {
        const { callType, callId } = await createLessonCall(getToken, lesson.id);
        if (cancelled) return;
        // `{ reuseInstance: true }` is required on every destination call
        // screen — the same (type, id) may already be live in the SDK.
        const c = streamClient.call(callType, callId, { reuseInstance: true });
        joinedCall = c;
        setCall(c);

        await c.join({ create: true });
        // Audio-only lesson: never publish the camera. The on-screen "camera"
        // toggle only shows/hides the local avatar preview, it does not
        // control a real video track.
        await c.camera.disable().catch(() => {});
        if (!micOn) {
          await c.microphone.disable().catch(() => {});
        }
        if (cancelled) return;
        setCallStatus("joined");

        // Now that the student is in the call, have the AI teacher join too.
        setAgentStatus("connecting");
        try {
          const { sessionId } = await startLessonAgent(getToken, lesson.id);
          if (cancelled) {
            // Screen was unmounted mid-start — nothing else references this
            // session, so close it here instead of leaking it.
            stopLessonAgent(getToken, lesson.id, sessionId).catch((err) => console.error(err));
            return;
          }
          agentSessionIdRef.current = sessionId;
          setAgentStatus("connected");
        } catch (err) {
          console.error("Failed to start lesson agent", err);
          if (!cancelled) setAgentStatus("failed");
        }
      } catch (err) {
        console.error("Failed to join lesson call", err);
        if (!cancelled) {
          setCallStatus("error");
          setCallError(err instanceof Error ? err.message : "Couldn't connect to the lesson call.");
        }
      }
    })();

    return () => {
      cancelled = true;
      stopAgentSession();
      if (joinedCall && joinedCall.state.callingState !== CallingState.LEFT) {
        joinedCall.leave().catch((err) => console.error(err));
      }
    };
    // Mic start state is only applied once at join time — toggling afterwards
    // goes through handleToggleMic, so `micOn` is intentionally not a dep here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamClient, lesson?.id, retryCount]);

  useEffect(() => {
    if (!isJoined) return;
    const interval = setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => clearInterval(interval);
  }, [isJoined]);

  async function handleToggleMic() {
    const next = !micOn;
    setMicOn(next);
    if (!call) return;
    try {
      if (next) {
        await call.microphone.enable();
      } else {
        await call.microphone.disable();
      }
    } catch (err) {
      console.error("Failed to toggle microphone", err);
      setMicOn(!next);
    }
  }

  if (!lesson) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <View className="flex-1 items-center justify-center gap-3 px-6">
          <Text className="text--h4 text-text-primary">Lesson not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text--body-medium text-lingua-purple">Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completed = isLessonCompleted(lesson, completedPlanItemIds);
  const currentPhrase = lesson.phrases[phraseIndex % lesson.phrases.length];
  const bubblePrimary = isJoined ? currentPhrase.text : "Hi, I'm your AI teacher! 👋";
  const bubbleSecondary = isJoined ? currentPhrase.translation : lesson.aiTeacher.persona;

  async function handleEndCall() {
    if (!completed) {
      PLAN_ITEM_KINDS.forEach((kind) => {
        const itemId = `${lesson!.id}:${kind}`;
        if (!completedPlanItemIds.includes(itemId)) {
          togglePlanItem(itemId);
        }
      });
      posthog?.capture("lesson_completed", {
        language_id: lesson!.languageId,
        lesson_id: lesson!.id,
        xp_awarded: lesson!.xp,
      });
    }
    setCallStatus("ended");
    setAgentStatus("idle");
    await stopAgentSession();
    try {
      if (call && call.state.callingState !== CallingState.LEFT) {
        await call.leave();
      }
    } catch (err) {
      console.error("Failed to leave lesson call", err);
    }
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pt-2">
        <TouchableOpacity
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={26} color={colors.neutral.textPrimary} />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text--h4 text-text-primary">AI Teacher</Text>
          <View className="flex-row items-center gap-1.5">
            <View
              className={`h-2 w-2 rounded-full ${
                callStatus === "joined" ? "bg-success" : callStatus === "error" ? "bg-error" : "bg-text-secondary"
              }`}
            />
            <Text className="text--body-small text-text-secondary">
              {callStatus === "joined"
                ? "Online"
                : callStatus === "error"
                  ? "Connection error"
                  : callStatus === "ended"
                    ? "Call ended"
                    : "Connecting…"}
            </Text>
          </View>
          {isJoined ? (
            <View className="flex-row items-center gap-1.5">
              <View
                className={`h-2 w-2 rounded-full ${
                  agentStatus === "connected"
                    ? "bg-success"
                    : agentStatus === "failed"
                      ? "bg-error"
                      : "bg-text-secondary"
                }`}
              />
              <Text className="text--body-small text-text-secondary">
                AI teacher:{" "}
                {agentStatus === "connected"
                  ? "Ready"
                  : agentStatus === "failed"
                    ? "Couldn't connect"
                    : agentStatus === "connecting"
                      ? "Connecting…"
                      : "Waiting"}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            accessibilityLabel={cameraOn ? "Turn camera off" : "Turn camera on"}
            onPress={() => setCameraOn((value) => !value)}
            className="h-9 w-9 items-center justify-center rounded-full border border-border"
          >
            <Ionicons
              name={cameraOn ? "videocam-outline" : "videocam-off-outline"}
              size={18}
              color={colors.neutral.textPrimary}
            />
          </TouchableOpacity>
          <View accessibilityLabel="Session duration" className="h-9 w-9 items-center justify-center rounded-full border border-border">
            <Text className="text--caption text-text-primary">{formatDuration(elapsedSeconds)}</Text>
          </View>
          <TouchableOpacity
            accessibilityLabel={micOn ? "Mute microphone" : "Unmute microphone"}
            onPress={() => void handleToggleMic()}
            className="h-9 w-9 items-center justify-center rounded-full border border-border"
          >
            <Ionicons
              name={micOn ? "mic-outline" : "mic-off-outline"}
              size={18}
              color={colors.neutral.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* `relative` makes this View — not LinearGradient — the containing
          block for every absolutely-positioned child below. LinearGradient's
          web output doesn't reliably forward a sized positioning context to
          its children, which left the pill/preview/bubble collapsing to the
          top of the screen instead of anchoring inside this card. */}
      <View className="relative mx-5 mb-5 mt-3 flex-1 overflow-hidden rounded-3xl">
        <LinearGradient
          colors={["#EFE7FB", "#FDF1E3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.3, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View className="flex-1 items-center justify-center px-6">
          <Image source={images.mascotWelcome} style={{ width: 220, height: 220 }} resizeMode="contain" />
        </View>

        <View className="absolute left-3 top-3 max-w-[68%] gap-0.5 rounded-2xl bg-background px-3 py-2" style={styles.cardShadow}>
          <View className="flex-row items-center gap-1.5">
            {completed ? <Ionicons name="checkmark-circle" size={13} color={colors.semantic.success} /> : null}
            <Text className="text--caption text-text-secondary" numberOfLines={1}>
              {language?.flagEmoji} {language?.name} • Lesson {lesson.order}
            </Text>
          </View>
          <Text className="text--h4 text-text-primary" numberOfLines={1}>
            {lesson.title}
          </Text>
          <Text className="text--caption text-text-secondary" numberOfLines={2}>
            {lesson.goal}
          </Text>
        </View>

        {cameraOn ? (
          <View
            className="absolute right-3 top-3 h-32 w-24 overflow-hidden rounded-2xl border-2 border-background"
            style={styles.cardShadow}
          >
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <View className="h-full w-full items-center justify-center bg-surface">
                <Ionicons name="person" size={28} color={colors.neutral.textSecondary} />
              </View>
            )}
          </View>
        ) : null}

        <View
          className="absolute inset-x-4 bottom-4 flex-row items-start gap-3 rounded-2xl bg-background p-4"
          style={styles.cardShadow}
        >
          {callStatus === "error" ? (
            <View className="flex-1 gap-1">
              <Text className="text--h4 text-error">Couldn&apos;t connect</Text>
              <Text className="text--body-medium text-text-secondary">
                {callError ?? "Something went wrong starting this lesson."}
              </Text>
            </View>
          ) : (
            <View className="flex-1 gap-1">
              <Text className="text--h4 text-text-primary">{bubblePrimary}</Text>
              {subtitlesOn ? <Text className="text--body-medium text-text-secondary">{bubbleSecondary}</Text> : null}
            </View>
          )}
          {callStatus === "error" || agentStatus === "failed" ? (
            <TouchableOpacity
              accessibilityLabel="Try connecting again"
              onPress={() => setRetryCount((count) => count + 1)}
              className="h-9 w-9 items-center justify-center rounded-full bg-on-brand-subtle"
            >
              <Ionicons name="refresh" size={18} color={colors.brand.linguaPurple} />
            </TouchableOpacity>
          ) : isJoined ? (
            <TouchableOpacity
              accessibilityLabel="Hear the next phrase"
              onPress={() => setPhraseIndex((index) => (index + 1) % lesson.phrases.length)}
              className="h-9 w-9 items-center justify-center rounded-full bg-on-brand-subtle"
            >
              <Ionicons name="volume-high" size={18} color={colors.brand.linguaPurple} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View className="flex-row items-start justify-between px-8 pb-5">
        <ControlButton
          icon={cameraOn ? "videocam" : "videocam-off"}
          label="Camera"
          active={cameraOn}
          onPress={() => setCameraOn((value) => !value)}
        />
        <ControlButton icon={micOn ? "mic" : "mic-off"} label="Mic" active={micOn} onPress={() => void handleToggleMic()} />
        <ControlButton
          icon="language"
          label="Subtitles"
          active={subtitlesOn}
          onPress={() => setSubtitlesOn((value) => !value)}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => void handleEndCall()}
          accessibilityRole="button"
          accessibilityLabel="End call"
          className="items-center gap-2"
        >
          <View className="h-14 w-14 items-center justify-center rounded-full bg-error">
            <Ionicons name="call" size={22} color="#FFFFFF" style={{ transform: [{ rotate: "135deg" }] }} />
          </View>
          <Text className="text--caption text-text-secondary">End Call</Text>
        </TouchableOpacity>
      </View>

      <View className="mx-5 mb-6 flex-row rounded-2xl border border-border bg-background py-4">
        <View className="flex-1 items-center gap-1">
          <Text className="text--body-small text-text-primary">Speaking</Text>
          <Text className="text--h4 text-success">Excellent</Text>
        </View>
        <View className="w-px bg-border" />
        <View className="flex-1 items-center gap-1">
          <Text className="text--body-small text-text-primary">Pronunciation</Text>
          <Text className="text--h4 text-info">Great</Text>
        </View>
        <View className="w-px bg-border" />
        <View className="flex-1 items-center gap-1">
          <Text className="text--body-small text-text-primary">Grammar</Text>
          <Text className="text--h4 text-lingua-purple">Good</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
