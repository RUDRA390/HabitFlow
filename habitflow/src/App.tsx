import { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
getUserProfile,
createUserProfile,
subscribeToHabits,
subscribeToTasks,
subscribeToFocusSessions,
checkDailyLogin
} from './lib/services';
import { UserProfile, Habit, Task, FocusSession } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HabitTracker from './components/HabitTracker';
import TodoList from './components/TodoList';
import FocusTimer from './components/FocusTimer';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import LifeDashboard from './components/LifeDashboard';
import RewardShop from './components/RewardShop';
import Social from './components/Social';
import Auth from './components/Auth';
import {
LayoutDashboard,
CheckSquare,
Timer,
BarChart3,
Settings as SettingsIcon,
Trophy,
ShoppingBag,
Users,
Zap,
Menu,
X
} from 'lucide-react';
import { Button } from './components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'life' | 'dashboard' | 'habits' | 'tasks' | 'focus' | 'analytics' | 'shop' | 'social' | 'settings';

export default function App() {
const [user, setUser] = useState<User | null>(null);
const [profile, setProfile] = useState<UserProfile | null>(null);
const [habits, setHabits] = useState<Habit[]>([]);
const [tasks, setTasks] = useState<Task[]>([]);
const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState<Tab>('life');
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, async (user) => {
setUser(user);
if (user) {
let userProfile = await getUserProfile(user.uid);
if (!userProfile) {
userProfile = {
uid: user.uid,
email: user.email || '',
displayName: user.displayName || 'User',
theme: 'dark',
coins: 0,
xp: 0,
level: 1,
title: 'Beginner',
streakFreezes: 0,
totalFocusTime: 0,
loginStreak: 1,
lastLoginDate: new Date().toISOString().split('T')[0],
isPremium: false,
createdAt: new Date().toISOString(),
};
await createUserProfile(userProfile);
}
setProfile(userProfile);

    await checkDailyLogin(user.uid);

    const unsubHabits = subscribeToHabits(user.uid, setHabits);
    const unsubTasks = subscribeToTasks(user.uid, setTasks);
    const unsubFocus = subscribeToFocusSessions(user.uid, setFocusSessions);

    return () => {
      unsubHabits();
      unsubTasks();
      unsubFocus();
    };
  } else {
    setProfile(null);
    setHabits([]);
    setTasks([]);
    setFocusSessions([]);
  }
  setLoading(false);
});

return () => unsubscribe();

}, []);

useEffect(() => {
if (profile?.theme) {
document.documentElement.classList.remove('light', 'dark', 'emerald', 'rose', 'amber', 'midnight');
document.documentElement.classList.remove('light', 'dark', 'emerald', 'rose', 'amber', 'midnight');
document.documentElement.classList.add('midnight');
} else {
document.documentElement.classList.add('dark');
}
}, [profile?.theme]);

if (loading) {
return ( <div className="h-screen w-full flex items-center justify-center bg-background">
<motion.div
animate={{ rotate: 360 }}
transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
/> </div>
);
}

if (!user) {
return <Auth />;
}

const renderContent = () => {
switch (activeTab) {
case 'life':
return <LifeDashboard profile={profile} habits={habits} tasks={tasks} />;
case 'dashboard':
return <Dashboard habits={habits} tasks={tasks} profile={profile} />;
case 'habits':
return <HabitTracker habits={habits} userId={user.uid} />;
case 'tasks':
return <TodoList tasks={tasks} userId={user.uid} />;
case 'focus':
return <FocusTimer userId={user.uid} profile={profile} />;
case 'analytics':
return <Analytics habits={habits} tasks={tasks} profile={profile} />;
case 'shop':
return <RewardShop profile={profile} userId={user.uid} />;
case 'social':
return <Social profile={profile} />;
case 'settings':
return <Settings profile={profile} userId={user.uid} setProfile={setProfile} />;
default:
return <LifeDashboard profile={profile} habits={habits} tasks={tasks} />;
}
};

const navItems = [
{ id: 'life', label: 'Life', icon: Zap },
{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
{ id: 'habits', label: 'Habits', icon: Trophy },
{ id: 'tasks', label: 'Tasks', icon: CheckSquare },
{ id: 'focus', label: 'Focus', icon: Timer },
{ id: 'analytics', label: 'Analytics', icon: BarChart3 },
{ id: 'shop', label: 'Shop', icon: ShoppingBag },
{ id: 'social', label: 'Social', icon: Users },
{ id: 'settings', label: 'Settings', icon: SettingsIcon },
];

return (
    <div className="flex h-screen bg-background overflow-hidden relative">

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab: any) => setActiveTab(tab)} 
        profile={profile}
        navItems={navItems}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">

        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between mb-6 sticky top-0 z-30 bg-background/80 backdrop-blur-xl p-2 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary fill-current" />
            <h1 className="text-xl font-black tracking-tighter">HabitFlow</h1>
      </div>
      <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
        <Menu className="w-6 h-6" />
      </Button>
    </header>

    {/* Background */}
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700" />
    </div>

    <div className="max-w-7xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>

  </main>

  {/* Mobile Menu */}
  <AnimatePresence>
    {isMobileMenuOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        />
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className="fixed inset-y-0 right-0 w-72 bg-card z-50 lg:hidden p-6 shadow-2xl border-l border-white/5"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">Menu</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </Button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl hover:bg-white/5"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-bold">{item.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>
      </>
    )}
  </AnimatePresence>

  {/* Footer */}
  <div className="fixed bottom-0 left-0 w-full bg-linear-to-r from-purple-900/40 via-black/40 to-indigo-900/40 backdrop-blur-md border-t border-white/10 py-2 text-center text-gray-400 text-xs z-50">
    🚀 Crafted with passion by <span className="text-white font-semibold">Biswanath</span>
  </div>

    </div>
  );
}

