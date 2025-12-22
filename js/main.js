/**
 * Apocalypse Corp - ES Modules Entry Point
 * 
 * This module serves as the central export point for the modular game structure.
 * The original game.js remains functional as a standalone file.
 * 
 * Module Structure:
 * - state.js: Central game state object
 * - constants.js: Game data definitions (DEPARTMENTS, UPGRADES, etc.)
 * - utils.js: Utility functions (formatNumber, escapeHtml, etc.)
 * - main.js: Entry point and re-exports (this file)
 * 
 * Usage:
 *   For ES Module projects:
 *     import { gameState, DEPARTMENTS, formatNumber } from './js/main.js';
 *   
 *   For traditional script loading:
 *     Continue using game.js directly
 */

// Core state
export { gameState } from './state.js';

// Game data constants
export {
    DEPARTMENTS,
    UPGRADES,
    MUTATIONS,
    SPECIALIZATIONS,
    SYNERGIES,
    SCENARIOS,
    STOCKS,
    APOCALYPSE_TYPES,
    RANDOM_EVENTS,
    DOOM_PROJECTS,
    CHALLENGES,
    ACHIEVEMENTS,
    ASSISTANT_DIALOGUES,
    VOICE_CONFIGS,
    setFormatNumber
} from './constants.js';

// Utility functions
export {
    performanceMonitor,
    debounce,
    formatNumber,
    getNumberColor,
    escapeHtml,
    formatTime,
    addLog,
    playSound
} from './utils.js';

// Initialize formatNumber in constants module for proper number formatting in event effects
import { setFormatNumber } from './constants.js';
import { formatNumber } from './utils.js';
setFormatNumber(formatNumber);

// Version info
export const MODULE_VERSION = '1.0.0';

console.log('%c🏢 Apocalypse Corp - ES Modules v' + MODULE_VERSION, 'font-size: 14px; color: #4fc3f7;');
console.log('%cModules available: state, constants, utils', 'color: #888;');
