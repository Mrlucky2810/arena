
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactForm } from "@/components/support/contact-form";
import { LifeBuoy, Mail, Phone } from "lucide-react";
import { faqItems } from "@/lib/mock-data";

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <LifeBuoy className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Support Center</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            We're here to help. Find answers to your questions or get in touch.
          </p>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as
                possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader>
                <CardTitle className="text-xl">Contact Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Mail className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">Email</p>
                            <a href="mailto:support@apexarena.com" className="text-sm text-primary hover:underline">support@apexarena.com</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Phone className="w-6 h-6 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">Phone</p>
                            <p className="text-sm text-muted-foreground">(+91) 123-456-7890</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find quick answers to common questions below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
