# SPEC 08 — Integración del juego SNAKE

> **Estado:** Aprobado
> **Depende de:** 06-games-table-leaderboard-supabase
> **Fecha:** 2026-06-24
> **Objetivo:** Registrar Snake en la tabla `games` de Supabase para que aparezca en la biblioteca de Arcade Vault, y verificar que `SnakeGame.tsx` y `play/page.tsx` cumplen el patrón actual de la plataforma.

---

## Scope

**In:**

- Insertar la fila `snake` en la tabla `games` de Supabase (migration SQL).
- Auditar `app/games/snake/play/page.tsx` para confirmar que sigue el patrón
  estándar (HUD React con refs, modal de game over, guardado en Supabase,
  pre-relleno de nombre, MobileGamepad). Documentar resultado; corregir solo
  si hay desviaciones.
- Verificar que la card de SNAKE aparece en `/games`, que `/games/snake` carga
  la detail page y que `/games/snake/play` es jugable y guarda scores en Supabase.

**Fuera de alcance:**

- Crear las tablas `games` o `scores` — ya existen (spec 06).
- Modificar `components/games/SnakeGame.tsx` — el componente está completamente
  implementado con sprites de fruta, skins (classic, retro, neon) y pausa.
- Copiar `fruits.png` a `public/` — ya está presente.
- Supabase Auth — `user_id` se almacena en función del contexto `useUser`
  (ya implementado).
- RLS — se configura en un spec futuro de seguridad.
- Realtime — el leaderboard no se actualiza en vivo.
- Nuevos skins — el juego ya tiene classic, retro y neon.
- Controles táctiles — MobileGamepad ya está implementado en la play-page.

---

## Data model

### Seed en Supabase — tabla `games`

`lib/supabase/types.ts` exporta `GameRow` con columna `slug` (además de `id`).
El INSERT incluye ambos campos:

```sql
INSERT INTO games (id, slug, title, short, long, cat, cover, color)
VALUES (
  'snake',
  'snake',
  'SNAKE',
  'Guía a la serpiente sin morderte la cola.',
  'Una serpiente hambrienta recorre el tablero buscando frutas. Cada bocado la hace crecer y el ritmo aumenta con cada nivel. La partida termina cuando choca con la pared o consigo misma — ¿cuánto tiempo sobrevives?',
  'ARCADE',
  'cover-snake',
  'green'
);
```

No se introducen nuevas tablas ni tipos TypeScript — se reutilizan `GameRow`
y `ScoreRow` de `lib/supabase/types.ts`.

### Props del componente — `SnakeGame.tsx`

```ts
interface SnakeGameProps {
  paused: boolean;
  skinKey?: string; // 'classic' | 'retro' | 'neon'
  onScoreChange: (score: number) => void;
  onLevelChange: (level: number) => void;
  onLivesChange: (lives: number) => void;
  onGameOver: (finalScore: number) => void;
}
```

---

## Implementation plan

1. **Verificar esquema real de `games`**
   Usar Supabase MCP (`list_tables` o `execute_sql`) para confirmar columnas
   de la tabla. Confirmar que `slug` existe y que `id` es texto (no UUID).
   Verificación: tipos confirmados antes de continuar.

2. **Aplicar migración SQL**
   Crear `supabase/migrations/<timestamp>_add_snake_game.sql` con el INSERT
   del data model.
   Ejecutar vía `mcp__supabase__apply_migration`.
   Verificación: la card de SNAKE aparece en `/games` con color green y
   cover `cover-snake`.

3. **Auditar `app/games/snake/play/page.tsx`**
   Confirmar que el archivo cumple el patrón estándar:
   - `dynamic(..., { ssr: false })` para importar `SnakeGame`
   - HUD React con refs DOM (no state) para actualizaciones sin re-renders
   - `useUser` para pre-rellenar nombre desde contexto o
     `localStorage.getItem('av_player_name')`
   - Flag `over` para mostrar modal de game over
   - INSERT en `scores` con `game_id: 'snake'` y `user_id: user?.id ?? null`
   - Flag `saved` para deshabilitar botón tras primer envío
   - `MobileGamepad` con `keyMap` cableado
     Solo documentar resultado; corregir si hay desviaciones.

4. **Verificación final**
   - Navegar a `/games` → card SNAKE visible con color green.
   - Navegar a `/games/snake` → detail page con título, descripción y botón
     "JUGAR AHORA".
   - Navegar a `/games/snake/play` → juego cargado, frutas con sprites visibles.
   - Completar partida → modal game over aparece; guardar score → aparece en
     `/hall-of-fame`.
   - `npm run build` sin errores de TypeScript. Ninguna ruta devuelve 500.

---

## Acceptance criteria

- [ ] La card de SNAKE aparece en `/games` con color green y cover `cover-snake`.
- [ ] `/games/snake` carga la detail page con título, descripción corta y botón
      "JUGAR AHORA".
- [ ] `/games/snake/play` carga sin errores de consola ni TypeScript.
- [ ] El canvas renderiza el juego y es jugable con las teclas de flecha.
- [ ] Las frutas se muestran como sprites de `fruits.png` (no como formas geométricas).
- [ ] El HUD React muestra score, level y lives en tiempo real.
- [ ] El botón "PAUSA" congela el game loop; "REANUDAR" lo reanuda.
- [ ] Al terminar la partida, aparece el modal React de game over con la puntuación final.
- [ ] El campo de nombre se pre-rellena desde `username` o `av_player_name` de localStorage.
- [ ] Al confirmar, el score se inserta en Supabase y el nombre se persiste en localStorage.
- [ ] El botón "GUARDAR PUNTUACIÓN" se deshabilita tras el primer envío.
- [ ] El score guardado aparece en `/games/snake` y en `/hall-of-fame` al recargar.
- [ ] `/hall-of-fame` muestra un tab para SNAKE.
- [ ] `npm run build` completa sin errores de TypeScript.
- [ ] Ninguna ruta existente devuelve 500.

---

## Decisions

- **Solo INSERT + auditoría (no rewrite)** — `SnakeGame.tsx` y `play/page.tsx`
  ya existen con implementación completa incluyendo sprites, skins y MobileGamepad.
  El spec cubre únicamente el registro en Supabase y la verificación formal del
  patrón. Razón: mismo patrón que spec 07 con Tetris; reimplementar sería
  over-engineering.

- **ID texto `'snake'`** — el routing dinámico `app/games/[id]/page.tsx` y la
  play-page usan la cadena `'snake'`. El INSERT usa ese mismo valor. Razón:
  coherencia con el patrón ya establecido.

- **Cover `cover-snake`** — la clase ya existe en `globals.css` y fue diseñada
  específicamente para Snake. No se añade CSS nuevo.

- **Color `green`** — coherente con la identidad visual de la serpiente y
  diferenciador respecto a los otros juegos (cyan=Tetris, yellow=Asteroids).

- **Cat `ARCADE`** — Snake es un juego de reflejos y coordinación, no un puzzle
  ni un shooter. Razón: clasifica correctamente junto a Frogger.

- **No: nuevas tablas por juego** — se reutilizan `games` y `scores` del spec 06.
  Razón: el modelo es suficientemente genérico para cualquier juego con score
  numérico.

- **No: RLS en este spec** — las tablas quedan abiertas. Razón: se mitiga en
  el spec futuro de seguridad.
