"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Wallet, Trophy, Target, Zap, Timer, Palette, TrendingUp } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const BETTING_DURATION = 30;

export function ColorPredictionUI() {
  const { user, inrBalance, updateBalance } = useAuth();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(BETTING_DURATION);
  const [betAmount, setBetAmount] = useState(10);
  const [activeBets, setActiveBets] = useState<{ [key: string]: number }>({});
  const [lastResult, setLastResult] = useState<{ round: number, color: string, number: number } | null>(null);
  const [roundHistory, setRoundHistory] = useState<Array<{ color: string, number: number }>>([]);
  const [totalWins, setTotalWins] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const logGameResult = async (bet: {key: string, amount: number}, winAmount: number) => {
    if (!user) return;
    try {
        await addDoc(collection(db, "game_history"), {
            userId: user.uid,
            game: "Color Prediction",
            betOn: bet.key,
            betAmount: bet.amount,
            outcome: winAmount >= 0 ? 'win' : 'loss',
            payout: winAmount,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Failed to log game result:", error);
    }
  }

  const handleRoundEnd = async () => {
    if (!user) return;
    setIsAnimating(true);
    
    const winningNumber = Math.floor(Math.random() * 10);
    const colors: { [key: string]: string } = { 
      '0': 'green', '5': 'green', 
      '1': 'red', '3': 'red', '7': 'red', '9': 'red', 
      '2': 'violet', '4': 'violet', '6': 'violet', '8': 'violet' 
    };
    
    let winningColor = 'red';
    if (['0', '5'].includes(winningNumber.toString())) winningColor = 'green';
    if (['2', '4', '6', '8'].includes(winningNumber.toString())) winningColor = 'violet';

    // Add to history
    setRoundHistory(prev => [{ color: winningColor, number: winningNumber }, ...prev.slice(0, 9)]);
    setLastResult({ round: Math.floor(Math.random() * 100000), color: winningColor, number: winningNumber });

    let totalWinnings = 0;
    let totalLosses = 0;
    let hasWon = false;

    for (const betKey in activeBets) {
        const betValue = activeBets[betKey];
        let winForThisBet = 0;
        let isWin = false;

        if (betKey === winningColor) {
            isWin = true;
            hasWon = true;
            const multiplier = winningColor === 'violet' ? 4.5 : 2;
            winForThisBet = betValue * multiplier;
        } else if (parseInt(betKey, 10) === winningNumber) {
            isWin = true;
            hasWon = true;
            winForThisBet = betValue * 9;
        }
        
        if (isWin) {
            totalWinnings += winForThisBet;
            await logGameResult({ key: betKey, amount: betValue }, winForThisBet - betValue);
        } else {
            totalLosses += betValue;
            await logGameResult({ key: betKey, amount: betValue }, -betValue);
        }
    }
    
    // Update stats
    if (Object.keys(activeBets).length > 0) {
      setTotalGames(prev => prev + 1);
      if (hasWon) {
        setTotalWins(prev => prev + 1);
        setStreak(prev => prev + 1);
      } else {
        setStreak(0);
      }
    }
    
    if (totalWinnings > 0) {
        try {
            await updateBalance(user.uid, totalWinnings, 'inr');
            toast({ 
              title: "🎉 You Won!", 
              description: `+₹${totalWinnings.toFixed(2)} added to your balance!`,
              className: "bg-emerald-50 border-emerald-200 text-emerald-800"
            });
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "There was an issue updating your balance."});
        }
    }
    
    if (totalLosses > 0 && totalWinnings === 0) {
        toast({ 
          variant: "destructive", 
          title: "💔 You Lost", 
          description: `You lost ₹${totalLosses.toFixed(2)} this round. Try again!` 
        });
    }

    setTimeout(() => setIsAnimating(false), 2000);
  };

  useEffect(() => {
    if (timeLeft === 0) {
      handleRoundEnd();
      setTimeout(() => {
        setLastResult(null);
        setActiveBets({});
        setTimeLeft(BETTING_DURATION);
      }, 5000); 
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const progress = (timeLeft / BETTING_DURATION) * 100;
  const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0.0';
  
  const placeBet = async (key: string) => {
    if (!user) return;
    if (timeLeft <= 5) {
        toast({ variant: "destructive", title: "Too Late!", description: "Betting is closed for this round." });
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
        setActiveBets(prev => ({
            ...prev,
            [key]: (prev[key] || 0) + betAmount
        }));
        toast({ 
          title: "✅ Bet Placed!", 
          description: `₹${betAmount} bet on ${key}`,
          className: "bg-blue-50 border-blue-200 text-blue-800"
        });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not place your bet. Please try again." });
    }
  }

  const getColorForNumber = (num: number) => {
    if ([0, 5].includes(num)) return 'green';
    if ([2, 4, 6, 8].includes(num)) return 'violet';
    return 'red';
  };

  const getBetTotal = () => {
    return Object.values(activeBets).reduce((sum, amount) => sum + amount, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 p-4">
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
              <p className="text-2xl font-bold text-purple-400">₹{inrBalance.toLocaleString()}</p>
              <p className="text-xs text-purple-300">Balance</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Round Timer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                      <Timer className="w-5 h-5" />
                      Round #{lastResult ? lastResult.round + 1 : '857231'}
                    </CardTitle>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm">Time Remaining</p>
                      <p className={cn(
                        "font-bold text-2xl transition-colors",
                        timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-slate-200"
                      )}>
                        {timeLeft}s
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={progress} 
                    className={cn(
                      "h-3 transition-all",
                      timeLeft <= 5 && "animate-pulse [&>div]:bg-red-500"
                    )} 
                  />
                  {timeLeft <= 5 && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-red-400 font-semibold mt-2"
                    >
                      🔒 Betting Closed
                    </motion.p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Result Display */}
            <AnimatePresence>
              {lastResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                >
                  <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-200 text-center flex items-center justify-center gap-2">
                        <Palette className="w-5 h-5" />
                        Round Result
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <motion.div
                        className="flex items-center justify-center gap-4 mb-4"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: 2 }}
                      >
                        <div className={cn(
                          "w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg",
                          lastResult.color === 'green' && "bg-gradient-to-br from-emerald-500 to-green-600",
                          lastResult.color === 'red' && "bg-gradient-to-br from-red-500 to-red-600",
                          lastResult.color === 'violet' && "bg-gradient-to-br from-violet-500 to-purple-600"
                        )}>
                          {lastResult.number}
                        </div>
                        <div className="text-left">
                          <p className="text-2xl font-bold text-slate-200">
                            {lastResult.color.toUpperCase()}
                          </p>
                          <p className="text-slate-400">Number: {lastResult.number}</p>
                        </div>
                      </motion.div>
                      
                      {Object.keys(activeBets).length > 0 && (
                        <div className="mt-4 p-4 rounded-lg bg-slate-700/30">
                          <h4 className="font-semibold text-slate-200 mb-2">Your Bets This Round:</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {Object.entries(activeBets).map(([key, amount]) => {
                              const isWin = key === lastResult.color || parseInt(key) === lastResult.number;
                              return (
                                <div key={key} className={cn(
                                  "flex justify-between p-2 rounded",
                                  isWin ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                                )}>
                                  <span>{key}: ₹{amount}</span>
                                  <span>{isWin ? "✅ WIN" : "❌ LOSS"}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Betting Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Place Your Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Color Bets */}
                  <div>
                    <h3 className="font-semibold text-slate-300 mb-3">Predict Color</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { key: 'green', label: 'Green', multiplier: '2x', gradient: 'from-emerald-500 to-green-600', numbers: '0, 5' },
                        { key: 'violet', label: 'Violet', multiplier: '4.5x', gradient: 'from-violet-500 to-purple-600', numbers: '2, 4, 6, 8' },
                        { key: 'red', label: 'Red', multiplier: '2x', gradient: 'from-red-500 to-red-600', numbers: '1, 3, 7, 9' }
                      ].map((color) => (
                        <motion.button
                          key={color.key}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => placeBet(color.key)}
                          disabled={timeLeft <= 5 || isAnimating}
                          className={cn(
                            "relative p-4 rounded-xl text-white font-semibold transition-all duration-300 overflow-hidden group",
                            `bg-gradient-to-br ${color.gradient}`,
                            "hover:shadow-lg hover:shadow-current/25",
                            (timeLeft <= 5 || isAnimating) && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          <div className="relative z-10">
                            <div className="text-lg font-bold">{color.label}</div>
                            <div className="text-sm opacity-90">{color.multiplier}</div>
                            <div className="text-xs opacity-75 mt-1">({color.numbers})</div>
                            {activeBets[color.key] && (
                              <Badge className="mt-2 bg-white/20 text-white border-0">
                                ₹{activeBets[color.key]}
                              </Badge>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Number Bets */}
                  <div>
                    <h3 className="font-semibold text-slate-300 mb-3">Predict Number (9x Payout)</h3>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                      {Array.from({length: 10}, (_, i) => {
                        const colorClass = getColorForNumber(i);
                        return (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => placeBet(i.toString())}
                            disabled={timeLeft <= 5 || isAnimating}
                            className={cn(
                              "relative h-12 rounded-lg font-bold text-white transition-all duration-300 group",
                              colorClass === 'green' && "bg-gradient-to-br from-emerald-500 to-green-600",
                              colorClass === 'red' && "bg-gradient-to-br from-red-500 to-red-600",
                              colorClass === 'violet' && "bg-gradient-to-br from-violet-500 to-purple-600",
                              "hover:shadow-lg",
                              (timeLeft <= 5 || isAnimating) && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                            <span className="relative z-10">{i}</span>
                            {activeBets[i] && (
                              <Badge className="absolute -top-1 -right-1 p-1 h-auto leading-none bg-white/20 text-white border-0 text-xs">
                                ₹{activeBets[i]}
                              </Badge>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bet Amount Controls */}
                  <div className="border-t border-slate-600 pt-4">
                    <h3 className="font-semibold text-slate-300 mb-3">Bet Amount</h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {[10, 100, 1000, 5000].map(amount => (
                        <Button 
                          key={amount} 
                          variant={betAmount === amount ? "default" : "outline"} 
                          onClick={() => setBetAmount(amount)} 
                          disabled={timeLeft <= 5 || isAnimating}
                          className="bg-slate-700/30 border-slate-600 text-slate-200 hover:bg-slate-600/50"
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                    <Input 
                      type="number" 
                      value={betAmount} 
                      onChange={e => setBetAmount(Math.max(0, Number(e.target.value)))} 
                      className="bg-slate-700/50 border-slate-600 text-slate-200 focus:border-violet-500" 
                      disabled={timeLeft <= 5 || isAnimating}
                      placeholder="Custom amount"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Balance & Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5"/>
                    Game Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                      <div className="text-slate-400">Current Bets</div>
                      <div className="text-xl font-bold text-violet-400">₹{getBetTotal()}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                      <div className="text-slate-400">Balance</div>
                      <div className="text-xl font-bold text-emerald-400">₹{inrBalance.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Games Played</span>
                      <span className="font-semibold text-slate-200">{totalGames}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Win Streak</span>
                      <span className="font-semibold text-orange-400">{streak}</span>
                    </div>
                    {Object.keys(activeBets).length > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <h4 className="font-semibold text-violet-300 mb-2">Active Bets:</h4>
                        {Object.entries(activeBets).map(([key, amount]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-slate-300">{key}:</span>
                            <span className="text-violet-300">₹{amount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-200">Recent Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {roundHistory.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {roundHistory.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg",
                            result.color === 'green' && "bg-gradient-to-br from-emerald-500 to-green-600",
                            result.color === 'red' && "bg-gradient-to-br from-red-500 to-red-600",
                            result.color === 'violet' && "bg-gradient-to-br from-violet-500 to-purple-600"
                          )}
                          title={`${result.color} - ${result.number}`}
                        >
                          {result.number}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center">No recent results</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Game Records */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Tabs defaultValue="my-records" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
                  <TabsTrigger value="all-records" className="data-[state=active]:bg-slate-600">All Records</TabsTrigger>
                  <TabsTrigger value="my-records" className="data-[state=active]:bg-slate-600">My Records</TabsTrigger>
                </TabsList>
                <TabsContent value="my-records">
                  <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                    <CardContent className="p-4 text-center text-sm text-slate-400">
                      <div className="space-y-2">
                        <div className="text-slate-300 font-semibold">Your Statistics</div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="text-emerald-400 font-bold">{totalWins}</div>
                            <div>Wins</div>
                          </div>
                          <div>
                            <div className="text-red-400 font-bold">{totalGames - totalWins}</div>
                            <div>Losses</div>
                          </div>
                        </div>
                        <div className="text-violet-400 font-semibold">
                          Win Rate: {winRate}%
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="all-records">
                  <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50">
                    <CardContent className="p-4 text-center text-sm text-slate-400">
                      Global leaderboard and statistics coming soon...
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>

        {/* How to Play */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-200 flex items-center gap-2 justify-center">
                <Palette className="w-6 h-6"/>
                <span>How to Play Color Prediction</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎨',
                  title: 'Choose Your Prediction',
                  description: 'Select a color (Green 2x, Red 2x, Violet 4.5x) or predict the exact number (9x payout). Multiple bets allowed!'
                },
                {
                  icon: '⏰',
                  title: 'Place Bets in Time',
                  description: 'You have 30 seconds to place your bets. Betting closes 5 seconds before the round ends.'
                },
                {
                  icon: '🎯',
                  title: 'Win Big Rewards',
                  description: 'If your prediction is correct, win according to the multiplier. Build streaks for consistent profits!'
                }
              ].map((step, index) => (
                <motion.div 
                  key={index}
                  className="text-center group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-violet-500/25 transition-all">
                    {step.icon}
                  </div>
                  <h3 className="font-bold text-lg text-slate-200 mb-2">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}