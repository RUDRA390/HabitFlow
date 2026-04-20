import { useState } from 'react';
import { UserProfile, Theme } from '../types';
import { updateUserProfile } from '../lib/services';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { User, Target, Palette, Bell } from 'lucide-react';

interface SettingsProps {
  profile: UserProfile | null;
  userId: string;
  setProfile: (profile: UserProfile) => void;
}

export default function Settings({ profile, userId, setProfile }: SettingsProps) {
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [goals, setGoals] = useState(profile?.goals || '');
  const [theme, setTheme] = useState<Theme>(profile?.theme || 'light');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const updates = { displayName, goals, theme };
    await updateUserProfile(userId, updates);
    if (profile) {
      setProfile({ ...profile, ...updates });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your profile and preferences.</p>
      </header>

      <div className="grid gap-6 max-w-2xl">
        <Card className="glass border-none shadow-xl card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile
            </CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input 
                id="name" 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" value={profile?.email} disabled />
              <p className="text-[10px] text-muted-foreground italic">Email cannot be changed.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-xl card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Goals
            </CardTitle>
            <CardDescription>What are you working towards?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="goals">Your Goals</Label>
              <Textarea 
                id="goals" 
                placeholder="e.g., Study 6 hours daily, Run a marathon, Learn a new language..." 
                className="min-h-[100px]"
                value={goals}
                onChange={e => setGoals(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none shadow-xl card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how HabitFlow looks.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Switch between light and dark themes. Dark mode is recommended for focus.</p>
            </div>
            <Switch 
              checked={theme === 'dark'} 
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading} size="lg" className="w-full sm:w-auto">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
