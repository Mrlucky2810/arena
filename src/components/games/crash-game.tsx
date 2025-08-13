
"use client";

import { useAuth } from "@/context/auth-context";
import { CrashGameUI } from "@/components/games/crash-game-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Terminal } from "lucide-react";

export function CrashGame() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You have to <Link href="/login" className="font-bold text-primary hover:underline">login</Link> to play this game.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return <CrashGameUI />;
}
