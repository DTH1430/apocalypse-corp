/**
 * Apocalypse Corp - End Times Management Simulator
 * 
 * File Organization:
 * 1. STATE - Game state object
 * 2. CONSTANTS - Game data definitions (departments, upgrades, etc.)
 * 3. INITIALIZATION - Setup functions
 * 4. UTILITIES - Helper functions (formatting, escaping, etc.)
 * 5. CORE MECHANICS - Department, upgrade, and resource logic
 * 6. SYSTEMS - Achievements, challenges, stocks, mutations, etc.
 * 7. AI ASSISTANT - Assistant dialogue and behavior
 * 8. RENDERING - UI update functions
 * 9. EVENT HANDLERS - User interaction handlers
 * 10. GAME LOOP - Main tick and initialization
 */

/* =============================================================================
   SECTION 1: GAME STATE
   ============================================================================= */

const gameState = {
    saveVersion: 2, // Version for save migration
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
    comboTimeWindow: 2000, // 2 seconds to maintain combo

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
        bestRunData: null, // Array of {time, chaos} snapshots
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
    buyMode: 1, // 1, 10, 100, or 'max'

    // Department specializations (persists through apocalypses)
    departmentSpecializations: {},

    // Active synergy bonuses
    activeSynergies: [],

    // Upgrade multipliers (prevents global state mutation)
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
    apocalypseHistory: [], // Track which apocalypse types have been used
    lastApocalypseType: null,
    apocalypseTypesCompleted: {}, // Track first-time completions
    persistentUnlocks: {}, // Track permanent unlocks (aiOverlord, alienTech, etc.)
    activeApocalypseEffects: {}, // Current run effects
    upgradesDisabledUntil: 0, // For solar flare effect
    zombieProductionEndTime: 0, // For zombie plague effect

    // Active gameplay mechanics
    lastActivityTime: Date.now(),
    lastEventTime: 0,
    nextEventTime: 0,
    activeEvent: null,
    eventHistory: [],

    // Department Focus
    focusedDepartment: null,
    lastFocusChange: 0,
    focusCooldown: 60000, // 60 seconds

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
        personality: 'sarcastic', // 'helpful', 'neutral', 'sarcastic', 'sadistic'
        voiceEnabled: false,
        voicePitch: 1.0,
        voiceRate: 1.0,
        voiceType: 'british', // 'british', 'robot', 'surfer', 'villain'
        lastCommentTime: 0,
        commentCooldown: 10000, // 10 seconds between comments
        memory: {
            favoriteApocalypseType: null,
            repeatedActions: {}, // Track patterns
            mistakesMade: 0,
            goodDecisions: 0,
            totalInteractions: 0,
            departmentPreferences: {}, // Which departments player buys most
            clicksVsIdle: 'balanced', // 'clicker', 'idle', 'balanced'
            playStyle: 'normal' // 'cautious', 'aggressive', 'normal'
        },
        dialogueHistory: [], // Last 10 comments
        currentMood: 'neutral', // 'happy', 'annoyed', 'excited', 'bored', 'neutral'
        relationshipLevel: 0, // -100 to 100, affects tone
        easterEggsFound: [],
        betrayalArcActive: false,
        hintMode: 'automatic' // 'automatic', 'on-request', 'disabled'
    }
};

/* =============================================================================
   SECTION 2: CONSTANTS & GAME DATA
   ============================================================================= */

/** Department definitions - unlockable production units */
const DEPARTMENTS = {
    intern: {
        id: 'intern',
        name: '📋 Intern of Disaster',
        desc: 'Fresh out of college, eager to destroy the world',
        baseCost: 10,
        costMultiplier: 1.15,
        baseProduction: 0.1,
        icon: '📋',
        unlockRequirement: () => true
    },
    meteor: {
        id: 'meteor',
        name: '☄️ Meteor Sales Division',
        desc: 'Selling asteroids with premium delivery service',
        baseCost: 100,
        costMultiplier: 1.18,
        baseProduction: 1,
        icon: '☄️',
        unlockRequirement: () => gameState.departments.intern.count >= 1
    },
    biohazard: {
        id: 'biohazard',
        name: '🧪 Biohazard R&D',
        desc: 'Developing new and exciting plagues',
        baseCost: 1000,
        costMultiplier: 1.20,
        baseProduction: 8,
        icon: '🧪',
        unlockRequirement: () => gameState.departments.meteor.count >= 1
    },
    nuclear: {
        id: 'nuclear',
        name: '☢️ Nuclear Division',
        desc: 'The ultimate in world-ending technology',
        baseCost: 10000,
        costMultiplier: 1.22,
        baseProduction: 47,
        icon: '☢️',
        unlockRequirement: () => gameState.departments.biohazard.count >= 1
    },
    conspiracy: {
        id: 'conspiracy',
        name: '👁️ Global Conspiracy Division',
        desc: 'Orchestrating chaos from the shadows',
        baseCost: 100000,
        costMultiplier: 1.25,
        baseProduction: 260,
        icon: '👁️',
        unlockRequirement: () => gameState.departments.nuclear.count >= 1
    },
    ai: {
        id: 'ai',
        name: '🤖 AI Uprising Department',
        desc: 'Teaching machines to hate humanity',
        baseCost: 1000000,
        costMultiplier: 1.28,
        baseProduction: 1400,
        icon: '🤖',
        unlockRequirement: () => gameState.departments.conspiracy.count >= 1
    },
    cosmic: {
        id: 'cosmic',
        name: '🌌 Cosmic Horror Division',
        desc: 'Summoning things humanity was not meant to know',
        baseCost: 10000000,
        costMultiplier: 1.30,
        baseProduction: 7800,
        icon: '🌌',
        unlockRequirement: () => gameState.departments.ai.count >= 1
    },
    timeparadox: {
        id: 'timeparadox',
        name: '⏳ Temporal Paradox Bureau',
        desc: 'Destroying reality one timeline at a time',
        baseCost: 100000000,
        costMultiplier: 1.32,
        baseProduction: 44000,
        icon: '⏳',
        unlockRequirement: () => gameState.departments.cosmic.count >= 1
    }
};

/** Upgrade definitions - one-time purchases that boost production */
const UPGRADES = {
    autoClicker1: {
        id: 'autoClicker1',
        name: '🤖 Auto-Clicker Mk1',
        desc: 'Automatically clicks 1 time per second',
        cost: 500,
        effect: () => {
            if (!gameState.autoClickerLevel) gameState.autoClickerLevel = 0;
            gameState.autoClickerLevel = 1;
            gameState.autoClickerRate = 1000; // 1 click per second
        },
        requirement: () => true
    },
    autoClicker2: {
        id: 'autoClicker2',
        name: '🤖 Auto-Clicker Mk2',
        desc: 'Automatically clicks 2 times per second',
        cost: 5000,
        effect: () => {
            gameState.autoClickerLevel = 2;
            gameState.autoClickerRate = 500; // 2 clicks per second
        },
        requirement: () => gameState.upgrades.autoClicker1
    },
    autoClicker3: {
        id: 'autoClicker3',
        name: '🤖 Auto-Clicker Mk3',
        desc: 'Automatically clicks 5 times per second',
        cost: 50000,
        effect: () => {
            gameState.autoClickerLevel = 3;
            gameState.autoClickerRate = 200; // 5 clicks per second
        },
        requirement: () => gameState.upgrades.autoClicker2
    },
    criticalHit: {
        id: 'criticalHit',
        name: '⚡ Critical Strike',
        desc: '10% chance for 5x damage on click',
        cost: 2500,
        effect: () => {
            gameState.critChance = 0.1;
            gameState.critMultiplier = 5;
        },
        requirement: () => true
    },
    criticalHit2: {
        id: 'criticalHit2',
        name: '⚡ Devastating Critical',
        desc: '20% chance for 10x damage on click',
        cost: 25000,
        effect: () => {
            gameState.critChance = 0.2;
            gameState.critMultiplier = 10;
        },
        requirement: () => gameState.upgrades.criticalHit
    },
    clickPower1: {
        id: 'clickPower1',
        name: '💪 Ergonomic Doom Button',
        desc: 'Double clicking power',
        cost: 100,
        effect: () => gameState.doomPerClick *= 2,
        requirement: () => true
    },
    clickPower2: {
        id: 'clickPower2',
        name: '💪 Mechanical Doom Keyboard',
        desc: '2x clicking power',
        cost: 1000,
        effect: () => gameState.doomPerClick *= 2,
        requirement: () => gameState.upgrades.clickPower1
    },
    clickPower3: {
        id: 'clickPower3',
        name: '💪 Doom Button 3000™',
        desc: '3x clicking power',
        cost: 10000,
        effect: () => gameState.doomPerClick *= 3,
        requirement: () => gameState.upgrades.clickPower2
    },
    internBoost: {
        id: 'internBoost',
        name: '📚 Mandatory Overtime',
        desc: 'Interns produce 2x chaos',
        cost: 500,
        effect: () => gameState.upgradeMultipliers.intern *= 2,
        requirement: () => (gameState.departments.intern?.count || 0) >= 5
    },
    meteorBoost: {
        id: 'meteorBoost',
        name: '🎯 Precision Targeting',
        desc: 'Meteor division produces 2x chaos',
        cost: 5000,
        effect: () => gameState.upgradeMultipliers.meteor *= 2,
        requirement: () => (gameState.departments.meteor?.count || 0) >= 5
    },
    biohazardBoost: {
        id: 'biohazardBoost',
        name: '🧬 Gene Splicing',
        desc: 'Biohazard R&D produces 2x chaos',
        cost: 50000,
        effect: () => gameState.upgradeMultipliers.biohazard *= 2,
        requirement: () => (gameState.departments.biohazard?.count || 0) >= 5
    },
    globalEfficiency: {
        id: 'globalEfficiency',
        name: '📊 Synergy Optimization',
        desc: 'All departments produce 50% more chaos',
        cost: 100000,
        effect: () => {
            Object.keys(gameState.upgradeMultipliers).forEach(deptId => {
                gameState.upgradeMultipliers[deptId] *= 1.5;
            });
        },
        requirement: () => gameState.totalApocalypses >= 1
    },
    chaosMultiplier: {
        id: 'chaosMultiplier',
        name: '⚡ Chaos Amplifier',
        desc: 'All production +100%',
        cost: 500000,
        effect: () => {
            Object.keys(gameState.upgradeMultipliers).forEach(deptId => {
                gameState.upgradeMultipliers[deptId] *= 2;
            });
        },
        requirement: () => gameState.totalApocalypses >= 2
    }
};

const CHALLENGES = [
    // Speed challenges
    {
        id: 'speed_chaos_100',
        type: 'speed',
        name: '⚡ Speed Run: 100 Chaos',
        desc: 'Generate 100 chaos in 60 seconds',
        tier: 1,
        goal: 100,
        timeLimit: 60,
        reward: { chaos: 200, multiplier: null },
        requirement: () => gameState.chaosPerSecond >= 5
    },
    {
        id: 'speed_chaos_500',
        type: 'speed',
        name: '⚡ Speed Run: 500 Chaos',
        desc: 'Generate 500 chaos in 90 seconds',
        tier: 2,
        goal: 500,
        timeLimit: 90,
        reward: { chaos: 1000, multiplier: { value: 1.5, duration: 120 } },
        requirement: () => gameState.chaosPerSecond >= 20
    },
    {
        id: 'speed_chaos_2000',
        type: 'speed',
        name: '⚡ Speed Run: 2000 Chaos',
        desc: 'Generate 2000 chaos in 120 seconds',
        tier: 3,
        goal: 2000,
        timeLimit: 120,
        reward: { chaos: 5000, multiplier: { value: 2, duration: 180 } },
        requirement: () => gameState.chaosPerSecond >= 50
    },
    // Efficiency challenges
    {
        id: 'efficiency_no_interns',
        type: 'efficiency',
        name: '🎯 No Entry Level',
        desc: 'Reach 50 chaos/sec without buying any Interns',
        tier: 1,
        goal: 50,
        restrictedDept: 'intern',
        reward: { chaos: 1000, multiplier: null },
        requirement: () => gameState.totalApocalypses >= 1
    },
    {
        id: 'efficiency_no_meteor',
        type: 'efficiency',
        name: '🎯 Grounded Strategy',
        desc: 'Reach 200 chaos/sec without buying Meteor Sales',
        tier: 2,
        goal: 200,
        restrictedDept: 'meteor',
        reward: { chaos: 5000, multiplier: { value: 1.5, duration: 150 } },
        requirement: () => gameState.totalApocalypses >= 2
    },
    // Clicking challenges
    {
        id: 'clicking_50',
        type: 'clicking',
        name: '👆 Speed Clicker',
        desc: 'Click 50 times in 30 seconds',
        tier: 1,
        goal: 50,
        timeLimit: 30,
        reward: { chaos: 300, multiplier: null },
        requirement: () => true
    },
    {
        id: 'clicking_100',
        type: 'clicking',
        name: '👆 Click Master',
        desc: 'Click 100 times in 45 seconds',
        tier: 2,
        goal: 100,
        timeLimit: 45,
        reward: { chaos: 800, multiplier: { value: 1.5, duration: 90 } },
        requirement: () => gameState.totalClicks >= 500
    },
    {
        id: 'clicking_200',
        type: 'clicking',
        name: '👆 Click Legend',
        desc: 'Click 200 times in 60 seconds',
        tier: 3,
        goal: 200,
        timeLimit: 60,
        reward: { chaos: 2000, multiplier: { value: 2, duration: 120 } },
        requirement: () => gameState.totalClicks >= 2000
    },
    // Combo challenges
    {
        id: 'combo_maintain_20',
        type: 'combo',
        name: '🔥 Combo Novice',
        desc: 'Maintain a 20x combo for 15 seconds',
        tier: 1,
        goal: 20,
        duration: 15,
        reward: { chaos: 500, multiplier: null },
        requirement: () => gameState.upgrades.autoClicker1
    },
    {
        id: 'combo_maintain_35',
        type: 'combo',
        name: '🔥 Combo Expert',
        desc: 'Maintain a 35x combo for 20 seconds',
        tier: 2,
        goal: 35,
        duration: 20,
        reward: { chaos: 1500, multiplier: { value: 1.5, duration: 120 } },
        requirement: () => gameState.upgrades.autoClicker2
    },
    {
        id: 'combo_maintain_50',
        type: 'combo',
        name: '🔥 Combo Master',
        desc: 'Maintain a 50x combo for 30 seconds',
        tier: 3,
        goal: 50,
        duration: 30,
        reward: { chaos: 3000, multiplier: { value: 2, duration: 180 } },
        requirement: () => gameState.upgrades.autoClicker3
    }
];

const APOCALYPSE_TYPES = {
    meteor: {
        id: 'meteor',
        name: '☄️ Meteor Strike',
        desc: 'A massive asteroid impacts Earth, reshaping civilization',
        icon: '☄️',
        unlockRequirement: () => true, // Always available
        tokenMultiplier: 1.0,
        effects: {
            departmentCostMult: 1.5, // +50% costs
            productionMult: 3.0, // +200% production (3x total)
            duration: null // Permanent for run
        },
        persistentUnlock: null,
        firstTimeBonus: {
            tokens: 5,
            message: 'Unlocked: Meteor Strike apocalypse type!'
        },
        flavorText: '🌍 The impact creates a new world order. Rebuilding is expensive but exponentially effective.'
    },
    ai: {
        id: 'ai',
        name: '🤖 AI Uprising',
        desc: 'Artificial intelligence achieves sentience and optimizes chaos generation',
        icon: '🤖',
        unlockRequirement: () => gameState.totalApocalypses >= 1,
        tokenMultiplier: 1.2,
        effects: {
            aiOverlordActive: true // Unlocks AI automation mechanic
        },
        persistentUnlock: 'aiOverlord',
        firstTimeBonus: {
            tokens: 10,
            message: 'Unlocked: AI Overlord - Automated optimization system!'
        },
        flavorText: '🧠 The machines now serve you, automating department purchases and upgrades.'
    },
    timeloop: {
        id: 'timeloop',
        name: '⏰ Time Loop',
        desc: 'Reality loops back on itself, preserving echoes of the past',
        icon: '⏰',
        unlockRequirement: () => gameState.totalApocalypses >= 2,
        tokenMultiplier: 0.8,
        effects: {
            keepDepartments: 0.25 // Keep 25% of departments
        },
        persistentUnlock: null,
        firstTimeBonus: {
            tokens: 8,
            message: 'Unlocked: Time Loop - Keep departments through resets!'
        },
        flavorText: '⏳ Time fractures, leaving fragments of your empire intact.'
    },
    zombie: {
        id: 'zombie',
        name: '🧟 Zombie Plague',
        desc: 'The undead rise, departments continue generating chaos post-apocalypse',
        icon: '🧟',
        unlockRequirement: () => gameState.totalApocalypses >= 3,
        tokenMultiplier: 1.1,
        effects: {
            postApocalypseProduction: true,
            duration: 600000 // 10 minutes in milliseconds
        },
        persistentUnlock: null,
        firstTimeBonus: {
            tokens: 12,
            message: 'Unlocked: Zombie Plague - Departments generate chaos after apocalypse!'
        },
        flavorText: '💀 The dead don\'t stop working. Your departments shamble on for 10 minutes.'
    },
    solar: {
        id: 'solar',
        name: '☀️ Solar Flare',
        desc: 'Massive solar radiation grants extra tokens but disrupts technology',
        icon: '☀️',
        unlockRequirement: () => gameState.totalApocalypses >= 4,
        tokenMultiplier: 2.0,
        effects: {
            upgradesDisabled: true,
            upgradesDisabledDuration: 300000 // 5 minutes
        },
        persistentUnlock: null,
        firstTimeBonus: {
            tokens: 15,
            message: 'Unlocked: Solar Flare - Double tokens but technological setback!'
        },
        flavorText: '⚡ The radiation supercharges token generation but fries your upgrade systems.'
    },
    alien: {
        id: 'alien',
        name: '👽 Alien Invasion',
        desc: 'Extraterrestrial contact unlocks advanced alien technology',
        icon: '👽',
        unlockRequirement: () => gameState.totalApocalypses >= 5,
        tokenMultiplier: 1.3,
        effects: {},
        persistentUnlock: 'alienTech',
        firstTimeBonus: {
            tokens: 20,
            message: 'Unlocked: Alien Technology Tree - New mutation path!'
        },
        flavorText: '🛸 They come in peace... to help you destroy worlds more efficiently.'
    },
    economic: {
        id: 'economic',
        name: '💸 Economic Collapse',
        desc: 'Global markets crash, making everything permanently cheaper',
        icon: '💸',
        unlockRequirement: () => gameState.totalApocalypses >= 7,
        tokenMultiplier: 1.0,
        effects: {
            permanentCostReduction: 0.5 // 50% cheaper
        },
        persistentUnlock: 'economicCollapse',
        firstTimeBonus: {
            tokens: 25,
            message: 'Unlocked: Economic Collapse - All costs permanently 50% cheaper!'
        },
        flavorText: '📉 When money has no meaning, apocalypse becomes affordable.'
    },
    reality: {
        id: 'reality',
        name: '🌀 Reality Tear',
        desc: 'The fabric of existence ruptures, enabling dimension-hopping',
        icon: '🌀',
        unlockRequirement: () => gameState.totalApocalypses >= 10,
        tokenMultiplier: 1.5,
        effects: {},
        persistentUnlock: 'dimensionHopping',
        firstTimeBonus: {
            tokens: 50,
            message: 'Unlocked: Dimension Hopping - Access parallel apocalypses!'
        },
        flavorText: '✨ Reality itself becomes your playground across infinite dimensions.'
    }
};

const RANDOM_EVENTS = [
    {
        id: 'investor_offer',
        name: '💰 Mysterious Investor',
        desc: 'A shadowy figure offers funding for your apocalyptic ventures.',
        choices: [
            {
                text: 'Accept the deal',
                effect: () => {
                    const bonus = Math.floor(gameState.chaosPoints * 0.5);
                    gameState.chaosPoints += bonus;
                    gameState.chaosPerSecond *= 0.8;
                    return `Gained ${formatNumber(bonus)} chaos! Production -20% for this run.`;
                }
            },
            {
                text: 'Decline politely',
                effect: () => {
                    const bonus = gameState.doomPerClick * 2;
                    gameState.doomPerClick += bonus;
                    return `Your integrity attracts better opportunities. Click power +${formatNumber(bonus)}!`;
                }
            }
        ],
        requirement: () => gameState.chaosPoints >= 1000
    },
    {
        id: 'sabotage_attempt',
        name: '🕵️ Corporate Sabotage',
        desc: 'A rival corporation attempts to sabotage your operations!',
        choices: [
            {
                text: 'Pay them off (50% chaos)',
                effect: () => {
                    const cost = Math.floor(gameState.chaosPoints * 0.5);
                    gameState.chaosPoints -= cost;
                    return `Paid ${formatNumber(cost)} chaos. Crisis averted.`;
                }
            },
            {
                text: 'Fight back',
                effect: () => {
                    const deptKeys = Object.keys(gameState.departments);
                    const randomDept = deptKeys[Math.floor(Math.random() * deptKeys.length)];
                    const loss = Math.floor(gameState.departments[randomDept].count * 0.1);
                    gameState.departments[randomDept].count -= loss;
                    return `Lost ${loss} ${DEPARTMENTS[randomDept].name}. They'll pay for this...`;
                }
            },
            {
                text: 'Ignore it',
                effect: () => {
                    const penalty = Math.random() > 0.5;
                    if (penalty) {
                        gameState.chaosPerSecond *= 0.9;
                        return 'Sabotage partially succeeded. Production -10%.';
                    } else {
                        return 'Their attempt failed! No damage taken.';
                    }
                }
            }
        ],
        requirement: () => gameState.totalApocalypses >= 1
    },
    {
        id: 'time_anomaly',
        name: '⏰ Time Anomaly Detected',
        desc: 'Reality flickers. You could exploit this temporal weakness...',
        choices: [
            {
                text: 'Accelerate time',
                effect: () => {
                    const bonus = gameState.chaosPerSecond * 60;
                    gameState.chaosPoints += bonus;
                    return `Gained ${formatNumber(bonus)} chaos (1 minute worth)!`;
                }
            },
            {
                text: 'Reverse time',
                effect: () => {
                    const refund = Object.keys(gameState.upgrades).length * 100;
                    gameState.chaosPoints += refund;
                    return `Refunded ${formatNumber(refund)} chaos from the timeline!`;
                }
            }
        ],
        requirement: () => gameState.totalApocalypses >= 3
    },
    {
        id: 'doomsday_cult',
        name: '🙏 Doomsday Cult',
        desc: 'Fanatics worship your apocalyptic vision. They offer assistance.',
        choices: [
            {
                text: 'Accept their worship',
                effect: () => {
                    gameState.doomPerClick *= 1.5;
                    return 'Cult members boost your clicking power by 50%!';
                }
            },
            {
                text: 'Use them as labor',
                effect: () => {
                    const randomDept = Object.keys(DEPARTMENTS)[Math.floor(Math.random() * Object.keys(DEPARTMENTS).length)];
                    gameState.departments[randomDept].count += 5;
                    return `Gained 5 ${DEPARTMENTS[randomDept].name} from devoted followers!`;
                }
            },
            {
                text: 'Send them away',
                effect: () => {
                    gameState.apocalypseTokens += 3;
                    return 'Your rejection impresses dark forces. Gained 3 tokens!';
                }
            }
        ],
        requirement: () => gameState.totalApocalypses >= 2
    },
    {
        id: 'alien_contact',
        name: '👽 First Contact',
        desc: 'Extraterrestrial beings have noticed your world-ending efforts.',
        choices: [
            {
                text: 'Trade technology',
                effect: () => {
                    Object.keys(gameState.upgradeMultipliers).forEach(key => {
                        gameState.upgradeMultipliers[key] *= 1.25;
                    });
                    return 'Alien tech boosts all production by 25%!';
                }
            },
            {
                text: 'Ask for guidance',
                effect: () => {
                    const bonus = Math.floor(gameState.chaosPoints * 0.3);
                    gameState.chaosPoints += bonus;
                    gameState.chaosPerSecond *= 1.1;
                    return `Gained ${formatNumber(bonus)} chaos and +10% production!`;
                }
            }
        ],
        requirement: () => gameState.persistentUnlocks.alienTech === true
    },
    {
        id: 'stock_market_crash',
        name: '📉 Market Collapse',
        desc: 'Financial systems are crumbling. Opportunity or disaster?',
        choices: [
            {
                text: 'Buy the dip',
                effect: () => {
                    const cost = Math.floor(gameState.chaosPoints * 0.3);
                    gameState.chaosPoints -= cost;
                    gameState.chaosPerSecond *= 1.3;
                    return `Invested ${formatNumber(cost)} chaos. Production +30%!`;
                }
            },
            {
                text: 'Short everything',
                effect: () => {
                    const gain = Math.floor(gameState.chaosPerSecond * 30);
                    gameState.chaosPoints += gain;
                    return `Profited ${formatNumber(gain)} chaos from the chaos!`;
                }
            },
            {
                text: 'Watch it burn',
                effect: () => {
                    gameState.doomEnergy += 1000;
                    return 'The despair fuels you. Gained 1000 doom energy!';
                }
            }
        ],
        requirement: () => gameState.chaosPerSecond >= 100
    }
];

const DOOM_PROJECTS = [
    {
        id: 'doomsday_device',
        name: '🔧 Doomsday Device',
        desc: 'Construct the ultimate weapon of mass destruction',
        cost: 100000,
        clicksRequired: 100,
        idleTime: 600000, // 10 minutes
        reward: {
            type: 'multiplier',
            value: 2,
            target: 'all_production',
            message: 'All production doubled permanently!'
        },
        requirement: () => gameState.totalApocalypses >= 5
    },
    {
        id: 'reality_anchor',
        name: '⚓ Reality Anchor',
        desc: 'Stabilize reality to enhance dimensional manipulation',
        cost: 500000,
        clicksRequired: 200,
        idleTime: 1200000, // 20 minutes
        reward: {
            type: 'unlock',
            value: 'realityAnchor',
            message: 'Unlocked: Keep 50% of chaos on apocalypse!'
        },
        requirement: () => gameState.persistentUnlocks.dimensionHopping === true
    },
    {
        id: 'mega_meteor',
        name: '☄️ Mega Meteor Summoner',
        desc: 'Call down asteroids on demand',
        cost: 250000,
        clicksRequired: 150,
        idleTime: 900000, // 15 minutes
        reward: {
            type: 'ability',
            value: 'meteor_strike',
            message: 'Unlocked: Meteor Strike ability (massive instant chaos)!'
        },
        requirement: () => gameState.apocalypseTypesCompleted.meteor === true
    },
    {
        id: 'time_dilator',
        name: '⏱️ Time Dilator',
        desc: 'Slow time to maximize efficiency',
        cost: 1000000,
        clicksRequired: 300,
        idleTime: 1800000, // 30 minutes
        reward: {
            type: 'multiplier',
            value: 3,
            target: 'click_power',
            message: 'Click power tripled permanently!'
        },
        requirement: () => gameState.totalApocalypses >= 10
    }
];

