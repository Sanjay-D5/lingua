// Core types for the hardcoded learning content system.
// Content lives in data/languages.ts, data/units.ts, and data/lessons.ts.
// Progress (completed lessons, XP, streaks) is NOT stored here — that lives in Zustand.

export type LanguageId = "es" | "fr" | "ja";

export interface Language {
  id: LanguageId;
  name: string;
  nativeName: string;
  flagEmoji: string;
  learners: string;
  popular: boolean;
}

export interface Unit {
  id: string;
  languageId: LanguageId;
  order: number;
  title: string;
  description: string;
}

export interface VocabularyItem {
  id: string;
  term: string;
  translation: string;
  pronunciation?: string;
}

export interface Phrase {
  id: string;
  text: string;
  translation: string;
  context?: string;
}

export type ActivityType = "vocabulary" | "phrase" | "listening" | "speaking";

export interface Activity {
  id: string;
  type: ActivityType;
  prompt: string;
  vocabularyId?: string;
  phraseId?: string;
}

// Context fed to the Vision Agent AI teacher for this lesson's audio session.
// Keeps the teacher scoped to this lesson only (see prompts/16-ai-teacher-improvements.md).
export interface AITeacherContext {
  persona: string;
  focus: string;
  kickoffPrompt: string;
}

export interface Lesson {
  id: string;
  languageId: LanguageId;
  unitId: string;
  order: number;
  title: string;
  goal: string;
  description: string;
  xp: number;
  icon: string;
  vocabulary: VocabularyItem[];
  phrases: Phrase[];
  activities: Activity[];
  aiTeacher: AITeacherContext;
}
