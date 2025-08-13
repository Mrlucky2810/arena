
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Gem, Bomb, Wallet, HelpCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Tile {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
}

const GRID_SIZE = 25;

export function MineSweeperGameUI() {
    const { user, balance, updateBalance } = useAuth();
    const { toast } = useToast();
    const [betAmount, setBetAmount] = useState<number>(10);
    const [mineCount, setMineCount] = useState<number>(5);
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'ended'>('betting');
    const [safeTilesFound, setSafeTilesFound] = useState(0);

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
            multiplier *= (GRID_SIZE - mineCount - i) / (GRID_SIZE - i);
        }
        return 0.98 / multiplier; // 0.98 is house edge
    }, [safeTilesFound, mineCount]);

    const potentialWin = betAmount * currentMultiplier;

    const handleStartGame = async () => {
        if (!user) return;
         if (betAmount <= 0) {
            toast({ variant: "destructive", title: "Invalid Amount", description: "Bet amount must be positive." });
            return;
        }
        if (betAmount > balance) {
            toast({ variant: "destructive", title: "Insufficient Balance", description: "You don't have enough funds to place this bet." });
            return;
        }
        try {
            await updateBalance(user.uid, -betAmount);
            setGameState('playing');
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
            logGameResult(-betAmount, 'mine');
            toast({ variant: "destructive", title: "BOOM!", description: `You hit a mine and lost ₹${betAmount}.` });
            setTimeout(() => {
                setTiles(prev => prev.map(t => ({...t, isRevealed: t.isMine || t.isRevealed})));
            }, 500);
        } else {
            const newSafeTilesFound = safeTilesFound + 1;
            setSafeTilesFound(newSafeTilesFound);
            
            if (newSafeTilesFound === GRID_SIZE - mineCount) {
                const finalWin = betAmount * currentMultiplier;
                updateBalance(user.uid, finalWin + betAmount); // Winnings + stake back
                setGameState('ended');
                logGameResult(finalWin, 'perfect');
                toast({ title: "PERFECT!", title_2: `You found all gems and won ₹${(finalWin).toFixed(2)}!` });
            }
        }
    };
    
    const handleCashOut = async () => {
        if (gameState !== 'playing' || safeTilesFound === 0 || !user) return;
        const netWin = potentialWin - betAmount;
        try {
            await updateBalance(user.uid, potentialWin); // Winnings + Stake back
            setGameState('ended');
            await logGameResult(netWin, 'cash_out'); // Log net winnings
            toast({ title: "Cashed Out!", description: `You won ₹${netWin.toFixed(2)}` });
        } catch(error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to cash out. Please try again." });
        }
    }

    const handleNewGame = () => {
        initializeGrid();
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Game Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <label className="text-sm font-medium">Bet Amount (₹)</label>
                                <Input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} disabled={gameState === 'playing'} className="mt-1"/>
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    {[10, 50, 100, 500].map(amt => <Button key={amt} variant="outline" size="sm" onClick={() => setBetAmount(amt)} disabled={gameState === 'playing'}>₹{amt}</Button>)}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Mines ({mineCount})</label>
                                <Slider value={[mineCount]} onValueChange={([val]) => setMineCount(val)} min={3} max={20} step={1} disabled={gameState === 'playing'} className="mt-2" />
                            </div>
                            {gameState === 'betting' && (
                                <Button size="lg" className="w-full" onClick={handleStartGame} disabled={betAmount > balance || betAmount <= 0}>Start Game</Button>
                            )}
                            {gameState === 'playing' && (
                                <Button size="lg" variant="secondary" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCashOut} disabled={safeTilesFound === 0}>
                                    Cash Out (₹{(potentialWin - betAmount).toFixed(2)})
                                </Button>
                            )}
                             {gameState === 'ended' && (
                                <Button size="lg" className="w-full" onClick={handleNewGame}>Play Again</Button>
                            )}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Game Info</CardTitle>
                            <Wallet className="w-5 h-5 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Balance</span>
                                <span className="font-semibold">₹{balance.toLocaleString()}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Multiplier</span>
                                <span className="font-semibold text-primary">{currentMultiplier.toFixed(2)}x</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Safe Tiles Found</span>
                                <span className="font-semibold text-emerald-500">{safeTilesFound}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Potential Net Win</span>
                                <span className="font-semibold text-emerald-500">₹{(potentialWin - betAmount).toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="lg:col-span-2">
                    <Card className="relative aspect-square">
                        <div className="grid grid-cols-5 gap-2 p-2 sm:p-4">
                            {tiles.map(tile => (
                                <button 
                                    key={tile.id} 
                                    onClick={() => handleTileClick(tile.id)}
                                    disabled={gameState !== 'playing' || tile.isRevealed}
                                    className={cn(
                                        "aspect-square rounded-lg flex items-center justify-center transition-all duration-300 transform-style-3d",
                                        !tile.isRevealed && gameState === 'playing' && "cursor-pointer bg-muted hover:bg-primary/20",
                                        !tile.isRevealed && gameState !== 'playing' && "bg-muted/50 cursor-not-allowed",
                                        tile.isRevealed && "rotate-y-180",
                                    )}
                                >
                                    <div className={cn("absolute w-full h-full backface-hidden flex items-center justify-center")}>
                                        {/* Front of card - hidden when revealed */}
                                    </div>
                                    <div className={cn(
                                        "absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center rounded-lg",
                                        tile.isMine ? "bg-destructive/20 text-destructive" : "bg-emerald-500/20 text-emerald-500"
                                    )}>
                                        {tile.isMine ? <Bomb className="w-1/2 h-1/2"/> : <Gem className="w-1/2 h-1/2"/>}
                                    </div>
                                </button>
                            ))}
                        </div>
                        {gameState === 'ended' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 rounded-lg text-white">
                                 {safeTilesFound === 25 - mineCount ? (
                                    <>
                                        <Gem className="w-20 h-20 text-emerald-400 mb-4" />
                                        <h2 className="text-3xl font-bold">PERFECT RUN!</h2>
                                        <p className="text-xl text-emerald-400 font-semibold">+₹{(potentialWin - betAmount).toFixed(2)}</p>
                                    </>
                                ) : tiles.some(t=>t.isRevealed && t.isMine) === false && safeTilesFound > 0 ? (
                                    <>
                                        <Gem className="w-20 h-20 text-emerald-400 mb-4" />
                                        <h2 className="text-3xl font-bold">Cashed Out!</h2>
                                        <p className="text-xl text-emerald-400 font-semibold">+₹{(potentialWin - betAmount).toFixed(2)}</p>
                                    </>
                                ) : (
                                    <>
                                        <Bomb className="w-20 h-20 text-red-500 mb-4" />
                                        <h2 className="text-3xl font-bold">Game Over!</h2>
                                        <p className="text-xl text-red-500 font-semibold">-₹{betAmount.toFixed(2)}</p>
                                    </>
                                )}
                                <Button onClick={handleNewGame} className="mt-6">Play Again</Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5"/>
                        <span>How to Play</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-4 gap-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">1</div>
                        <h3 className="font-semibold">Set Bet</h3>
                        <p className="text-sm text-muted-foreground">Set your bet amount and the number of mines.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">2</div>
                        <h3 className="font-semibold">Find Gems</h3>
                        <p className="text-sm text-muted-foreground">Click on tiles to find gems. Each gem increases your winnings.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">3</div>
                        <h3 className="font-semibold">Avoid Mines</h3>
                        <p className="text-sm text-muted-foreground">If you click on a mine, the game ends and you lose your bet.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">4</div>
                        <h3 className="font-semibold">Cash Out</h3>
                        <p className="text-sm text-muted-foreground">Click "Cash Out" at any time to collect your current winnings.</p>
                    </div>
                </CardContent>
            </Card>
            <style jsx>{`
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>
        </div>
    );
}
