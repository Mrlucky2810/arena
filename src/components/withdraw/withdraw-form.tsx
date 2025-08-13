
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
    const { user, balance, updateBalance } = useAuth();
    const { toast } = useToast();

    const inrSchema = z.object({
        accountHolderName: z.string().min(2, "Name is too short"),
        accountNumber: z.string().regex(/^\d{9,18}$/, "Invalid account number"),
        ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
        amount: z.coerce.number().positive("Amount must be positive").max(balance, "Insufficient balance"),
    });

    const cryptoSchema = z.object({
        walletAddress: z.string().min(26, "Invalid wallet address"),
        network: z.string({ required_error: "Please select a network." }),
        amount: z.coerce.number().positive("Amount must be positive").max(balance, "Insufficient balance"),
    });

    const inrForm = useForm<z.infer<typeof inrSchema>>({
        resolver: zodResolver(inrSchema),
        defaultValues: {
            accountHolderName: "",
            accountNumber: "",
            ifscCode: "",
            amount: 100,
        },
    });

    const cryptoForm = useForm<z.infer<typeof cryptoSchema>>({
        resolver: zodResolver(cryptoSchema),
        defaultValues: {
            walletAddress: "",
            amount: 100,
        },
    });

    async function onInrSubmit(values: z.infer<typeof inrSchema>) {
        if (!user) return;
        if (values.amount > balance) {
            toast({ variant: "destructive", title: "Error", description: "Insufficient balance." });
            return;
        }
        try {
            await updateBalance(user.uid, -values.amount);
            
            try {
                await addDoc(collection(db, "withdrawals"), {
                    userId: user.uid,
                    type: 'inr',
                    details: {
                        accountHolderName: values.accountHolderName,
                        accountNumber: values.accountNumber,
                        ifscCode: values.ifscCode,
                    },
                    amount: values.amount,
                    status: 'pending',
                    createdAt: serverTimestamp(),
                });
                toast({ title: "Withdrawal Request Submitted", description: "Your request is pending approval. Your balance has been updated." });
                inrForm.reset();
            } catch (dbError) {
                 // Refund balance if db write fails
                await updateBalance(user.uid, values.amount);
                throw dbError; // re-throw to be caught by outer catch
            }
        } catch (error) {
            console.error("INR withdrawal failed:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not submit your request. Your balance has not been changed." });
        }
    }

    async function onCryptoSubmit(values: z.infer<typeof cryptoSchema>) {
        if (!user) return;
        if (values.amount > balance) {
            toast({ variant: "destructive", title: "Error", description: "Insufficient balance." });
            return;
        }
         try {
            await updateBalance(user.uid, -values.amount);

            try {
                await addDoc(collection(db, "withdrawals"), {
                    userId: user.uid,
                    type: 'crypto',
                    details: {
                        walletAddress: values.walletAddress,
                        network: values.network,
                    },
                    amount: values.amount,
                    status: 'pending',
                    createdAt: serverTimestamp(),
                });
                toast({ title: "Withdrawal Request Submitted", description: "Your request is pending approval. Your balance has been updated." });
                cryptoForm.reset();
            } catch (dbError) {
                // Refund balance if db write fails
                await updateBalance(user.uid, values.amount);
                throw dbError;
            }
        } catch (error) {
            console.error("Crypto withdrawal failed:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not submit your request. Your balance has not been changed." });
        }
    }


  return (
    <Tabs defaultValue="inr" className="w-full">
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
        <TabsTrigger value="inr"><Banknote className="mr-2"/> Withdraw via INR</TabsTrigger>
        <TabsTrigger value="crypto"><Bitcoin className="mr-2"/> Withdraw via Crypto</TabsTrigger>
      </TabsList>
      <TabsContent value="inr">
        <Card>
          <CardHeader>
            <CardTitle>Bank Account Details</CardTitle>
            <CardDescription>Enter your bank details to withdraw funds in INR.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...inrForm}>
              <form onSubmit={inrForm.handleSubmit(onInrSubmit)} className="space-y-6">
                <FormField
                  control={inrForm.control}
                  name="accountHolderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={inrForm.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={inrForm.control}
                  name="ifscCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IFSC Code</FormLabel>
                      <FormControl>
                        <Input placeholder="ABCD0123456" {...field} />
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
                      <FormLabel>Amount (Balance: ₹{balance.toLocaleString()})</FormLabel>
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
                  name="network"
                  render={({ field }) => (
                    <FormItem>
                        <FormLabel>Network</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a network" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                                <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                                <SelectItem value="usdt-trc20">USDT (TRC20)</SelectItem>
                                <SelectItem value="usdt-erc20">USDT (ERC20)</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={cryptoForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (Balance: ₹{balance.toLocaleString()})</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter amount" {...field} />
                      </FormControl>
                      <FormDescription>Amount in INR will be converted to crypto at the current market rate.</FormDescription>
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