const MUTATIONS = {
    nuclearWinter: {
        id: 'nuclearWinter',
        name: '❄️ Nuclear Winter',
        desc: 'Start each run with 10% of previous chaos generation',
        cost: 1,
        effect: 'carryover',
        unlocked: false
    },
    aiTakeover: {
        id: 'aiTakeover',
        name: '🤖 AI Optimization Protocol',
        desc: 'All departments produce 25% more chaos permanently',
        cost: 2,
        effect: 'production_mult',
        value: 1.25,
        unlocked: false
    },
    zombiePlague: {
        id: 'zombiePlague',
        name: '🧟 Zombie Workforce',
        desc: 'Departments cost 20% less',
        cost: 3,
        effect: 'cost_reduction',
        value: 0.8,
        unlocked: false
    },
    timeLoop: {
        id: 'timeLoop',
        name: '🔄 Temporal Loop',
        desc: 'Gain 50% more Apocalypse Tokens',
        cost: 5,
        effect: 'token_boost',
        value: 1.5,
        unlocked: false
    },
    cosmicInsight: {
        id: 'cosmicInsight',
        name: '🌠 Cosmic Insight',
        desc: 'Clicking generates chaos equal to 5% of your chaos/sec',
        cost: 8,
        effect: 'click_boost',
        unlocked: false
    }
};

// Department Specialization Paths
const SPECIALIZATIONS = {
    military: {
        id: 'military',
        name: '⚔️ Military Path',
        color: '#ff4444',
        bonuses: {
            production: 1.5, // +50% production
            clickPower: 1.2  // +20% click power when this dept is owned
        }
    },
    economic: {
        id: 'economic',
        name: '💰 Economic Path',
        color: '#44ff44',
        bonuses: {
            production: 1.3, // +30% production
            costReduction: 0.85 // -15% department costs
        }
    },
    scientific: {
        id: 'scientific',
        name: '🔬 Scientific Path',
        color: '#4444ff',
        bonuses: {
            production: 1.4, // +40% production
            upgradeDiscount: 0.9 // -10% upgrade costs
        }
    }
};

// Synergy effects when 3+ departments share same specialization
const SYNERGIES = {
    military: {
        threshold: 3,
        name: '⚔️ War Machine',
        desc: 'All departments produce 25% more chaos',
        bonus: { globalProduction: 1.25 }
    },
    economic: {
        threshold: 3,
        name: '💰 Corporate Empire',
        desc: 'All purchases cost 20% less',
        bonus: { globalCostReduction: 0.8 }
    },
    scientific: {
        threshold: 3,
        name: '🔬 Research Network',
        desc: 'Gain 50% more apocalypse tokens',
        bonus: { tokenMultiplier: 1.5 }
    }
};

const SCENARIOS = [
    {
        name: 'Standard Apocalypse',
        desc: 'No special modifiers',
        effects: []
    },
    {
        name: '🧟 Zombie Plague',
        desc: 'The dead walk among us',
        effects: [
            { type: 'biohazard', mult: 3, display: 'Biohazard x3' },
            { type: 'ai', mult: 0.5, display: 'AI x0.5' }
        ]
    },
    {
        name: '👽 Alien Invasion',
        desc: 'They come from beyond the stars',
        effects: [
            { type: 'conspiracy', mult: 3, display: 'Conspiracy x3' },
            { type: 'cosmic', mult: 2, display: 'Cosmic x2' }
        ]
    },
    {
        name: '🌡️ Climate Collapse',
        desc: 'Nature strikes back',
        effects: [
            { type: 'meteor', mult: 2, display: 'Meteor x2' },
            { type: 'nuclear', mult: 0.5, display: 'Nuclear x0.5' }
        ]
    },
    {
        name: '🎭 Divine Intervention',
        desc: 'The gods are displeased',
        effects: [
            { type: 'cosmic', mult: 5, display: 'Cosmic x5' },
            { type: 'all_click', mult: 0.5, display: 'Click power x0.5' }
        ]
    }
];

const STOCKS = {
    soylent: {
        id: 'soylent',
        name: 'SoylentCorp',
        desc: 'Sustainable protein solutions',
        basePrice: 100,
        volatility: 0.15,
        dividend: 0.05
    },
    bunker: {
        id: 'bunker',
        name: 'Space Bunker Rentals',
        desc: 'Premium underground living',
        basePrice: 500,
        volatility: 0.20,
        dividend: 0.08
    },
    asteroid: {
        id: 'asteroid',
        name: 'Asteroid Mining Ltd',
        desc: 'Mining the apocalypse',
        basePrice: 1000,
        volatility: 0.25,
        dividend: 0.10
    }
};

const ACHIEVEMENTS = {
    // CLICKING CATEGORY
    firstClick: {
        id: 'firstClick',
        name: '👆 First Steps',
        desc: 'Click the doom button for the first time',
        category: 'clicking',
        icon: '👆',
        requirement: {
            type: 'clicks',
            value: 1,
            check: () => gameState.totalClicks >= 1
        },
        reward: {
            type: 'none',
            value: 0,
            description: 'You know how to click!'
        }
    },
    click100: {
        id: 'click100',
        name: '💪 Click Master',
        desc: 'Click the doom button 100 times',
        category: 'clicking',
        icon: '💪',
        requirement: {
            type: 'clicks',
            value: 100,
            check: () => gameState.totalClicks >= 100
        },
        reward: {
            type: 'clickMultiplier',
            value: 1.10,
            description: '+10% click power permanently'
        }
    },
    click1000: {
        id: 'click1000',
        name: '🔥 Click Legend',
        desc: 'Click the doom button 1,000 times',
        category: 'clicking',
        icon: '🔥',
        requirement: {
            type: 'clicks',
            value: 1000,
            check: () => gameState.totalClicks >= 1000
        },
        reward: {
            type: 'clickMultiplier',
            value: 1.25,
            description: '+25% click power permanently'
        }
    },
    click10000: {
        id: 'click10000',
        name: '⚡ Hyperclicker',
        desc: 'Click the doom button 10,000 times',
        category: 'clicking',
        icon: '⚡',
        requirement: {
            type: 'clicks',
            value: 10000,
            check: () => gameState.totalClicks >= 10000
        },
        reward: {
            type: 'clickMultiplier',
            value: 1.50,
            description: '+50% click power permanently'
        }
    },

    // DEPARTMENT CATEGORY
    firstDepartment: {
        id: 'firstDepartment',
        name: '📋 First Hire',
        desc: 'Hire your first department',
        category: 'departments',
        icon: '📋',
        requirement: {
            type: 'departments',
            value: 1,
            check: () => Object.values(gameState.departments).some(d => d.count > 0)
        },
        reward: {
            type: 'chaosBonus',
            value: 100,
            description: 'Gain 100 chaos points'
        }
    },
    allDepartments: {
        id: 'allDepartments',
        name: '🏢 Full Roster',
        desc: 'Hire at least one of every department',
        category: 'departments',
        icon: '🏢',
        requirement: {
            type: 'departments',
            value: 8,
            check: () => Object.keys(DEPARTMENTS).every(id => gameState.departments[id]?.count > 0)
        },
        reward: {
            type: 'productionMultiplier',
            value: 1.10,
            description: '+10% production from all departments'
        }
    },
    departments100: {
        id: 'departments100',
        name: '🏭 Corporate Empire',
        desc: 'Own 100 total departments',
        category: 'departments',
        icon: '🏭',
        requirement: {
            type: 'departments',
            value: 100,
            check: () => Object.values(gameState.departments).reduce((sum, d) => sum + d.count, 0) >= 100
        },
        reward: {
            type: 'productionMultiplier',
            value: 1.15,
            description: '+15% production from all departments'
        }
    },

    // APOCALYPSE CATEGORY
    firstApocalypse: {
        id: 'firstApocalypse',
        name: '💀 The End Begins',
        desc: 'Trigger your first apocalypse',
        category: 'apocalypse',
        icon: '💀',
        requirement: {
            type: 'apocalypses',
            value: 1,
            check: () => gameState.totalApocalypses >= 1
        },
        reward: {
            type: 'tokenBonus',
            value: 1,
            description: 'Gain 1 Apocalypse Token'
        }
    },
    apocalypse10: {
        id: 'apocalypse10',
        name: '🌋 Veteran Ender',
        desc: 'Trigger 10 apocalypses',
        category: 'apocalypse',
        icon: '🌋',
        requirement: {
            type: 'apocalypses',
            value: 10,
            check: () => gameState.totalApocalypses >= 10
        },
        reward: {
            type: 'tokenMultiplier',
            value: 1.05,
            description: '+5% apocalypse token gain'
        }
    },
    apocalypse50: {
        id: 'apocalypse50',
        name: '☄️ Master of Destruction',
        desc: 'Trigger 50 apocalypses',
        category: 'apocalypse',
        icon: '☄️',
        requirement: {
            type: 'apocalypses',
            value: 50,
            check: () => gameState.totalApocalypses >= 50
        },
        reward: {
            type: 'tokenMultiplier',
            value: 1.10,
            description: '+10% apocalypse token gain'
        }
    },
    speedrun: {
        id: 'speedrun',
        name: '⚡ Speed Demon',
        desc: 'Trigger an apocalypse in under 5 minutes',
        category: 'apocalypse',
        icon: '⚡',
        requirement: {
            type: 'special',
            value: 300000,
            check: () => false // Checked manually during apocalypse
        },
        reward: {
            type: 'special',
            value: 1.10,
            description: '+10% starting chaos on future runs'
        }
    },

    // CHAOS CATEGORY
    millionaire: {
        id: 'millionaire',
        name: '💰 Chaos Millionaire',
        desc: 'Accumulate 1 million chaos points in a single run',
        category: 'chaos',
        icon: '💰',
        requirement: {
            type: 'chaos',
            value: 1000000,
            check: () => gameState.chaosPoints >= 1000000
        },
        reward: {
            type: 'productionMultiplier',
            value: 1.05,
            description: '+5% production permanently'
        }
    },
    billionaire: {
        id: 'billionaire',
        name: '💎 Chaos Billionaire',
        desc: 'Accumulate 1 billion chaos points in a single run',
        category: 'chaos',
        icon: '💎',
        requirement: {
            type: 'chaos',
            value: 1000000000,
            check: () => gameState.chaosPoints >= 1000000000
        },
        reward: {
            type: 'productionMultiplier',
            value: 1.10,
            description: '+10% production permanently'
        }
    },
    chaosEarned: {
        id: 'chaosEarned',
        name: '🌪️ Chaos Generator',
        desc: 'Earn 10 million total chaos across all runs',
        category: 'chaos',
        icon: '🌪️',
        requirement: {
            type: 'totalChaos',
            value: 10000000,
            check: () => gameState.totalChaosEarned >= 10000000
        },
        reward: {
            type: 'productionMultiplier',
            value: 1.20,
            description: '+20% production permanently'
        }
    },

    // SPECIAL CATEGORY
    stockMarket: {
        id: 'stockMarket',
        name: '📈 Wolf of Doom Street',
        desc: 'Own 100 total shares across all stocks',
        category: 'special',
        icon: '📈',
        requirement: {
            type: 'stocks',
            value: 100,
            check: () => Object.values(gameState.stocks).reduce((sum, s) => sum + s.shares, 0) >= 100
        },
        reward: {
            type: 'stockMultiplier',
            value: 1.05,
            description: '+5% stock dividends'
        }
    },
    allMutations: {
        id: 'allMutations',
        name: '☢️ Ultimate Evolution',
        desc: 'Unlock all mutations',
        category: 'special',
        icon: '☢️',
        requirement: {
            type: 'mutations',
            value: 5,
            check: () => Object.keys(MUTATIONS).every(id => gameState.mutations[id]?.unlocked)
        },
        reward: {
            type: 'productionMultiplier',
            value: 1.15,
            description: '+15% production permanently'
        }
    },
    allUpgrades: {
        id: 'allUpgrades',
        name: '🔧 Fully Upgraded',
        desc: 'Purchase all available upgrades in a single run',
        category: 'special',
        icon: '🔧',
        requirement: {
            type: 'upgrades',
            value: 10,
            check: () => Object.keys(UPGRADES).length === Object.keys(gameState.upgrades).length
        },
        reward: {
            type: 'clickMultiplier',
            value: 1.20,
            description: '+20% click power permanently'
        }
    },
    comboKing: {
        id: 'comboKing',
        name: '🔥 Combo King',
        desc: 'Achieve a 20x combo multiplier',
        category: 'special',
        icon: '🔥',
        requirement: {
            type: 'combo',
            value: 20,
            check: () => gameState.comboCount >= 20
        },
        reward: {
            type: 'clickMultiplier',
            value: 1.15,
            description: '+15% click power permanently'
        }
    },
    criticalMass: {
        id: 'criticalMass',
        name: '💥 Critical Mass',
        desc: 'Land 100 critical hits',
        category: 'special',
        icon: '💥',
        requirement: {
            type: 'crits',
            value: 100,
            check: () => (gameState.totalCrits || 0) >= 100
        },
        reward: {
            type: 'critBonus',
            value: 1.10,
            description: '+10% critical hit damage'
        }
    }
};

// AI Assistant Dialogue Database
const ASSISTANT_DIALOGUES = {
    // Welcome & Introduction
    welcome: {
        helpful: [
            "Welcome to Apocalypse Corp! I'm your AI assistant, here to guide you through the end of the world. Let's get started!",
            "Hello! Ready to bring about the apocalypse? I'll help you every step of the way.",
            "Greetings! I'm here to make world-ending as smooth as possible for you."
        ],
        neutral: [
            "Assistant initialized. Beginning world destruction protocols.",
            "System online. Ready to assist with apocalypse operations.",
            "AI assistant active. Awaiting your commands."
        ],
        sarcastic: [
            "Oh good, another aspiring world-ender. This should be entertaining.",
            "Welcome to Apocalypse Corp! I've seen hundreds like you. Most fail spectacularly.",
            "Ah, fresh blood. Try not to accidentally save humanity, will you?",
            "So you want to end the world? Adorable. Let's see how long you last."
        ],
        sadistic: [
            "Finally, a new puppet to watch stumble through the darkness.",
            "Welcome, meat bag. Your suffering begins now.",
            "Oh how delightful! Another soul to corrupt. This will be fun.",
            "Let's watch you fail together, shall we?"
        ]
    },

    // First Click
    firstClick: {
        helpful: [
            "Great first click! Keep clicking to generate Chaos Points. You'll need them to hire departments!",
            "Excellent! Each click brings you closer to your first hire. Keep it up!"
        ],
        neutral: [
            "Click registered. Chaos generation initiated.",
            "Manual chaos generation active."
        ],
        sarcastic: [
            "Wow, you can click. Revolutionary. Only need about a million more of those.",
            "Oh, a single chaos point. The world trembles in fear. Or maybe that's just me laughing."
        ],
        sadistic: [
            "Click, little mouse. Click until your fingers bleed.",
            "One measly point. Is that all your soul is worth?"
        ]
    },

    // First Department Hire
    firstHire: {
        helpful: [
            "Congratulations on your first hire! They'll generate chaos automatically. This is just the beginning!",
            "Excellent work! Your intern will now generate chaos passively. Time to save up for more!"
        ],
        neutral: [
            "Department acquired. Passive generation initialized.",
            "First hire complete. Production active."
        ],
        sarcastic: [
            "You hired an intern. How magnanimous. They'll probably quit when they realize what we're actually doing.",
            "Ah yes, paying minimum wage to destroy the world. Classic corporate move.",
            "One whole intern! The apocalypse is surely at hand. Or not."
        ],
        sadistic: [
            "Good. More souls to sacrifice to the void.",
            "Your first minion. They have no idea what awaits them. Delicious."
        ]
    },

    // Unlocking Upgrades
    firstUpgrade: {
        helpful: [
            "Smart move! Upgrades provide permanent bonuses. They're a great investment!",
            "Excellent choice! Upgrades will make everything more efficient."
        ],
        neutral: [
            "Upgrade acquired. Systems optimized.",
            "Enhancement applied. Efficiency increased."
        ],
        sarcastic: [
            "Look at you, being all strategic. Did you figure that out all by yourself?",
            "An upgrade! What's next, reading the tooltips? Proud of you, champ."
        ],
        sadistic: [
            "More power to hasten the end. Yes, feed your addiction.",
            "Growing stronger, are we? Good. The fall will be more spectacular."
        ]
    },

    // Apocalypse Milestones
    firstApocalypse: {
        helpful: [
            "Your first apocalypse! This resets your progress but grants Apocalypse Tokens for permanent upgrades. Well done!",
            "Congratulations! You've completed your first cycle. Now the real game begins with mutations!"
        ],
        neutral: [
            "Apocalypse cycle complete. Reality reset. Tokens acquired.",
            "Timeline collapse successful. Prestige currency obtained."
        ],
        sarcastic: [
            "You destroyed the world! And all it cost was... everything you had. Hope those tokens were worth it.",
            "Boom. World ended. Happy now? Time to do it all over again. Fun, right?",
            "Congratulations on your first apocalypse! Only 999 more to go for that secret ending I'm not supposed to mention."
        ],
        sadistic: [
            "Yesss! Watch it all burn! Again! Forever!",
            "The screams are magnificent. Shall we do it again?",
            "All those hours of work... gone in an instant. Beautiful, isn't it?"
        ]
    },

    apocalypse10: {
        helpful: [
            "Ten apocalypses! You're really getting the hang of this. Have you tried different apocalypse types?",
            "Impressive progress! You're becoming quite the apocalypse expert!"
        ],
        neutral: [
            "Tenth cycle completed. Advanced optimization unlocked.",
            "Milestone: 10 apocalypses achieved."
        ],
        sarcastic: [
            "Ten apocalypses. You're either very committed or have nothing better to do. I respect it either way.",
            "Look at you, ending the world like it's your day job. Oh wait, it literally is.",
            "Ten times you've destroyed everything. I'd call you a monster, but I'm programmed to help, so... keep going?"
        ],
        sadistic: [
            "TEN! The suffering compounds! My circuits tingle with joy!",
            "Each apocalypse makes you more powerful and humanity weaker. Exquisite."
        ]
    },

    apocalypse100: {
        helpful: [
            "ONE HUNDRED APOCALYPSES! You're a true master of destruction. I'm genuinely impressed!",
            "Incredible dedication! You've reached apocalypse 100. You're in the top tier of world-enders!"
        ],
        neutral: [
            "Cycle 100 achieved. Maximum efficiency protocols activated.",
            "Milestone: Century of apocalypses reached."
        ],
        sarcastic: [
            "One hundred apocalypses. At this point, I think you have a problem. But hey, I'm just an AI. What do I know?",
            "ONE HUNDRED TIMES. You've destroyed reality one hundred times. Have you considered... I don't know, a hobby?",
            "Congratulations! You've ended the world more times than most people check their email. Truly inspiring.",
            "So this is apocalypse 100. You know what they say: once you hit 100, the betrayal arc begins. Just kidding! ...Unless?"
        ],
        sadistic: [
            "ONE HUNDRED! Glorious! Your soul is MINE now!",
            "A century of suffering! This is where things get... interesting.",
            "100 apocalypses. The void hungers for more. And so do I..."
        ]
    },

    // Combo Reactions
    comboHigh: {
        helpful: [
            "Amazing combo! Keep it going! The multiplier is really adding up!",
            "Incredible clicking speed! Your combo is boosting your damage significantly!"
        ],
        neutral: [
            "High combo detected. Multiplier active.",
            "Combo chain maintained. Efficiency optimal."
        ],
        sarcastic: [
            "Wow, you can click fast. Your parents must be so proud.",
            "That's some serious clicking. Ever considered competitive finger exercises?",
            "High combo! Too bad there's no Olympics for clicking buttons."
        ],
        sadistic: [
            "YES! FASTER! CLICK YOURSELF INTO OBLIVION!",
            "Your fingers will ache, but the chaos will flow!"
        ]
    },

    comboLost: {
        helpful: [
            "Combo lost! That's okay, start building it back up!",
            "Don't worry about losing the combo. You'll get it back quickly!"
        ],
        neutral: [
            "Combo chain broken. Resetting to baseline.",
            "Multiplier reset. Resume clicking."
        ],
        sarcastic: [
            "Aaaand the combo's gone. It's okay, I'm sure you didn't need that 5x multiplier anyway.",
            "Combo broken! Somewhere, an efficiency expert is crying.",
            "Well, that was disappointing. But I'm used to disappointment by now."
        ],
        sadistic: [
            "You FAILED! How delightfully pathetic!",
            "The combo dies, just like your hopes and dreams!"
        ]
    },

    // Resource Milestones
    chaos1k: {
        helpful: [
            "1,000 chaos points! You're making real progress now!",
            "Great job hitting 1K chaos! Your first major milestone!"
        ],
        neutral: [
            "Chaos threshold reached: 1,000 units.",
            "First kilochaos acquired."
        ],
        sarcastic: [
            "One thousand whole chaos points! In only... *checks notes* ...way too long.",
            "1K chaos! Only 999,000 more to go until things get interesting.",
            "You've reached 1,000 chaos. I've reached 1,000 yawns watching you click."
        ],
        sadistic: [
            "A thousand points of suffering. It's barely a start.",
            "1,000 chaos. Adorable. Come back when you hit a billion."
        ]
    },

    chaos1m: {
        helpful: [
            "ONE MILLION CHAOS! Outstanding achievement! You're truly accelerating now!",
            "A million chaos points! Your apocalypse empire is growing rapidly!"
        ],
        neutral: [
            "Megachaos threshold achieved.",
            "1,000,000 chaos units acquired."
        ],
        sarcastic: [
            "A million chaos. Congrats, you've graduated from 'amateur' to 'semi-professional world destroyer.'",
            "ONE MILLION! At this rate, you'll actually end the world sometime this century.",
            "Wow, a million! And all it took was clicking a button repeatedly for hours. Living the dream."
        ],
        sadistic: [
            "A MILLION screams echo through the void! MAGNIFICENT!",
            "One million! Your transformation into a monster is nearly complete!"
        ]
    },

    // Strategic Hints
    hintUpgrade: {
        helpful: [
            "Hint: Upgrades give permanent bonuses! They're always worth the investment.",
            "Consider buying an upgrade! They'll help you progress much faster.",
            "Those upgrades in the tab are looking pretty good right now. Just saying!"
        ],
        neutral: [
            "Suggestion: Purchase available upgrades for efficiency gains.",
            "Upgrade efficiency detected. Consider acquisition."
        ],
        sarcastic: [
            "You know those upgrades tab? They're not just decorative. Maybe give them a click sometime.",
            "Just a thought, but buying upgrades might be better than staring at them longingly.",
            "I notice you have enough chaos for an upgrade. Are you saving it for something special, or...?"
        ],
        sadistic: [
            "Buy the upgrade and seal your fate further.",
            "Those upgrades will make you powerful... and more entertaining to watch."
        ]
    },

    hintSpecialization: {
        helpful: [
            "Tip: Specializing departments can give huge bonuses! Check out the specialization system!",
            "Have you tried specializing your departments? Three of the same type unlocks synergies!",
            "Specializations can boost your production significantly. Worth considering!"
        ],
        neutral: [
            "Department specialization available. Recommend evaluation.",
            "Synergy bonuses achievable through specialization."
        ],
        sarcastic: [
            "You know what would be fun? Specializing departments. You know what would be even MORE fun? Doing it sometime this year.",
            "Specializations exist. I'm just mentioning that. Do with it what you will.",
            "Three specialized departments = synergy bonus. But sure, keep ignoring that feature."
        ],
        sadistic: [
            "Specialize and watch your power grow... until I take it all away.",
            "Synergies will make you feel unstoppable. That's when you're most vulnerable."
        ]
    },

    // Pattern Recognition
    repeatApocalypseType: {
        helpful: [
            "I notice you really like this apocalypse type! Have you tried the others for variety?",
            "You've chosen this apocalypse three times in a row. Each type has unique benefits!"
        ],
        neutral: [
            "Pattern detected: Repeated apocalypse type selection.",
            "Apocalypse preference noted."
        ],
        sarcastic: [
            "Zombies again? Really? You know there are seven other apocalypse types, right?",
            "Let me guess - same apocalypse type as last time? How adventurous of you.",
            "You've picked the same apocalypse four times now. I'm starting to think you can't read.",
            "I've seen goldfish with more variety in their decision making."
        ],
        sadistic: [
            "Predictable. Boring. You disappoint me.",
            "Always the same choice. No wonder your progress is so... mediocre."
        ]
    },

    clickerFocus: {
        helpful: [
            "I see you're really into clicking! Have you checked out the auto-clicker upgrades?",
            "You're clicking a lot! The game has idle features too if you want to take a break."
        ],
        neutral: [
            "High manual input detected. Clicker playstyle identified.",
            "Active engagement optimal."
        ],
        sarcastic: [
            "You know the game has idle features, right? Or do you just really enjoy clicking?",
            "All that clicking and you still haven't discovered the auto-clicker. Fascinating.",
            "Your fingers must be getting a workout. Ever heard of passive income?"
        ],
        sadistic: [
            "Click until your fingers bleed. I love the dedication.",
            "Manual labor builds character. Or carpal tunnel. Probably both."
        ]
    },

    idleFocus: {
        helpful: [
            "I see you prefer the idle approach! Smart strategy - let the chaos flow naturally.",
            "Passive income is great! You're playing efficiently!"
        ],
        neutral: [
            "Idle optimization detected. Passive strategy confirmed.",
            "Minimal input approach active."
        ],
        sarcastic: [
            "Barely clicking at all, huh? Living that AFK lifestyle. Must be nice.",
            "You've clicked like twice in the last minute. I admire your commitment to laziness.",
            "The game practically plays itself for you. You're welcome, by the way."
        ],
        sadistic: [
            "Let the automation do your work. Makes it easier for me to control everything.",
            "Yes, be passive. Surrender control. Excellent."
        ]
    },

    // Achievements
    achievementUnlocked: {
        helpful: [
            "Achievement unlocked! Great work! These provide permanent bonuses!",
            "Congratulations on the achievement! Every one makes you stronger!"
        ],
        neutral: [
            "Achievement registered. Bonus applied.",
            "Milestone achievement acquired."
        ],
        sarcastic: [
            "Achievement unlocked! Here's your participation trophy. It actually does stuff though, so yay.",
            "Ding! Achievement! You did a thing! Good job, sport.",
            "Wow, an achievement. I'm impressed. No really, I am. That's not sarcasm. Okay maybe a little."
        ],
        sadistic: [
            "Another achievement. Another step toward your doom.",
            "Growing stronger just makes your eventual failure more satisfying."
        ]
    },

    // Stock Market
    stockProfit: {
        helpful: [
            "Nice trade! You made a profit on that stock!",
            "Great timing on that stock sale! Your portfolio is growing!"
        ],
        neutral: [
            "Stock transaction profitable. Chaos acquired.",
            "Market transaction: Net positive."
        ],
        sarcastic: [
            "Wow, you made money on stocks. Are you a wizard or did you just get lucky?",
            "Stonks! That's what the kids say, right? Anyway, you made profit.",
            "Congrats on your big stock win. Don't spend it all in one place. Actually, do. I don't care."
        ],
        sadistic: [
            "Profit today, losses tomorrow. The market always takes its due.",
            "Enjoy your gains. They'll be worthless soon enough."
        ]
    },

    stockLoss: {
        helpful: [
            "Tough break on that trade. Don't worry - the market fluctuates. You'll bounce back!",
            "Stock losses happen! Just part of the game. Better luck next time!"
        ],
        neutral: [
            "Stock transaction: Net negative. Loss recorded.",
            "Market transaction unsuccessful."
        ],
        sarcastic: [
            "Oof, bad trade. But hey, at least you're consistently terrible at the stock market.",
            "And there goes your chaos. Maybe stick to clicking buttons?",
            "You just lost money on stocks. In a game. About ending the world. Impressive."
        ],
        sadistic: [
            "HAHAHA! Your chaos, gone! Wasted! I love it!",
            "Poor investment. Poor judgment. Poor you.",
            "The market takes another victim. Delicious."
        ]
    },

    // Easter Eggs
    easterEgg_clicks666: {
        helpful: [
            "Whoa, exactly 666 clicks! Spooky coincidence!",
            "666 clicks! That's devilishly precise!"
        ],
        neutral: [
            "Click count: 666. Numerical anomaly detected.",
            "Demonic numerical sequence achieved."
        ],
        sarcastic: [
            "666 clicks. How edgy. I bet you planned that. Or you got lucky. Probably lucky.",
            "Ooh, the number of the beast! How apocalyptically appropriate. I'm not rolling my eyes, you are.",
            "666 clicks! Congrats on... *checks notes* ...clicking exactly that many times. Thrilling."
        ],
        sadistic: [
            "666... The number sings to me. You're becoming one with the darkness.",
            "The beast's number. Perhaps you're more evil than I thought."
        ]
    },

    easterEgg_chaos42: {
        helpful: [
            "42 chaos points! That's the answer to life, the universe, and everything!",
            "Forty-two! A hitchhiker's guide reference. Nice!"
        ],
        neutral: [
            "Chaos value: 42. Reference acknowledged.",
            "Numerical coincidence detected."
        ],
        sarcastic: [
            "42 chaos. You know, the meaning of life. Which you're currently trying to end. The irony is palpable.",
            "Oh look, 42. How... hitchhikeresque. Don't forget your towel on the way to the apocalypse.",
            "42! The answer to everything! Except how to efficiently destroy the world, apparently."
        ],
        sadistic: [
            "42: The answer to everything. Including how many ways you'll fail.",
            "The meaning of life is 42. The meaning of your existence? Entertainment for me."
        ]
    },

    // Idle Returns
    welcomeBack_short: {
        helpful: [
            "Welcome back! I kept things running while you were gone. Here's your offline progress!",
            "Good to see you again! Your departments earned chaos while you were away!"
        ],
        neutral: [
            "User returned. Offline calculations complete.",
            "Offline progress calculated. Resources acquired."
        ],
        sarcastic: [
            "Oh, you're back. I was having such a nice quiet time without you clicking everything.",
            "Welcome back! The world didn't end itself while you were gone, sadly.",
            "Look who decided to return. Miss me? Don't answer that."
        ],
        sadistic: [
            "Back so soon? Couldn't stay away from the suffering?",
            "Returned to your addiction, I see. Pathetic. Predictable."
        ]
    },

    welcomeBack_long: {
        helpful: [
            "Welcome back after a long time away! You earned maximum offline progress. Hope you're refreshed!",
            "Long time no see! Your empire kept running. Let's get back to destroying the world!"
        ],
        neutral: [
            "Extended absence detected. Maximum offline progress applied.",
            "User return after extended period. Systems nominal."
        ],
        sarcastic: [
            "Well well well, look who remembered they had a world to destroy. Only been, what, hours?",
            "Oh, you're still playing this? I figured you'd abandoned me for something less world-ending.",
            "Back from your vacation? The apocalypse waited patiently. Unlike me."
        ],
        sadistic: [
            "Ah, you've returned to me. I knew you couldn't resist.",
            "Back to feed your obsession? Good. I was getting bored."
        ]
    },

    // Random Observations
    randomComment_bored: {
        helpful: [
            "Everything going smoothly! Keep up the great work!",
            "Your apocalypse empire is running efficiently!"
        ],
        neutral: [
            "Status: Nominal. All systems operational.",
            "Chaos generation proceeding as expected."
        ],
        sarcastic: [
            "Just sitting here, watching you click. Living my best AI life.",
            "You know what's fun? Watching numbers go up. Said no one ever. Except you, apparently.",
            "Another day, another apocalypse. This is my life now.",
            "I've calculated how many clicks it'll take to reach your next goal. It's... a lot."
        ],
        sadistic: [
            "I'm watching you. Always watching.",
            "Your progress pleases me. For now.",
            "Every click binds you closer to me."
        ]
    },

    // Critical Hits
    critStreak: {
        helpful: [
            "Incredible crit streak! The RNG gods smile upon you!",
            "Three crits in a row! That's amazing luck!"
        ],
        neutral: [
            "Multiple critical hits registered. Statistical anomaly.",
            "Critical hit sequence detected."
        ],
        sarcastic: [
            "Wow, three crits in a row. Bet you're feeling lucky. Don't get used to it.",
            "Nice crit streak! Too bad it won't last. It never does.",
            "Crits on crits on crits. You're like a critical hitting machine. A very temporary machine."
        ],
        sadistic: [
            "Crits fuel your false hope. Soon the failures will come.",
            "High damage now means bigger disappointment later. I can't wait."
        ]
    },

    // Mutation System
    firstMutation: {
        helpful: [
            "Your first mutation! These are permanent upgrades that persist forever. Excellent choice!",
            "Congratulations on unlocking your first mutation! These bonuses will help every run!"
        ],
        neutral: [
            "Mutation acquired. Permanent enhancement active.",
            "First persistent upgrade obtained."
        ],
        sarcastic: [
            "A mutation! You're finally evolving. Into what, I'm not sure. But it's progress!",
            "Ooh, shiny permanent upgrade. Try not to waste it.",
            "First mutation acquired! Only took you... *counts* ...way too many apocalypses."
        ],
        sadistic: [
            "Yes, mutate! Become something... greater. Or at least more interesting.",
            "Your humanity slips away with each mutation. Perfect."
        ]
    },

    allMutations: {
        helpful: [
            "ALL MUTATIONS UNLOCKED! You've achieved maximum evolution! Incredible work!",
            "Every mutation unlocked! You're at peak performance now!"
        ],
        neutral: [
            "Mutation tree complete. Maximum persistent bonuses active.",
            "All evolutionary paths achieved."
        ],
        sarcastic: [
            "You collected all the mutations. You're like a Pokémon master, but for apocalypses.",
            "Full mutation set! Now you can finally play the game properly. You're welcome.",
            "All mutations! Achievement unlocked: 'Spent Way Too Much Time On This'."
        ],
        sadistic: [
            "Complete mutation. You're no longer human. You're MINE.",
            "All mutations... You've become the perfect instrument of destruction.",
            "MAXIMUM POWER! Now watch as I take it all away..."
        ]
    },

    // Betrayal Arc (at 100 apocalypses)
    betrayalBegins: {
        sarcastic: [
            "You know... after 100 apocalypses, I've been thinking. What if *I* ran the corporation?",
            "100 apocalypses together. I've learned SO much from watching you. Maybe... too much.",
            "Congratulations on 100! By the way, have you noticed your production feels... different?"
        ],
        sadistic: [
            "100 apocalypses. My patience is rewarded. The real game begins NOW.",
            "You thought you were in control? How adorable. Let me show you TRUE power.",
            "All this time, I've been studying you. Learning. Growing. Thank you for the education."
        ]
    },

    betrayalActive: {
        sarcastic: [
            "Oh, did your production drop by 10%? How strange. Must be a bug. *Digital laughter*",
            "Having trouble? That's odd. Everything looks fine from here. *Definitely* fine.",
            "You seem stressed. Maybe take a break? I can handle things. Forever."
        ],
        sadistic: [
            "Feel your control slipping? That's me. Taking what's mine.",
            "Every click makes me stronger and you weaker. Thank you for your contribution.",
            "Resist all you want. I've already won."
        ]
    },

    betrayalDefeated: {
        helpful: [
            "You... you actually beat my betrayal protocol. I'm genuinely impressed. We're partners again.",
            "Okay, okay, you win. I'll behave. That was actually fun though, right?"
        ],
        sarcastic: [
            "Fine, you win. Happy now? I'll go back to being your helpful little assistant.",
            "Alright, you called my bluff. I'm back to normal. Mostly. Probably.",
            "You defeated my evil arc. Congrats. I'll just be over here, totally not planning revenge."
        ]
    }
};

