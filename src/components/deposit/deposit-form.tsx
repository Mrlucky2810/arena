
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
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { cryptoWallets } from "@/lib/constants";

const inrDepositSchema = z.object({
    transactionId: z.string().min(1, "Transaction ID is required").min(3, "Transaction ID is too short"),
    amount: z.coerce.number().positive("Amount must be positive").min(2000, "Minimum deposit is ₹2000"),
});

const cryptoDepositSchema = z.object({
    currency: z.string({ required_error: "Please select a currency." }),
    transactionId: z.string().min(1, "Transaction ID is required").min(3, "Transaction ID is too short"),
    amount: z.coerce.number().positive("Amount must be positive").min(0.0001, "Minimum deposit is 0.0001"),
});

type DepositTab = 'inr' | 'crypto';

export function DepositForm() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);

    const inrForm = useForm<z.infer<typeof inrDepositSchema>>({
        resolver: zodResolver(inrDepositSchema),
        defaultValues: {
            transactionId: "",
            amount: 2000,
        },
    });

    const cryptoForm = useForm<z.infer<typeof cryptoDepositSchema>>({
        resolver: zodResolver(cryptoDepositSchema),
        defaultValues: {
            transactionId: "",
            amount: 0.0001,
        },
    });

    async function handleInrSubmit(values: z.infer<typeof inrDepositSchema>) {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to make a deposit." });
            return;
        }
        try {
            await addDoc(collection(db, "deposits"), {
                userId: user.uid,
                type: 'inr',
                transactionId: values.transactionId,
                amount: values.amount,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Deposit Request Submitted",
                description: "Your request is pending approval. It may take a few minutes to reflect in your account.",
            });
            inrForm.reset();
        } catch (error) {
            console.error("Error submitting INR deposit:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit your deposit request. Please try again." });
        }
    }
    
    async function handleCryptoSubmit(values: z.infer<typeof cryptoDepositSchema>) {
        if (!user) {
            toast({ variant: "destructive", title: "Error", description: "You must be logged in to make a deposit." });
            return;
        }
        try {
            await addDoc(collection(db, "deposits"), {
                userId: user.uid,
                type: 'crypto',
                currency: values.currency,
                transactionId: values.transactionId,
                amount: values.amount,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Deposit Request Submitted",
                description: "Your request is pending approval. It may take a few minutes to reflect in your account.",
            });
            cryptoForm.reset();
            setSelectedCrypto(null);
        } catch (error) {
            console.error("Error submitting crypto deposit:", error);
            toast({ variant: "destructive", title: "Submission Failed", description: "Could not submit your deposit request. Please try again." });
        }
    }


    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Wallet address copied to clipboard.",
        });
    }

  return (
    <Tabs defaultValue="inr" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="inr">
          <Banknote className="mr-2"/>
          Pay via INR
        </TabsTrigger>
        <TabsTrigger value="crypto">
          <Bitcoin className="mr-2"/>
          Pay via Crypto
        </TabsTrigger>
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
            <Form {...inrForm}>
              <form onSubmit={inrForm.handleSubmit(handleInrSubmit)} className="space-y-6">
                <FormField
                  control={inrForm.control}
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
                  control={inrForm.control}
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
                <CardDescription>Select a currency, send funds to the address, then submit the transaction details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-2">
                <div className="flex flex-col items-center justify-center gap-4 p-4 rounded-lg bg-muted">
                    {selectedCrypto ? (
                        <>
                            <Image src={cryptoWallets[selectedCrypto]?.qrCode || "https://placehold.co/256x256.png"} width={256} height={256} alt={`${selectedCrypto} Deposit QR Code`} className="rounded-lg w-48 h-48 sm:w-64 sm:h-64" data-ai-hint="QR code" />
                            <p className="text-sm text-muted-foreground font-semibold">Wallet Address ({selectedCrypto.toUpperCase()})</p>
                            <div className="flex items-center gap-2 p-2 rounded-md bg-background w-full text-center">
                                <p className="text-xs sm:text-sm text-muted-foreground truncate flex-1 break-all">{cryptoWallets[selectedCrypto]?.address}</p>
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(cryptoWallets[selectedCrypto]?.address || '')}>
                                    <Copy className="w-4 h-4"/>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full w-full">
                            <p className="text-muted-foreground">Please select a currency to see the deposit address.</p>
                        </div>
                    )}
                </div>
                <Form {...cryptoForm}>
                <form onSubmit={cryptoForm.handleSubmit(handleCryptoSubmit)} className="space-y-6">
                    <FormField
                    control={cryptoForm.control}
                    name="currency"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={(value) => { field.onChange(value); setSelectedCrypto(value); }} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a currency" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {Object.keys(cryptoWallets).map(key => (
                                        <SelectItem key={key} value={key}>{cryptoWallets[key].name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={cryptoForm.control}
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
                    control={cryptoForm.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Amount Sent</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="Enter crypto amount" {...field} step="any" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" size="lg" disabled={!selectedCrypto}>Submit Deposit</Button>
                </form>
                </Form>
            </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
