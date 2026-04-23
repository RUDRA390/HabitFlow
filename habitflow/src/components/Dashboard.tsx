import { Habit, Task, UserProfile } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Flame, CheckCircle2, Target, Coins } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';

interface DashboardProps {
  habits?: Habit[];
  tasks?: Task[];
  profile: UserProfile | null;
}

export default function Dashboard({ habits = [], tasks = [], profile }: DashboardProps) {

  // ✅ SAFE ARRAYS
  const safeHabits = Array.isArray(habits) ? habits : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const today = format(new Date(), 'yyyy-MM-dd');

  // ✅ SAFE FILTERS
  const completedHabitsToday = safeHabits.filter(h =>
    (h?.completedDates || []).includes(today)
  ).length;

  const habitProgress =
    safeHabits.length > 0
      ? (completedHabitsToday / safeHabits.length) * 100
      : 0;

  const completedTasks = safeTasks.filter(t => t?.completed).length;

  const taskProgress =
    safeTasks.length > 0
      ? (completedTasks / safeTasks.length) * 100
      : 0;

  const stats = [
    {
      label: 'Habit Progress',
      value: `${completedHabitsToday}/${safeHabits.length}`,
      progress: habitProgress,
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
    },
    {
      label: 'Tasks Done',
      value: `${completedTasks}/${safeTasks.length}`,
      progress: taskProgress,
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      label: 'Total Coins',
      value: profile?.coins ?? 0,
      progress: 100,
      icon: Coins,
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
  ];

  // ✅ SAFE SORT (NO MUTATION)
  const sortedHabits = [...safeHabits]
    .sort((a, b) => (b?.streak || 0) - (a?.streak || 0))
    .slice(0, 5);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <header className="space-y-1">
        <h2 className="text-4xl font-black tracking-tighter text-gradient">
          Welcome back, {profile?.displayName || 'User'}!
        </h2>
        <p className="text-muted-foreground text-lg">
          Here's what's happening today, {format(new Date(), 'MMMM do')}.
        </p>
      </header>

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass border-none shadow-xl card-hover overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black mb-2 tracking-tighter">
                    {stat.value}
                  </div>
                  <Progress value={stat.progress} className="h-2" />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* TODAY */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* HABITS + TASKS */}
        <Card className="glass border-none shadow-xl card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Target className="w-6 h-6 text-primary" />
              Today's Focus
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            {safeHabits.length === 0 && safeTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No habits or tasks yet.
              </p>
            ) : (
              <div className="space-y-3">

                {/* HABITS */}
                {safeHabits
                  .filter(h => !(h?.completedDates || []).includes(today))
                  .map(h => (
                    <div key={h.id} className="p-4 rounded-2xl bg-accent/30">
                      {h.name}
                    </div>
                  ))}

                {/* TASKS */}
                {safeTasks
                  .filter(t => !t?.completed)
                  .slice(0, 3)
                  .map(t => (
                    <div key={t.id} className="p-4 rounded-2xl bg-accent/30">
                      {t.title}
                    </div>
                  ))}

              </div>
            )}

          </CardContent>
        </Card>

        {/* STREAKS */}
        <Card className="glass border-none shadow-xl card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Flame className="w-6 h-6 text-orange-500" />
              Active Streaks
            </CardTitle>
          </CardHeader>

          <CardContent>
            {sortedHabits.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No streaks yet
              </p>
            ) : (
              sortedHabits.map(h => (
                <div key={h.id} className="flex justify-between p-2">
                  <span>{h.name}</span>
                  <span>{h.streak}</span>
                </div>
              ))
            )}
          </CardContent>

        </Card>

      </div>

    </div>
  );
}
