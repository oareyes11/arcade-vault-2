# Spec 04 — Supabase: configuración inicial y tablas base

- **Estado:** Aprbado
- **Fecha:** 2026-06-24
- **Dependencias:** ninguna
- **Objetivo:** Conectar la app Next.js a un proyecto Supabase existente configurando las variables de entorno y creando las tablas `games` y `scores`.

---

## Scope

### En alcance

- Agregar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` a `.env.local`
- Crear tabla `games` en Supabase con el esquema que coincide con `GameRow` en `lib/supabase/types.ts`
- Crear tabla `scores` en Supabase con el esquema que coincide con `ScoreRow`, con FK a `games.id`
- Verificar que la conexión funciona desde la app (lectura básica)

### Fuera de alcance

- Autenticación de usuarios (spec futuro)
- Row Level Security / políticas de acceso (spec futuro)
- Poblar la tabla `games` con datos (se hace manualmente desde el dashboard de Supabase)
- UI de administración de juegos

---

## Modelo de datos

### Tabla `games`

| Columna      | Tipo          | Restricciones                                          |
| ------------ | ------------- | ------------------------------------------------------ |
| `id`         | `uuid`        | PK, default `gen_random_uuid()`                        |
| `title`      | `text`        | NOT NULL                                               |
| `short`      | `text`        | NOT NULL — descripción corta                           |
| `long`       | `text`        | NOT NULL — descripción larga                           |
| `cat`        | `text`        | NOT NULL, CHECK IN ('ARCADE', 'PUZZLE', 'SHOOTER')     |
| `cover`      | `text`        | NOT NULL — URL o ruta del cover                        |
| `color`      | `text`        | NOT NULL, CHECK IN ('cyan','magenta','yellow','green') |
| `created_at` | `timestamptz` | default `now()`                                        |

### Tabla `scores`

| Columna       | Tipo          | Restricciones                               |
| ------------- | ------------- | ------------------------------------------- |
| `id`          | `uuid`        | PK, default `gen_random_uuid()`             |
| `game_id`     | `uuid`        | NOT NULL, FK → `games.id` ON DELETE CASCADE |
| `player_name` | `text`        | NOT NULL                                    |
| `score`       | `integer`     | NOT NULL                                    |
| `user_id`     | `uuid`        | NULL — se vincula a auth en spec futuro     |
| `created_at`  | `timestamptz` | default `now()`                             |

Ambas tablas coinciden 1:1 con `GameRow` y `ScoreRow` en `lib/supabase/types.ts`.

---

## Plan de implementación

1. **Obtener credenciales** — En el dashboard de Supabase → _Project Settings → Data API_, copiar `Project URL` y `Publishable (anon) key`.

2. **Configurar `.env.local`** — Agregar las dos variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=<Project URL>
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<Publishable key>
   ```

   El cliente ya las consume en `lib/supabase/client.ts` y `lib/supabase/server.ts`.

3. **Crear tabla `games`** — Ejecutar en el SQL Editor de Supabase:

   ```sql
   CREATE TABLE games (
     id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     title        text NOT NULL,
     short        text NOT NULL,
     long         text NOT NULL,
     cat          text NOT NULL CHECK (cat IN ('ARCADE','PUZZLE','SHOOTER')),
     cover        text NOT NULL,
     color        text NOT NULL CHECK (color IN ('cyan','magenta','yellow','green')),
     created_at   timestamptz DEFAULT now()
   );
   ```

4. **Crear tabla `scores`** — Ejecutar en el SQL Editor de Supabase:

   ```sql
   CREATE TABLE scores (
     id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     game_id      uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
     player_name  text NOT NULL,
     score        integer NOT NULL,
     user_id      uuid,
     created_at   timestamptz DEFAULT now()
   );
   ```

5. **Verificar conexión** — Desde la app en desarrollo (`npm run dev`), abrir `/hall-of-fame` o hacer una consulta simple en un Server Component y confirmar que no hay errores de conexión en consola.

---

## Criterios de aceptación

- [ ] `.env.local` contiene `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` con valores reales
- [ ] La tabla `games` existe en Supabase con todas las columnas y restricciones del modelo de datos
- [ ] La tabla `scores` existe en Supabase con todas las columnas y la FK a `games.id`
- [ ] `npm run dev` arranca sin errores de entorno o de conexión a Supabase
- [ ] Una consulta `SELECT * FROM games` ejecutada desde el SQL Editor de Supabase devuelve resultado (aunque esté vacía)
- [ ] Una consulta `SELECT * FROM scores` ejecutada desde el SQL Editor de Supabase devuelve resultado (aunque esté vacía)

---

## Decisiones tomadas y descartadas

| Decisión                 | Elegida                    | Descartada              | Motivo                                                                          |
| ------------------------ | -------------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| Clave de Supabase a usar | `PUBLISHABLE_KEY` (anon)   | `SECRET_KEY`            | La app la usa en cliente y servidor; la secret key nunca va al browser          |
| FK `scores.game_id`      | FK con `ON DELETE CASCADE` | Sin FK / FK sin cascade | Integridad referencial; al borrar un juego sus scores se borran automáticamente |
| Autenticación            | Fuera de este spec         | Incluirla aquí          | Mantiene el spec enfocado y ejecutable en un solo paso                          |
| RLS                      | Fuera de este spec         | Incluirla aquí          | Sin datos sensibles en este punto; se agrega en spec dedicado                   |
| Seeding de `games`       | Manual desde dashboard     | Script o UI             | Fuera de alcance acordado; la tabla se puebla por separado                      |

---

## Riesgos identificados

- **Variables de entorno en producción** — `.env.local` no se sube a git ni a Vercel. Al deployar hay que configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` manualmente en el panel del host.

- **Nombre de la variable de la key** — Las versiones antiguas de `@supabase/ssr` usaban `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Este proyecto ya usa `PUBLISHABLE_KEY`; si se copia un snippet de la documentación antigua puede fallar silenciosamente.

- **Inserción de scores con `game_id` inválido** — La FK rechazará inserciones si el juego no existe en la tabla `games`. Hay que asegurarse de poblar `games` antes de que la app intente escribir scores.
