
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Gem, Bomb, Wallet, HelpCircle, AlertTriangle, Trophy, Target, Zap, Shield } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { LoginPromptDialog } from '../auth/login-prompt-dialog';

interface Tile {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
}

const GRID_SIZE = 25;

export function MineSweeperGameUI() {
    const { user, inrBalance, updateBalance } = useAuth();
    const { toast } = useToast();
    const [betAmount, setBetAmount] = useState<number>(10);
    const [mineCount, setMineCount] = useState<number>(5);
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'ended'>('betting');
    const [safeTilesFound, setSafeTilesFound] = useState(0);
    const [totalWins, setTotalWins] = useState(0);
    const [totalGames, setTotalGames] = useState(0);
    const [bestMultiplier, setBestMultiplier] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    const balance = user ? inrBalance : 0;

    const logGameResult = async (payout: number, reason: 'cash_out' | 'mine' | 'perfect') => {
        if (!user) return;
        try {
            await addDoc(collection(db, "game_history"), {
                userId: user.uid,
                game: "Mines",
                betAmount: betAmount,
                mineCount: mineCount,
                outcome: payout >= 0 ? 'win' : 'loss',
                reason: reason,
                payout: payout,
                safeTilesFound: safeTilesFound,
                finalMultiplier: currentMultiplier,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Failed to log game result:", error);
        }
    }

    const initializeGrid = () => {
        const minePositions = new Set<number>();
        while (minePositions.size < mineCount) {
            minePositions.add(Math.floor(Math.random() * GRID_SIZE));
        }

        const newTiles = Array.from({ length: GRID_SIZE }, (_, i) => ({
            id: i,
            isMine: minePositions.has(i),
            isRevealed: false,
        }));

        setTiles(newTiles);
        setSafeTilesFound(0);
        setGameState('betting');
    };
    
    useEffect(() => {
        initializeGrid();
    }, [mineCount]);

    const currentMultiplier = useMemo(() => {
        if (safeTilesFound === 0) return 1;
        const totalSafeTiles = GRID_SIZE - mineCount;
        let multiplier = 1;
        for (let i = 0; i < safeTilesFound; i++) {
            multiplier *= (totalSafeTiles - i) / (GRID_SIZE - i);
        }
        return 0.98 / multiplier;
    }, [safeTilesFound, mineCount]);

    const potentialWin = betAmount * currentMultiplier;
    const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0.0';

    const handleStartGame = async () => {
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }
         if (betAmount <= 0) {
            toast({ variant: "destructive", title: "Invalid Amount", description: "Bet amount must be positive." });
            return;
        }
        if (betAmount > inrBalance) {
            toast({ variant: "destructive", title: "Insufficient Balance", description: "You don't have enough funds to place this bet." });
            return;
        }
        try {
            await updateBalance(user.uid, -betAmount, 'inr');
            setGameState('playing');
            setTotalGames(prev => prev + 1);
            toast({ 
              title: "💎 Mine Field Activated!", 
              description: "Good luck treasure hunter!",
              className: "bg-blue-50 border-blue-200 text-blue-800"
            });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not place your bet. Please try again." });
        }
    };

    const handleTileClick = (id: number) => {
        if (gameState !== 'playing' || !user) return;

        const tile = tiles.find(t => t.id === id);
        if (!tile || tile.isRevealed) return;

        const newTiles = tiles.map(t => t.id === id ? { ...t, isRevealed: true } : t);
        setTiles(newTiles);

        if (tile.isMine) {
            setGameState('ended');
            setStreak(0);
            logGameResult(-betAmount, 'mine');
            toast({ 
              variant: "destructive", 
              title: "💥 BOOM!", 
              description: `You hit a mine and lost ₹${betAmount}. Try again!` 
            });
            setTimeout(() => {
                setTiles(prev => prev.map(t => ({...t, isRevealed: t.isMine || t.isRevealed})));
            }, 500);
        } else {
            const newSafeTilesFound = safeTilesFound + 1;
            setSafeTilesFound(newSafeTilesFound);
            
            if (newSafeTilesFound === GRID_SIZE - mineCount) {
                const finalWin = betAmount * currentMultiplier;
                updateBalance(user.uid, finalWin + betAmount, 'inr');
                setGameState('ended');
                setTotalWins(prev => prev + 1);
                setStreak(prev => prev + 1);
                setBestMultiplier(prev => Math.max(prev, currentMultiplier));
                logGameResult(finalWin, 'perfect');
                toast({ 
                  title: "🏆 PERFECT CLEAR!", 
                  description: `You found all gems and won ₹${finalWin.toFixed(2)}!`,
                  className: "bg-emerald-50 border-emerald-200 text-emerald-800"
                });
            } else {
                toast({ 
                  title: "💎 Gem Found!", 
                  description: `Safe! Current multiplier: ${currentMultiplier.toFixed(2)}x`,
                  className: "bg-emerald-50 border-emerald-200 text-emerald-800"
                });
            }
        }
    };
    
    const handleCashOut = async () => {
        if (gameState !== 'playing' || safeTilesFound === 0 || !user) return;
        const netWin = potentialWin - betAmount;
        try {
            await updateBalance(user.uid, potentialWin, 'inr');
            setGameState('ended');
            setTotalWins(prev => prev + 1);
            setStreak(prev => prev + 1);
            setBestMultiplier(prev => Math.max(prev, currentMultiplier));
            await logGameResult(netWin, 'cash_out');
            toast({ 
              title: "💰 Cashed Out!", 
              description: `You escaped with ₹${netWin.toFixed(2)}!`,
              className: "bg-emerald-50 border-emerald-200 text-emerald-800"
            });
        } catch(error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to cash out. Please try again." });
        }
    }

    const handleNewGame = () => {
        initializeGrid();
    }

    const getDifficultyLabel = () => {
        if (mineCount <= 3) return { label: "Easy", color: "text-green-400", bg: "bg-green-500/10" };
        if (mineCount <= 8) return { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/10" };
        if (mineCount <= 15) return { label: "Hard", color: "text-orange-400", bg: "bg-orange-500/10" };
        return { label: "Extreme", color: "text-red-400", bg: "bg-red-500/10" };
    };

    const difficulty = getDifficultyLabel();

    return (
        <>
        <LoginPromptDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header Stats */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <Card className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/20 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <Trophy className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                            <p className="text-2xl font-bold text-emerald-400">{totalWins}</p>
                            <p className="text-xs text-emerald-300">Successful Escapes</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <Target className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                            <p className="text-2xl font-bold text-blue-400">{winRate}%</p>
                            <p className="text-xs text-blue-300">Success Rate</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <Zap className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                            <p className="text-2xl font-bold text-orange-400">{streak}</p>
                            <p className="text-xs text-orange-300">Win Streak</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/20 backdrop-blur-sm">
                        <CardContent className="p-4 text-center">
                            <Wallet className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                            <p className="text-2xl font-bold text-purple-400">₹{balance.toLocaleString()}</p>
                            <p className="text-xs text-purple-300">Balance</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Settings Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-xl text-slate-200">Game Settings</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Configure your mine hunting expedition
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Bet Amount */}
                                <div>
                                    <label className="text-sm font-medium text-slate-300 mb-2 block">Bet Amount (₹)</label>
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            value={betAmount} 
                                            onChange={e => setBetAmount(Math.max(0, Number(e.target.value)))} 
                                            disabled={gameState === 'playing'} 
                                            className="text-center text-lg font-bold h-12 bg-slate-700/50 border-slate-600 text-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                            placeholder="Enter amount"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">₹</div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mt-3">
                                        {[10, 50, 100, 500].map(amt => (
                                            <Button 
                                                key={amt} 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => setBetAmount(amt)} 
                                                disabled={gameState === 'playing'}
                                                className="bg-slate-700/30 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-emerald-500"
                                            >
                                                ₹{amt}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Mine Count */}
                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-sm font-medium text-slate-300">Mines ({mineCount})</label>
                                        <Badge className={cn("text-xs", difficulty.bg, difficulty.color, "border-0")}>
                                            {difficulty.label}
                                        </Badge>
                                    </div>
                                    <Slider 
                                        value={[mineCount]} 
                                        onValueChange={([val]) => setMineCount(val)} 
                                        min={3} 
                                        max={20} 
                                        step={1} 
                                        disabled={gameState === 'playing'} 
                                        className="mt-2"
                                    />
                                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                                        <span>3 (Safe)</span>
                                        <span>20 (Extreme)</span>
                                    </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    {gameState === 'betting' && (
                                        <Button 
                                            size="lg" 
                                            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700" 
                                            onClick={handleStartGame} 
                                            disabled={user && (betAmount > balance || betAmount <= 0)}
                                        >
                                            <Shield className="mr-2 h-4 w-4" />
                                            Start Mining (₹{betAmount})
                                        </Button>
                                    )}
                                    
                                    {gameState === 'playing' && safeTilesFound > 0 && (
                                        <Button 
                                            size="lg" 
                                            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 animate-pulse" 
                                            onClick={handleCashOut}
                                        >
                                            <Gem className="mr-2 h-4 w-4" />
                                            Cash Out (₹{(potentialWin - betAmount).toFixed(2)})
                                        </Button>
                                    )}
                                    
                                    {gameState === 'ended' && (
                                        <Button 
                                            size="lg" 
                                            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700" 
                                            onClick={handleNewGame}
                                        >
                                            <Shield className="mr-2 h-4 w-4" />
                                            New Expedition
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats Panel */}
                        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                                    <Wallet className="w-5 h-5"/>
                                    Expedition Stats
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                                        <div className="text-slate-400">Multiplier</div>
                                        <div className="text-xl font-bold text-emerald-400">{currentMultiplier.toFixed(2)}x</div>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                                        <div className="text-slate-400">Gems Found</div>
                                        <div className="text-xl font-bold text-blue-400">{safeTilesFound}</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Balance</span>
                                        <span className="font-semibold text-slate-200">₹{balance.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Potential Net Win</span>
                                        <span className="font-semibold text-emerald-400">₹{(potentialWin - betAmount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Best Multiplier</span>
                                        <span className="font-semibold text-orange-400">{bestMultiplier.toFixed(2)}x</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Win Streak</span>
                                        <span className="font-semibold text-purple-400">{streak}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                    
                    {/* Mine Field */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-3"
                    >
                        <Card className="relative bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-2xl text-slate-200 flex items-center gap-2">
                                            <Gem className="w-6 h-6 text-emerald-400" />
                                            Mine Field
                                        </CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Find gems while avoiding mines • {GRID_SIZE - mineCount} gems hidden • {mineCount} mines planted
                                        </CardDescription>
                                    </div>
                                    {gameState === 'playing' && (
                                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-lg px-4 py-2">
                                            {currentMultiplier.toFixed(2)}x
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            
                            <CardContent className="p-6">
                                <div className="grid grid-cols-5 gap-3 sm:gap-4 relative">
                                    {tiles.map((tile, index) => (
                                        <motion.button 
                                            key={tile.id} 
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.02 }}
                                            whileHover={!tile.isRevealed && gameState === 'playing' ? { scale: 1.05 } : {}}
                                            whileTap={!tile.isRevealed && gameState === 'playing' ? { scale: 0.95 } : {}}
                                            onClick={() => handleTileClick(tile.id)}
                                            disabled={gameState !== 'playing' || tile.isRevealed}
                                            className={cn(
                                                "aspect-square rounded-xl flex items-center justify-center transition-all duration-300 relative overflow-hidden group",
                                                !tile.isRevealed && gameState === 'playing' && "cursor-pointer bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border-2 border-slate-600 hover:border-emerald-500 shadow-lg hover:shadow-emerald-500/25",
                                                !tile.isRevealed && gameState !== 'playing' && "bg-slate-700/50 cursor-not-allowed border-2 border-slate-600/50",
                                                tile.isRevealed && "border-2"
                                            )}
                                        >
                                            {/* Unrevealed tile shimmer effect */}
                                            {!tile.isRevealed && gameState === 'playing' && (
                                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                            )}
                                            
                                            <AnimatePresence>
                                                {tile.isRevealed && (
                                                    <motion.div
                                                        initial={{ scale: 0, rotate: -180 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        className={cn(
                                                            "w-full h-full rounded-xl flex items-center justify-center text-2xl sm:text-3xl relative",
                                                            tile.isMine 
                                                                ? "bg-gradient-to-br from-red-500 to-red-600 border-red-400" 
                                                                : "bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400"
                                                        )}
                                                    >
                                                        {tile.isMine ? (
                                                            <motion.div
                                                                animate={{ 
                                                                    scale: [1, 1.2, 1],
                                                                    rotate: [0, 10, -10, 0]
                                                                }}
                                                                transition={{ duration: 0.5 }}
                                                            >
                                                                <Bomb className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg"/>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                animate={{ 
                                                                    scale: [1, 1.2, 1],
                                                                    rotate: [0, 360]
                                                                }}
                                                                transition={{ duration: 0.6 }}
                                                            >
                                                                <Gem className="w-6 h-6 sm:w-8 sm:h-8 text-white drop-shadow-lg"/>
                                                            </motion.div>
                                                        )}
                                                        
                                                        {/* Sparkle effect for gems */}
                                                        {!tile.isMine && (
                                                            <motion.div
                                                                className="absolute inset-0 rounded-xl"
                                                                animate={{ 
                                                                    boxShadow: [
                                                                        "0 0 0 0 rgba(16, 185, 129, 0.5)",
                                                                        "0 0 0 10px rgba(16, 185, 129, 0)",
                                                                        "0 0 0 0 rgba(16, 185, 129, 0)"
                                                                    ]
                                                                }}
                                                                transition={{ duration: 1, repeat: 2 }}
                                                            />
                                                        )}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                            
                                            {/* Tile number for debugging (hidden in production) */}
                                            {!tile.isRevealed && process.env.NODE_ENV === 'development' && (
                                                <span className="absolute top-1 left-1 text-xs text-slate-500">
                                                    {tile.id}
                                                </span>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Game Over Overlay */}
                                <AnimatePresence>
                                    {gameState === 'ended' && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-lg text-white"
                                        >
                                            <motion.div
                                                initial={{ scale: 0, y: 20 }}
                                                animate={{ scale: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="text-center"
                                            >
                                                {safeTilesFound === GRID_SIZE - mineCount ? (
                                                    <>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                            className="w-24 h-24 mx-auto mb-6"
                                                        >
                                                            <Gem className="w-full h-full text-emerald-400" />
                                                        </motion.div>
                                                        <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                                                            PERFECT CLEAR!
                                                        </h2>
                                                        <p className="text-2xl text-emerald-400 font-semibold">+₹{(potentialWin - betAmount).toFixed(2)}</p>
                                                        <p className="text-slate-300 mt-2">You found all the gems!</p>
                                                    </>
                                                ) : tiles.some(t => t.isRevealed && t.isMine) ? (
                                                    <>
                                                        <motion.div
                                                            animate={{ 
                                                                scale: [1, 1.1, 1],
                                                                rotate: [0, 5, -5, 0]
                                                            }}
                                                            transition={{ duration: 0.5, repeat: 3 }}
                                                            className="w-24 h-24 mx-auto mb-6"
                                                        >
                                                            <Bomb className="w-full h-full text-red-500" />
                                                        </motion.div>
                                                        <h2 className="text-4xl font-bold mb-2 text-red-400">BOOM!</h2>
                                                        <p className="text-2xl text-red-400 font-semibold">-₹{betAmount.toFixed(2)}</p>
                                                        <p className="text-slate-300 mt-2">You hit a mine! Better luck next time.</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                            className="w-24 h-24 mx-auto mb-6"
                                                        >
                                                            <Gem className="w-full h-full text-yellow-400" />
                                                        </motion.div>
                                                        <h2 className="text-4xl font-bold mb-2 text-yellow-400">Smart Exit!</h2>
                                                        <p className="text-2xl text-emerald-400 font-semibold">+₹{(potentialWin - betAmount).toFixed(2)}</p>
                                                        <p className="text-slate-300 mt-2">You cashed out with {safeTilesFound} gems!</p>
                                                    </>
                                                )}
                                                
                                                <Button 
                                                    onClick={handleNewGame} 
                                                    className="mt-8 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                                                    size="lg"
                                                >
                                                    Start New Expedition
                                                </Button>
                                            </motion.div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* How to Play Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-12"
                >
                    <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-2xl text-slate-200 flex items-center gap-2 justify-center">
                                <HelpCircle className="w-6 h-6"/>
                                <span>Treasure Hunter Guide</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-4 gap-8">
                            {[
                                {
                                    icon: '⚙️',
                                    title: 'Configure Expedition',
                                    description: 'Set your bet amount and choose difficulty by adjusting mine count. More mines = higher risk but bigger rewards!'
                                },
                                {
                                    icon: '💎',
                                    title: 'Hunt for Gems',
                                    description: 'Click on tiles to reveal gems. Each gem increases your multiplier and potential winnings exponentially!'
                                },
                                {
                                    icon: '💣',
                                    title: 'Avoid the Mines',
                                    description: 'If you click on a mine, the expedition ends and you lose your bet. Choose your tiles wisely!'
                                },
                                {
                                    icon: '💰',
                                    title: 'Cash Out Safely',
                                    description: 'You can cash out at any time to secure your current winnings, or go for the perfect clear for maximum payout!'
                                }
                            ].map((step, index) => (
                                <motion.div 
                                    key={index}
                                    className="text-center group"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all">
                                        {step.icon}
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-200 mb-2">{step.title}</h3>
                                    <p className="text-slate-400 leading-relaxed text-sm">{step.description}</p>
                                </motion.div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
        </>
    );
}