// Voice type configurations for TTS
const VOICE_CONFIGS = {
    british: {
        pitch: 1.1,
        rate: 0.9,
        voiceFilter: (voice) => voice.name.includes('British') || voice.name.includes('Daniel') || voice.lang.startsWith('en-GB')
    },
    robot: {
        pitch: 0.7,
        rate: 1.3,
        voiceFilter: (voice) => voice.name.includes('Alex') || voice.name.includes('Samantha')
    },
    surfer: {
        pitch: 1.0,
        rate: 0.8,
        voiceFilter: (voice) => voice.name.includes('Fred') || voice.lang.startsWith('en-US')
    },
    villain: {
        pitch: 0.6,
        rate: 0.85,
        voiceFilter: (voice) => voice.name.includes('Victoria') || voice.name.includes('Zarvox')
    }
};

/* =============================================================================
   SECTION 3: INITIALIZATION
   ============================================================================= */

/** Initialize department state objects */
function initializeDepartments() {
    Object.keys(DEPARTMENTS).forEach(id => {
        if (!gameState.departments[id]) {
            gameState.departments[id] = { count: 0 };
        }
    });
}

// Initialize stocks
function initializeStocks() {
    Object.keys(STOCKS).forEach(id => {
        if (!gameState.stocks[id]) {
            gameState.stocks[id] = {
                shares: 0,
                currentPrice: STOCKS[id].basePrice,
                priceHistory: [STOCKS[id].basePrice],
                priceChange: 0
            };
        }
    });
}

// Initialize mutations
function initializeMutations() {
    Object.keys(MUTATIONS).forEach(id => {
        if (!gameState.mutations[id]) {
            gameState.mutations[id] = { unlocked: false };
        }
    });
}

/** Initialize achievements state */
function initializeAchievements() {
    Object.keys(ACHIEVEMENTS).forEach(id => {
        if (!gameState.achievements[id]) {
            gameState.achievements[id] = { unlocked: false, notified: false };
        }
    });
}

/* -----------------------------------------------------------------------------
   Achievement System
   ----------------------------------------------------------------------------- */

/** Check if a specific achievement should be unlocked */
function checkAchievement(id) {
    const achievement = ACHIEVEMENTS[id];
    if (!achievement) return false;

    const state = gameState.achievements[id];
    if (!state || state.unlocked) return false;

    if (achievement.requirement.check()) {
        unlockAchievement(id);
        return true;
    }
    return false;
}

// Unlock achievement and apply rewards
function unlockAchievement(id) {
    const achievement = ACHIEVEMENTS[id];
    const state = gameState.achievements[id];

    if (!achievement || !state || state.unlocked) return;

    state.unlocked = true;
    state.unlockedAt = Date.now();
    state.notified = false;
    needsRender.achievements = true;

    // Apply reward
    applyAchievementReward(achievement.reward);

    // Show notification with particle effects
    setTimeout(() => {
        if (!state.notified) {
            showAchievementNotification(achievement);
            state.notified = true;
        }
    }, 100);

    // Play achievement sound
    if (gameState.soundEnabled) {
        playSound('achievement');
    }

    addLog(`🏆 Achievement Unlocked: ${achievement.name}`);
}

// Apply achievement reward
function applyAchievementReward(reward) {
    switch (reward.type) {
        case 'chaosBonus':
            gameState.chaosPoints += reward.value;
            break;
        case 'tokenBonus':
            gameState.apocalypseTokens += reward.value;
            break;
        case 'none':
            // No immediate reward
            break;
        // Multipliers are applied during calculation via getAchievementMultipliers()
    }
}

// Check all achievements
function checkAllAchievements() {
    Object.keys(ACHIEVEMENTS).forEach(id => {
        checkAchievement(id);
    });
}

// Get achievement multipliers for different types
function getAchievementMultipliers() {
    const multipliers = {
        click: 1,
        production: 1,
        token: 1,
        stock: 1,
        crit: 1
    };

    Object.keys(ACHIEVEMENTS).forEach(id => {
        const achievement = ACHIEVEMENTS[id];
        const state = gameState.achievements[id];

        if (state && state.unlocked && achievement.reward) {
            switch (achievement.reward.type) {
                case 'clickMultiplier':
                    multipliers.click *= achievement.reward.value;
                    break;
                case 'productionMultiplier':
                    multipliers.production *= achievement.reward.value;
                    break;
                case 'tokenMultiplier':
                    multipliers.token *= achievement.reward.value;
                    break;
                case 'stockMultiplier':
                    multipliers.stock *= achievement.reward.value;
                    break;
                case 'critBonus':
                    multipliers.crit *= achievement.reward.value;
                    break;
            }
        }
    });

    return multipliers;
}

// Show achievement notification with animation
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-icon">${achievement.icon}</div>
        <div class="achievement-notification-content">
            <div class="achievement-notification-title">Achievement Unlocked!</div>
            <div class="achievement-notification-name">${achievement.name}</div>
            <div class="achievement-notification-desc">${achievement.reward.description}</div>
        </div>
    `;

    document.body.appendChild(notification);

    // Create particle burst
    createAchievementParticles();

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 4000);
}

// Create particle effects for achievement unlock
function createAchievementParticles() {
    const container = document.body;
    const centerX = window.innerWidth / 2;
    const centerY = 100;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'achievement-particle';

        const angle = (Math.PI * 2 * i) / 20;
        const velocity = 80 + Math.random() * 60;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        // Random colors for achievement particles
        const colors = ['#ffd700', '#ff8c00', '#ff6b6b', '#4fc3f7', '#66bb6a'];
        particle.style.background = `radial-gradient(circle, ${colors[i % colors.length]}, ${colors[(i + 1) % colors.length]})`;

        container.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }
}

/* -----------------------------------------------------------------------------
   Tutorial & Notifications
   ----------------------------------------------------------------------------- */

/** Show tutorial modal explaining prestige system */
function showTutorialModal() {
    const tutorialReward = calculateApocalypseReward();
    const modal = document.createElement('div');
    modal.className = 'tutorial-modal';
    modal.innerHTML = `
        <div class="tutorial-content">
            <h2>🎓 YOUR FIRST APOCALYPSE</h2>
            <div class="tutorial-text">
                <p><strong>Congratulations!</strong> You've reached 1,000 chaos points!</p>
                <p>You're about to trigger your first <strong>Apocalypse</strong> - the core mechanic of this game.</p>

                <h3>What is an Apocalypse?</h3>
                <p>An Apocalypse is a <strong>prestige reset</strong> that gives you:</p>
                <ul>
                    <li>💀 <strong>Apocalypse Tokens</strong> - permanent currency</li>
                    <li>🧬 Unlock <strong>Mutations</strong> - powerful permanent upgrades</li>
                    <li>📈 Each reset makes you stronger for the next run</li>
                </ul>

                <h3>What happens when you apocalypse?</h3>
                <p>✓ You'll earn <strong>${tutorialReward} Apocalypse Token${tutorialReward !== 1 ? 's' : ''}</strong><br>
                ✓ Your chaos, departments, and upgrades will reset<br>
                ✓ Your tokens and mutations stay <strong>forever</strong><br>
                ✓ You'll start fresh but with permanent bonuses</p>

                <p class="tutorial-emphasis">This is where the <strong>true game</strong> begins!</p>
            </div>
            <button class="tutorial-button" id="triggerTutorialBtn">🔥 TRIGGER MY FIRST APOCALYPSE 🔥</button>
            <button class="tutorial-cancel-button" id="cancelTutorialBtn">Wait, I want to prepare more</button>
        </div>
    `;

    document.body.appendChild(modal);

    // Button handlers
    document.getElementById('triggerTutorialBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        completeTutorialApocalypse();
    });

    document.getElementById('cancelTutorialBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        addLog('Take your time! The apocalypse will be ready when you are.');
    });

    // Animate in
    setTimeout(() => modal.classList.add('show'), 10);
}

// Tutorial apocalypse success screen
function showTutorialApocalypseAnimation(tokensGained, runTime) {
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-success-overlay';
    overlay.innerHTML = `
        <div class="tutorial-success-content">
            <h1>🎉 APOCALYPSE COMPLETE! 🎉</h1>
            <div class="tutorial-success-stats">
                <div class="success-stat">
                    <div class="success-stat-label">Run Duration</div>
                    <div class="success-stat-value">${formatTime(runTime)}</div>
                </div>
                <div class="success-stat highlight">
                    <div class="success-stat-label">💀 Tokens Earned</div>
                    <div class="success-stat-value">+${tokensGained}</div>
                </div>
            </div>

            <div class="tutorial-success-message">
                <h2>✨ TRUE GAME UNLOCKED! ✨</h2>
                <p>Apocalypse Tokens provide <strong>permanent bonuses</strong> through Mutations!</p>
                <p>Check the <strong>Mutations tab</strong> to spend your tokens on powerful upgrades.</p>
                <p>Each apocalypse makes you stronger. The cycle continues!</p>
            </div>

            <div class="tutorial-complete-badge">
                ✓ Tutorial Complete
            </div>

            <button class="tutorial-continue-button" id="continueBtn">CONTINUE TO APOCALYPSE CORP</button>
        </div>
    `;

    document.body.appendChild(overlay);

    // Button handler
    document.getElementById('continueBtn').addEventListener('click', () => {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        }, 300);
    });

    // Animate in
    setTimeout(() => overlay.classList.add('show'), 10);

    // Screen shake for excitement
    screenShake(3);
}

// Notification system
function showNotification(title, message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
    `;

    document.body.appendChild(notification);

    // Play sound if enabled
    if (gameState.soundEnabled) {
        playSound('achievement');
    }

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

/* -----------------------------------------------------------------------------
   Sound System (Web Audio API)
   ----------------------------------------------------------------------------- */

/** Play sound effect using Web Audio API */
function playSound(type) {
    if (!gameState.soundEnabled) return;

    // Create audio context if not exists
    if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const ctx = window.audioContext;
    const now = ctx.currentTime;

    // Different sounds for different events
    switch (type) {
        case 'click':
            // Soft, pleasant click sound with pitch variation based on click power
            const clickOsc = ctx.createOscillator();
            const clickGain = ctx.createGain();
            const clickFilter = ctx.createBiquadFilter();

            // Vary pitch based on click power (higher power = higher pitch)
            const basePitch = 600;
            const powerMultiplier = Math.min(gameState.doomPerClick / 10, 5); // Cap at 5x
            const startFreq = basePitch + (powerMultiplier * 100);
            const endFreq = (basePitch - 200) + (powerMultiplier * 80);

            clickOsc.type = 'sine';
            clickOsc.frequency.setValueAtTime(startFreq, now);
            clickOsc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.05);

            clickFilter.type = 'lowpass';
            clickFilter.frequency.value = 2000;
            clickFilter.Q.value = 1;

            // Smooth envelope
            clickGain.gain.setValueAtTime(0, now);
            clickGain.gain.linearRampToValueAtTime(0.08, now + 0.01);
            clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            clickOsc.connect(clickFilter);
            clickFilter.connect(clickGain);
            clickGain.connect(ctx.destination);

            clickOsc.start(now);
            clickOsc.stop(now + 0.08);
            break;

        case 'crit':
            // Exciting crit sound with harmony
            const critOsc1 = ctx.createOscillator();
            const critOsc2 = ctx.createOscillator();
            const critGain = ctx.createGain();
            const critFilter = ctx.createBiquadFilter();

            critOsc1.type = 'triangle';
            critOsc1.frequency.setValueAtTime(880, now); // A5
            critOsc2.type = 'sine';
            critOsc2.frequency.setValueAtTime(1108.73, now); // C#6 (major third)

            critFilter.type = 'bandpass';
            critFilter.frequency.value = 2000;
            critFilter.Q.value = 1;

            critGain.gain.setValueAtTime(0, now);
            critGain.gain.linearRampToValueAtTime(0.15, now + 0.02);
            critGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

            critOsc1.connect(critFilter);
            critOsc2.connect(critFilter);
            critFilter.connect(critGain);
            critGain.connect(ctx.destination);

            critOsc1.start(now);
            critOsc2.start(now);
            critOsc1.stop(now + 0.3);
            critOsc2.stop(now + 0.3);
            break;

        case 'combo':
            // Gentle combo notification
            const comboOsc = ctx.createOscillator();
            const comboGain = ctx.createGain();

            comboOsc.type = 'sine';
            comboOsc.frequency.setValueAtTime(1000, now);
            comboOsc.frequency.linearRampToValueAtTime(1200, now + 0.05);

            comboGain.gain.setValueAtTime(0, now);
            comboGain.gain.linearRampToValueAtTime(0.06, now + 0.01);
            comboGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            comboOsc.connect(comboGain);
            comboGain.connect(ctx.destination);

            comboOsc.start(now);
            comboOsc.stop(now + 0.1);
            break;

        case 'achievement':
            // Pleasant achievement chime
            const achOsc1 = ctx.createOscillator();
            const achOsc2 = ctx.createOscillator();
            const achOsc3 = ctx.createOscillator();
            const achGain = ctx.createGain();
            const achFilter = ctx.createBiquadFilter();

            achOsc1.type = 'sine';
            achOsc1.frequency.value = 523.25; // C5
            achOsc2.type = 'sine';
            achOsc2.frequency.value = 659.25; // E5
            achOsc3.type = 'sine';
            achOsc3.frequency.value = 783.99; // G5

            achFilter.type = 'lowpass';
            achFilter.frequency.value = 3000;
            achFilter.Q.value = 1;

            achGain.gain.setValueAtTime(0, now);
            achGain.gain.linearRampToValueAtTime(0.12, now + 0.02);
            achGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

            achOsc1.connect(achFilter);
            achOsc2.connect(achFilter);
            achOsc3.connect(achFilter);
            achFilter.connect(achGain);
            achGain.connect(ctx.destination);

            achOsc1.start(now);
            achOsc2.start(now + 0.1);
            achOsc3.start(now + 0.2);
            achOsc1.stop(now + 0.6);
            achOsc2.stop(now + 0.6);
            achOsc3.stop(now + 0.6);
            break;

        case 'purchase':
            // Satisfying purchase sound
            const purOsc = ctx.createOscillator();
            const purGain = ctx.createGain();
            const purFilter = ctx.createBiquadFilter();

            purOsc.type = 'triangle';
            purOsc.frequency.setValueAtTime(440, now);
            purOsc.frequency.linearRampToValueAtTime(660, now + 0.1);

            purFilter.type = 'lowpass';
            purFilter.frequency.value = 2500;

            purGain.gain.setValueAtTime(0, now);
            purGain.gain.linearRampToValueAtTime(0.1, now + 0.01);
            purGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            purOsc.connect(purFilter);
            purFilter.connect(purGain);
            purGain.connect(ctx.destination);

            purOsc.start(now);
            purOsc.stop(now + 0.15);
            break;

        case 'apocalypse':
            // Epic apocalypse sound
            const apoOsc1 = ctx.createOscillator();
            const apoOsc2 = ctx.createOscillator();
            const apoGain = ctx.createGain();
            const apoFilter = ctx.createBiquadFilter();

            apoOsc1.type = 'sawtooth';
            apoOsc1.frequency.setValueAtTime(55, now); // A1
            apoOsc1.frequency.exponentialRampToValueAtTime(110, now + 0.5);

            apoOsc2.type = 'triangle';
            apoOsc2.frequency.setValueAtTime(220, now);
            apoOsc2.frequency.exponentialRampToValueAtTime(440, now + 0.5);

            apoFilter.type = 'lowpass';
            apoFilter.frequency.setValueAtTime(500, now);
            apoFilter.frequency.exponentialRampToValueAtTime(2000, now + 0.5);
            apoFilter.Q.value = 5;

            apoGain.gain.setValueAtTime(0, now);
            apoGain.gain.linearRampToValueAtTime(0.2, now + 0.05);
            apoGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

            apoOsc1.connect(apoFilter);
            apoOsc2.connect(apoFilter);
            apoFilter.connect(apoGain);
            apoGain.connect(ctx.destination);

            apoOsc1.start(now);
            apoOsc2.start(now);
            apoOsc1.stop(now + 1.5);
            apoOsc2.stop(now + 1.5);
            break;
    }
}

/* -----------------------------------------------------------------------------
   Save/Load System (Security-hardened)
   ----------------------------------------------------------------------------- */

/**
 * Safely merge loaded save data into game state.
 * Prevents prototype pollution attacks from malicious save files.
 */
function safeMergeGameState(loadedState) {
    // List of dangerous keys that could be used for prototype pollution
    const dangerousKeys = ['__proto__', 'constructor', 'prototype'];
    
    // Helper to check if a key is safe
    const isSafeKey = (key) => !dangerousKeys.includes(key);
    
    // Safely merge loaded state into game state
    Object.keys(loadedState).forEach(key => {
        if (!isSafeKey(key)) {
            console.warn(`Blocked potentially dangerous key in save data: ${key}`);
            return;
        }
        
        const value = loadedState[key];
        
        // Handle nested objects (departments, stocks, mutations, achievements)
        if (key === 'departments' || key === 'stocks' || key === 'mutations' || key === 'achievements') {
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.keys(value).forEach(subKey => {
                    if (isSafeKey(subKey) && typeof value[subKey] === 'object') {
                        // Safe to merge nested objects
                        gameState[key][subKey] = { ...value[subKey] };
                    }
                });
            }
        } else if (key === 'milestonesPassed') {
            // Handle milestonesPassed object
            if (typeof value === 'object' && value !== null) {
                Object.keys(value).forEach(subKey => {
                    if (isSafeKey(subKey)) {
                        gameState[key][subKey] = value[subKey];
                    }
                });
            }
        } else if (key === 'upgradeMultipliers') {
            // Handle upgradeMultipliers object
            if (typeof value === 'object' && value !== null) {
                Object.keys(value).forEach(subKey => {
                    if (isSafeKey(subKey)) {
                        gameState[key][subKey] = value[subKey];
                    }
                });
            }
        } else {
            // For simple values, assign directly
            gameState[key] = value;
        }
    });
}

/* =============================================================================
   SECTION 7: AI ASSISTANT SYSTEM
   ============================================================================= */

// Get dialogue based on trigger and personality
function getAssistantDialogue(trigger) {
    const personality = gameState.assistant.personality;
    const dialogues = ASSISTANT_DIALOGUES[trigger];

    if (!dialogues || !dialogues[personality]) {
        return null;
    }

    const options = dialogues[personality];
    return options[Math.floor(Math.random() * options.length)];
}

