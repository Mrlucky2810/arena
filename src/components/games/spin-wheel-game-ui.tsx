
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Play, Wallet, Trophy, Target, Zap, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { LoginPromptDialog } from '../auth/login-prompt-dialog';

const segments = [
    { label: '2x', multiplier: 2, color: 'from-teal-500 to-teal-600', probability: 25, bgColor: 'bg-teal-500' },
    { label: 'Lose', multiplier: 0, color: 'from-slate-600 to-slate-700', probability: 30, bgColor: 'bg-slate-600' },
    { label: '1.5x', multiplier: 1.5, color: 'from-sky-500 to-sky-600', probability: 20, bgColor: 'bg-sky-500' },
    { label: 'Lose', multiplier: 0, color: 'from-slate-700 to-slate-800', probability: 15, bgColor: 'bg-slate-700' },
    { label: '5x', multiplier: 5, color: 'from-fuchsia-500 to-fuchsia-600', probability: 8, bgColor: 'bg-fuchsia-500' },
    { label: 'Lose', multiplier: 0, color: 'from-slate-800 to-slate-900', probability: 2, bgColor: 'bg-slate-800' }
];

const totalProbability = segments.reduce((acc, seg) => acc + seg.probability, 0);

export function SpinWheelGameUI() {
  const { user, inrBalance, updateBalance } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [totalWins, setTotalWins] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [bestMultiplier, setBestMultiplier] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const balance = user ? inrBalance : 0;

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
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    if (betAmount > inrBalance) {
      toast({ variant: 'destructive', title: 'Insufficient balance!' });
      return;
    }
    if (betAmount <= 0) {
        toast({ variant: 'destructive', title: "Invalid bet amount" });
        return;
    }

    setIsSpinning(true);
    setResult(null);
    setSelectedSegment(null);
    setTotalGames(prev => prev + 1);
    
    try {
        await updateBalance(user.uid, -betAmount, 'inr');
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not place your bet.' });
        setIsSpinning(false);
        return;
    }

    const random = Math.random() * totalProbability;
    let cumulative = 0;
    let selectedSegmentData = segments[0];
    let selectedIndex = 0;

    for (const [index, segment] of segments.entries()) {
      cumulative += segment.probability;
      if (random <= cumulative) {
        selectedSegmentData = segment;
        selectedIndex = index;
        break;
      }
    }

    const segmentAngle = 360 / segments.length;
    const targetRotation = 360 * 8 + (360 - (selectedIndex * segmentAngle) - segmentAngle / 2);
    setRotation(prev => prev + targetRotation);
    setSelectedSegment(selectedIndex);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(selectedSegmentData.label);

      if (selectedSegmentData.multiplier > 0) {
        const winAmount = Math.floor(betAmount * selectedSegmentData.multiplier);
        const netWin = winAmount - betAmount;
        updateBalance(user.uid, winAmount, 'inr');
        setTotalWins(prev => prev + 1);
        setStreak(prev => prev + 1);
        setBestMultiplier(prev => Math.max(prev, selectedSegmentData.multiplier));
        logGameResult(netWin, selectedSegmentData.label);
        toast({ 
          title: "🎉 Jackpot!", 
          description: `+₹${netWin} won! Landed on ${selectedSegmentData.label}!`,
          className: "bg-emerald-50 border-emerald-200 text-emerald-800"
        });
      } else {
        setStreak(0);
        logGameResult(-betAmount, selectedSegmentData.label);
        toast({ 
          variant: 'destructive', 
          title: '💔 You Lost!', 
          description: `Landed on ${selectedSegmentData.label}. Try again!` 
        });
      }
    }, 4000);
  };
  
  const potentialWin = betAmount * 5;
  const winChance = segments.reduce((acc, s) => s.multiplier > 0 ? acc + s.probability : acc, 0);
  const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0.0';

  return (
    <>
    <LoginPromptDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
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
              <p className="text-xs text-emerald-300">Total Wins</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold text-blue-400">{winRate}%</p>
              <p className="text-xs text-blue-300">Win Rate</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Wheel Area */}
          <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
          >
              <Card className="text-center overflow-hidden bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
                    Wheel of Fortune
                  </CardTitle>
                   {streak > 0 && (
                    <Badge className="mx-auto w-fit bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      🔥 {streak} Win Streak!
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="flex flex-col items-center justify-center gap-8 p-8">
                  {/* Wheel Container */}
                  <div className="relative w-80 h-80 sm:w-96 sm:h-96">
                    {/* Wheel pointer */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
                      <div className="w-0 h-0 border-x-12 border-x-transparent border-b-20 border-b-purple-400" style={{borderLeftWidth: '12px', borderRightWidth: '12px', borderBottomWidth: '20px'}}/>
                    </div>
                    
                    {/* Wheel */}
                    <motion.div
                        className="relative w-full h-full rounded-full border-8 border-slate-700 shadow-2xl overflow-hidden"
                        animate={{ rotate: rotation }}
                        transition={{ duration: 4, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        {segments.map((segment, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "absolute w-1/2 h-1/2 origin-bottom-right",
                                    `bg-gradient-to-br ${segment.color}`
                                )}
                                style={{
                                    transform: `rotate(${index * (360 / segments.length)}deg)`,
                                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 0)",
                                }}
                            >
                                <div className="absolute w-full h-full" style={{transform: 'rotate(0deg)'}}>
                                    <div 
                                        className="absolute text-white font-bold text-lg sm:text-xl"
                                        style={{
                                            transform: `translateX(70%) translateY(40%) rotate(${(360 / segments.length) / 2}deg)`
                                        }}
                                    >
                                        {segment.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                    
                    {/* Inner circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-800 border-4 border-slate-600 shadow-inner flex items-center justify-center">
                        <Play className="w-10 h-10 text-purple-400" />
                    </div>
                  </div>
                  
                  {/* Result Display */}
                  <div className="h-20 flex items-center justify-center">
                    <AnimatePresence>
                      {isSpinning ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="text-center"
                        >
                          <div className="flex items-center justify-center gap-2 text-purple-400 font-semibold text-xl">
                            <RotateCcw className="animate-spin" />
                            <span>Spinning...</span>
                          </div>
                          <div className="text-sm text-slate-400 mt-1">Good luck!</div>
                        </motion.div>
                      ) : result && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="text-center"
                        >
                           <motion.div
                              className={cn(
                                'text-3xl font-bold mb-2',
                                result !== 'Lose' ? 'text-emerald-400' : 'text-red-400'
                              )}
                              animate={result !== 'Lose' ? { 
                                textShadow: [
                                  "0 0 0px rgba(34, 197, 94, 0.5)",
                                  "0 0 20px rgba(34, 197, 94, 0.8)",
                                  "0 0 0px rgba(34, 197, 94, 0.5)"
                                ]
                              } : {}}
                              transition={{ duration: 1, repeat: result !== 'Lose' ? 2 : 0 }}
                            >
                              {result !== 'Lose' ? `🏆 WINNER! ${result}` : '💔 TRY AGAIN!'}
                           </motion.div>
                           <div className="text-slate-400">
                             {result !== 'Lose'
                               ? `Congratulations! You hit ${result}!`
                               : 'Better luck on the next spin!'}
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Action Button */}
                  <motion.div className="w-full">
                    <Button 
                        size="lg" 
                        onClick={spinWheel} 
                        disabled={isSpinning || (user && (betAmount > balance || betAmount <= 0))}
                        className={cn(
                          "w-full h-16 text-xl font-bold shadow-2xl transition-all duration-300 relative overflow-hidden group",
                          result && result !== 'Lose' 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 animate-pulse' 
                            : 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700'
                        )}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <span className="relative z-10 flex items-center justify-center gap-3">
                          {isSpinning ? (
                            <>
                              <RotateCcw className="animate-spin" />
                              Spinning...
                            </>
                          ) : (
                            <>
                              <Play />
                              Spin for ₹{betAmount}
                            </>
                          )}
                      </span>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
          </motion.div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Bet Amount */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                    <Wallet className="w-5 h-5"/>
                    Bet Amount
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                      <Input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                          className="text-center text-xl font-bold h-14 bg-slate-700/50 border-slate-600 text-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                          disabled={isSpinning}
                          placeholder="Enter amount"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        ₹
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                    {[10, 25, 50, 100].map((amount) => (
                        <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setBetAmount(amount)}
                        disabled={isSpinning || (user && amount > balance)}
                        className="bg-slate-700/30 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-purple-500"
                        >
                        ₹{amount}
                        </Button>
                    ))}
                    </div>
                    
                    <Button
                      variant="secondary"
                      onClick={() => setBetAmount(balance)}
                      disabled={isSpinning || !user}
                      className="w-full bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/30 text-red-300 hover:from-red-600/30 hover:to-orange-600/30"
                    >
                      All In (₹{balance.toLocaleString()})
                    </Button>
                </CardContent>
                </Card>
            </motion.div>

            {/* Game Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                            <Target className="w-5 h-5"/>
                            Game Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                            <div className="text-slate-400">Max Win</div>
                            <div className="text-xl font-bold text-emerald-400">₹{potentialWin.toLocaleString()}</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                            <div className="text-slate-400">Win Chance</div>
                            <div className="text-xl font-bold text-blue-400">{winChance}%</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                              <span className="text-slate-400">Games Played</span>
                              <span className="font-semibold text-slate-200">{totalGames}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-slate-400">Best Multiplier</span>
                              <span className="font-semibold text-orange-400">{bestMultiplier.toFixed(2)}x</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-slate-400">Current Streak</span>
                              <span className="font-semibold text-purple-400">{streak}</span>
                          </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Segments */}
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-200">Segments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {segments.map((segment, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30">
                                <div className="flex items-center space-x-2">
                                    <div className={cn("w-4 h-4 rounded-full", segment.bgColor)}></div>
                                    <span className="font-medium text-slate-200">{segment.label}</span>
                                </div>
                                <span className="text-slate-400 text-sm">{segment.probability}%</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
