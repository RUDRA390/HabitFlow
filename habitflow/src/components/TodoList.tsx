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
import { Plus, Trash2, Calendar, Tag, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';

interface TodoListProps {
  tasks?: Task[];
  userId: string;
}

export default function TodoList({ tasks = [], userId }: TodoListProps) {

  // ✅ SAFE ARRAY
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('Medium');
  const [newCategory, setNewCategory] = useState<Category>('Work');
  const [newDeadline, setNewDeadline] = useState('');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

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
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    await completeTask(userId, taskId, completed);
  };

  // ✅ SAFE FILTER
  const filteredTasks = safeTasks
    .filter(t => {
      if (filter === 'pending') return !t?.completed;
      if (filter === 'completed') return t?.completed;
      return true;
    })
    .sort((a, b) => {
      if (a?.completed !== b?.completed) return a.completed ? 1 : -1;

      const priorityOrder: Record<string, number> = {
        High: 0,
        Medium: 1,
        Low: 2
      };

      return (priorityOrder[a?.priority] ?? 3) - (priorityOrder[b?.priority] ?? 3);
    });

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h2 className="text-4xl font-bold">To-Do List</h2>
      </div>

      {/* ADD TASK */}
      <form onSubmit={handleAddTask} className="space-y-4">
        <Input
          placeholder="Task title"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
        />

        <Button type="submit">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </form>

      {/* TASK LIST */}
      <div className="space-y-4">

        {filteredTasks.length === 0 && (
          <p>No tasks found</p>
        )}

        {filteredTasks.map(task => (
          <Card key={task.id}>
            <CardContent className="flex items-center justify-between">

              <div>
                <p>{task.title}</p>

                {task.deadline && (
                  <p className="text-sm text-gray-500">
                    {format(new Date(task.deadline), 'MMM d')}
                  </p>
                )}
              </div>

              <div className="flex gap-2">

                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) =>
                    handleToggleTask(task.id, !!checked)
                  }
                />

                <Button
                  variant="destructive"
                  onClick={() => deleteTask(userId, task.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

              </div>

            </CardContent>
          </Card>
        ))}

      </div>

    </div>
  );
}
