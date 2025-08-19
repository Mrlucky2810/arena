'use client'

import { DiceGame } from "@/components/games/dice-game";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dice6 } from "lucide-react";
import Link from "next/link";

export default function DiceGamePage() {
  return (
    <div className="flex flex-col gap-6">
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">Dashboard</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Dice Game</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-4">
            <Dice6 className="w-8 h-8 text-primary" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Dice Game</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Predict the outcome of the dice roll and win big!
                </p>
            </div>
        </div>
        <DiceGame />
    </div>
  );
}
