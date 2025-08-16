
import { Card, CardContent } from "@/components/ui/card";
import type { Game } from "@/lib/mock-data";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Coins, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function GameCard({ game }: { game: Game }) {
  return (
    <Card className="overflow-hidden group w-full hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <CardContent className="p-0 relative">
        <div className="relative overflow-hidden">
          {/* Game Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={game.thumbnail}
              alt={game.name}
              width={400}
              height={300}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
              data-ai-hint="casino game"
            />
            
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
            
            {/* Floating Particles Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-primary/60 rounded-full animate-pulse"
                  style={{
                    left: `${20 + (i * 15)}%`,
                    top: `${30 + (i * 10)}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '2s'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Top Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-2">
            {game.isHot && (
              <Badge className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg animate-pulse py-0.5 px-1.5 sm:py-1 sm:px-2.5 text-[10px] sm:text-xs">
                <Zap className="w-3 h-3 mr-1" />
                HOT
              </Badge>
            )}
            {game.winMultiplier && (
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg py-0.5 px-1.5 sm:py-1 sm:px-2.5 text-[10px] sm:text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {game.winMultiplier}
              </Badge>
            )}
          </div>

          {/* RTP Badge */}
          {game.rtp && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
              <Badge variant="secondary" className="bg-black/50 text-white backdrop-blur-sm text-[10px] sm:text-xs">
                RTP {game.rtp}%
              </Badge>
            </div>
          )}

          {/* Game Title and Info */}
          <div className="absolute bottom-0 left-0 p-2 sm:p-4 w-full">
            <div className="space-y-1 sm:space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-primary transition-colors duration-300">
                {game.name}
              </h3>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-white/80">
                  <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Min ₹{game.minBet}</span>
                </div>
                <div className="text-emerald-400 font-medium">
                  {game.category}
                </div>
              </div>
            </div>
          </div>

          {/* Hover Play Button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-2xl transform scale-95 group-hover:scale-100 transition-transform duration-300"
            >
              <Link href={game.href} className="font-semibold">
                Play Now
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom Stats Bar */}
        <div className="p-2 sm:p-3 bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                <Users className="w-3 h-3" />
                <span className="font-medium">{game.livePlayers.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-primary font-medium">
              Playing Now
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
