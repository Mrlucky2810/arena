
'use client';

import { WithdrawForm } from "@/components/withdraw/withdraw-form";
import { Coins } from "lucide-react";

export default function WithdrawPage() {
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
            <Coins className="w-8 h-8" />
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Withdraw Funds</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Choose your preferred withdrawal method.
                </p>
            </div>
        </div>
      <WithdrawForm />
    </div>
  );
}
