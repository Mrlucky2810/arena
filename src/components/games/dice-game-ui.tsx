
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { HelpCircle, Wallet, Crown, BarChart } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const DiceFace = ({ number }: { number: number | null }) => {
    const dots = Array.from({ length: number || 0 });
    return (
      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-xl shadow-lg flex items-center justify-center p-4">
        {number === null ? (
             <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-1">
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse col-start-3"></div>
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse col-start-2 row-start-2"></div>
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse row-start-3"></div>
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse col-start-3 row-start-3"></div>
             </div>
        ) : (
          <div className={cn(
            "w-full h-full grid grid-cols-3 grid-rows-3 gap-1",
            number === 1 && "[&>*:nth-child(1)]:col-start-2 [&>*:nth-child(1)]:row-start-2",
            number === 2 && "[&>*:nth-child(1)]:col-start-1 [&>*:nth-child(1)]:row-start-1 [&>*:nth-child(2)]:col-start-3 [&>*:nth-child(2)]:row-start-3",
            number === 3 && "[&>*:nth-child(1)]:col-start-1 [&>*:nth-child(1)]:row-start-1 [&>*:nth-child(2)]:col-start-2 [&>*:nth-child(2)]:row-start-2 [&>*:nth-child(3)]:col-start-3 [&>*:nth-child(3)]:row-start-3",
            number === 4 && "[&>*:nth-child(1)]:row-start-1 [&>*:nth-child(1)]:col-start-1 [&>*:nth-child(2)]:row-start-1 [&>*:nth-child(2)]:col-start-3 [&>*:nth-child(3)]:row-start-3 [&>*:nth-child(3)]:col-start-1 [&>*:nth-child(4)]:row-start-3 [&>*:nth-child(4)]:col-start-3",
            number === 5 && "[&>*:nth-child(1)]:row-start-1 [&>*:nth-child(1)]:col-start-1 [&>*:nth-child(2)]:row-start-1 [&>*:nth-child(2)]:col-start-3 [&>*:nth-child(3)]:row-start-2 [&>*:nth-child(3)]:col-start-2 [&>*:nth-child(4)]:row-start-3 [&>*:nth-child(4)]:col-start-1 [&>*:nth-child(5)]:row-start-3 [&>*:nth-child(5)]:col-start-3",
            number === 6 && "[&>*:nth-child(n)]:col-start-1 [&>*:nth-child(2n)]:col-start-3 [&>*:nth-child(1)]:row-start-1 [&>*:nth-child(2)]:row-start-1 [&>*:nth-child(3)]:row-start-2 [&>*:nth-child(4)]:row-start-2 [&>*:nth-child(5)]:row-start-3 [&>*:nth-child(6)]:row-start-3"
          )}>
            {dots.map((_, i) => <div key={i} className="w-4 h-4 bg-gray-800 rounded-full"></div>)}
          </div>
        )}
      </div>
    );
  };
  

export function DiceGameUI() {
    const { user, balance, updateBalance } = useAuth();
    const { toast } = useToast();
    const [selectedNumber, setSelectedNumber] = useState<number>(1);
    const [betAmount, setBetAmount] = useState<number>(10);
    const [isRolling, setIsRolling] = useState(false);
    const [diceResult, setDiceResult] = useState<number | null>(null);
    const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);

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
        if (betAmount > balance) {
            toast({ variant: "destructive", title: "Insufficient Balance", description: "You don't have enough funds to place this bet." });
            return;
        }

        setIsRolling(true);
        setGameResult(null);
        setDiceResult(null);
        
        try {
            await updateBalance(user.uid, -betAmount);
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
                updateBalance(user.uid, totalReturn).then(() => {
                    toast({ title: "You Won!", description: `+₹${winAmount} added to your balance.` });
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
                <div className="lg:col-span-2 space-y-6">
                    <Card className="text-center overflow-hidden">
                        <CardHeader>
                            <CardTitle>Place Your Bet & Roll</CardTitle>
                            <CardDescription>Select a number, set your bet, and roll the dice!</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center gap-6 p-4 sm:p-8">
                            <div className="relative">
                                <DiceFace number={diceResult} />
                                {gameResult && (
                                    <div className={cn(
                                        "absolute inset-0 flex items-center justify-center text-white font-bold text-3xl transition-opacity duration-300",
                                        gameResult === 'win' ? "bg-emerald-500/80" : "bg-red-500/80"
                                    )}>
                                       {gameResult === 'win' ? `WINNER! +₹${potentialWin}` : 'TRY AGAIN'}
                                    </div>
                                )}
                            </div>
                            <Button size="lg" className="w-full h-14 text-lg" onClick={rollDice} disabled={isRolling || betAmount <= 0 || betAmount > balance}>
                                {isRolling ? 'Rolling...' : `Roll Dice (Bet ₹${betAmount})`}
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <Card>
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
                                    className="h-16 text-2xl font-bold"
                                    disabled={isRolling}
                                >
                                    {number}
                                </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Bet Amount</CardTitle>
                            <Wallet className="w-5 h-5 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                type="number"
                                value={betAmount}
                                onChange={(e) => setBetAmount(Number(e.target.value))}
                                className="text-center text-xl font-bold h-12"
                                disabled={isRolling}
                            />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {[10, 25, 50, 100].map((amount) => (
                                <Button key={amount} variant="secondary" onClick={() => setBetAmount(amount)} disabled={isRolling}>
                                    ₹{amount}
                                </Button>
                                ))}
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => setBetAmount(balance)} disabled={isRolling}>
                                All In (₹{balance.toLocaleString()})
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Game Info</CardTitle>
                            <BarChart className="w-5 h-5 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Your Balance</span>
                                <span className="font-semibold">₹{balance.toLocaleString()}</span>
                            </div>
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
                </div>
            </div>

            <Card>
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
        </div>
    );
}
