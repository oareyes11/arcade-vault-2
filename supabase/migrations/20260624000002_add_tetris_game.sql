-- Insert Tetris record
INSERT INTO public.games (title, short, long, cat, cover, color, slug)
VALUES (
  'TETRIS',
  'Apila tetrominos antes de que el techo te aplaste.',
  'Apila y rota siete tipos de piezas para completar líneas sin dejar huecos. Cada línea despejada suma puntos y el ritmo aumenta con cada nivel. La partida termina cuando las piezas llegan al techo — ¿cuánto aguantas?',
  'PUZZLE',
  'cover-tetro',
  'cyan',
  'tetris'
);
