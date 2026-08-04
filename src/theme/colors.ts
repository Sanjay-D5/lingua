/**
 * Color tokens from the design system (prompt_material/01-design-system.png).
 * Keep in sync with the `@theme` block in src/global.css.
 *
 * Use NativeWind classNames (e.g. `bg-lingua-purple`, `text-text-primary`)
 * everywhere you can. Reach for these constants only for RN components/props
 * that don't accept className — see AGENTS.md "Style Exception Rules".
 */

export const colors = {
  brand: {
    linguaPurple: "#6C4EF5",
    linguaDeepPurple: "#5B3BF6",
    linguaBlue: "#4D8BFF",
    linguaGreen: "#21C16B",
  },
  semantic: {
    success: "#21C16B",
    warning: "#FFC800",
    streak: "#FF8A00",
    error: "#FF4D4F",
    info: "#4D8BFF",
  },
  neutral: {
    textPrimary: "#0D132B",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    surface: "#F6F7FB",
    background: "#FFFFFF",
  },
} as const;
