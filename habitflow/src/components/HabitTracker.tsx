import { useState } from 'react';
import { Habit, Category, Frequency } from '../types';
import { addHabit, completeHabit, deleteHabit } from '../lib/services';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Flame, Plus, Trash2, CheckCircle2, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';

interface HabitTrackerProps {
  habits?: Habit[];
  userId: string;
}

export default function HabitTracker({ habits = [], userId }: HabitTrackerProps) {

  // ✅ SAFE ARRAY
  const safeHabits = Array.isArray(habits) ? habits : [];

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Personal');
  const [newFrequency, setNewFrequency] = useState<Frequency>('daily');
  const [showReward, setShowReward] = useState<string | null>(null);

  const today = format(new Date(), 'yyyy-MM-dd');

  const handleAddHabit = async () => {
    if (!newName) return;

    await addHabit(userId, {
      userId,
      name: newName,
      category: newCategory,
      frequency: newFrequency,
      streak: 0,
      longestStreak: 0,
      completedDates: [],
      createdAt: new Date().toISOString()
    });

    setNewName('');
    setIsAddOpen(false);
  };

  const toggleHabit = async (habit: Habit) => {
    const isCompleted = (habit?.completedDates || []).includes(today);

    if (!isCompleted) {
      setShowReward(habit.id);
      setTimeout(() => setShowReward(null), 2000);
    }

    await completeHabit(userId, habit.id, !isCompleted);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-gradient">Habit Tracker</h2>
          <p className="text-muted-foreground">Small steps lead to big changes.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Habit
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Habit</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Habit name" />

              <Select value={newCategory} onValueChange={(v: Category) => setNewCategory(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Study">Study</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                </SelectContent>
              </Select>

              <Select value={newFrequency} onValueChange={(v: Frequency) => setNewFrequency(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleAddHabit}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* HABITS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {safeHabits.map((habit) => {

            const isCompleted = (habit?.completedDates || []).includes(today);

            return (
              <motion.div key={habit.id} layout>

                <Card>
                  <CardHeader>
                    <CardTitle>{habit.name}</CardTitle>
                  </CardHeader>

                  <CardContent>

                    <p>Streak: {habit.streak}</p>

                    <Button onClick={() => toggleHabit(habit)}>
                      {isCompleted ? 'Done' : 'Mark Done'}
                    </Button>

                  </CardContent>
                </Card>

              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

    </div>
  );
}
