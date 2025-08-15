
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Coins, HelpCircle, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

export const CoinFlipGameUI = () => {
  const { user, inrBalance, updateBalance } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);

  const logGameResult = async (payout: number, result: 'heads' | 'tails') => {
    if (!user) return;
    try {
        await addDoc(collection(db, "game_history"), {
            userId: user.uid,
            game: "Coin Flip",
            betOn: selectedSide,
            betAmount: betAmount,
            outcome: payout >= 0 ? 'win' : 'loss',
            payout: payout,
            result: result,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Failed to log game result:", error);
    }
  }

  const flipCoin = async () => {
    if (!user || betAmount > inrBalance) {
      toast({ variant: 'destructive', title: 'Insufficient balance!' });
      return;
    }
    if (betAmount <= 0) {
        toast({ variant: 'destructive', title: "Invalid bet amount" });
        return;
    }

    setIsFlipping(true);
    setGameResult(null);
    setCoinResult(null);
    
    try {
        await updateBalance(user.uid, -betAmount, 'inr');
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not place your bet.' });
        setIsFlipping(false);
        return;
    }
    
    setTimeout(() => {
      const result: 'heads' | 'tails' = Math.random() < 0.5 ? 'heads' : 'tails';
      setCoinResult(result);
      setIsFlipping(false);

      if (result === selectedSide) {
        const winAmount = betAmount * 1.9;
        const netWin = winAmount - betAmount;
        updateBalance(user.uid, winAmount, 'inr');
        setGameResult('win');
        logGameResult(netWin, result);
        toast({ title: "You Won!", description: `+₹${netWin.toFixed(2)}! The coin landed on ${result}!` });
      } else {
        setGameResult('lose');
        logGameResult(-betAmount, result);
        toast({ variant: 'destructive', title: 'You Lost!', description: `The coin landed on ${result}.` });
      }
    }, 2000);
  };
  
  const potentialWin = betAmount * 1.9;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
        >
            <Card className="text-center overflow-hidden bg-card/80 backdrop-blur-sm border-white/5">
                <CardHeader>
                    <CardTitle>Flip the Coin</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-6 p-4 sm:p-8">
                <motion.div
                  className={cn(
                    'mx-auto w-32 h-32 rounded-full flex items-center justify-center text-5xl font-bold shadow-lg border-4',
                    coinResult === 'heads' ? 'bg-amber-400 text-black border-amber-500' :
                    coinResult === 'tails' ? 'bg-slate-300 text-gray-800 border-slate-400' :
                    'bg-primary text-white border-primary/50'
                  )}
                  animate={isFlipping ? { rotateY: [0, 180, 360, 540, 720, 900], scale: [1, 1.2, 1, 1.2, 1] } : {}}
                  transition={{ duration: 2, ease: "easeOut" }}
                >
                  {isFlipping ? (
                    <Coins />
                  ) : coinResult ? (
                    coinResult.charAt(0).toUpperCase()
                  ) : (
                    '?'
                  )}
                </motion.div>

                <div className="h-16">
                  {isFlipping && (
                    <p className="text-primary font-semibold animate-pulse">Flipping...</p>
                  )}
                  {gameResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'mt-4 text-2xl font-bold',
                      gameResult === 'win' ? 'text-emerald-500' : 'text-destructive'
                    )}
                  >
                    {gameResult === 'win' ? `🏆 YOU WIN! +₹${(potentialWin - betAmount).toFixed(2)}` : '💔 TRY AGAIN!'}
                  </motion.div>
                )}
                </div>

                <Button
                    size="lg"
                    onClick={flipCoin}
                    disabled={isFlipping || betAmount > inrBalance}
                    className={cn("w-full h-14 text-lg shadow-lg hover:shadow-primary/50 transition-shadow", gameResult === 'win' && 'pulse-win')}
                >
                    {isFlipping ? 'Flipping...' : 'Flip Coin'}
                </Button>
                </CardContent>
            </Card>
        </motion.div>

        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <Card className="bg-card/80 backdrop-blur-sm border-white/5">
                <CardHeader><CardTitle>Choose Your Side</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    <button
                    onClick={() => setSelectedSide('heads')}
                    className={cn('p-4 rounded-xl border-2 transition-all duration-300',
                        selectedSide === 'heads'
                        ? 'border-primary bg-primary/20 shadow-glow'
                        : 'border-border bg-muted/50 hover:border-primary/50'
                    )}
                    disabled={isFlipping}
                    >
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-400 flex items-center justify-center text-2xl font-bold text-black">H</div>
                        <h4 className="font-semibold text-foreground">HEADS</h4>
                    </button>

                    <button
                    onClick={() => setSelectedSide('tails')}
                    className={cn('p-4 rounded-xl border-2 transition-all duration-300',
                        selectedSide === 'tails'
                        ? 'border-primary bg-primary/20 shadow-glow'
                        : 'border-border bg-muted/50 hover:border-primary/50'
                    )}
                    disabled={isFlipping}
                    >
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-300 flex items-center justify-center text-2xl font-bold text-gray-800">T</div>
                        <h4 className="font-semibold text-foreground">TAILS</h4>
                    </button>
                </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card className="bg-card/80 backdrop-blur-sm border-white/5">
                <CardHeader><CardTitle>Bet Amount</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        type="number"
                        min="1"
                        max={inrBalance}
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        className="text-center text-xl font-bold h-12 bg-input/50"
                        disabled={isFlipping}
                    />
                    <div className="grid grid-cols-2 gap-2">
                    {[10, 25, 50, 100].map((amount) => (
                        <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setBetAmount(amount)}
                        disabled={isFlipping || amount > inrBalance}
                        >
                        ₹{amount}
                        </Button>
                    ))}
                    </div>
                    <Button
                    variant="secondary"
                    onClick={() => setBetAmount(inrBalance)}
                    disabled={isFlipping}
                    className="w-full"
                    >
                    All In (₹{inrBalance.toLocaleString()})
                    </Button>
                </CardContent>
                </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <Card className="bg-card/80 backdrop-blur-sm border-white/5">
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">Game Info</CardTitle>
                        <Wallet className="w-5 h-5 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Your Balance</span>
                            <span className="font-semibold text-primary">₹{inrBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Potential Win</span>
                            <span className="font-semibold text-emerald-500">₹{potentialWin.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Win Chance</span>
                            <span className="font-semibold">50%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Multiplier</span>
                            <span className="font-semibold">1.90x</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-3"
        >
            <Card className="bg-card/80 backdrop-blur-sm border-white/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5"/>
                        <span>How to Play</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">1</div>
                        <h3 className="font-semibold">Choose Side</h3>
                        <p className="text-sm text-muted-foreground">Select either Heads or Tails.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">2</div>
                        <h3 className="font-semibold">Place Bet</h3>
                        <p className="text-sm text-muted-foreground">Enter your bet amount.</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">3</div>
                        <h3 className="font-semibold">Flip & Win</h3>
                        <p className="text-sm text-muted-foreground">Flip the coin and win 1.9x your bet if you guessed correctly!</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    </div>
  );
};
