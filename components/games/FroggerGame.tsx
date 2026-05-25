'use client';

import { useEffect, useRef } from 'react';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface FroggerGameProps {
  paused: boolean;
  skinKey?: string;
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onLevelChange: (level: number) => void;
  onGameOver: (finalScore: number) => void;
}

// ── Grid constants ────────────────────────────────────────────────────────────

const COLS = 16;
const ROWS = 14;
const CELL = 40; // px
const CANVAS_W = COLS * CELL; // 640
const CANVAS_H = ROWS * CELL; // 560

// Row indices (0 = top)
const ROW_GOALS = 0;
const ROW_RIVER_TOP = 1;
const ROW_RIVER_BOT = 6;
const ROW_SAFE_MID = 7;
const ROW_ROAD_TOP = 8;
const ROW_ROAD_BOT = 12;
const ROW_START = 13;

const ROUND_TIME = 15; // seconds per round (decreases with level)
const JUMP_MS = 120; // animation duration in ms

// ── Local types ───────────────────────────────────────────────────────────────

type Direction = 'up' | 'down' | 'left' | 'right';

interface Entity {
  col: number; // fractional column position (can be negative when wrapping)
  width: number; // in cells
  type: 'car' | 'truck' | 'log' | 'turtle';
  submerged?: boolean;
  submergeTimer?: number; // ms elapsed in current submersion cycle
}

interface Lane {
  row: number;
  speed: number; // cells per second
  dir: 1 | -1;
  entities: Entity[];
}

interface Frog {
  col: number;
  row: number;
  animating: boolean;
  animT: number; // ms elapsed since jump started
  targetCol: number;
  targetRow: number;
}

// ── Component placeholder (game logic added in subsequent steps) ──────────────

export default function FroggerGame({
  paused,
  skinKey = 'classic',
  onScoreChange,
  onLivesChange,
  onLevelChange,
  onGameOver,
}: FroggerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Game loop will be wired here in Step 4
    void paused;
    void skinKey;
    void onScoreChange;
    void onLivesChange;
    void onLevelChange;
    void onGameOver;
  }, [
    paused,
    skinKey,
    onScoreChange,
    onLivesChange,
    onLevelChange,
    onGameOver,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{ display: 'block', width: '100%', imageRendering: 'pixelated' }}
    />
  );
}

// Re-export types needed by play-page
export type { Direction, Entity, Lane, Frog };
