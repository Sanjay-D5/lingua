import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

type TodayPlanItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBgClassName: string;
  title: string;
  subtitle: string;
  completed: boolean;
  onToggle: () => void;
};

export function TodayPlanItem({ icon, iconBgClassName, title, subtitle, completed, onToggle }: TodayPlanItemProps) {
  return (
    <View className="flex-row items-center gap-3 py-2">
      <View className={`h-11 w-11 items-center justify-center rounded-xl ${iconBgClassName}`}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text--h4 text-text-primary">{title}</Text>
        <Text className="text--body-small text-text-secondary">{subtitle}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: completed }}
        hitSlop={8}
        className={`h-7 w-7 items-center justify-center rounded-full ${
          completed ? "bg-lingua-purple" : "border-2 border-border"
        }`}
      >
        {completed ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
      </TouchableOpacity>
    </View>
  );
}
