import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ProgressStore {
  // IDs of today's plan items the learner has checked off, e.g. "es-u1-l1:lesson".
  // XP earned "today" is derived from these — there's no daily-reset logic yet,
  // that can be added once streaks are tracked properly.
  completedPlanItemIds: string[];
  streak: number;
  hasHydrated: boolean;
  togglePlanItem: (planItemId: string) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set) => ({
      completedPlanItemIds: [],
      streak: 4,
      hasHydrated: false,
      togglePlanItem: (planItemId) =>
        set((state) => ({
          completedPlanItemIds: state.completedPlanItemIds.includes(planItemId)
            ? state.completedPlanItemIds.filter((id) => id !== planItemId)
            : [...state.completedPlanItemIds, planItemId],
        })),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "progress-store",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
