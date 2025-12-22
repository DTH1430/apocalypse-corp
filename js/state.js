/**
 * Game State Module
 * Central state object shared across all modules
 */

export const gameState = {
    saveVersion: 2,
    doomEnergy: 0,
    chaosPoints: 0,
    apocalypseTokens: 0,
    doomClockProgress: 0,
    doomPerClick: 1,
    chaosPerSecond: 0,
    paused: false,
    theme: 'soft',

    departments: {},
    upgrades: {},
    mutations: {},
    stocks: {},
    achievements: {},

    totalApocalypses: 0,
    totalChaosEarned: 0,
    totalClicks: 0,
    currentScenario: null,
    runStartTime: Date.now(),
    bestRunTime: null,
    lastSaveTime: Date.now(),

    lastTick: Date.now(),
    soundEnabled: true,

    // Combo system
    comboCount: 0,
    comboMultiplier: 1,
    lastClickTime: 0,
    comboTimeWindow: 2000,

    // Milestone tracking
    milestonesPassed: {
        chaos1k: false,
        chaos10k: false,
        chaos100k: false
    },

    // Tutorial system
    tutorialCompleted: false,
    tutorialHintShown: false,

    // Community Features - Statistics Tracking
    lifetimeStats: {
        totalClicksAllTime: 0,
        totalChaosAllTime: 0,
        totalApocalypsesAllTime: 0,
        fastestApocalypseTime: null,
        highestChaosPerSec: 0,
        longestCombo: 0,
        totalPlayTime: 0
    },
    sessionStats: {
        sessionStartTime: Date.now(),
        sessionClicks: 0,
        sessionChaos: 0,
        sessionApocalypses: 0
    },
    ghostRun: {
        bestRunData: null,
        currentRunData: [],
        lastSnapshotTime: 0
    },
    weeklyChallenge: {
        currentWeek: null,
        completed: false,
        progress: 0
    },

    // Critical hit system
    critChance: 0,
    critMultiplier: 0,
    totalCrits: 0,

    // Auto-clicker
    autoClickerLevel: 0,
    autoClickerRate: 0,
    lastAutoClick: 0,

    // Daily rewards
    lastDailyReward: 0,
    dailyStreak: 0,

    // Bulk buy mode
    buyMode: 1,

    // Department specializations
    departmentSpecializations: {},

    // Active synergy bonuses
    activeSynergies: [],

    // Upgrade multipliers
    upgradeMultipliers: {
        intern: 1,
        meteor: 1,
        biohazard: 1,
        nuclear: 1,
        blackhole: 1,
        reality: 1,
        dimension: 1,
        paradox: 1
    },

    // Challenge system
    activeChallenge: null,
    challengeStartTime: 0,
    challengeProgress: 0,
    challengesCompleted: 0,
    nextChallengeTime: 0,
    challengeNotificationShown: false,

    // Apocalypse system
    apocalypseHistory: [],
    lastApocalypseType: null,
    apocalypseTypesCompleted: {},
    persistentUnlocks: {},
    activeApocalypseEffects: {},
    upgradesDisabledUntil: 0,
    zombieProductionEndTime: 0,

    // Active gameplay mechanics
    lastActivityTime: Date.now(),
    lastEventTime: 0,
    nextEventTime: 0,
    activeEvent: null,
    eventHistory: [],

    // Department Focus
    focusedDepartment: null,
    lastFocusChange: 0,
    focusCooldown: 60000,

    // Doom Projects
    activeProject: null,
    completedProjects: [],
    projectProgress: 0,

    // Crisis Management
    activeCrisis: null,
    crisisDecisionsMade: 0,
    crisisStartTime: 0,
    lastCrisisTime: 0,

    // AI Assistant System
    assistant: {
        enabled: true,
        personality: 'sarcastic',
        voiceEnabled: false,
        voicePitch: 1.0,
        voiceRate: 1.0,
        voiceType: 'british',
        lastCommentTime: 0,
        commentCooldown: 10000,
        memory: {
            favoriteApocalypseType: null,
            repeatedActions: {},
            mistakesMade: 0,
            goodDecisions: 0,
            totalInteractions: 0,
            departmentPreferences: {},
            clicksVsIdle: 'balanced',
            playStyle: 'normal'
        },
        dialogueHistory: [],
        currentMood: 'neutral',
        relationshipLevel: 0,
        easterEggsFound: [],
        betrayalArcActive: false,
        hintMode: 'automatic'
    }
};
