import { UserProfile, Habit, Task } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp, 
  Shield, 
  Star, 
  Crown,
  Flame,
  Brain,
  Coins
} from 'lucide-react';
import { motion } from 'motion/react';
import { XP_PER_LEVEL } from '../lib/services';

interface LifeDashboardProps {
  profile: UserProfile | null;
  habits: Habit[];
  tasks: Task[];
}

export default function LifeDashboard({ profile, habits, tasks }: LifeDashboardProps) {

  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const currentLevelXP = xp % XP_PER_LEVEL;
  const progress = (currentLevelXP / XP_PER_LEVEL) * 100;

  const today = new Date().toISOString().split('T')[0];

  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;
  const habitScore = habits.length > 0 ? (completedToday / habits.length) * 100 : 100;

  const completedTasks = tasks.filter(t => t.completed).length;
  const taskScore = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 100;

  const disciplineScore = Math.round((habitScore * 0.7) + (taskScore * 0.3));

  const stats = [
    { label: 'Discipline Score', value: `${disciplineScore}%`, icon: Shield },
    { label: 'Focus Power', value: `${profile?.totalFocusTime || 0}m`, icon: Brain },
    { label: 'Habit Streak', value: Math.max(...habits.map(h => h.streak), 0), icon: Flame },
    { label: 'Wealth', value: profile?.coins || 0, icon: Coins },
  ];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">

        <div className="flex items-center gap-3">
          <Crown className="text-primary w-8 h-8" />
          <div>
            <h1 className="text-4xl font-bold text-primary neon-text">
              {profile?.title} {profile?.displayName?.split(' ')[0]}
            </h1>
            <p className="text-gray-400">Level {level}</p>
          </div>
        </div>

        {/* XP BOX */}
        <div className="bg-card neon-glow p-4 rounded-xl w-60">
          <p className="text-sm text-gray-400">XP Progress</p>
          <div className="h-2 bg-gray-800 rounded mt-2">
            <div 
              className="h-2 bg-primary rounded"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs mt-2">{currentLevelXP} / {XP_PER_LEVEL}</p>
        </div>

      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card neon-glow p-4 rounded-xl card-hover">
            <stat.icon className="text-primary mb-2" />
            <h2 className="text-xl font-bold">{stat.value}</h2>
            <p className="text-xs text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* WEEKLY */}
      <div className="bg-card neon-glow p-6 rounded-xl">
        <h2 className="text-xl font-bold text-primary mb-4">
          Weekly Progress
        </h2>

        <div className="flex gap-3 h-40">
          {[6,5,4,3,2,1,0].map((d) => {
            const date = new Date();
            date.setDate(date.getDate() - d);
            const dateStr = date.toISOString().split('T')[0];

            const completed = habits.filter(h => h.completedDates.includes(dateStr)).length;
            const total = habits.length || 1;

            const height = (completed / total) * 100;

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

      {/* BUFFS */}
      <div className="bg-card neon-glow p-6 rounded-xl">
        <h2 className="text-xl font-bold text-primary mb-4">
          Active Buffs
        </h2>

        <div className="space-y-3">
          <div className="p-3 bg-black/30 rounded-lg">
            🔥 Streak Bonus
          </div>

          <div className="p-3 bg-black/30 rounded-lg">
            🛡️ Streak Freeze
          </div>
        </div>
      </div>

    </div>
  );
}