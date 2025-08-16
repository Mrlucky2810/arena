
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const segments = [
    { label: '2x', multiplier: 2, color: '#4ade80', probability: 25 },
    { label: 'Lose', multiplier: 0, color: '#64748b', probability: 30 },
    { label: '1.5x', multiplier: 1.5, color: '#60a5fa', probability: 20 },
    { label: 'Lose', multiplier: 0, color: '#475569', probability: 15 },
    { label: '5x', multiplier: 5, color: '#c084fc', probability: 8 },
    { label: 'Lose', multiplier: 0, color: '#334155', probability: 2 }
];

const totalProbability = segments.reduce((acc, seg) => acc + seg.probability, 0);

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
};

const createSegmentPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${centerX},${centerY} L ${start.x},${start.y} A ${radius},${radius} 0 ${largeArcFlag} 0 ${end.x},${end.y} Z`;
};

const getTextPosition = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const midAngle = startAngle + (endAngle - startAngle) / 2;
    const textRadius = radius * 0.7;
    return polarToCartesian(centerX, centerY, textRadius, midAngle);
};

export default function SpinWheelPage() {
    const { user, inrBalance, updateBalance } = useAuth();
    const { toast } = useToast();
    const [betAmount, setBetAmount] = useState<number>(10);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<string | null>(null);

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
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to play.' });
            return;
        }
        if (betAmount > inrBalance) {
            toast({ variant: 'destructive', title: 'Insufficient balance!' });
            return;
        }
        if (betAmount <= 0) {
            toast({ variant: 'destructive', title: "Invalid bet amount" });
            return;
        }

        setIsSpinning(true);
        setResult(null);

        try {
            await updateBalance(user.uid, -betAmount, 'inr');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not place your bet.' });
            setIsSpinning(false);
            return;
        }

        const random = Math.random() * totalProbability;
        let cumulative = 0;
        let selectedSegment = segments[0];
        let selectedIndex = 0;

        for (const [index, segment] of segments.entries()) {
            cumulative += segment.probability;
            if (random <= cumulative) {
                selectedSegment = segment;
                selectedIndex = index;
                break;
            }
        }
        
        const segmentAngle = 360 / segments.length;
        const segmentStartAngle = segmentAngle * selectedIndex;
        
        // Add a small random offset to land within the segment, not on the edge
        const randomOffset = Math.random() * (segmentAngle - 10) + 5; // e.g., from 5 to 55 for a 60-degree segment
        const targetAngleWithinSegment = segmentStartAngle + randomOffset;
        
        // The pointer is at the top (0/360 degrees). We need to rotate the wheel
        // so that the target angle ends up at the top.
        const rotationToTarget = 360 - targetAngleWithinSegment;

        // Add multiple full spins for animation effect.
        // It's important to not use the previous rotation value here.
        const finalRotation = (rotation - (rotation % 360)) + (360 * 5) + rotationToTarget;

        setRotation(finalRotation);

        setTimeout(() => {
            setIsSpinning(false);
            setResult(selectedSegment.label);

            if (selectedSegment.multiplier > 0) {
                const winAmount = Math.floor(betAmount * selectedSegment.multiplier);
                updateBalance(user.uid, winAmount, 'inr');
                logGameResult(winAmount - betAmount, selectedSegment.label);
                toast({ title: "You Won!", description: `+₹${winAmount - betAmount}! Landed on ${selectedSegment.label}!` });
            } else {
                logGameResult(-betAmount, selectedSegment.label);
                toast({ variant: 'destructive', title: 'You Lost!', description: `Landed on ${selectedSegment.label}.` });
            }
        }, 4000);
    };

    const potentialWin = betAmount * Math.max(...segments.map(s => s.multiplier));
    const winChance = segments.reduce((acc, s) => s.multiplier > 0 ? acc + s.probability : acc, 0);

    const radius = 150;
    const centerX = 150;
    const centerY = 150;
    const segmentAngle = 360 / segments.length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="lg:col-span-2"
            >
                <Card className="text-center overflow-hidden bg-card/80 backdrop-blur-sm border-white/5">
                    <CardHeader>
                        <CardTitle>Wheel of Fortune</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-6 p-4 sm:p-8">
                        <div className="relative w-[300px] h-[300px] mb-8 flex items-center justify-center">
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: 0,
                                    height: 0,
                                    borderLeft: '15px solid transparent',
                                    borderRight: '15px solid transparent',
                                    borderTop: '20px solid hsl(var(--primary))',
                                    zIndex: 10
                                }}
                            />
                             <svg
                                width="300"
                                height="300"
                                className="drop-shadow-lg"
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transition: isSpinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'
                                }}
                            >
                                {segments.map((segment, index) => {
                                    const startAngle = index * segmentAngle;
                                    const endAngle = (index + 1) * segmentAngle;
                                    const path = createSegmentPath(centerX, centerY, radius, startAngle, endAngle);
                                    const textPos = getTextPosition(centerX, centerY, radius, startAngle, endAngle);
                                    
                                    return (
                                        <g key={index}>
                                            <path d={path} fill={segment.color} stroke="#ffffff" strokeWidth="2" />
                                            <text x={textPos.x} y={textPos.y} fill="white" fontSize="24" fontWeight="600" textAnchor="middle" dominantBaseline="central" transform={`rotate(${startAngle + segmentAngle / 2}, ${textPos.x}, ${textPos.y})`}>
                                                {segment.label}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>

                            <button
                                onClick={spinWheel}
                                disabled={isSpinning}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-background text-foreground font-semibold uppercase hover:bg-muted active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg border-4 border-primary z-10"
                            >
                                Spin
                            </button>
                        </div>
                        {result && !isSpinning && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={cn("mb-6 text-2xl font-bold",
                                    result !== 'Lose' ? 'text-emerald-500' : 'text-destructive'
                                )}
                            >
                                {result !== 'Lose' ? `🏆 Won ${result}!` : '💔 Better luck next time!'}
                            </motion.div>
                        )}
                        <Button
                            size="lg"
                            onClick={spinWheel}
                            disabled={isSpinning || betAmount > inrBalance}
                            className={cn("w-full h-14 text-lg shadow-lg hover:shadow-primary/50 transition-shadow", result && result !== 'Lose' && 'pulse-win')}
                        >
                            {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
            <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <Card className="bg-card/80 backdrop-blur-sm border-white/5">
                        <CardHeader><CardTitle>Bet Amount</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Input
                                type="number"
                                min="1"
                                max={inrBalance}
                                value={betAmount}
                                onChange={(e) => setBetAmount(Number(e.target.value))}
                                className="text-center text-xl font-bold h-12 bg-input/50"
                                disabled={isSpinning}
                            />
                            <div className="grid grid-cols-2 gap-2">
                                {[10, 25, 50, 100].map((amount) => (
                                    <Button
                                        key={amount}
                                        variant="outline"
                                        onClick={() => setBetAmount(amount)}
                                        disabled={isSpinning || amount > inrBalance}
                                    >
                                        ₹{amount}
                                    </Button>
                                ))}
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => setBetAmount(inrBalance)}
                                disabled={isSpinning}
                                className="w-full"
                            >
                                All In (₹{inrBalance.toLocaleString()})
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <Card className="bg-card/80 backdrop-blur-sm border-white/5">
                        <CardHeader className="flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">Game Info</CardTitle>
                            <Wallet className="w-5 h-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Your Balance</span>
                                <span className="font-semibold text-primary">₹{inrBalance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Bet Amount</span>
                                <span className="font-semibold">₹{betAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Max Win</span>
                                <span className="font-semibold text-emerald-500">₹{potentialWin.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Win Chance</span>
                                <span className="font-semibold">{winChance}%</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    <Card className="bg-card/80 backdrop-blur-sm border-white/5">
                        <CardHeader>
                            <CardTitle className="text-lg">Segments</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {segments.map((segment, index) => (
                                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 rounded-full" style={{backgroundColor: segment.color}}></div>
                                        <span className="font-medium">{segment.label}</span>
                                    </div>
                                    <span className="text-muted-foreground text-sm">{segment.probability}%</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

    