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
  habits: Habit[];
  userId: string;
}

export default function HabitTracker({ habits, userId }: HabitTrackerProps) {
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
    const isCompleted = habit.completedDates.includes(today);
    
    if (!isCompleted) {
      setShowReward(habit.id);
      setTimeout(() => setShowReward(null), 2000);
    }
    
    await completeHabit(userId, habit.id, !isCompleted);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-gradient">Habit Tracker</h2>
          <p className="text-muted-foreground text-lg">Small steps lead to big changes.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger render={
            <Button className="gap-2 h-12 px-6 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
              Add Habit
            </Button>
          } />
          <DialogContent className="glass border-none shadow-2xl rounded-3xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">Add New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Habit Name</Label>
                <Input className="h-12 rounded-xl bg-accent/30 border-none focus-visible:ring-primary" placeholder="e.g., Read for 30 mins" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Category</Label>
                  <Select value={newCategory} onValueChange={(v: Category) => setNewCategory(v)}>
                    <SelectTrigger className="h-12 rounded-xl bg-accent/30 border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-none rounded-xl">
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Study">Study</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Frequency</Label>
                  <Select value={newFrequency} onValueChange={(v: Frequency) => setNewFrequency(v)}>
                    <SelectTrigger className="h-12 rounded-xl bg-accent/30 border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-none rounded-xl">
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20" onClick={handleAddHabit}>Create Habit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {habits.map((habit) => {
            const isCompleted = habit.completedDates.includes(today);
            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                whileHover={{ y: -5 }}
              >
                <Card className={`glass border-none shadow-xl card-hover relative overflow-hidden transition-all ${isCompleted ? 'ring-2 ring-primary/50' : ''}`}>
                  <AnimatePresence>
                    {showReward === habit.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="absolute inset-0 z-10 flex items-center justify-center bg-primary/20 backdrop-blur-sm"
                      >
                        <div className="bg-background/80 p-4 rounded-3xl shadow-2xl border border-primary/20 flex flex-col items-center gap-2">
                          <Sparkles className="w-8 h-8 text-yellow-500 animate-bounce" />
                          <p className="font-black text-primary">+50 XP</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest">+10 Coins</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isCompleted && (
                    <div className="absolute top-0 right-0 p-2">
                      <div className="bg-primary/20 text-primary p-1 rounded-full border border-primary/20">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2 font-bold uppercase tracking-widest text-[10px] bg-primary/10 text-primary border-none">{habit.category}</Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => deleteHabit(userId, habit.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">{habit.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-orange-500">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                          <Flame className="w-6 h-6 fill-orange-500" />
                        </div>
                        <div>
                          <div className="font-black text-2xl tracking-tighter leading-none">{habit.streak}</div>
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Streak</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground bg-accent/30 px-3 py-1.5 rounded-xl border border-white/5">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{habit.frequency}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Last 7 Days</span>
                        <span>{habit.completedDates.length} Total</span>
                      </div>
                      <div className="flex gap-1.5">
                        {[...Array(7)].map((_, i) => {
                          const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
                          const done = habit.completedDates.includes(date);
                          return (
                            <div 
                              key={i} 
                              className={`flex-1 h-3 rounded-md transition-all ${done ? 'bg-primary shadow-sm shadow-primary/50' : 'bg-accent/50'}`}
                              title={date}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <Button 
                      className={`w-full h-12 rounded-xl font-bold gap-2 transition-all ${isCompleted ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30 border border-green-500/20 shadow-none' : 'shadow-lg shadow-primary/20'}`}
                      onClick={() => toggleHabit(habit)}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Done for Today
                        </>
                      ) : (
                        'Mark as Done'
                      )}
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
