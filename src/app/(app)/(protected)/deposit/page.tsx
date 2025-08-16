
'use client';

import { DepositForm } from "@/components/deposit/deposit-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Coins, ShieldCheck } from "lucide-react";

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
        <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertTitle>Secure & Fast Deposits</AlertTitle>
            <AlertDescription>
              Your deposit requests will be reviewed by our team. Funds will be credited to your account upon approval, typically within 5-10 minutes. All transactions are securely processed.
            </AlertDescription>
        </Alert>
        <DepositForm />
    </div>
  );
}
