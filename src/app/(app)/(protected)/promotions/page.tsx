'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { promotions } from "@/lib/mock-data";
import { ArrowRight } from "lucide-react";

export default function PromotionsPage() {
  // Extract the first promotion's icon component
  const HeaderIcon = promotions[0].icon;
  
  return (
    <div className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
            <div className="p-3 rounded-md bg-muted">
                <HeaderIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold">Promotions</h1>
                <p className="text-muted-foreground text-sm md:text-base">
                    Check out our latest offers and bonuses to maximize your winnings.
                </p>
            </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {promotions.map((promo) => {
          // Extract each promo's icon component
          const PromoIcon = promo.icon;
          return (
            <Card key={promo.title} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-md bg-muted">
                      <PromoIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{promo.title}</CardTitle>
                      <CardDescription>{promo.description}</CardDescription>
                    </div>
                  </div>
                  {promo.badge && <div className="text-xs font-semibold text-primary bg-primary/10 py-1 px-2.5 rounded-full whitespace-nowrap">{promo.badge}</div>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <Button className="w-full">
                  {promo.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Card className="text-center bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
            <CardTitle className="text-xl">Stay Tuned for More!</CardTitle>
            <CardDescription>We are always adding new and exciting promotions. Follow us on social media or check back regularly to not miss out!</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}