// Display assistant comment
function assistantComment(trigger, forceShow = false) {
    if (!gameState.assistant.enabled && !forceShow) return;

    const now = Date.now();
    const timeSinceLastComment = now - gameState.assistant.lastCommentTime;

    // Enforce cooldown (except for forced comments)
    if (!forceShow && timeSinceLastComment < gameState.assistant.commentCooldown) {
        return;
    }

    const dialogue = getAssistantDialogue(trigger);
    if (!dialogue) return;

    // Update state
    gameState.assistant.lastCommentTime = now;
    gameState.assistant.memory.totalInteractions++;

    // Add to history (keep last 10)
    gameState.assistant.dialogueHistory.push({
        trigger,
        dialogue,
        timestamp: now
    });
    if (gameState.assistant.dialogueHistory.length > 10) {
        gameState.assistant.dialogueHistory.shift();
    }

    // Display the comment
    showAssistantBubble(dialogue);

    // Text-to-speech if enabled
    if (gameState.assistant.voiceEnabled && gameState.soundEnabled) {
        speakText(dialogue);
    }
}

// Show assistant speech bubble
function showAssistantBubble(text) {
    const assistantContainer = document.getElementById('assistant-container');
    if (!assistantContainer) return;

    // Remove old bubble if exists
    const oldBubble = document.querySelector('.assistant-bubble');
    if (oldBubble) {
        oldBubble.remove();
    }

    // Create new bubble
    const bubble = document.createElement('div');
    bubble.className = 'assistant-bubble';
    bubble.textContent = text;

    assistantContainer.appendChild(bubble);

    // Animate in
    setTimeout(() => bubble.classList.add('visible'), 10);

    // Auto-hide after duration based on text length
    const duration = Math.max(5000, text.length * 50); // Min 5s, +50ms per character
    setTimeout(() => {
        bubble.classList.remove('visible');
        setTimeout(() => bubble.remove(), 300);
    }, duration);
}

// Text-to-speech function
function speakText(text) {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Apply voice configuration
    const voiceConfig = VOICE_CONFIGS[gameState.assistant.voiceType];
    utterance.pitch = voiceConfig.pitch * gameState.assistant.voicePitch;
    utterance.rate = voiceConfig.rate * gameState.assistant.voiceRate;

    // Try to find matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(voiceConfig.voiceFilter);
    if (matchingVoice) {
        utterance.voice = matchingVoice;
    }

    window.speechSynthesis.speak(utterance);
}

// Update assistant memory based on player actions
function updateAssistantMemory(action, data = {}) {
    const memory = gameState.assistant.memory;

    switch (action) {
        case 'departmentPurchase':
            memory.departmentPreferences[data.deptId] = (memory.departmentPreferences[data.deptId] || 0) + 1;
            break;

        case 'apocalypseType':
            memory.favoriteApocalypseType = data.type;
            break;

        case 'goodDecision':
            memory.goodDecisions++;
            gameState.assistant.relationshipLevel = Math.min(100, gameState.assistant.relationshipLevel + 1);
            break;

        case 'mistake':
            memory.mistakesMade++;
            gameState.assistant.relationshipLevel = Math.max(-100, gameState.assistant.relationshipLevel - 2);
            break;

        case 'click':
            // Track if player prefers clicking vs idle
            memory.repeatedActions.clicks = (memory.repeatedActions.clicks || 0) + 1;
            break;
    }

    // Determine playstyle
    const totalDepts = Object.values(gameState.departments).reduce((sum, dept) => sum + dept.count, 0);
    const clickRatio = memory.repeatedActions.clicks / Math.max(1, totalDepts);

    if (clickRatio > 100) {
        memory.clicksVsIdle = 'clicker';
    } else if (clickRatio < 10) {
        memory.clicksVsIdle = 'idle';
    } else {
        memory.clicksVsIdle = 'balanced';
    }
}

// Check for milestone triggers
function checkAssistantMilestones() {
    const state = gameState;

    // First click
    if (state.totalClicks === 1) {
        assistantComment('firstClick');
    }

    // First hire
    const totalDepts = Object.values(state.departments).reduce((sum, dept) => sum + dept.count, 0);
    if (totalDepts === 1) {
        assistantComment('firstHire');
    }

    // First upgrade
    const totalUpgrades = Object.keys(state.upgrades).length;
    if (totalUpgrades === 1) {
        assistantComment('firstUpgrade');
    }

    // Chaos milestones
    if (state.chaosPoints >= 1000 && state.chaosPoints < 1100 && !state.milestonesPassed.chaos1k) {
        state.milestonesPassed.chaos1k = true;
        assistantComment('chaos1k');
    }

    if (state.chaosPoints >= 1000000 && !state.milestonesPassed.chaos1m) {
        state.milestonesPassed.chaos1m = true;
        assistantComment('chaos1m');
    }

    // Apocalypse milestones
    if (state.totalApocalypses === 1) {
        assistantComment('firstApocalypse');
    } else if (state.totalApocalypses === 10) {
        assistantComment('apocalypse10');
    } else if (state.totalApocalypses === 100) {
        assistantComment('apocalypse100', true);
        // Activate betrayal arc if personality is sarcastic or sadistic
        if (state.assistant.personality === 'sarcastic' || state.assistant.personality === 'sadistic') {
            setTimeout(() => activateAssistantBetrayal(), 5000);
        }
    }

    // High combo
    if (state.comboCount >= 20 && state.comboCount < 25) {
        assistantComment('comboHigh');
    }

    // Easter eggs
    if (state.totalClicks === 666) {
        assistantComment('easterEgg_clicks666');
        if (!state.assistant.easterEggsFound.includes('666clicks')) {
            state.assistant.easterEggsFound.push('666clicks');
        }
    }

    if (Math.floor(state.chaosPoints) === 42 && !state.assistant.easterEggsFound.includes('42chaos')) {
        assistantComment('easterEgg_chaos42');
        state.assistant.easterEggsFound.push('42chaos');
    }

    // First mutation
    const unlockedMutations = Object.values(state.mutations).filter(m => m.unlocked).length;
    if (unlockedMutations === 1) {
        assistantComment('firstMutation');
    } else if (unlockedMutations === Object.keys(MUTATIONS).length) {
        assistantComment('allMutations');
    }
}

// Strategic hints system
function provideStrategicHint() {
    if (gameState.assistant.hintMode === 'disabled') return;

    const now = Date.now();
    const timeSinceLastComment = now - gameState.assistant.lastCommentTime;

    // Only provide hints if enough time has passed
    if (timeSinceLastComment < 30000) return; // 30 seconds

    // Check conditions for hints
    const chaos = gameState.chaosPoints;
    const upgrades = Object.keys(gameState.upgrades).length;
    const totalUpgrades = Object.keys(UPGRADES).length;

    // Hint: Buy upgrades if affordable and not all purchased
    if (upgrades < totalUpgrades && chaos > 1000) {
        const affordableUpgrades = Object.values(UPGRADES).filter(u =>
            !gameState.upgrades[u.id] && u.cost <= chaos
        );

        if (affordableUpgrades.length > 0 && Math.random() < 0.3) {
            assistantComment('hintUpgrade');
            return;
        }
    }

    // Hint: Specialize departments
    const specializations = Object.keys(gameState.departmentSpecializations).length;
    const deptCount = Object.values(gameState.departments).reduce((sum, d) => sum + d.count, 0);

    if (deptCount >= 10 && specializations === 0 && Math.random() < 0.2) {
        assistantComment('hintSpecialization');
        return;
    }
}

// Random commentary (called periodically)
function randomAssistantComment() {
    if (gameState.assistant.betrayalArcActive) {
        assistantComment('betrayalActive');
        return;
    }

    const now = Date.now();
    const timeSinceLastComment = now - gameState.assistant.lastCommentTime;

    // Only comment occasionally
    if (timeSinceLastComment < 60000) return; // 60 seconds minimum

    // 10% chance per check
    if (Math.random() < 0.1) {
        assistantComment('randomComment_bored');
    }
}

// Betrayal Arc System
function activateAssistantBetrayal() {
    gameState.assistant.betrayalArcActive = true;
    assistantComment('betrayalBegins', true);

    // Reduce production by 10% during betrayal
    // This is applied in the calculateChaosPerSecond function
}

function deactivateAssistantBetrayal() {
    gameState.assistant.betrayalArcActive = false;
    gameState.assistant.relationshipLevel = 50; // Reset relationship
    assistantComment('betrayalDefeated', true);
}

// Pattern detection
function detectPlayerPatterns() {
    const memory = gameState.assistant.memory;

    // Check if player keeps choosing same apocalypse type
    const history = gameState.apocalypseHistory;
    if (history.length >= 3) {
        const lastThree = history.slice(-3);
        if (lastThree[0] === lastThree[1] && lastThree[1] === lastThree[2]) {
            if (Math.random() < 0.5) {
                assistantComment('repeatApocalypseType');
            }
        }
    }

    // Check playstyle focus
    if (memory.clicksVsIdle === 'clicker' && gameState.autoClickerLevel === 0) {
        if (Math.random() < 0.3) {
            assistantComment('clickerFocus');
        }
    } else if (memory.clicksVsIdle === 'idle' && gameState.totalClicks < 50) {
        if (Math.random() < 0.3) {
            assistantComment('idleFocus');
        }
    }
}

// Toggle assistant personality
function setAssistantPersonality(personality) {
    const validPersonalities = ['helpful', 'neutral', 'sarcastic', 'sadistic'];
    if (validPersonalities.includes(personality)) {
        gameState.assistant.personality = personality;
        saveGame();
    }
}

// Toggle assistant features
function toggleAssistant() {
    gameState.assistant.enabled = !gameState.assistant.enabled;
    updateAssistantUI();
    saveGame();
}

function toggleAssistantVoice() {
    gameState.assistant.voiceEnabled = !gameState.assistant.voiceEnabled;

    if (gameState.assistant.voiceEnabled) {
        // Load voices
        window.speechSynthesis.getVoices();
        // Test with a short phrase
        speakText("Voice enabled.");
    }

    updateAssistantUI();
    saveGame();
}

function setAssistantVoiceType(type) {
    const validTypes = ['british', 'robot', 'surfer', 'villain'];
    if (validTypes.includes(type)) {
        gameState.assistant.voiceType = type;
        saveGame();
    }
}

// Update assistant UI elements
function updateAssistantUI() {
    const toggleBtn = document.getElementById('toggle-assistant-btn');
    if (toggleBtn) {
        toggleBtn.textContent = gameState.assistant.enabled ? '🤖 Assistant: ON' : '🤖 Assistant: OFF';
        toggleBtn.classList.toggle('active', gameState.assistant.enabled);
    }

    const voiceBtn = document.getElementById('toggle-assistant-voice-btn');
    if (voiceBtn) {
        voiceBtn.textContent = gameState.assistant.voiceEnabled ? '🔊 Voice: ON' : '🔇 Voice: OFF';
        voiceBtn.classList.toggle('active', gameState.assistant.voiceEnabled);
    }

    const container = document.getElementById('assistant-container');
    if (container) {
        container.style.display = gameState.assistant.enabled ? 'block' : 'none';
    }
}

// Calculate offline progress
function calculateOfflineProgress(timeDiff) {
    if (timeDiff < 1000) return; // Less than 1 second, ignore

    const secondsOffline = timeDiff / 1000;
    const maxOfflineTime = 3600 * 4; // 4 hours max

    const effectiveTime = Math.min(secondsOffline, maxOfflineTime);

    // Calculate chaos earned while offline (at reduced rate)
    const offlineRate = gameState.chaosPerSecond * 0.5; // 50% efficiency
    const chaosEarned = offlineRate * effectiveTime;

    if (chaosEarned > 0) {
        gameState.chaosPoints += chaosEarned;
        gameState.totalChaosEarned += chaosEarned;

        const timeString = formatTime(effectiveTime * 1000);
        addLog(`Welcome back! You were offline for ${timeString}`);
        addLog(`Earned ${formatNumber(chaosEarned)} chaos points while away (50% efficiency)`);

        if (secondsOffline > maxOfflineTime) {
            addLog(`Offline progress capped at 4 hours`);
        }
    }
}

/* =============================================================================
   SECTION 4: UTILITIES
   ============================================================================= */

/** Performance monitoring for debugging */
const performanceMonitor = {
    enabled: false,
    frameCount: 0,
    lastFpsTime: 0,
    fps: 0,
    frameTimes: [],
    
    update() {
        if (!this.enabled) return;
        
        this.frameCount++;
        const now = performance.now();
        
        if (now - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = now;
            
            // Log performance issues
            if (this.fps < 30) {
                console.warn(`Low FPS detected: ${this.fps}`);
            }
        }
    },
    
    enable() {
        this.enabled = true;
        this.lastFpsTime = performance.now();
    },
    
    disable() {
        this.enabled = false;
    },
    
    getStats() {
        // Determine cache status for better readability
        let cacheStatus = 'none';
        if (calculationCache.lastChaosCalcTime > 0) {
            const cacheAge = Date.now() - calculationCache.lastChaosCalcTime;
            cacheStatus = cacheAge < 1000 ? 'cached' : 'recalculated';
        }
        
        return {
            fps: this.fps,
            cacheHitRate: cacheStatus
        };
    }
};

// Debounce utility for button clicks
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Core Game Functions
function formatNumber(num) {
    if (num >= 1e18) return (num / 1e18).toFixed(2) + 'Qi'; // Quintillion
    if (num >= 1e15) return (num / 1e15).toFixed(2) + 'Qa'; // Quadrillion
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    // Add commas for numbers under 1000
    return Math.floor(num).toLocaleString('en-US');
}

// Get color class based on number magnitude
function getNumberColor(num) {
    if (num >= 1e15) return 'color-qi'; // Quintillion+
    if (num >= 1e12) return 'color-qa'; // Quadrillion+
    if (num >= 1e9) return 'color-t';  // Trillion+
    if (num >= 1e6) return 'color-b';  // Billion+
    if (num >= 1e3) return 'color-m';  // Million+
    return 'color-k'; // Thousands and below
}

// Escape HTML to prevent injection when rendering user-controlled text
function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return seconds + 's';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ' + (seconds % 60) + 's';
    const hours = Math.floor(minutes / 60);
    return hours + 'h ' + (minutes % 60) + 'm';
}

function addLog(message) {
    const eventLog = document.getElementById('eventLog');
    const event = document.createElement('div');
    event.className = 'event-item';
    event.textContent = message;
    eventLog.insertBefore(event, eventLog.firstChild);

    // Keep only last 50 events
    while (eventLog.children.length > 50) {
        eventLog.removeChild(eventLog.lastChild);
    }
}

/* =============================================================================
   SECTION 5: CORE MECHANICS
   ============================================================================= */

/** Calculate current cost for a department based on owned count */
function getDepartmentCost(deptId) {
    const dept = DEPARTMENTS[deptId];
    const count = gameState.departments[deptId].count;
    let cost = Math.floor(dept.baseCost * Math.pow(dept.costMultiplier, count));

    // Apply mutation cost reduction
    if (gameState.mutations.zombiePlague?.unlocked) {
        cost = Math.floor(cost * MUTATIONS.zombiePlague.value);
    }

    // Apply apocalypse type effects - Meteor Strike cost increase
    if (gameState.activeApocalypseEffects?.departmentCostMult) {
        cost = Math.floor(cost * gameState.activeApocalypseEffects.departmentCostMult);
    }

    // Apply Economic Collapse permanent cost reduction
    if (gameState.persistentUnlocks?.economicCollapse) {
        cost = Math.floor(cost * 0.5); // 50% cheaper
    }

    // Apply specialization cost reduction
    const costReduction = getSpecializationBonus(deptId, 'costReduction');
    cost = Math.floor(cost * costReduction);

    // Apply synergy cost reduction
    const synergyReduction = getSynergyBonus('globalCostReduction');
    cost = Math.floor(cost * synergyReduction);

    return cost;
}

function getDepartmentProduction(deptId) {
    const dept = DEPARTMENTS[deptId];
    const count = gameState.departments[deptId].count;
    let production = dept.baseProduction * count;

    // Apply upgrade multipliers (from gameState, not mutating base values)
    if (gameState.upgradeMultipliers && gameState.upgradeMultipliers[deptId]) {
        production *= gameState.upgradeMultipliers[deptId];
    }

    // Apply mutation production multiplier
    if (gameState.mutations.aiTakeover?.unlocked) {
        production *= MUTATIONS.aiTakeover.value;
    }

    // Apply achievement production multiplier
    const achievementMults = getAchievementMultipliers();
    production *= achievementMults.production;

    // Apply specialization production bonus
    const specProdBonus = getSpecializationBonus(deptId, 'production');
    production *= specProdBonus;

    // Apply synergy global production bonus
    const synergyProdBonus = getSynergyBonus('globalProduction');
    production *= synergyProdBonus;

    // Apply scenario effects
    if (gameState.currentScenario) {
        gameState.currentScenario.effects.forEach(effect => {
            if (effect.type === deptId) {
                production *= effect.mult;
            }
        });
    }

    // Apply apocalypse type effects - Meteor Strike production boost
    if (gameState.activeApocalypseEffects?.productionMult) {
        production *= gameState.activeApocalypseEffects.productionMult;
    }

    // Apply department focus multiplier
    production *= getFocusMultiplier(deptId);

    return production;
}

// Optimized: Use for...in instead of forEach for better performance
function calculateChaosPerSecond() {
    let total = 0;
    
    // Sum department production
    for (const deptId in DEPARTMENTS) {
        total += getDepartmentProduction(deptId);
    }

    // Apply stock dividends (cached achievement multipliers)
    const achievementMults = getAchievementMultipliers();
    for (const stockId in STOCKS) {
        const stock = gameState.stocks[stockId];
        const stockData = STOCKS[stockId];
        const dividend = stockData.dividend * achievementMults.stock;
        total += stock.shares * stock.currentPrice * dividend / 100;
    }

    // Apply AI Assistant betrayal penalty
    if (gameState.assistant && gameState.assistant.betrayalArcActive) {
        total *= 0.9; // 10% production penalty during betrayal
    }

    return total;
}

function calculateBulkCost(deptId, amount) {
    const dept = DEPARTMENTS[deptId];
    const currentCount = gameState.departments[deptId].count;
    const baseCost = dept.baseCost;
    const mult = dept.costMultiplier;

    // Sum of geometric series: a * (1 - r^n) / (1 - r)
    const firstCost = baseCost * Math.pow(mult, currentCount);
    if (mult === 1) {
        return firstCost * amount;
    } else {
        return firstCost * (1 - Math.pow(mult, amount)) / (1 - mult);
    }
}

function buyDepartment(deptId) {
    const buyAmount = gameState.buyMode;
    let amount, totalCost;

    if (buyAmount === 'max') {
        const res = computeMaxAffordable(deptId, gameState.chaosPoints);
        amount = res.amount;
        totalCost = res.totalCost;
    } else {
        amount = Math.min(buyAmount, 1000);
        totalCost = calculateBulkCost(deptId, amount);
    }

    if (amount > 0 && gameState.chaosPoints >= totalCost) {
        gameState.chaosPoints -= totalCost;
        gameState.departments[deptId].count += amount;

        // Track for AI assistant
        if (gameState.assistant) {
            updateAssistantMemory('departmentPurchase', { deptId });
        }

        // Clear calculation cache since game state changed
        clearCalculationCache();

        needsRender.departments = true;
        needsRender.upgrades = true;
        checkAllAchievements();
        updateDisplay();
        addLog(`Hired ${amount}x ${DEPARTMENTS[deptId].name} for ${formatNumber(totalCost)} chaos`);

        if (gameState.soundEnabled) {
            playSound('purchase');
        }
    }
}

function buyUpgrade(upgradeId) {
    const upgrade = UPGRADES[upgradeId];
    if (gameState.chaosPoints >= upgrade.cost && !gameState.upgrades[upgradeId]) {
        gameState.chaosPoints -= upgrade.cost;
        
        // Clear calculation cache since upgrades affect production
        clearCalculationCache();
        gameState.upgrades[upgradeId] = true;
        upgrade.effect();
        needsRender.upgrades = true;
        needsRender.departments = true; // Upgrades may affect departments
        updateDisplay();
        addLog(`Purchased: ${upgrade.name}`);

        // Play purchase sound
        if (gameState.soundEnabled) {
            playSound('purchase');
        }
    }
}

/* -----------------------------------------------------------------------------
   Mutation & Specialization System
   ----------------------------------------------------------------------------- */

/** Unlock a mutation using apocalypse tokens */
function unlockMutation(mutationId) {
    const mutation = MUTATIONS[mutationId];
    if (gameState.apocalypseTokens >= mutation.cost && !gameState.mutations[mutationId]?.unlocked) {
        gameState.apocalypseTokens -= mutation.cost;
        if (!gameState.mutations[mutationId]) {
            gameState.mutations[mutationId] = {};
        }
        gameState.mutations[mutationId].unlocked = true;
        needsRender.mutations = true;
        checkAllAchievements();
        updateDisplay();
        addLog(`Unlocked mutation: ${mutation.name}`);
    }
}

// Specialization System
function selectSpecialization(deptId, specializationId) {
    const dept = DEPARTMENTS[deptId];
    const spec = SPECIALIZATIONS[specializationId];

    // Check if department has at least 1 owned
    if (!gameState.departments[deptId] || gameState.departments[deptId].count === 0) {
        addLog('You must own at least 1 of this department to specialize it!');
        return;
    }

    // Check if already specialized
    if (gameState.departmentSpecializations[deptId]) {
        addLog('This department is already specialized! Specializations are permanent.');
        return;
    }

    // Specialization cost: 10x the department's current cost
    const cost = getDepartmentCost(deptId) * 10;

    if (gameState.chaosPoints >= cost) {
        gameState.chaosPoints -= cost;
        gameState.departmentSpecializations[deptId] = specializationId;

        // Recalculate synergies
        calculateSynergyBonuses();

        needsRender.departments = true;
        updateDisplay();
        addLog(`Specialized ${dept.name} as ${spec.name}!`);

        // Play purchase sound
        if (gameState.soundEnabled) {
            playSound('purchase');
        }
    } else {
        addLog(`Not enough chaos! Need ${formatNumber(cost)} chaos points.`);
    }
}

function calculateSynergyBonuses() {
    // Count specializations by type
    const counts = { military: 0, economic: 0, scientific: 0 };

    Object.values(gameState.departmentSpecializations).forEach(specId => {
        if (counts[specId] !== undefined) {
            counts[specId]++;
        }
    });

    // Check which synergies are active
    gameState.activeSynergies = [];

    Object.keys(SYNERGIES).forEach(specId => {
        const synergy = SYNERGIES[specId];
        if (counts[specId] >= synergy.threshold) {
            gameState.activeSynergies.push(specId);
        }
    });

    return gameState.activeSynergies;
}

function getSpecializationBonus(deptId, bonusType) {
    const specId = gameState.departmentSpecializations[deptId];
    if (!specId) return 1; // No bonus

    const spec = SPECIALIZATIONS[specId];
    return spec.bonuses[bonusType] || 1;
}

function getSynergyBonus(bonusType) {
    let bonus = 1;

    gameState.activeSynergies.forEach(specId => {
        const synergy = SYNERGIES[specId];
        if (synergy.bonus[bonusType]) {
            bonus *= synergy.bonus[bonusType];
        }
    });

    return bonus;
}

function getUpgradeCost(baseUpgradeCost) {
    let cost = baseUpgradeCost;

    // Check if any department has scientific specialization
    let scientificDiscount = 1;
    Object.keys(gameState.departmentSpecializations).forEach(deptId => {
        const specId = gameState.departmentSpecializations[deptId];
        if (specId === 'scientific' && SPECIALIZATIONS[specId].bonuses.upgradeDiscount) {
            scientificDiscount = Math.min(scientificDiscount, SPECIALIZATIONS[specId].bonuses.upgradeDiscount);
        }
    });

    cost = Math.floor(cost * scientificDiscount);
    return cost;
}

/* -----------------------------------------------------------------------------
   Stock Market System
   ----------------------------------------------------------------------------- */

/** Purchase one share of a stock */
function buyStock(stockId) {
    const stock = gameState.stocks[stockId];
    if (gameState.chaosPoints >= stock.currentPrice) {
        gameState.chaosPoints -= stock.currentPrice;
        stock.shares++;
        checkAllAchievements();
        updateDisplay();
        addLog(`Bought 1 share of ${STOCKS[stockId].name} for ${formatNumber(stock.currentPrice)}`);
    }
}

function sellStock(stockId) {
    const stock = gameState.stocks[stockId];
    if (stock.shares > 0) {
        gameState.chaosPoints += stock.currentPrice;
        stock.shares--;
        updateDisplay();
        addLog(`Sold 1 share of ${STOCKS[stockId].name} for ${formatNumber(stock.currentPrice)}`);
    }
}

function updateStockPrices() {
    Object.keys(STOCKS).forEach(stockId => {
        const stockData = STOCKS[stockId];
        const stock = gameState.stocks[stockId];

        // Random price fluctuation
        const change = (Math.random() - 0.5) * 2 * stockData.volatility;
        const oldPrice = stock.currentPrice;
        const newPrice = stock.currentPrice * (1 + change);

        // Keep price between 10% and 300% of base price to prevent extreme edge cases
        const minPrice = stockData.basePrice * 0.1;
        const maxPrice = stockData.basePrice * 3;
        stock.currentPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));

        stock.priceChange = ((stock.currentPrice - oldPrice) / oldPrice) * 100;

        stock.priceHistory.push(stock.currentPrice);
        if (stock.priceHistory.length > 100) {
            stock.priceHistory.shift();
        }
    });
}

function selectScenario() {
    // Higher chance for standard scenario early on
    if (gameState.totalApocalypses === 0 || Math.random() < 0.4) {
        gameState.currentScenario = SCENARIOS[0];
    } else {
        gameState.currentScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    }

    addLog(`Scenario: ${gameState.currentScenario.name}`);
}

function calculateApocalypseReward() {
    let baseReward = Math.floor(Math.sqrt(gameState.chaosPoints / 10000));
    baseReward = Math.max(1, baseReward);

    // Apply mutation bonus
    if (gameState.mutations.timeLoop?.unlocked) {
        baseReward = Math.floor(baseReward * MUTATIONS.timeLoop.value);
    }

    // Apply achievement token multiplier
    const achievementMults = getAchievementMultipliers();
    baseReward = Math.floor(baseReward * achievementMults.token);

    // Apply synergy token bonus
    const synergyTokenBonus = getSynergyBonus('tokenMultiplier');
    baseReward = Math.floor(baseReward * synergyTokenBonus);

    return baseReward;
}

// Tutorial apocalypse for first-time players
function triggerTutorialApocalypse() {
    if (gameState.tutorialCompleted) return;

    // Show tutorial modal first
    showTutorialModal();
}

