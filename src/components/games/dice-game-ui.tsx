
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { HelpCircle, Wallet, Crown, BarChart, Banknote, Bitcoin, Check } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { motion, AnimatePresence } from 'framer-motion';

const DiceFace = ({ number }: { number: number | null }) => {
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
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            exit={{ opacity: 0, rotateX: 90 }}
            transition={{ duration: 0.2 }}
            className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-xl shadow-lg flex items-center justify-center p-2"
        >
            <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full">
                {number !== null ? (
                    dotsConfig[number].map((dot, i) => (
                        <div key={i} className="bg-gray-800 rounded-full" style={{ gridRow: dot.row + 1, gridColumn: dot.col + 1 }}></div>
                    ))
                ) : (
                    Array.from({ length: 5 }).map((_, i) => (
                         <div key={i} className="w-4 h-4 bg-gray-300 rounded-full animate-pulse justify-self-center self-center"></div>
                    ))
                )}
            </div>
        </motion.div>
    );
};
  
type WalletType = 'inr' | 'crypto';

export function DiceGameUI() {
    const { user, inrBalance, cryptoBalance, updateBalance } = useAuth();
    const { toast } = useToast();
    const [selectedNumber, setSelectedNumber] = useState<number>(1);
    const [betAmount, setBetAmount] = useState<number>(10);
    const [isRolling, setIsRolling] = useState(false);
    const [diceResult, setDiceResult] = useState<number | null>(null);
    const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);
    const [wallet, setWallet] = useState<WalletType>('inr');

    const selectedBalance = wallet === 'inr' ? inrBalance : cryptoBalance;

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
                wallet: wallet,
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
        
        try {
            await updateBalance(user.uid, -betAmount, wallet);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not place your bet. Please try again." });
            setIsRolling(false);
            return;
        }
        
        const rollInterval = setInterval(() => {
            setDiceResult(Math.floor(Math.random() * 6) + 1);
        }, 100);

        setTimeout(() => {
            clearInterval(rollInterval);
            const result = Math.floor(Math.random() * 6) + 1;
            setDiceResult(result);
            setIsRolling(false);

            if (result === selectedNumber) {
                const winAmount = betAmount * 5;
                const totalReturn = winAmount + betAmount; // winnings + stake back
                updateBalance(user.uid, totalReturn, wallet).then(() => {
                    toast({ title: "You Won!", description: `+₹${winAmount} added to your ${wallet.toUpperCase()} balance.` });
                }).catch(() => {
                    toast({ variant: "destructive", title: "Error", description: "There was an issue updating your balance."});
                });
                setGameResult('win');
                logGameResult(winAmount, result);
            } else {
                setGameResult('lose');
                toast({ variant: "destructive", title: "You Lost", description: `You lost ₹${betAmount}.` });
                logGameResult(-betAmount, result);
            }
        }, 2000);
    };

    const potentialWin = betAmount * 5;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="lg:col-span-2 space-y-6"
                >
                    <Card className="text-center overflow-hidden bg-card/80 backdrop-blur-sm border-white/5">
                        <CardHeader>
                            <CardTitle>Place Your Bet & Roll</CardTitle>
                            <CardDescription>Select a number, set your bet, and roll the dice!</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center gap-6 p-4 sm:p-8">
                            <div className="relative">
                                <AnimatePresence mode="wait">
                                    <DiceFace number={diceResult} />
                                </AnimatePresence>
                                <AnimatePresence>
                                {gameResult && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        className={cn(
                                        "absolute inset-0 flex items-center justify-center text-white font-bold text-3xl transition-opacity duration-300",
                                        gameResult === 'win' ? "bg-emerald-500/80" : "bg-red-500/80"
                                    )}>
                                       {gameResult === 'win' ? `WINNER! +₹${potentialWin}` : 'TRY AGAIN'}
                                    </motion.div>
                                )}
                                </AnimatePresence>
                            </div>
                            <Button size="lg" className={cn("w-full h-14 text-lg shadow-lg hover:shadow-primary/50 transition-shadow", gameResult === 'win' && 'pulse-win')} onClick={rollDice} disabled={isRolling || betAmount <= 0 || betAmount > selectedBalance}>
                                {isRolling ? 'Rolling...' : `Roll Dice (Bet ₹${betAmount})`}
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-card/80 backdrop-blur-sm border-white/5">
                        <CardHeader>
                            <CardTitle>Choose Your Lucky Number</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-4">
                                {[1, 2, 3, 4, 5, 6].map((number) => (
                                <Button
                                    key={number}
                                    variant={selectedNumber === number ? "default" : "outline"}
                                    onClick={() => setSelectedNumber(number)}
                                    className={cn("h-16 text-2xl font-bold transition-all duration-200", selectedNumber === number && 'shadow-glow')}
                                    disabled={isRolling}
                                >
                                    {number}
                                </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                
                <div className="space-y-6">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <Card className="bg-card/80 backdrop-blur-sm border-white/5">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Bet Amount</CardTitle>
                            <Wallet className="w-5 h-5 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup value={wallet} onValueChange={(v) => setWallet(v as WalletType)} className="grid grid-cols-2 gap-4" disabled={isRolling}>
                                <Label htmlFor="inr-wallet" className={cn("relative flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", wallet === 'inr' && "border-primary shadow-glow")}>
                                    <RadioGroupItem value="inr" id="inr-wallet" className="sr-only"/>
                                    <Banknote className="mb-3 h-6 w-6" />
                                    INR Wallet
                                    <span className="block font-normal text-sm text-muted-foreground">₹{inrBalance.toLocaleString()}</span>
                                    {wallet === 'inr' && <Check className="w-5 h-5 absolute top-2 right-2 text-primary" />}
                                </Label>
                                <Label htmlFor="crypto-wallet" className={cn("relative flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer", wallet === 'crypto' && "border-primary shadow-glow")}>
                                     <RadioGroupItem value="crypto" id="crypto-wallet" className="sr-only"/>
                                    <Bitcoin className="mb-3 h-6 w-6" />
                                    Crypto Wallet
                                     <span className="block font-normal text-sm text-muted-foreground">₹{cryptoBalance.toLocaleString()}</span>
                                    {wallet === 'crypto' && <Check className="w-5 h-5 absolute top-2 right-2 text-primary" />}
                                </Label>
                            </RadioGroup>
                            <Input
                                type="number"
                                value={betAmount}
                                onChange={(e) => setBetAmount(Number(e.target.value))}
                                className="text-center text-xl font-bold h-12 bg-input/50"
                                disabled={isRolling}
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[10, 25, 50, 100].map((amount) => (
                                <Button key={amount} variant="secondary" onClick={() => setBetAmount(amount)} disabled={isRolling}>
                                    ₹{amount}
                                </Button>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => setBetAmount(selectedBalance)} disabled={isRolling}>
                                All In (₹{selectedBalance.toLocaleString()})
                            </Button>
                        </CardContent>
                    </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <Card className="bg-card/80 backdrop-blur-sm border-white/5">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Game Info</CardTitle>
                            <BarChart className="w-5 h-5 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4 text-sm">
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Selected Number</span>
                                <span className="font-semibold text-primary">{selectedNumber}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Potential Win</span>
                                <span className="font-semibold text-emerald-500">₹{potentialWin.toLocaleString()}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Win Chance</span>
                                <span className="font-semibold">16.67%</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Payout</span>
                                <span className="font-semibold">5x</span>
                            </div>
                        </CardContent>
                    </Card>
                    </motion.div>
                </div>
            </div>

             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
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
                            <h3 className="font-semibold">Choose Number</h3>
                            <p className="text-sm text-muted-foreground">Select a number from 1 to 6 that you think the dice will land on.</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">2</div>
                            <h3 className="font-semibold">Place Bet</h3>
                            <p className="text-sm text-muted-foreground">Enter your bet amount or use the quick bet buttons.</p>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">3</div>
                            <h3 className="font-semibold">Roll & Win</h3>
                            <p className="text-sm text-muted-foreground">Roll the dice and win 5x your bet if you guessed correctly!</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

    