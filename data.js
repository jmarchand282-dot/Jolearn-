/* =========================
   JoLearn 2.0 — DONNÉES
   ========================= */

const JOLEARN_CONFIG = {
    appName: "JoLearn",
    version: "2.0",
    language: "fr",
    targetLevel: "B1",
    dailyGoalXP: 50,
    xpPerLesson: 20,
    xpPerQuiz: 10
};

/* Niveaux */
const JOLEARN_LEVELS = [
    {
        id: "A1",
        name: "A1 — Débutant",
        icon: "🌱",
        description: "Les bases de l'anglais",
        unlocked: true
    },
    {
        id: "A2",
        name: "A2 — Élémentaire",
        icon: "🚀",
        description: "Construire des phrases",
        unlocked: false
    },
    {
        id: "B1",
        name: "B1 — Intermédiaire",
        icon: "🏆",
        description: "Parler avec plus d'aisance",
        unlocked: false
    }
];

/* Objectifs */
const JOLEARN_GOALS = {
    dailyXP: 50,
    lessonsPerDay: 1,
    wordsPerDay: 10
};

/* Récompenses */
const JOLEARN_REWARDS = [
    {
        id: "first_lesson",
        icon: "🌟",
        title: "Première leçon",
        description: "Terminer ta première leçon",
        requirement: 1
    },
    {
        id: "xp_100",
        icon: "⚡",
        title: "100 XP",
        description: "Gagner 100 XP",
        requirement: 100
    },
    {
        id: "streak_7",
        icon: "🔥",
        title: "7 jours",
        description: "Apprendre pendant 7 jours",
        requirement: 7
    },
    {
        id: "xp_500",
        icon: "🏆",
        title: "500 XP",
        description: "Gagner 500 XP",
        requirement: 500
    }
];

/* Boutique */
const JOLEARN_SHOP = [
    {
        id: "xp_boost",
        icon: "⚡",
        title: "Boost XP",
        description: "+10 XP bonus",
        price: 20
    },
    {
        id: "streak_freeze",
        icon: "🛡️",
        title: "Protection de série",
        description: "Protège une journée",
        price: 30
    },
    {
        id: "lucky_coin",
        icon: "🍀",
        title: "Pièce chanceuse",
        description: "+10 pièces",
        price: 50
    }
];

/* Version des données */
const JOLEARN_DATA_VERSION = "2.0.0";
