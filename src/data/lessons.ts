import type { Lesson } from "@/types/learning";

// Beginner-friendly sample content for a few languages. Each lesson carries
// its own AI teacher context so the Vision Agent audio lesson can stay
// strictly scoped to that lesson's goal, vocabulary, and phrases.
export const lessons: Lesson[] = [
  // --- Spanish -------------------------------------------------------
  {
    id: "es-u1-l1",
    languageId: "es",
    unitId: "es-u1",
    order: 1,
    title: "Say Hello",
    goal: "Greet someone and say a polite goodbye in Spanish.",
    description: "Learn your first Spanish greetings and courtesy words.",
    xp: 10,
    icon: "👋",
    vocabulary: [
      { id: "es-u1-l1-v1", term: "Hola", translation: "Hello" },
      { id: "es-u1-l1-v2", term: "Buenos días", translation: "Good morning" },
      { id: "es-u1-l1-v3", term: "Adiós", translation: "Goodbye" },
      { id: "es-u1-l1-v4", term: "Por favor", translation: "Please" },
      { id: "es-u1-l1-v5", term: "Gracias", translation: "Thank you" },
    ],
    phrases: [
      {
        id: "es-u1-l1-p1",
        text: "¿Cómo te llamas?",
        translation: "What is your name?",
        context: "Asking for someone's name",
      },
      {
        id: "es-u1-l1-p2",
        text: "Me llamo ___.",
        translation: "My name is ___.",
        context: "Introducing yourself",
      },
    ],
    activities: [
      { id: "es-u1-l1-a1", type: "vocabulary", prompt: "How do you say 'hello' in Spanish?", vocabularyId: "es-u1-l1-v1" },
      { id: "es-u1-l1-a2", type: "vocabulary", prompt: "How do you say 'thank you' in Spanish?", vocabularyId: "es-u1-l1-v5" },
      { id: "es-u1-l1-a3", type: "phrase", prompt: "Ask someone their name in Spanish.", phraseId: "es-u1-l1-p1" },
      { id: "es-u1-l1-a4", type: "speaking", prompt: "Say 'Hola, me llamo ___' out loud." },
    ],
    aiTeacher: {
      persona: "a warm, energetic Spanish teacher who teaches through English",
      focus: "greeting someone and saying goodbye politely in Spanish",
      kickoffPrompt:
        "Greet the student warmly in English and welcome them to their first Spanish lesson. Introduce 'Hola' (hello) slowly with its translation, have them repeat it, then gently move to 'Adiós' (goodbye). Keep replies short, friendly, and encouraging. Stay only on this lesson's greetings — do not introduce other vocabulary or switch languages.",
    },
  },
  {
    id: "es-u1-l2",
    languageId: "es",
    unitId: "es-u1",
    order: 2,
    title: "Introduce Yourself",
    goal: "Say who you are and where you're from in Spanish.",
    description: "Put your greetings to work in a short self-introduction.",
    xp: 10,
    icon: "🙋",
    vocabulary: [
      { id: "es-u1-l2-v1", term: "Soy", translation: "I am" },
      { id: "es-u1-l2-v2", term: "De", translation: "From" },
      { id: "es-u1-l2-v3", term: "Mucho gusto", translation: "Nice to meet you" },
      { id: "es-u1-l2-v4", term: "¿Y tú?", translation: "And you?" },
    ],
    phrases: [
      {
        id: "es-u1-l2-p1",
        text: "Soy de ___.",
        translation: "I'm from ___.",
        context: "Saying where you're from",
      },
      {
        id: "es-u1-l2-p2",
        text: "Mucho gusto.",
        translation: "Nice to meet you.",
        context: "After being introduced to someone",
      },
    ],
    activities: [
      { id: "es-u1-l2-a1", type: "vocabulary", prompt: "How do you say 'I am' in Spanish?", vocabularyId: "es-u1-l2-v1" },
      { id: "es-u1-l2-a2", type: "phrase", prompt: "Say where you're from in Spanish.", phraseId: "es-u1-l2-p1" },
      { id: "es-u1-l2-a3", type: "speaking", prompt: "Introduce yourself using 'Soy ___, mucho gusto.'" },
    ],
    aiTeacher: {
      persona: "a warm, energetic Spanish teacher who teaches through English",
      focus: "introducing yourself with your name and where you're from in Spanish",
      kickoffPrompt:
        "Welcome the student back and build on the greetings they already know. Teach 'Soy de ___' (I'm from ___) slowly with a translation, then have them try introducing themselves. Encourage them warmly after each attempt and ask them to repeat if needed. Stay only on self-introductions — no unrelated vocabulary.",
    },
  },

  // --- French ----------------------------------------------------------
  {
    id: "fr-u1-l1",
    languageId: "fr",
    unitId: "fr-u1",
    order: 1,
    title: "Say Hello",
    goal: "Greet someone and say a polite goodbye in French.",
    description: "Learn your first French greetings and courtesy words.",
    xp: 10,
    icon: "👋",
    vocabulary: [
      { id: "fr-u1-l1-v1", term: "Bonjour", translation: "Hello" },
      { id: "fr-u1-l1-v2", term: "Bonsoir", translation: "Good evening" },
      { id: "fr-u1-l1-v3", term: "Au revoir", translation: "Goodbye" },
      { id: "fr-u1-l1-v4", term: "S'il vous plaît", translation: "Please" },
      { id: "fr-u1-l1-v5", term: "Merci", translation: "Thank you" },
    ],
    phrases: [
      {
        id: "fr-u1-l1-p1",
        text: "Comment tu t'appelles ?",
        translation: "What is your name?",
        context: "Asking for someone's name",
      },
      {
        id: "fr-u1-l1-p2",
        text: "Je m'appelle ___.",
        translation: "My name is ___.",
        context: "Introducing yourself",
      },
    ],
    activities: [
      { id: "fr-u1-l1-a1", type: "vocabulary", prompt: "How do you say 'hello' in French?", vocabularyId: "fr-u1-l1-v1" },
      { id: "fr-u1-l1-a2", type: "vocabulary", prompt: "How do you say 'thank you' in French?", vocabularyId: "fr-u1-l1-v5" },
      { id: "fr-u1-l1-a3", type: "phrase", prompt: "Ask someone their name in French.", phraseId: "fr-u1-l1-p1" },
      { id: "fr-u1-l1-a4", type: "speaking", prompt: "Say 'Bonjour, je m'appelle ___' out loud." },
    ],
    aiTeacher: {
      persona: "a warm, energetic French teacher who teaches through English",
      focus: "greeting someone and saying goodbye politely in French",
      kickoffPrompt:
        "Greet the student warmly in English and welcome them to their first French lesson. Introduce 'Bonjour' (hello) slowly with its translation, have them repeat it, then gently move to 'Au revoir' (goodbye). Keep replies short, friendly, and encouraging. Stay only on this lesson's greetings — do not introduce other vocabulary or switch languages.",
    },
  },
  {
    id: "fr-u1-l2",
    languageId: "fr",
    unitId: "fr-u1",
    order: 2,
    title: "Introduce Yourself",
    goal: "Say who you are and where you're from in French.",
    description: "Put your greetings to work in a short self-introduction.",
    xp: 10,
    icon: "🙋",
    vocabulary: [
      { id: "fr-u1-l2-v1", term: "Je suis", translation: "I am" },
      { id: "fr-u1-l2-v2", term: "De", translation: "From" },
      { id: "fr-u1-l2-v3", term: "Enchanté", translation: "Nice to meet you" },
      { id: "fr-u1-l2-v4", term: "Et toi ?", translation: "And you?" },
    ],
    phrases: [
      {
        id: "fr-u1-l2-p1",
        text: "Je suis de ___.",
        translation: "I'm from ___.",
        context: "Saying where you're from",
      },
      {
        id: "fr-u1-l2-p2",
        text: "Enchanté.",
        translation: "Nice to meet you.",
        context: "After being introduced to someone",
      },
    ],
    activities: [
      { id: "fr-u1-l2-a1", type: "vocabulary", prompt: "How do you say 'I am' in French?", vocabularyId: "fr-u1-l2-v1" },
      { id: "fr-u1-l2-a2", type: "phrase", prompt: "Say where you're from in French.", phraseId: "fr-u1-l2-p1" },
      { id: "fr-u1-l2-a3", type: "speaking", prompt: "Introduce yourself using 'Je suis ___, enchanté.'" },
    ],
    aiTeacher: {
      persona: "a warm, energetic French teacher who teaches through English",
      focus: "introducing yourself with your name and where you're from in French",
      kickoffPrompt:
        "Welcome the student back and build on the greetings they already know. Teach 'Je suis de ___' (I'm from ___) slowly with a translation, then have them try introducing themselves. Encourage them warmly after each attempt and ask them to repeat if needed. Stay only on self-introductions — no unrelated vocabulary.",
    },
  },

  // --- Japanese ----------------------------------------------------------
  {
    id: "ja-u1-l1",
    languageId: "ja",
    unitId: "ja-u1",
    order: 1,
    title: "Say Hello",
    goal: "Greet someone and say a polite goodbye in Japanese.",
    description: "Learn your first Japanese greetings and courtesy words.",
    xp: 10,
    icon: "👋",
    vocabulary: [
      { id: "ja-u1-l1-v1", term: "こんにちは", translation: "Hello", pronunciation: "Konnichiwa" },
      { id: "ja-u1-l1-v2", term: "さようなら", translation: "Goodbye", pronunciation: "Sayounara" },
      { id: "ja-u1-l1-v3", term: "お願いします", translation: "Please", pronunciation: "Onegaishimasu" },
      { id: "ja-u1-l1-v4", term: "ありがとう", translation: "Thank you", pronunciation: "Arigatou" },
    ],
    phrases: [
      {
        id: "ja-u1-l1-p1",
        text: "お名前は何ですか？",
        translation: "What is your name?",
        context: "Asking for someone's name",
      },
      {
        id: "ja-u1-l1-p2",
        text: "私の名前は___です。",
        translation: "My name is ___.",
        context: "Introducing yourself",
      },
    ],
    activities: [
      { id: "ja-u1-l1-a1", type: "vocabulary", prompt: "How do you say 'hello' in Japanese?", vocabularyId: "ja-u1-l1-v1" },
      { id: "ja-u1-l1-a2", type: "vocabulary", prompt: "How do you say 'thank you' in Japanese?", vocabularyId: "ja-u1-l1-v4" },
      { id: "ja-u1-l1-a3", type: "phrase", prompt: "Ask someone their name in Japanese.", phraseId: "ja-u1-l1-p1" },
      { id: "ja-u1-l1-a4", type: "speaking", prompt: "Say 'Konnichiwa, watashi no namae wa ___ desu' out loud." },
    ],
    aiTeacher: {
      persona: "a warm, energetic Japanese teacher who teaches through English",
      focus: "greeting someone and saying goodbye politely in Japanese",
      kickoffPrompt:
        "Greet the student warmly in English and welcome them to their first Japanese lesson. Introduce 'Konnichiwa' (hello) slowly with its translation, have them repeat it, then gently move to 'Sayounara' (goodbye). Keep replies short, friendly, and encouraging. Stay only on this lesson's greetings — do not introduce other vocabulary or switch languages.",
    },
  },
  {
    id: "ja-u1-l2",
    languageId: "ja",
    unitId: "ja-u1",
    order: 2,
    title: "Introduce Yourself",
    goal: "Say who you are and where you're from in Japanese.",
    description: "Put your greetings to work in a short self-introduction.",
    xp: 10,
    icon: "🙋",
    vocabulary: [
      { id: "ja-u1-l2-v1", term: "私は", translation: "I am", pronunciation: "Watashi wa" },
      { id: "ja-u1-l2-v2", term: "～から来ました", translation: "I come from ~", pronunciation: "~kara kimashita" },
      { id: "ja-u1-l2-v3", term: "はじめまして", translation: "Nice to meet you", pronunciation: "Hajimemashite" },
    ],
    phrases: [
      {
        id: "ja-u1-l2-p1",
        text: "私は___から来ました。",
        translation: "I'm from ___.",
        context: "Saying where you're from",
      },
      {
        id: "ja-u1-l2-p2",
        text: "はじめまして。",
        translation: "Nice to meet you.",
        context: "After being introduced to someone",
      },
    ],
    activities: [
      { id: "ja-u1-l2-a1", type: "vocabulary", prompt: "How do you say 'I am' in Japanese?", vocabularyId: "ja-u1-l2-v1" },
      { id: "ja-u1-l2-a2", type: "phrase", prompt: "Say where you're from in Japanese.", phraseId: "ja-u1-l2-p1" },
      { id: "ja-u1-l2-a3", type: "speaking", prompt: "Introduce yourself using 'Watashi wa ___ kara kimashita. Hajimemashite.'" },
    ],
    aiTeacher: {
      persona: "a warm, energetic Japanese teacher who teaches through English",
      focus: "introducing yourself with your name and where you're from in Japanese",
      kickoffPrompt:
        "Welcome the student back and build on the greetings they already know. Teach '___kara kimashita' (I'm from ___) slowly with a translation, then have them try introducing themselves. Encourage them warmly after each attempt and ask them to repeat if needed. Stay only on self-introductions — no unrelated vocabulary.",
    },
  },
];