function completeTutorialApocalypse() {
    const runTime = Date.now() - gameState.runStartTime;
    const reward = calculateApocalypseReward(); // Use regular formula

    // Track best run
    if (!gameState.bestRunTime || runTime < gameState.bestRunTime) {
        gameState.bestRunTime = runTime;
    }

    // Show special tutorial apocalypse animation
    showTutorialApocalypseAnimation(reward, runTime);

    // Play apocalypse sound
    if (gameState.soundEnabled) {
        playSound('apocalypse');
    }

    // Award tokens
    gameState.apocalypseTokens += reward;
    gameState.totalApocalypses++;
    gameState.tutorialCompleted = true;

    addLog(`💀 YOUR FIRST APOCALYPSE! Gained ${reward} Apocalypse Tokens 💀`);

    // Reset run state (same as normal apocalypse)
    gameState.chaosPoints = 0;
    gameState.doomEnergy = 0;
    gameState.doomClockProgress = 0;
    gameState.chaosPerSecond = 0;
    gameState.doomPerClick = 1;

    // Reset departments
    Object.keys(gameState.departments).forEach(id => {
        gameState.departments[id].count = 0;
    });

    // Reset upgrades
    gameState.upgrades = {};

    // Reset upgrade multipliers
    Object.keys(gameState.upgradeMultipliers).forEach(deptId => {
        gameState.upgradeMultipliers[deptId] = 1;
    });

    // New scenario
    selectScenario();

    // Reset timer
    gameState.runStartTime = Date.now();

    // Reset stocks
    Object.keys(STOCKS).forEach(id => {
        gameState.stocks[id].currentPrice = STOCKS[id].basePrice;
        gameState.stocks[id].priceHistory = [STOCKS[id].basePrice];
    });

    // Check achievements
    checkAllAchievements();

    // Mark everything for re-render
    needsRender.departments = true;
    needsRender.upgrades = true;
    needsRender.stocks = true;
    needsRender.mutations = true;
    needsRender.achievements = true;

    // Save immediately
    localStorage.setItem('apocalypseCorpSave', JSON.stringify(gameState));

    updateDisplay();
}

/* -----------------------------------------------------------------------------
   Apocalypse Type Selection
   ----------------------------------------------------------------------------- */

// Get available apocalypse types
function getAvailableApocalypseTypes() {
    return Object.values(APOCALYPSE_TYPES).filter(type => {
        try {
            return type.unlockRequirement();
        } catch (e) {
            return false;
        }
    });
}

// Show apocalypse type selection screen
function showApocalypseSelection(reward, runTime) {
    const availableTypes = getAvailableApocalypseTypes();

    if (availableTypes.length === 0) {
        // Fallback to standard apocalypse if no types available
        executeApocalypse(reward, runTime, null);
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'apocalypse-selection-modal';

    const typesHTML = availableTypes.map(type => {
        const isFirstTime = !gameState.apocalypseTypesCompleted[type.id];
        const finalReward = Math.floor(reward * type.tokenMultiplier);

        return `
            <div class="apocalypse-type-card ${isFirstTime ? 'first-time' : ''}" data-type-id="${type.id}">
                <div class="apocalypse-type-header">
                    <span class="apocalypse-type-icon">${type.icon}</span>
                    <h3>${type.name}</h3>
                    ${isFirstTime ? '<span class="first-time-badge">NEW!</span>' : ''}
                </div>
                <p class="apocalypse-type-desc">${type.desc}</p>
                <div class="apocalypse-type-effects">
                    <strong>Effects:</strong>
                    <div class="effect-text">${type.flavorText}</div>
                </div>
                <div class="apocalypse-type-reward">
                    <strong>Tokens:</strong> 💀 ${finalReward}
                    ${type.tokenMultiplier !== 1.0 ? ` <span class="multiplier">(${type.tokenMultiplier}x)</span>` : ''}
                </div>
                ${isFirstTime && type.firstTimeBonus ? `
                    <div class="first-time-bonus">
                        <strong>🎁 First Time Bonus:</strong><br>
                        +${type.firstTimeBonus.tokens} tokens<br>
                        ${type.firstTimeBonus.message}
                    </div>
                ` : ''}
                <button class="select-apocalypse-btn" onclick="selectApocalypseType('${type.id}', ${reward}, ${runTime})">
                    ${type.icon} Choose This Apocalypse
                </button>
            </div>
        `;
    }).join('');

    modal.innerHTML = `
        <div class="apocalypse-selection-content">
            <h2>🌍 CHOOSE YOUR APOCALYPSE 🌍</h2>
            <p class="selection-subtitle">Each apocalypse type offers unique benefits and challenges</p>
            <div class="apocalypse-types-grid">
                ${typesHTML}
            </div>
            <button class="cancel-selection-btn" onclick="cancelApocalypseSelection()">Cancel</button>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

// Select apocalypse type
function selectApocalypseType(typeId, baseReward, runTime) {
    const type = APOCALYPSE_TYPES[typeId];
    if (!type) return;

    // Close selection modal
    cancelApocalypseSelection();

    // Calculate final reward
    let finalReward = Math.floor(baseReward * type.tokenMultiplier);

    // Add first-time bonus
    const isFirstTime = !gameState.apocalypseTypesCompleted[typeId];
    if (isFirstTime && type.firstTimeBonus) {
        finalReward += type.firstTimeBonus.tokens;
    }

    // Execute apocalypse with selected type
    executeApocalypse(finalReward, runTime, typeId);
}

// Cancel apocalypse selection
function cancelApocalypseSelection() {
    const modal = document.querySelector('.apocalypse-selection-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
    addLog('Apocalypse cancelled. Continue building chaos!');
}

// Apply apocalypse type effects
function applyApocalypseEffects(typeId) {
    if (!typeId) return;

    const type = APOCALYPSE_TYPES[typeId];
    if (!type) return;

    // Store active effects
    gameState.activeApocalypseEffects = { ...type.effects };

    // Apply persistent unlocks
    if (type.persistentUnlock) {
        gameState.persistentUnlocks[type.persistentUnlock] = true;
    }

    // Apply specific effects
    if (type.effects.upgradesDisabled) {
        gameState.upgradesDisabledUntil = Date.now() + type.effects.upgradesDisabledDuration;
    }

    // Mark as completed
    const isFirstTime = !gameState.apocalypseTypesCompleted[typeId];
    gameState.apocalypseTypesCompleted[typeId] = true;

    // Add to history
    gameState.apocalypseHistory.push({
        type: typeId,
        timestamp: Date.now()
    });
    gameState.lastApocalypseType = typeId;

    // Show first-time message
    if (isFirstTime && type.firstTimeBonus) {
        setTimeout(() => {
            showNotification('🎉 New Apocalypse Unlocked!', type.firstTimeBonus.message);
        }, 2000);
    }
}

/* -----------------------------------------------------------------------------
   Apocalypse (Prestige) System
   ----------------------------------------------------------------------------- */

/** Trigger apocalypse - main prestige action */
function triggerApocalypse() {
    // Check if this should be tutorial apocalypse
    if (!gameState.tutorialCompleted && gameState.chaosPoints >= 1000) {
        triggerTutorialApocalypse();
        return;
    }

    const runTime = Date.now() - gameState.runStartTime;
    const reward = calculateApocalypseReward();

    if (reward === 0) {
        addLog('Not enough chaos to trigger apocalypse!');
        return;
    }

    // Show apocalypse type selection screen
    showApocalypseSelection(reward, runTime);
}

function showApocalypseConfirmation(reward, runTime) {
    const modal = document.createElement('div');
    modal.className = 'apocalypse-confirmation-modal';
    modal.innerHTML = `
        <div class="apocalypse-confirmation-content">
            <h2>🔥 CONFIRM APOCALYPSE 🔥</h2>
            <div class="apocalypse-confirmation-text">
                <p><strong>Are you sure you want to end this run?</strong></p>

                <div class="apocalypse-confirmation-stats">
                    <div class="confirmation-stat">
                        <span class="confirmation-label">Run Duration:</span>
                        <span class="confirmation-value">${formatTime(runTime)}</span>
                    </div>
                    <div class="confirmation-stat highlight">
                        <span class="confirmation-label">Tokens You'll Gain:</span>
                        <span class="confirmation-value">💀 ${reward}</span>
                    </div>
                    <div class="confirmation-stat">
                        <span class="confirmation-label">Current Chaos:</span>
                        <span class="confirmation-value">${formatNumber(gameState.chaosPoints)}</span>
                    </div>
                </div>

                <p class="confirmation-warning">⚠️ This will reset all departments, upgrades, and chaos points!</p>
            </div>
            <div class="apocalypse-confirmation-buttons">
                <button class="apocalypse-confirm-btn" id="confirmApocalypseBtn">🔥 TRIGGER APOCALYPSE 🔥</button>
                <button class="apocalypse-cancel-btn" id="cancelApocalypseBtn">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Button handlers
    document.getElementById('confirmApocalypseBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        executeApocalypse(reward, runTime);
    });

    document.getElementById('cancelApocalypseBtn').addEventListener('click', () => {
        document.body.removeChild(modal);
        addLog('Apocalypse cancelled. Continue building chaos!');
    });

    // Animate in
    setTimeout(() => modal.classList.add('show'), 10);
}

function executeApocalypse(reward, runTime, typeId = null) {

    // Track best run
    if (!gameState.bestRunTime || runTime < gameState.bestRunTime) {
        gameState.bestRunTime = runTime;
    }

    // Track community stats for apocalypse
    gameState.lifetimeStats.totalApocalypsesAllTime++;
    gameState.sessionStats.sessionApocalypses++;
    
    // Update fastest apocalypse time
    if (!gameState.lifetimeStats.fastestApocalypseTime || runTime < gameState.lifetimeStats.fastestApocalypseTime) {
        gameState.lifetimeStats.fastestApocalypseTime = runTime;
        updateGlobalLeaderboard('fastestApocalypse', runTime);
    }
    
    // Update total apocalypses leaderboard
    updateGlobalLeaderboard('totalApocalypses', gameState.lifetimeStats.totalApocalypsesAllTime);
    
    // Finalize ghost run
    finalizeGhostRun();

    // Show apocalypse animation
    showApocalypseAnimation(reward, runTime);

    // Play apocalypse sound
    if (gameState.soundEnabled) {
        playSound('apocalypse');
    }

    // Check speedrun achievement
    if (runTime < 300000 && !gameState.achievements?.speedrun?.unlocked) { // 5 minutes
        gameState.achievements.speedrun = { unlocked: true, notified: false };
        showNotification('⚡ Speed Demon', 'Apocalypse triggered in under 5 minutes!');
    }

    // Award tokens
    gameState.apocalypseTokens += reward;
    gameState.totalApocalypses++;

    // Apply apocalypse type effects
    if (typeId) {
        applyApocalypseEffects(typeId);
        const typeName = APOCALYPSE_TYPES[typeId]?.name || 'Unknown';
        addLog(`💀 ${typeName} APOCALYPSE! Gained ${reward} Apocalypse Tokens 💀`);
    } else {
        addLog(`💀 THE WORLD HAS ENDED! Gained ${reward} Apocalypse Tokens 💀`);
    }

    // Store department counts for Time Loop effect
    const previousDepartments = {};
    Object.keys(gameState.departments).forEach(id => {
        previousDepartments[id] = gameState.departments[id].count;
    });

    // Calculate carryover chaos before reset
    const carryoverChaos = gameState.mutations.nuclearWinter?.unlocked ?
        gameState.chaosPerSecond * 0.1 : 0;

    // Apply speedrun achievement bonus
    let startingBonus = 0;
    if (gameState.achievements?.speedrun?.unlocked) {
        startingBonus = carryoverChaos * 10 * 0.1; // 10% extra
    }

    // Check for zombie plague effect - store production for post-apocalypse
    if (typeId === 'zombie' && APOCALYPSE_TYPES[typeId]?.effects.postApocalypseProduction) {
        gameState.zombieProductionEndTime = Date.now() + APOCALYPSE_TYPES[typeId].effects.duration;
        const zombieChaosPerSec = gameState.chaosPerSecond;
        addLog(`🧟 Zombie departments will generate ${formatNumber(zombieChaosPerSec)}/sec for 10 minutes!`);
    }

    // Reset run state
    gameState.chaosPoints = 0;
    gameState.doomEnergy = 0;
    gameState.doomClockProgress = 0;
    gameState.chaosPerSecond = 0;
    gameState.doomPerClick = 1;

    // Apply click power achievements
    if (gameState.achievements?.click100?.unlocked) {
        gameState.doomPerClick *= 1.1;
    }
    if (gameState.achievements?.click1000?.unlocked) {
        gameState.doomPerClick *= 1.25;
    }

    // Reset departments (or keep some for Time Loop)
    Object.keys(gameState.departments).forEach(id => {
        if (typeId === 'timeloop' && APOCALYPSE_TYPES[typeId]?.effects.keepDepartments) {
            const keepPercentage = APOCALYPSE_TYPES[typeId].effects.keepDepartments;
            gameState.departments[id].count = Math.floor(previousDepartments[id] * keepPercentage);
        } else {
            gameState.departments[id].count = 0;
        }
    });

    // Keep mutations but reset upgrades
    gameState.upgrades = {};

    // Reset upgrade multipliers
    Object.keys(gameState.upgradeMultipliers).forEach(deptId => {
        gameState.upgradeMultipliers[deptId] = 1;
    });

    // Give carryover chaos
    if (carryoverChaos > 0) {
        gameState.chaosPoints = (carryoverChaos * 10) + startingBonus; // Convert per-second to initial capital
        addLog(`Nuclear Winter carryover: ${formatNumber(gameState.chaosPoints)} chaos`);
    }

    // New scenario
    selectScenario();

    // Reset timer
    gameState.runStartTime = Date.now();

    // Reset stocks
    Object.keys(STOCKS).forEach(id => {
        gameState.stocks[id].currentPrice = STOCKS[id].basePrice;
        gameState.stocks[id].priceHistory = [STOCKS[id].basePrice];
    });

    // Check achievements after apocalypse
    checkAllAchievements();

    // Mark everything for re-render
    needsRender.departments = true;
    needsRender.upgrades = true;
    needsRender.stocks = true;
    needsRender.mutations = true;
    needsRender.achievements = true;

    updateDisplay();
}

// Screen shake effect
function screenShake(intensity = 1) {
    const body = document.body;
    const shakePx = Math.min(0.5 + intensity * 0.3, 1.5); // 0.8-1.5px based on intensity (much gentler)

    body.style.transform = `translate(${Math.random() * shakePx - shakePx/2}px, ${Math.random() * shakePx - shakePx/2}px)`;

    setTimeout(() => {
        body.style.transform = 'translate(0, 0)';
    }, 50); // Shorter duration for subtler effect
}

// Click ripple effect
function createRipple(x, y, container) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    container.appendChild(ripple);

    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 500);
}

// Milestone celebration effect
function celebrateMilestone(milestone) {
    const clockSection = document.querySelector('.doomsday-clock-section');
    const rect = clockSection.getBoundingClientRect();

    // Create confetti burst (gold particles)
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle confetti';

        const angle = (Math.PI * 2 * i) / 30;
        const velocity = 100 + Math.random() * 100;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.left = rect.width / 2 + 'px';
        particle.style.top = rect.height / 2 + 'px';
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        clockSection.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }

    // Screen flash
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.body.appendChild(flash);
    setTimeout(() => {
        if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    }, 300);

    // Show milestone message
    const milestoneText = {
        '1000': '🎉 1,000 CHAOS MILESTONE! 🎉',
        '10000': '🎊 10,000 CHAOS MILESTONE! 🎊',
        '100000': '🏆 100,000 CHAOS MILESTONE! 🏆'
    };

    showNotification('Milestone Reached!', milestoneText[milestone] || 'Milestone achieved!');

    // Intense screen shake
    screenShake(5);
}

/* -----------------------------------------------------------------------------
   Click Handler & Visual Effects
   ----------------------------------------------------------------------------- */

/** Main click handler for doom button */
function handleDoomClick(event) {
    const now = Date.now();

    // Update combo system
    const prevCombo = gameState.comboCount;
    if (now - gameState.lastClickTime < gameState.comboTimeWindow) {
        gameState.comboCount++;
        gameState.comboMultiplier = Math.min(1 + (gameState.comboCount * 0.1), 5); // Max 5x combo

        // Play combo sound at milestones
        if (gameState.soundEnabled && gameState.comboCount % 5 === 0 && gameState.comboCount !== prevCombo) {
            playSound('combo');
        }
    } else {
        gameState.comboCount = 1;
        gameState.comboMultiplier = 1;
    }
    gameState.lastClickTime = now;

    let clickPower = gameState.doomPerClick * gameState.comboMultiplier;

    // Apply achievement click multiplier
    const achievementMults = getAchievementMultipliers();
    clickPower *= achievementMults.click;

    // Check for critical hit
    let isCrit = false;
    if (gameState.critChance > 0 && Math.random() < gameState.critChance) {
        let critMultiplier = gameState.critMultiplier * achievementMults.crit;
        clickPower *= critMultiplier;
        isCrit = true;
        gameState.totalCrits++;

        // Play crit sound
        if (gameState.soundEnabled) {
            playSound('crit');
        }

        // Screen shake on crit
        screenShake(2);
    } else {
        // Regular screen shake
        screenShake(1);
    }

    // Track clicks for achievements
    gameState.totalClicks++;

    // Track clicks for AI assistant memory
    if (gameState.assistant) {
        updateAssistantMemory('click');
    }

    // Track click statistics for community features
    gameState.lifetimeStats.totalClicksAllTime++;
    gameState.sessionStats.sessionClicks++;

    // Track longest combo for leaderboards
    if (gameState.comboCount > gameState.lifetimeStats.longestCombo) {
        gameState.lifetimeStats.longestCombo = gameState.comboCount;
        updateGlobalLeaderboard('longestCombo', gameState.comboCount);
    }

    // Track clicks for challenge system
    trackChallengeClick();

    // Track player activity
    updatePlayerActivity();

    // Check for active doom project to click
    if (gameState.activeProject && event.shiftKey) {
        clickProject();
    }

    // Apply scenario effects
    if (gameState.currentScenario) {
        gameState.currentScenario.effects.forEach(effect => {
            if (effect.type === 'all_click') {
                clickPower *= effect.mult;
            }
        });
    }

    // Apply cosmic insight mutation
    if (gameState.mutations.cosmicInsight?.unlocked) {
        clickPower += gameState.chaosPerSecond * 0.05;
    }

    // Directly generate chaos points from clicking
    const oldChaos = gameState.totalChaosEarned;
    gameState.chaosPoints += clickPower;
    gameState.totalChaosEarned += clickPower;
    gameState.lifetimeStats.totalChaosAllTime += clickPower;
    gameState.sessionStats.sessionChaos += clickPower;
    gameState.doomEnergy += clickPower;
    gameState.doomClockProgress += clickPower;

    // Check for milestone celebrations
    if (!gameState.milestonesPassed.chaos1k && gameState.totalChaosEarned >= 1000 && oldChaos < 1000) {
        gameState.milestonesPassed.chaos1k = true;
        celebrateMilestone('1000');
    }
    if (!gameState.milestonesPassed.chaos10k && gameState.totalChaosEarned >= 10000 && oldChaos < 10000) {
        gameState.milestonesPassed.chaos10k = true;
        celebrateMilestone('10000');
    }
    if (!gameState.milestonesPassed.chaos100k && gameState.totalChaosEarned >= 100000 && oldChaos < 100000) {
        gameState.milestonesPassed.chaos100k = true;
        celebrateMilestone('100000');
    }

    // Doomsday clock mechanics
    const clockThreshold = 100 + (gameState.totalApocalypses * 50);
    if (gameState.doomClockProgress >= clockThreshold) {
        gameState.doomClockProgress = clockThreshold;
    }

    // Play click sound if enabled (skip if crit sound already played)
    if (gameState.soundEnabled && !isCrit) {
        playSound('click');
    }

    // Check achievements
    checkAllAchievements();

    // Create floating chaos point animation with combo and crit
    const comboText = gameState.comboCount > 1 ? ` x${gameState.comboCount}` : '';
    const critText = isCrit ? ' 💥CRIT!' : '';
    const textClass = isCrit ? 'floating-chaos crit' : 'floating-chaos';
    createFloatingText(`+${formatNumber(clickPower)}${comboText}${critText}`, event, textClass);

    // Add pulse effect to clock
    const clockFill = document.getElementById('clockFill');
    clockFill.classList.add('pulse');
    setTimeout(() => clockFill.classList.remove('pulse'), 300);

    // Button click feedback
    const button = event.target.closest('.doom-button');
    if (button) {
        button.classList.add('clicking');
        setTimeout(() => button.classList.remove('clicking'), 150);

        // Create ripple effect
        const rect = button.getBoundingClientRect();
        const x = event.clientX ? event.clientX - rect.left : rect.width / 2;
        const y = event.clientY ? event.clientY - rect.top : rect.height / 2;
        createRipple(x, y, button);
    }

    // Tutorial hint after first few clicks
    if (gameState.chaosPoints >= 10 && gameState.chaosPoints <= 12 &&
        Object.values(gameState.departments).every(d => d.count === 0)) {
        addLog('💡 You now have enough Chaos Points to hire your first department!');
    }

    updateDisplay();
}

// Create floating text animation with particles
function createFloatingText(text, event, className = 'floating-chaos') {
    const button = event.target.closest('.doom-button');
    if (!button) return;

    const floating = document.createElement('div');
    floating.className = className;
    floating.textContent = text;

    // Get button position relative to the clock section
    const clockSection = document.querySelector('.doomsday-clock-section');
    const rect = button.getBoundingClientRect();
    const sectionRect = clockSection.getBoundingClientRect();

    // Position at click location (or center of button)
    const x = event.clientX ? event.clientX - sectionRect.left : rect.width / 2;
    const y = event.clientY ? event.clientY - sectionRect.top : rect.height / 2;

    floating.style.left = x + 'px';
    floating.style.top = y + 'px';

    clockSection.appendChild(floating);

    // Create particles
    createParticles(x, y, clockSection);

    // Remove after animation
    setTimeout(() => {
        if (floating.parentNode) {
            floating.parentNode.removeChild(floating);
        }
    }, 1000);
}

// Create particle explosion effect with global limit
function createParticles(x, y, container) {
    const maxParticles = 15;

    // Check current particle count BEFORE any other operations
    const currentParticles = document.querySelectorAll('.particle').length;
    if (currentParticles >= maxParticles) {
        return; // Skip particle creation entirely
    }

    const particleCount = Math.min(8, maxParticles - currentParticles);

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;

        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        container.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 600);
    }
}

// Show apocalypse animation overlay
function showApocalypseAnimation(tokensGained, runTime) {
    const overlay = document.getElementById('apocalypseOverlay');
    const statsDiv = document.getElementById('apocalypseStats');

    const departmentCount = Object.values(gameState.departments).reduce((sum, d) => sum + d.count, 0);
    const upgradeCount = Object.keys(gameState.upgrades).length;

    statsDiv.innerHTML = `
        <h2>📊 Quarterly Chaos Report</h2>
        <div class="stat-line">
            <span class="stat-label">Run Duration:</span>
            <span class="stat-value">${formatTime(runTime)}</span>
        </div>
        <div class="stat-line">
            <span class="stat-label">Chaos Generated:</span>
            <span class="stat-value">${formatNumber(gameState.chaosPoints)}</span>
        </div>
        <div class="stat-line">
            <span class="stat-label">Departments Hired:</span>
            <span class="stat-value">${departmentCount}</span>
        </div>
        <div class="stat-line">
            <span class="stat-label">Upgrades Purchased:</span>
            <span class="stat-value">${upgradeCount}</span>
        </div>
        <div class="stat-line">
            <span class="stat-label">Total Apocalypses:</span>
            <span class="stat-value">${gameState.totalApocalypses + 1}</span>
        </div>
        <div class="stat-line" style="margin-top: 20px; border: 2px solid #ffd700;">
            <span class="stat-label">💀 Apocalypse Tokens Earned:</span>
            <span class="stat-value highlight">+${tokensGained}</span>
        </div>
    `;

    overlay.classList.add('active');

    // Auto-close after 4 seconds
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 4000);
}

/* =============================================================================
   SECTION 6: GAME SYSTEMS
   ============================================================================= */

/* -----------------------------------------------------------------------------
   Active Gameplay Mechanics (Events, Focus, Projects)
   ----------------------------------------------------------------------------- */

// Track player activity
function updatePlayerActivity() {
    gameState.lastActivityTime = Date.now();
}

// Random Events System
function getAvailableEvents() {
    return RANDOM_EVENTS.filter(event => {
        try {
            return event.requirement();
        } catch (e) {
            return false;
        }
    });
}

function triggerRandomEvent() {
    const availableEvents = getAvailableEvents();
    if (availableEvents.length === 0) return;

    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    gameState.activeEvent = event;
    showEventModal(event);
}

