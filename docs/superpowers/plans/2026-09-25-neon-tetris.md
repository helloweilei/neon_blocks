# Neon Tetris Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-contained neon-style Tetris game with three selectable difficulty settings.

**Architecture:** A standalone HTML page contains the page shell, styles, and Canvas entry point. JavaScript game rules own the board, pieces, collisions, score, and timer; rendering and input translate that state to the UI. No dependencies or build step.

**Tech Stack:** HTML, CSS, Canvas 2D, plain JavaScript.

---

## File map

- Create `index.html`: semantic UI, Canvas board, score/row/difficulty fields, controls and preview surface.
- Create `styles.css`: responsive dark neon interface and board presentation.
- Create `game.js`: tetromino definitions, state transitions, collision, lock/clear/scoring, timers, input and Canvas rendering.

## Board-size presets addition

### Task 4: Add selectable board dimensions

**Files:** Modify `index.html`, `styles.css`, and `game.js`.

- [x] Add Small (8 × 16), Classic (10 × 20), and Large (12 × 24) size buttons, independent of difficulty, and show the active dimensions above the board.
- [x] Replace fixed column and row rules with selected dimensions for grid allocation, collision, piece spawn position, and row clearing.
- [x] Keep the board display footprint fixed at 300 × 600 and derive cell size from the chosen column count; all three presets use a 1:2 board ratio.
- [x] Selecting a different size updates the dimensions immediately and starts a clean round when a round is active; starting or restarting uses the selected preset.
- [ ] Inspect the three layouts and manually confirm the displayed dimensions and board proportions in a browser.

### Task 1: Create the standalone page shell

**Files:** Create `index.html`, `styles.css`, `game.js`.

- [x] Add semantic game layout with board Canvas, next-piece Canvas, three difficulty buttons, score and row counters, game status, and start/pause/restart controls.
- [x] Add responsive neon styling with keyboard instructions visible in the page.
- [x] Load `game.js` as a module and initialize a clean board with an idle status.
- [ ] Open the page locally and confirm it loads without a build step or console errors.

### Task 2: Implement game rules and selectable difficulty

**Files:** Modify `game.js`.

- [x] Define the standard seven tetromino shapes and color palette.
- [x] Add board state and functions for collision detection, movement, clockwise rotation, soft drop, hard drop, locking, row clearing, and top-out.
- [x] Add score and cleared-row updates, next-piece preview state, and difficulty intervals for Easy, Normal, and Hard.
- [x] Add a timer loop that pauses cleanly and increases drop speed as rows are cleared.
- [ ] Verify the page supports all seven pieces, three speeds, valid board boundaries, row clearing, scoring, and top-out.

### Task 3: Connect rendering and controls

**Files:** Modify `game.js`, `styles.css`.

- [x] Draw the board grid, locked blocks, active piece, and next-piece preview on Canvas with neon highlights.
- [x] Wire left/right arrows, up arrow, down arrow, Space, and P to the specified actions while preventing browser scrolling for game keys.
- [x] Wire difficulty selection, start, pause/resume, and restart controls; update score, rows, status, and selected difficulty in the UI.
- [x] Add game-over overlay/status and a restart action.
- [ ] Check desktop and narrow-width layouts, and manually play through movement, pause, restart, line clear, and game-over flows.
