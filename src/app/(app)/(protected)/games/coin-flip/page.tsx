
'use client'

import { CoinFlipGame } from "@/components/games/coin-flip-game";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Coins } from "lucide-react";
import Link from "next/link";

export default function CoinFlipGamePage() {
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
                    <BreadcrumbPage>Coin Flip</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-4">
            <Coins className="w-8 h-8 text-primary" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Coin Flip</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                Choose heads or tails and double your bet with a lucky flip!
                </p>
            </div>
        </div>
        <CoinFlipGame />
    </div>
  );
}
