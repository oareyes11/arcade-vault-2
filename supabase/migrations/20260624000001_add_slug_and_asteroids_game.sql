-- Add slug column to games (text identifier used by routing and play pages)
ALTER TABLE public.games ADD COLUMN slug text NOT NULL DEFAULT '' UNIQUE;
ALTER TABLE public.games ALTER COLUMN slug DROP DEFAULT;

-- Drop UUID FK on scores.game_id and change it to text (matches slug)
ALTER TABLE public.scores DROP CONSTRAINT scores_game_id_fkey;
ALTER TABLE public.scores ALTER COLUMN game_id TYPE text;

-- Insert Asteroids record
INSERT INTO public.games (title, short, long, cat, cover, color, slug)
VALUES (
  'ASTEROIDS',
  'Pulveriza rocas en gravedad cero.',
  'Pilota tu nave en el vacío del espacio y destruye todos los asteroides antes de que te alcancen. Cada roca grande se divide en dos medianas y luego en dos pequeñas. Acumula puntos, avanza de nivel y sobrevive el caos galáctico. 3 vidas, partículas de explosión y wrapping de bordes.',
  'SHOOTER',
  'cover-rocas',
  'yellow',
  'asteroids'
);
