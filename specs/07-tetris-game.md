# SPEC 07 — Integración del juego TETRIS

> **Estado:** Aprobado
> **Depende de:** 06-games-table-leaderboard-supabase
> **Fecha:** 2026-06-24
> **Objetivo:** Registrar Tetris en la tabla `games` de Supabase para que aparezca en la biblioteca de Arcade Vault, y verificar que `TetrisGame.tsx` y `play/page.tsx` cumplen el patrón actual de la plataforma.

---

## Scope

**In:**

- Insertar la fila `tetris` en la tabla `games` de Supabase (migration SQL).
- Auditar `app/games/tetris/play/page.tsx` para confirmar que sigue el patrón estándar (HUD React con refs, modal de game over, guardado en Supabase, pre-relleno de nombre, MobileGamepad). Documentar resultado; corregir solo si hay desviaciones.
- Verificar que la card de TETRIS aparece en `/games`, que `/games/tetris` carga la detail page y que `/games/tetris/play` es jugable y guarda scores en Supabase.

**Fuera de alcance:**

- Crear las tablas `games` o `scores` — ya existen (spec 06).
- Modificar `components/games/TetrisGame.tsx` — el componente está completamente implementado con skins (retro, neon, pastel, pixel art), callbacks y pausa.
- Supabase Auth — `user_id` se almacena en función del contexto `useUser` (ya implementado).
- RLS — se configura en un spec futuro de seguridad.
- Realtime — el leaderboard no se actualiza en vivo.
- Nuevos skins — el juego ya tiene retro, neon, pastel y pixel art.
- Controles táctiles — MobileGamepad ya está implementado en la play-page.

---

## Data model

### Seed en Supabase — tabla `games`

Verificar primero el esquema real con `list_tables` (por si existe columna `slug` que requiera valor). Luego ejecutar:

```sql
INSERT INTO games (id, title, short, long, cat, cover, color)
VALUES (
  'tetris',
  'TETRIS',
  'Apila tetrominos antes de que el techo te aplaste.',
  'Apila y rota siete tipos de piezas para completar líneas sin dejar huecos. Cada línea despejada suma puntos y el ritmo aumenta con cada nivel. La partida termina cuando las piezas llegan al techo — ¿cuánto aguantas?',
  'PUZZLE',
  'cover-tetro',
  'cyan'
);
```

Si la tabla tiene columna `slug`, añadirla al INSERT con valor `'tetris'`.

No se introducen nuevas tablas ni tipos TypeScript — se reutilizan `GameRow` y `ScoreRow` de `lib/supabase/types.ts`.

---

## Implementation plan

1. **Verificar esquema real de `games`**
   - Usar Supabase MCP (`list_tables` o `execute_sql`) para confirmar columnas de la tabla.
   - Si existe columna `slug`: añadirla al INSERT con `'tetris'`.
   - Si el id es UUID en lugar de texto: ajustar INSERT y revisar routing dinámico.
     Verificación: confirmar tipos antes de continuar.

2. **Aplicar migración SQL**
   - Crear `supabase/migrations/<timestamp>_add_tetris_game.sql` con el INSERT del paso anterior.
   - Ejecutar vía `mcp__supabase__apply_migration`.
     Verificación: la card de TETRIS aparece en `/games` con color cyan y cover `cover-tetro`.

3. **Auditar `app/games/tetris/play/page.tsx`**
   Confirmar que el archivo (280 líneas, ya implementado) cumple el patrón estándar:
   - `dynamic(..., { ssr: false })` para importar `TetrisGame`
   - HUD React con refs DOM (no state) para actualizaciones de score / lives / level sin re-renders
   - `useUser` para pre-rellenar nombre desde contexto o `localStorage.getItem('av_player_name')`
   - Flag `over` para mostrar modal de game over
   - INSERT en `scores` con `game_id: 'tetris'` y `user_id: user?.id ?? null`
   - Flag `saved` para deshabilitar botón tras primer envío
   - `MobileGamepad` con `keyMap` cableado
     Solo documentar resultado; corregir si hay desviaciones.

4. **Verificación final**
   - Navegar a `/games` → card TETRIS visible.
   - Navegar a `/games/tetris` → detail page con título, descripción y botón "JUGAR AHORA".
   - Navegar a `/games/tetris/play` → juego cargado y jugable.
   - Completar partida → modal game over aparece; guardar score → aparece en `/hall-of-fame`.
   - `npm run build` sin errores de TypeScript. Ninguna ruta devuelve 500.

---

## Acceptance criteria

- [ ] La card de TETRIS aparece en `/games` con color cyan y cover `cover-tetro`.
- [ ] `/games/tetris` carga la detail page con título, descripción corta y botón "JUGAR AHORA".
- [ ] `/games/tetris/play` carga sin errores de consola ni TypeScript.
- [ ] El canvas renderiza el juego y es jugable con teclas de flecha, espacio y rotación.
- [ ] El HUD React muestra score, lives y level en tiempo real.
- [ ] El botón "PAUSA" congela el game loop; "REANUDAR" lo reanuda.
- [ ] Al terminar la partida, aparece el modal React de game over con la puntuación final.
- [ ] El campo de nombre se pre-rellena desde `username` o `av_player_name` de localStorage.
- [ ] Al confirmar, el score se inserta en Supabase y el nombre se persiste en localStorage.
- [ ] El botón "GUARDAR PUNTUACIÓN" se deshabilita tras el primer envío.
- [ ] El score guardado aparece en `/games/tetris` y en `/hall-of-fame` al recargar.
- [ ] `/hall-of-fame` muestra un tab para TETRIS.
- [ ] `npm run build` completa sin errores de TypeScript.
- [ ] Ninguna ruta existente devuelve 500.

---

## Decisions

- **Solo INSERT + auditoría (no rewrite)** — `TetrisGame.tsx` y `play/page.tsx` ya existen con implementación completa. El spec cubre únicamente el registro en Supabase y la verificación formal del patrón. Razón: mismo patrón que spec 05 con Asteroids; reimplementar sería over-engineering.
- **ID texto `'tetris'`** — el routing dinámico `app/games/[id]/page.tsx` y la play-page usan la cadena `'tetris'`. El INSERT usa ese mismo valor. Razón: coherencia con el patrón ya establecido.
- **Cover `cover-tetro`** — la clase ya existe en `globals.css` y fue diseñada específicamente para Tetris. No se añade CSS nuevo.
- **Color `cyan`** — coherente con la identidad visual del juego en `references/implemented-games.md`.
- **No: nuevas tablas por juego** — se reutilizan `games` y `scores` del spec 06. Razón: el modelo es suficientemente genérico para cualquier juego con score numérico.
- **No: RLS en este spec** — las tablas quedan abiertas. Razón: se mitiga en el spec futuro de seguridad.
