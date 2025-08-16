
"use client"

import Link from "next/link";
import { Button } from "../ui/button";
import { Gamepad2, ShieldCheck, Trophy, Zap } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { faqItems, trendingGames } from "@/lib/mock-data";
import { GameCard } from "./game-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const features = [
    {
        icon: ShieldCheck,
        title: "Secure & Fair",
        description: "We use advanced encryption and provably fair algorithms to ensure your data and bets are safe."
    },
    {
        icon: Zap,
        title: "Instant Payouts",
        description: "Enjoy lightning-fast deposits and withdrawals with our streamlined payment systems."
    },
    {
        icon: Gamepad2,
        title: "Vast Game Selection",
        description: "From classic casino games to live sports betting, we have something for every type of player."
    }
]

export function GuestDashboard() {
    return (
        <div className="flex flex-col gap-12 md:gap-20">
            <section className="grid lg:grid-cols-2 gap-8 items-center text-center lg:text-left">
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                        World&apos;s Largest Online Casino and Sportsbook
                    </h1>
                    <p className="text-muted-foreground md:text-lg">
                        Join millions of players and experience the thrill of the win with top-tier security and instant payouts.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center lg:justify-start">
                        <Button size="lg" className="w-full sm:w-auto" asChild>
                            <Link href="/register">Register Now & Get a Bonus</Link>
                        </Button>
                         <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                            <Link href="/games">Browse Games</Link>
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Link href="/games/color-prediction">
                        <Card className="relative group overflow-hidden rounded-lg aspect-square">
                             <Image src="/casino.jpg" alt="Casino" width={400} height={400} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" data-ai-hint="casino scene" />
                             <div className="absolute inset-0 bg-black/40" />
                             <div className="absolute bottom-0 left-0 p-4 text-white">
                                <div className="flex items-center gap-2">
                                    <Gamepad2 />
                                    <h3 className="font-bold text-lg">Casino</h3>
                                </div>
                                <div className="flex items-center gap-2 text-sm opacity-80">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>32,819 Playing</span>
                                </div>
                             </div>
                        </Card>
                    </Link>
                     <Link href="/sports">
                        <Card className="relative group overflow-hidden rounded-lg aspect-square">
                             <Image src="/sports.jpg" alt="Sports" width={400} height={400} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" data-ai-hint="sports athletes" />
                             <div className="absolute inset-0 bg-black/40" />
                             <div className="absolute bottom-0 left-0 p-4 text-white">
                                <div className="flex items-center gap-2">
                                    <Trophy />
                                    <h3 className="font-bold text-lg">Sports</h3>
                                </div>
                                <div className="flex items-center gap-2 text-sm opacity-80">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span>9,492 Playing</span>
                                </div>
                             </div>
                        </Card>
                    </Link>
                </div>
            </section>

             <section>
                <h2 className="text-3xl font-bold tracking-tight text-center mb-4 md:mb-6">Trending Games</h2>
                <Carousel opts={{ align: "start", loop: true }}>
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {trendingGames.map((game) => (
                        <CarouselItem key={game.name} className="pl-2 md:pl-4 basis-full sm:basis-1/2">
                            <GameCard game={game} />
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
            </section>

            <section className="text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose Apex Arena?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-8">We are committed to providing the best online gaming experience with top-notch security, lightning-fast payouts, and a massive selection of games.</p>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map(feature => (
                        <Card key={feature.title} className="text-left p-2">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className="p-3 rounded-lg bg-primary/10">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
            
            <section className="grid md:grid-cols-2 gap-8 items-center bg-accent/10 p-6 sm:p-8 rounded-lg">
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Get Your Welcome Bonus!</h2>
                    <p className="text-muted-foreground mb-6">Sign up today and get a massive 150% bonus on your first deposit. Don't miss out on this limited-time offer to kickstart your winning journey.</p>
                    <Button size="lg" asChild>
                        <Link href="/promotions">View All Promotions</Link>
                    </Button>
                 </div>
                 <div className="hidden md:flex justify-center">
                    <Image src="https://placehold.co/400x300.png" alt="Bonus" width={400} height={300} className="rounded-lg object-cover" data-ai-hint="gift box money" />
                 </div>
            </section>

            <section>
                 <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">Frequently Asked Questions</h2>
                 <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
                    {faqItems.slice(0, 4).map((item) => (
                        <AccordionItem key={item.value} value={item.value}>
                            <AccordionTrigger>{item.question}</AccordionTrigger>
                            <AccordionContent>{item.answer}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>

             <section className="text-center bg-gradient-to-r from-primary/20 to-accent/20 py-12 sm:py-16 px-4 rounded-lg">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Ready to Join the Action?</h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">Create your account in seconds and dive into a world of endless entertainment and big wins. Your next victory is just a click away!</p>
                <Button size="lg" asChild>
                    <Link href="/register">Sign Up Now</Link>
                </Button>
            </section>
        </div>
    );
}
