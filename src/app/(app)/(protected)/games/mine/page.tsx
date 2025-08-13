
'use client'

import { MineSweeperGame } from "@/components/games/mine-sweeper-game";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Bomb } from "lucide-react";
import Link from "next/link";

export default function MineGamePage() {
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
                    <BreadcrumbPage>Mines</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-center gap-4">
            <Bomb className="w-8 h-8 text-primary" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Mines</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Uncover gems and avoid the mines to win big!
                </p>
            </div>
        </div>
      <MineSweeperGame />
    </div>
  );
}
