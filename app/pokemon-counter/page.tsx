'use client';

import { useState } from 'react';

const TOTAL_POKEMON = 151;

export default function PokemonCounterPage() {
  const [count, setCount] = useState(1);

  const pokemonId = ((count - 1) % TOTAL_POKEMON) + 1;
  const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Pokémon Counter</h1>

      <div className="flex flex-col items-center gap-4">
        <img
          src={imageUrl}
          alt={`Pokemon #${pokemonId}`}
          width={200}
          height={200}
          className="drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        />
        <p className="text-gray-400 text-sm">#{pokemonId}</p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <span className="text-6xl font-mono font-bold">{count}</span>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl text-lg hover:bg-yellow-300 active:scale-95 transition-all"
        >
          +1
        </button>
      </div>
    </main>
  );
}
