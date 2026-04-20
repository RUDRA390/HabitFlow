import { Habit, Task, UserProfile } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Flame, CheckCircle2, Target, Trophy, Coins } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

interface DashboardProps {
  habits: Habit[];
  tasks: Task[];
  profile: UserProfile | null;
}

export default function Dashboard({ habits, tasks, profile }: DashboardProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const completedHabitsToday = habits.filter(h => h.completedDates.includes(today)).length;
  const habitProgress = habits.length > 0 ? (completedHabitsToday / habits.length) * 100 : 0;
  
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const totalStreaks = habits.reduce((acc, h) => acc + h.streak, 0);

  const stats = [
    { label: 'Habit Progress', value: `${completedHabitsToday}/${habits.length}`, progress: habitProgress, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Tasks Done', value: `${completedTasks}/${tasks.length}`, progress: taskProgress, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Coins', value: profile?.coins || 0, progress: 100, icon: Coins, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-4xl font-black tracking-tighter text-gradient">Welcome back, {profile?.displayName || 'User'}!</h2>
        <p className="text-muted-foreground text-lg">Here's what's happening today, {format(new Date(), 'MMMM do')}.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass border-none shadow-xl card-hover overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</CardTitle>
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black mb-2 tracking-tighter">{stat.value}</div>
                <Progress value={stat.progress} className="h-2" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass border-none shadow-xl card-hover col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Target className="w-6 h-6 text-primary" />
              Today's Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {habits.length === 0 && tasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No habits or tasks for today. Add some to get started!</p>
            ) : (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Pending Habits</h4>
                {habits.filter(h => !h.completedDates.includes(today)).map(h => (
                  <div key={h.id} className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-white/5">
                    <span className="font-bold">{h.name}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/20">{h.category}</span>
                  </div>
                ))}
                {habits.filter(h => !h.completedDates.includes(today)).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">All habits completed! Great job!</p>
                )}

                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-6">Pending Tasks</h4>
                {tasks.filter(t => !t.completed).slice(0, 3).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-accent/30 border border-white/5">
                    <span className="font-bold">{t.title}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${
                      t.priority === 'High' ? 'bg-destructive/20 text-destructive border-destructive/20' : 
                      t.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20' : 
                      'bg-green-500/20 text-green-500 border-green-500/20'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                ))}
                {tasks.filter(t => !t.completed).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No pending tasks. Time to relax?</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-xl card-hover col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Flame className="w-6 h-6 text-orange-500" />
              Active Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {habits.sort((a, b) => b.streak - a.streak).slice(0, 5).map(h => (
                <div key={h.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-accent/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                      <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
                    </div>
                    <div>
                      <div className="font-bold">{h.name}</div>
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{h.frequency}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-orange-500 tracking-tighter">{h.streak}</div>
                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Days</div>
                  </div>
                </div>
              ))}
              {habits.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Start a habit to build a streak!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
