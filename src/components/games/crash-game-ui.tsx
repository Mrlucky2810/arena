
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { recentCrashes } from "@/lib/mock-data";
import { Plane, Play, TrendingUp, Zap, Wallet, History, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type GameState = "ready" | "playing" | "crashed" | "cashed_out";

const generateCrashPoint = () => {
    const random = Math.random();
    if (random < 0.5) return 1.01 + Math.random() * 1.5; // 50% chance for 1.01x - 2.5x
    if (random < 0.8) return 2.5 + Math.random() * 2.5;  // 30% chance for 2.5x - 5x
    return 5 + Math.random() * 5;                         // 20% chance for 5x - 10x
};

export function CrashGameUI() {
  const { user, inrBalance, cryptoBalance, updateBalance } = useAuth();
  const totalBalance = inrBalance + cryptoBalance;
  const { toast } = useToast();
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashOut, setAutoCashOut] = useState(0);
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<GameState>("ready");
  const [crashPoint, setCrashPoint] = useState(0);

  const potentialWin = betAmount * multiplier;

  const logGameResult = async (payout: number) => {
    if (!user) return;
    try {
        await addDoc(collection(db, "game_history"), {
            userId: user.uid,
            game: "Crash",
            betAmount: betAmount,
            outcome: payout >= 0 ? 'win' : 'loss',
            payout: payout,
            crashPoint: crashPoint,
            cashedOutAt: payout >= 0 ? multiplier : null,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Failed to log game result:", error);
    }
  }

  const handleGameLogic = useCallback(() => {
    if (gameState !== "playing" || !user) return;

    const interval = setInterval(() => {
      setMultiplier((prevMultiplier) => {
        if (prevMultiplier >= crashPoint) {
          setGameState("crashed");
          clearInterval(interval);
          logGameResult(-betAmount); // Log loss
          return crashPoint;
        }
        const increment = 0.01 + (prevMultiplier / 20) * 0.01;
        return prevMultiplier + increment;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [gameState, crashPoint, betAmount, user, logGameResult]);

  useEffect(() => {
    const cleanup = handleGameLogic();
    return cleanup;
  }, [handleGameLogic]);

  const handleStartFlight = async () => {
    if (!user) return;
    if (gameState === "ready" || gameState === "crashed" || gameState === "cashed_out") {
       if (betAmount <= 0) {
        toast({ variant: "destructive", title: "Invalid Amount", description: "Bet amount must be positive." });
        return;
      }
      if (betAmount > inrBalance) {
        toast({ variant: "destructive", title: "Insufficient Balance", description: "You don't have enough INR funds to place this bet." });
        return;
      }
      try {
        await updateBalance(user.uid, -betAmount, 'inr');
        setMultiplier(1.0);
        setCrashPoint(generateCrashPoint());
        setGameState("playing");
      } catch (error) {
         toast({ variant: "destructive", title: "Error", description: "Could not place your bet. Please try again." });
      }
    }
  };

  const handleCashOut = async () => {
    if (gameState === "playing" && user) {
        const netWin = potentialWin - betAmount;
        try {
            await updateBalance(user.uid, potentialWin, 'inr'); // Give back stake + winnings
            setGameState("cashed_out");
            await logGameResult(netWin); // Log net win
            toast({ title: "Cashed Out!", description: `You won ₹${potentialWin.toFixed(2)}` });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to cash out. Please try again." });
        }
    }
  };

  const getFlightStatusText = () => {
    switch (gameState) {
      case "playing": return "In Flight...";
      case "crashed": return `Crashed @ ${crashPoint.toFixed(2)}x`;
      case "cashed_out": return `Cashed out @ ${multiplier.toFixed(2)}x!`;
      default: return "Ready for Takeoff";
    }
  };

  const getActionButton = () => {
    switch (gameState) {
      case 'playing':
        return (
          <Button onClick={handleCashOut} size="lg" className="w-full h-16 text-lg bg-emerald-600 hover:bg-emerald-700">
            <TrendingUp className="mr-2" />
            Cash Out (₹{potentialWin.toFixed(2)})
          </Button>
        );
      case 'cashed_out':
        return (
          <Button onClick={handleStartFlight} size="lg" className="w-full h-16 text-lg">
            <Play className="mr-2" />
            Place Next Bet
          </Button>
        );
      case 'crashed':
         return (
          <Button onClick={handleStartFlight} size="lg" className="w-full h-16 text-lg" variant="secondary">
            <Play className="mr-2" />
            Try Again
          </Button>
        );
      case 'ready':
      default:
        return (
          <Button onClick={handleStartFlight} size="lg" className="w-full h-16 text-lg" disabled={betAmount <= 0 || betAmount > inrBalance}>
            <Play className="mr-2" />
            Place Bet (₹{betAmount})
          </Button>
        );
    }
  };

  const planePosition = useMemo(() => {
    if (gameState === 'crashed') {
      return { 
        bottom: `5%`,
        left: '50%',
        transform: `translate(-50%, 50%) rotate(180deg) scale(0)`,
        opacity: 0,
        transition: 'all 0.5s ease-in'
      };
    }
    if (gameState !== 'playing') {
      return { bottom: '10%', left: '5%', transform: 'rotate(0deg)' };
    }
    const progress = Math.min((multiplier - 1) / (crashPoint > 1 ? crashPoint - 1 : 10), 1);
    const bottom = 10 + Math.pow(progress, 2) * 75; // Curved path
    const left = 5 + progress * 80;
    const rotation = 45 - progress * 45; // Starts tilted, ends straight
    
    return {
      bottom: `${bottom}%`,
      left: `${left}%`,
      transform: `rotate(-${rotation}deg)`,
      transition: 'all 0.1s linear'
    };
  }, [multiplier, gameState, crashPoint]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6 lg:order-1">
          <Card className="bg-card/50 text-center aspect-[16/10] flex flex-col relative overflow-hidden">
            <CardHeader className="z-10">
              <CardTitle className="text-muted-foreground">{getFlightStatusText()}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 p-4 sm:p-8 flex-1 z-10">
              <p className={cn(
                "text-5xl sm:text-7xl lg:text-8xl font-bold transition-colors duration-300",
                gameState === "crashed" ? "text-destructive" : gameState === "cashed_out" ? "text-emerald-500" : "text-foreground"
              )}>
                {multiplier.toFixed(2)}x
              </p>
            </CardContent>
            <div className="absolute inset-0 w-full h-full z-0">
               <Plane
                  className={cn(
                    "w-12 h-12 sm:w-16 sm:h-16 text-primary absolute",
                    gameState === 'playing' && 'animate-pulse'
                  )}
                  style={planePosition}
                />
              {gameState === "crashed" && (
                <div className="absolute w-full h-full flex items-center justify-center">
                  <Zap className="w-24 h-24 text-destructive animate-ping" />
                  <Zap className="w-24 h-24 text-destructive/50 animate-ping" style={{animationDelay: '0.2s'}} />
                </div>
              )}
            </div>
          </Card>
           <div className="w-full p-0">
                {getActionButton()}
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5"/>
                <span>Bet Amount</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="text-center text-lg font-bold h-12"
                disabled={gameState === "playing"}
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    variant={betAmount === amount ? "default" : "outline"}
                    onClick={() => setBetAmount(amount)}
                    disabled={gameState === "playing"}
                  >
                    ₹{amount}
                  </Button>
                ))}
              </div>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setBetAmount(inrBalance)}
                disabled={gameState === "playing"}
              >
                All In (₹{inrBalance.toLocaleString()})
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5"/>
                <span>Recent Crashes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {recentCrashes.map((crash, index) => (
                <div
                  key={index}
                  className={cn(
                    "text-xs font-bold py-1 px-2 rounded-full",
                    crash.multiplier < 2
                      ? "bg-red-500/20 text-red-400"
                      : "bg-emerald-500/20 text-emerald-400"
                  )}
                >
                  {crash.multiplier.toFixed(2)}x
                </div>
              ))}
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
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-semibold">Place Your Bet</h3>
            <p className="text-sm text-muted-foreground">
              Set your bet amount and click 'Place Bet'.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-semibold">Watch the Multiplier</h3>
            <p className="text-sm text-muted-foreground">
              The plane takes off and the multiplier starts growing.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-semibold">Cash Out In Time</h3>
            <p className="text-sm text-muted-foreground">
              Click 'Cash Out' before the plane crashes to win!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
