
import type { LucideIcon } from "lucide-react";
import { Coins, Crown, Gamepad2, Gem, Handshake, ShieldCheck, Rocket, Gift, Percent, Star, Users, LayoutDashboard, Home, LifeBuoy, MessagesSquare, Trophy } from "lucide-react";

export type Game = {
  name: string;
  category: 'Casino' | 'Sports' | 'Live' | 'E-Sports';
  livePlayers: number;
  rtp?: number;
  minBet: number;
  isHot: boolean;
  winMultiplier?: string;
  thumbnail: string;
  href: string;
};

export const trendingGames: Game[] = [
  { name: 'Color Prediction', category: 'Casino', livePlayers: 1254, isHot: true, winMultiplier: '4.5x', thumbnail: '/icons/color_prediction.png', href: '/games/color-prediction', rtp: 97, minBet: 10 },
  { name: 'Crash', category: 'Casino', livePlayers: 987, isHot: true, winMultiplier: '100x+', thumbnail: '/icons/crash.png', href: '/games/crash', rtp: 97, minBet: 10 },
  { name: 'Spin Wheel', category: 'Casino', livePlayers: 765, isHot: false, winMultiplier: '50x', thumbnail: '/icons/spin_wheel.png', href: '/games/spin', rtp: 97, minBet: 10 },
  { name: 'Mines', category: 'Casino', livePlayers: 432, isHot: false, thumbnail: '/icons/mine_game.png', href: '/games/mine', rtp: 97, minBet: 10 },
];

export const allGames: Game[] = [
    { name: 'Color Prediction', category: 'Casino', livePlayers: 1254, isHot: true, winMultiplier: '4.5x', thumbnail: '/icons/color_prediction.png', href: '/games/color-prediction', rtp: 97, minBet: 10 },
    { name: 'Dice', category: 'Casino', livePlayers: 654, isHot: false, winMultiplier: '5x', thumbnail: '/icons/dice_game.png', href: '/games/dice', rtp: 98, minBet: 5 },
    { name: 'Spin Wheel', category: 'Casino', livePlayers: 765, isHot: false, winMultiplier: '50x', thumbnail: '/icons/spin_wheel.png', href: '/games/spin', rtp: 96, minBet: 20 },
    { name: 'Crash', category: 'Casino', livePlayers: 987, isHot: true, winMultiplier: '100x+', thumbnail: '/icons/crash.png', href: '/games/crash', rtp: 97.5, minBet: 10 },
    { name: 'Coin Flip', category: 'Casino', livePlayers: 321, isHot: false, winMultiplier: '1.98x', thumbnail: '/icons/coin_flip.png', href: '/games/coin-flip', rtp: 99, minBet: 1 },
    { name: 'Mines', category: 'Casino', livePlayers: 432, isHot: false, winMultiplier: 'Up to 500x', thumbnail: '/icons/mine_game.png', href: '/games/mine', rtp: 98.5, minBet: 5 },
];


export const gameCategories = {
  casino: [
    { name: 'Color Prediction', livePlayers: 1254, rtp: 97, minBet: 10, href: '/games/color-prediction' },
    { name: 'Dice', livePlayers: 654, rtp: 98, minBet: 5, href: '/games/dice' },
    { name: 'Spin Wheel', livePlayers: 765, rtp: 96, minBet: 20, href: '/games/spin' },
    { name: 'Crash', livePlayers: 987, rtp: 97.5, minBet: 10, href: '/games/crash' },
    { name: 'Coin Flip', livePlayers: 321, rtp: 99, minBet: 1, href: '/games/coin-flip' },
    { name: 'Mines', livePlayers: 432, rtp: 98.5, minBet: 5, href: '/games/mine' },
  ],
};

export const recentCrashes = [
    { flightNumber: 8573, multiplier: 2.45 },
    { flightNumber: 8572, multiplier: 1.23 },
    { flightNumber: 8571, multiplier: 5.67 },
    { flightNumber: 8570, multiplier: 1.89 },
    { flightNumber: 8569, multiplier: 3.21 },
]

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  role?: 'user' | 'admin' | 'guest' | 'all';
};

export const navItems: NavItem[] = [
  // User Routes
  { title: "Dashboard", href: "/", icon: Home, role: 'user' },
  { title: "All Games", href: "/games", icon: Gamepad2, role: 'user'},
  { title: "Deposit", href: "/deposit", icon: Coins, role: 'user' },
  { title: "Withdraw", href: "/withdraw", icon: Gem, role: 'user' },
  { title: "Referrals", href: "/referrals", icon: Handshake, role: 'user' },
  { title: "Promotions", href: "/promotions", icon: Crown, role: 'user' },
  { title: "Support", href: "/support", icon: LifeBuoy, role: 'user' },

  // Admin Routes
  { title: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, role: 'admin' },
  { title: "Manage Deposits", href: "/admin/deposits", icon: Coins, role: 'admin' },
  { title: "Manage Withdrawals", href: "/admin/withdrawals", icon: Gem, role: 'admin' },
  { title: "Manage Users", href: "/admin/users", icon: Users, role: 'admin' },
  { title: "Support Tickets", href: "/admin/support", icon: MessagesSquare, role: 'admin' },
];

