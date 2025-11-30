import { DayContent, Milestone } from './types';

export const REASONS = [
  "I want to quit smoking and heal my lungs",
  "I want to stop drinking and purify my mind",
  "I want to stop wasting my vital energy (Virya)",
  "I want to break free from compulsive habits",
  "I want to regain control over my senses",
  "I want better physical health and immunity",
  "I want a complete 108-day spiritual detox"
];

export const MILESTONES: Milestone[] = [
  { day: 7, title: "Purification Warrior", description: "First Week of Detox", icon: "shield" },
  { day: 37, title: "Energy Master", description: "Habits Broken", icon: "crown" },
  { day: 79, title: "Transformation Guardian", description: "New Identity Formed", icon: "award" },
  { day: 108, title: "Sacred Completion", description: "Master of Senses", icon: "trophy" }
];

export const JOURNAL_PROMPTS = [
  "Why did you start this journey of purification? (आपने यह शुद्धि यात्रा क्यों शुरू की?)",
  "What cravings or triggers did you face today? (आज आपने किन इच्छाओं का सामना किया?)",
  "How is your physical energy compared to yesterday?",
  "What did you do today to replace your old habit?",
  "Describe a moment of self-control you are proud of."
];

// Helper to generate content for 108 days (simulated for the demo)
export const getDayContent = (day: number): DayContent => {
  const specialDays: Record<number, Partial<DayContent>> = {
    1: {
      quote: "The first step to purity is the hardest, but the most sacred.",
      teachingTitle: "The Sankalpa (संकल्प)",
      teachingContent: "Today you take a vow to detox your body and mind. Whether it is smoke, drink, or loss of vital energy, acknowledge that these habits no longer serve your higher purpose.",
      task: "Throw away any remnants of your bad habits (packets, bottles, triggers).",
      gitaVerse: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",
      gitaTranslation: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions."
    },
    7: {
      quote: "Discipline is the fire that burns away impurities.",
      teachingTitle: "The First Week (पहला सप्ताह)",
      teachingContent: "Your body is starting to heal. You may feel withdrawal or restlessness. This is a sign that the toxins are leaving your system. Stay strong.",
      task: "Drink 3 liters of water today to flush out toxins.",
      gitaVerse: "क्रोधाद्भवति सम्मोह: सम्मोहात्स्मृतिविभ्रम:",
      gitaTranslation: "From anger, delusion arises, and from delusion, bewilderment of memory."
    },
    // ... we would fill this out for real app
  };

  if (specialDays[day]) {
    return {
      day,
      quote: specialDays[day].quote!,
      teachingTitle: specialDays[day].teachingTitle!,
      teachingContent: specialDays[day].teachingContent!,
      task: specialDays[day].task!,
      gitaVerse: specialDays[day].gitaVerse!,
      gitaTranslation: specialDays[day].gitaTranslation!
    };
  }

  // Generic content generator for other days to ensure app works for 108 days
  return {
    day,
    quote: "He who controls his senses conquers the world.",
    teachingTitle: `Day ${day} Purification`,
    teachingContent: "Every time you say 'No' to a craving, you are saying 'Yes' to your higher self. Transmute that energy into strength.",
    task: "Practice 5 minutes of deep breathing (Pranayama) when cravings hit.",
    gitaVerse: "संनियम्येन्द्रियग्रामं सर्वत्र समबुद्धयः",
    gitaTranslation: "Having restrained the cluster of senses, being equal-minded everywhere, they rejoice in the welfare of all beings."
  };
};