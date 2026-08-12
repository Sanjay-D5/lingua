import { View } from "react-native";

type XPBarProps = {
  value: number;
  max: number;
};

export function XPBar({ value, max }: XPBarProps) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <View className="h-2 w-full overflow-hidden rounded-full bg-surface-warm-track">
      <View className="h-full rounded-full bg-streak" style={{ width: `${percent}%` }} />
    </View>
  );
}
