import { useState, useEffect } from "react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

import {
getUserProfile,
createUserProfile,
subscribeToHabits,
subscribeToTasks,
subscribeToFocusSessions,
checkDailyLogin,
} from "./lib/services";

import { UserProfile, Habit, Task, FocusSession } from "./types";

// UI
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import HabitTracker from "./components/HabitTracker";
import TodoList from "./components/TodoList";
import FocusTimer from "./components/FocusTimer";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";
import LifeDashboard from "./components/LifeDashboard";
import RewardShop from "./components/RewardShop";
import Social from "./components/Social";
import Auth from "./components/Auth";

// ICONS
import {
LayoutDashboard,
CheckSquare,
BarChart3,
Settings as SettingsIcon,
Timer,
ShoppingBag,
Users,
Zap,
} from "lucide-react";

function App() {
const [user, setUser] = useState<User | null>(null);
const [profile, setProfile] = useState<UserProfile | null>(null);

const [habits, setHabits] = useState<Habit[]>([]);
const [tasks, setTasks] = useState<Task[]>([]);
const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);

const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState("life");

// 🔥 NAV ITEMS
const navItems = [
{ id: "life", label: "Life", icon: Zap },
{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
{ id: "habits", label: "Habits", icon: CheckSquare },
{ id: "tasks", label: "Tasks", icon: CheckSquare },
{ id: "focus", label: "Focus", icon: Timer },
{ id: "analytics", label: "Analytics", icon: BarChart3 },
{ id: "shop", label: "Shop", icon: ShoppingBag },
{ id: "social", label: "Social", icon: Users },
{ id: "settings", label: "Settings", icon: SettingsIcon },
];

useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, async (user) => {
try {
setUser(user);

```
    if (!user) {
      setProfile(null);
      setHabits([]);
      setTasks([]);
      setFocusSessions([]);
      return;
    }

    let userProfile = await getUserProfile(user.uid);

    if (!userProfile) {
      userProfile = {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "User",
        theme: "dark",
        coins: 0,
        xp: 0,
        level: 1,
        title: "Beginner",
        streakFreezes: 0,
        totalFocusTime: 0,
        loginStreak: 1,
        lastLoginDate: new Date().toISOString().split("T")[0],
        isPremium: false,
        createdAt: new Date().toISOString(),
      };

      await createUserProfile(userProfile);
    }

    setProfile(userProfile);

    await checkDailyLogin(user.uid);

    // 🔥 SAFE SUBSCRIPTIONS
    subscribeToHabits(user.uid, (data) => {
      setHabits(Array.isArray(data) ? data : []);
    });

    subscribeToTasks(user.uid, (data) => {
      setTasks(Array.isArray(data) ? data : []);
    });

    subscribeToFocusSessions(user.uid, (data) => {
      setFocusSessions(Array.isArray(data) ? data : []);
    });

  } catch (err) {
    console.error("APP ERROR:", err);
  } finally {
    setLoading(false);
  }
});

return () => unsubscribe();
```

}, []);

// 🔥 LOADING
if (loading) {
return <div className="text-white p-10">Loading...</div>;
}

// 🔥 LOGIN
if (!user) {
return <Auth />;
}

// 🔥 PROFILE SAFETY
if (!profile) {
return <div className="text-white p-10">Loading profile...</div>;
}

// 🔥 SAFE ARRAYS (IMPORTANT)
const safeHabits = habits || [];
const safeTasks = tasks || [];
const safeFocus = focusSessions || [];

const renderContent = () => {
switch (activeTab) {
case "life":
return <LifeDashboard profile={profile} habits={safeHabits} tasks={safeTasks} />;

```
  case "dashboard":
    return <Dashboard profile={profile} habits={safeHabits} tasks={safeTasks} />;

  case "habits":
    return <HabitTracker habits={safeHabits} userId={user.uid} />;

  case "tasks":
    return <TodoList tasks={safeTasks} userId={user.uid} />;

  case "focus":
    return <FocusTimer userId={user.uid} />;

  case "analytics":
    return (
      <Analytics
        habits={safeHabits}
        tasks={safeTasks}
        profile={profile}
      />
    );

  case "shop":
    return <RewardShop profile={profile} userId={user.uid} />;

  case "social":
    return <Social profile={profile} />;

  case "settings":
    return <Settings profile={profile} userId={user.uid} />;

  default:
    return <LifeDashboard profile={profile} habits={safeHabits} tasks={safeTasks} />;
}
```

};

return ( <div className="flex h-screen bg-background text-white">

```
  <Sidebar
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    profile={profile}
    navItems={navItems}
  />

  <div className="flex-1 p-6 overflow-y-auto">
    {renderContent()}
  </div>

</div>
```

);
}

export default App;
