import { FontAwesome5 } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

type SocialProvider = "google" | "facebook" | "apple";

const PROVIDERS: Record<SocialProvider, { icon: SocialProvider; color: string; label: string }> = {
  google: { icon: "google", color: "#EA4335", label: "Continue with Google" },
  facebook: { icon: "facebook", color: "#1877F2", label: "Continue with Facebook" },
  apple: { icon: "apple", color: "#000000", label: "Continue with Apple" },
};

type SocialButtonProps = {
  provider: SocialProvider;
  onPress: (() => void) | null;
};

export function SocialButton({ provider, onPress }: SocialButtonProps) {
  const { icon, color, label } = PROVIDERS[provider];
  const disabled = onPress === null;

  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.7}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      className={`flex-row items-center justify-center gap-3 rounded-2xl border py-4 ${
        disabled ? "border-border bg-surface" : "border-border bg-background"
      }`}
    >
      <FontAwesome5 name={icon} size={18} color={color} />
      <Text className={`text--h4 ${disabled ? "text-text-secondary" : "text-text-primary"}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
