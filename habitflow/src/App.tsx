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

          subscribeToHabits(user.uid, setHabits);
          subscribeToTasks(user.uid, setTasks);
          subscribeToFocusSessions(user.uid, setFocusSessions);

        } catch (err) {
          console.error("ERROR:", err);
        } finally {
          setLoading(false); // 🔥 ALWAYS RUN
        }
      })();
    } else {
      setProfile(null);
      setHabits([]);
      setTasks([]);
      setFocusSessions([]);
      setLoading(false); // 🔥 IMPORTANT
    }
  });

  return () => unsubscribe();
}, []);
