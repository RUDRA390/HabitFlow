import { 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile, getUserProfile } from '../lib/services';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Flame, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function Auth() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      const existingProfile = await getUserProfile(user.uid);
      if (!existingProfile) {
        await createUserProfile({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'User',
          theme: 'dark',
          coins: 0,
          totalFocusTime: 0,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px]" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-4"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-20 h-20 bg-linear-to-br from-primary to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/30 mb-6"
          >
            <Flame className="w-12 h-12 text-white fill-white" />
          </motion.div>
          <h1 className="text-5xl font-black text-foreground tracking-tighter mb-2">HabitFlow</h1>
          <p className="text-muted-foreground text-lg font-medium">Your journey to mastery starts here.</p>
        </div>

        <Card className="glass border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base">
              Sign in to sync your progress and earn rewards.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button 
              className="w-full h-14 text-lg font-bold gap-3 bg-white text-black hover:bg-gray-50 border-2 border-gray-100 shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]" 
              onClick={handleGoogleLogin} 
              disabled={loading}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c3.11 0 5.72-1.03 7.63-2.81l-3.57-2.77c-.98.66-2.23 1.06-3.63 1.06-2.79 0-5.15-1.88-6.01-4.41H2.75v2.81C4.66 20.59 8.08 23 12 23z"/>
                <path fill="#FBBC05" d="M5.99 14.07c-.22-.66-.35-1.36-.35-2.07s.13-1.41.35-2.07V7.12H2.75C2.09 8.44 1.72 10.18 1.72 12s.37 3.56 1.03 4.88l3.24-2.81z"/>
                <path fill="#EA4335" d="M12 5.38c1.69 0 3.21.58 4.41 1.72l3.31-3.31C17.71 2.04 15.11 1 12 1 8.08 1 4.66 3.41 2.75 6.73l3.24 2.81c.86-2.53 3.22-4.41 6.01-4.41z"/>
              </svg>
              {loading ? 'Connecting...' : 'Continue with Google'}
            </Button>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-destructive font-bold text-center mt-4"
              >
                {error}
              </motion.p>
            )}
          </CardContent>
          <CardFooter className="justify-center bg-muted/30 py-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold">Earn coins for every focus session</span>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
