
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Play, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

const segments = [
    { label: '2x', multiplier: 2, color: 'bg-teal-500', probability: 25 },
    { label: 'Lose', multiplier: 0, color: 'bg-slate-600', probability: 30 },
    { label: '1.5x', multiplier: 1.5, color: 'bg-sky-500', probability: 20 },
    { label: 'Lose', multiplier: 0, color: 'bg-slate-700', probability: 15 },
    { label: '5x', multiplier: 5, color: 'bg-fuchsia-500', probability: 8 },
    { label: 'Lose', multiplier: 0, color: 'bg-slate-800', probability: 2 }
];

const totalProbability = segments.reduce((acc, seg) => acc + seg.probability, 0);

export function SpinWheelGameUI() {
  const { user, inrBalance, updateBalance } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const logGameResult = async (payout: number, resultLabel: string) => {
    if (!user) return;
    try {
        await addDoc(collection(db, "game_history"), {
            userId: user.uid,
            game: "Spin Wheel",
            betAmount: betAmount,
            outcome: payout >= 0 ? 'win' : 'loss',
            payout: payout,
            result: resultLabel,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Failed to log game result:", error);
    }
  }

  const spinWheel = async () => {
    if (!user || betAmount > inrBalance) {
      toast({ variant: 'destructive', title: 'Insufficient balance!' });
      return;
    }
    if (betAmount <= 0) {
        toast({ variant: 'destructive', title: "Invalid bet amount" });
        return;
    }

    setIsSpinning(true);
    setResult(null);
    
    try {
        await updateBalance(user.uid, -betAmount, 'inr');
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not place your bet.' });
        setIsSpinning(false);
        return;
    }

    const random = Math.random() * totalProbability;
    let cumulative = 0;
    let selectedSegment = segments[0];
    let selectedIndex = 0;

    for (const [index, segment] of segments.entries()) {
      cumulative += segment.probability;
      if (random <= cumulative) {
        selectedSegment = segment;
        selectedIndex = index;
        break;
      }
    }

    const segmentAngle = 360 / segments.length;
    const targetRotation = 360 * 5 + (360 - (selectedIndex * segmentAngle) - segmentAngle / 2);
    setRotation(prev => prev + targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(selectedSegment.label);

      if (selectedSegment.multiplier > 0) {
        const winAmount = Math.floor(betAmount * selectedSegment.multiplier);
        const netWin = winAmount - betAmount;
        updateBalance(user.uid, winAmount, 'inr');
        logGameResult(netWin, selectedSegment.label);
        toast({ title: "You Won!", description: `+₹${netWin}! Landed on ${selectedSegment.label}!` });
      } else {
        logGameResult(-betAmount, selectedSegment.label);
        toast({ variant: 'destructive', title: 'You Lost!', description: `Landed on ${selectedSegment.label}.` });
      }
    }, 4000);
  };
  
  const potentialWin = betAmount * 5;
  const winChance = segments.reduce((acc, s) => s.multiplier > 0 ? acc + s.probability : acc, 0);

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
                    <CardTitle>Wheel of Fortune</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center gap-6 p-4 sm:p-8">
                <div className="relative mx-auto w-64 h-64 sm:w-80 sm:h-80 mb-8">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-10">
                      <div
                        className="w-0 h-0 
                        border-l-[15px] border-l-transparent
                        border-r-[15px] border-r-transparent
                        border-t-[30px] border-t-primary"
                      ></div>
                    </div>
                    
                    <motion.div
                        className="w-full h-full rounded-full border-4 border-primary shadow-xl relative overflow-hidden"
                        animate={{ rotate: rotation }}
                        transition={{ duration: 4, ease: "easeOut" }}
                    >
                        {segments.map((segment, index) => {
                        const angle = 360 / segments.length;
                        return (
                            <div
                            key={index}
                            className={cn("absolute w-full h-full", segment.color)}
                            style={{
                                clipPath: `polygon(50% 50%, 100% 50%, 100% 0, 50% 0)`,
                                transform: `rotate(${angle * index}deg)`,
                            }}
                            >
                            <div
                                className="absolute text-white font-bold text-lg w-1/2 h-1/2 flex items-center justify-center"
                                style={{ transform: `rotate(${angle/2}deg) translate(25%, 25%)`}}
                            >
                                {segment.label}
                            </div>
                            </div>
                        );
                        })}
                        
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-background rounded-full border-4 border-primary flex items-center justify-center">
                            <Play className="text-primary" />
                        </div>
                    </motion.div>
                </div>

                {result && !isSpinning && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn("mb-6 text-2xl font-bold",
                            result !== 'Lose' ? 'text-emerald-500' : 'text-destructive'
                        )}
                    >
                    {result !== 'Lose' ? `🏆 Won ${result}!` : '💔 Better luck next time!'}
                    </motion.div>
                )}

                <Button
                    size="lg"
                    onClick={spinWheel}
                    disabled={isSpinning || betAmount > inrBalance}
                    className={cn("w-full h-14 text-lg shadow-lg hover:shadow-primary/50 transition-shadow", result && result !== 'Lose' && 'pulse-win')}
                >
                    {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
                </Button>
                </CardContent>
            </Card>
        </motion.div>

        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
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
                        disabled={isSpinning}
                    />
                    <div className="grid grid-cols-2 gap-2">
                    {[10, 25, 50, 100].map((amount) => (
                        <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setBetAmount(amount)}
                        disabled={isSpinning || amount > inrBalance}
                        >
                        ₹{amount}
                        </Button>
                    ))}
                    </div>
                    <Button
                    variant="secondary"
                    onClick={() => setBetAmount(inrBalance)}
                    disabled={isSpinning}
                    className="w-full"
                    >
                    All In (₹{inrBalance.toLocaleString()})
                    </Button>
                </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
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
                            <span className="text-muted-foreground">Bet Amount</span>
                            <span className="font-semibold">₹{betAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Max Win</span>
                            <span className="font-semibold text-emerald-500">₹{potentialWin.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Win Chance</span>
                            <span className="font-semibold">{winChance}%</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <Card className="bg-card/80 backdrop-blur-sm border-white/5">
                <CardHeader>
                    <CardTitle className="text-lg">Segments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {segments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-2">
                        <div className={cn(`w-4 h-4 rounded-full`, segment.color)}></div>
                        <span className="font-medium">{segment.label}</span>
                        </div>
                        <span className="text-muted-foreground text-sm">{segment.probability}%</span>
                    </div>
                    ))}
                </CardContent>
                </Card>
            </motion.div>
        </div>
    </div>
  );
};
