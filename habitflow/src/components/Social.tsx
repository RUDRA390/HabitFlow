import { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Users, Trophy, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { getLeaderboard } from '../lib/services';

interface SocialProps {
profile: UserProfile | null;
}

export default function Social({ profile }: SocialProps) {

const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
const fetchLeaderboard = async () => {
try {
const data = await getLeaderboard();

```
    // 🔥 SAFETY FIX (MOST IMPORTANT)
    if (Array.isArray(data)) {
      setLeaderboard(data);
    } else {
      setLeaderboard([]);
    }

  } catch (err) {
    console.error("Leaderboard Error:", err);
    setLeaderboard([]); // 🔥 fallback
  } finally {
    setLoading(false);
  }
};

fetchLeaderboard();
```

}, []);

// 🔥 EXTRA SAFETY
const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];

return ( <div className="space-y-8">

```
  {/* HEADER */}
  <header className="flex justify-between items-center">
    <div>
      <h2 className="text-4xl font-bold">Social Hub</h2>
      <p className="text-gray-400">Compete and grow with others</p>
    </div>

    <Button>
      <UserPlus className="w-4 h-4 mr-2" />
      Find Friends
    </Button>
  </header>

  {/* LEADERBOARD */}
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        Leaderboard
      </CardTitle>
      <CardDescription>Top users</CardDescription>
    </CardHeader>

    <CardContent>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : safeLeaderboard.length === 0 ? (
        <p className="text-center text-gray-400">No users found</p>
      ) : (
        safeLeaderboard.map((user, i) => (
          <motion.div
            key={user?.uid || i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-between items-center p-3 border-b"
          >
            <div className="flex items-center gap-3">
              <span className="font-bold">{i + 1}.</span>
              <span>{user?.displayName || "User"}</span>
            </div>

            <span className="font-bold">
              {user?.xp?.toLocaleString() || 0}
            </span>
          </motion.div>
        ))
      )}

    </CardContent>
  </Card>

</div>
```

);
}
