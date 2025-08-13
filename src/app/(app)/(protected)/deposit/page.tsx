
'use client';

import { DepositForm } from "@/components/deposit/deposit-form";
import { Coins } from "lucide-react";

export default function DepositPage() {
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
            <Coins className="w-8 h-8" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Deposit Funds</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Choose your preferred deposit method.
                </p>
            </div>
        </div>
        <DepositForm />
    </div>
  );
}
