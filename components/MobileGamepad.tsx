'use client';

import { useRef } from 'react';
import Link from 'next/link';

interface KeyMap {
  up?: string;
  down?: string;
  left?: string;
  right?: string;
  a?: string;
  b?: string;
}

interface MobileGamepadProps {
  keyMap: KeyMap;
  paused: boolean;
  onPauseToggle: () => void;
  skin: string;
  onSkinChange: (skin: string) => void;
  backHref: string;
}

const SKIN_OPTIONS = [
  { key: 'classic', label: 'Classic' },
  { key: 'retro', label: 'Retro' },
  { key: 'neon', label: 'Neon' },
];

// Derive e.code from e.key so games that read e.code also work
function keyToCode(key: string): string {
  if (key === ' ') return 'Space';
  if (key === 'Shift') return 'ShiftLeft';
  if (key.startsWith('Arrow')) return key;
  if (key.length === 1) return `Key${key.toUpperCase()}`;
  return key;
}

function dispatchKey(key: string, type: 'keydown' | 'keyup') {
  const code = keyToCode(key);
  const init: KeyboardEventInit = {
    key,
    code,
    bubbles: true,
    cancelable: true,
  };
  // Dispatch only on document — bubbles:true propagates up to window automatically,
  // so both document.addEventListener and window.addEventListener listeners receive it.
  // Dispatching on window too would fire the event twice, breaking justPressed logic.
  document.dispatchEvent(new KeyboardEvent(type, init));
}

function GamepadButton({
  label,
  keyValue,
  hold = false,
  repeat = false,
  repeatMs = 80,
  style,
  disabled = false,
}: {
  label: string;
  keyValue?: string;
  hold?: boolean;
  repeat?: boolean;
  repeatMs?: number;
  style?: React.CSSProperties;
  disabled?: boolean;
}) {
  const isDisabled = disabled || !keyValue;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRepeat = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const firePulse = (key: string) => {
    // Send keydown+keyup pair so justPressed-based games reset between pulses
    dispatchKey(key, 'keydown');
    dispatchKey(key, 'keyup');
  };

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!keyValue) return;
    if (repeat) {
      stopRepeat();
      firePulse(keyValue);
      intervalRef.current = setInterval(() => firePulse(keyValue), repeatMs);
    } else {
      dispatchKey(keyValue, 'keydown');
    }
  };

  const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!keyValue) return;
    if (repeat) stopRepeat();
    if (hold) dispatchKey(keyValue, 'keyup');
  };

  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.22)',
        borderRadius: 8,
        color: '#fff',
        fontFamily: 'inherit',
        fontWeight: 700,
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.2 : 1,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        padding: 0,
        ...style,
      }}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      aria-label={label}
    >
      {label}
    </button>
  );
}

export default function MobileGamepad({
  keyMap,
  paused,
  onPauseToggle,
  skin,
  onSkinChange,
  backHref,
}: MobileGamepadProps) {
  const btnSize = 52;
  const actionSize = 56;

  return (
    <div
      className="md:hidden"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '20px 12px 14px',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* Main row: D-pad left, action buttons right */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* D-pad cross */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `${btnSize}px ${btnSize}px ${btnSize}px`,
            gridTemplateRows: `${btnSize}px ${btnSize}px ${btnSize}px`,
            gap: 4,
          }}
        >
          {/* row 1 */}
          <div />
          <GamepadButton
            label="↑"
            keyValue={keyMap.up}
            hold
            style={{ width: btnSize, height: btnSize, fontSize: 22 }}
          />
          <div />
          {/* row 2 */}
          <GamepadButton
            label="←"
            keyValue={keyMap.left}
            hold
            style={{ width: btnSize, height: btnSize, fontSize: 22 }}
          />
          <div
            style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}
          />
          <GamepadButton
            label="→"
            keyValue={keyMap.right}
            hold
            style={{ width: btnSize, height: btnSize, fontSize: 22 }}
          />
          {/* row 3 */}
          <div />
          <GamepadButton
            label="↓"
            keyValue={keyMap.down}
            hold
            style={{ width: btnSize, height: btnSize, fontSize: 22 }}
          />
          <div />
        </div>

        {/* Action buttons — horizontal row */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <GamepadButton
            label="B"
            keyValue={keyMap.b}
            repeat
            style={{
              width: actionSize,
              height: actionSize,
              borderRadius: '50%',
              fontSize: 18,
              fontWeight: 900,
              background: 'rgba(80,180,255,0.2)',
              borderColor: 'rgba(80,180,255,0.55)',
              color: '#90d0ff',
            }}
          />
          <GamepadButton
            label="A"
            keyValue={keyMap.a}
            repeat
            style={{
              width: actionSize,
              height: actionSize,
              borderRadius: '50%',
              fontSize: 18,
              fontWeight: 900,
              background: 'rgba(255,80,80,0.22)',
              borderColor: 'rgba(255,80,80,0.6)',
              color: '#ff9090',
            }}
          />
        </div>
      </div>

      {/* Bottom row: pause + skin */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          style={{
            flex: 1,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,220,0,0.13)',
            border: '1px solid rgba(255,220,0,0.5)',
            borderRadius: 8,
            color: '#ffdc00',
            fontFamily: 'inherit',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation',
          }}
          onClick={onPauseToggle}
          aria-label={paused ? 'Reanudar' : 'Pausa'}
        >
          {paused ? '▶ REANUDAR' : '⏸ PAUSA'}
        </button>

        <select
          value={skin}
          onChange={(e) => onSkinChange(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.22)',
            borderRadius: 8,
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: 12,
            padding: '6px 8px',
            cursor: 'pointer',
            outline: 'none',
            height: 36,
          }}
          aria-label="Selector de skin"
        >
          {SKIN_OPTIONS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>

        <Link
          href={backHref}
          style={{
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'inherit',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textDecoration: 'none',
            padding: '0 12px',
            whiteSpace: 'nowrap',
          }}
        >
          ← SALIR
        </Link>
      </div>
    </div>
  );
}
