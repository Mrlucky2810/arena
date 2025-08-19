
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Banknote, Bitcoin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function WithdrawForm() {
    const { user, inrBalance, wallets, updateBalance } = useAuth();
    const { toast } = useToast();
    const cryptoBalance = wallets ? Object.values(wallets).reduce((acc, v) => acc + v, 0) : 0;

    const inrSchema = z.object({
        upiId: z.string().min(1, "UPI ID is required").regex(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/, "Invalid UPI ID format (e.g. user@bank)"),
        amount: z.coerce.number().positive("Amount must be positive").min(100, "Minimum withdrawal is ₹100").max(inrBalance, "Insufficient balance"),
    });
    
    const cryptoSchema = z.object({
        currency: z.string({ required_error: "Please select a currency" }),
        walletAddress: z.string().min(1, "Wallet address is required").min(26, "Invalid wallet address"),
        amount: z.coerce.number().positive("Amount must be positive"),
    }).refine(data => {
        if (!wallets || !data.currency) return true; // Let other validators handle missing currency
        const balance = wallets[data.currency] || 0;
        return data.amount <= balance;
    }, {
        message: "Insufficient balance for the selected currency",
        path: ["amount"],
    });

    const inrForm = useForm<z.infer<typeof inrSchema>>({
        resolver: zodResolver(inrSchema),
        defaultValues: {
            upiId: "",
            amount: 100,
        },
    });

    const cryptoForm = useForm<z.infer<typeof cryptoSchema>>({
        resolver: zodResolver(cryptoSchema),
        defaultValues: {
            walletAddress: "",
            amount: 0.0,
        },
    });

    async function onInrSubmit(values: z.infer<typeof inrSchema>) {
        if (!user) return;
        if (values.amount > inrBalance) {
            toast({ variant: "destructive", title: "Error", description: "Insufficient INR balance." });
            return;
        }
        try {
            await updateBalance(user.uid, -values.amount, 'inr');
            
            try {
                await addDoc(collection(db, "withdrawals"), {
                    userId: user.uid,
                    type: 'inr',
                    details: {
                        upiId: values.upiId,
                    },
                    amount: values.amount,
                    status: 'pending',
                    createdAt: serverTimestamp(),
                });
                toast({ title: "Withdrawal Request Submitted", description: "Your request is pending approval. Your balance has been updated." });
                inrForm.reset();
            } catch (dbError) {
                 // Refund balance if db write fails
                await updateBalance(user.uid, values.amount, 'inr');
                throw dbError; // re-throw to be caught by outer catch
            }
        } catch (error) {
            console.error("INR withdrawal failed:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not submit your request. Your balance has not been changed." });
        }
    }

    async function onCryptoSubmit(values: z.infer<typeof cryptoSchema>) {
        if (!user) return;
        const selectedWalletBalance = wallets?.[values.currency] || 0;
        if (values.amount <= 0) {
            toast({ variant: "destructive", title: "Error", description: `Amount must be positive.` });
            return;
        }
        if (values.amount > selectedWalletBalance) {
            toast({ variant: "destructive", title: "Error", description: `Insufficient ${values.currency.toUpperCase()} balance.` });
            return;
        }
         try {
            await updateBalance(user.uid, -values.amount, values.currency);

            try {
                await addDoc(collection(db, "withdrawals"), {
                    userId: user.uid,
                    type: 'crypto',
                    currency: values.currency,
                    details: {
                        walletAddress: values.walletAddress,
                        currency: values.currency,
                    },
                    amount: values.amount,
                    status: 'pending',
                    createdAt: serverTimestamp(),
                });
                toast({ title: "Withdrawal Request Submitted", description: "Your request is pending approval. Your balance has been updated." });
                cryptoForm.reset();
            } catch (dbError) {
                // Refund balance if db write fails
                await updateBalance(user.uid, values.amount, values.currency);
                throw dbError;
            }
        } catch (error) {
            console.error("Crypto withdrawal failed:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not submit your request. Your balance has not been changed." });
        }
    }


  return (
    <Tabs defaultValue="inr" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="inr" className="flex items-center gap-2">
          <Banknote className="h-5 w-5"/>
          <span>Withdraw via INR</span>
        </TabsTrigger>
        <TabsTrigger value="crypto" className="flex items-center gap-2">
          <Bitcoin className="h-5 w-5"/>
          <span>Withdraw via Crypto</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="inr">
        <Card>
          <CardHeader>
            <CardTitle>UPI Details</CardTitle>
            <CardDescription>Enter your UPI ID to withdraw funds in INR.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...inrForm}>
              <form onSubmit={inrForm.handleSubmit(onInrSubmit)} className="space-y-6">
                <FormField
                  control={inrForm.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPI ID</FormLabel>
                      <FormControl>
                        <Input placeholder="yourname@bank" {...field} />
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
                      <FormLabel>Amount (INR Balance: ₹{inrBalance.toLocaleString()})</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter amount" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg">Request Withdrawal</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="crypto">
        <Card>
          <CardHeader>
            <CardTitle>Cryptocurrency Wallet Details</CardTitle>
            <CardDescription>Enter your wallet details to withdraw funds in crypto.</CardDescription>
          </CardHeader>
          <CardContent>
          <Form {...cryptoForm}>
              <form onSubmit={cryptoForm.handleSubmit(onCryptoSubmit)} className="space-y-6">
                <FormField
                  control={cryptoForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a currency to withdraw" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {wallets && Object.keys(wallets).filter(key => wallets[key] > 0).map(key => (
                                    <SelectItem key={key} value={key}>
                                        {key.toUpperCase()} (Balance: {wallets[key]})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={cryptoForm.control}
                  name="walletAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} />
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
                      <FormLabel>Amount to Withdraw</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter amount in selected currency" {...field} step="any" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg">Request Withdrawal</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
