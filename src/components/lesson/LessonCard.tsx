import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/theme";
import type { Lesson } from "@/types/learning";

export type LessonStatus = "completed" | "in-progress" | "upcoming";

type LessonCardProps = {
  lesson: Lesson;
  status: LessonStatus;
  onPress: () => void;
};

export function LessonCard({ lesson, status, onPress }: LessonCardProps) {
  const isInProgress = status === "in-progress";
  const isCompleted = status === "completed";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Lesson ${lesson.order}, ${lesson.title}, ${status.replace("-", " ")}`}
      className={`flex-row items-center justify-between rounded-2xl border px-4 py-4 ${
        isInProgress ? "border-2 border-lingua-purple bg-on-brand-subtle" : "border-border bg-background"
      }`}
    >
      <View className="flex-1 gap-0.5 pr-3">
        <Text className={`text--body-small ${isInProgress ? "text-lingua-purple" : "text-text-secondary"}`}>
          Lesson {lesson.order}
        </Text>
        <Text className={`text--h4 ${isInProgress ? "text-lingua-purple" : "text-text-primary"}`}>{lesson.title}</Text>
        {isInProgress ? (
          <Text className="text--body-small text-lingua-purple">In progress</Text>
        ) : !isCompleted ? (
          <Text className="text--body-small text-text-secondary">
            {lesson.vocabulary.length} words • {lesson.xp} XP
          </Text>
        ) : null}
      </View>

      {isCompleted ? (
        <View className="h-8 w-8 items-center justify-center rounded-full bg-success">
          <Ionicons name="checkmark" size={18} color="#FFFFFF" />
        </View>
      ) : isInProgress ? (
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-background">
          <Text className="text-2xl">{lesson.icon}</Text>
        </View>
      ) : (
        <Ionicons name="lock-closed" size={20} color={colors.neutral.textSecondary} />
      )}
    </TouchableOpacity>
  );
}
