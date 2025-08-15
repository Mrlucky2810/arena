
'use client'

import { ColorPredictionGame } from "@/components/games/color-prediction-game";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Palette } from "lucide-react";
import Link from "next/link";

export default function ColorPredictionPage() {
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
                        <BreadcrumbPage>Color Prediction</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            
            <div className="flex items-center gap-4">
                <Palette className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">Color Prediction</h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Predict the next color and win big rewards!
                    </p>
                </div>
            </div>

            <ColorPredictionGame />
        </div>
    );
}
