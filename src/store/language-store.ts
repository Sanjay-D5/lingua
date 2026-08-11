import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { LanguageId } from "@/types/learning";

interface LanguageStore {
  selectedLanguageId: LanguageId | null;
  setSelectedLanguage: (languageId: LanguageId) => void;
  clearSelectedLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      selectedLanguageId: null,
      setSelectedLanguage: (languageId) => set({ selectedLanguageId: languageId }),
      clearSelectedLanguage: () => set({ selectedLanguageId: null }),
    }),
    {
      name: "language-selection-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
