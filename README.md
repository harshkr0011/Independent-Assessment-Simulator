# 🧠 Accenture Cognitive Assessment Simulator & Shortlist Predictor

A state-of-the-art, independent corporate cognitive assessment practice simulator and shortlist probability predictor designed to prepare candidates for fresher placement assessments (such as Accenture, Cognizant, TCS, and Deloitte).

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5.1-646cff.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)
![Solvability](https://img.shields.io/badge/BFS_Solvability-100%25_Guaranteed-emerald.svg)

> **⚠️ Disclaimer:** This repository is an independent practice simulator built solely for educational and training purposes. It is not affiliated with, sponsored by, or endorsed by Accenture or any assessment provider. No copyrighted test assets or proprietary logos are used.

---

## 🌟 Key Features & Assessment Modules

### ⚡ 1. Quick Math (Numeracy & Speed)
- **Ascending Value Selection**: Calculate arithmetic expressions mentally and click dynamic floating bubbles in strictly **ASCENDING numerical value order** (Lowest → Highest).
- **5 Progressive Difficulty Levels**:
  - **Level 1**: Basic addition & subtraction (+, -) with small integers.
  - **Level 2**: Multiplication & division (×, ÷).
  - **Level 3**: Decimals and fractions.
  - **Level 4**: Parentheses and PEMDAS order of operations.
  - **Level 5**: Complex mixed operations with distractor values.
- **Micro-Animations & Streak Bonuses**: Floating 2D bubble physics with Web Audio sound effects and streak multipliers.

### 🧩 2. Path Finder (3×3 Grid Spatial Reasoning)
- **3×3 Sub-Block Grid Builder**: Manipulate 3×3 sub-blocks inside 6×6 and 9×9 grids to form an unbroken continuous path from **Start (🚀)** on the left edge to **Destination (🪐)** on the right edge.
- **Tile Controls**: Click any 3×3 block to **Rotate 90° Clockwise** or **Change Layout** (re-route arrow directions without changing black-cell positions).
- **Standardized 4-Minute Timer**: Assessment timer strictly calibrated to Accenture standardized exam rules.
- **BFS Solvability Guaranteed**: 100% of procedurally generated puzzles are pre-validated via graph Breadth-First Search (BFS) before display.

### 🔑 3. Key & Door (Logical Planning & Memory Maze)
- **Scale Mazes (4×4 to 8×8 Master Grid)**: Navigate your player avatar (**👤**) step-by-step using Keyboard Arrow Keys (⬆️ ⬇️ ⬅️ ➡️ / WASD) or touch screen D-Pad controls.
- **Invisible Obstacles & Memory Bounce**: Memory maze with **HIDDEN / INVISIBLE obstacles**. Hitting an invisible wall or locked door resets your attempt back to the dark center start square (**👤**).
- **Key Pickup (🔑) & Door Unlock (🚪)**: Collect the key (🔑) first before heading to the exit door (🚪).
- **State-Space BFS Solver**: Pre-verifies `(row, col, keysMask)` path solvability.

### 🏆 4. Full Mock Assessment Simulation & Shortlist Predictor
- **Automated 3-Section Exam Flow**: Sequentially executes **Quick Math** → **Path Finder** → **Key & Door** with section transition modals and strict timer budgets.
- **Accenture Assessment Algorithm Breakdown**:
  1. **Accuracy Cutoff Baseline**: Calculates selection probability against Accenture's standard 18+ correct question target cutoff (e.g. 18/25 cutoff baseline).
  2. **Speed Tie-Breaker**: Analyzes average time per question (e.g. 6.8s/Q) to evaluate tie-breaker advantage against identical raw scores.
  3. **Non-Competitive Absolute Scoring**: Evaluates candidate performance against sectional benchmark targets.
- **Seeded RNG (`?seed=12345`)**: Mulberry32 pseudo-random generator allowing deterministic assessment reproduction and sharing.

### ☀️ / 🌙 5. Seamless Light & Dark Theme Engine
- **Corporate Light Mode**: High-contrast, clean slate aesthetic with dark slate typography (`text-slate-900`) and border demarcation.
- **Glassmorphic Dark Mode**: Modern dark theme (`dark:bg-slate-950`) with high-contrast text and glowing accents.
- **Interactive Sun ☀️ / Moon 🌙 Toggle**: Available across top Navigation and Assessment Header bars.

### 📊 6. Performance Dashboard & Level-by-Level Improvement Analytics
- **Detailed Attempt History**: Tracks exact `Time Spent ⏱️` per round (e.g. `14.8s`), accuracy %, score, and date.
- **Level-by-Level Progress Breakdown**: Tracks attempts, average solve speed, best score, and skill growth badges (`⚡ Speed Foundation`, `🧮 Numeracy Master`, `👑 Accenture Champion`) across Levels 1 to 6.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite 5, JavaScript (ES6+)
- **Styling**: Tailwind CSS 3, Vanilla CSS glassmorphic tokens
- **Icons**: Lucide React
- **Audio Engine**: Web Audio API synthesizer for UI sound effects
- **State & Storage**: React Context API (`GameContext`), LocalStorage Service (`storageService.js`)
- **Algorithms**: Breadth-First Search (BFS) graph solver, Mulberry32 Seeded Pseudo-Random Number Generator

```
accenture practice bubble game/
├── public/
├── src/
│   ├── App.jsx                 # React root & view router
│   ├── main.jsx                # React DOM mount
│   ├── index.css               # Tailwind directives & corporate card CSS tokens
│   ├── context/
│   │   └── GameContext.jsx     # Global state provider (active mode, timer, seed, theme)
│   ├── components/
│   │   ├── layout/             # Navigation, Footer, Disclaimer banner
│   │   └── common/             # AssessmentHeader, Timer, ProgressBar, ConfirmationModal
│   ├── games/
│   │   ├── quickMath/          # QuickMathGame & mathGenerator (Levels 1-5)
│   │   ├── pathFinder/         # PathFinderGame, tileGenerator & pathValidator (BFS)
│   │   └── keyDoor/            # KeyDoorGame, mazeGenerator & pathSolver (State BFS)
│   ├── pages/                  # Landing, Dashboard, Selection, Instructions, Mock, Results, Dev
│   ├── services/
│   │   ├── seedRng.js          # Mulberry32 seeded pseudo-random number generator
│   │   ├── storageService.js   # LocalStorage persistence & metrics calculator
│   │   ├── scoringEngine.js    # Composite weighted scoring algorithm
│   │   └── audioEngine.js      # Web Audio synthesizer for UI sound effects
│   └── tests/
│       └── runTests.js         # Automated unit test suite
├── .gitignore                  # Production git ignore configuration
├── index.html                  # HTML entry point
├── package.json                # Dependencies and build scripts
├── tailwind.config.js          # Tailwind configuration (darkMode: 'class')
└── vite.config.js              # Vite bundler configuration
```

---

## 🚀 Getting Started & Local Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### Installation Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/accenture-cognitive-assessment-simulator.git
   cd accenture-cognitive-assessment-simulator
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Run Unit Tests**:
   ```bash
   npm test
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```
   The production-ready bundle will be generated in the `dist/` directory.

---

## 📐 Scoring Formula Breakdown

Final scores are computed using a weighted composite scoring formula:

$$\text{Final Score} = (\text{Accuracy} \times 0.50) + (\text{Speed Rating} \times 0.25) + (\text{Efficiency Rating} \times 0.25)$$

- **Accuracy (50%)**: Percentage of correct questions or solved maze paths.
- **Speed Rating (25%)**: Ratio of user completion time against standard target time budget.
- **Efficiency Rating (25%)**: Ratio of optimal moves/rotations versus user actual moves/rotations.

---

## 🛠️ Developer Debugger (`/dev`)

Access the developer debugger by clicking the `<>` code icon in the top navigation bar or visiting `/dev`:
- **Engine Inspection**: Test Quick Math, Path Finder, and Key & Door maze generation on demand.
- **BFS Solvability JSON**: Inspect generated board states, optimal move counts, solution path array sequences, and seed validation output.

---

## 💾 Data Storage & Persistence

All practice attempt history, high scores, level progression, and theme preferences are stored **100% locally** in your browser's `window.localStorage`. No external database server is required, ensuring complete privacy.

### LocalStorage Keys Used:
1. `cognitive_challenge_attempts_v1`: Stores an array of your recent practice attempts (score, accuracy %, time spent in seconds, date & time, game mode, level).
2. `cognitive_challenge_personal_bests_v1`: Stores high score records and average solve times per game module.
3. `cognitive_challenge_settings_v1`: Stores user settings (`darkMode: true/false`, sound enabled/disabled, animation preferences).

---

## 🌐 Netlify Deployment Settings

This project includes a pre-configured [`netlify.toml`](file:///c:/Users/Rakul/Desktop/accenture%20practice%20bubble%20game/netlify.toml) file for seamless zero-config deployment on Netlify.

### Build Configuration:
- **Project Name**: `Independent-Assessment-Simulator`
- **Branch to Deploy**: `main`
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **SPA Rewrite Rule**: `/* -> /index.html (200)`

---

## 📄 License & Terms

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute for personal practice and educational purposes.
