
'use client';

import { GameCard } from "@/components/dashboard/game-card";
import { allGames } from "@/lib/mock-data";
import { Gamepad2 } from "lucide-react";

export default function AllGamesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Gamepad2 className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">All Games</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Browse our full collection of exciting games.
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {allGames.map((game) => (
          <GameCard key={game.name} game={game} />
        ))}
      </div>
    </div>
  );
}
