
"use client";

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Coins, HelpCircle, Wallet, TrendingUp, Zap, Trophy, Target, Banknote, Bitcoin, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { LoginPromptDialog } from '../auth/login-prompt-dialog';

export const CoinFlipGameUI = () => {
  const { user, inrBalance, wallets, updateBalance } = useAuth();
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedSide, setSelectedSide] = useState<'heads' | 'tails'>('heads');
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
  const [streak, setStreak] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [wallet, setWallet] = useState('inr');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const selectedBalance = user ? (wallet === 'inr' ? inrBalance : (wallets ? wallets[wallet] || 0 : 0)) : 0;
  const hasCryptoWallets = user && wallets && Object.keys(wallets).length > 0;

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
            currency: wallet,
        });
    } catch (error) {
        console.error("Failed to log game result:", error);
    }
  }

  const flipCoin = async () => {
    if (!user) {
        setShowLoginPrompt(true);
        return;
    }
    if (betAmount > selectedBalance) {
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
        await updateBalance(user.uid, -betAmount, wallet);
        setTotalGames(prev => prev + 1);
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
        updateBalance(user.uid, winAmount, wallet);
        setGameResult('win');
        setStreak(prev => prev + 1);
        setTotalWins(prev => prev + 1);
        logGameResult(netWin, result);
        toast({ 
          title: "🎉 You Won!", 
          description: `+${netWin.toFixed(2)} ${wallet.toUpperCase()}! The coin landed on ${result}!`,
          className: "bg-emerald-50 border-emerald-200 text-emerald-800"
        });
      } else {
        setGameResult('lose');
        setStreak(0);
        logGameResult(-betAmount, result);
        toast({ 
          variant: 'destructive', 
          title: '💔 You Lost!', 
          description: `The coin landed on ${result}. Better luck next time!` 
        });
      }
    }, 3000);
  };
  
  const potentialWin = betAmount * 1.9;
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
              <p className="text-2xl font-bold text-purple-400">{selectedBalance.toLocaleString()}</p>
              <p className="text-xs text-purple-300">{wallet.toUpperCase()} Balance</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Game Area */}
          <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2"
          >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-emerald-500/5 animate-pulse" />
                
                <CardHeader className="relative z-10 text-center">
                  <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
                    Flip the Coin
                  </CardTitle>
                  {streak > 0 && (
                    <Badge className="mx-auto w-fit bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      🔥 {streak} Win Streak!
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="flex flex-col items-center justify-center gap-8 p-8 relative z-10">
                  {/* 3D Coin Container */}
                  <div className="relative perspective-1000">
                    <motion.div
                      className={cn(
                        'relative w-40 h-40 mx-auto rounded-full flex items-center justify-center text-6xl font-bold shadow-2xl border-4 transform-style-preserve-3d',
                        coinResult === 'heads' ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-900 border-amber-300 shadow-amber-500/50' :
                        coinResult === 'tails' ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 border-slate-300 shadow-slate-500/50' :
                        'bg-gradient-to-br from-purple-500 to-blue-500 text-white border-purple-300 shadow-purple-500/50'
                      )}
                      animate={
                        isFlipping 
                          ? { 
                              rotateY: [0, 180, 360, 540, 720, 900, 1080, 1260], 
                              rotateX: [0, 15, -15, 10, -10, 5, -5, 0],
                              scale: [1, 1.1, 1, 1.1, 1, 1.1, 1, 1],
                              y: [0, -20, 0, -15, 0, -10, 0, 0]
                            } 
                          : gameResult === 'win' 
                            ? { 
                                scale: [1, 1.2, 1], 
                                rotate: [0, 10, -10, 0],
                                boxShadow: [
                                  "0 0 0 0 rgba(34, 197, 94, 0.5)",
                                  "0 0 0 20px rgba(34, 197, 94, 0)",
                                  "0 0 0 0 rgba(34, 197, 94, 0)"
                                ]
                              }
                            : {}
                      }
                      transition={{ 
                        duration: isFlipping ? 3 : gameResult === 'win' ? 0.6 : 0.3, 
                        ease: isFlipping ? "easeOut" : "easeInOut" 
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {isFlipping ? (
                          <motion.div
                            key="spinning"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <Coins className="animate-spin" />
                          </motion.div>
                        ) : coinResult ? (
                          <motion.div
                            key={coinResult}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                          >
                            <div className="text-4xl mb-2">
                              {coinResult === 'heads' ? '👑' : '⚡'}
                            </div>
                            <div className="text-lg font-semibold">
                              {coinResult.toUpperCase()}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="initial"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                          >
                            <div className="text-4xl mb-2">🪙</div>
                            <div className="text-lg">READY</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>

                  {/* Result Display */}
                  <div className="h-20 flex items-center justify-center">
                    <AnimatePresence>
                      {isFlipping && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="text-center"
                        >
                          <div className="flex items-center justify-center gap-2 text-purple-400 font-semibold text-lg">
                            <div className="animate-bounce">🎲</div>
                            <span>Flipping...</span>
                            <div className="animate-bounce delay-100">🎲</div>
                          </div>
                          <div className="text-sm text-slate-400 mt-1">Good luck!</div>
                        </motion.div>
                      )}
                      
                      {gameResult && !isFlipping && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="text-center"
                        >
                          <motion.div
                            className={cn(
                              'text-3xl font-bold mb-2',
                              gameResult === 'win' ? 'text-emerald-400' : 'text-red-400'
                            )}
                            animate={gameResult === 'win' ? { 
                              textShadow: [
                                "0 0 0px rgba(34, 197, 94, 0.5)",
                                "0 0 20px rgba(34, 197, 94, 0.8)",
                                "0 0 0px rgba(34, 197, 94, 0.5)"
                              ]
                            } : {}}
                            transition={{ duration: 1, repeat: gameResult === 'win' ? 2 : 0 }}
                          >
                            {gameResult === 'win' 
                              ? `🏆 WINNER! +${(potentialWin - betAmount).toFixed(2)} ${wallet.toUpperCase()}` 
                              : '💔 TRY AGAIN!'
                            }
                          </motion.div>
                          <div className="text-slate-400">
                            {gameResult === 'win' 
                              ? `Congratulations! You guessed ${coinResult} correctly!`
                              : `The coin landed on ${coinResult}. Better luck next time!`
                            }
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Action Button */}
                  <motion.div className="w-full">
                    <Button
                        size="lg"
                        onClick={flipCoin}
                        disabled={isFlipping || (user && (betAmount > selectedBalance || betAmount <= 0))}
                        className={cn(
                          "w-full h-16 text-xl font-bold shadow-2xl transition-all duration-300 relative overflow-hidden group",
                          gameResult === 'win' 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 animate-pulse' 
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        )}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        <span className="relative z-10 flex items-center justify-center gap-3">
                          {isFlipping ? (
                            <>
                              <Coins className="animate-spin" />
                              Flipping...
                            </>
                          ) : (
                            <>
                              <Coins />
                              Flip Coin ({betAmount} {wallet.toUpperCase()})
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
            {/* Wallet Selection */}
            {hasCryptoWallets && (
                <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.1 }}
                >
                    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                                <Wallet className="w-5 h-5"/>
                                Choose Wallet
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup 
                                value={wallet} 
                                onValueChange={(v) => setWallet(v)} 
                                className="grid grid-cols-1 gap-4" 
                                disabled={isFlipping}
                            >
                                <Label 
                                    htmlFor="inr-wallet" 
                                    className={cn(
                                        "relative flex flex-col items-center justify-between rounded-xl border-2 bg-slate-700/30 p-4 hover:bg-slate-600/50 cursor-pointer transition-all", 
                                        wallet === 'inr' && "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/25"
                                    )}
                                >
                                    <RadioGroupItem value="inr" id="inr-wallet" className="sr-only"/>
                                    <div className="flex items-center gap-3 w-full">
                                        <Banknote className="h-6 w-6 text-green-400" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-200">INR Wallet</div>
                                            <div className="text-sm text-slate-400">₹{inrBalance.toLocaleString()}</div>
                                        </div>
                                        {wallet === 'inr' && <Check className="w-5 h-5 text-indigo-400" />}
                                    </div>
                                </Label>
                                
                                {wallets && Object.keys(wallets).map((crypto) => (
                                    <Label 
                                        key={crypto}
                                        htmlFor={`${crypto}-wallet`} 
                                        className={cn(
                                            "relative flex flex-col items-center justify-between rounded-xl border-2 bg-slate-700/30 p-4 hover:bg-slate-600/50 cursor-pointer transition-all", 
                                            wallet === crypto && "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/25"
                                        )}
                                    >
                                        <RadioGroupItem value={crypto} id={`${crypto}-wallet`} className="sr-only"/>
                                        <div className="flex items-center gap-3 w-full">
                                            <Bitcoin className="h-6 w-6 text-orange-400" />
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-200">{crypto.toUpperCase()} Wallet</div>
                                                <div className="text-sm text-slate-400">{wallets[crypto]} {crypto.toUpperCase()}</div>
                                            </div>
                                            {wallet === crypto && <Check className="w-5 h-5 text-indigo-400" />}
                                        </div>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Choose Side */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
            >
                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-200">Choose Your Side</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                    {(['heads', 'tails'] as const).map((side) => (
                      <motion.button
                        key={side}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSide(side)}
                        className={cn(
                          'p-6 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group',
                          selectedSide === side
                            ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-blue-500/20 shadow-lg shadow-purple-500/25'
                            : 'border-slate-600 bg-slate-700/30 hover:border-purple-400 hover:bg-slate-600/50'
                        )}
                        disabled={isFlipping}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                        <div className="relative z-10 text-center">
                          <div className={cn(
                            "w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl font-bold transition-colors",
                            side === 'heads' 
                              ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-900" 
                              : "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800"
                          )}>
                            {side === 'heads' ? '👑' : '⚡'}
                          </div>
                          <h4 className="font-bold text-slate-200 text-lg">{side.toUpperCase()}</h4>
                          <p className="text-xs text-slate-400 mt-1">
                            {side === 'heads' ? 'Royal Side' : 'Lightning Side'}
                          </p>
                        </div>
                        
                        {selectedSide === side && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2"
                          >
                            <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                </CardContent>
                </Card>
            </motion.div>

            {/* Bet Amount */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.3 }}
            >
                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Bet Amount
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                      <Input
                          type="number"
                          min="1"
                          max={selectedBalance}
                          value={betAmount}
                          onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                          className="text-center text-xl font-bold h-14 bg-slate-700/50 border-slate-600 text-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
                          disabled={isFlipping}
                          placeholder="Enter amount"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {wallet.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                    {[10, 25, 50, 100].map((amount) => (
                        <Button
                        key={amount}
                        variant="outline"
                        onClick={() => setBetAmount(amount)}
                        disabled={isFlipping || (user && amount > selectedBalance)}
                        className="bg-slate-700/30 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-purple-500"
                        >
                        {wallet === 'inr' ? '₹' : ''}{amount}
                        </Button>
                    ))}
                    </div>
                    
                    <Button
                      variant="secondary"
                      onClick={() => setBetAmount(selectedBalance)}
                      disabled={isFlipping || !user || selectedBalance === 0}
                      className="w-full bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/30 text-red-300 hover:from-red-600/30 hover:to-orange-600/30"
                    >
                      All In ({selectedBalance.toLocaleString()})
                    </Button>
                </CardContent>
                </Card>
            </motion.div>

            {/* Game Info */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.4 }}
            >
                <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5"/>
                            Game Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                            <div className="text-slate-400">Potential Win</div>
                            <div className="text-xl font-bold text-emerald-400">{potentialWin.toLocaleString()}</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                            <div className="text-slate-400">Multiplier</div>
                            <div className="text-xl font-bold text-purple-400">1.90x</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                              <span className="text-slate-400">Win Chance</span>
                              <span className="font-semibold text-slate-200">50%</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-slate-400">Games Played</span>
                              <span className="font-semibold text-slate-200">{totalGames}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-slate-400">Current Streak</span>
                              <span className="font-semibold text-orange-400">{streak}</span>
                          </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
          </div>
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
                        <span>How to Play</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-8">
                    {[
                      {
                        icon: '🎯',
                        title: 'Choose Side',
                        description: 'Select either Heads (Royal) or Tails (Lightning). Trust your instincts!'
                      },
                      {
                        icon: '💰',
                        title: 'Place Bet',
                        description: 'Enter your bet amount and select your wallet. Start small and build up!'
                      },
                      {
                        icon: '🎲',
                        title: 'Flip & Win',
                        description: 'Flip the coin and win 1.9x your bet if you guessed correctly! Build winning streaks!'
                      }
                    ].map((step, index) => (
                      <motion.div 
                        key={index}
                        className="text-center group"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all">
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
    </>
  );
};
