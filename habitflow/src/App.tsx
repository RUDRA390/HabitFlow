import { useEffect, useState } from "react";
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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ color: "white", textAlign: "center", marginTop: "50px" }}>
      <h1>HabitFlow 🚀</h1>
      {user ? <p>Welcome {profile?.displayName}</p> : <p>Please Login</p>}
    </div>
  );
}

export default App; // 🔥🔥🔥 MOST IMPORTANT LINE
