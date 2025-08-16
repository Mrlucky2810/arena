
'use client';

import { WithdrawForm } from "@/components/withdraw/withdraw-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Coins, ShieldCheck } from "lucide-react";

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
        <Alert variant="destructive">
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Secure & Safe Withdrawals</AlertTitle>
            <AlertDescription>
                Withdrawal requests are processed manually by our team for security. Please allow up to 2-4 hours for bank transfers and up to 1 hour for crypto withdrawals. Ensure your details are correct to avoid delays.
            </AlertDescription>
        </Alert>
      <WithdrawForm />
    </div>
  );
}
