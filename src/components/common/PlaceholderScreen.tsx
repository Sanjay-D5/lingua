import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme";

type PlaceholderScreenProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export function PlaceholderScreen({ title, icon }: PlaceholderScreenProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-surface">
          <Ionicons name={icon} size={36} color={colors.brand.linguaPurple} />
        </View>
        <Text className="text--h3 text-text-primary">{title}</Text>
        <Text className="text--body-medium text-text-secondary">Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
