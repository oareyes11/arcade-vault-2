# Spec 05 — asteroids-integration

**Estado:** Aprobado
**Fecha:** 2026-06-24
**Dependencias:** 04-supabase-integration
**Objetivo:** Registrar el juego Asteroids en la tabla `games` de Supabase para que aparezca en la biblioteca de Arcade Vault.

---

## Contexto

`components/games/AsteroidsGame.tsx` (640 líneas) y `app/games/asteroids/play/page.tsx` (278 líneas) ya existen y están completamente implementados con skins, pause, mobile gamepad y guardado de scores. El juego no aparece en la biblioteca porque no hay ningún registro en la tabla `games` de Supabase — sin ese registro, la cuadrícula de `/games` no lo muestra.

---

## Alcance

### ✅ En alcance

- Insertar el registro de Asteroids en la tabla `games` de Supabase (vía migration SQL)
- Verificar que el juego aparece en la cuadrícula de la biblioteca (`/games`)
- Verificar que la detail page dinámica (`/games/asteroids`) funciona
- Verificar que `/games/asteroids/play` es jugable

### ❌ Fuera de alcance

- Modificar `components/games/AsteroidsGame.tsx`
- Modificar `app/games/asteroids/play/page.tsx`
- Añadir skins nuevos
- Soporte mobile (ya implementado en la play page)
- Audio / efectos de sonido

---

## Modelo de datos

No hay modelos nuevos. Solo un registro nuevo en la tabla `games`:

```sql
INSERT INTO games (id, title, short, long, cat, cover, color)
VALUES (
  'asteroids',
  'ASTEROIDS',
  'Pulveriza rocas en gravedad cero.',
  'Pilota tu nave en el vacío del espacio y destruye todos los asteroides antes de que te alcancen. Cada roca grande se divide en dos medianas y luego en dos pequeñas. Acumula puntos, avanza de nivel y sobrevive el caos galáctico. 3 vidas, partículas de explosión y wrapping de bordes.',
  'SHOOTER',
  'cover-rocas',
  'yellow'
);
```

> **Nota:** La columna `id` es `uuid` según la migración de spec 04, pero el routing y la play page usan la cadena `'asteroids'`. El implementador debe verificar el tipo real en Supabase antes de ejecutar; si es UUID, habrá que añadir una columna `slug text UNIQUE NOT NULL` y ajustar la query del dynamic route.

---

## Plan de implementación

1. **Verificar esquema real de `games`**
   - Usar Supabase MCP (`list_tables` / `execute_sql`) para confirmar el tipo de la columna `id`
   - Si es UUID: añadir columna `slug text UNIQUE NOT NULL` y ajustar la query del dynamic route `app/games/[id]/page.tsx`
   - Si es text: proceder directamente al paso 2

2. **Aplicar migración SQL**
   - Crear `supabase/migrations/<timestamp>_add_asteroids_game.sql` con el INSERT anterior
   - Ejecutar vía `mcp__supabase__apply_migration`

3. **Verificar en biblioteca**
   - Abrir `/games` → confirmar que la card de ASTEROIDS aparece con color amarillo y cover `cover-rocas`

4. **Verificar detail page**
   - Navegar a `/games/asteroids` → confirmar que carga título, descripción y botón "JUGAR AHORA"

5. **Verificar play page**
   - Navegar a `/games/asteroids/play` → confirmar que el juego carga y es jugable
   - Completar una partida y guardar score → confirmar que aparece en `/hall-of-fame`

---

## Criterios de aceptación

- [ ] La card de ASTEROIDS aparece en `/games` con color amarillo y cover `cover-rocas`
- [ ] `/games/asteroids` carga la detail page con título, descripción corta y botón "JUGAR AHORA"
- [ ] `/games/asteroids/play` carga el juego sin errores de consola
- [ ] El juego es jugable: nave responde a teclas de flecha y espacio, asteroides se dividen al ser disparados
- [ ] Al perder todas las vidas aparece el modal de Game Over con campo para nombre de jugador
- [ ] El score se guarda en Supabase y aparece reflejado en `/hall-of-fame`

---

## Decisiones tomadas y descartadas

| Decisión            | Elegida                                  | Descartada                                                          | Motivo                                                                                           |
| ------------------- | ---------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Componente de juego | Reutilizar `AsteroidsGame.tsx` existente | Reimplementar desde `references/started-games/02-asteroids/game.js` | El componente ya tiene skins, pause, callbacks y Supabase — no hay ganancia en reescribir        |
| ID del juego        | `'asteroids'` (texto)                    | UUID auto-generado                                                  | El dynamic route `/games/[id]` y la play page ya usan la cadena `'asteroids'` como identificador |
| Cover               | `cover-rocas`                            | Clase nueva                                                         | La clase ya existe en `globals.css` y fue diseñada para este juego                               |
| Alcance del spec    | Solo insert en Supabase                  | Audit completo del componente + play page                           | Los archivos existen y siguen el patrón estándar; auditar sería over-engineering para esta tarea |

---

## Riesgos identificados

- **Tipo de columna `id`:** Si es UUID y no text, el INSERT fallará y el routing `/games/asteroids` no encontrará el registro. Mitigación: verificar con `list_tables` antes de aplicar la migración.
- **Columna `slug` ausente:** Si se necesita añadir `slug`, hay que actualizar también la query del dynamic route `app/games/[id]/page.tsx`. Bajo riesgo — solo un archivo.
