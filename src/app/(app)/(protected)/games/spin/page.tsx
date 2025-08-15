
'use client'

import { SpinWheelGame } from "@/components/games/spin-wheel-game";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Star } from "lucide-react";
import Link from "next/link";

export default function SpinGamePage() {
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
                    <BreadcrumbPage>Spin Wheel</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-4">
            <Star className="w-8 h-8 text-primary" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Spin Wheel</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Spin the wheel for a chance to win exciting prizes!
                </p>
            </div>
        </div>
        <SpinWheelGame />
    </div>
  );
}
