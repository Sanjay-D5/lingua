import { useSignIn, useSSO } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AuthTextField } from "@/components/auth/AuthTextField";
import { SocialButton } from "@/components/auth/SocialButton";
import { VerificationModal } from "@/components/auth/VerificationModal";
import { posthog } from "@/config/posthog";
import { images } from "@/constants/images";
import { colors } from "@/theme";

export default function SignIn() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();

  const [email, setEmail] = useState("");
  const [verificationVisible, setVerificationVisible] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setFormError(null);

    const { error } = await signIn.emailCode.sendCode({ emailAddress: email });
    if (error) {
      setFormError(error.message);
      return;
    }

    setChallengeId(`challenge-${Date.now()}`);
    setVerificationVisible(true);
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy: "oauth_google" });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        posthog?.capture("sign_in_completed", { method: "google" });
        router.replace("/");
      }
    } catch {
      setFormError("Unable to continue with Google. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-6"
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={26} color={colors.neutral.textPrimary} />
        </TouchableOpacity>

        <View className="gap-2">
          <Text className="text--h1 text-text-primary">Welcome back</Text>
          <Text className="text--body-large text-text-secondary">Continue your language journey ✨</Text>
        </View>

        <View className="relative items-center justify-center py-2">
          <Text className="absolute left-6 top-2 text--h4 text-warning">✨</Text>
          <Text className="absolute right-8 top-6 text--body-large text-lingua-blue">✦</Text>
          <Text className="absolute bottom-2 right-2 text--h4 text-lingua-purple">✦</Text>
          <Image source={images.mascotAuth} style={{ height: 170, width: 170 }} resizeMode="contain" />
        </View>

        <View className="gap-4">
          <AuthTextField
            label="Email"
            placeholder="alex@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        {formError ? <Text className="text--caption text-error">{formError}</Text> : null}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSignIn}
          disabled={fetchStatus === "fetching"}
          className="items-center rounded-2xl bg-lingua-purple py-4"
        >
          <Text className="text--h4 text-white">Sign In</Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border" />
          <Text className="text--caption text-text-secondary">or continue with</Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <View className="gap-3">
          <SocialButton provider="google" onPress={handleGoogleSignIn} />
          <SocialButton provider="facebook" onPress={null} />
          <SocialButton provider="apple" onPress={null} />
        </View>

        <View className="flex-row items-center justify-center gap-1 pt-4">
          <Text className="text--body-medium text-text-secondary">Don&apos;t have an account?</Text>
          <Link href="/sign-up" className="text--body-medium text-lingua-purple">
            Sign up
          </Link>
        </View>
      </ScrollView>

      <VerificationModal
        visible={verificationVisible}
        email={email}
        challengeId={challengeId}
        onVerifyCode={async (code) => {
          const { error } = await signIn.emailCode.verifyCode({ code });
          if (error) {
            return false;
          }

          if (signIn.status === "complete") {
            await signIn.finalize();
            posthog?.capture("sign_in_completed", { method: "email_code" });
          }

          return true;
        }}
        onClose={() => setVerificationVisible(false)}
      />
    </SafeAreaView>
  );
}
