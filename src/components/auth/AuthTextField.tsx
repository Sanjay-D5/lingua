import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { colors } from "@/theme";

type AuthTextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
};

export function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
}: AuthTextFieldProps) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View className="rounded-2xl border border-border px-4 py-2">
      <Text className="text--caption text-text-secondary">{label}</Text>
      <View className="flex-row items-center">
        <TextInput
          className="text--body-large flex-1 py-1 text-text-primary"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral.textSecondary}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel={label}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setHidden((prev) => !prev)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
          >
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.neutral.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
