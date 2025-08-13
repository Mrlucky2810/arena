
'use client';

import { ReferralDashboard } from "@/components/referrals/referral-dashboard";
import { Handshake } from "lucide-react";

export default function ReferralsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Handshake className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Refer & Earn</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Invite your friends to Apex Arena and earn rewards for every new player.
          </p>
        </div>
      </div>
      <ReferralDashboard />
    </div>
  );
}
