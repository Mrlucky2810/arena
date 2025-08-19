
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name is too short"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  subject: z.string().min(1, "Subject is required").min(5, "Subject should be at least 5 characters"),
  message: z.string().min(1, "Message is required").min(20, "Message should be at least 20 characters"),
});

export function ContactForm() {
    const { toast } = useToast();
    const { user, userData } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          name: "",
          email: "",
          subject: "",
          message: "",
        },
      });

      useEffect(() => {
        if(user && userData) {
          form.reset({
            name: userData.name || "",
            email: user.email || "",
            subject: "",
            message: "",
          })
        }
      }, [user, userData, form])
    
      async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "support_tickets"), {
                userId: user?.uid || null,
                name: values.name,
                email: values.email,
                subject: values.subject,
                message: values.message,
                status: 'open',
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Message Sent!",
                description: "Our support team has received your message and will get back to you shortly.",
            });
            form.reset({
                ...values,
                subject: "",
                message: "",
            });
        } catch (error) {
            console.error("Failed to send message:", error);
            toast({
                variant: "destructive",
                title: "Failed to Send",
                description: "Could not send your message. Please try again later.",
            })
        } finally {
            setIsSubmitting(false);
        }
      }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={!!user} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Your Email</FormLabel>
                <FormControl>
                    <Input placeholder="you@example.com" {...field} disabled={!!user} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Issue with a deposit" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please describe your issue in detail..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </Form>
  );
}
