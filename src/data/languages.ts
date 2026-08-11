import type { Language, LanguageId } from "@/types/learning";

export const supportedLanguageIds: LanguageId[] = ["es", "fr", "ja"];

export const languages: Language[] = [
  {
    id: "es",
    name: "Spanish",
    nativeName: "Español",
    flagEmoji: "🇪🇸",
    learners: "28.4M learners",
    popular: true,
  },
  {
    id: "fr",
    name: "French",
    nativeName: "Français",
    flagEmoji: "🇫🇷",
    learners: "19.4M learners",
    popular: true,
  },
  {
    id: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flagEmoji: "🇯🇵",
    learners: "12.7M learners",
    popular: true,
  },
];
