/**
 * Utility Functions Module
 * Helper functions used throughout the game
 */

import { gameState } from './state.js';

/* =============================================================================
   PERFORMANCE MONITORING
   ============================================================================= */

/** Performance monitoring for debugging */
export const performanceMonitor = {
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
        return {
            fps: this.fps,
            cacheHitRate: 'n/a'
        };
    }
};

/* =============================================================================
   GENERAL UTILITIES
   ============================================================================= */

/** Debounce utility for button clicks */
export function debounce(func, wait) {
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

/** Format large numbers with suffixes */
export function formatNumber(num) {
    if (num >= 1e18) return (num / 1e18).toFixed(2) + 'Qi';
    if (num >= 1e15) return (num / 1e15).toFixed(2) + 'Qa';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Math.floor(num).toLocaleString();
}

/** Get color class based on number magnitude */
export function getNumberColor(num) {
    if (num >= 1e15) return 'color-qi';
    if (num >= 1e12) return 'color-qa';
    if (num >= 1e9) return 'color-t';
    if (num >= 1e6) return 'color-b';
    if (num >= 1e3) return 'color-m';
    return 'color-k';
}

/** Escape HTML to prevent injection when rendering user-controlled text */
export function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/** Format milliseconds to human readable time */
export function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return seconds + 's';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ' + (seconds % 60) + 's';
    const hours = Math.floor(minutes / 60);
    return hours + 'h ' + (minutes % 60) + 'm';
}

/** Add a message to the event log */
export function addLog(message) {
    const eventLog = document.getElementById('eventLog');
    if (!eventLog) return;

    const event = document.createElement('div');
    event.className = 'event-item';
    event.textContent = message;
    eventLog.insertBefore(event, eventLog.firstChild);

    while (eventLog.children.length > 50) {
        eventLog.removeChild(eventLog.lastChild);
    }
}

/* =============================================================================
   SOUND SYSTEM
   ============================================================================= */

/** Play a sound effect */
export function playSound(soundName, volume = 0.3) {
    if (!gameState.soundEnabled) return;

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const sounds = {
            click: { freq: 440, type: 'sine', duration: 0.1 },
            upgrade: { freq: 660, type: 'triangle', duration: 0.2 },
            apocalypse: { freq: 220, type: 'sawtooth', duration: 0.5 },
            achievement: { freq: 880, type: 'sine', duration: 0.3 },
            critical: { freq: 550, type: 'square', duration: 0.15 },
            combo: { freq: 440 + (gameState.comboCount * 20), type: 'sine', duration: 0.1 },
            error: { freq: 200, type: 'square', duration: 0.2 },
            buy: { freq: 523, type: 'triangle', duration: 0.15 }
        };

        const sound = sounds[soundName] || sounds.click;
        oscillator.frequency.value = sound.freq;
        oscillator.type = sound.type;
        gainNode.gain.value = volume;

        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
        oscillator.stop(audioContext.currentTime + sound.duration);
    } catch (e) {
        // Audio not supported
    }
}