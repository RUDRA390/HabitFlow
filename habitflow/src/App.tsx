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

          // 🔥 store unsubscribe functions
          const unsubHabits = subscribeToHabits(user.uid, setHabits);
          const unsubTasks = subscribeToTasks(user.uid, setTasks);
          const unsubFocus = subscribeToFocusSessions(user.uid, setFocusSessions);

          // 🔥 cleanup properly
          return () => {
            unsubHabits?.();
            unsubTasks?.();
            unsubFocus?.();
          };

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
