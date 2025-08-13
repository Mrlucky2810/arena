
import { Card, CardContent } from "@/components/ui/card";
import type { Game } from "@/lib/mock-data";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import Link from "next/link";

export function GameCard({ game }: { game: Game }) {
  return (
    <Card className="overflow-hidden group w-full">
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={game.thumbnail}
            alt={game.name}
            width={400}
            height={300}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 aspect-[4/3]"
            data-ai-hint="casino game"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-2 left-2 flex gap-2">
            {game.isHot && <Badge className="bg-red-600 hover:bg-red-700">🔥 HOT</Badge>}
            {game.winMultiplier && <Badge variant="secondary">{game.winMultiplier} Max</Badge>}
          </div>
          <div className="absolute bottom-0 left-0 p-2 sm:p-4 w-full">
            <h3 className="text-md sm:text-lg font-bold text-white">{game.name}</h3>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button asChild>
                <Link href={game.href}>Play Now</Link>
            </Button>
          </div>
        </div>
        <div className="p-2 bg-muted/50 text-xs text-muted-foreground flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>{game.livePlayers.toLocaleString()} playing</span>
        </div>
      </CardContent>
    </Card>
  );
}
