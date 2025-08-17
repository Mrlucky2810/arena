import { Card, CardContent } from "@/components/ui/card";
import type { Game } from "@/lib/mock-data";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, TrendingUp, Coins, Zap, Play, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function GameCard({ game }: { game: Game }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="overflow-hidden group w-full hover:shadow-2xl transition-all duration-700 border-0 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-xl relative">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        {/* Glowing border effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-sm"></div>
        
        <CardContent className="p-0 relative z-10">
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
              
              {/* Enhanced Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
              
              {/* Floating Particles Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary/80 rounded-full"
                    style={{
                      left: `${15 + (i * 12)}%`,
                      top: `${25 + (i * 8)}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            </div>

            {/* Top Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
              {game.isHot && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                >
                  <Badge className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg animate-pulse py-1 px-2.5 text-xs font-bold">
                    <Zap className="w-3 h-3 mr-1" />
                    HOT
                  </Badge>
                </motion.div>
              )}
              {game.winMultiplier && (
                <motion.div
                  initial={{ scale: 0, x: -20 }}
                  animate={{ scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                >
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg py-1 px-2.5 text-xs font-bold">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {game.winMultiplier}
                  </Badge>
                </motion.div>
              )}
            </div>

            {/* RTP Badge */}
            {game.rtp && (
              <motion.div 
                className="absolute top-3 right-3"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              >
                <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm text-xs border border-white/10">
                  <Star className="w-3 h-3 mr-1" />
                  RTP {game.rtp}%
                </Badge>
              </motion.div>
            )}

            {/* Game Title and Info */}
            <div className="absolute bottom-0 left-0 p-4 w-full">
              <motion.div 
                className="space-y-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-primary transition-colors duration-300 drop-shadow-lg">
                    {game.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-white/90">
                      <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-2 py-1 backdrop-blur-sm">
                        <Coins className="w-3 h-3" />
                        <span className="font-medium">Min ₹{game.minBet}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-primary/80 to-accent/80 text-white font-bold px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-white/20">
                      {game.category}
                    </div>
                  </div>
                </div>

                {/* Live Players Count */}
                <div className="flex items-center gap-2 text-white/80">
                  <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-3 py-1.5 backdrop-blur-sm">
                    <div className="relative">
                      <Users className="w-4 h-4" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <span className="font-semibold text-white">{game.livePlayers.toLocaleString()}</span>
                    <span className="text-xs text-white/70">playing</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Hover Play Button */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm"
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Link href={game.href}>
                  <Button 
                    size="lg" 
                    className="font-bold text-lg px-8 py-4 bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-white shadow-2xl transform transition-all duration-300 relative overflow-hidden group/button"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover/button:translate-x-full transition-transform duration-700"></div>
                    <Play className="mr-2 h-5 w-5 fill-current" />
                    Play Now
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Bottom Stats Bar */}
          <motion.div 
            className="p-3 bg-gradient-to-r from-muted/90 via-muted/80 to-muted/90 backdrop-blur-sm border-t border-white/5"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7] 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: "easeInOut" 
                    }}
                  />
                  <span className="font-medium">Live Now</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">+24% wins</span>
                </div>
              </div>
              <div className="text-primary font-bold">
                Join Now
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
