/**
 * Game Constants Module
 * All static game data definitions
 */

import { gameState } from './state.js';

// Forward declaration for formatNumber (will be imported from utils in main)
let formatNumber = (n) => n.toLocaleString();
export function setFormatNumber(fn) { formatNumber = fn; }

export const DEPARTMENTS = {
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

export const UPGRADES = {
    autoClicker1: {
        id: 'autoClicker1',
        name: '🤖 Auto-Clicker Mk1',
        desc: 'Automatically clicks 1 time per second',
        cost: 500,
        effect: () => {
            if (!gameState.autoClickerLevel) gameState.autoClickerLevel = 0;
            gameState.autoClickerLevel = 1;
            gameState.autoClickerRate = 1000;
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
            gameState.autoClickerRate = 500;
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
            gameState.autoClickerRate = 200;
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

export const MUTATIONS = {
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

export const SPECIALIZATIONS = {
    military: {
        id: 'military',
        name: '⚔️ Military Path',
        color: '#ff4444',
        bonuses: {
            production: 1.5,
            clickPower: 1.2
        }
    },
    economic: {
        id: 'economic',
        name: '💰 Economic Path',
        color: '#44ff44',
        bonuses: {
            production: 1.3,
            costReduction: 0.85
        }
    },
    scientific: {
        id: 'scientific',
        name: '🔬 Scientific Path',
        color: '#4444ff',
        bonuses: {
            production: 1.4,
            upgradeDiscount: 0.9
        }
    }
};

export const SYNERGIES = {
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

export const SCENARIOS = [
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

export const STOCKS = {
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

export const APOCALYPSE_TYPES = {
    meteor: {
        id: 'meteor',
        name: '☄️ Meteor Strike',
        desc: 'A massive asteroid impacts Earth, reshaping civilization',
        icon: '☄️',
        unlockRequirement: () => true,
        tokenMultiplier: 1.0,
        effects: {
            departmentCostMult: 1.5,
            productionMult: 3.0,
            duration: null
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
            aiOverlordActive: true
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
            keepDepartments: 0.25
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
            duration: 600000
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
            upgradesDisabledDuration: 300000
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
            permanentCostReduction: 0.5
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

export const RANDOM_EVENTS = [
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

export const DOOM_PROJECTS = [
    {
        id: 'doomsday_device',
        name: '🔧 Doomsday Device',
        desc: 'Construct the ultimate weapon of mass destruction',
        cost: 100000,
        clicksRequired: 100,
        idleTime: 600000,
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
        idleTime: 1200000,
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
        idleTime: 900000,
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
        idleTime: 1800000,
        reward: {
            type: 'multiplier',
            value: 3,
            target: 'click_power',
            message: 'Click power tripled permanently!'
        },
        requirement: () => gameState.totalApocalypses >= 10
    }
];

export const CHALLENGES = [];

export const ACHIEVEMENTS = {
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
            check: () => false
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

export const ASSISTANT_DIALOGUES = {
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

export const VOICE_CONFIGS = {
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
