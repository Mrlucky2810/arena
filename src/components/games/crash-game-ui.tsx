
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { recentCrashes } from "@/lib/mock-data";
import { Plane, Play, TrendingUp, Zap, Wallet, History, HelpCircle, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

type GameState = "waiting" | "in-flight" | "crashed";
type PlayerState = "betting" | "playing" | "cashed_out" | "lost";

interface CrashGameState {
    multiplier: number;
    status: GameState;
    startTime: any;
    crashPoint: number;
    id: string;
}

const AdminControls = () => {
    const { toast } = useToast();

    const handleStartRound = async () => {
        const gameDocRef = doc(db, "crash_game", "current_round");
        const crashPoint = 1 + Math.random() * 9; // Crash between 1x and 10x
        try {
            await setDoc(gameDocRef, {
                status: 'waiting',
                crashPoint: crashPoint,
                startTime: serverTimestamp(),
                multiplier: 1.00
            });
            toast({ title: "New Round Started", description: "Players can now place bets." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error starting round" });
            console.error(error);
        }
    };
    
    const handleTriggerFlight = async () => {
        const gameDocRef = doc(db, "crash_game", "current_round");
        try {
            await updateDoc(gameDocRef, {
                status: 'in-flight',
                startTime: serverTimestamp(),
            });
            toast({ title: "Plane is in flight!" });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error triggering flight" });
        }
    };
    
    const handleEndRound = async () => {
        const gameDocRef = doc(db, "crash_game", "current_round");
        try {
            await updateDoc(gameDocRef, {
                status: 'crashed',
            });
            toast({ variant: 'destructive', title: "Plane has crashed!" });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error ending round" });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card className="bg-destructive/10 border-destructive/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <ShieldAlert className="w-5 h-5"/>
                        <span>Admin Controls</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleStartRound} variant="outline" className="flex-1">New Round (Wait)</Button>
                    <Button onClick={handleTriggerFlight} variant="outline" className="flex-1">Trigger Flight</Button>
                    <Button onClick={handleEndRound} variant="destructive" className="flex-1">End Round (Crash)</Button>
                </CardContent>
            </Card>
        </motion.div>
    );
};


export function CrashGameUI() {
  const { user, userData, inrBalance, updateBalance } = useAuth();
  const { toast } = useToast();

  // Player-specific state
  const [betAmount, setBetAmount] = useState(10);
  const [playerState, setPlayerState] = useState<PlayerState>("betting");
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState(0);

  // Shared game state from Firestore
  const [gameState, setGameState] = useState<CrashGameState | null>(null);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.00);

  const isAdmin = userData?.role === 'admin';

  useEffect(() => {
    const gameDocRef = doc(db, "crash_game", "current_round");
    
    const unsubscribe = onSnapshot(gameDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data() as Omit<CrashGameState, 'id'>;
            setGameState({ ...data, id: doc.id });
        } else {
            console.log("No active crash game round.");
            setGameState(null);
        }
    }, (error) => {
        console.error("Error subscribing to game state:", error);
        toast({variant: 'destructive', title: 'Connection Error', description: 'Could not connect to the game server.'});
    });

    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (!gameState) return;

    let intervalId: NodeJS.Timeout | undefined;

    if (gameState.status === 'waiting') {
        setCurrentMultiplier(1.00);
        if (playerState !== 'betting') {
            setPlayerState('betting');
            setCashedOutMultiplier(0);
        }
    } else if (gameState.status === 'crashed') {
        setCurrentMultiplier(gameState.crashPoint);
         if(playerState === 'playing') {
            setPlayerState('lost');
            logGameResult(-betAmount, null, gameState.crashPoint);
        }
    } else if (gameState.status === 'in-flight') {
        const startTime = gameState.startTime?.toDate();
        if (!startTime) return;

        const frame = () => {
            const elapsed = (new Date().getTime() - startTime.getTime()) / 1000;
            const newMultiplier = 1 * Math.pow(1.05, elapsed);
            setCurrentMultiplier(newMultiplier);
        };
        intervalId = setInterval(frame, 100);
    }
    
    return () => clearInterval(intervalId);
  }, [gameState, playerState, betAmount]);

  const potentialWin = betAmount * currentMultiplier;

  const logGameResult = async (payout: number, cashedOutAt: number | null, finalMultiplier: number) => {
    if (!user) return;
    try {
        await addDoc(collection(db, "game_history"), {
            userId: user.uid,
            game: "Crash",
            gameRoundId: gameState?.id,
            betAmount: betAmount,
            outcome: payout >= 0 ? 'win' : 'loss',
            payout: payout,
            cashedOutAt: cashedOutAt,
            crashPoint: finalMultiplier,
            createdAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Failed to log game result:", error);
    }
  };

  const handlePlaceBet = async () => {
    if (!user) return;
    if (gameState?.status !== "waiting") {
        toast({ variant: 'destructive', title: "Too late!", description: "Bets are locked. Please wait for the next round." });
        return;
    }
    if (betAmount <= 0) {
        toast({ variant: "destructive", title: "Invalid Amount", description: "Bet amount must be positive." });
        return;
    }
    if (betAmount > inrBalance) {
        toast({ variant: "destructive", title: "Insufficient Balance" });
        return;
    }
    try {
      await updateBalance(user.uid, -betAmount, 'inr');
      setPlayerState("playing");
      toast({ title: "Bet Placed!", description: `Your ₹${betAmount} bet is locked in.` });
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Could not place your bet. Please try again." });
    }
  };

  const handleCashOut = async () => {
    if (playerState !== "playing" || !user || !gameState || gameState.status !== 'in-flight' || currentMultiplier < 1) return;
    
    const cashOutMultiplier = currentMultiplier; 
    const winnings = betAmount * cashOutMultiplier;
    const netWin = winnings - betAmount;

    try {
        setPlayerState("cashed_out");
        setCashedOutMultiplier(cashOutMultiplier);
        await updateBalance(user.uid, winnings, 'inr');
        await logGameResult(netWin, cashOutMultiplier, gameState.crashPoint);
        toast({ title: "Cashed Out!", description: `You won ₹${winnings.toFixed(2)} at ${cashOutMultiplier.toFixed(2)}x` });
    } catch (error) {
        setPlayerState("playing");
        toast({ variant: "destructive", title: "Error", description: "Failed to cash out. Please try again." });
    }
  };

  const getFlightStatusText = () => {
    if (!gameState) return "Connecting to game...";

    switch (gameState.status) {
      case "waiting": return `Next round starts soon...`;
      case "in-flight": 
        if (playerState === 'cashed_out') return `Cashed out @ ${cashedOutMultiplier.toFixed(2)}x!`;
        if (playerState === 'playing') return "In Flight...";
        return "Round in Progress";
      case "crashed": 
         if (playerState === 'lost') return `You lost! Crashed @ ${gameState.crashPoint.toFixed(2)}x`;
         if (playerState === 'cashed_out' && cashedOutMultiplier < gameState.crashPoint) return `Round ended. Crashed @ ${gameState.crashPoint.toFixed(2)}x`;
         return `Crashed @ ${gameState.crashPoint.toFixed(2)}x`;
      default: return "Ready for Takeoff";
    }
  };

  const getActionButton = () => {
    switch (playerState) {
        case 'betting':
            return (
                <Button onClick={handlePlaceBet} size="lg" className="w-full h-16 text-lg shadow-lg hover:shadow-primary/50 transition-all" disabled={!gameState || gameState.status !== 'waiting' || betAmount <= 0 || betAmount > inrBalance}>
                    <Play className="mr-2" />
                    Place Bet (₹{betAmount})
                </Button>
            );
        case 'playing':
            return (
                <Button onClick={handleCashOut} size="lg" className="w-full h-16 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/50 transition-all" disabled={!gameState || gameState.status !== 'in-flight' || currentMultiplier < 1.01}>
                    <TrendingUp className="mr-2" />
                    Cash Out (₹{potentialWin.toFixed(2)})
                </Button>
            );
        case 'cashed_out':
        case 'lost':
             return (
                <Button onClick={() => setPlayerState('betting')} size="lg" className="w-full h-16 text-lg shadow-lg hover:shadow-primary/50 transition-all" disabled={!gameState || gameState.status !== 'waiting'}>
                    <Play className="mr-2" />
                    Place Bet for Next Round
                </Button>
            );
    }
  };

  const displayMultiplier = gameState?.status === 'crashed' ? gameState.crashPoint : currentMultiplier;

  const planePosition = useMemo(() => {
    const isCrashed = gameState?.status === 'crashed';
    const isWaiting = gameState?.status === 'waiting';
    const crashPoint = gameState?.crashPoint || 10;
    
    if (isWaiting || !gameState) {
      return { bottom: '10%', left: '5%', transform: 'rotate(0deg)', opacity: 1, transition: 'all 0.5s ease-out'};
    }
    
    if (isCrashed) {
      const progress = Math.min(gameState.crashPoint / crashPoint, 1);
      const bottom = 10 + Math.pow(progress, 2) * 75;
      const left = 5 + progress * 80;
      const rotation = 45 - progress * 45;
      return { 
        bottom: `${bottom}%`,
        left: `${left}%`,
        transform: `rotate(${rotation + 90}deg) scale(0)`,
        opacity: 0,
        transition: 'all 0.5s ease-in'
      };
    }

    // In-flight
    const progress = Math.min(currentMultiplier / crashPoint, 1);
    const bottom = 10 + Math.pow(progress, 2) * 75; // Curved path
    const left = 5 + progress * 80;
    const rotation = 45 - progress * 45; // Starts tilted, ends straight
    
    return {
      bottom: `${bottom}%`,
      left: `${left}%`,
      transform: `rotate(-${rotation}deg)`,
      transition: 'all 0.1s linear'
    };
  }, [currentMultiplier, gameState]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="lg:col-span-2 space-y-6 lg:order-1">
          <Card className="bg-card/80 backdrop-blur-sm border-white/5 text-center aspect-[16/10] flex flex-col relative overflow-hidden">
            <CardHeader className="z-10">
              <CardTitle className="text-muted-foreground">{getFlightStatusText()}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 p-4 sm:p-8 flex-1 z-10">
              <motion.p 
                key={gameState?.status}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                "text-5xl sm:text-7xl lg:text-8xl font-bold transition-colors duration-300",
                gameState?.status === "crashed" ? "text-destructive" : playerState === "cashed_out" ? "text-emerald-500" : "text-foreground"
              )}>
                {displayMultiplier.toFixed(2)}x
              </motion.p>
            </CardContent>
            <div className="absolute inset-0 w-full h-full z-0">
               <motion.div
                  className={cn(
                    "absolute",
                    gameState?.status === 'in-flight' && 'animate-pulse'
                  )}
                  style={{
                    width: '4rem',
                    height: '4rem',
                    ...planePosition
                  }}
                >
                 <Plane
                    className="w-full h-full text-primary"
                  />
               </motion.div>
              {gameState?.status === "crashed" && (
                <div className="absolute w-full h-full flex items-center justify-center">
                  <motion.div initial={{scale: 0}} animate={{scale: 1}} transition={{delay: 0.1, type: "spring"}}>
                    <Zap className="w-24 h-24 text-destructive" />
                  </motion.div>
                </div>
              )}
            </div>
          </Card>
           <div className="w-full p-0">
                {getActionButton()}
            </div>
        </motion.div>

        <div className="lg:col-span-1 space-y-6 lg:order-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <Card className="bg-card/80 backdrop-blur-sm border-white/5">
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
                        className="text-center text-lg font-bold h-12 bg-input/50"
                        disabled={playerState !== "betting"}
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[10, 25, 50, 100].map((amount) => (
                        <Button
                            key={amount}
                            variant={betAmount === amount ? "default" : "outline"}
                            onClick={() => setBetAmount(amount)}
                            disabled={playerState !== "betting"}
                        >
                            ₹{amount}
                        </Button>
                        ))}
                    </div>
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => setBetAmount(inrBalance)}
                        disabled={playerState !== "betting"}
                    >
                        All In (₹{inrBalance.toLocaleString()})
                    </Button>
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card className="bg-card/80 backdrop-blur-sm border-white/5">
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
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                1
                </div>
                <h3 className="font-semibold">Place Your Bet</h3>
                <p className="text-sm text-muted-foreground">
                Set your bet amount while the status is 'waiting'.
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
                Click 'Cash Out' before the plane crashes to win! You can only cash out when the multiplier is above 1.00x.
                </p>
            </div>
            </CardContent>
        </Card>
      </motion.div>
      {isAdmin && <AdminControls />}
    </div>
  );
}

    