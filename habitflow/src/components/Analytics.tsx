import { useState, useEffect } from 'react';
import { Habit, Task, UserProfile } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { getAIInsights } from '../lib/ai-service';
import { Button } from './ui/button';
import { Sparkles, Loader2, TrendingUp, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface AnalyticsProps {
  habits: Habit[];
  tasks: Task[];
  profile: UserProfile | null;
}

export default function Analytics({ habits, tasks, profile }: AnalyticsProps) {
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    const result = await getAIInsights(habits, tasks, profile);
    setInsights(result);
    setLoadingInsights(false);
  };

  // Prepare data for habit consistency (last 7 days)
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const habitData = last7Days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const completedCount = habits.filter(h => h.completedDates.includes(dateStr)).length;
    return {
      name: format(date, 'EEE'),
      completed: completedCount,
      total: habits.length
    };
  });

  // Task completion by category
  const categories = ['Work', 'Study', 'Health', 'Personal'];
  const taskCategoryData = categories.map(cat => ({
    name: cat,
    completed: tasks.filter(t => t.category === cat && t.completed).length,
    pending: tasks.filter(t => t.category === cat && !t.completed).length
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-4xl font-black tracking-tighter text-gradient">Analytics</h2>
        <p className="text-muted-foreground text-lg font-medium">Visualize your progress and get AI-powered insights.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass border-none shadow-xl card-hover overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Habit Consistency</CardTitle>
            <CardDescription className="font-medium">Number of habits completed over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff', fontWeight: 700 }}
                />
                <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-xl card-hover overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl font-bold tracking-tight">Task Distribution</CardTitle>
            <CardDescription className="font-medium">Completion status by category</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskCategoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#fff', fontWeight: 700 }}
                />
                <Bar dataKey="completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" stackId="a" fill="rgba(255,255,255,0.1)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-none shadow-2xl bg-linear-to-br from-primary/10 to-purple-600/10 overflow-hidden relative">
        <div className="absolute -right-20 -bottom-20 opacity-5">
          <Sparkles className="w-80 h-80" />
        </div>
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
              <Sparkles className="w-6 h-6 text-primary fill-primary" />
              AI Insights
            </CardTitle>
            <CardDescription className="text-base font-medium">Personalized coaching based on your activity</CardDescription>
          </div>
          <Button 
            onClick={fetchInsights} 
            disabled={loadingInsights}
            variant="default"
            className="gap-2 h-12 px-6 rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            {loadingInsights ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {insights ? 'Refresh Insights' : 'Get Insights'}
          </Button>
        </CardHeader>
        <CardContent className="relative z-10">
          {insights ? (
            <div className="prose prose-sm dark:prose-invert max-w-none bg-black/20 p-6 rounded-2xl border border-white/5">
              <ReactMarkdown>{insights}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <Sparkles className="w-10 h-10 text-primary opacity-40" />
              </div>
              <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto">Click the button to generate AI insights based on your habits and tasks.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
