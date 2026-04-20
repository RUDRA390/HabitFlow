import { 
  LayoutDashboard, 
  CheckSquare, 
  Trophy, 
  BarChart3, 
  Settings as SettingsIcon,
  LogOut,
  Timer,
  ShoppingBag,
  Users,
  Zap,
  Flame,
  Coins
} from 'lucide-react';
import { Button } from './ui/button';
import { UserProfile } from '../types';
import { auth } from '../lib/firebase';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: UserProfile | null;
  navItems: any[];
}

export default function Sidebar({ activeTab, setActiveTab, profile, navItems }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-72 bg-card border-r border-white/5 p-6 shadow-2xl z-20">
      <div className="flex flex-col h-full">
        <div className="mb-10 px-2">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
              <Flame className="w-8 h-8 text-primary-foreground fill-current" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-gradient">HabitFlow</h1>
          </motion.div>

          {profile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass p-4 rounded-2xl border-primary/10 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary border border-primary/20">
                  {profile.displayName?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="font-black truncate text-sm tracking-tight">{profile.displayName}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">{profile.title}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                <span>Level {profile.level}</span>
                <span>{Math.round(((profile.xp || 0) % 1000) / 10)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${((profile.xp || 0) % 1000) / 10}%` }} />
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Coins className="w-3 h-3 fill-current" />
                  <span className="text-xs font-black tabular-nums">{profile.coins || 0}</span>
                </div>
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame className="w-3 h-3 fill-current" />
                  <span className="text-xs font-black tabular-nums">{profile.loginStreak || 0}d</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group relative
                ${activeTab === item.id 
                  ? 'bg-primary text-primary-foreground shadow-xl shadow-primary/20' 
                  : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'}
              `}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : ''}`} />
              <span className="font-bold tracking-tight">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-6 bg-white rounded-full"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-4 h-12 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-bold"
            onClick={() => auth.signOut()}
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
