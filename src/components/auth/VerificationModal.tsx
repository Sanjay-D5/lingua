import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/theme";

const CODE_LENGTH = 6;

type VerificationModalProps = {
  visible: boolean;
  email: string;
  challengeId: string;
  onClose: () => void;
  onVerifyCode: (code: string, challengeId: string) => Promise<boolean>;
};

export function VerificationModal({
  visible,
  email,
  challengeId,
  onClose,
  onVerifyCode,
}: VerificationModalProps) {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => setKeyboardHeight(e.endCoordinates.height));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const focusInput = () => {
    // Android's Modal renders its content in a separate native window; focusing
    // immediately on show can race with that window becoming interactive, so the
    // keyboard silently never opens. A short delay avoids that race.
    setTimeout(() => inputRef.current?.focus(), Platform.OS === "android" ? 250 : 0);
  };

  const submitCode = async (digits: string) => {
    if (!challengeId) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await onVerifyCode(digits, challengeId);

      if (success) {
        onClose();
        router.replace("/");
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch {
      setError("Unable to verify code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeCode = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "").slice(0, CODE_LENGTH);
    setCode(digits);

    if (digits.length === CODE_LENGTH) {
      submitCode(digits);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => {
        setCode("");
        setError(null);
        focusInput();
      }}
    >
      <View style={{ flex: 1 }}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
          <Pressable
            onPress={focusInput}
            style={{ marginBottom: keyboardHeight }}
            className="gap-6 rounded-t-3xl bg-background px-6 pb-10 pt-6"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text--h3 text-text-primary">Check your email</Text>
              <TouchableOpacity onPress={onClose} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.neutral.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text className="text--body-medium text-text-secondary">
              We sent a 6-digit verification code to{" "}
              <Text className="text-text-primary">{email || "your email"}</Text>. Enter it below to continue.
            </Text>

            <View className="relative">
              <View className="flex-row justify-between">
                {Array.from({ length: CODE_LENGTH }).map((_, index) => (
                  <View
                    key={index}
                    className={`h-14 w-12 items-center justify-center rounded-2xl border bg-surface ${
                      index === code.length ? "border-lingua-purple" : "border-border"
                    }`}
                  >
                    <Text className="text--h3 text-text-primary">{code[index] ?? ""}</Text>
                  </View>
                ))}
              </View>

              {error ? (
                <Text className="mt-3 text--caption text-error">{error}</Text>
              ) : null}

              {/* Invisible input laid over the boxes: a real, full-size tap target
                  for the OS keyboard, instead of a hidden 1px input relying only on
                  programmatic focus. */}
              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={handleChangeCode}
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
                autoFocus
                accessibilityLabel="Verification code input"
                accessibilityHint="Enter the six-digit code sent to your email"
                className="absolute inset-0 opacity-0"
              />
            </View>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  );
}
