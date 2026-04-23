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
  navItems?: any[];
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  profile,
  navItems = [],
}: SidebarProps) {

  // 🔥 SAFE NAV ITEMS (NO CRASH EVER)
  const items = navItems.length
    ? navItems
    : [
        { id: "life", label: "Life", icon: Zap },
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "habits", label: "Habits", icon: CheckSquare },
        { id: "tasks", label: "Tasks", icon: Trophy },
        { id: "focus", label: "Focus", icon: Timer },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "shop", label: "Shop", icon: ShoppingBag },
        { id: "social", label: "Social", icon: Users },
        { id: "settings", label: "Settings", icon: SettingsIcon },
      ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-card border-r border-white/5 p-6 shadow-2xl z-20">
      <div className="flex flex-col h-full">

        {/* HEADER */}
        <div className="mb-10 px-2">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="p-2 bg-primary rounded-xl">
              <Flame className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black">HabitFlow</h1>
          </motion.div>

          {/* PROFILE */}
          {profile && (
            <div className="bg-black/30 p-4 rounded-xl">
              <p className="font-bold">{profile.displayName}</p>
              <p className="text-xs text-gray-400">{profile.title}</p>
              <p className="text-xs">Level {profile.level}</p>

              <div className="flex gap-3 mt-2 text-sm">
                <span>🔥 {profile.loginStreak || 0}</span>
                <span>🪙 {profile.coins || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                  activeTab === item.id
                    ? 'bg-primary text-white'
                    : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="mt-auto pt-6">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => auth.signOut()}
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>

      </div>
    </aside>
  );
}
