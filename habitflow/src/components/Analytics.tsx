import { useState } from 'react';
import { Habit, Task, UserProfile } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getAIInsights } from '../lib/ai-service';
import { Button } from './ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format, subDays, eachDayOfInterval } from 'date-fns';

interface AnalyticsProps {
  habits?: Habit[];
  tasks?: Task[];
  profile: UserProfile | null;
}

export default function Analytics({ habits = [], tasks = [], profile }: AnalyticsProps) {

  // ✅ SAFE ARRAYS
  const safeHabits = Array.isArray(habits) ? habits : [];
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoadingInsights(true);
      const result = await getAIInsights(safeHabits, safeTasks, profile);
      setInsights(result || "No insights available");
    } catch (err) {
      console.error("AI ERROR:", err);
      setInsights("Failed to generate insights");
    } finally {
      setLoadingInsights(false);
    }
  };

  // 📊 LAST 7 DAYS
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const habitData = last7Days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');

    const completedCount = safeHabits.filter(h =>
      (h?.completedDates || []).includes(dateStr)
    ).length;

    return {
      name: format(date, 'EEE'),
      completed: completedCount,
      total: safeHabits.length
    };
  });

  // 📊 TASK CATEGORY
  const categories = ['Work', 'Study', 'Health', 'Personal'];

  const taskCategoryData = categories.map(cat => ({
    name: cat,
    completed: safeTasks.filter(t => t?.category === cat && t?.completed).length,
    pending: safeTasks.filter(t => t?.category === cat && !t?.completed).length
  }));

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <header className="space-y-1">
        <h2 className="text-4xl font-black text-gradient">Analytics</h2>
        <p className="text-muted-foreground text-lg">
          Visualize your progress and get AI insights.
        </p>
      </header>

      {/* CHARTS */}
      <div className="grid gap-6 md:grid-cols-2">

        <Card>
          <CardHeader>
            <CardTitle>Habit Consistency</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>

          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="completed" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>

          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskCategoryData} layout="vertical">
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="completed" fill="#10b981" />
                <Bar dataKey="pending" fill="#aaa" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

      {/* AI INSIGHTS */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights</CardTitle>
        </CardHeader>

        <CardContent>
          <Button onClick={fetchInsights} disabled={loadingInsights}>
            {loadingInsights ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {insights ? "Refresh" : "Get Insights"}
          </Button>

          {insights && (
            <div className="mt-4">
              <ReactMarkdown>{insights}</ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
