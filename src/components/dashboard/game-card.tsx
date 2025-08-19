import { Card, CardContent } from "@/components/ui/card";
import type { Game } from "@/lib/mock-data";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Users, Play } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function GameCard({ game }: { game: Game }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card className="overflow-hidden group w-full hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 border-border/20 bg-card/80 backdrop-blur-sm relative rounded-2xl">
        <CardContent className="p-0 relative z-10">
          <div className="relative overflow-hidden aspect-[4/3]">
            <Image
              src={game.thumbnail}
              alt={game.name}
              width={400}
              height={300}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
              data-ai-hint="casino game"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
          </div>

          <div className="absolute bottom-0 left-0 p-4 w-full text-white">
            <h3 className="text-xl font-bold drop-shadow-lg mb-2">
              {game.name}
            </h3>
            <div className="flex items-center text-sm">
                <div className="flex items-center gap-1.5 bg-black/40 rounded-full px-3 py-1 backdrop-blur-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{game.livePlayers.toLocaleString()}</span>
                    <span className="text-white/70">playing</span>
                </div>
            </div>
          </div>
          
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
            initial={{ scale: 0.9 }}
            whileHover={{ scale: 1 }}
          >
            <Link href={game.href} className="w-full h-full flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Button 
                  size="lg" 
                  className="font-bold text-lg px-8 h-12 bg-gradient-to-r from-primary to-accent text-white shadow-2xl shadow-primary/30"
                >
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Play Now
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
