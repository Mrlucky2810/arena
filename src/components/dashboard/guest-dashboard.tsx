"use client"

import Link from "next/link";
import { Button } from "../ui/button";
import { Gamepad2, ShieldCheck, Trophy, Zap, Star, Users, TrendingUp, Crown, Play, ArrowRight } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { faqItems, trendingGames } from "@/lib/mock-data";
import { GameCard } from "./game-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { motion } from "framer-motion";
import { Badge } from "../ui/badge";

const features = [
    {
        icon: ShieldCheck,
        title: "Secure & Fair",
        description: "We use advanced encryption and provably fair algorithms to ensure your data and bets are safe.",
        color: "from-emerald-500 to-green-500"
    },
    {
        icon: Zap,
        title: "Instant Payouts",
        description: "Enjoy lightning-fast deposits and withdrawals with our streamlined payment systems.",
        color: "from-yellow-500 to-orange-500"
    },
    {
        icon: Gamepad2,
        title: "Vast Game Selection",
        description: "From classic casino games to live sports betting, we have something for every type of player.",
        color: "from-purple-500 to-pink-500"
    }
]

const stats = [
    { label: "Active Players", value: "42,891", icon: Users, color: "text-blue-500" },
    { label: "Games Available", value: "150+", icon: Gamepad2, color: "text-purple-500" },
    { label: "Won Today", value: "₹2.4M", icon: Trophy, color: "text-yellow-500" },
    { label: "Success Rate", value: "99.9%", icon: Star, color: "text-emerald-500" },
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

export function GuestDashboard() {
    return (
        <motion.div 
            className="flex flex-col gap-12 md:gap-20"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Hero Section */}
            <motion.section 
                className="relative overflow-hidden"
                variants={itemVariants}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 animate-gradient-xy" />
                
                <div className="relative grid lg:grid-cols-2 gap-8 lg:gap-12 items-center text-center lg:text-left py-8 lg:py-12">
                    <motion.div 
                        className="space-y-6"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Badge className="mb-4 bg-gradient-to-r from-primary to-accent text-white">
                                <Star className="w-3 h-3 mr-1" />
                                #1 Gaming Platform
                            </Badge>
                        </motion.div>
                        
                        <motion.h1 
                            className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                        >
                            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                                World's Largest
                            </span>
                            <br />
                            <span className="text-foreground">
                                Online Casino & Sportsbook
                            </span>
                        </motion.h1>
                        
                        <motion.p 
                            className="text-muted-foreground md:text-lg lg:text-xl max-w-lg mx-auto lg:mx-0"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            Join millions of players and experience the thrill of the win with top-tier security, instant payouts, and unmatched gaming excitement.
                        </motion.p>
                        
                        <motion.div 
                            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href="/register">
                                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-xl hover:shadow-primary/30 transition-all duration-300 text-lg px-8 py-6">
                                    
                                        <Crown className="mr-2 h-5 w-5" />
                                        Start Winning Now
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    
                                </Button>
                                </Link>
                            </motion.div>
                            
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href="/games">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary/20 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 text-lg px-8 py-6">
                                    
                                        <Play className="mr-2 h-5 w-5" />
                                        Explore Games
                                    
                                </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Hero Image/Games Grid */}
                    <motion.div 
                        className="grid grid-cols-2 gap-4 lg:gap-6"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Link href="/games/color-prediction">
                                <Card className="relative group overflow-hidden rounded-xl aspect-square cursor-pointer">
                                    <Image 
                                        src="/casino.jpg" 
                                        alt="Casino" 
                                        width={400} 
                                        height={400} 
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                                        data-ai-hint="casino scene" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-4 w-full">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Gamepad2 className="text-primary" />
                                            <h3 className="font-bold text-lg text-white">Casino</h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-white/80">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>32,819 Playing</span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Card>
                            </Link>
                        </motion.div>
                        
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Link href="/sports">
                                <Card className="relative group overflow-hidden rounded-xl aspect-square cursor-pointer">
                                    <Image 
                                        src="/sports.jpg" 
                                        alt="Sports" 
                                        width={400} 
                                        height={400} 
                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" 
                                        data-ai-hint="sports athletes" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-4 w-full">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Trophy className="text-accent" />
                                            <h3 className="font-bold text-lg text-white">Sports</h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-white/80">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>9,492 Playing</span>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Card>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.section>

            {/* Live Stats Section */}
            <motion.section variants={itemVariants}>
                <Card className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-primary/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 animate-pulse" />
                    <CardContent className="relative p-6 lg:p-8">
                        <div className="text-center mb-8">
                            <motion.div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 mb-4"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-emerald-600 font-semibold text-sm">LIVE NOW</span>
                            </motion.div>
                            <h2 className="text-2xl lg:text-3xl font-bold mb-2">Real-Time Gaming Stats</h2>
                            <p className="text-muted-foreground">Join the action happening right now</p>
                        </div>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    className="text-center"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <div className={`inline-flex p-3 rounded-full bg-gradient-to-br from-card to-card/50 border border-border/50 mb-3 ${stat.color}`}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div className="text-2xl lg:text-3xl font-bold mb-1">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.section>

            {/* Trending Games Section */}
            <motion.section variants={itemVariants}>
                <div className="text-center mb-8">
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 mb-4"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                        <Zap className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-600 font-semibold text-sm">TRENDING</span>
                    </motion.div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Most Popular Games</h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Experience the hottest games that millions of players are enjoying right now
                    </p>
                </div>
                
                <Carousel opts={{ align: "start", loop: true }} className="w-full">
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {trendingGames.map((game, index) => (
                            <CarouselItem key={game.name} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <GameCard game={game} />
                                </motion.div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
            </motion.section>

            {/* Features Section */}
            <motion.section variants={itemVariants}>
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Why Choose Apex Arena?</h2>
                    <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                        We are committed to providing the best online gaming experience with top-notch security, 
                        lightning-fast payouts, and a massive selection of games.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            whileHover={{ y: -10 }}
                        >
                            <Card className="text-center p-6 h-full bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group">
                                <CardHeader className="pb-4">
                                    <motion.div
                                        className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                    >
                                        <feature.icon className="w-8 h-8 text-white" />
                                    </motion.div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.section>
            
            {/* Welcome Bonus Section */}
            <motion.section variants={itemVariants}>
                <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border-primary/30">
                    {/* Animated background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/30 to-transparent rounded-full -translate-y-32 translate-x-32 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/30 to-transparent rounded-full translate-y-24 -translate-x-24 animate-pulse animation-delay-500" />
                    
                    <div className="relative grid md:grid-cols-2 gap-8 items-center p-8 lg:p-12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <motion.div
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 mb-6"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            >
                                <Crown className="w-4 h-4 text-emerald-500" />
                                <span className="text-emerald-600 font-semibold text-sm">EXCLUSIVE OFFER</span>
                            </motion.div>
                            
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                                Get Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">150% Welcome Bonus!</span>
                            </h2>
                            <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                                Sign up today and get a massive 150% bonus on your first deposit up to ₹15,000. 
                                Don't miss out on this limited-time offer to kickstart your winning journey.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link href="/register">
                                    <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-xl hover:shadow-emerald-500/30 transition-all duration-300">
                                        <Crown className="mr-2 h-5 w-5" />
                                        Claim Bonus Now
                                    </Button>
                                    </Link>
                                </motion.div>
                                
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Link href="/promotions">
                                    <Button size="lg" variant="outline" className="border-primary/30 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300">
                                            View All Promotions
                                    </Button>
                                    </Link>
                                </motion.div>
                            </div>
                        </motion.div>
                        
                        <motion.div 
                            className="hidden md:flex justify-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Image 
                                    src="https://placehold.co/400x300.png" 
                                    alt="Welcome Bonus" 
                                    width={400} 
                                    height={300} 
                                    className="rounded-2xl object-cover shadow-2xl" 
                                    data-ai-hint="gift box money celebration" 
                                />
                            </motion.div>
                        </motion.div>
                    </div>
                </Card>
            </motion.section>

            {/* FAQ Section */}
            <motion.section variants={itemVariants}>
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Get answers to common questions about our platform, games, and services
                    </p>
                </div>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Accordion type="single" collapsible className="w-full max-w-4xl mx-auto">
                        {faqItems.slice(0, 6).map((item, index) => (
                            <motion.div
                                key={item.value}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <AccordionItem value={item.value} className="border-border/50">
                                    <AccordionTrigger className="hover:text-primary transition-colors text-left">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground leading-relaxed">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            </motion.div>
                        ))}
                    </Accordion>
                </motion.div>
            </motion.section>

            {/* Final CTA Section */}
            <motion.section 
                variants={itemVariants}
                className="text-center"
            >
                <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border-primary/30 p-8 lg:p-16">
                    {/* Floating elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-primary/30 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                }}
                                animate={{
                                    y: [0, -20, 0],
                                    opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                }}
                            />
                        ))}
                    </div>
                    
                    <motion.div
                        className="relative z-10"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 mb-6"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Star className="w-4 h-4 text-primary" />
                            <span className="text-primary font-semibold text-sm">JOIN MILLIONS OF WINNERS</span>
                        </motion.div>
                        
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
                            Ready to Join the <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Action?</span>
                        </h2>
                        <p className="text-muted-foreground text-lg lg:text-xl max-w-3xl mx-auto mb-8 leading-relaxed">
                            Create your account in seconds and dive into a world of endless entertainment and big wins. 
                            Your next victory is just a click away!
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href="/register">
                                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-2xl hover:shadow-primary/30 transition-all duration-300 text-lg px-8 py-6">
                                    <Crown className="mr-2 h-5 w-5" />
                                    Start Your Journey
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                </Link>
                            </motion.div>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex -space-x-2">
                                    {[...Array(4)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background flex items-center justify-center text-white text-xs font-bold"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                                        >
                                            {i + 1}
                                        </motion.div>
                                    ))}
                                </div>
                                <span>42,891 players joined today</span>
                            </div>
                        </div>
                    </motion.div>
                </Card>
            </motion.section>
        </motion.div>
    );
}
