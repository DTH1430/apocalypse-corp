# Apocalypse Corp - Changelog v2.0

## Bug Fixes

### 1. **Fixed Department Production Reset Logic**
- **Issue:** Department base production was incorrectly divided during apocalypse reset
- **Fix:** Completely rewrote apocalypse reset logic to properly track and reset department counts without corrupting base production values
- **Impact:** Prevents game-breaking bugs during prestige runs

### 2. **Stock Price Edge Cases**
- **Issue:** Stock prices could drop to 10 chaos minimum or grow infinitely
- **Fix:** Added price bounds (10%-300% of base price) to prevent extreme fluctuations
- **Impact:** More balanced stock market gameplay

### 3. **Save Version Migration**
- **Issue:** No version tracking meant future updates could break old saves
- **Fix:** Added `saveVersion` field (currently v2) with migration logic for old saves
- **Impact:** Future-proof save system

---

## Major Enhancements

### 1. **Achievement System** 🏆
Added 13 unique achievements with real gameplay rewards:

**Progression Achievements:**
- 👆 First Steps - Click once
- 💪 Click Master - 100 clicks (+10% click power)
- 🔥 Click Legend - 1000 clicks (+25% click power)
- 📋 First Hire - Hire first department
- 🏢 Full Roster - Hire all departments (+10% production)

**Apocalypse Achievements:**
- 💀 The End Begins - First apocalypse
- 🌋 Veteran Ender - 10 apocalypses (+5% tokens)
- ☄️ Master of Destruction - 50 apocalypses (+10% tokens)

**Economic Achievements:**
- 💰 Chaos Millionaire - 1M chaos in one run
- 💎 Chaos Billionaire - 1B chaos (+5% production)
- 📈 Wolf of Doom Street - 100 total shares (+5% dividends)

**Special Achievements:**
- ⚡ Speed Demon - Apocalypse under 5 minutes (+10% starting chaos)
- ☢️ Ultimate Evolution - Unlock all mutations

**New Tab:** Achievements tab shows progress (X/13 unlocked) with locked/unlocked states

---

### 2. **Offline Progress Calculation** ⏰
- Tracks time since last save
- Grants 50% efficiency chaos generation while offline
- Maximum 4 hours of offline progress (prevents exploits)
- Displays welcome back message with time away and earnings

**Example:**
```
⏰ Welcome back! You were offline for 2h 15m
💰 Earned 4.5M chaos points while away (50% efficiency)
```

---

### 3. **Import/Export Save System** 📤📥
- **Export:** Download save as JSON file with timestamp
- **Import:** Load save from file with error handling
- Complements existing Save/Load buttons
- Enables save backup and sharing

**New Buttons:**
- 📤 Export Save
- 📥 Import Save

---

### 4. **Sound System** 🔊
Simple Web Audio API-based sound effects:
- **Click sound:** Brief 800Hz beep on doom button click
- **Achievement sound:** Musical chime (C5 → E5) on unlock
- **Purchase sound:** 440Hz confirmation tone

**Features:**
- Toggle button (🔊 Sound ON / 🔇 Sound OFF)
- Lightweight (no audio files needed)
- Respects user preference in save

---

### 5. **Notification System** 📢
Pop-up notifications for important events:
- Achievement unlocks
- Save/load confirmations
- Appears top-right with smooth animations
- Auto-dismisses after 4 seconds
- Golden title with descriptive message

**Styling:**
- Corporate apocalypse theme (red gradient, gold accents)
- Slide-in from top animation
- Mobile responsive (full width on small screens)

---

## Gameplay Balance Changes

### Achievement Bonuses Applied:
1. **Click Power Multipliers:**
   - Click Master: +10% (stacks)
   - Click Legend: +25% (stacks)
   - Total: +35% permanent click power

2. **Production Multipliers:**
   - Full Roster: +10% all departments
   - Chaos Billionaire: +5% all production
   - Total: +15.5% combined

3. **Token Multipliers:**
   - Veteran Ender: +5%
   - Master of Destruction: +10%
   - Total: +15.5% combined

4. **Special Bonuses:**
   - Speed Demon: +10% starting chaos on apocalypse
   - Wolf of Doom Street: +5% stock dividends

---

## Technical Improvements

### State Tracking:
Added new gameState fields:
- `saveVersion`: For migration tracking
- `totalClicks`: Track all clicks (for achievements)
- `totalChaosEarned`: Lifetime chaos generation
- `lastSaveTime`: For offline progress calculation
- `soundEnabled`: User preference
- `achievements`: Achievement unlock states

### Code Structure:
- `checkAchievements()`: Centralized achievement checking
- `showNotification()`: Reusable notification system
- `playSound()`: Web Audio API sound generator
- `calculateOfflineProgress()`: Offline earnings calculator
- `renderAchievements()`: Achievement UI renderer

### Save Migration:
Automatically migrates v1 saves to v2:
```javascript
if (!loadedState.saveVersion || loadedState.saveVersion < 2) {
    // Add new fields with defaults
    // Preserve existing progress
}
```

---

## UI/UX Improvements

### New UI Elements:
1. **Achievements Tab** - 5th tab in center panel
2. **Progress Bar** - Visual achievement completion tracker
3. **Notification Pop-ups** - Top-right corner alerts
4. **Sound Toggle** - Footer button
5. **Import/Export** - Footer buttons

### Visual Feedback:
- Achievement unlock notifications with sound
- Save confirmation notifications
- Offline progress welcome message
- Achievement status indicators (✓/🔒)

### Mobile Optimizations:
- Wrapped footer buttons
- Smaller notification on mobile
- Tab buttons wrap on small screens
- All new features responsive

---

## Stats

**Lines of Code:**
- Game.js: +400 lines (achievements, sounds, offline)
- Style.css: +120 lines (notifications, achievement styles)
- Index.html: +10 lines (new tabs, buttons)

**Total New Features:** 8 major systems
**Total Achievements:** 13 unlockable
**Total Bug Fixes:** 3 critical issues

---

## How to Use New Features

### Achievements:
1. Click "ACHIEVEMENTS" tab
2. Complete requirements to unlock
3. Unlocked achievements grant permanent bonuses

### Offline Progress:
- Simply close the game
- Come back within 4 hours for max benefit
- Automatically calculated on load

### Import/Export:
- **Export:** Click "📤 Export Save" to download backup
- **Import:** Click "📥 Import Save" to load from file

### Sound:
- Click "🔊 Sound ON" to toggle sound effects
- Preference saved automatically

---

## Breaking Changes
**None** - All changes are backwards compatible with v1 saves via automatic migration.

---

## Future Recommendations

1. **More Achievements:** Add 10-20 more with varied requirements
2. **Achievement Categories:** Group by type (combat, economy, speed, etc.)
3. **Sound Options:** Volume slider instead of just on/off
4. **Statistics Page:** Detailed lifetime stats tracking
5. **Prestige Upgrades:** More mutation variety
6. **Cloud Saves:** Optional online save backup
7. **Leaderboards:** Compare apocalypse counts/speeds
8. **Themes:** Unlockable UI color schemes

---

Generated: 2025-10-01
Version: 2.0
