
'use client';

import { RegisterForm } from "@/components/auth/register-form";
import { Logo } from "@/components/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

export default function RegisterAdminPage() {
  return (
    <Card className="w-full max-w-lg shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Logo />
        </div>
        <CardTitle className="text-2xl font-bold">Register Administrator</CardTitle>
        <CardDescription>Create the first administrative account to manage the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 bg-primary/10 border-primary/20">
            <ShieldAlert className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">First-Time Setup</AlertTitle>
            <AlertDescription>
                As the first user, you will be registered as the platform administrator.
            </AlertDescription>
        </Alert>
        <RegisterForm isAdminRegistration={true} />
      </CardContent>
    </Card>
  );
}
