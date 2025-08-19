
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { HelpCircle, Wallet, Crown, BarChart, Banknote, Bitcoin, Check, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Trophy, Target, Zap } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/badge';

const DiceFace = ({ number, isRolling }: { number: number | null; isRolling: boolean }) => {
    const dotsConfig = [
        [], // 0
        [{ row: 1, col: 1 }], // 1
        [{ row: 0, col: 0 }, { row: 2, col: 2 }], // 2
        [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }], // 3
        [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }], // 4
        [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 2 }], // 5
        [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }], // 6
    ];

    return (
        <motion.div
            key={number}
            initial={{ opacity: 0, rotateX: -90, scale: 0.8 }}
            animate={{ 
                opacity: 1, 
                rotateX: 0, 
                scale: 1,
                rotate: isRolling ? 360 : 0
            }}
            exit={{ opacity: 0, rotateX: 90, scale: 0.8 }}
            transition={{ 
                duration: isRolling ? 0.1 : 0.3,
                repeat: isRolling ? Infinity : 0,
                ease: "easeInOut"
            }}
            className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-2xl flex items-center justify-center p-4 border-4 border-gray-200 relative overflow-hidden"
        >
            {/* Dice shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-3xl" />
            
            {isRolling ? (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }}
                    className="text-6xl"
                >
                    🎲
                </motion.div>
            ) : (
                <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full relative z-10">
                    {number !== null ? (
                        dotsConfig[number].map((dot, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-gray-800 rounded-full shadow-md" 
                                style={{ gridRow: dot.row + 1, gridColumn: dot.col + 1 }}
                            />
                        ))
                    ) : (
                        <div className="col-span-3 row-span-3 flex items-center justify-center text-4xl text-gray-400">
                            ?
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};
  
export function DiceGameUI() {
    const { user, inrBalance, wallets, updateBalance } = useAuth();
    const { toast } = useToast();
    const [selectedNumber, setSelectedNumber] = useState<number>(1);
    const [betAmount, setBetAmount] = useState<number>(10);
    const [isRolling, setIsRolling] = useState(false);
    const [diceResult, setDiceResult] = useState<number | null>(null);
    const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
    const [wallet, setWallet] = useState('inr');
    const [streak, setStreak] = useState(0);
    const [totalWins, setTotalWins] = useState(0);
    const [totalGames, setTotalGames] = useState(0);
    const [rollingNumber, setRollingNumber] = useState<number | null>(null);

    const selectedBalance = wallet === 'inr' ? inrBalance : (wallets ? wallets[wallet] || 0 : 0);
    const hasCryptoWallets = wallets && Object.keys(wallets).length > 0;


    const logGameResult = async (payout: number, result: number) => {
        if (!user) return;
        try {
            await addDoc(collection(db, "game_history"), {
                userId: user.uid,
                game: "Dice",
                betOn: selectedNumber,
                betAmount: betAmount,
                diceResult: result,
                outcome: payout >= 0 ? 'win' : 'loss',
                payout: payout,
                currency: wallet,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Failed to log game result:", error);
        }
    }

    const rollDice = async () => {
        if (!user) return;
        if (betAmount <= 0) {
            toast({ variant: "destructive", title: "Invalid Amount", description: "Bet amount must be positive." });
            return;
        }
        if (betAmount > selectedBalance) {
            toast({ variant: "destructive", title: "Insufficient Balance", description: `You don't have enough funds in your ${wallet.toUpperCase()} wallet.` });
            return;
        }

        setIsRolling(true);
        setGameResult(null);
        setDiceResult(null);
        setTotalGames(prev => prev + 1);
        
        try {
            await updateBalance(user.uid, -betAmount, wallet);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not place your bet. Please try again." });
            setIsRolling(false);
            return;
        }
        
        const rollInterval = setInterval(() => {
            setRollingNumber(Math.floor(Math.random() * 6) + 1);
        }, 100);

        setTimeout(() => {
            clearInterval(rollInterval);
            const result = Math.floor(Math.random() * 6) + 1;
            setDiceResult(result);
            setRollingNumber(null);
            setIsRolling(false);

            if (result === selectedNumber) {
                const winAmount = betAmount * 5;
                updateBalance(user.uid, winAmount + betAmount, wallet).then(() => {
                    setGameResult('win');
                    setStreak(prev => prev + 1);
                    setTotalWins(prev => prev + 1);
                    logGameResult(winAmount, result);
                    toast({ 
                        title: "🎉 JACKPOT!", 
                        description: `+${winAmount} ${wallet.toUpperCase()} added to your balance!`,
                        className: "bg-emerald-50 border-emerald-200 text-emerald-800"
                    });
                }).catch(() => {
                    toast({ variant: "destructive", title: "Error", description: "There was an issue updating your balance."});
                });
            } else {
                setGameResult('lose');
                setStreak(0);
                toast({ 
                    variant: "destructive", 
                    title: "💔 Close one!", 
                    description: `You rolled ${result}, needed ${selectedNumber}. Try again!` 
                });
                logGameResult(-betAmount, result);
            }
        }, 3000);
    };

    const potentialWin = betAmount * 5;
    const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0.0';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4">
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
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Dice Display */}
                        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5 animate-pulse" />
                            
                            <CardHeader className="relative z-10 text-center">
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    Roll the Dice
                                </CardTitle>
                                <CardDescription className="text-slate-400 text-lg">
                                    Pick a number and test your luck!
                                </CardDescription>
                                {streak > 0 && (
                                    <Badge className="mx-auto w-fit bg-gradient-to-r from-orange-500 to-red-500 text-white">
                                        🔥 {streak} Win Streak!
                                    </Badge>
                                )}
                            </CardHeader>
                            
                            <CardContent className="flex flex-col items-center justify-center gap-8 p-8 relative z-10">
                                {/* Dice Container */}
                                <div className="relative">
                                    <AnimatePresence mode="wait">
                                        <DiceFace 
                                            number={isRolling ? rollingNumber : diceResult} 
                                            isRolling={isRolling}
                                        />
                                    </AnimatePresence>
                                    
                                    {/* Result overlay */}
                                    <AnimatePresence>
                                        {gameResult && !isRolling && (
                                            <motion.div 
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                className={cn(
                                                    "absolute inset-0 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl transition-opacity duration-300 rounded-3xl",
                                                    gameResult === 'win' ? "bg-emerald-500/90 backdrop-blur-sm" : "bg-red-500/90 backdrop-blur-sm"
                                                )}
                                            >
                                                <div className="text-center">
                                                    <div className="text-4xl mb-2">
                                                        {gameResult === 'win' ? '🎉' : '💔'}
                                                    </div>
                                                    {gameResult === 'win' ? `WINNER! +${potentialWin}` : 'TRY AGAIN'}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Status Display */}
                                <div className="h-16 flex items-center justify-center">
                                    <AnimatePresence>
                                        {isRolling && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="text-center"
                                            >
                                                <div className="flex items-center justify-center gap-2 text-indigo-400 font-semibold text-xl">
                                                    <div className="animate-bounce">🎲</div>
                                                    <span>Rolling...</span>
                                                    <div className="animate-bounce delay-100">🎲</div>
                                                </div>
                                                <div className="text-sm text-slate-400 mt-1">You need {selectedNumber}!</div>
                                            </motion.div>
                                        )}
                                        
                                        {gameResult && !isRolling && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                className="text-center"
                                            >
                                                <div className={cn(
                                                    'text-2xl font-bold mb-2',
                                                    gameResult === 'win' ? 'text-emerald-400' : 'text-red-400'
                                                )}>
                                                    {gameResult === 'win' 
                                                        ? `🏆 PERFECT! You got ${diceResult}!` 
                                                        : `So close! You rolled ${diceResult}, needed ${selectedNumber}`
                                                    }
                                                </div>
                                                <div className="text-slate-400">
                                                    {gameResult === 'win' 
                                                        ? `Amazing prediction! You won ${potentialWin} ${wallet.toUpperCase()}!`
                                                        : `Don't give up! Your luck is coming!`
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
                                        className={cn(
                                            "w-full h-16 text-xl font-bold shadow-2xl transition-all duration-300 relative overflow-hidden group",
                                            gameResult === 'win' 
                                                ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 animate-pulse' 
                                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                                        )} 
                                        onClick={rollDice} 
                                        disabled={isRolling || betAmount <= 0 || betAmount > selectedBalance}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {isRolling ? (
                                                <>
                                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                        🎲
                                                    </motion.div>
                                                    Rolling...
                                                </>
                                            ) : (
                                                <>
                                                    🎲
                                                    Roll Dice (Bet {betAmount} {wallet.toUpperCase()})
                                                </>
                                            )}
                                        </span>
                                    </Button>
                                </motion.div>
                            </CardContent>
                        </Card>
                        
                        {/* Number Selection */}
                        <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-xl text-slate-200">Choose Your Lucky Number</CardTitle>
                                <CardDescription className="text-slate-400">
                                    Select the number you think the dice will land on
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                                    {[1, 2, 3, 4, 5, 6].map((number) => (
                                        <motion.button
                                            key={number}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedNumber(number)}
                                            className={cn(
                                                "relative h-20 rounded-xl border-2 transition-all duration-300 overflow-hidden group",
                                                selectedNumber === number
                                                    ? "border-indigo-500 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-lg shadow-indigo-500/25"
                                                    : "border-slate-600 bg-slate-700/30 hover:border-indigo-400 hover:bg-slate-600/50"
                                            )}
                                            disabled={isRolling}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                                            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                                                <div className="text-2xl font-bold text-slate-200">{number}</div>
                                                <div className="text-xs text-slate-400">16.67%</div>
                                            </div>
                                            
                                            {selectedNumber === number && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-1 right-1"
                                                >
                                                    <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>
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
                                            disabled={isRolling}
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


                        {/* Bet Amount */}
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-xl text-slate-200">Bet Amount</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={betAmount}
                                            onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                                            className="text-center text-xl font-bold h-14 bg-slate-700/50 border-slate-600 text-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20"
                                            disabled={isRolling}
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
                                                disabled={isRolling}
                                                className="bg-slate-700/30 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-indigo-500"
                                            >
                                                {amount}
                                            </Button>
                                        ))}
                                    </div>
                                    
                                    <Button 
                                        variant="outline" 
                                        className="w-full bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/30 text-red-300 hover:from-red-600/30 hover:to-orange-600/30" 
                                        onClick={() => setBetAmount(selectedBalance)} 
                                        disabled={isRolling}
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
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
                                        <BarChart className="w-5 h-5"/>
                                        Game Statistics
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                                            <div className="text-slate-400 text-sm">Potential Win</div>
                                            <div className="text-xl font-bold text-emerald-400">{potentialWin.toLocaleString()}</div>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                                            <div className="text-slate-400 text-sm">Payout</div>
                                            <div className="text-xl font-bold text-indigo-400">5.00x</div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Selected Number</span>
                                            <span className="font-semibold text-slate-200">{selectedNumber}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Win Chance</span>
                                            <span className="font-semibold text-slate-200">16.67%</span>
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
                    transition={{ delay: 0.4 }}
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
                                    title: 'Choose Number',
                                    description: 'Select a number from 1 to 6 that you think the dice will land on. Trust your intuition!'
                                },
                                {
                                    icon: '💰',
                                    title: 'Place Bet',
                                    description: 'Enter your bet amount and select your preferred wallet. Choose wisely!'
                                },
                                {
                                    icon: '🎲',
                                    title: 'Roll & Win',
                                    description: 'Roll the dice and win 5x your bet if you guessed correctly! Build epic winning streaks!'
                                }
                            ].map((step, index) => (
                                <motion.div 
                                    key={index}
                                    className="text-center group"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-all">
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
