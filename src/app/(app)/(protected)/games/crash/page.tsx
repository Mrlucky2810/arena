
'use client'

import { CrashGame } from "@/components/games/crash-game";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Rocket } from "lucide-react";
import Link from "next/link";

export default function CrashGamePage() {
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
                    <BreadcrumbPage>Crash Game</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-4">
            <Rocket className="w-8 h-8" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Crash Game</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                Watch the multiplier grow and cash out before it crashes!
                </p>
            </div>
        </div>
        <CrashGame />
    </div>
  );
}
