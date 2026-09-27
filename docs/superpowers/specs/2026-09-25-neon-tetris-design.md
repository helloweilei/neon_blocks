# Neon Tetris Design

## Goal

Create one self-contained, playable Tetris game with selectable difficulty and board-size presets in a neon science-fiction visual style.

## User experience

- The page opens to a dark, arcade-like play screen with a glowing cyan and violet palette.
- The game offers Easy, Normal, and Hard difficulty. Difficulty sets the initial automatic drop interval; cleared rows continue to increase the pace.
- Before a round, the player can choose a board-size preset independently of difficulty: Small (8 columns × 16 rows), Classic (10 × 20), or Large (12 × 24). Changing size during a round starts a fresh board at that size.
- Before starting, the player can select a board-size preset and difficulty. The play screen shows the board, its current dimensions, score, cleared-row count, selected difficulty, and next-piece preview.
- The player can start, pause, resume, and restart. A game-over state explains the result and offers a restart.
- Keyboard controls: left/right arrows move, up arrow rotates, down arrow soft-drops, Space hard-drops, and P pauses or resumes.

## Implementation approach

Use a single standalone HTML page with Canvas rendering and plain JavaScript, so it can be opened directly without installing dependencies. Keep game state and rules (piece movement, collision, rotation, locking, row clearing, score, speed, and selected board dimensions) separate from rendering and input handling. Derive board drawing and cell size from the selected preset. CSS supplies the responsive neon interface and controls reference.

## Acceptance criteria

- The page runs without a build step or external dependency.
- All seven standard tetrominoes spawn and can be moved, rotated, dropped, and locked within board bounds.
- Full rows clear, score and row count update, and the next preview advances.
- Each difficulty has a visibly distinct starting drop speed.
- All three board-size presets use the selected dimensions for collision, spawning, row clearing, and board drawing.
- Pause freezes automatic falling; restart returns to a clean board; topping out ends the round.
- The board and controls remain usable at common desktop and narrow viewport widths.

## Scope

One single-player game. No sound, online scores, mobile touch controls, or alternate rule sets are included in this version.
