import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLanguageStore } from "@/store/language-store";

export default function Index() {
  const router = useRouter();
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);
  const clearSelectedLanguage = useLanguageStore((state) => state.clearSelectedLanguage);

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 items-center justify-center gap-6 bg-background px-6">
        <Text className="text--h1 text-lingua-purple">Lingua</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/language-selection")}
          className="items-center rounded-2xl border border-border px-8 py-4"
        >
          <Text className="text--h4 text-text-primary">Choose a language</Text>
        </TouchableOpacity>

        <Text className="text--body-large text-text-secondary">
          Selected language: {selectedLanguageId ?? "Not set"}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => clearSelectedLanguage()}
          className="items-center rounded-2xl border border-border px-8 py-4"
        >
          <Text className="text--h4 text-text-primary">Clear language selection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => signOut()}
          className="items-center rounded-2xl bg-lingua-purple px-8 py-4"
        >
          <Text className="text--h4 text-white">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
