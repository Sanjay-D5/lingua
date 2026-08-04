import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";

const typographyRows = [
  { label: "H1", className: "text--h1" },
  { label: "H2", className: "text--h2" },
  { label: "H3", className: "text--h3" },
  { label: "H4", className: "text--h4" },
  { label: "Body Large", className: "text--body-large" },
  { label: "Body Medium", className: "text--body-medium" },
  { label: "Body Small", className: "text--body-small" },
  { label: "Caption", className: "text--caption" },
];

const colorSwatches = [
  { label: "Lingua Purple", className: "bg-lingua-purple" },
  { label: "Lingua Deep Purple", className: "bg-lingua-deep-purple" },
  { label: "Lingua Blue", className: "bg-lingua-blue" },
  { label: "Lingua Green", className: "bg-lingua-green" },
  { label: "Success", className: "bg-success" },
  { label: "Warning", className: "bg-warning" },
  { label: "Streak", className: "bg-streak" },
  { label: "Error", className: "bg-error" },
  { label: "Info", className: "bg-info" },
];

export default function Index() {
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-6 p-6">
      <Link href="/onboarding" className="text--body-large text-lingua-purple">
        View onboarding screen →
      </Link>

      <Text className="text--h2 text-text-primary">Typography</Text>
      <View className="gap-3">
        {typographyRows.map((row) => (
          <View key={row.label} className="flex-row items-baseline gap-3">
            <Text className={`${row.className} text-text-primary`}>Lingua {row.label}</Text>
            <Text className="text--caption text-text-secondary">{row.label}</Text>
          </View>
        ))}
      </View>

      <Text className="text--h2 text-text-primary">Colors</Text>
      <View className="flex-row flex-wrap gap-3">
        {colorSwatches.map((swatch) => (
          <View key={swatch.label} className="w-24 gap-2">
            <View className={`h-16 w-24 rounded-2xl border border-border ${swatch.className}`} />
            <Text className="text--caption text-text-secondary">{swatch.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
