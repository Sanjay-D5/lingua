import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme";

type TabConfig = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconOutline: keyof typeof Ionicons.glyphMap;
};

const TAB_CONFIG: Record<string, TabConfig> = {
  home: { label: "Home", icon: "home", iconOutline: "home-outline" },
  learn: { label: "Learn", icon: "book", iconOutline: "book-outline" },
  "ai-teacher": {
    label: "AI Teacher",
    icon: "hardware-chip",
    iconOutline: "hardware-chip-outline",
  },
  chat: { label: "Chat", icon: "chatbubble-ellipses", iconOutline: "chatbubble-ellipses-outline" },
  profile: { label: "Profile", icon: "person", iconOutline: "person-outline" },
};

const CIRCLE_SIZE = 52;
const BAR_HEIGHT = 64;

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);
  const translateX = useSharedValue(0);
  const hasPositioned = useRef(false);

  const activeRoute = state.routes[state.index];
  const activeConfig = TAB_CONFIG[activeRoute.name];

  useEffect(() => {
    if (barWidth === 0) {
      return;
    }
    const tabWidth = barWidth / state.routes.length;
    const target = tabWidth * state.index + tabWidth / 2 - CIRCLE_SIZE / 2;

    if (!hasPositioned.current) {
      hasPositioned.current = true;
      translateX.value = target;
    } else {
      translateX.value = withTiming(target, { duration: 260, easing: Easing.out(Easing.cubic) });
    }
  }, [barWidth, state.index, state.routes.length, translateX]);

  const circleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      className="border-t border-border bg-background"
    >
      <View
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        className="flex-row items-center"
        style={{ height: BAR_HEIGHT }}
      >
        {barWidth > 0 && activeConfig ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                top: (BAR_HEIGHT - CIRCLE_SIZE) / 2,
                width: CIRCLE_SIZE,
                height: CIRCLE_SIZE,
                borderRadius: CIRCLE_SIZE / 2,
                backgroundColor: colors.brand.linguaPurple,
                alignItems: "center",
                justifyContent: "center",
              },
              circleAnimatedStyle,
            ]}
          >
            <Ionicons name={activeConfig.icon} size={24} color="#FFFFFF" />
          </Animated.View>
        ) : null}

        {state.routes.map((route, index) => {
          const config = TAB_CONFIG[route.name];
          if (!config) {
            return null;
          }

          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? config.label}
              onPress={onPress}
              className="flex-1 items-center justify-center gap-1"
            >
              {!isFocused ? (
                <>
                  <Ionicons name={config.iconOutline} size={22} color={colors.neutral.textSecondary} />
                  <Text className="text--caption text-text-secondary">{config.label}</Text>
                </>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
