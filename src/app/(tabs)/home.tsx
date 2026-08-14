import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TodayPlanItem } from "@/components/home/TodayPlanItem";
import { XPBar } from "@/components/home/XPBar";
import { posthog } from "@/config/posthog";
import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { units } from "@/data/units";
import { useLanguageStore } from "@/store/language-store";
import { useProgressStore } from "@/store/progress-store";
import { colors } from "@/theme";
import type { Lesson } from "@/types/learning";

const DAILY_GOAL_XP = 20;
const AI_CONVERSATION_XP = 5;
const NEW_WORDS_XP = 5;

function findGreetingWord(languageId: string) {
  const helloVocab = lessons
    .filter((lesson) => lesson.languageId === languageId)
    .flatMap((lesson) => lesson.vocabulary)
    .find((vocab) => vocab.translation === "Hello");
  return helloVocab?.term ?? "Hi";
}

// Must match the ":kind" suffixes used to build each planItems id below.
const PLAN_ITEM_KINDS = ["lesson", "conversation", "words"] as const;

function findCurrentLesson(languageId: string, completedPlanItemIds: string[]): Lesson | undefined {
  const languageLessons = lessons
    .filter((lesson) => lesson.languageId === languageId)
    .sort((a, b) => a.order - b.order);

  const nextIncomplete = languageLessons.find((lesson) =>
    PLAN_ITEM_KINDS.some((kind) => !completedPlanItemIds.includes(`${lesson.id}:${kind}`)),
  );

  return nextIncomplete ?? languageLessons[languageLessons.length - 1];
}

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);
  const completedPlanItemIds = useProgressStore((state) => state.completedPlanItemIds);
  const streak = useProgressStore((state) => state.streak);
  const togglePlanItem = useProgressStore((state) => state.togglePlanItem);
  const hasHydrated = useProgressStore((state) => state.hasHydrated);

  const language = languages.find((lang) => lang.id === selectedLanguageId) ?? languages[0];
  const currentLesson = findCurrentLesson(language.id, completedPlanItemIds);
  const currentUnit = units.find((unit) => unit.id === currentLesson?.unitId);
  const greetingWord = findGreetingWord(language.id);
  const firstName = user?.firstName ?? "there";

  // Wait for AsyncStorage to finish restoring progress before rendering —
  // otherwise a tap here could be silently overwritten by rehydration,
  // the same race language-selection.tsx guards against for language-store.
  if (!hasHydrated || !currentLesson || !currentUnit) {
    return null;
  }

  const planItems = [
    {
      id: `${currentLesson.id}:lesson`,
      icon: "book" as const,
      iconBgClassName: "bg-lingua-purple",
      title: "Lesson",
      subtitle: currentLesson.title,
      xp: currentLesson.xp,
    },
    {
      id: `${currentLesson.id}:conversation`,
      icon: "headset" as const,
      iconBgClassName: "bg-lingua-purple",
      title: "AI Conversation",
      subtitle: "Practice speaking",
      xp: AI_CONVERSATION_XP,
    },
    {
      id: `${currentLesson.id}:words`,
      icon: "chatbubbles" as const,
      iconBgClassName: "bg-error",
      title: "New words",
      subtitle: `${currentLesson.vocabulary.length} words`,
      xp: NEW_WORDS_XP,
    },
  ];

  const xpToday = planItems.reduce((sum, item) => (completedPlanItemIds.includes(item.id) ? sum + item.xp : sum), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={["top"]}>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-5 px-5 pb-8 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-surface">
              <Text className="text-lg">{language.flagEmoji}</Text>
            </View>
            <Text className="text--h3 text-text-primary">
              {greetingWord}, {firstName}! 👋
            </Text>
          </View>

          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1">
              <Image source={images.streakFire} style={{ height: 22, width: 22 }} resizeMode="contain" />
              <Text className="text--h4 text-text-primary">{streak}</Text>
            </View>
            <Ionicons name="notifications-outline" size={22} color={colors.neutral.textPrimary} />
          </View>
        </View>

        {/* Daily goal */}
        <View className="flex-row items-center justify-between rounded-2xl bg-surface-warm p-4">
          <View className="flex-1 gap-2 pr-3">
            <Text className="text--body-medium text-text-primary">Daily goal</Text>
            <Text className="text--h1 text-text-primary">
              {xpToday}
              <Text className="text--h4 text-text-secondary"> / {DAILY_GOAL_XP} XP</Text>
            </Text>
            <XPBar value={xpToday} max={DAILY_GOAL_XP} />
          </View>
          <Image source={images.treasure} style={{ height: 72, width: 72 }} resizeMode="contain" />
        </View>

        {/* Continue learning */}
        {/* Styled with `style` instead of `className` — this NativeWind preview
            doesn't apply classNames to LinearGradient, and rounding/clipping a
            gradient needs to live on the gradient itself, not a wrapper View. */}
        <LinearGradient
          colors={[colors.brand.linguaPurple, colors.brand.linguaDeepPurple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flexDirection: "row", borderRadius: 20, overflow: "hidden", height: 210 }}
        >
          <View className="flex-1 justify-center gap-3 p-5">
            <Text className="text--body-medium text-on-brand-subtle">Continue learning</Text>
            <Text className="text--h1 text-white">{language.name}</Text>
            <Text className="text--body-medium text-on-brand-subtle">A1 • Unit {currentUnit.order}</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/(tabs)/learn")}
              className="mt-1 self-start rounded-full bg-white px-6 py-3"
            >
              <Text className="text--h4 text-lingua-purple">Continue</Text>
            </TouchableOpacity>
          </View>

          <Image source={images.palace} style={{ width: 150, height: "100%" }} resizeMode="cover" />
        </LinearGradient>

        {/* Today's plan */}
        <View className="gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="text--h4 text-text-primary">Today&apos;s plan</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/(tabs)/learn")}>
              <Text className="text--body-medium text-lingua-purple">View all</Text>
            </TouchableOpacity>
          </View>

          <View>
            {planItems.map((item) => (
              <TodayPlanItem
                key={item.id}
                icon={item.icon}
                iconBgClassName={item.iconBgClassName}
                title={item.title}
                subtitle={item.subtitle}
                completed={completedPlanItemIds.includes(item.id)}
                onToggle={() => {
                  if (!completedPlanItemIds.includes(item.id)) {
                    posthog?.capture("daily_plan_item_completed", {
                      language_id: language.id,
                      lesson_id: currentLesson.id,
                      plan_item_type: item.id.split(":")[1],
                      xp_awarded: item.xp,
                    });
                  }
                  togglePlanItem(item.id);
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
