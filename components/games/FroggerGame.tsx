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
const TURTLE_VISIBLE_MS = 3000;
const TURTLE_SUBMERGED_MS = 1500;

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

// ── Lane builder ─────────────────────────────────────────────────────────────

function buildLanes(level: number): Lane[] {
  const scale = Math.pow(1.15, level - 1);

  function roadLane(
    row: number,
    dir: 1 | -1,
    baseSpeed: number,
    defs: { col: number; width: number; type: 'car' | 'truck' }[],
  ): Lane {
    return {
      row,
      speed: baseSpeed * scale,
      dir,
      entities: defs.map((d) => ({ ...d })),
    };
  }

  function riverLane(
    row: number,
    dir: 1 | -1,
    baseSpeed: number,
    defs: { col: number; width: number; type: 'log' | 'turtle' }[],
  ): Lane {
    return {
      row,
      speed: baseSpeed * scale,
      dir,
      entities: defs.map((d) =>
        d.type === 'turtle'
          ? { ...d, submerged: false, submergeTimer: 0 }
          : { ...d },
      ),
    };
  }

  return [
    // ── Road (rows 8–12, bottom to top) ──
    roadLane(12, 1, 0.04, [
      { col: 0, width: 1, type: 'car' },
      { col: 5, width: 1, type: 'car' },
      { col: 10, width: 1, type: 'car' },
    ]),
    roadLane(11, -1, 0.055, [
      { col: 0, width: 3, type: 'truck' },
      { col: 9, width: 3, type: 'truck' },
    ]),
    roadLane(10, 1, 0.05, [
      { col: 0, width: 2, type: 'car' },
      { col: 6, width: 2, type: 'car' },
      { col: 12, width: 2, type: 'car' },
    ]),
    roadLane(9, -1, 0.07, [
      { col: 0, width: 3, type: 'truck' },
      { col: 6, width: 1, type: 'car' },
      { col: 11, width: 3, type: 'truck' },
    ]),
    roadLane(8, 1, 0.065, [
      { col: 0, width: 1, type: 'car' },
      { col: 4, width: 1, type: 'car' },
      { col: 8, width: 1, type: 'car' },
      { col: 12, width: 1, type: 'car' },
    ]),
    // ── River (rows 1–6, bottom to top) ──
    riverLane(6, 1, 0.035, [
      { col: 0, width: 3, type: 'log' },
      { col: 6, width: 3, type: 'log' },
      { col: 12, width: 2, type: 'log' },
    ]),
    riverLane(5, -1, 0.04, [
      { col: 1, width: 2, type: 'turtle' },
      { col: 7, width: 2, type: 'turtle' },
      { col: 12, width: 2, type: 'turtle' },
    ]),
    riverLane(4, 1, 0.05, [
      { col: 0, width: 4, type: 'log' },
      { col: 8, width: 4, type: 'log' },
    ]),
    riverLane(3, -1, 0.045, [
      { col: 0, width: 3, type: 'turtle' },
      { col: 6, width: 3, type: 'turtle' },
      { col: 12, width: 2, type: 'turtle' },
    ]),
    riverLane(2, 1, 0.055, [
      { col: 0, width: 3, type: 'log' },
      { col: 8, width: 4, type: 'log' },
    ]),
    riverLane(1, -1, 0.04, [
      { col: 0, width: 2, type: 'turtle' },
      { col: 5, width: 2, type: 'turtle' },
      { col: 11, width: 2, type: 'turtle' },
    ]),
  ];
}

// ── Round timer helper ────────────────────────────────────────────────────────

function roundTime(level: number): number {
  return Math.max(5, ROUND_TIME - (level - 1) * 0.5);
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
