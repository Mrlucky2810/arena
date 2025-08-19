
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
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name is too short"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  referralCode: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});


export function RegisterForm({ isAdminRegistration = false }: { isAdminRegistration?: boolean }) {
  const router = useRouter();
  const { register, adminExists } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      referralCode: "",
      terms: false,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const roleToRegister = isAdminRegistration && !adminExists ? 'admin' : 'user';

    const { success, message, role } = await register(data.name, data.email, data.password, data.referralCode, roleToRegister);
    if (success) {
        toast({
            title: "Account Created!",
            description: role === 'admin' ? "Admin registered successfully." : "You have been successfully registered.",
        });
        setTimeout(() => {
            if (role === 'admin') {
                router.push("/admin/dashboard");
            } else {
                router.push("/dashboard");
            }
        }, 500);
    } else {
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: message,
        });
        setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem className="sm:col-span-1"><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem className="sm:col-span-1"><FormLabel>Email</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem className="sm:col-span-1"><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
            <FormItem className="sm:col-span-1"><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        {!isAdminRegistration && <FormField control={form.control} name="referralCode" render={({ field }) => (
            <FormItem className="sm:col-span-2"><FormLabel>Referral Code (Optional)</FormLabel><FormControl><Input placeholder="Enter referral code" {...field} /></FormControl><FormMessage /></FormItem>
        )} />}
        <FormField control={form.control} name="terms" render={({ field }) => (
            <FormItem className="sm:col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            <div className="space-y-1 leading-none">
                <FormLabel>I agree to the Terms & Conditions</FormLabel>
                <FormMessage />
            </div>
            </FormItem>
        )} />
        <div className="sm:col-span-2">
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : isAdminRegistration ? 'Register Admin' : 'Create Account'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
