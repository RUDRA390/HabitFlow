import { useState } from 'react';
import { UserProfile, RewardItem } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { 
  Coins, 
  Palette, 
  Shield, 
  Sparkles, 
  BarChart3, 
  Lock,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { purchaseItem } from '../lib/services';

interface RewardShopProps {
  profile: UserProfile | null;
  userId: string;
}

const REWARDS: RewardItem[] = [
  { id: 'freeze-1', name: 'Streak Freeze', description: 'Protect your habit streak for 1 day if you miss it.', cost: 500, type: 'streak-freeze', value: '1' },
  { id: 'theme-emerald', name: 'Emerald Theme', description: 'Unlock the premium Emerald Green aesthetic.', cost: 1000, type: 'theme', value: 'emerald' },
  { id: 'theme-rose', name: 'Rose Theme', description: 'Unlock the premium Rose Pink aesthetic.', cost: 1000, type: 'theme', value: 'rose' },
  { id: 'theme-amber', name: 'Amber Theme', description: 'Unlock the premium Amber Gold aesthetic.', cost: 1000, type: 'theme', value: 'amber' },
  { id: 'theme-midnight', name: 'Midnight Theme', description: 'Unlock the ultra-dark Midnight aesthetic.', cost: 1500, type: 'theme', value: 'midnight' },
  { id: 'ai-coach-v2', name: 'AI Coach Pro', description: 'Unlock deeper behavioral analysis and predictive warnings.', cost: 2500, type: 'ai-level', value: 'pro' },
  { id: 'analytics-pro', name: 'Advanced Analytics', description: 'Unlock heatmaps and detailed productivity correlations.', cost: 3000, type: 'analytics', value: 'pro' },
];

export default function RewardShop({ profile, userId }: RewardShopProps) {
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handlePurchase = async (reward: RewardItem) => {
    if ((profile?.coins || 0) < reward.cost) {
      setMessage({ text: "Not enough coins! Keep focusing to earn more.", type: 'error' });
      return;
    }

    setPurchasing(reward.id);
    const success = await purchaseItem(userId, reward.cost, reward.type, reward.value);
    
    if (success) {
      setMessage({ text: `Successfully purchased ${reward.name}!`, type: 'success' });
    } else {
      setMessage({ text: "Purchase failed. Please try again.", type: 'error' });
    }
    
    setPurchasing(null);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-gradient">Reward Shop</h2>
          <p className="text-muted-foreground text-lg font-medium">Exchange your hard-earned coins for premium upgrades.</p>
        </div>
        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3 shadow-xl border-yellow-500/20">
          <div className="p-2 bg-yellow-500/20 rounded-xl">
            <Coins className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Your Balance</p>
            <p className="text-2xl font-black tabular-nums">{profile?.coins || 0}</p>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl text-center font-bold shadow-lg ${
              message.type === 'success' ? 'bg-green-500/20 text-green-500 border border-green-500/20' : 'bg-destructive/20 text-destructive border border-destructive/20'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {REWARDS.map((reward, i) => {
          const Icon = reward.type === 'theme' ? Palette : 
                       reward.type === 'streak-freeze' ? Shield :
                       reward.type === 'ai-level' ? Sparkles : BarChart3;
          
          const isOwned = reward.type === 'theme' && profile?.theme === reward.value;
          
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass border-none shadow-xl card-hover overflow-hidden flex flex-col h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 rounded-2xl ${
                      reward.type === 'theme' ? 'bg-blue-500/10 text-blue-500' :
                      reward.type === 'streak-freeze' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-purple-500/10 text-purple-500'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/20">
                      <Coins className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-sm font-black tabular-nums">{reward.cost}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-black tracking-tight">{reward.name}</CardTitle>
                  <CardDescription className="font-medium">{reward.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto pt-6">
                  <Button 
                    className="w-full h-12 rounded-xl font-bold gap-2 shadow-lg"
                    variant={isOwned ? "outline" : "default"}
                    disabled={purchasing === reward.id || isOwned}
                    onClick={() => handlePurchase(reward)}
                  >
                    {purchasing === reward.id ? (
                      <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isOwned ? (
                      <><CheckCircle2 className="w-5 h-5" /> Owned</>
                    ) : (
                      <><Lock className="w-4 h-4" /> Unlock Now</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="glass border-none shadow-2xl rounded-3xl overflow-hidden bg-linear-to-br from-yellow-500/10 to-transparent relative">
        <div className="absolute -right-10 -bottom-10 opacity-10">
          <Crown className="w-48 h-48 text-yellow-500" />
        </div>
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="p-6 bg-yellow-500 rounded-3xl shadow-2xl shadow-yellow-500/30">
            <Crown className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black tracking-tight mb-2">HabitFlow Premium</h3>
            <p className="text-muted-foreground font-medium mb-6">Unlock the full potential of your life. Unlimited habits, advanced AI coaching, and exclusive themes.</p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button className="h-12 px-8 rounded-xl font-bold shadow-xl shadow-primary/20">Upgrade to Pro</Button>
              <Button variant="outline" className="h-12 px-8 rounded-xl font-bold glass border-none shadow-lg">Learn More</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
