import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  addDoc,
  increment,
  limit,
  orderBy
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { Habit, Task, UserProfile, OperationType, FocusSession, UserTitle } from '../types';
import { handleFirestoreError } from './error-handler';

// Leveling Logic
export const XP_PER_LEVEL = 1000;
export const getLevelFromXP = (xp: number) => Math.floor(xp / XP_PER_LEVEL) + 1;
export const getTitleFromLevel = (level: number): UserTitle => {
  if (level >= 50) return 'Legend';
  if (level >= 30) return 'Monk';
  if (level >= 15) return 'Warrior';
  if (level >= 5) return 'Disciplined';
  return 'Beginner';
};

// User Profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, path);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const createUserProfile = async (profile: UserProfile): Promise<void> => {
  const path = `users/${profile.uid}`;
  const publicPath = `profiles/${profile.uid}`;
  try {
    const fullProfile = {
      ...profile,
      xp: 0,
      level: 1,
      title: 'Beginner',
      coins: 0,
      streakFreezes: 0,
      loginStreak: 1,
      lastLoginDate: new Date().toISOString().split('T')[0],
      isPremium: false
    };
    
    await setDoc(doc(db, path), fullProfile);
    
    // Create public profile (no PII like email)
    await setDoc(doc(db, publicPath), {
      uid: profile.uid,
      displayName: profile.displayName || 'Anonymous',
      photoURL: profile.photoURL || '',
      xp: 0,
      level: 1,
      title: 'Beginner',
      isPremium: false
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  const path = `users/${uid}`;
  const publicPath = `profiles/${uid}`;
  try {
    await updateDoc(doc(db, path), data);
    
    // Update public profile if relevant fields changed
    const publicFields = ['displayName', 'photoURL', 'xp', 'level', 'title', 'isPremium'];
    const publicUpdate: any = {};
    let hasPublicUpdate = false;
    
    publicFields.forEach(field => {
      if (field in data) {
        publicUpdate[field] = (data as any)[field];
        hasPublicUpdate = true;
      }
    });
    
    if (hasPublicUpdate) {
      await updateDoc(doc(db, publicPath), publicUpdate);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const addXP = async (userId: string, amount: number): Promise<void> => {
  const path = `users/${userId}`;
  const publicPath = `profiles/${userId}`;
  try {
    const userRef = doc(db, path);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      const newXP = (userData.xp || 0) + amount;
      const newLevel = getLevelFromXP(newXP);
      const newTitle = getTitleFromLevel(newLevel);
      
      const updateData = {
        xp: newXP,
        level: newLevel,
        title: newTitle
      };
      
      await updateDoc(userRef, updateData);
      await updateDoc(doc(db, publicPath), updateData);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const checkDailyLogin = async (userId: string): Promise<void> => {
  const path = `users/${userId}`;
  const publicPath = `profiles/${userId}`;
  try {
    const userRef = doc(db, path);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = userData.lastLoginDate;

      if (lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = 1;
        if (lastLogin === yesterdayStr) {
          newStreak = (userData.loginStreak || 0) + 1;
        }

        // Reward for login
        const rewardXP = 50 * newStreak;
        const rewardCoins = 10 * newStreak;

        await updateDoc(userRef, {
          lastLoginDate: today,
          loginStreak: newStreak,
          xp: increment(rewardXP) as any,
          coins: increment(rewardCoins) as any
        });
        
        // Check for level up after XP increment
        const updatedSnap = await getDoc(userRef);
        const updatedData = updatedSnap.data() as UserProfile;
        const newLevel = getLevelFromXP(updatedData.xp || 0);
        const newTitle = getTitleFromLevel(newLevel);
        
        if (newLevel !== updatedData.level) {
          await updateDoc(userRef, {
            level: newLevel,
            title: newTitle
          });
        }

        // Sync XP/Level/Title to public profile
        await updateDoc(doc(db, publicPath), {
          xp: updatedData.xp,
          level: newLevel,
          title: newTitle
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Habits
export const subscribeToHabits = (userId: string, callback: (habits: Habit[]) => void) => {
  const path = `users/${userId}/habits`;
  const q = query(collection(db, path));
  
  return onSnapshot(q, (snapshot) => {
    const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Habit));
    callback(habits);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const addHabit = async (userId: string, habit: Omit<Habit, 'id'>): Promise<void> => {
  const path = `users/${userId}/habits`;
  try {
    await addDoc(collection(db, path), habit);
    await addXP(userId, 100); // XP for creating a habit
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const completeHabit = async (userId: string, habitId: string, isCompleted: boolean): Promise<void> => {
  const path = `users/${userId}/habits/${habitId}`;
  try {
    const habitRef = doc(db, path);
    const habitSnap = await getDoc(habitRef);
    if (habitSnap.exists()) {
      const habitData = habitSnap.data() as Habit;
      const today = new Date().toISOString().split('T')[0];
      let newDates = [...habitData.completedDates];
      
      if (isCompleted) {
        if (!newDates.includes(today)) {
          newDates.push(today);
          await addXP(userId, 50);
          await updateDoc(doc(db, `users/${userId}`), { coins: increment(10) as any });
        }
      } else {
        newDates = newDates.filter(d => d !== today);
      }
      
      await updateDoc(habitRef, { completedDates: newDates });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Tasks
export const updateHabit = async (userId: string, habitId: string, data: Partial<Habit>): Promise<void> => {
  const path = `users/${userId}/habits/${habitId}`;
  try {
    await updateDoc(doc(db, path), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteHabit = async (userId: string, habitId: string): Promise<void> => {
  const path = `users/${userId}/habits/${habitId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

// Tasks
export const subscribeToTasks = (userId: string, callback: (tasks: Task[]) => void) => {
  const path = `users/${userId}/tasks`;
  const q = query(collection(db, path));
  
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    callback(tasks);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const addTask = async (userId: string, task: Omit<Task, 'id'>): Promise<void> => {
  const path = `users/${userId}/tasks`;
  try {
    await addDoc(collection(db, path), task);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const updateTask = async (userId: string, taskId: string, data: Partial<Task>): Promise<void> => {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await updateDoc(doc(db, path), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteTask = async (userId: string, taskId: string): Promise<void> => {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, path));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const completeTask = async (userId: string, taskId: string, completed: boolean): Promise<void> => {
  const path = `users/${userId}/tasks/${taskId}`;
  try {
    await updateDoc(doc(db, path), { completed });
    if (completed) {
      await addXP(userId, 30);
      await updateDoc(doc(db, `users/${userId}`), { coins: increment(5) as any });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// Focus Sessions
export const subscribeToFocusSessions = (userId: string, callback: (sessions: FocusSession[]) => void) => {
  const path = `users/${userId}/focus_sessions`;
  const q = query(collection(db, path));
  
  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FocusSession));
    callback(sessions);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
};

export const addFocusSession = async (userId: string, session: Omit<FocusSession, 'id'>): Promise<void> => {
  const path = `users/${userId}/focus_sessions`;
  try {
    const xpEarned = session.duration * 2; // 2 XP per minute
    await addDoc(collection(db, path), { ...session, xpEarned });
    
    const userRef = doc(db, `users/${userId}`);
    await updateDoc(userRef, {
      coins: increment(session.coinsEarned) as any,
      totalFocusTime: increment(session.duration) as any,
      xp: increment(xpEarned) as any
    });

    // Check level up
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data() as UserProfile;
    const newLevel = getLevelFromXP(userData.xp || 0);
    if (newLevel !== userData.level) {
      await updateDoc(userRef, {
        level: newLevel,
        title: getTitleFromLevel(newLevel)
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

// Social & Leaderboard
export const getLeaderboard = async (): Promise<UserProfile[]> => {
  const path = 'profiles';
  try {
    const q = query(collection(db, path), orderBy('xp', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

// Reward Shop
export const purchaseItem = async (userId: string, cost: number, itemType: string, value: string): Promise<boolean> => {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, path);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data() as UserProfile;
      if ((userData.coins || 0) >= cost) {
        const updateData: Partial<UserProfile> = {
          coins: increment(-cost) as any
        };
        
        if (itemType === 'theme') {
          updateData.theme = value as any;
        } else if (itemType === 'streak-freeze') {
          updateData.streakFreezes = increment(1) as any;
        }
        
        await updateDoc(userRef, updateData);
        return true;
      }
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return false;
  }
};

