# Apocalypse Corp

**End Times Management Simulator** - An incremental game where you run a corporation dedicated to monetizing the downfall of humanity.

## Play Now

Simply open `index.html` in your web browser to start playing!

## About

Apocalypse Corp is a dark comedy incremental/idle game where you:
- **Click** to generate Chaos Points
- **Hire departments** to automate chaos generation (Meteor Sales, Biohazard R&D, Nuclear Division, etc.)
- **Purchase upgrades** to boost your efficiency
- **Trigger apocalypses** to reset with powerful permanent mutations
- **Trade stocks** in the Doom Stock Market for bonus income
- **Navigate random scenarios** that change the rules each run

## Features

- **8 Unique Departments** - From lowly Interns to Temporal Paradox Bureaus
- **Multiple Prestige Layers** - Apocalypse Tokens unlock powerful mutations
- **Stock Market Mini-Game** - Invest in corporations profiting from doom
- **Random Scenarios** - Zombie Plagues, Alien Invasions, Climate Collapse, and more
- **AI Assistant** - In-game companion with customizable personality settings
- **Dark Corporate Theme** - Complete with satirical HR memos and office aesthetics
- **Auto-Save** - Your progress is automatically saved every 30 seconds

## Tech Stack

| Layer | Technology |
|-------|------------|
| Core | Pure HTML5, CSS3, Vanilla JavaScript |
| Storage | LocalStorage (auto-save every 30 seconds) |
| Audio | Web Audio API (procedural sound effects) |
| Dependencies | None - completely self-contained |

## Project Structure

```
apocalypse-corp/
├── index.html          # Main HTML - game UI structure
├── style.css           # ~2,500 lines of styling (themes, animations)
├── game.js             # ~7,100 lines - monolithic game logic (standalone)
├── README.md           # This file
└── js/                 # ES Modules version (optional modular structure)
    ├── main.js         # Entry point - re-exports all modules
    ├── state.js        # Central game state object (~180 lines)
    ├── constants.js    # Game data definitions (~1,700 lines)
    └── utils.js        # Utility functions (~170 lines)
```

### Dual Architecture Support

The codebase supports two loading methods:

**Traditional Script Loading (default):** `game.js` is a self-contained ~7,100 line file loaded directly via `<script>` tag.

**ES Modules (optional):** The `js/` folder provides a modular structure:
- `state.js` - Central `gameState` object with all game variables
- `constants.js` - Static data definitions (departments, upgrades, mutations, etc.)
- `utils.js` - Helper functions (`formatNumber`, `escapeHtml`, `playSound`, etc.)
- `main.js` - Entry point that re-exports all modules

```javascript
// ES Module usage example:
import { gameState, DEPARTMENTS, formatNumber } from './js/main.js';
```

## Core Game Systems

| System | Description |
|--------|-------------|
| Departments | 8 purchasable units that generate Chaos Points passively |
| Upgrades | Power-ups that boost clicking and production |
| Mutations | Permanent upgrades earned through prestige (apocalypse) |
| Stock Market | Mini-game for trading doom-themed stocks |
| Scenarios | Random modifiers that change gameplay each run |
| Challenges | Timed objectives for bonus rewards |
| AI Assistant | In-game companion with personality settings |
| Achievements | Unlockable rewards based on milestones |

## State Management

The `gameState` object is the single source of truth, containing:
- **Resources**: `chaosPoints`, `doomEnergy`, `apocalypseTokens`
- **Owned items**: departments, upgrades, mutations, stocks
- **Statistics**: lifetime stats, session stats, run-specific data
- **Active systems**: challenges, crises, events, projects
- **User preferences**: theme, sound settings, AI assistant configuration

## Game Mechanics

### Resources
- **Chaos Points**: Main currency, earned by clicking and from departments
- **Doom Energy**: Passive bonus that generates chaos over time
- **Apocalypse Tokens**: Premium currency earned by triggering apocalypses

### Progression
1. **Early Game**: Click to earn chaos, hire departments
2. **Mid Game**: Purchase upgrades, unlock more departments
3. **Late Game**: Trigger apocalypses, unlock mutations, explore scenarios
4. **End Game**: Optimize strategies across multiple prestige layers

### Mutations (Permanent Upgrades)
- **Nuclear Winter**: Start with 10% of previous production
- **AI Optimization**: +25% production permanently
- **Zombie Workforce**: 20% cheaper departments
- **Temporal Loop**: +50% Apocalypse Tokens
- **Cosmic Insight**: Clicking generates chaos based on passive income

## Getting Started

1. Click the **ADVANCE DOOMSDAY** button to generate Chaos Points
2. Hire your first **Intern of Disaster** for 10 Chaos Points
3. Continue hiring departments to automate chaos generation
4. Advance the doomsday clock to midnight to trigger your first apocalypse
5. Earn Apocalypse Tokens to unlock permanent mutations

## Theme

The game combines dark comedy with corporate satire, featuring:
- Absurd department names and descriptions
- "Professional" UI for world-ending activities
- Satirical take on corporate culture meeting doomsday scenarios
- Inspired by games like Cookie Clicker, Universal Paperclips, and NGU Idle

## Contributing

Feel free to fork this project and submit pull requests! Some ideas for contributions:
- New departments and upgrades
- Additional apocalypse scenarios
- More mutation types
- UI/UX improvements
- Sound effects and music

## License

This project is open source and available for anyone to use, modify, and distribute.

## Play Tips

- Early game focuses on clicking and buying the first few departments
- Upgrades are crucial - they provide massive multipliers
- Don't trigger apocalypses too early - wait until you have enough chaos for good token rewards
- The stock market is risky but can provide significant passive income
- Different scenarios favor different strategies - adapt your approach!

---

**Made for incremental game enthusiasts**

Enjoy ending the world, one fiscal quarter at a time!