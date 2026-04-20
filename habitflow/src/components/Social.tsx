import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { 
  Users, 
  Trophy, 
  UserPlus, 
  Search, 
  Medal, 
  Crown,
  Star,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { getLeaderboard } from '../lib/services';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';

interface SocialProps {
  profile: UserProfile | null;
}

export default function Social({ profile }: SocialProps) {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getLeaderboard();
      setLeaderboard(data);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-gradient">Social Hub</h2>
          <p className="text-muted-foreground text-lg font-medium">Connect, compete, and grow with the community.</p>
        </div>
        <div className="flex gap-4">
          <Button className="h-12 px-6 rounded-xl font-bold gap-2 shadow-xl shadow-primary/20">
            <UserPlus className="w-5 h-5" /> Find Friends
          </Button>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Leaderboard */}
        <Card className="md:col-span-2 glass border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-linear-to-r from-primary/10 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-xl">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">Global Leaderboard</CardTitle>
                  <CardDescription className="font-medium">Top performers this week</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-black px-3 py-1">WEEKLY</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold">Loading legends...</p>
                </div>
              ) : (
                leaderboard.map((user, i) => (
                  <motion.div
                    key={user.uid}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center justify-between p-6 hover:bg-white/5 transition-colors ${user.uid === profile?.uid ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-8 flex justify-center">
                        {i === 0 ? <Crown className="w-6 h-6 text-yellow-500" /> :
                         i === 1 ? <Medal className="w-6 h-6 text-slate-300" /> :
                         i === 2 ? <Medal className="w-6 h-6 text-amber-600" /> :
                         <span className="text-lg font-black text-muted-foreground">{i + 1}</span>}
                      </div>
                      <Avatar className="h-12 w-12 border-2 border-white/10">
                        <AvatarImage src={user.photoURL} />
                        <AvatarFallback className="bg-primary/20 text-primary font-black">
                          {user.displayName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-lg tracking-tight">{user.displayName}</p>
                          {user.isPremium && <Badge className="bg-yellow-500 text-white text-[8px] h-4 px-1">PRO</Badge>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-white/10 h-5">
                            Level {user.level || 1}
                          </Badge>
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{user.title || 'Beginner'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black tabular-nums text-primary">{user.xp?.toLocaleString() || 0}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total XP</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Challenges & Friends */}
        <div className="space-y-6">
          <Card className="glass border-none shadow-2xl rounded-3xl overflow-hidden bg-linear-to-br from-purple-600/10 to-transparent">
            <CardHeader>
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">7-Day Deep Work</p>
                    <p className="text-xs text-muted-foreground">Focus for 2h daily</p>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-500 border-purple-500/20">LIVE</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span>Progress</span>
                    <span>4/7 Days</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[57%]" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <Avatar key={i} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-[8px] font-black">U{i}</AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[8px] font-black border-2 border-background">
                      +12
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">1,200 XP Reward</p>
                </div>
              </div>
              <Button variant="outline" className="w-full h-10 rounded-xl font-bold glass border-none shadow-lg">View All Challenges</Button>
            </CardContent>
          </Card>

          <Card className="glass border-none shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Friends
              </CardTitle>
              <Badge variant="secondary" className="font-black">12 Online</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 border-2 border-white/10">
                        <AvatarFallback className="font-black">F{i}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Friend Name {i}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Level {10 + i} • Warrior</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/5">
                    <Star className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full h-10 rounded-xl font-bold glass border-none shadow-lg">View All Friends</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
