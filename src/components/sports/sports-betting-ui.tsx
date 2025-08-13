
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sportsData } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Medal, Tv } from "lucide-react";
import Link from "next/link";

export function SportsBettingUI() {
  return (
    <Tabs defaultValue="cricket" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="cricket">Cricket</TabsTrigger>
        <TabsTrigger value="football">Football</TabsTrigger>
        <TabsTrigger value="tennis">Tennis</TabsTrigger>
      </TabsList>

      {Object.entries(sportsData).map(([sport, leagues]) => (
        <TabsContent key={sport} value={sport}>
          <div className="space-y-6">
            {leagues.map((league) => (
              <Card key={league.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    {league.isPopular && <Medal className="w-5 h-5 text-amber-500" />}
                    <span>{league.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {league.matches.map((match) => (
                    <div key={match.teams.join()} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg bg-muted/50 gap-4">
                      <div className="flex-1 text-center sm:text-left w-full">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                          {match.isLive && (
                            <Badge className="bg-red-600 gap-1"><Tv className="w-3 h-3"/> LIVE</Badge>
                          )}
                           <p className="text-sm text-muted-foreground">{match.time}</p>
                        </div>
                        <p className="font-bold text-lg">{match.teams[0]} vs {match.teams[1]}</p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                        {match.odds.map((odd, index) => (
                           <div key={index} className="flex flex-col items-center p-2 rounded-md bg-background w-20 text-center">
                                <span className="text-xs text-muted-foreground">{odd.label}</span>
                                <span className="font-bold text-primary">{odd.value}</span>
                           </div>
                        ))}
                      </div>
                      <Button asChild className="w-full sm:w-auto">
                        <Link href="/sports">Bet Now</Link>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
