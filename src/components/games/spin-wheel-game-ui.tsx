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
    if (!user || betAmount > inrBalance) {
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
              <p className="text-2xl font-bold text-purple-400">₹{inrBalance.toLocaleString()}</p>
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