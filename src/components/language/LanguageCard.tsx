import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/theme";
import type { Language } from "@/types/learning";

type LanguageCardProps = {
  language: Language;
  selected: boolean;
  onPress: () => void;
};

export function LanguageCard({ language, selected, onPress }: LanguageCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
        selected ? "border-2 border-lingua-purple bg-lingua-purple/5" : "border-border bg-background"
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-surface">
          <Text className="text-2xl">{language.flagEmoji}</Text>
        </View>
        <View className="gap-0.5">
          <Text className="text--h4 text-text-primary">{language.name}</Text>
          <Text className="text--body-small text-text-secondary">{language.learners}</Text>
        </View>
      </View>

      {selected ? (
        <View className="h-7 w-7 items-center justify-center rounded-full bg-lingua-purple">
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.neutral.textSecondary} />
      )}
    </TouchableOpacity>
  );
}
