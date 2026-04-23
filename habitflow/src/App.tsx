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

// UI Components
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

type Tab =
| "life"
| "dashboard"
| "habits"
| "tasks"
| "focus"
| "analytics"
| "shop"
| "social"
| "settings";

function App() {
const [user, setUser] = useState<User | null>(null);
const [profile, setProfile] = useState<UserProfile | null>(null);
const [habits, setHabits] = useState<Habit[]>([]);
const [tasks, setTasks] = useState<Task[]>([]);
const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
const [loading, setLoading] = useState(true);
const [activeTab, setActiveTab] = useState<Tab>("life");

useEffect(() => {
const unsubscribe = onAuthStateChanged(auth, async (user) => {
setUser(user);

```
  if (!user) {
    setProfile(null);
    setHabits([]);
    setTasks([]);
    setFocusSessions([]);
    setLoading(false);
    return;
  }

  try {
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

    // ✅ Safe subscriptions
    subscribeToHabits(user.uid, (data) => setHabits(data ?? []));
    subscribeToTasks(user.uid, (data) => setTasks(data ?? []));
    subscribeToFocusSessions(user.uid, (data) =>
      setFocusSessions(data ?? [])
    );

  } catch (err) {
    console.error("APP ERROR:", err);
  } finally {
    setLoading(false);
  }
});

return () => unsubscribe();
```

}, []);

// 🔄 Loading Screen
if (loading) {
return ( <div className="h-screen flex items-center justify-center text-white">
Loading... </div>
);
}

// 🔐 Auth Screen
if (!user) {
return <Auth />;
}

// 🧠 Profile not ready
if (!profile) {
return ( <div className="h-screen flex items-center justify-center text-white">
Loading profile... </div>
);
}

// 🛡️ Safe data
const safeHabits = habits ?? [];
const safeTasks = tasks ?? [];
const safeFocus = focusSessions ?? [];

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
    return <FocusTimer userId={user.uid} profile={profile} />;

  case "analytics":
    return (
      <Analytics
        habits={safeHabits}
        tasks={safeTasks}
        focusSessions={safeFocus}
        profile={profile}
      />
    );

  case "shop":
    return <RewardShop profile={profile} userId={user.uid} />;

  case "social":
    return <Social profile={profile} />;

  case "settings":
    return <Settings profile={profile} userId={user.uid} setProfile={setProfile} />;

  default:
    return <LifeDashboard profile={profile} habits={safeHabits} tasks={safeTasks} />;
}
```

};

return ( <div className="flex h-screen bg-background text-white"> <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

```
  <div className="flex-1 p-6 overflow-y-auto">
    {renderContent()}
  </div>
</div>
```

);
}

export default App;