export const promotions = [
    {
        icon: Gift,
        title: "Welcome Bonus",
        description: "Get a 150% bonus on your first deposit up to ₹15,000. Start your journey with a big advantage!",
        cta: "Claim Bonus",
        badge: "First Deposit",
    },
    {
        icon: Percent,
        title: "Weekly Cashback",
        description: "Receive 10% cashback on your net losses every week. We've got your back, win or lose.",
        cta: "Learn More",
    },
    {
        icon: Handshake,
        title: "Referral Program",
        description: "Invite your friends and earn a commission for every friend that plays. The more, the merrier!",
        cta: "Get Referral Link",
        badge: "Unlimited Earnings",
    },
    {
        icon: Star,
        title: "VIP Club",
        description: "Join our exclusive VIP club for personalized offers, higher stakes, and dedicated support.",
        cta: "Explore VIP Benefits",
    },
];

export const faqItems = [
  {
    value: "faq-1",
    question: "How do I deposit money into my account?",
    answer:
      "You can deposit money using UPI or Cryptocurrency. Go to the 'Deposit' page, choose your preferred method, and follow the on-screen instructions. For UPI, you'll scan a QR code and enter the transaction ID. For Crypto, you'll send funds to the provided wallet address and submit the transaction hash.",
  },
  {
    value: "faq-2",
    question: "How long do withdrawals take?",
    answer:
      "Withdrawal times vary by method. INR withdrawals to your bank account typically take 2-4 hours to process. Cryptocurrency withdrawals are usually faster and depend on network congestion, but are often completed within an hour.",
  },
  {
    value: "faq-3",
    question: "Is my personal information secure?",
    answer:
      "Absolutely. We use industry-standard SSL encryption to protect all your data. We have a strict privacy policy and never share your information with third parties. Your security is our top priority.",
  },
  {
    value: "faq-4",
    question: "What should I do if a game crashes?",
    answer:
      "If a game crashes mid-round, our system is designed to automatically refund your bet for that round. If you don't see the refund in your transaction history within 15 minutes, please contact our support team with the game name and time of the incident.",
  },
  {
    value: "faq-5",
    question: "How does the referral program work?",
    answer:
      "You can find your unique referral code on the 'Referrals' page. Share this link with your friends. When they sign up and make their first deposit, you will receive a bonus commission. You can track your referral earnings on the same page.",
  },
];

export const sportsData = {
    cricket: [
        { 
            name: "Indian Premier League",
            isPopular: true,
            matches: [
                { teams: ["Mumbai Indians", "Chennai Super Kings"], time: "19:30 IST", isLive: true, odds: [{label: "1", value: "1.90"}, {label: "X", value: "N/A"}, {label: "2", value: "2.10"}] },
                { teams: ["Delhi Capitals", "Royal Challengers"], time: "20:00 IST", isLive: false, odds: [{label: "1", value: "2.05"}, {label: "X", value: "N/A"}, {label: "2", value: "1.85"}] },
            ]
        },
        { 
            name: "The Ashes",
            isPopular: false,
            matches: [
                { teams: ["England", "Australia"], time: "Tomorrow", isLive: false, odds: [{label: "1", value: "2.50"}, {label: "X", value: "3.50"}, {label: "2", value: "2.80"}] },
            ]
        }
    ],
    football: [
        { 
            name: "UEFA Champions League",
            isPopular: true,
            matches: [
                { teams: ["Real Madrid", "FC Barcelona"], time: "22:00 CET", isLive: false, odds: [{label: "1", value: "2.20"}, {label: "X", value: "3.40"}, {label: "2", value: "3.20"}] },
                { teams: ["Manchester City", "Bayern Munich"], time: "22:00 CET", isLive: false, odds: [{label: "1", value: "1.80"}, {label: "X", value: "3.80"}, {label: "2", value: "4.50"}] },
            ]
        },
        { 
            name: "English Premier League",
            isPopular: true,
            matches: [
                { teams: ["Arsenal", "Tottenham Hotspur"], time: "16:00 GMT", isLive: false, odds: [{label: "1", value: "2.00"}, {label: "X", value: "3.50"}, {label: "2", value: "3.75"}] },
            ]
        }
    ],
    tennis: [
        { 
            name: "Wimbledon",
            isPopular: true,
            matches: [
                { teams: ["N. Djokovic", "C. Alcaraz"], time: "Finished", isLive: false, odds: [{label: "1", value: "1.57"}, {label: "2", value: "2.40"}] },
            ]
        }
    ]
};

export const referralData = {
    totalReferrals: 28,
    totalEarnings: 15750,
    activeReferrals: 12,
    pendingRewards: 2500,
    referredUsers: [
        { name: "Charlie", dateJoined: "2024-07-15", status: "Active", earnings: 4500 },
        { name: "David", dateJoined: "2024-07-12", status: "Active", earnings: 3200 },
        { name: "Eve", dateJoined: "2024-07-10", status: "Inactive", earnings: 1200 },
        { name: "Frank", dateJoined: "2024-06-25", status: "Active", earnings: 6850 },
        { name: "Grace", dateJoined: "2024-06-22", status: "Banned", earnings: 0 },
    ]
}
