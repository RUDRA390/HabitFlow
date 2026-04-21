import { useState, useEffect } from "react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (user) {
        (async () => {
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

            subscribeToHabits(user.uid, setHabits);
            subscribeToTasks(user.uid, setTasks);
            subscribeToFocusSessions(user.uid, setFocusSessions);
          } catch (err) {
            console.error("ERROR:", err);
          } finally {
            setLoading(false);
          }
        })();
      } else {
        setProfile(null);
        setHabits([]);
        setTasks([]);
        setFocusSessions([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ LOADING
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // ✅ LOGIN SCREEN (FIXED 🔥)
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">HabitFlow</h1>
          <button
            onClick={async () => {
              const provider = new GoogleAuthProvider();
              await signInWithPopup(auth, provider);
            }}
            className="bg-white text-black px-4 py-2 rounded"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  // ⚠️ SAFETY: profile not ready
  if (!profile) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  // ✅ MAIN UI
  return (
    <div className="flex h-screen bg-background text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "dashboard" && (
          <Dashboard
            profile={profile}
            habits={habits || []}
            tasks={tasks || []}
          />
        )}

        {activeTab === "habits" && (
          <HabitTracker habits={habits || []} userId={user.uid} />
        )}

        {activeTab === "tasks" && (
          <TodoList tasks={tasks || []} userId={user.uid} />
        )}

        {activeTab === "focus" && (
          <FocusTimer userId={user.uid} />
        )}

        {activeTab === "analytics" && (
          <Analytics
            habits={habits || []}
            tasks={tasks || []}
            focusSessions={focusSessions || []}
          />
        )}

        {activeTab === "settings" && (
          <Settings profile={profile} userId={user.uid} />
        )}
      </div>
    </div>
  );
}

export default App;
