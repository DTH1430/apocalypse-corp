// Game State
const gameState = {
    doomEnergy: 0,
    chaosPoints: 0,
    apocalypseTokens: 0,
    doomClockProgress: 0,
    doomPerClick: 1,
    chaosPerSecond: 0,

    departments: {},
    upgrades: {},
    mutations: {},
    stocks: {},

    totalApocalypses: 0,
    currentScenario: null,
    runStartTime: Date.now(),
    bestRunTime: null,

    lastTick: Date.now()
};

// Game Data Definitions
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

const UPGRADES = {
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
        effect: () => DEPARTMENTS.intern.baseProduction *= 2,
        requirement: () => (gameState.departments.intern?.count || 0) >= 5
    },
    meteorBoost: {
        id: 'meteorBoost',
        name: '🎯 Precision Targeting',
        desc: 'Meteor division produces 2x chaos',
        cost: 5000,
        effect: () => DEPARTMENTS.meteor.baseProduction *= 2,
        requirement: () => (gameState.departments.meteor?.count || 0) >= 5
    },
    biohazardBoost: {
        id: 'biohazardBoost',
        name: '🧬 Gene Splicing',
        desc: 'Biohazard R&D produces 2x chaos',
        cost: 50000,
        effect: () => DEPARTMENTS.biohazard.baseProduction *= 2,
        requirement: () => (gameState.departments.biohazard?.count || 0) >= 5
    },
    globalEfficiency: {
        id: 'globalEfficiency',
        name: '📊 Synergy Optimization',
        desc: 'All departments produce 50% more chaos',
        cost: 100000,
        effect: () => {
            Object.values(DEPARTMENTS).forEach(dept => {
                dept.baseProduction *= 1.5;
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
            Object.values(DEPARTMENTS).forEach(dept => {
                dept.baseProduction *= 2;
            });
        },
        requirement: () => gameState.totalApocalypses >= 2
    }
};

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

// Initialize departments
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

// Initialize will happen in initializeGame() when DOM is ready

// Core Game Functions
function formatNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toString();
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

function getDepartmentCost(deptId) {
    const dept = DEPARTMENTS[deptId];
    const count = gameState.departments[deptId].count;
    let cost = Math.floor(dept.baseCost * Math.pow(dept.costMultiplier, count));

    // Apply mutation cost reduction
    if (gameState.mutations.zombiePlague?.unlocked) {
        cost = Math.floor(cost * MUTATIONS.zombiePlague.value);
    }

    return cost;
}

function getDepartmentProduction(deptId) {
    const dept = DEPARTMENTS[deptId];
    const count = gameState.departments[deptId].count;
    let production = dept.baseProduction * count;

    // Apply mutation production multiplier
    if (gameState.mutations.aiTakeover?.unlocked) {
        production *= MUTATIONS.aiTakeover.value;
    }

    // Apply scenario effects
    if (gameState.currentScenario) {
        gameState.currentScenario.effects.forEach(effect => {
            if (effect.type === deptId) {
                production *= effect.mult;
            }
        });
    }

    return production;
}

function calculateChaosPerSecond() {
    let total = 0;
    Object.keys(DEPARTMENTS).forEach(deptId => {
        total += getDepartmentProduction(deptId);
    });

    // Apply stock dividends
    Object.keys(STOCKS).forEach(stockId => {
        const stock = gameState.stocks[stockId];
        const stockData = STOCKS[stockId];
        total += stock.shares * stock.currentPrice * stockData.dividend / 100;
    });

    return total;
}

function buyDepartment(deptId) {
    const cost = getDepartmentCost(deptId);
    if (gameState.chaosPoints >= cost) {
        gameState.chaosPoints -= cost;
        gameState.departments[deptId].count++;
        needsRender.departments = true;
        needsRender.upgrades = true; // Some upgrades unlock based on department count
        updateDisplay();
        addLog(`Hired ${DEPARTMENTS[deptId].name}`);
    }
}

function buyUpgrade(upgradeId) {
    const upgrade = UPGRADES[upgradeId];
    if (gameState.chaosPoints >= upgrade.cost && !gameState.upgrades[upgradeId]) {
        gameState.chaosPoints -= upgrade.cost;
        gameState.upgrades[upgradeId] = true;
        upgrade.effect();
        needsRender.upgrades = true;
        needsRender.departments = true; // Upgrades may affect departments
        updateDisplay();
        addLog(`Purchased: ${upgrade.name}`);
    }
}

function unlockMutation(mutationId) {
    const mutation = MUTATIONS[mutationId];
    if (gameState.apocalypseTokens >= mutation.cost && !gameState.mutations[mutationId]?.unlocked) {
        gameState.apocalypseTokens -= mutation.cost;
        if (!gameState.mutations[mutationId]) {
            gameState.mutations[mutationId] = {};
        }
        gameState.mutations[mutationId].unlocked = true;
        needsRender.mutations = true;
        updateDisplay();
        addLog(`Unlocked mutation: ${mutation.name}`);
    }
}

function buyStock(stockId) {
    const stock = gameState.stocks[stockId];
    if (gameState.chaosPoints >= stock.currentPrice) {
        gameState.chaosPoints -= stock.currentPrice;
        stock.shares++;
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
        stock.currentPrice = Math.max(10, stock.currentPrice * (1 + change));
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
    let baseReward = Math.floor(Math.sqrt(gameState.chaosPoints / 1000000));
    baseReward = Math.max(1, baseReward);

    // Apply mutation bonus
    if (gameState.mutations.timeLoop?.unlocked) {
        baseReward = Math.floor(baseReward * MUTATIONS.timeLoop.value);
    }

    return baseReward;
}

function triggerApocalypse() {
    const runTime = Date.now() - gameState.runStartTime;
    const reward = calculateApocalypseReward();

    if (reward === 0) {
        addLog('Not enough chaos to trigger apocalypse!');
        return;
    }

    // Track best run
    if (!gameState.bestRunTime || runTime < gameState.bestRunTime) {
        gameState.bestRunTime = runTime;
    }

    // Show apocalypse animation
    showApocalypseAnimation(reward, runTime);

    // Award tokens
    gameState.apocalypseTokens += reward;
    gameState.totalApocalypses++;

    addLog(`💀 THE WORLD HAS ENDED! Gained ${reward} Apocalypse Tokens 💀`);

    // Reset run state
    const carryoverChaos = gameState.mutations.nuclearWinter?.unlocked ?
        gameState.chaosPerSecond * 0.1 : 0;

    gameState.chaosPoints = 0;
    gameState.doomEnergy = 0;
    gameState.doomClockProgress = 0;
    gameState.chaosPerSecond = 0;

    // Reset departments
    Object.keys(gameState.departments).forEach(id => {
        gameState.departments[id].count = 0;
    });

    // Keep mutations but reset upgrades
    gameState.upgrades = {};

    // Reset department base production
    Object.keys(DEPARTMENTS).forEach(id => {
        DEPARTMENTS[id].baseProduction = DEPARTMENTS[id].baseProduction /
            (gameState.upgrades[id + 'Boost'] ? 2 : 1);
    });

    // Reapply mutation effects
    if (gameState.mutations.aiTakeover?.unlocked) {
        Object.keys(DEPARTMENTS).forEach(id => {
            // Already applied in production calculation
        });
    }

    // Give carryover chaos
    if (carryoverChaos > 0) {
        gameState.chaosPoints = carryoverChaos * 10; // Convert per-second to initial capital
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

    // Mark everything for re-render
    needsRender.departments = true;
    needsRender.upgrades = true;
    needsRender.stocks = true;
    needsRender.mutations = true;

    updateDisplay();
}

// Click handler
function handleDoomClick(event) {
    let clickPower = gameState.doomPerClick;

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
    gameState.chaosPoints += clickPower;
    gameState.doomEnergy += clickPower;
    gameState.doomClockProgress += clickPower;

    // Doomsday clock mechanics
    const clockThreshold = 100 + (gameState.totalApocalypses * 50);
    if (gameState.doomClockProgress >= clockThreshold) {
        gameState.doomClockProgress = clockThreshold;
    }

    // Create floating chaos point animation
    createFloatingText(`+${formatNumber(clickPower)}`, event);

    // Add pulse effect to clock
    const clockFill = document.getElementById('clockFill');
    clockFill.classList.add('pulse');
    setTimeout(() => clockFill.classList.remove('pulse'), 300);

    // Tutorial hint after first few clicks
    if (gameState.chaosPoints >= 10 && gameState.chaosPoints <= 12 &&
        Object.values(gameState.departments).every(d => d.count === 0)) {
        addLog('💡 You now have enough Chaos Points to hire your first department!');
    }

    updateDisplay();
}

// Create floating text animation
function createFloatingText(text, event) {
    const button = event.target.closest('.doom-button');
    if (!button) return;

    const floating = document.createElement('div');
    floating.className = 'floating-chaos';
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

    // Remove after animation
    setTimeout(() => {
        if (floating.parentNode) {
            floating.parentNode.removeChild(floating);
        }
    }, 1000);
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

// Game loop
function gameTick() {
    const now = Date.now();
    const delta = (now - gameState.lastTick) / 1000;
    gameState.lastTick = now;

    // Generate chaos from doom energy (passive bonus)
    const chaosGained = gameState.doomEnergy * 0.01 * delta;
    gameState.chaosPoints += chaosGained;

    // Generate chaos from departments (main passive income)
    gameState.chaosPerSecond = calculateChaosPerSecond();
    gameState.chaosPoints += gameState.chaosPerSecond * delta;

    updateDisplay();
}

// Update stock prices periodically
setInterval(() => {
    updateStockPrices();
    updateDisplay();
}, 5000);

// Track when we need to re-render lists
let needsRender = {
    departments: true,
    upgrades: true,
    stocks: true,
    mutations: true
};

// UI Update
function updateDisplay() {
    // Resources
    document.getElementById('doomEnergy').textContent = formatNumber(gameState.doomEnergy);
    document.getElementById('chaosPoints').textContent = formatNumber(gameState.chaosPoints);
    document.getElementById('chaosPerSec').textContent = formatNumber(gameState.chaosPerSecond);
    document.getElementById('apocalypseTokens').textContent = gameState.apocalypseTokens;
    document.getElementById('doomPerClick').textContent = formatNumber(gameState.doomPerClick);

    // Doomsday clock
    const clockThreshold = 100 + (gameState.totalApocalypses * 50);
    const clockPercent = (gameState.doomClockProgress / clockThreshold) * 100;
    document.getElementById('clockFill').style.width = Math.min(100, clockPercent) + '%';

    const hours = 11;
    const minutes = Math.floor((clockPercent / 100) * 60);
    document.getElementById('clockTime').textContent =
        `${hours}:${minutes.toString().padStart(2, '0')} PM`;

    // Apocalypse progress bar
    document.getElementById('apocalypseProgress').style.width = Math.min(100, clockPercent) + '%';
    document.getElementById('apocalypseProgressText').textContent = Math.floor(clockPercent) + '%';

    // Apocalypse button
    const apocalypseReward = calculateApocalypseReward();
    document.getElementById('apocalypseReward').textContent = apocalypseReward;
    document.getElementById('apocalypseButton').disabled =
        clockPercent < 100 || apocalypseReward === 0;

    if (clockPercent >= 100) {
        document.getElementById('apocalypseSection').style.display = 'block';
    } else {
        document.getElementById('apocalypseSection').style.display = 'none';
    }

    // Stats
    document.getElementById('totalApocalypses').textContent = gameState.totalApocalypses;
    document.getElementById('runTime').textContent =
        formatTime(Date.now() - gameState.runStartTime);
    document.getElementById('bestRun').textContent =
        gameState.bestRunTime ? formatTime(gameState.bestRunTime) : 'N/A';

    // Scenario
    if (gameState.currentScenario) {
        document.getElementById('scenarioName').textContent = gameState.currentScenario.name;
        document.getElementById('scenarioDesc').textContent = gameState.currentScenario.desc;

        const effectsDiv = document.getElementById('scenarioEffects');
        if (effectsDiv.children.length !== gameState.currentScenario.effects.length) {
            effectsDiv.innerHTML = '';
            gameState.currentScenario.effects.forEach(effect => {
                const div = document.createElement('div');
                div.className = 'effect-item';
                div.textContent = effect.display;
                effectsDiv.appendChild(div);
            });
        }
    }

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

function renderDepartments() {
    const container = document.getElementById('departmentsList');
    container.innerHTML = '';

    Object.values(DEPARTMENTS).forEach(dept => {
        const count = gameState.departments[dept.id].count;
        const cost = getDepartmentCost(dept.id);
        const production = getDepartmentProduction(dept.id);
        const canAfford = gameState.chaosPoints >= cost;
        const isUnlocked = dept.unlockRequirement();

        const div = document.createElement('div');
        div.className = isUnlocked ? 'department-item' : 'department-item locked';

        if (isUnlocked) {
            div.innerHTML = `
                <div class="item-header">
                    <span class="item-name">${dept.icon} ${dept.name}</span>
                    <span class="item-count">Owned: ${count}</span>
                </div>
                <div class="item-desc">${dept.desc}</div>
                <div class="item-footer">
                    <span class="item-production">+${formatNumber(dept.baseProduction)}/sec each</span>
                    <button class="buy-button" ${!canAfford ? 'disabled' : ''}>
                        Buy - ${formatNumber(cost)} chaos
                    </button>
                </div>
            `;
            div.querySelector('.buy-button').onclick = () => buyDepartment(dept.id);
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

        container.appendChild(div);
    });
}

function renderUpgrades() {
    const container = document.getElementById('upgradesList');
    container.innerHTML = '';

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
        container.appendChild(div);
    });

    if (container.children.length === 0) {
        container.innerHTML = '<div class="item-desc">All upgrades purchased! Trigger an apocalypse for more.</div>';
    }
}

function renderStocks() {
    const container = document.getElementById('stocksList');
    container.innerHTML = '';

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
        container.appendChild(div);
    });
}

function renderMutations() {
    const container = document.getElementById('mutationsList');
    container.innerHTML = '';

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
        container.appendChild(div);
    });
}

