import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Progress } from './ui/progress';
import { Play, Pause, RotateCcw, Timer, Coffee, Brain, Coins, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addFocusSession } from '../lib/services';
import { UserProfile } from '../types';

interface FocusTimerProps {
  userId: string;
  profile: UserProfile | null;
}

export default function FocusTimer({ userId, profile }: FocusTimerProps) {
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stopwatchRef = useRef<NodeJS.Timeout | null>(null);

  // Pomodoro Logic
  useEffect(() => {
    if (isActive && mode === 'pomodoro' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft, mode]);

  // Stopwatch Logic
  useEffect(() => {
    if (isActive && mode === 'stopwatch') {
      stopwatchRef.current = setInterval(() => {
        setStopwatchTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (stopwatchRef.current) clearInterval(stopwatchRef.current);
    }
    return () => { if (stopwatchRef.current) clearInterval(stopwatchRef.current); };
  }, [isActive, mode]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    if (!isBreak) {
      const duration = 25;
      const coins = 10;
      await addFocusSession(userId, {
        userId,
        duration,
        type: 'pomodoro',
        coinsEarned: coins,
        completedAt: new Date().toISOString()
      });
      // Play sound or notification here
      alert(`Great job! You earned ${coins} coins! Time for a break.`);
      setIsBreak(true);
      setTimeLeft(5 * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'pomodoro') {
      setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
    } else {
      setStopwatchTime(0);
    }
  };

  const handleStopwatchStop = async () => {
    setIsActive(false);
    if (stopwatchTime > 60) { // Only save if more than 1 minute
      const duration = Math.floor(stopwatchTime / 60);
      const coins = Math.floor(duration / 5) * 2; // 2 coins every 5 mins
      await addFocusSession(userId, {
        userId,
        duration,
        type: 'stopwatch',
        coinsEarned: coins,
        completedAt: new Date().toISOString()
      });
      alert(`Session saved! You earned ${coins} coins for ${duration} minutes of focus.`);
    }
    setStopwatchTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'pomodoro' 
    ? ((isBreak ? 5 * 60 : 25 * 60) - timeLeft) / (isBreak ? 5 * 60 : 25 * 60) * 100
    : 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="text-center space-y-2">
        <h2 className="text-5xl font-black tracking-tighter text-gradient">
          Focus Sanctuary
        </h2>
        <p className="text-muted-foreground text-lg font-medium">Deep work is where the magic happens.</p>
      </header>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Stats Column */}
        <div className="space-y-6">
          <Card className="glass border-none shadow-xl card-hover overflow-hidden relative">
            <div className="absolute -right-6 -top-6 opacity-10">
              <Coins className="w-28 h-28 text-yellow-500" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                Total Coins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tighter">{profile?.coins || 0}</div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">Earned through focus</p>
            </CardContent>
          </Card>

          <Card className="glass border-none shadow-xl card-hover overflow-hidden relative">
            <div className="absolute -right-6 -top-6 opacity-10">
              <Brain className="w-28 h-28 text-purple-500" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                Focus Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black tracking-tighter">{profile?.totalFocusTime || 0}m</div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">Total lifetime focus</p>
            </CardContent>
          </Card>
        </div>

        {/* Timer Column */}
        <Card className="md:col-span-2 glass border-none shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="p-4">
            <Tabs value={mode} onValueChange={(v: any) => { setMode(v); setIsActive(false); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass border-none p-1 rounded-2xl h-12">
                <TabsTrigger value="pomodoro" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
                  <Timer className="w-4 h-4" /> Pomodoro
                </TabsTrigger>
                <TabsTrigger value="stopwatch" className="gap-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg">
                  <RotateCcw className="w-4 h-4" /> Stopwatch
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-10">
            <div className="relative flex items-center justify-center">
              {/* Circular Progress */}
              <svg className="w-72 h-72 transform -rotate-90 drop-shadow-2xl">
                <circle
                  cx="144"
                  cy="144"
                  r="132"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  cx="144"
                  cy="144"
                  r="132"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={829}
                  initial={{ strokeDashoffset: 829 }}
                  animate={{ strokeDashoffset: 829 - (829 * (mode === 'pomodoro' ? progress : 0)) / 100 }}
                  className="text-primary"
                  strokeLinecap="round"
                />
              </svg>
              
              <div className="absolute flex flex-col items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode === 'pomodoro' ? timeLeft : stopwatchTime}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-7xl font-black tabular-nums tracking-tighter"
                  >
                    {mode === 'pomodoro' ? formatTime(timeLeft) : formatTime(stopwatchTime)}
                  </motion.div>
                </AnimatePresence>
                <div className="flex items-center gap-2 text-muted-foreground mt-2 font-bold uppercase tracking-widest text-[10px]">
                  {mode === 'pomodoro' ? (
                    isBreak ? <><Coffee className="w-4 h-4 text-green-500" /> Break Time</> : <><Brain className="w-4 h-4 text-primary" /> Focus Session</>
                  ) : <><RotateCcw className="w-4 h-4 text-primary" /> Tracking...</>}
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <Button 
                size="lg" 
                className="h-20 w-20 rounded-3xl shadow-2xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all"
                onClick={toggleTimer}
              >
                {isActive ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1 fill-current" />}
              </Button>
              
              {mode === 'pomodoro' ? (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-20 w-20 rounded-3xl glass border-none shadow-xl hover:scale-110 active:scale-95 transition-all"
                  onClick={resetTimer}
                >
                  <RotateCcw className="w-8 h-8" />
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-20 w-20 rounded-3xl glass border-none shadow-xl text-destructive hover:bg-destructive/10 hover:scale-110 active:scale-95 transition-all"
                  onClick={handleStopwatchStop}
                  disabled={stopwatchTime < 10}
                >
                  <Trophy className="w-8 h-8" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gamification Accents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-none shadow-xl card-hover bg-linear-to-br from-yellow-500/5 to-orange-500/5">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="p-4 bg-yellow-500 rounded-2xl shadow-lg shadow-yellow-500/20">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="font-black text-xl tracking-tight">Focus Rewards</h4>
              <p className="text-sm text-muted-foreground font-medium">Complete a Pomodoro to earn 10 coins. Stopwatch earns 2 coins every 5 minutes.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-none shadow-xl card-hover bg-linear-to-br from-blue-500/5 to-indigo-500/5">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="p-4 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="font-black text-xl tracking-tight">Deep Work Mode</h4>
              <p className="text-sm text-muted-foreground font-medium">Studies show 25-minute focus blocks with 5-minute breaks maximize productivity.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
