import { UserProfile, Habit, Task } from '../types';
import { Crown, Flame, Brain, Coins, Shield } from 'lucide-react';
import { XP_PER_LEVEL } from '../lib/services';

interface LifeDashboardProps {
profile: UserProfile | null;
habits?: Habit[];
tasks?: Task[];
}

export default function LifeDashboard({
profile,
habits = [],
tasks = [],
}: LifeDashboardProps) {

// ✅ SAFETY
const safeHabits = Array.isArray(habits) ? habits : [];
const safeTasks = Array.isArray(tasks) ? tasks : [];

const level = profile?.level ?? 1;
const xp = profile?.xp ?? 0;

const xpPerLevel = XP_PER_LEVEL || 100;

const currentLevelXP = xp % xpPerLevel;
const progress = Math.min((currentLevelXP / xpPerLevel) * 100, 100);

const today = new Date().toISOString().split('T')[0];

// ✅ SAFE FILTER
const completedToday = safeHabits.filter(
(h) => (h?.completedDates || []).includes(today)
).length;

const habitScore =
safeHabits.length > 0
? (completedToday / safeHabits.length) * 100
: 100;

const completedTasks = safeTasks.filter((t) => t?.completed).length;

const taskScore =
safeTasks.length > 0
? (completedTasks / safeTasks.length) * 100
: 100;

const disciplineScore = Math.round(
habitScore * 0.7 + taskScore * 0.3
);

// ✅ SAFE MAX
const maxStreak =
safeHabits.length > 0
? Math.max(...safeHabits.map((h) => h?.streak ?? 0))
: 0;

const stats = [
{ label: 'Discipline Score', value: `${disciplineScore}%`, icon: Shield },
{ label: 'Focus Power', value: `${profile?.totalFocusTime ?? 0}m`, icon: Brain },
{ label: 'Habit Streak', value: maxStreak, icon: Flame },
{ label: 'Wealth', value: profile?.coins ?? 0, icon: Coins },
];

return ( <div className="space-y-8">

```
  {/* HEADER */}
  <div className="flex justify-between items-center">

    <div className="flex items-center gap-3">
      <Crown className="text-primary w-8 h-8" />

      <div>
        <h1 className="text-4xl font-bold text-primary">
          {profile?.title ?? "Player"}{" "}
          {(profile?.displayName ?? "User").split(" ")[0]}
        </h1>

        <p className="text-gray-400">Level {level}</p>
      </div>
    </div>

    {/* XP */}
    <div className="bg-card p-4 rounded-xl w-60">
      <p className="text-sm text-gray-400">XP Progress</p>

      <div className="h-2 bg-gray-800 rounded mt-2">
        <div
          className="h-2 bg-primary rounded"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs mt-2">
        {currentLevelXP} / {xpPerLevel}
      </p>
    </div>

  </div>

  {/* STATS */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {stats.map((stat, i) => {
      const Icon = stat.icon;

      return (
        <div key={i} className="bg-card p-4 rounded-xl">
          <Icon className="text-primary mb-2" />
          <h2 className="text-xl font-bold">{stat.value}</h2>
          <p className="text-xs text-gray-400">{stat.label}</p>
        </div>
      );
    })}
  </div>

  {/* WEEKLY */}
  <div className="bg-card p-6 rounded-xl">
    <h2 className="text-xl font-bold text-primary mb-4">
      Weekly Progress
    </h2>

    <div className="flex gap-3 h-40">
      {[6,5,4,3,2,1,0].map((d) => {

        const date = new Date();
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split('T')[0];

        const completed = safeHabits.filter(
          (h) => (h?.completedDates || []).includes(dateStr)
        ).length;

        const total = safeHabits.length || 1;
        const height = Math.min((completed / total) * 100, 100);

        return (
          <div key={d} className="flex-1 flex flex-col justify-end items-center">
            <div className="w-full bg-gray-800 rounded h-full">
              <div
                className="bg-primary w-full rounded"
                style={{ height: `${height}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>

  </div>

</div>
```

);
}
