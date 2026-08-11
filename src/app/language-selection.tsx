import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LanguageCard } from "@/components/language/LanguageCard";
import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { useLanguageStore } from "@/store/language-store";
import { colors } from "@/theme";
import type { LanguageId } from "@/types/learning";

export default function LanguageSelection() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState("");
  const selectedLanguageId = useLanguageStore((state) => state.selectedLanguageId);
  const setSelectedLanguage = useLanguageStore((state) => state.setSelectedLanguage);
  const validSelectedLanguageId =
    selectedLanguageId && languages.some((language) => language.id === selectedLanguageId)
      ? selectedLanguageId
      : languages[0].id;
  const [selectedId, setSelectedId] = useState<LanguageId>(validSelectedLanguageId);

  const filteredLanguages = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return languages;
    }
    return languages.filter((language) => language.name.toLowerCase().includes(search));
  }, [query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1">
        {/* Pinned to the screen bottom (not the scroll content) and left partly
            uncropped so the globe bleeds off the edge, matching the design. */}
        <Image
          source={images.earth}
          resizeMode="contain"
          style={{
            position: "absolute",
            bottom: -width * 0.32,
            left: 0,
            width,
            height: width, // earth.png is a 1:1 square — aspectRatio isn't respected by Image here
          }}
        />

        <View className="flex-row items-center justify-between px-6 pt-2">
          <TouchableOpacity
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            hitSlop={12}
            className="h-10 w-10 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={26} color={colors.neutral.textPrimary} />
          </TouchableOpacity>
          <Text className="text--h3 text-text-primary">Choose a language</Text>
          <View className="h-10 w-10" />
        </View>

        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          {/* Opaque wrapper so the pinned earth image only peeks out below this
              content, not through the gaps between cards while scrolling over it. */}
          <View className="gap-4 bg-background px-6 pb-8 pt-4">
            <View className="flex-row items-center gap-3 rounded-full bg-surface px-4 py-3">
              <Ionicons name="search" size={20} color={colors.neutral.textSecondary} />
              <TextInput
                className="text--body-large flex-1 text-text-primary"
                value={query}
                onChangeText={setQuery}
                placeholder="Search languages"
                placeholderTextColor={colors.neutral.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                accessibilityLabel="Search languages"
              />
            </View>

            <Text className="text--h4 text-text-primary">Popular</Text>

            <View className="gap-3">
              {filteredLanguages.map((language) => (
                <LanguageCard
                  key={language.id}
                  language={language}
                  selected={language.id === selectedId}
                  onPress={() => setSelectedId(language.id)}
                />
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setSelectedLanguage(selectedId);
                router.back();
              }}
              className="items-center rounded-full bg-lingua-purple py-4"
            >
              <Text className="text--h4 text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