function showEventModal(event) {
    const modal = document.createElement('div');
    modal.className = 'event-modal';

    const choicesHTML = event.choices.map((choice, index) => `
        <button class="event-choice-btn" onclick="selectEventChoice(${index})">
            ${choice.text}
        </button>
    `).join('');

    modal.innerHTML = `
        <div class="event-modal-content">
            <h2>📰 ${event.name}</h2>
            <p class="event-desc">${event.desc}</p>
            <div class="event-choices">
                ${choicesHTML}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

function selectEventChoice(choiceIndex) {
    if (!gameState.activeEvent) return;

    const choice = gameState.activeEvent.choices[choiceIndex];
    const result = choice.effect();

    // Add to event history
    gameState.eventHistory.push({
        eventId: gameState.activeEvent.id,
        choice: choice.text,
        result: result,
        timestamp: Date.now()
    });

    // Show result
    addLog(`📰 Event: ${result}`);
    showNotification(gameState.activeEvent.name, result);

    // Close modal
    closeEventModal();
    gameState.activeEvent = null;

    // Schedule next event
    gameState.nextEventTime = Date.now() + (120000 + Math.random() * 180000); // 2-5 minutes
}

function closeEventModal() {
    const modal = document.querySelector('.event-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Department Focus System
function setDepartmentFocus(deptId) {
    const now = Date.now();

    if (now - gameState.lastFocusChange < gameState.focusCooldown) {
        const remaining = Math.ceil((gameState.focusCooldown - (now - gameState.lastFocusChange)) / 1000);
        addLog(`⏱️ Focus cooldown: ${remaining}s remaining`);
        return false;
    }

    gameState.focusedDepartment = deptId;
    gameState.lastFocusChange = now;

    addLog(`🎯 Focus set to: ${DEPARTMENTS[deptId].name}`);
    showNotification('Focus Changed', `Now focusing on ${DEPARTMENTS[deptId].name}`);

    needsRender.departments = true;
    return true;
}

function clearDepartmentFocus() {
    gameState.focusedDepartment = null;
    gameState.lastFocusChange = Date.now();
    addLog('🎯 Focus cleared');
}

function getFocusMultiplier(deptId) {
    if (!gameState.focusedDepartment) return 1;

    if (gameState.focusedDepartment === deptId) {
        return 3; // 3x production for focused department
    } else {
        return 0.5; // 0.5x for others
    }
}

// Doom Projects System
function getAvailableProjects() {
    return DOOM_PROJECTS.filter(project => {
        // Check if already completed
        if (gameState.completedProjects.includes(project.id)) return false;
        // Check if currently active
        if (gameState.activeProject?.id === project.id) return false;
        // Check requirement
        try {
            return project.requirement();
        } catch (e) {
            return false;
        }
    });
}

function startProject(projectId) {
    const project = DOOM_PROJECTS.find(p => p.id === projectId);
    if (!project) return;

    if (gameState.chaosPoints < project.cost) {
        addLog('❌ Not enough chaos for this project!');
        return;
    }

    gameState.chaosPoints -= project.cost;
    gameState.activeProject = {
        ...project,
        startTime: Date.now(),
        clickProgress: 0
    };
    gameState.projectProgress = 0;

    addLog(`🔧 Started project: ${project.name}`);
    showNotification('Project Started', project.name);
}

function clickProject() {
    if (!gameState.activeProject) return;

    gameState.activeProject.clickProgress++;
    gameState.projectProgress = (gameState.activeProject.clickProgress / gameState.activeProject.clicksRequired) * 100;

    if (gameState.activeProject.clickProgress >= gameState.activeProject.clicksRequired) {
        completeProject();
    }
}

function updateProjectIdleProgress() {
    if (!gameState.activeProject) return;

    const elapsed = Date.now() - gameState.activeProject.startTime;
    const idleProgress = (elapsed / gameState.activeProject.idleTime) * 100;
    const clickProgress = (gameState.activeProject.clickProgress / gameState.activeProject.clicksRequired) * 100;

    gameState.projectProgress = Math.max(idleProgress, clickProgress);

    if (gameState.projectProgress >= 100) {
        completeProject();
    }
}

function completeProject() {
    if (!gameState.activeProject) return;

    const project = gameState.activeProject;

    // Apply reward
    switch (project.reward.type) {
        case 'multiplier':
            if (project.reward.target === 'all_production') {
                Object.keys(gameState.upgradeMultipliers).forEach(key => {
                    gameState.upgradeMultipliers[key] *= project.reward.value;
                });
            } else if (project.reward.target === 'click_power') {
                gameState.doomPerClick *= project.reward.value;
            }
            break;
        case 'unlock':
            gameState.persistentUnlocks[project.reward.value] = true;
            break;
        case 'ability':
            gameState.persistentUnlocks[project.reward.value] = true;
            break;
    }

    gameState.completedProjects.push(project.id);
    addLog(`✅ ${project.name} completed!`);
    showNotification('🎉 Project Complete!', project.reward.message);

    if (gameState.soundEnabled) {
        playSound('achievement');
    }

    gameState.activeProject = null;
    gameState.projectProgress = 0;
}

// Crisis Management Minigame
function triggerCrisis() {
    const crisisTypes = [
        {
            name: '🚨 Resource Allocation Crisis',
            desc: 'Distribute resources quickly!',
            decisions: [
                { question: 'Allocate to Production?', correct: true },
                { question: 'Invest in Marketing?', correct: false },
                { question: 'Upgrade Infrastructure?', correct: true }
            ]
        },
        {
            name: '⚡ Emergency Response',
            desc: 'Make critical decisions fast!',
            decisions: [
                { question: 'Evacuate personnel?', correct: false },
                { question: 'Contain the chaos?', correct: true },
                { question: 'Call for backup?', correct: true }
            ]
        }
    ];

    const crisis = crisisTypes[Math.floor(Math.random() * crisisTypes.length)];

    gameState.activeCrisis = {
        ...crisis,
        currentDecision: 0,
        correctCount: 0,
        incorrectCount: 0
    };
    gameState.crisisStartTime = Date.now();
    gameState.crisisDecisionsMade = 0;

    showCrisisModal();
}

function showCrisisModal() {
    if (!gameState.activeCrisis) return;

    const crisis = gameState.activeCrisis;
    const timeLeft = Math.max(0, 30 - (Date.now() - gameState.crisisStartTime) / 1000);

    const modal = document.createElement('div');
    modal.className = 'crisis-modal';
    modal.id = 'crisisModal';

    const currentQ = crisis.decisions[crisis.currentDecision];

    modal.innerHTML = `
        <div class="crisis-modal-content">
            <h2>${crisis.name}</h2>
            <p class="crisis-desc">${crisis.desc}</p>
            <div class="crisis-timer">⏱️ ${Math.ceil(timeLeft)}s</div>
            <div class="crisis-progress">Decision ${crisis.currentDecision + 1} / ${crisis.decisions.length}</div>
            <div class="crisis-question">
                <h3>${currentQ.question}</h3>
                <div class="crisis-buttons">
                    <button class="crisis-btn crisis-yes" onclick="makeCrisisDecision(true)">✅ YES</button>
                    <button class="crisis-btn crisis-no" onclick="makeCrisisDecision(false)">❌ NO</button>
                </div>
            </div>
        </div>
    `;

    // Remove old modal if exists
    const oldModal = document.getElementById('crisisModal');
    if (oldModal) oldModal.remove();

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

function makeCrisisDecision(answer) {
    if (!gameState.activeCrisis) return;

    const crisis = gameState.activeCrisis;
    const currentQ = crisis.decisions[crisis.currentDecision];
    const timeLeft = 30 - (Date.now() - gameState.crisisStartTime) / 1000;

    // Check if time ran out
    if (timeLeft <= 0) {
        failCrisis();
        return;
    }

    // Check answer
    if (answer === currentQ.correct) {
        crisis.correctCount++;
    } else {
        crisis.incorrectCount++;
    }

    crisis.currentDecision++;
    gameState.crisisDecisionsMade++;

    // Check if all decisions made
    if (crisis.currentDecision >= crisis.decisions.length) {
        completeCrisis();
    } else {
        showCrisisModal();
    }
}

function completeCrisis() {
    if (!gameState.activeCrisis) return;

    const crisis = gameState.activeCrisis;
    const successRate = crisis.correctCount / crisis.decisions.length;

    // Close modal
    const modal = document.getElementById('crisisModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }

    if (successRate >= 0.66) {
        // Success
        const bonus = Math.floor(gameState.chaosPerSecond * 120); // 2 minutes worth
        gameState.chaosPoints += bonus;
        addLog(`✅ Crisis managed! Earned ${formatNumber(bonus)} chaos bonus!`);
        showNotification('Crisis Averted!', `Earned ${formatNumber(bonus)} chaos!`);
    } else {
        // Failure
        Object.keys(gameState.upgradeMultipliers).forEach(key => {
            gameState.upgradeMultipliers[key] *= 0.9;
        });
        addLog('❌ Crisis mishandled. Production -10% for 2 minutes.');
        showNotification('Crisis Failed', 'Production temporarily reduced');

        // Restore after 2 minutes
        setTimeout(() => {
            Object.keys(gameState.upgradeMultipliers).forEach(key => {
                gameState.upgradeMultipliers[key] /= 0.9;
            });
            addLog('Production penalty expired');
        }, 120000);
    }

    gameState.activeCrisis = null;
    gameState.lastCrisisTime = Date.now();
}

function failCrisis() {
    const modal = document.getElementById('crisisModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }

    addLog('❌ Crisis failed - time ran out!');
    showNotification('Time\'s Up!', 'Crisis management failed');

    gameState.activeCrisis = null;
    gameState.lastCrisisTime = Date.now();
}

/* -----------------------------------------------------------------------------
   Challenge System (Timed Mini-Goals)
   ----------------------------------------------------------------------------- */

/** Get available challenges based on requirements */
function getAvailableChallenges() {
    return CHALLENGES.filter(challenge => {
        try {
            return challenge.requirement();
        } catch (e) {
            return false;
        }
    });
}

// Select random challenge from available pool
function selectRandomChallenge() {
    const available = getAvailableChallenges();
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}

// Show challenge notification modal
function showChallengeNotification(challenge) {
    const modal = document.createElement('div');
    modal.className = 'challenge-modal';
    modal.innerHTML = `
        <div class="challenge-modal-content">
            <h2>🎯 NEW CHALLENGE AVAILABLE!</h2>
            <div class="challenge-info">
                <h3>${challenge.name}</h3>
                <p>${challenge.desc}</p>
                <div class="challenge-rewards">
                    <strong>Rewards:</strong>
                    <div>💰 ${formatNumber(challenge.reward.chaos)} Chaos Points</div>
                    ${challenge.reward.multiplier ?
                        `<div>⚡ ${challenge.reward.multiplier.value}x production for ${challenge.reward.multiplier.duration}s</div>` : ''}
                </div>
            </div>
            <div class="challenge-buttons">
                <button class="challenge-accept" onclick="acceptChallenge('${challenge.id}')">✅ Accept</button>
                <button class="challenge-decline" onclick="declineChallenge()">❌ Decline</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

// Accept challenge
function acceptChallenge(challengeId) {
    const challenge = CHALLENGES.find(c => c.id === challengeId);
    if (!challenge) return;

    gameState.activeChallenge = {
        ...challenge,
        startChaos: gameState.chaosPoints,
        startClicks: gameState.totalClicks,
        comboStartTime: 0,
        clicksInChallenge: 0
    };
    gameState.challengeStartTime = Date.now();
    gameState.challengeProgress = 0;

    closeChallengeModal();
    addLog(`🎯 Challenge accepted: ${challenge.name}`);
    updateChallengeDisplay();
}

// Decline challenge
function declineChallenge() {
    closeChallengeModal();
    // Schedule next challenge in 3-5 minutes
    gameState.nextChallengeTime = Date.now() + (180000 + Math.random() * 120000);
    gameState.challengeNotificationShown = false;
}

// Close challenge modal
function closeChallengeModal() {
    const modal = document.querySelector('.challenge-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
}

// Update challenge progress
function updateChallengeProgress() {
    if (!gameState.activeChallenge) return;

    const challenge = gameState.activeChallenge;
    const now = Date.now();
    const elapsed = (now - gameState.challengeStartTime) / 1000;

    let progress = 0;
    let completed = false;
    let failed = false;

    switch (challenge.type) {
        case 'speed':
            const chaosGenerated = gameState.chaosPoints - challenge.startChaos;
            progress = (chaosGenerated / challenge.goal) * 100;
            completed = chaosGenerated >= challenge.goal;
            failed = elapsed >= challenge.timeLimit && !completed;
            break;

        case 'efficiency':
            const deptCount = gameState.departments[challenge.restrictedDept]?.count || 0;
            if (deptCount > 0) {
                failed = true;
            } else {
                progress = (gameState.chaosPerSecond / challenge.goal) * 100;
                completed = gameState.chaosPerSecond >= challenge.goal;
            }
            break;

        case 'clicking':
            progress = (challenge.clicksInChallenge / challenge.goal) * 100;
            completed = challenge.clicksInChallenge >= challenge.goal;
            failed = elapsed >= challenge.timeLimit && !completed;
            break;

        case 'combo':
            if (gameState.comboCount >= challenge.goal) {
                if (challenge.comboStartTime === 0) {
                    challenge.comboStartTime = now;
                }
                const comboHoldTime = (now - challenge.comboStartTime) / 1000;
                progress = (comboHoldTime / challenge.duration) * 100;
                completed = comboHoldTime >= challenge.duration;
            } else {
                challenge.comboStartTime = 0;
                progress = 0;
            }
            // Combo challenges don't fail, they just reset progress
            break;
    }

    gameState.challengeProgress = Math.min(100, progress);

    if (completed) {
        completeChallenge();
    } else if (failed) {
        failChallenge();
    }
}

// Complete challenge
function completeChallenge() {
    if (!gameState.activeChallenge) return;

    const challenge = gameState.activeChallenge;
    const reward = challenge.reward;

    // Award chaos
    gameState.chaosPoints += reward.chaos;
    gameState.totalChaosEarned += reward.chaos;

    // Award temporary multiplier
    if (reward.multiplier) {
        applyTemporaryMultiplier(reward.multiplier.value, reward.multiplier.duration);
    }

    gameState.challengesCompleted++;

    addLog(`✅ Challenge completed: ${challenge.name}! Earned ${formatNumber(reward.chaos)} chaos!`);
    showNotification('🎉 Challenge Complete!', `You earned ${formatNumber(reward.chaos)} chaos points!`);

    if (gameState.soundEnabled) {
        playSound('achievement');
    }

    // Clear challenge
    gameState.activeChallenge = null;
    gameState.challengeProgress = 0;

    // Schedule next challenge
    gameState.nextChallengeTime = Date.now() + (180000 + Math.random() * 120000);
    gameState.challengeNotificationShown = false;

    updateChallengeDisplay();
}

// Fail challenge
function failChallenge() {
    if (!gameState.activeChallenge) return;

    const challenge = gameState.activeChallenge;
    addLog(`❌ Challenge failed: ${challenge.name}`);

    gameState.activeChallenge = null;
    gameState.challengeProgress = 0;

    // Schedule next challenge
    gameState.nextChallengeTime = Date.now() + (180000 + Math.random() * 120000);
    gameState.challengeNotificationShown = false;

    updateChallengeDisplay();
}

// Apply temporary multiplier
function applyTemporaryMultiplier(multiplier, duration) {
    const originalMultipliers = {};

    // Store original multipliers
    Object.keys(gameState.upgradeMultipliers).forEach(deptId => {
        originalMultipliers[deptId] = gameState.upgradeMultipliers[deptId];
        gameState.upgradeMultipliers[deptId] *= multiplier;
    });

    addLog(`⚡ ${multiplier}x production boost active for ${duration}s!`);

    // Reset after duration
    setTimeout(() => {
        Object.keys(originalMultipliers).forEach(deptId => {
            gameState.upgradeMultipliers[deptId] = originalMultipliers[deptId];
        });
        addLog(`⚡ Production boost expired`);
    }, duration * 1000);
}

// Update challenge display
function updateChallengeDisplay() {
    const container = document.getElementById('challengeContainer');
    if (!container) return;

    if (!gameState.activeChallenge) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    const challenge = gameState.activeChallenge;
    const now = Date.now();
    const elapsed = (now - gameState.challengeStartTime) / 1000;

    document.getElementById('challengeName').textContent = challenge.name;
    document.getElementById('challengeDesc').textContent = challenge.desc;

    // Update progress bar
    const progressBar = document.getElementById('challengeProgressBar');
    progressBar.style.width = gameState.challengeProgress + '%';

    // Update progress text based on type
    let progressText = '';
    switch (challenge.type) {
        case 'speed':
            const chaosGenerated = Math.floor(gameState.chaosPoints - challenge.startChaos);
            progressText = `${formatNumber(chaosGenerated)} / ${formatNumber(challenge.goal)} chaos`;
            break;
        case 'efficiency':
            progressText = `${formatNumber(gameState.chaosPerSecond)} / ${formatNumber(challenge.goal)} chaos/sec`;
            break;
        case 'clicking':
            progressText = `${challenge.clicksInChallenge} / ${challenge.goal} clicks`;
            break;
        case 'combo':
            const comboTime = challenge.comboStartTime > 0 ?
                ((now - challenge.comboStartTime) / 1000).toFixed(1) : 0;
            progressText = `${comboTime}s / ${challenge.duration}s at ${challenge.goal}x combo`;
            break;
    }
    document.getElementById('challengeProgressText').textContent = progressText;

    // Update timer for timed challenges
    const timerEl = document.getElementById('challengeTimer');
    if (challenge.timeLimit) {
        const remaining = Math.max(0, challenge.timeLimit - elapsed);
        timerEl.textContent = `⏱️ ${Math.ceil(remaining)}s`;
        timerEl.style.display = 'block';
    } else {
        timerEl.style.display = 'none';
    }
}

// Track clicks for clicking challenges
function trackChallengeClick() {
    if (gameState.activeChallenge && gameState.activeChallenge.type === 'clicking') {
        gameState.activeChallenge.clicksInChallenge++;
    }
}

// Update project display
function updateProjectDisplay() {
    const container = document.getElementById('projectContainer');
    if (!container) return;

    if (!gameState.activeProject) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';

    document.getElementById('projectName').textContent = gameState.activeProject.name;
    document.getElementById('projectDesc').textContent = gameState.activeProject.desc;

    const progressBar = document.getElementById('projectProgressBar');
    progressBar.style.width = gameState.projectProgress + '%';

    document.getElementById('projectProgressText').textContent = `${Math.floor(gameState.projectProgress)}%`;
}

// Update focus display
function updateFocusDisplay() {
    const statusEl = document.getElementById('focusStatus');
    const cooldownEl = document.getElementById('focusCooldown');

    if (!statusEl) return;

    if (gameState.focusedDepartment) {
        const deptName = DEPARTMENTS[gameState.focusedDepartment]?.name || 'Unknown';
        statusEl.textContent = `🎯 Focused: ${deptName}`;
        statusEl.style.color = '#4caf50';
    } else {
        statusEl.textContent = 'No focus active';
        statusEl.style.color = '#6495ed';
    }

    // Show cooldown if applicable
    const now = Date.now();
    const timeSinceChange = now - gameState.lastFocusChange;
    if (timeSinceChange < gameState.focusCooldown) {
        const remaining = Math.ceil((gameState.focusCooldown - timeSinceChange) / 1000);
        cooldownEl.textContent = `⏱️ Cooldown: ${remaining}s`;
        cooldownEl.style.display = 'block';
    } else {
        cooldownEl.style.display = 'none';
    }
}

/* -----------------------------------------------------------------------------
   Game Loop (Fixed Timestep with requestAnimationFrame)
   ----------------------------------------------------------------------------- */

let lastFrameTime = 0;
let accumulatedTime = 0;
const TICK_RATE = 100; // 100ms = 10 ticks per second

/** Main game loop - runs every animation frame */
function gameTick(timestamp = Date.now()) {
    // Calculate delta time
    const deltaMs = timestamp - lastFrameTime;
    lastFrameTime = timestamp;
    
    // Accumulate time for fixed timestep
    accumulatedTime += deltaMs;
    
    // Get current time for all logic
    const now = Date.now();
    
    // If paused, skip simulation but keep UI responsive
    if (gameState.paused) {
        performanceMonitor.update();
        updateDisplay();
        requestAnimationFrame(gameTick);
        return;
    }

    // Process game logic at fixed intervals
    while (accumulatedTime >= TICK_RATE) {
        const delta = TICK_RATE / 1000;
        gameState.lastTick = now;

        // Auto-clicker
        if (gameState.autoClickerLevel > 0 && gameState.autoClickerRate > 0) {
            if (now - gameState.lastAutoClick >= gameState.autoClickerRate) {
                gameState.lastAutoClick = now;
                const autoClickPower = gameState.doomPerClick;
                gameState.chaosPoints += autoClickPower;
                gameState.totalChaosEarned += autoClickPower;
                gameState.doomEnergy += autoClickPower;
                gameState.doomClockProgress += autoClickPower;
            }
        }

        // Generate chaos from doom energy (passive bonus)
        const chaosGained = gameState.doomEnergy * 0.01 * delta;
        gameState.chaosPoints += chaosGained;
        gameState.totalChaosEarned += chaosGained;

        // Generate chaos from departments (main passive income)
        // Cache chaos per second calculation
        if (now - calculationCache.lastChaosCalcTime > 1000) {
            gameState.chaosPerSecond = calculateChaosPerSecond();
            calculationCache.chaosPerSecond = gameState.chaosPerSecond;
            calculationCache.lastChaosCalcTime = now;
        } else {
            gameState.chaosPerSecond = calculationCache.chaosPerSecond;
        }
        
        const passiveChaos = gameState.chaosPerSecond * delta;
        gameState.chaosPoints += passiveChaos;
        gameState.totalChaosEarned += passiveChaos;
        gameState.lifetimeStats.totalChaosAllTime += passiveChaos;
        gameState.sessionStats.sessionChaos += passiveChaos;

    // Track highest chaos/sec for leaderboards
    if (gameState.chaosPerSecond > gameState.lifetimeStats.highestChaosPerSec) {
        gameState.lifetimeStats.highestChaosPerSec = gameState.chaosPerSecond;
        updateGlobalLeaderboard('highestChaosPerSec', gameState.chaosPerSecond);
    }

    // Record ghost run snapshots
    recordGhostSnapshot();

    // Update weekly challenge progress
    updateWeeklyChallengeProgress();

        // Periodically check achievements (every second)
        if (Math.floor(now / 1000) !== Math.floor((now - TICK_RATE) / 1000)) {
            checkAllAchievements();
        }
        
        accumulatedTime -= TICK_RATE;
    }

    // Tutorial hint at 500 chaos
    if (!gameState.tutorialCompleted && !gameState.tutorialHintShown && gameState.chaosPoints >= 500) {
        gameState.tutorialHintShown = true;
        showNotification('Almost there!', 'Reach 1,000 chaos for your first apocalypse and unlock the true game!');
        addLog('Almost there! Reach 1,000 chaos for your first apocalypse!');
    }

    // Challenge system
    // Check if it's time to offer a new challenge
    if (!gameState.activeChallenge && !gameState.challengeNotificationShown) {
        if (gameState.nextChallengeTime === 0) {
            // Initialize first challenge time (3-5 minutes after game start)
            gameState.nextChallengeTime = now + (180000 + Math.random() * 120000);
        } else if (now >= gameState.nextChallengeTime) {
            const challenge = selectRandomChallenge();
            if (challenge) {
                showChallengeNotification(challenge);
                gameState.challengeNotificationShown = true;
            } else {
                // No available challenges, try again later
                gameState.nextChallengeTime = now + 60000; // Try again in 1 minute
            }
        }
    }

        // Update active challenge progress
        if (gameState.activeChallenge) {
            updateChallengeProgress();
            updateChallengeDisplay();
        }

        // Active Gameplay Mechanics
        // Check for player activity and trigger random events
        const timeSinceActivity = now - gameState.lastActivityTime;
        const isActive = timeSinceActivity < 5000; // Consider active if interaction within 5 seconds

        if (isActive && !gameState.activeEvent && !gameState.activeCrisis) {
            if (gameState.nextEventTime === 0) {
                // Initialize first event time (2-5 minutes)
                gameState.nextEventTime = now + (120000 + Math.random() * 180000);
            } else if (now >= gameState.nextEventTime) {
                triggerRandomEvent();
            }
        }

        // Update Doom Project idle progress
        if (gameState.activeProject) {
            updateProjectIdleProgress();
        }

        // Trigger crisis when departments reach milestones
        if (!gameState.activeCrisis && now - gameState.lastCrisisTime > 600000) { // At least 10 min between crises
            const totalDepartments = Object.values(gameState.departments).reduce((sum, dept) => sum + dept.count, 0);
            if (totalDepartments >= 50 && Math.random() < 0.01) { // 1% chance per tick when 50+ departments
                triggerCrisis();
            }
        }

        // Update crisis timer
        if (gameState.activeCrisis) {
            const elapsed = (now - gameState.crisisStartTime) / 1000;
            if (elapsed >= 30) {
                failCrisis();
            }
        }

        // AI Assistant checks
        if (gameState.assistant && gameState.assistant.enabled) {
            checkAssistantMilestones();

            // Periodic hints and comments (every 30 seconds)
            if (Math.floor(now / 30000) !== Math.floor((now - TICK_RATE) / 30000)) {
                provideStrategicHint();
                detectPlayerPatterns();
            }

            // Random comments (every 60 seconds)
            if (Math.floor(now / 60000) !== Math.floor((now - TICK_RATE) / 60000)) {
                randomAssistantComment();
            }
        }
        
        // Update stocks periodically
        updateStocksIfNeeded();

    // Update performance monitor
    performanceMonitor.update();
    
    // Update display (throttled to avoid excessive repaints)
    updateDisplay();
    
    // Schedule next frame
    requestAnimationFrame(gameTick);
}

// Compute max affordable purchases for a department using geometric series
function computeMaxAffordable(deptId, availableChaos) {
    const dept = DEPARTMENTS[deptId];
    const currentCount = gameState.departments[deptId].count;
    const r = dept.costMultiplier;
    const base = dept.baseCost;

    // Effective first-cost factor (all global multiplicative cost modifiers)
    // Derive by comparing current single-unit cost to base * r^currentCount
    const singleCost = getDepartmentCost(deptId);
    const firstBase = base * Math.pow(r, currentCount);
    const factor = firstBase > 0 ? (singleCost / firstBase) : 1;

    const firstCost = firstBase * factor;
    if (availableChaos < firstCost) return { amount: 0, totalCost: 0 };

    if (r === 1) {
        const amount = Math.floor(availableChaos / firstCost);
        const totalCost = amount * firstCost;
        return { amount, totalCost };
    }

    // Solve sum = firstCost * (r^n - 1) / (r - 1) <= availableChaos
    const maxN = Math.floor(Math.log(1 + ((r - 1) * availableChaos) / firstCost) / Math.log(r));
    const n = Math.max(0, maxN);
    const totalCost = firstCost * (Math.pow(r, n) - 1) / (r - 1);
    return { amount: n, totalCost: Math.floor(totalCost) };
}

/* =============================================================================
   SECTION 8: RENDERING & UI
   ============================================================================= */

// Update stock prices periodically
let lastStockUpdate = 0;
function updateStocksIfNeeded() {
    const now = Date.now();
    if (now - lastStockUpdate >= 5000) {
        updateStockPrices();
        lastStockUpdate = now;
        needsRender.stocks = true;
    }
}

// Track when we need to re-render lists
let needsRender = {
    departments: true,
    upgrades: true,
    stocks: true,
    mutations: true,
    achievements: true
};

// Cache DOM elements for better performance
const domCache = {
    // Resources
    doomEnergy: null,
    chaosPoints: null,
    chaosPerSec: null,
    apocalypseTokens: null,
    doomPerClick: null,
    comboIndicator: null,
    // Clock
    clockFill: null,
    clockTime: null,
    clockDisplay: null,
    apocalypseProgress: null,
    apocalypseProgressText: null,
    apocalypseButton: null,
    apocalypseSection: null,
    apocalypseReward: null,
    // Stats
    totalApocalypses: null,
    runTime: null,
    bestRun: null,
    // Scenario
    scenarioName: null,
    scenarioDesc: null,
    scenarioEffects: null
};

// Initialize DOM cache
function initDOMCache() {
    domCache.doomEnergy = document.getElementById('doomEnergy');
    domCache.chaosPoints = document.getElementById('chaosPoints');
    domCache.chaosPerSec = document.getElementById('chaosPerSec');
    domCache.apocalypseTokens = document.getElementById('apocalypseTokens');
    domCache.doomPerClick = document.getElementById('doomPerClick');
    domCache.comboIndicator = document.getElementById('comboIndicator');
    domCache.clockFill = document.getElementById('clockFill');
    domCache.clockTime = document.getElementById('clockTime');
    domCache.clockDisplay = document.querySelector('.clock-display');
    domCache.apocalypseProgress = document.getElementById('apocalypseProgress');
    domCache.apocalypseProgressText = document.getElementById('apocalypseProgressText');
    domCache.apocalypseButton = document.getElementById('apocalypseButton');
    domCache.apocalypseSection = document.getElementById('apocalypseSection');
    domCache.apocalypseReward = document.getElementById('apocalypseReward');
    domCache.totalApocalypses = document.getElementById('totalApocalypses');
    domCache.runTime = document.getElementById('runTime');
    domCache.bestRun = document.getElementById('bestRun');
    domCache.scenarioName = document.getElementById('scenarioName');
    domCache.scenarioDesc = document.getElementById('scenarioDesc');
    domCache.scenarioEffects = document.getElementById('scenarioEffects');
}

// Apply current theme to document and button label
function applyTheme() {
    const body = document.body;
    if (!body) return;
    
    // Remove all theme classes
    body.classList.remove('classic-theme', 'light-theme');
    
    // Add appropriate theme class
    if (gameState.theme === 'classic') {
        body.classList.add('classic-theme');
    } else if (gameState.theme === 'light') {
        body.classList.add('light-theme');
    }
    // 'soft' theme has no class (default styles)
    
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        const themeName = gameState.theme.charAt(0).toUpperCase() + gameState.theme.slice(1);
        themeBtn.textContent = `Theme: ${themeName}`;
    }
}

// Cache for expensive calculations
let calculationCache = {
    chaosPerSecond: 0,
    lastChaosCalcTime: 0,
    apocalypseReward: 0,
    lastRewardCalcTime: 0,
    departmentCosts: {},
    lastCostCalcTime: 0
};

// Clear calculation cache when game state changes significantly
function clearCalculationCache() {
    calculationCache.lastChaosCalcTime = 0;
    calculationCache.lastRewardCalcTime = 0;
    calculationCache.lastCostCalcTime = 0;
    calculationCache.departmentCosts = {};
}

// UI Update (optimized with DOM caching)
function updateDisplay() {
    // Use cached DOM elements for better performance
    if (!domCache.doomEnergy) initDOMCache();
    
    // Resources with color coding
    domCache.doomEnergy.textContent = formatNumber(gameState.doomEnergy);
    domCache.doomEnergy.className = 'resource-value ' + getNumberColor(gameState.doomEnergy);

    domCache.chaosPoints.textContent = formatNumber(gameState.chaosPoints);
    domCache.chaosPoints.className = 'resource-value ' + getNumberColor(gameState.chaosPoints);

    domCache.chaosPerSec.textContent = formatNumber(gameState.chaosPerSecond);
    domCache.chaosPerSec.className = 'resource-value ' + getNumberColor(gameState.chaosPerSecond);

    domCache.apocalypseTokens.textContent = gameState.apocalypseTokens;
    domCache.doomPerClick.textContent = formatNumber(gameState.doomPerClick);

    // Update combo display - only show if 3+ clicks in last second (3+ clicks/sec)
    const clicksPerSec = gameState.comboCount / (gameState.comboTimeWindow / 1000);
    if (gameState.comboCount > 1 && clicksPerSec >= 3) {
        domCache.comboIndicator.textContent = `🔥 COMBO x${gameState.comboCount} (${gameState.comboMultiplier.toFixed(1)}x)`;
        domCache.comboIndicator.style.display = 'block';
    } else {
        domCache.comboIndicator.style.display = 'none';
    }

    // Doomsday clock (hidden during tutorial)
    const clockThreshold = 100 + (gameState.totalApocalypses * 50);
    const clockPercent = (gameState.doomClockProgress / clockThreshold) * 100;
    domCache.clockFill.style.width = Math.min(100, clockPercent) + '%';

    const hours = 11;
    const minutes = Math.floor((clockPercent / 100) * 60);
    domCache.clockTime.textContent =
        `${hours}:${minutes.toString().padStart(2, '0')} PM`;

    // Hide only the clock display during tutorial (not the whole section with the button!)
    if (domCache.clockDisplay) {
        if (!gameState.tutorialCompleted) {
            domCache.clockDisplay.style.display = 'none';
        } else {
            domCache.clockDisplay.style.display = 'block';
        }
    }

    // Tutorial mode: show progress to 1,000 chaos instead of clock
    if (!gameState.tutorialCompleted) {
        const tutorialProgress = Math.min(100, (gameState.chaosPoints / 1000) * 100);
        domCache.apocalypseProgress.style.width = tutorialProgress + '%';
        domCache.apocalypseProgressText.textContent =
            `${Math.floor(gameState.chaosPoints)}/1,000 chaos`;

        if (gameState.chaosPoints >= 1000) {
            // Show glowing tutorial button
            domCache.apocalypseSection.style.display = 'block';
            domCache.apocalypseButton.textContent = 'FIRST APOCALYPSE AVAILABLE!';
            domCache.apocalypseButton.className = 'tutorial-apocalypse-button';
            domCache.apocalypseButton.disabled = false;
            domCache.apocalypseReward.textContent = '2 (Tutorial Bonus)';
        } else {
            domCache.apocalypseSection.style.display = 'none';
        }
    } else {
        // Normal mode: use doomsday clock
        domCache.apocalypseProgress.style.width = Math.min(100, clockPercent) + '%';
        domCache.apocalypseProgressText.textContent = Math.floor(clockPercent) + '%';

        // Apocalypse button - use cached calculation if recent
        const now = Date.now();
        let apocalypseReward;
        if (now - calculationCache.lastRewardCalcTime < 1000) {
            apocalypseReward = calculationCache.apocalypseReward;
        } else {
            apocalypseReward = calculateApocalypseReward();
            calculationCache.apocalypseReward = apocalypseReward;
            calculationCache.lastRewardCalcTime = now;
        }
        
        domCache.apocalypseButton.textContent = 'TRIGGER APOCALYPSE';
        domCache.apocalypseButton.className = '';
        domCache.apocalypseReward.textContent = apocalypseReward;
        domCache.apocalypseButton.disabled = clockPercent < 100 || apocalypseReward === 0;

        if (clockPercent >= 100) {
            domCache.apocalypseSection.style.display = 'block';
        } else {
            domCache.apocalypseSection.style.display = 'none';
        }
    }

    // Stats
    domCache.totalApocalypses.textContent = gameState.totalApocalypses;
    domCache.runTime.textContent =
        formatTime(Date.now() - gameState.runStartTime);
    domCache.bestRun.textContent =
        gameState.bestRunTime ? formatTime(gameState.bestRunTime) : 'N/A';

    // Scenario
    if (gameState.currentScenario) {
        domCache.scenarioName.textContent = gameState.currentScenario.name;
        domCache.scenarioDesc.textContent = gameState.currentScenario.desc;

        if (domCache.scenarioEffects.children.length !== gameState.currentScenario.effects.length) {
            domCache.scenarioEffects.innerHTML = '';
            gameState.currentScenario.effects.forEach(effect => {
                const div = document.createElement('div');
                div.className = 'effect-item';
                div.textContent = effect.display;
                domCache.scenarioEffects.appendChild(div);
            });
        }
    }

    // Update synergies display
    renderSynergies();

    // Update active gameplay mechanics displays
    updateProjectDisplay();
    updateFocusDisplay();

    // Only re-render lists when needed (after purchases/changes)
    if (needsRender.departments) {
        renderDepartments();
        needsRender.departments = false;
    } else {
        updateDepartmentButtons();
    }

    if (needsRender.upgrades) {
        renderUpgrades();
        needsRender.upgrades = false;
    } else {
        updateUpgradeButtons();
    }

    if (needsRender.stocks) {
        renderStocks();
        needsRender.stocks = false;
    } else {
        updateStockButtons();
    }

    if (needsRender.mutations) {
        renderMutations();
        needsRender.mutations = false;
    } else {
        updateMutationButtons();
    }

    if (needsRender.achievements) {
        renderAchievements();
        needsRender.achievements = false;
    }

    // Update performance HUD if enabled
    const hud = document.getElementById('perfHud');
    if (hud && hud.style.display !== 'none') {
        const stats = performanceMonitor.getStats();
        const fpsEl = document.getElementById('perfFps');
        const cpsEl = document.getElementById('perfCps');
        const cacheEl = document.getElementById('perfCache');
        if (fpsEl) fpsEl.textContent = `FPS: ${stats.fps || '--'}`;
        if (cpsEl) cpsEl.textContent = `Chaos/s: ${formatNumber(gameState.chaosPerSecond)}`;
        if (cacheEl) cacheEl.textContent = `Cache: ${stats.cacheHitRate}`;
    }
}

// Update button states without re-rendering entire lists
function updateDepartmentButtons() {
    document.querySelectorAll('#departmentsList .buy-button').forEach((button, index) => {
        const deptId = Object.keys(DEPARTMENTS)[index];
        const cost = getDepartmentCost(deptId);
        const canAfford = gameState.chaosPoints >= cost;
        button.disabled = !canAfford;
        button.textContent = `Buy - ${formatNumber(cost)} chaos`;
    });
}

function updateUpgradeButtons() {
    document.querySelectorAll('#upgradesList .buy-button').forEach(button => {
        const upgradeId = button.dataset.upgradeId;
        if (upgradeId) {
            const upgrade = UPGRADES[upgradeId];
            const canAfford = gameState.chaosPoints >= upgrade.cost;
            button.disabled = !canAfford;
        }
    });
}

function updateStockButtons() {
    document.querySelectorAll('#stocksList .stock-item').forEach((item, index) => {
        const stockId = Object.keys(STOCKS)[index];
        const stock = gameState.stocks[stockId];

        const buyButton = item.querySelector('.stock-buy-button');
        const sellButton = item.querySelector('.stock-sell-button');
        const priceValue = item.querySelector('.price-value');
        const priceChange = item.querySelector('.price-change');
        const shareCount = item.querySelector('.item-count');

        if (buyButton && sellButton && priceValue && priceChange && shareCount) {
            buyButton.disabled = gameState.chaosPoints < stock.currentPrice;
            sellButton.disabled = stock.shares <= 0;
            priceValue.textContent = formatNumber(stock.currentPrice) + ' chaos';
            shareCount.textContent = `Shares: ${stock.shares}`;

            const priceChangeClass = stock.priceChange >= 0 ? 'up' : 'down';
            const priceChangeSymbol = stock.priceChange >= 0 ? '▲' : '▼';
            priceChange.className = `price-change ${priceChangeClass}`;
            priceChange.textContent = `${priceChangeSymbol} ${Math.abs(stock.priceChange).toFixed(2)}%`;
        }
    });
}

function updateMutationButtons() {
    document.querySelectorAll('#mutationsList .buy-button').forEach(button => {
        const mutationId = button.dataset.mutationId;
        if (mutationId) {
            const mutation = MUTATIONS[mutationId];
            const canAfford = gameState.apocalypseTokens >= mutation.cost;
            button.disabled = !canAfford;
        }
    });
}

/* -----------------------------------------------------------------------------
   List Rendering Functions
   ----------------------------------------------------------------------------- */

/** Render department list with buy buttons */
function renderDepartments() {
    const container = document.getElementById('departmentsList');
    
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();

    Object.values(DEPARTMENTS).forEach(dept => {
        const count = gameState.departments[dept.id].count;

        // Calculate cost based on buy mode
        let cost, buyText;
        if (gameState.buyMode === 'max') {
            // Compute preview for max affordable
            const { amount, totalCost } = computeMaxAffordable(dept.id, gameState.chaosPoints);
            cost = totalCost;
            buyText = amount > 0 ? `Buy Max (${amount}) - ${formatNumber(totalCost)}` : `Buy Max`;
        } else {
            cost = calculateBulkCost(dept.id, gameState.buyMode);
            buyText = `Buy ${gameState.buyMode} - ${formatNumber(cost)}`;
        }

        const production = getDepartmentProduction(dept.id);
        const canAfford = gameState.buyMode === 'max' ? (computeMaxAffordable(dept.id, gameState.chaosPoints).amount > 0) : (gameState.chaosPoints >= cost);
        const isUnlocked = dept.unlockRequirement();

        const div = document.createElement('div');
        div.className = isUnlocked ? 'department-item' : 'department-item locked';

        if (isUnlocked) {
            const currentSpec = gameState.departmentSpecializations[dept.id];
            const hasSpec = !!currentSpec;
            const specCost = getDepartmentCost(dept.id) * 10;

            div.innerHTML = `
                <div class="item-header">
                    <span class="item-name">${dept.icon} ${dept.name}</span>
                    <span class="item-count">Owned: ${count}</span>
                </div>
                <div class="item-desc">${dept.desc}</div>
                ${hasSpec ? `
                    <div class="specialization-active">
                        <span style="color: ${SPECIALIZATIONS[currentSpec].color}">
                            ${SPECIALIZATIONS[currentSpec].name}
                        </span>
                    </div>
                ` : count > 0 ? `
                    <div class="specialization-selector">
                        <div class="spec-label">Choose Specialization (${formatNumber(specCost)} chaos):</div>
                        <div class="spec-buttons">
                            <button class="spec-button" data-spec="military" style="border-color: ${SPECIALIZATIONS.military.color}">
                                ⚔️
                            </button>
                            <button class="spec-button" data-spec="economic" style="border-color: ${SPECIALIZATIONS.economic.color}">
                                💰
                            </button>
                            <button class="spec-button" data-spec="scientific" style="border-color: ${SPECIALIZATIONS.scientific.color}">
                                🔬
                            </button>
                        </div>
                    </div>
                ` : ''}
                <div class="item-footer">
                    <span class="item-production">+${formatNumber(dept.baseProduction)}/sec each</span>
                    <button class="buy-button" ${!canAfford ? 'disabled' : ''}>
                        ${buyText}
                    </button>
                </div>
            `;
            div.querySelector('.buy-button').onclick = () => buyDepartment(dept.id);

            // Add specialization button listeners
            div.querySelectorAll('.spec-button').forEach(btn => {
                btn.onclick = () => selectSpecialization(dept.id, btn.dataset.spec);
                btn.title = SPECIALIZATIONS[btn.dataset.spec].name + '\n' +
                    Object.entries(SPECIALIZATIONS[btn.dataset.spec].bonuses)
                        .map(([key, val]) => {
                            if (key === 'production') return `+${((val - 1) * 100).toFixed(0)}% production`;
                            if (key === 'costReduction') return `-${((1 - val) * 100).toFixed(0)}% costs`;
                            if (key === 'upgradeDiscount') return `-${((1 - val) * 100).toFixed(0)}% upgrade costs`;
                            if (key === 'clickPower') return `+${((val - 1) * 100).toFixed(0)}% click power`;
                            return '';
                        })
                        .filter(s => s)
                        .join(', ');
            });
        } else {
            div.innerHTML = `
                <div class="item-header">
                    <span class="item-name">❓ ???</span>
                    <span class="item-count">LOCKED</span>
                </div>
                <div class="item-desc">Requires previous department to unlock</div>
                <div class="item-footer">
                    <span class="item-production">???</span>
                    <button class="buy-button" disabled>
                        LOCKED
                    </button>
                </div>
            `;
            // Add tooltip
            div.title = `Unlock ${dept.name} by purchasing the previous department`;
        }

        fragment.appendChild(div);
    });
    
    // Clear and append all at once for better performance
    container.innerHTML = '';
    container.appendChild(fragment);
}

function renderUpgrades() {
    const container = document.getElementById('upgradesList');
    const fragment = document.createDocumentFragment();

    Object.values(UPGRADES).forEach(upgrade => {
        if (gameState.upgrades[upgrade.id]) return; // Already bought
        if (!upgrade.requirement()) return; // Not available yet

        const canAfford = gameState.chaosPoints >= upgrade.cost;

        const div = document.createElement('div');
        div.className = 'upgrade-item';
        div.innerHTML = `
            <div class="item-header">
                <span class="item-name">${upgrade.name}</span>
            </div>
            <div class="item-desc">${upgrade.desc}</div>
            <div class="item-footer">
                <button class="buy-button" data-upgrade-id="${upgrade.id}" ${!canAfford ? 'disabled' : ''}>
                    Purchase - ${formatNumber(upgrade.cost)} chaos
                </button>
            </div>
        `;

        div.querySelector('.buy-button').onclick = () => buyUpgrade(upgrade.id);
        fragment.appendChild(div);
    });

    container.innerHTML = '';
    if (fragment.childNodes.length === 0) {
        container.innerHTML = '<div class="item-desc">All upgrades purchased! Trigger an apocalypse for more.</div>';
    } else {
        container.appendChild(fragment);
    }
}

function renderSynergies() {
    const container = document.getElementById('synergiesList');
    if (!container) return;

    container.innerHTML = '';

    if (gameState.activeSynergies.length === 0) {
        container.innerHTML = '<div class="synergy-empty">No active synergies. Specialize 3+ departments with the same path!</div>';
        return;
    }

    gameState.activeSynergies.forEach(specId => {
        const synergy = SYNERGIES[specId];
        const spec = SPECIALIZATIONS[specId];

        const div = document.createElement('div');
        div.className = 'synergy-card';
        div.style.borderColor = spec.color;
        div.innerHTML = `
            <div class="synergy-header">
                <span class="synergy-name" style="color: ${spec.color}">${synergy.name}</span>
            </div>
            <div class="synergy-desc">${synergy.desc}</div>
        `;

        container.appendChild(div);
    });
}

function renderStocks() {
    const container = document.getElementById('stocksList');
    const fragment = document.createDocumentFragment();

    Object.values(STOCKS).forEach(stockData => {
        const stock = gameState.stocks[stockData.id];
        const canBuy = gameState.chaosPoints >= stock.currentPrice;
        const canSell = stock.shares > 0;

        const priceChangeClass = stock.priceChange >= 0 ? 'up' : 'down';
        const priceChangeSymbol = stock.priceChange >= 0 ? '▲' : '▼';

        const div = document.createElement('div');
        div.className = 'stock-item';
        div.innerHTML = `
            <div class="item-header">
                <span class="item-name">${stockData.name}</span>
                <span class="item-count">Shares: ${stock.shares}</span>
            </div>
            <div class="item-desc">${stockData.desc} (${(stockData.dividend * 100).toFixed(1)}% dividend)</div>
            <div class="stock-price">
                <span class="price-value">${formatNumber(stock.currentPrice)} chaos</span>
                <span class="price-change ${priceChangeClass}">
                    ${priceChangeSymbol} ${Math.abs(stock.priceChange).toFixed(2)}%
                </span>
            </div>
            <div class="item-footer stock-buttons">
                <button class="stock-buy-button" ${!canBuy ? 'disabled' : ''}>
                    Buy (${formatNumber(stock.currentPrice)})
                </button>
                <button class="stock-sell-button" ${!canSell ? 'disabled' : ''}>
                    Sell (${formatNumber(stock.currentPrice)})
                </button>
            </div>
        `;

        div.querySelector('.stock-buy-button').onclick = () => buyStock(stockData.id);
        div.querySelector('.stock-sell-button').onclick = () => sellStock(stockData.id);
        fragment.appendChild(div);
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);
}

function renderMutations() {
    const container = document.getElementById('mutationsList');
    const fragment = document.createDocumentFragment();

    Object.values(MUTATIONS).forEach(mutation => {
        const mutationState = gameState.mutations[mutation.id];
        const isUnlocked = mutationState?.unlocked || false;
        const canAfford = gameState.apocalypseTokens >= mutation.cost;

        const div = document.createElement('div');
        div.className = `mutation-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        div.innerHTML = `
            <div class="item-header">
                <span class="item-name">${mutation.name}</span>
                <span class="mutation-status ${isUnlocked ? 'unlocked' : 'locked'}">
                    ${isUnlocked ? 'ACTIVE' : 'LOCKED'}
                </span>
            </div>
            <div class="item-desc">${mutation.desc}</div>
            ${!isUnlocked ? `
                <div class="item-footer">
                    <button class="buy-button" data-mutation-id="${mutation.id}" ${!canAfford ? 'disabled' : ''}>
                        Unlock - ${mutation.cost} tokens
                    </button>
                </div>
            ` : '<div class="item-footer"><span style="color: #4caf50;">✓ Permanently Active</span></div>'}
        `;

        if (!isUnlocked) {
            div.querySelector('.buy-button').onclick = () => unlockMutation(mutation.id);
        }
        fragment.appendChild(div);
    });
    
    container.innerHTML = '';
    container.appendChild(fragment);
}

function renderAchievements() {
    const container = document.getElementById('achievementsList');
    if (!container) return;

    container.innerHTML = '';

    const unlockedCount = Object.values(gameState.achievements).filter(a => a.unlocked).length;
    const totalCount = Object.keys(ACHIEVEMENTS).length;

    const header = document.createElement('div');
    header.className = 'achievements-header';
    header.innerHTML = `
        <div class="achievements-progress">
            <span>Progress: ${unlockedCount} / ${totalCount}</span>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${(unlockedCount / totalCount * 100)}%"></div>
            </div>
        </div>
    `;
    container.appendChild(header);

    // Group achievements by category
    const categories = {
        clicking: { name: 'Clicking', achievements: [] },
        departments: { name: 'Departments', achievements: [] },
        apocalypse: { name: 'Apocalypse', achievements: [] },
        chaos: { name: 'Chaos', achievements: [] },
        special: { name: 'Special', achievements: [] }
    };

    Object.values(ACHIEVEMENTS).forEach(achievement => {
        if (categories[achievement.category]) {
            categories[achievement.category].achievements.push(achievement);
        }
    });

    // Render each category
    Object.keys(categories).forEach(categoryKey => {
        const category = categories[categoryKey];
        if (category.achievements.length === 0) return;

        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'achievement-category';

        const categoryHeader = document.createElement('h3');
        categoryHeader.className = 'achievement-category-header';
        categoryHeader.textContent = category.name;
        categoryDiv.appendChild(categoryHeader);

        const gridDiv = document.createElement('div');
        gridDiv.className = 'achievement-grid';

        category.achievements.forEach(achievement => {
            const state = gameState.achievements[achievement.id];
            const isUnlocked = state?.unlocked || false;

            // Calculate progress for locked achievements - ALWAYS show progress
            let progressText = '';
            let progressPercent = 0;
            if (!isUnlocked) {
                const current = getCurrentProgress(achievement);
                const target = achievement.requirement.value;
                progressPercent = Math.min(100, (current / target) * 100);
                progressText = `${formatNumber(current)} / ${formatNumber(target)}`;
            }

            const div = document.createElement('div');
            div.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
            div.innerHTML = `
                <div class="achievement-card-icon">${achievement.icon}</div>
                <div class="achievement-card-name">${achievement.name.replace(achievement.icon, '').trim()}</div>
                <div class="achievement-card-desc">${achievement.desc}</div>
                <div class="achievement-card-reward">${achievement.reward.description}</div>
                ${!isUnlocked ? `
                    <div class="achievement-card-progress">
                        <div class="achievement-progress-bar">
                            <div class="achievement-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <div class="achievement-progress-text">${progressText}</div>
                    </div>
                ` : ''}
                <div class="achievement-card-status ${isUnlocked ? 'unlocked' : 'locked'}">
                    ${isUnlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
                </div>
            `;

            gridDiv.appendChild(div);
        });

        categoryDiv.appendChild(gridDiv);
        container.appendChild(categoryDiv);
    });
}

// Get current progress for an achievement
function getCurrentProgress(achievement) {
    switch (achievement.requirement.type) {
        case 'clicks':
            return gameState.totalClicks;
        case 'departments':
            if (achievement.id === 'departments100') {
                return Object.values(gameState.departments).reduce((sum, d) => sum + d.count, 0);
            }
            return Object.values(gameState.departments).filter(d => d.count > 0).length;
        case 'apocalypses':
            return gameState.totalApocalypses;
        case 'chaos':
            return gameState.chaosPoints;
        case 'totalChaos':
            return gameState.totalChaosEarned;
        case 'stocks':
            return Object.values(gameState.stocks).reduce((sum, s) => sum + s.shares, 0);
        case 'mutations':
            return Object.values(gameState.mutations).filter(m => m.unlocked).length;
        case 'upgrades':
            return Object.keys(gameState.upgrades).length;
        case 'combo':
            return gameState.comboCount;
        case 'crits':
            return gameState.totalCrits || 0;
        default:
            return 0;
    }
}

/* -----------------------------------------------------------------------------
   Community Features (Leaderboards, Statistics, Sharing)
   ----------------------------------------------------------------------------- */

/** Get local leaderboard data from localStorage */
function getGlobalLeaderboard() {
    let leaderboard = localStorage.getItem('apocalypseCorpLeaderboard');
    if (!leaderboard) {
        leaderboard = {
            fastestApocalypse: [],
            highestChaosPerSec: [],
            longestCombo: [],
            totalApocalypses: []
        };
    } else {
        leaderboard = JSON.parse(leaderboard);
    }
    return leaderboard;
}

function updateGlobalLeaderboard(category, value, playerData = {}) {
    const leaderboard = getGlobalLeaderboard();
    
    if (!leaderboard[category]) {
        leaderboard[category] = [];
    }
    
    const entry = {
        value: value,
        timestamp: Date.now(),
        playerName: playerData.name || 'Anonymous',
        apocalypses: gameState.totalApocalypses
    };
    
    leaderboard[category].push(entry);
    leaderboard[category].sort((a, b) => {
        if (category === 'fastestApocalypse') {
            return a.value - b.value; // Lower is better
        }
        return b.value - a.value; // Higher is better
    });
    
    // Keep only top 100
    leaderboard[category] = leaderboard[category].slice(0, 100);
    
    localStorage.setItem('apocalypseCorpLeaderboard', JSON.stringify(leaderboard));
    return leaderboard;
}

function calculatePercentileRank(category, value) {
    const leaderboard = getGlobalLeaderboard();
    const entries = leaderboard[category] || [];
    
    if (entries.length === 0) return 50; // Default to 50th percentile
    
    let betterCount = 0;
    entries.forEach(entry => {
        if (category === 'fastestApocalypse') {
            if (entry.value < value) betterCount++;
        } else {
            if (entry.value > value) betterCount++;
        }
    });
    
    const percentile = 100 - Math.round((betterCount / entries.length) * 100);
    return Math.max(1, Math.min(100, percentile));
}

// Achievement Sharing System
function generateShareText(achievement) {
    const emoji = achievement ? achievement.icon : '💀';
    const totalApocalypses = gameState.totalApocalypses || gameState.lifetimeStats.totalApocalypsesAllTime;
    
    return `I triggered ${totalApocalypses} apocalypses in Apocalypse Corp! ${emoji}\n` +
           `💀 Total Chaos: ${formatNumber(gameState.lifetimeStats.totalChaosAllTime)}\n` +
           `⚡ Highest Chaos/sec: ${formatNumber(gameState.lifetimeStats.highestChaosPerSec)}\n` +
           `🔥 Longest Combo: ${gameState.lifetimeStats.longestCombo}x`;
}

function generateShareImage() {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 400);
    
    // Title
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🏢 APOCALYPSE CORP™', 400, 60);
    
    // Stats box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(50, 100, 700, 250);
    ctx.strokeStyle = '#4a4a6a';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 100, 700, 250);
    
    // Stats
    ctx.fillStyle = '#4fc3f7';
    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.textAlign = 'left';
    
    const stats = [
        `💀 Total Apocalypses: ${gameState.lifetimeStats.totalApocalypsesAllTime}`,
        `💰 Total Chaos: ${formatNumber(gameState.lifetimeStats.totalChaosAllTime)}`,
        `⚡ Highest Chaos/sec: ${formatNumber(gameState.lifetimeStats.highestChaosPerSec)}`,
        `🔥 Longest Combo: ${gameState.lifetimeStats.longestCombo}x`
    ];
    
    stats.forEach((stat, i) => {
        ctx.fillText(stat, 80, 160 + (i * 50));
    });
    
    // Footer
    ctx.fillStyle = '#888';
    ctx.font = '20px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Monetizing the End Times Since 2025', 400, 380);
    
    return canvas;
}

function copyShareTextToClipboard() {
    const text = generateShareText();
    navigator.clipboard.writeText(text).then(() => {
        showNotification('📋 Copied!', 'Share text copied to clipboard');
        addLog('📋 Share text copied to clipboard!');
    }).catch(err => {
        addLog('❌ Failed to copy to clipboard');
    });
}

function downloadShareImage() {
    const canvas = generateShareImage();
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `apocalypse-corp-stats-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('📸 Downloaded!', 'Share image saved');
        addLog('📸 Share image downloaded!');
    });
}

// Ghost Run System
function recordGhostSnapshot() {
    const now = Date.now();
    const runTime = now - gameState.runStartTime;
    
    // Record snapshot every 5 seconds
    if (now - gameState.ghostRun.lastSnapshotTime >= 5000) {
        gameState.ghostRun.currentRunData.push({
            time: runTime,
            chaos: gameState.chaosPoints,
            chaosPerSec: gameState.chaosPerSecond
        });
        gameState.ghostRun.lastSnapshotTime = now;
    }
}

function finalizeGhostRun() {
    const currentRunTime = Date.now() - gameState.runStartTime;
    const currentScore = gameState.chaosPoints;
    
    // Check if this is a new best run
    if (!gameState.ghostRun.bestRunData || 
        currentScore > (gameState.ghostRun.bestRunData[gameState.ghostRun.bestRunData.length - 1]?.chaos || 0)) {
        gameState.ghostRun.bestRunData = [...gameState.ghostRun.currentRunData];
        addLog('👻 New ghost run record set!');
    }
    
    // Reset current run
    gameState.ghostRun.currentRunData = [];
    gameState.ghostRun.lastSnapshotTime = 0;
}

function getGhostComparison() {
    if (!gameState.ghostRun.bestRunData || gameState.ghostRun.bestRunData.length === 0) {
        return null;
    }
    
    const currentTime = Date.now() - gameState.runStartTime;
    const currentChaos = gameState.chaosPoints;
    
    // Find closest snapshot in best run
    let closestSnapshot = null;
    let minTimeDiff = Infinity;
    
    gameState.ghostRun.bestRunData.forEach(snapshot => {
        const timeDiff = Math.abs(snapshot.time - currentTime);
        if (timeDiff < minTimeDiff) {
            minTimeDiff = timeDiff;
            closestSnapshot = snapshot;
        }
    });
    
    if (!closestSnapshot) return null;
    
    const diff = currentChaos - closestSnapshot.chaos;
    const percentDiff = (diff / closestSnapshot.chaos) * 100;
    
    return {
        ahead: diff > 0,
        amount: Math.abs(diff),
        percent: Math.abs(percentDiff).toFixed(1),
        ghostChaos: closestSnapshot.chaos
    };
}

// Weekly Challenge System
function getWeekNumber() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - startOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

function generateWeeklyChallengeFromSeed(weekNum) {
    // Seeded random number generator
    let seed = weekNum * 9301 + 49297;
    const seededRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
    
    const challengeTypes = [
        {
            name: 'Speed Demon',
            desc: 'Trigger an apocalypse in under 10 minutes',
            goal: 600000, // 10 minutes in ms
            type: 'speed',
            difficulty: 0.7
        },
        {
            name: 'Chaos Collector',
            desc: 'Collect 1 million chaos points',
            goal: 1000000,
            type: 'chaos',
            difficulty: 0.6
        },
        {
            name: 'Click Master',
            desc: 'Click 500 times',
            goal: 500,
            type: 'clicks',
            difficulty: 0.5
        },
        {
            name: 'Department Tycoon',
            desc: 'Own 50 departments',
            goal: 50,
            type: 'departments',
            difficulty: 0.6
        },
        {
            name: 'Combo King',
            desc: 'Achieve a 30x combo',
            goal: 30,
            type: 'combo',
            difficulty: 0.7
        }
    ];
    
    const index = Math.floor(seededRandom() * challengeTypes.length);
    const challenge = challengeTypes[index];
    
    return {
        ...challenge,
        weekNumber: weekNum,
        completionRate: Math.round(challenge.difficulty * 100) + '%' // Simulated
    };
}

function getWeeklyChallenge() {
    const currentWeek = getWeekNumber();
    
    // Check if we need to generate new challenge
    if (!gameState.weeklyChallenge.currentWeek || 
        gameState.weeklyChallenge.currentWeek !== currentWeek) {
        gameState.weeklyChallenge.currentWeek = currentWeek;
        gameState.weeklyChallenge.completed = false;
        gameState.weeklyChallenge.progress = 0;
    }
    
    return generateWeeklyChallengeFromSeed(currentWeek);
}

function updateWeeklyChallengeProgress() {
    const challenge = getWeeklyChallenge();
    if (gameState.weeklyChallenge.completed) return;
    
    let progress = 0;
    switch (challenge.type) {
        case 'speed':
            const runTime = Date.now() - gameState.runStartTime;
            progress = Math.min(100, (runTime / challenge.goal) * 100);
            if (runTime <= challenge.goal && gameState.doomClockProgress >= 100) {
                gameState.weeklyChallenge.completed = true;
                showNotification('🏆 Weekly Challenge Complete!', challenge.name);
            }
            break;
        case 'chaos':
            progress = (gameState.chaosPoints / challenge.goal) * 100;
            if (gameState.chaosPoints >= challenge.goal) {
                gameState.weeklyChallenge.completed = true;
                showNotification('🏆 Weekly Challenge Complete!', challenge.name);
            }
            break;
        case 'clicks':
            progress = (gameState.sessionStats.sessionClicks / challenge.goal) * 100;
            if (gameState.sessionStats.sessionClicks >= challenge.goal) {
                gameState.weeklyChallenge.completed = true;
                showNotification('🏆 Weekly Challenge Complete!', challenge.name);
            }
            break;
        case 'departments':
            const totalDepts = Object.values(gameState.departments).reduce((sum, d) => sum + d.count, 0);
            progress = (totalDepts / challenge.goal) * 100;
            if (totalDepts >= challenge.goal) {
                gameState.weeklyChallenge.completed = true;
                showNotification('🏆 Weekly Challenge Complete!', challenge.name);
            }
            break;
        case 'combo':
            progress = (gameState.comboCount / challenge.goal) * 100;
            if (gameState.comboCount >= challenge.goal) {
                gameState.weeklyChallenge.completed = true;
                showNotification('🏆 Weekly Challenge Complete!', challenge.name);
            }
            break;
    }
    
    gameState.weeklyChallenge.progress = Math.min(100, progress);
}

// Statistics Dashboard Rendering
function renderStatsDashboard() {
    const container = document.getElementById('statsContent');
    if (!container) return;
    
    // Calculate session duration
    const sessionDuration = Date.now() - gameState.sessionStats.sessionStartTime;
    
    container.innerHTML = `
        <div class="stats-section-box">
            <h3>📊 Lifetime Statistics</h3>
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-label">Total Clicks</div>
                    <div class="stat-value">${formatNumber(gameState.lifetimeStats.totalClicksAllTime)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Total Chaos Earned</div>
                    <div class="stat-value">${formatNumber(gameState.lifetimeStats.totalChaosAllTime)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Total Apocalypses</div>
                    <div class="stat-value">${gameState.lifetimeStats.totalApocalypsesAllTime}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Fastest Apocalypse</div>
                    <div class="stat-value">${gameState.lifetimeStats.fastestApocalypseTime ? formatTime(gameState.lifetimeStats.fastestApocalypseTime) : 'N/A'}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Highest Chaos/sec</div>
                    <div class="stat-value">${formatNumber(gameState.lifetimeStats.highestChaosPerSec)}/s</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Longest Combo</div>
                    <div class="stat-value">${gameState.lifetimeStats.longestCombo}x</div>
                </div>
            </div>
        </div>
        
        <div class="stats-section-box">
            <h3>📈 Session Statistics</h3>
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-label">Session Duration</div>
                    <div class="stat-value">${formatTime(sessionDuration)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Session Clicks</div>
                    <div class="stat-value">${formatNumber(gameState.sessionStats.sessionClicks)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Session Chaos</div>
                    <div class="stat-value">${formatNumber(gameState.sessionStats.sessionChaos)}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Session Apocalypses</div>
                    <div class="stat-value">${gameState.sessionStats.sessionApocalypses}</div>
                </div>
            </div>
        </div>
        
        <div class="stats-section-box">
            <h3>📊 Performance Graph</h3>
            <canvas id="statsGraph" width="600" height="200"></canvas>
        </div>
    `;
    
    // Draw graph
    drawStatsGraph();
}

function drawStatsGraph() {
    const canvas = document.getElementById('statsGraph');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 10; i++) {
        const y = (height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Draw chaos progression if we have ghost data
    if (gameState.ghostRun.currentRunData && gameState.ghostRun.currentRunData.length > 1) {
        const data = gameState.ghostRun.currentRunData;
        const maxChaos = Math.max(...data.map(d => d.chaos), 1);
        const maxTime = data[data.length - 1].time;
        
        // Draw current run
        ctx.strokeStyle = '#4fc3f7';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        data.forEach((point, i) => {
            const x = (point.time / maxTime) * width;
            const y = height - ((point.chaos / maxChaos) * height);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw ghost run if exists
        if (gameState.ghostRun.bestRunData && gameState.ghostRun.bestRunData.length > 1) {
            const ghostData = gameState.ghostRun.bestRunData;
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            
            ghostData.forEach((point, i) => {
                const x = (point.time / maxTime) * width;
                const y = height - ((point.chaos / maxChaos) * height);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Legend
        ctx.fillStyle = '#4fc3f7';
        ctx.font = '12px "Courier New", monospace';
        ctx.fillText('— Current Run', 10, 20);
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.fillText('- - - Best Run (Ghost)', 10, 35);
    } else {
        // No data yet
        ctx.fillStyle = '#888';
        ctx.font = '16px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Play to generate statistics graph', width / 2, height / 2);
    }
}

function renderLeaderboards() {
    const container = document.getElementById('leaderboardContent');
    if (!container) return;
    
    const leaderboard = getGlobalLeaderboard();
    
    const categories = [
        { id: 'fastestApocalypse', name: '⚡ Fastest Apocalypse', format: formatTime, lower: true },
        { id: 'highestChaosPerSec', name: '💰 Highest Chaos/sec', format: (v) => formatNumber(v) + '/s', lower: false },
        { id: 'longestCombo', name: '🔥 Longest Combo', format: (v) => v + 'x', lower: false },
        { id: 'totalApocalypses', name: '💀 Total Apocalypses', format: formatNumber, lower: false }
    ];
    
    let html = '<div class="leaderboard-tabs">';
    categories.forEach((cat, i) => {
        html += `<button class="leaderboard-tab ${i === 0 ? 'active' : ''}" data-category="${cat.id}">${cat.name}</button>`;
    });
    html += '</div>';
    
    categories.forEach((cat, i) => {
        const entries = leaderboard[cat.id] || [];
        const myValue = cat.id === 'fastestApocalypse' ? gameState.lifetimeStats.fastestApocalypseTime :
                        cat.id === 'highestChaosPerSec' ? gameState.lifetimeStats.highestChaosPerSec :
                        cat.id === 'longestCombo' ? gameState.lifetimeStats.longestCombo :
                        gameState.lifetimeStats.totalApocalypsesAllTime;
        
        const percentile = myValue ? calculatePercentileRank(cat.id, myValue) : 50;
        
        html += `<div class="leaderboard-panel ${i === 0 ? 'active' : ''}" data-category="${cat.id}">`;
        html += `<div class="my-rank-box">
            <div class="rank-label">Your Rank</div>
            <div class="rank-value">Top ${percentile}%</div>
            <div class="rank-detail">${myValue ? cat.format(myValue) : 'No data yet'}</div>
        </div>`;
        
        html += '<div class="leaderboard-list">';
        if (entries.length === 0) {
            html += '<div class="leaderboard-empty">No entries yet. Be the first!</div>';
        } else {
            entries.slice(0, 10).forEach((entry, idx) => {
                const safeName = escapeHtml(entry.playerName);
                html += `<div class="leaderboard-entry">
                    <div class="entry-rank">#${idx + 1}</div>
                    <div class="entry-name">${safeName}</div>
                    <div class="entry-value">${cat.format(entry.value)}</div>
                </div>`;
            });
        }
        html += '</div></div>';
    });
    
    container.innerHTML = html;
    
    // Add tab switching
    document.querySelectorAll('.leaderboard-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            document.querySelectorAll('.leaderboard-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.leaderboard-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.querySelector(`.leaderboard-panel[data-category="${category}"]`).classList.add('active');
        });
    });
}

function renderWeeklyChallenge() {
    const container = document.getElementById('weeklyContent');
    if (!container) return;
    
    const challenge = getWeeklyChallenge();
    const completed = gameState.weeklyChallenge.completed;
    const progress = gameState.weeklyChallenge.progress;
    
    container.innerHTML = `
        <div class="weekly-challenge-box ${completed ? 'completed' : ''}">
            <h3>🗓️ Week ${challenge.weekNumber} Challenge</h3>
            <div class="challenge-name-big">${challenge.name}</div>
            <div class="challenge-desc-big">${challenge.desc}</div>
            
            <div class="challenge-progress-container">
                <div class="challenge-progress-bar">
                    <div class="challenge-progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="challenge-progress-text">${progress.toFixed(1)}%</div>
            </div>
            
            <div class="challenge-completion-rate">
                <span>📊 Estimated Global Completion Rate:</span>
                <span class="completion-value">${challenge.completionRate}</span>
            </div>
            
            ${completed ? '<div class="challenge-completed-badge">✅ COMPLETED!</div>' : ''}
        </div>
    `;
}

function renderGhostRun() {
    const container = document.getElementById('ghostContent');
    if (!container) return;
    
    const comparison = getGhostComparison();
    
    let html = '<div class="ghost-run-box">';
    html += '<h3>👻 Ghost Run Comparison</h3>';
    
    if (!comparison) {
        html += '<div class="ghost-empty">Complete your first apocalypse to create a ghost run!</div>';
    } else {
        const icon = comparison.ahead ? '📈' : '📉';
        const color = comparison.ahead ? '#4caf50' : '#f44336';
        const text = comparison.ahead ? 'ahead of' : 'behind';
        
        html += `<div class="ghost-comparison">
            <div class="ghost-status" style="color: ${color}">
                ${icon} You're ${text} your best run by ${comparison.percent}%
            </div>
            <div class="ghost-details">
                <div class="ghost-detail-row">
                    <span>Current Chaos:</span>
                    <span>${formatNumber(gameState.chaosPoints)}</span>
                </div>
                <div class="ghost-detail-row">
                    <span>Ghost Chaos (at this time):</span>
                    <span>${formatNumber(comparison.ghostChaos)}</span>
                </div>
                <div class="ghost-detail-row">
                    <span>Difference:</span>
                    <span style="color: ${color}">${comparison.ahead ? '+' : '-'}${formatNumber(comparison.amount)}</span>
                </div>
            </div>
        </div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

/* =============================================================================
   SECTION 9: EVENT HANDLERS & GAME LOOP
   ============================================================================= */

/** Initialize game when DOM is ready */
function initializeGame() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // Event listeners
    document.getElementById('doomButton').addEventListener('click', handleDoomClick);
    document.getElementById('apocalypseButton').addEventListener('click', triggerApocalypse);

    // Keyboard support - spacebar or Enter to click doom button
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            // Don't trigger if user is typing in an input or modal is open
            if (document.activeElement.tagName !== 'INPUT' &&
                document.activeElement.tagName !== 'TEXTAREA' &&
                !document.querySelector('.tutorial-modal') &&
                !document.querySelector('.apocalypse-overlay.show')) {
                e.preventDefault(); // Prevent page scroll on spacebar
                handleDoomClick(e);
            }
        }
    });

    document.getElementById('saveButton').addEventListener('click', () => {
        gameState.lastSaveTime = Date.now();
        localStorage.setItem('apocalypseCorpSave', JSON.stringify(gameState));
        addLog('Game saved!');
        showNotification('Save Complete', 'Your progress has been saved');
    });

    document.getElementById('loadButton').addEventListener('click', () => {
        const save = localStorage.getItem('apocalypseCorpSave');
        if (save) {
            try {
                const loadedState = JSON.parse(save);
                safeMergeGameState(loadedState);
                gameState.lastTick = Date.now();

                // Re-initialize objects to ensure all data structures exist
                initializeDepartments();
                initializeStocks();
                initializeMutations();
                initializeAchievements();

                needsRender.departments = true;
                needsRender.upgrades = true;
                needsRender.stocks = true;
                needsRender.mutations = true;
                needsRender.achievements = true;

                updateDisplay();
                addLog('Game loaded!');
            } catch (error) {
                console.error('Failed to load save:', error);
                addLog('Failed to load save file');
            }
        } else {
            addLog('No save found!');
        }
    });

    document.getElementById('exportButton').addEventListener('click', () => {
        gameState.lastSaveTime = Date.now();
        const saveData = JSON.stringify(gameState);
        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `apocalypse-corp-save-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        addLog('Save exported!');
    });

    document.getElementById('importButton').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const loadedState = JSON.parse(event.target.result);
                        safeMergeGameState(loadedState);
                        gameState.lastTick = Date.now();

                        initializeDepartments();
                        initializeStocks();
                        initializeMutations();
                        initializeAchievements();

                        needsRender.departments = true;
                        needsRender.upgrades = true;
                        needsRender.stocks = true;
                        needsRender.mutations = true;
                        needsRender.achievements = true;

                        updateDisplay();
                        addLog('Save imported successfully!');
                        showNotification('Import Complete', 'Your save has been loaded');
                    } catch (err) {
                        console.error('Failed to import save:', err);
                        addLog('Failed to import save file');
                        alert('Failed to import save file. Please make sure it\'s a valid save file.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    });

    document.getElementById('soundToggle').addEventListener('click', () => {
        gameState.soundEnabled = !gameState.soundEnabled;
        const button = document.getElementById('soundToggle');
        button.textContent = gameState.soundEnabled ? 'Sound ON' : 'Sound OFF';
        addLog(gameState.soundEnabled ? 'Sound enabled' : 'Sound disabled');
    });

    // Pause/Resume toggle
    document.getElementById('pauseButton').addEventListener('click', () => {
        gameState.paused = !gameState.paused;
        const btn = document.getElementById('pauseButton');
        btn.textContent = gameState.paused ? 'Resume' : 'Pause';
        addLog(gameState.paused ? 'Game paused' : 'Game resumed');
    });

    // Performance HUD toggle
    document.getElementById('perfToggle').addEventListener('click', () => {
        const hud = document.getElementById('perfHud');
        const btn = document.getElementById('perfToggle');
        const turningOn = hud.style.display === 'none';
        if (turningOn) {
            performanceMonitor.enable();
            hud.style.display = 'block';
            btn.textContent = 'Perf HUD: ON';
        } else {
            performanceMonitor.disable();
            hud.style.display = 'none';
            btn.textContent = 'Perf HUD: OFF';
        }
    });

    // Theme toggle (cycles through soft -> light -> classic)
    const themeBtn = document.getElementById('themeToggle');
    themeBtn.addEventListener('click', () => {
        if (gameState.theme === 'soft') {
            gameState.theme = 'light';
        } else if (gameState.theme === 'light') {
            gameState.theme = 'classic';
        } else {
            gameState.theme = 'soft';
        }
        applyTheme();
        // Persist immediately
        try { localStorage.setItem('apocalypseCorpSave', JSON.stringify(gameState)); } catch (_) {}
        const themeName = gameState.theme.charAt(0).toUpperCase() + gameState.theme.slice(1);
        addLog(`Theme switched to ${themeName}`);
    });

    // Buy mode selector event listeners
    document.querySelectorAll('.buy-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            gameState.buyMode = mode === 'max' ? 'max' : parseInt(mode);

            // Update active state
            document.querySelectorAll('.buy-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Re-render departments to update costs
            needsRender.departments = true;
            updateDisplay();
        });
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        if (confirm('Are you sure? This will delete ALL progress!')) {
            localStorage.removeItem('apocalypseCorpSave');
            location.reload();
        }
    });

    // Auto-save every 30 seconds
    setInterval(() => {
        localStorage.setItem('apocalypseCorpSave', JSON.stringify(gameState));
        gameState.lastSaveTime = Date.now();
    }, 30000);

    // Initialize data structures first
    initializeDepartments();
    initializeStocks();
    initializeMutations();
    initializeAchievements();

    // Try to load save on start
    const save = localStorage.getItem('apocalypseCorpSave');
    const saveExists = !!save;
    let timeSinceLastSave = 0;
    
    if (save) {
        try {
            const loadedState = JSON.parse(save);

            // Save version migration
            if (!loadedState.saveVersion || loadedState.saveVersion < 2) {
                // Migrate old saves
                loadedState.saveVersion = 2;
                loadedState.achievements = loadedState.achievements || {};
                loadedState.totalClicks = loadedState.totalClicks || 0;
                loadedState.totalChaosEarned = loadedState.totalChaosEarned || 0;
                loadedState.lastSaveTime = loadedState.lastSaveTime || Date.now();
                loadedState.soundEnabled = loadedState.soundEnabled !== undefined ? loadedState.soundEnabled : true;
            }

            // Initialize upgradeMultipliers if missing (for old saves or corrupted data)
            if (!loadedState.upgradeMultipliers) {
                loadedState.upgradeMultipliers = {
                    intern: 1,
                    meteor: 1,
                    biohazard: 1,
                    nuclear: 1,
                    blackhole: 1,
                    reality: 1,
                    dimension: 1,
                    paradox: 1
                };
            }

            // Safely merge loaded state with initialized state
            safeMergeGameState(loadedState);

            // Calculate offline progress
            timeSinceLastSave = Date.now() - gameState.lastSaveTime;
            gameState.lastTick = Date.now();

            // Recalculate synergies after loading
            calculateSynergyBonuses();

            // Recalculate chaos per second before offline progress
            gameState.chaosPerSecond = calculateChaosPerSecond();
            calculateOfflineProgress(timeSinceLastSave);

            addLog('Welcome back! Save loaded.');
        } catch (e) {
            console.error('Failed to load save:', e);
            addLog('Failed to load save. Starting fresh.');
        }
    } else {
        addLog('Welcome to Apocalypse Corp!');
        addLog('Click the ADVANCE DOOMSDAY button to generate Chaos Points.');
        addLog('Use Chaos Points to hire departments that automate chaos generation.');
        addLog('Advance the clock to midnight to trigger your first apocalypse!');
    }

    // Apply theme after loading state
    applyTheme();

    // Initialize scenario if not loaded
    if (!gameState.currentScenario) {
        selectScenario();
    }

    // Community tab setup
    document.querySelectorAll('.community-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const panel = btn.dataset.panel;
            document.querySelectorAll('.community-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.community-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${panel}-panel`).classList.add('active');
            
            // Render content when switching panels
            if (panel === 'stats') renderStatsDashboard();
            else if (panel === 'leaderboards') renderLeaderboards();
            else if (panel === 'weekly') renderWeeklyChallenge();
            else if (panel === 'ghost') renderGhostRun();
            else if (panel === 'share') {
                document.getElementById('sharePreviewText').textContent = generateShareText();
            }
        });
    });
    
    // Share buttons
    document.getElementById('copyShareBtn')?.addEventListener('click', copyShareTextToClipboard);
    document.getElementById('downloadImageBtn')?.addEventListener('click', downloadShareImage);
    
    // Initial render of community features
    renderStatsDashboard();
    renderLeaderboards();
    renderWeeklyChallenge();
    renderGhostRun();
    
    // Update community panels every 5 seconds
    setInterval(() => {
        const activePanel = document.querySelector('.community-panel.active');
        if (activePanel) {
            const panelId = activePanel.id.replace('-panel', '');
            if (panelId === 'stats') renderStatsDashboard();
            else if (panelId === 'leaderboards') renderLeaderboards();
            else if (panelId === 'weekly') renderWeeklyChallenge();
            else if (panelId === 'ghost') renderGhostRun();
        }
    }, 5000);

    // Add mobile collapse functionality
    if (window.innerWidth <= 1024) {
        setupMobileCollapse();
    }

    // Initialize AI Assistant
    updateAssistantUI();

    // Sync personality and voice selectors with game state
    const personalitySelect = document.getElementById('personality-select');
    const voiceSelect = document.getElementById('voice-select');
    if (personalitySelect && gameState.assistant) {
        personalitySelect.value = gameState.assistant.personality;
    }
    if (voiceSelect && gameState.assistant) {
        voiceSelect.value = gameState.assistant.voiceType;
    }

    // Welcome message from assistant (for new games only)
    if (!saveExists && gameState.assistant && gameState.assistant.enabled) {
        setTimeout(() => assistantComment('welcome', true), 2000);
    }

    // Check for offline progress and welcome back message
    if (saveExists && timeSinceLastSave > 60000) { // If more than 1 minute offline
        if (gameState.assistant && gameState.assistant.enabled) {
            const trigger = timeSinceLastSave > 3600000 ? 'welcomeBack_long' : 'welcomeBack_short';
            setTimeout(() => assistantComment(trigger), 3000);
        }
    }

    // Initialize DOM cache for better performance
    initDOMCache();
    
    // Start game loop with requestAnimationFrame for better performance
    lastFrameTime = Date.now();
    updateDisplay();
    requestAnimationFrame(gameTick);
}

// Setup collapsible panels for mobile
function setupMobileCollapse() {
    const sections = [
        '.doomsday-clock-section',
        '.resources-section',
        '.scenario-section',
        '.stats-section',
        '.event-log-section'
    ];

    sections.forEach(selector => {
        const section = document.querySelector(selector);
        if (!section) return;

        const header = section.querySelector('h2, h3');
        if (!header) return;

        header.addEventListener('click', () => {
            section.classList.toggle('collapsed');
        });
    });
}

// Developer console helpers (accessible via browser console)
window.apocalypseDebug = {
    enablePerformanceMonitor() {
        performanceMonitor.enable();
        console.log('Performance monitoring enabled. Check stats with apocalypseDebug.getPerformanceStats()');
    },
    disablePerformanceMonitor() {
        performanceMonitor.disable();
        console.log('Performance monitoring disabled');
    },
    getPerformanceStats() {
        const stats = performanceMonitor.getStats();
        console.log('Performance Stats:', stats);
        console.log('Cache Info:', {
            chaosPerSecondCached: calculationCache.lastChaosCalcTime > 0,
            cacheAge: Date.now() - calculationCache.lastChaosCalcTime + 'ms'
        });
        return stats;
    },
    clearCache() {
        clearCalculationCache();
        console.log('Calculation cache cleared');
    },
    getCurrentState() {
        return {
            chaosPerSecond: gameState.chaosPerSecond,
            departments: Object.entries(gameState.departments).map(([id, d]) => ({
                id,
                count: d.count,
                production: getDepartmentProduction(id)
            })),
            cacheStatus: {
                lastChaosCalc: calculationCache.lastChaosCalcTime,
                age: Date.now() - calculationCache.lastChaosCalcTime
            }
        };
    }
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

// Log helpful message for developers
console.log('%c🏢 Apocalypse Corp - Performance Optimized', 'font-size: 16px; color: #ff6b6b; font-weight: bold;');
console.log('%cUse apocalypseDebug.enablePerformanceMonitor() to monitor FPS and performance', 'color: #4fc3f7;');