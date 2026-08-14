import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LessonCard, type LessonStatus } from "@/components/lesson/LessonCard";
import { posthog } from "@/config/posthog";
import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { units } from "@/data/units";
import { findCurrentLesson, isLessonCompleted } from "@/lib/lesson-progress";
import { useLanguageStore } from "@/store/language-store";
import { useProgressStore } from "@/store/progress-store";
import { colors } from "@/theme";
import type { Lesson } from "@/types/learning";

function getLessonStatus(lesson: Lesson, currentLesson: Lesson, completedPlanItemIds: string[]): LessonStatus {
  if (isLessonCompleted(lesson, completedPlanItemIds)) {
    return "completed";
  }
  return lesson.id === currentLesson.id ? "in-progress" : "upcoming";
}

export default function Learn() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<"lessons" | "practice">("lessons");
  const [isSaved, setIsSaved] = useState(false);

  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);
  const completedPlanItemIds = useProgressStore((state) => state.completedPlanItemIds);
  const hasHydrated = useProgressStore((state) => state.hasHydrated);

  const language = languages.find((lang) => lang.id === selectedLanguageId) ?? languages[0];
  const languageLessons = useMemo(
    () => lessons.filter((lesson) => lesson.languageId === language.id).sort((a, b) => a.order - b.order),
    [language.id],
  );
  const currentUnit = units.find((unit) => unit.languageId === language.id);

  // Wait for AsyncStorage to finish restoring progress before rendering —
  // otherwise every lesson would briefly render as "upcoming".
  if (!hasHydrated || !currentUnit || languageLessons.length === 0) {
    return null;
  }

  const currentLesson = findCurrentLesson(language.id, completedPlanItemIds) ?? languageLessons[0];
  const completedCount = languageLessons.filter((lesson) => isLessonCompleted(lesson, completedPlanItemIds)).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }} edges={["top"]}>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2">
          <TouchableOpacity
            accessibilityLabel="Go back"
            onPress={() => router.push("/(tabs)/home")}
            hitSlop={12}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={26} color={colors.neutral.textPrimary} />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <Text className="text--h3 text-text-primary" numberOfLines={1}>
              {currentUnit.title}
            </Text>
            <Text className="text--body-small text-text-secondary">
              Unit {currentUnit.order} • {completedCount}/{languageLessons.length} lessons
            </Text>
          </View>

          <TouchableOpacity
            accessibilityLabel={isSaved ? "Remove bookmark" : "Bookmark this unit"}
            accessibilityState={{ selected: isSaved }}
            onPress={() => setIsSaved((prev) => !prev)}
            hitSlop={12}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={22} color={colors.brand.linguaPurple} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" contentContainerClassName="pb-8" showsVerticalScrollIndicator={false}>
          <View>
            {/* palace.png is a square (1:1) source image — sizing it to the full
                screen width (in real pixels, not a percentage) and clipping the
                wrapper keeps it anchored to the top so nothing above the crop
                line is cut off, instead of resizeMode="cover" center-cropping it. */}
            <View style={{ width, height: 200, overflow: "hidden" }}>
              <Image source={images.palace} style={{ width, height: width }} resizeMode="cover" />
            </View>

            {/* Segmented control, overlapping the hero image bottom edge */}
            <View className="items-center px-8" style={{ marginTop: -24 }}>
              <View className="w-full flex-row rounded-full border border-border bg-background p-1">
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setActiveTab("lessons")}
                  className={`flex-1 items-center rounded-full py-2.5 ${activeTab === "lessons" ? "bg-on-brand-subtle" : ""}`}
                >
                  <Text className={`text--h4 ${activeTab === "lessons" ? "text-lingua-purple" : "text-text-secondary"}`}>
                    Lessons
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setActiveTab("practice")}
                  className={`flex-1 items-center rounded-full py-2.5 ${activeTab === "practice" ? "bg-on-brand-subtle" : ""}`}
                >
                  <Text className={`text--h4 ${activeTab === "practice" ? "text-lingua-purple" : "text-text-secondary"}`}>
                    Practice
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {activeTab === "lessons" ? (
            <View className="gap-3 px-5 pt-6">
              {languageLessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  status={getLessonStatus(lesson, currentLesson, completedPlanItemIds)}
                  onPress={() => {
                    posthog?.capture("lesson_opened", { language_id: language.id, lesson_id: lesson.id });
                    router.push({ pathname: "/lesson/[id]", params: { id: lesson.id } });
                  }}
                />
              ))}
            </View>
          ) : (
            <View className="items-center gap-3 px-8 pt-16">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
                <Ionicons name="barbell-outline" size={28} color={colors.brand.linguaPurple} />
              </View>
              <Text className="text--h4 text-text-primary">Practice mode coming soon</Text>
              <Text className="text--body-medium text-center text-text-secondary">
                Review vocabulary and phrases from lessons you&apos;ve completed.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
