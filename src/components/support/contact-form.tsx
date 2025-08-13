
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
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(5, "Subject should be at least 5 characters"),
  message: z.string().min(20, "Message should be at least 20 characters"),
});

export function ContactForm() {
    const { toast } = useToast();
    const { user, userData } = useAuth();

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
            email: userData.email || "",
            subject: "",
            message: "",
          })
        }
      }, [user, userData, form])
    
      function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Support form submitted:", values);
        toast({
          title: "Message Sent!",
          description: "Our support team has received your message and will get back to you shortly.",
        });
        form.reset({
            ...values,
            subject: "",
            message: "",
        });
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
        <Button type="submit" size="lg">Send Message</Button>
      </form>
    </Form>
  );
}
