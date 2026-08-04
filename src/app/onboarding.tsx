import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";

export default function Onboarding() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View className="flex-1 px-6 pb-6">
        <View className="gap-6">
          <View className="flex-row items-center justify-center gap-2 pt-4">
            {/* Image needs an explicit style size: RN auto-sizes local require()'d images to
                their native pixel dimensions unless style.width/height is set, and that
                inline style always wins over a NativeWind className. */}
            <Image source={images.mascotLogo} style={{ height: 40, width: 40 }} resizeMode="contain" />
            <Text className="text--h1 text-text-primary">lingua</Text>
          </View>

          <View className="gap-3">
            <Text className="text--h1 text-text-primary">
              Your AI language{"\n"}
              <Text className="text-lingua-purple">teacher.</Text>
            </Text>
            <Text className="text--body-large text-text-secondary">
              Real conversations, personalized lessons, anytime, anywhere.
            </Text>
          </View>
        </View>

        <View className="relative flex-1 items-center justify-center">
          <View className="absolute left-2 top-1/4 rounded-2xl bg-lingua-blue/10 px-4 py-2">
            <Text className="text--body-medium text-text-primary">Hello!</Text>
          </View>
          <View className="absolute right-4 top-[38%] rounded-2xl bg-lingua-purple/10 px-4 py-2">
            <Text className="text--body-medium text-lingua-purple">¡Hola!</Text>
          </View>
          <View className="absolute right-0 top-[58%] rounded-2xl bg-streak/10 px-4 py-2">
            <Text className="text--body-medium text-error">你好!</Text>
          </View>

          <Image source={images.mascotWelcome} style={{ height: 320, width: 320 }} resizeMode="contain" />
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          className="flex-row items-center justify-center gap-2 rounded-full bg-lingua-purple py-4"
        >
          <Text className="text--h4 text-white">Get Started</Text>
          <Text className="text--h4 text-white">{"›"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