// Initialize game when DOM is ready
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

    document.getElementById('saveButton').addEventListener('click', () => {
        localStorage.setItem('apocalypseCorpSave', JSON.stringify(gameState));
        addLog('Game saved!');
    });

    document.getElementById('loadButton').addEventListener('click', () => {
        const save = localStorage.getItem('apocalypseCorpSave');
        if (save) {
            const loadedState = JSON.parse(save);
            Object.assign(gameState, loadedState);
            gameState.lastTick = Date.now();

            // Re-initialize objects to ensure all data structures exist
            initializeDepartments();
            initializeStocks();
            initializeMutations();

            updateDisplay();
            addLog('Game loaded!');
        } else {
            addLog('No save found!');
        }
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
    }, 30000);

    // Initialize data structures first
    initializeDepartments();
    initializeStocks();
    initializeMutations();

    // Try to load save on start
    const save = localStorage.getItem('apocalypseCorpSave');
    if (save) {
        try {
            const loadedState = JSON.parse(save);
            // Merge loaded state with initialized state
            Object.keys(loadedState).forEach(key => {
                if (key === 'departments' || key === 'stocks' || key === 'mutations') {
                    // Merge objects instead of replacing
                    Object.assign(gameState[key], loadedState[key]);
                } else {
                    gameState[key] = loadedState[key];
                }
            });
            gameState.lastTick = Date.now();

            addLog('Welcome back! Save loaded.');
        } catch (e) {
            console.error('Failed to load save:', e);
            addLog('Failed to load save. Starting fresh.');
        }
    } else {
        addLog('🏢 Welcome to Apocalypse Corp!');
        addLog('💡 Click the ADVANCE DOOMSDAY button to generate Chaos Points.');
        addLog('💡 Use Chaos Points to hire departments that automate chaos generation.');
        addLog('💡 Advance the clock to midnight to trigger your first apocalypse!');
    }

    // Initialize scenario if not loaded
    if (!gameState.currentScenario) {
        selectScenario();
    }

    // Add mobile collapse functionality
    if (window.innerWidth <= 1024) {
        setupMobileCollapse();
    }

    // Start game loop
    updateDisplay();
    setInterval(gameTick, 100);
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

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}