import { lessons } from "@/data/lessons";
import type { Lesson, LanguageId } from "@/types/learning";

// Must match the ":kind" suffixes used to build each plan/lesson item id
// across home.tsx, learn.tsx, and lesson/[id].tsx.
export const PLAN_ITEM_KINDS = ["lesson", "conversation", "words"] as const;

export function findCurrentLesson(languageId: LanguageId, completedPlanItemIds: string[]): Lesson | undefined {
  const languageLessons = lessons
    .filter((lesson) => lesson.languageId === languageId)
    .sort((a, b) => a.order - b.order);

  const nextIncomplete = languageLessons.find((lesson) =>
    PLAN_ITEM_KINDS.some((kind) => !completedPlanItemIds.includes(`${lesson.id}:${kind}`)),
  );

  return nextIncomplete ?? languageLessons[languageLessons.length - 1];
}

export function isLessonCompleted(lesson: Lesson, completedPlanItemIds: string[]): boolean {
  return PLAN_ITEM_KINDS.every((kind) => completedPlanItemIds.includes(`${lesson.id}:${kind}`));
}
