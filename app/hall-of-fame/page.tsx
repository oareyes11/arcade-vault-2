import { createClient } from '@/lib/supabase/server';
import type { GameRow, ScoreRow } from '@/lib/supabase/types';
import HallOfFameClient from './HallOfFameClient';

export default async function HallOfFame() {
  const supabase = await createClient();

  const { data: games } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: true });

  const typedGames = (games as GameRow[]) ?? [];
  const firstGameSlug = typedGames[0]?.slug ?? '';

  const { data: initialScores } = firstGameSlug
    ? await supabase
        .from('scores')
        .select('*')
        .eq('game_id', firstGameSlug)
        .order('score', { ascending: false })
        .limit(12)
    : { data: [] };

  return (
    <HallOfFameClient
      games={typedGames}
      initialScores={(initialScores as ScoreRow[]) ?? []}
      initialTab={firstGameSlug}
    />
  );
}
