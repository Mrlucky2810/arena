
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Wallet } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

const BETTING_DURATION = 30;

export function ColorPredictionUI() {
  const { user, balance, updateBalance } = useAuth();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(BETTING_DURATION);
  const [betAmount, setBetAmount] = useState(10);
  const [activeBets, setActiveBets] = useState<{ [key: string]: number }>({});
  const [lastResult, setLastResult] = useState<{ round: number, color: string, number: number } | null>(null);

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
    const winningNumber = Math.floor(Math.random() * 10);
    const colors: { [key: string]: string } = { '0': 'green', '5': 'green', '1': 'red', '3': 'red', '7': 'red', '9': 'red', '2': 'violet', '4': 'violet', '6': 'violet', '8': 'violet' };
    
    let winningColor = 'red';
    if (['0', '5'].includes(winningNumber.toString())) winningColor = 'green';
    if (['2', '4', '6', '8'].includes(winningNumber.toString())) winningColor = 'violet';


    setLastResult({ round: Math.floor(Math.random() * 100000), color: winningColor, number: winningNumber });

    let totalWinnings = 0;
    let totalLosses = 0;

    for (const betKey in activeBets) {
        const betValue = activeBets[betKey];
        let winForThisBet = 0;
        let isWin = false;

        if (betKey === winningColor) {
            isWin = true;
            const multiplier = winningColor === 'violet' ? 4.5 : 2;
            winForThisBet = betValue * multiplier;
        } else if (parseInt(betKey, 10) === winningNumber) {
            isWin = true;
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
    
    if (totalWinnings > 0) {
        try {
            await updateBalance(user.uid, totalWinnings);
            toast({ title: "You Won!", description: `+₹${totalWinnings.toFixed(2)} added to your balance.` });
        } catch (error) {
             toast({ variant: "destructive", title: "Error", description: "There was an issue updating your balance."});
        }
    }
    
    if (totalLosses > 0 && totalWinnings === 0) {
        toast({ variant: "destructive", title: "You Lost", description: `You lost ₹${totalLosses.toFixed(2)} this round.` });
    }
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
  
  const placeBet = async (key: string) => {
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
        setActiveBets(prev => ({
            ...prev,
            [key]: (prev[key] || 0) + betAmount
        }));
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not place your bet. Please try again." });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="text-lg sm:text-xl">Round #{lastResult ? lastResult.round + 1 : '857231'}</CardTitle>
                <div className="text-right">
                    <p className="text-muted-foreground text-sm">Countdown</p>
                    <p className="font-bold text-xl sm:text-2xl">{timeLeft}s</p>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className={timeLeft <= 5 ? "animate-pulse [&>div]:bg-destructive" : ""} />
          </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle className="text-lg sm:text-xl">Place Your Bet</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <Button onClick={() => placeBet('green')} className="h-20 sm:h-24 bg-emerald-500 hover:bg-emerald-600 text-white flex-col gap-1 text-xs sm:text-sm" disabled={timeLeft <= 5}>Join Green <Badge variant="secondary">2x</Badge>{activeBets.green && <Badge>{activeBets.green}</Badge>}</Button>
                    <Button onClick={() => placeBet('violet')} className="h-20 sm:h-24 bg-violet-500 hover:bg-violet-600 text-white flex-col gap-1 text-xs sm:text-sm" disabled={timeLeft <= 5}>Join Violet <Badge variant="secondary">4.5x</Badge>{activeBets.violet && <Badge>{activeBets.violet}</Badge>}</Button>
                    <Button onClick={() => placeBet('red')} className="h-20 sm:h-24 bg-red-500 hover:bg-red-600 text-white flex-col gap-1 text-xs sm:text-sm" disabled={timeLeft <= 5}>Join Red <Badge variant="secondary">2x</Badge>{activeBets.red && <Badge>{activeBets.red}</Badge>}</Button>
                </div>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {Array.from({length: 10}, (_, i) => {
                        const colors: { [key: string]: number[] } = {
                            green: [0,5], red: [1,3,7,9], violet: [2,4,6,8]
                        };
                        
                        let colorClass = 'bg-red-500/20 text-red-500';
                        if(colors.green.includes(i)) colorClass = "bg-emerald-500/20 text-emerald-500";
                        if(colors.violet.includes(i)) colorClass = "bg-violet-500/20 text-violet-500";
                        
                        return <Button onClick={() => placeBet(i.toString())} key={i} variant="secondary" className={cn("relative h-12", colorClass)} disabled={timeLeft <= 5}>{i}{activeBets[i] && <Badge className="absolute -top-1 -right-1 p-1 h-auto leading-none">{activeBets[i]}</Badge>}</Button>
                    })}
                </div>
                <div className="flex flex-wrap gap-2">
                    {[10, 100, 1000, 5000].map(amount => <Button key={amount} variant={betAmount === amount ? "default" : "outline"} onClick={() => setBetAmount(amount)} className="flex-grow sm:flex-grow-0" disabled={timeLeft <= 5}>₹{amount}</Button>)}
                    <Input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="flex-1 min-w-[100px]" disabled={timeLeft <= 5}/>
                </div>
            </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg sm:text-xl">Balance</CardTitle>
            <Wallet className="w-5 h-5 text-muted-foreground"/>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl font-bold">₹{balance.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="text-lg sm:text-xl">Last 10 Results</CardTitle></CardHeader>
            <CardContent className="flex gap-2 overflow-x-auto pb-2">
                <p className="text-sm text-muted-foreground">Recent game results will be shown here.</p>
            </CardContent>
        </Card>
        <Tabs defaultValue="my-records" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all-records">All Records</TabsTrigger>
            <TabsTrigger value="my-records">My Records</TabsTrigger>
          </TabsList>
          <TabsContent value="my-records">
            <Card>
              <CardContent className="p-2 text-center text-sm text-muted-foreground">
                Your game records will be shown here.
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="all-records">
            <Card>
                <CardContent className="p-2 text-center text-sm text-muted-foreground">All records will be shown here.</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
