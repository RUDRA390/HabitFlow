import { useState } from 'react';
import { Task, Priority, Category } from '../types';
import { addTask, completeTask, deleteTask } from '../lib/services';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Plus, Trash2, Calendar, Tag, CheckSquare, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from './ui/badge';

interface TodoListProps {
  tasks: Task[];
  userId: string;
}

export default function TodoList({ tasks, userId }: TodoListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('Medium');
  const [newCategory, setNewCategory] = useState<Category>('Work');
  const [newDeadline, setNewDeadline] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [showReward, setShowReward] = useState<string | null>(null);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setIsAdding(true);
    setError('');
    try {
      await addTask(userId, {
        userId,
        title: newTitle.trim(),
        priority: newPriority,
        category: newCategory,
        deadline: newDeadline || undefined,
        completed: false,
        createdAt: new Date().toISOString()
      });
      
      setNewTitle('');
      setNewDeadline('');
    } catch (err: any) {
      console.error("Add Task Error:", err);
      setError('Failed to add task. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    if (completed) {
      setShowReward(taskId);
      setTimeout(() => setShowReward(null), 2000);
    }
    await completeTask(userId, taskId, completed);
  };


  const filteredTasks = tasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  }).sort((a, b) => {
    // Sort by priority then completion
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-gradient">To-Do List</h2>
          <p className="text-muted-foreground text-lg">Stay organized and productive.</p>
        </div>
        <Tabs value={filter} onValueChange={(v: any) => setFilter(v)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 glass border-none p-1 rounded-2xl h-12">
            <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">All</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">Pending</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">Done</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <Card className="glass border-none shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <form onSubmit={handleAddTask} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task" className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Task Title</Label>
                <Input 
                  id="task" 
                  className="h-12 rounded-xl bg-accent/30 border-none focus-visible:ring-primary text-lg"
                  placeholder="What needs to be done?" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  disabled={isAdding}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Priority</Label>
                  <Select value={newPriority} onValueChange={(v: Priority) => setNewPriority(v)} disabled={isAdding}>
                    <SelectTrigger className="h-12 rounded-xl bg-accent/30 border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-none rounded-xl">
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Category</Label>
                  <Select value={newCategory} onValueChange={(v: Category) => setNewCategory(v)} disabled={isAdding}>
                    <SelectTrigger className="h-12 rounded-xl bg-accent/30 border-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-none rounded-xl">
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Study">Study</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-end gap-6">
              <div className="flex-1 space-y-2 w-full">
                <Label htmlFor="deadline" className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Deadline (Optional)</Label>
                <Input 
                  id="deadline" 
                  type="date" 
                  className="h-12 rounded-xl bg-accent/30 border-none focus-visible:ring-primary"
                  value={newDeadline}
                  onChange={e => setNewDeadline(e.target.value)}
                  disabled={isAdding}
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto h-12 px-8 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 gap-2" disabled={isAdding || !newTitle.trim()}>
                {isAdding ? (
                  <>
                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Task
                  </>
                )}
              </Button>
            </div>
            {error && <p className="text-sm text-destructive font-bold text-center">{error}</p>}
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`glass border-none shadow-xl card-hover group transition-all relative overflow-hidden ${task.completed ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                <AnimatePresence>
                  {showReward === task.id && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1.2 }}
                      exit={{ opacity: 0, scale: 1.5 }}
                      className="absolute inset-0 z-10 flex items-center justify-center bg-primary/20 backdrop-blur-sm"
                    >
                      <div className="bg-background/80 p-3 rounded-2xl shadow-2xl border border-primary/20 flex flex-col items-center gap-1">
                        <Sparkles className="w-6 h-6 text-yellow-500 animate-bounce" />
                        <p className="font-black text-primary text-sm">+30 XP</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest">+5 Coins</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <CardContent className="p-5 flex items-center gap-6">
                  <Checkbox 
                    checked={task.completed} 
                    onCheckedChange={(checked) => handleToggleTask(task.id, !!checked)}
                    className="w-6 h-6 rounded-lg border-2 border-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`text-xl font-bold truncate tracking-tight ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Tag className="w-3.5 h-3.5 text-primary" />
                        {task.category}
                      </div>
                      {task.deadline && (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {format(new Date(task.deadline), 'MMM d, yyyy')}
                        </div>
                      )}
                      <Badge variant="secondary" className={`text-[10px] font-black uppercase tracking-widest h-5 px-2 rounded-full border ${
                        task.priority === 'High' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                        task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                        'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={() => deleteTask(userId, task.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredTasks.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 text-muted-foreground bg-accent/10 rounded-3xl border-2 border-dashed border-white/5"
          >
            <CheckSquare className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="text-xl font-bold tracking-tight">No tasks found. Enjoy your free time!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
