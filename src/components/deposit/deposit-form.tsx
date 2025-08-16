
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Bitcoin, Copy } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const depositSchema = z.object({
    transactionId: z.string().min(1, "Transaction ID is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
});

type DepositTab = 'inr' | 'crypto';

export function DepositForm() {
    const { toast } = useToast();
    const { user } = useAuth();
    const cryptoWalletAddress = "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq";

    const form = useForm<z.infer<typeof depositSchema>>({
        resolver: zodResolver(depositSchema),
        defaultValues: {
            transactionId: "",
            amount: 1000,
        },
    });

    async function onSubmit(values: z.infer<typeof depositSchema>, type: DepositTab) {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to make a deposit." });
            return;
        }

        try {
            await addDoc(collection(db, "deposits"), {
                userId: user.uid,
                type: type,
                transactionId: values.transactionId,
                amount: values.amount,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Deposit Request Submitted",
                description: "Your request is pending approval. It may take a few minutes to reflect in your account.",
            });
            form.reset();
        } catch (error) {
            console.error("Error submitting deposit:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit your deposit request. Please try again." });
        }
    }

    const copyToClipboard = () => {
        navigator.clipboard.writeText(cryptoWalletAddress);
        toast({
            title: "Copied!",
            description: "Wallet address copied to clipboard.",
        });
    }

  return (
    <Tabs defaultValue="inr" className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
        <TabsTrigger value="inr"><Banknote className="mr-2"/> Pay via INR</TabsTrigger>
        <TabsTrigger value="crypto"><Bitcoin className="mr-2"/> Pay via Crypto</TabsTrigger>
      </TabsList>
      <TabsContent value="inr">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">INR Deposit</CardTitle>
            <CardDescription>Scan the QR code to pay, then submit the transaction details below.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-lg bg-muted">
                <Image src="https://placehold.co/256x256.png" width={256} height={256} alt="INR Deposit QR Code" className="rounded-lg w-48 h-48 sm:w-64 sm:h-64" data-ai-hint="QR code" />
                <p className="text-sm text-muted-foreground">Scan with any UPI app</p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((values) => onSubmit(values, 'inr'))} className="space-y-6">
                <FormField
                  control={form.control}
                  name="transactionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID / UTR</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the 12-digit UTR" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount Paid</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg">Submit Deposit</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="crypto">
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Crypto Deposit</CardTitle>
                <CardDescription>Send funds to the address below, then submit the transaction details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-lg bg-muted">
                    <Image src="https://placehold.co/256x256.png" width={256} height={256} alt="Crypto Deposit QR Code" className="rounded-lg w-48 h-48 sm:w-64 sm:h-64" data-ai-hint="QR code" />
                    <p className="text-sm text-muted-foreground font-semibold">Wallet Address (BTC)</p>
                    <div className="flex items-center gap-2 p-2 rounded-md bg-background w-full text-center">
                        <p className="text-xs sm:text-sm text-muted-foreground truncate flex-1 break-all">{cryptoWalletAddress}</p>
                        <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                            <Copy className="w-4 h-4"/>
                        </Button>
                    </div>
                </div>
                <Form {...form}>
                <form onSubmit={form.handleSubmit((values) => onSubmit(values, 'crypto'))} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="transactionId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Transaction ID / Hash</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter the transaction hash" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Amount Sent (in INR value)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Enter equivalent INR amount" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" size="lg">Submit Deposit</Button>
                </form>
                </Form>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
