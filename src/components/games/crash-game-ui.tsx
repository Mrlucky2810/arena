
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { recentCrashes } from "@/lib/mock-data";
import { Plane, Play, TrendingUp, Zap, Wallet, History, HelpCircle, ShieldAlert, Rocket, Trophy, Target } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
        const crashPoint = 1 + Math.random() * 9;
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
            toast({ title: "Rocket is in flight!" });
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
            toast({ variant: 'destructive', title: "Rocket has crashed!" });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error ending round" });
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-400">
                        <ShieldAlert className="w-5 h-5"/>
                        <span>Admin Controls</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleStartRound} variant="outline" className="flex-1 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20">New Round</Button>
                    <Button onClick={handleTriggerFlight} variant="outline" className="flex-1 bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20">Launch Rocket</Button>
                    <Button onClick={handleEndRound} variant="destructive" className="flex-1">Crash</Button>
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
  const [totalWins, setTotalWins] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  const [bestMultiplier, setBestMultiplier] = useState(0);

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
            setTotalGames(prev => prev + 1);
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
  const winRate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0.0';

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
      toast({ 
        title: "🚀 Bet Placed!", 
        description: `Your ₹${betAmount} bet is locked in. Good luck!`,
        className: "bg-blue-50 border-blue-200 text-blue-800"
      });
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
        setTotalWins(prev => prev + 1);
        setTotalGames(prev => prev + 1);
        setBestMultiplier(prev => Math.max(prev, cashOutMultiplier));
        await updateBalance(user.uid, winnings, 'inr');
        await logGameResult(netWin, cashOutMultiplier, gameState.crashPoint);
        toast({ 
          title: "🎉 Cashed Out!", 
          description: `You won ₹${winnings.toFixed(2)} at ${cashOutMultiplier.toFixed(2)}x`,
          className: "bg-emerald-50 border-emerald-200 text-emerald-800"
        });
    } catch (error) {
        setPlayerState("playing");
        toast({ variant: "destructive", title: "Error", description: "Failed to cash out. Please try again." });
    }
  };

  const getFlightStatusText = () => {
    if (!gameState) return "Connecting to mission control...";

    switch (gameState.status) {
      case "waiting": return `🚀 Next launch in T-minus...`;
      case "in-flight": 
        if (playerState === 'cashed_out') return `✅ Escaped at ${cashedOutMultiplier.toFixed(2)}x!`;
        if (playerState === 'playing') return "🚀 Rocket ascending...";
        return "🚀 Mission in progress";
      case "crashed": 
         if (playerState === 'lost') return `💥 Mission failed! Crashed @ ${gameState.crashPoint.toFixed(2)}x`;
         if (playerState === 'cashed_out' && cashedOutMultiplier < gameState.crashPoint) return `🎯 Mission complete. Crashed @ ${gameState.crashPoint.toFixed(2)}x`;
         return `💥 Crashed @ ${gameState.crashPoint.toFixed(2)}x`;
      default: return "🚀 Ready for launch";
    }
  };

  const getActionButton = () => {
    switch (playerState) {
        case 'betting':
            return (
                <Button 
                  onClick={handlePlaceBet} 
                  size="lg" 
                  className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/50 transition-all"
                  disabled={!gameState || gameState.status !== 'waiting' || betAmount <= 0 || betAmount > inrBalance}
                >
                    <Rocket className="mr-2" />
                    Place Bet (₹{betAmount})
                </Button>
            );
        case 'playing':
            return (
                <Button 
                  onClick={handleCashOut} 
                  size="lg" 
                  className="w-full h-16 text-lg bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg hover:shadow-emerald-500/50 transition-all animate-pulse"
                  disabled={!gameState || gameState.status !== 'in-flight' || currentMultiplier < 1.01}
                >
                    <TrendingUp className="mr-2" />
                    Cash Out (₹{potentialWin.toFixed(2)})
                </Button>
            );
        case 'cashed_out':
        case 'lost':
             return (
                <Button 
                  onClick={() => setPlayerState('betting')} 
                  size="lg" 
                  className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/50 transition-all"
                  disabled={!gameState || gameState.status !== 'waiting'}
                >
                    <Rocket className="mr-2" />
                    Place Bet for Next Launch
                </Button>
            );
    }
  };

  const displayMultiplier = gameState?.status === 'crashed' ? gameState.crashPoint : currentMultiplier;

  const rocketPosition = useMemo(() => {
    const isCrashed = gameState?.status === 'crashed';
    const isWaiting = gameState?.status === 'waiting';
    const crashPoint = gameState?.crashPoint || 10;
    
    if (isWaiting || !gameState) {
      return { 
        bottom: '20%', 
        left: '10%', 
        transform: 'rotate(-45deg)', 
        opacity: 1, 
        transition: 'all 0.5s ease-out'
      };
    }
    
    if (isCrashed) {
      const progress = Math.min(gameState.crashPoint / crashPoint, 1);
      const bottom = 20 + Math.pow(progress, 1.5) * 70;
      const left = 10 + progress * 75;
      return { 
        bottom: `${bottom}%`,
        left: `${left}%`,
        transform: `rotate(${-45 + progress * 90}deg) scale(0.5)`,
        opacity: 0.3,
        transition: 'all 0.8s ease-in'
      };
    }

    // In-flight
    const progress = Math.min(currentMultiplier / crashPoint, 1);
    const bottom = 20 + Math.pow(progress, 1.5) * 70;
    const left = 10 + progress * 75;
    const rotation = -45 + progress * 45;
    
    return {
      bottom: `${bottom}%`,
      left: `${left}%`,
      transform: `rotate(${rotation}deg)`,
      transition: 'all 0.2s linear'
    };
  }, [currentMultiplier, gameState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
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
              <p className="text-xs text-emerald-300">Successful Escapes</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold text-blue-400">{winRate}%</p>
              <p className="text-xs text-blue-300">Success Rate</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-orange-400" />
              <p className="text-2xl font-bold text-orange-400">{bestMultiplier.toFixed(2)}x</p>
              <p className="text-xs text-orange-300">Best Escape</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Game Area */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5 }} 
            className="lg:col-span-2 space-y-6"
          >
            {/* Flight Display */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-slate-700/50 text-center aspect-[16/10] flex flex-col relative overflow-hidden shadow-2xl">
              {/* Animated starfield background */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="stars"></div>
                <div className="twinkling"></div>
              </div>

              {/* Game trajectory line */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="trajectoryGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
                    <stop offset="50%" stopColor="rgba(139, 92, 246, 0.3)" />
                    <stop offset="100%" stopColor="rgba(236, 72, 153, 0.3)" />
                  </linearGradient>
                </defs>
                <path
                  d={`M 10 90 Q 30 70, 50 50 T 90 10`}
                  stroke="url(#trajectoryGradient)"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              </svg>
              
              <CardHeader className="z-10">
                <CardTitle className="text-slate-300 text-lg">{getFlightStatusText()}</CardTitle>
              </CardHeader>
              
              <CardContent className="flex flex-col items-center justify-center gap-4 p-4 sm:p-8 flex-1 z-10">
                {/* Multiplier Display */}
                <motion.div
                  key={gameState?.status}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <motion.p 
                    className={cn(
                      "text-6xl sm:text-8xl lg:text-9xl font-bold transition-colors duration-300 relative z-10",
                      gameState?.status === "crashed" ? "text-red-400" : 
                      playerState === "cashed_out" ? "text-emerald-400" : 
                      gameState?.status === "in-flight" ? "text-blue-400" : "text-slate-300"
                    )}
                    animate={
                      gameState?.status === "in-flight" ? {
                        textShadow: [
                          "0 0 20px rgba(59, 130, 246, 0.5)",
                          "0 0 40px rgba(59, 130, 246, 0.8)",
                          "0 0 20px rgba(59, 130, 246, 0.5)"
                        ]
                      } : {}
                    }
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    {displayMultiplier.toFixed(2)}x
                  </motion.p>
                  
                  {gameState?.status === "in-flight" && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-lg blur-xl"
                      animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Status Messages */}
                {gameState?.status === "waiting" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-2">
                      🚀 Preparing for launch
                    </Badge>
                    <p className="text-slate-400">Place your bets before takeoff!</p>
                  </motion.div>
                )}

                {gameState?.status === "crashed" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center"
                  >
                    <Badge className="bg-red-500/20 text-red-300 border-red-500/30 mb-2">
                      💥 Mission failed
                    </Badge>
                    <p className="text-slate-400">Better luck next time, astronaut!</p>
                  </motion.div>
                )}
              </CardContent>
              
              {/* Rocket Animation */}
              <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <motion.div
                  className="absolute"
                  style={{
                    width: '3rem',
                    height: '3rem',
                    ...rocketPosition
                  }}
                >
                  <Rocket
                    className={cn(
                      "w-full h-full transition-colors duration-500",
                      gameState?.status === "crashed" ? "text-red-400" :
                      gameState?.status === "in-flight" ? "text-blue-400" : "text-slate-400"
                    )}
                  />
                  
                  {/* Rocket trail effect */}
                  {gameState?.status === "in-flight" && (
                    <motion.div
                      className="absolute top-1/2 left-1/2 w-1 h-8 bg-gradient-to-t from-orange-400 via-yellow-400 to-transparent rounded-full origin-bottom"
                      style={{ transform: 'translate(-50%, 50%) rotate(45deg)' }}
                      animate={{ 
                        scaleY: [0.5, 1, 0.5],
                        opacity: [0.3, 0.8, 0.3]
                      }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                
                {/* Explosion effect */}
                {gameState?.status === "crashed" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: [0, 1.5, 1] }} 
                      transition={{ duration: 1 }}
                      className="text-6xl"
                    >
                      💥
                    </motion.div>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Action Button */}
            <div className="w-full">
              {getActionButton()}
            </div>
          </motion.div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Bet Amount */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <Wallet className="w-5 h-5"/>
                    <span>Mission Investment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="text-center text-xl font-bold h-14 bg-slate-700/50 border-slate-600 text-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                      disabled={playerState !== "betting"}
                      placeholder="Enter amount"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      ₹
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map((amount) => (
                      <Button
                        key={amount}
                        variant={betAmount === amount ? "default" : "outline"}
                        onClick={() => setBetAmount(amount)}
                        disabled={playerState !== "betting"}
                        className="bg-slate-700/30 border-slate-600 text-slate-200 hover:bg-slate-600/50 hover:border-blue-500"
                      >
                        ₹{amount}
                      </Button>
                    ))}
                  </div>
                  
                  <Button
                    variant="secondary"
                    className="w-full bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-500/30 text-red-300 hover:from-red-600/30 hover:to-orange-600/30"
                    onClick={() => setBetAmount(inrBalance)}
                    disabled={playerState !== "betting"}
                  >
                    All In (₹{inrBalance.toLocaleString()})
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mission Stats */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <TrendingUp className="w-5 h-5"/>
                    <span>Mission Stats</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                      <div className="text-slate-400">Potential Escape</div>
                      <div className="text-xl font-bold text-emerald-400">₹{potentialWin.toFixed(2)}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/50">
                      <div className="text-slate-400">Current Alt.</div>
                      <div className="text-xl font-bold text-blue-400">{displayMultiplier.toFixed(2)}x</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Mission Status</span>
                      <span className={cn(
                        "font-semibold",
                        gameState?.status === "waiting" ? "text-blue-400" :
                        gameState?.status === "in-flight" ? "text-green-400" :
                        "text-red-400"
                      )}>
                        {gameState?.status === "waiting" ? "🚀 Standby" :
                         gameState?.status === "in-flight" ? "🚀 Active" :
                         "💥 Failed"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Missions Flown</span>
                      <span className="font-semibold text-slate-200">{totalGames}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Best Escape</span>
                      <span className="font-semibold text-orange-400">{bestMultiplier.toFixed(2)}x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Crashes */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-200">
                    <History className="w-5 h-5"/>
                    <span>Recent Flights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {recentCrashes.map((crash, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "text-xs font-bold py-2 px-3 rounded-full border",
                        crash.multiplier < 2
                          ? "bg-red-500/20 text-red-400 border-red-500/30"
                          : crash.multiplier < 5
                          ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      )}
                    >
                      {crash.multiplier.toFixed(2)}x
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* How to Play */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12"
        >
          <Card className="bg-slate-800/30 backdrop-blur-xl border-slate-700/50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-slate-200 flex items-center gap-2 justify-center">
                <HelpCircle className="w-6 h-6"/>
                <span>Mission Briefing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🚀',
                  title: 'Launch Investment',
                  description: 'Set your bet amount while the rocket is in standby mode. Choose your investment wisely!'
                },
                {
                  icon: '📈',
                  title: 'Monitor Ascent',
                  description: 'Watch the multiplier grow as the rocket climbs higher. The longer it flies, the bigger your potential return!'
                },
                {
                  icon: '💰',
                  title: 'Escape in Time',
                  description: 'Cash out before the rocket crashes to secure your winnings. Timing is everything in space!'
                }
              ].map((step, index) => (
                <motion.div 
                  key={index}
                  className="text-center group"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all">
                    {step.icon}
                  </div>
                  <h3 className="font-bold text-lg text-slate-200 mb-2">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin Controls */}
        {isAdmin && <AdminControls />}
      </div>

      {/* Custom CSS for starfield effect */}
      <style jsx>{`
        .stars, .twinkling {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .stars {
          background: #000 url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPGRlZnM+IDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiPiA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZmZmIiBzdG9wLW9wYWNpdHk9IjAuNSIvPiA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmZmYiIHN0b3Atb3BhY2l0eT0iMCIvPiA8L2xpbmVhckdyYWRpZW50PiA8L2RlZnM+IDxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmZmYiLz4gPHJlY3QgeD0iMjAiIHk9IjIwIiB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjZmZmIi8+IDxyZWN0IHg9IjQwIiB5PSI0MCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI2ZmZiIvPiA8L3N2Zz4=') repeat;
          animation: move-stars 50s linear infinite;
        }

        .twinkling {
          background: transparent url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gPGNpcmNsZSBjeD0iMzAiIGN5PSI0MCIgcj0iMSIgZmlsbD0iI2ZmZiIgb3BhY2l0eT0iMC44Ii8+IDxjaXJjbGUgY3g9IjgwIiBjeT0iMTIwIiByPSIxIiBmaWxsPSIjZmZmIiBvcGFjaXR5PSIwLjYiLz4gPGNpcmNsZSBjeD0iMTUwIiBjeT0iNzAiIHI9IjEiIGZpbGw9IiNmZmYiIG9wYWNpdHk9IjAuNyIvPiA8L3N2Zz4=') repeat;
          animation: move-twinkle 100s linear infinite;
        }

        @keyframes move-stars {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }

        @keyframes move-twinkle {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
      `}</style>
    </div>
  );
}
