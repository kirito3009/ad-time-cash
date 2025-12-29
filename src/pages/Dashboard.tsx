import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Play, Wallet, HelpCircle, BookOpen, LogOut, Clock, DollarSign, Film, TrendingUp, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AdDisplay } from '@/components/AdDisplay';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  total_earnings: number;
  total_watch_time: number;
  ads_watched: number;
}

interface TodayStats {
  watch_time: number;
  earnings: number;
}

export default function Dashboard() {
  const { user, loading, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [todayStats, setTodayStats] = useState<TodayStats>({ watch_time: 0, earnings: 0 });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTodayStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      return;
    }

    if (data) {
      setProfile(data);
    }
  };

  const fetchTodayStats = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('watch_history')
      .select('watch_time, earned_amount')
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    if (error) {
      return;
    }

    if (data) {
      const stats = data.reduce(
        (acc, item) => ({
          watch_time: acc.watch_time + (item.watch_time || 0),
          earnings: acc.earnings + Number(item.earned_amount || 0),
        }),
        { watch_time: 0, earnings: 0 }
      );
      setTodayStats(stats);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out successfully' });
    navigate('/');
  };

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Play className="w-5 h-5 text-primary-foreground fill-current" />
              </div>
              <span className="text-xl font-heading font-bold text-foreground">
                Ads<span className="text-gradient">Earn</span>
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-2">
                {profile?.avatar_url && (
                  <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
                )}
                <span className="hidden sm:block text-sm font-medium text-foreground">
                  {profile?.full_name || user?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
            Welcome back, <span className="text-gradient">{profile?.full_name?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="text-muted-foreground">Here's your earnings overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Film className="w-5 h-5" />}
            label="Total Ads Watched"
            value={profile?.ads_watched?.toString() || '0'}
            color="primary"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Today's Watch Time"
            value={formatWatchTime(todayStats.watch_time)}
            color="secondary"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Lifetime Watch Time"
            value={formatWatchTime(profile?.total_watch_time || 0)}
            color="accent"
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Total Earnings"
            value={`₹${(profile?.total_earnings || 0).toFixed(2)}`}
            color="gold"
            highlight
          />
        </div>

        {/* Today's Earnings Card */}
        <div className="mb-8 p-6 rounded-2xl bg-card shadow-card border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Today's Earnings</p>
              <p className="text-3xl font-heading font-bold text-gradient-gold">
                ₹{todayStats.earnings.toFixed(4)}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center shadow-gold">
              <DollarSign className="w-8 h-8 text-accent-foreground" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionButton
            icon={<Play className="w-6 h-6" />}
            label="Start Earning"
            description="Watch ads and earn"
            to="/start-earning"
            variant="primary"
          />
          <ActionButton
            icon={<Wallet className="w-6 h-6" />}
            label="Wallet"
            description="View & withdraw"
            to="/wallet"
            variant="gold"
          />
          <ActionButton
            icon={<HelpCircle className="w-6 h-6" />}
            label="Support"
            description="Get help"
            to="/support"
            variant="secondary"
          />
          <ActionButton
            icon={<BookOpen className="w-6 h-6" />}
            label="How It Works"
            description="Learn more"
            to="/how-it-works"
            variant="outline"
          />
        </div>

        {/* Sponsored Ad */}
        <AdDisplay placement="dashboard" variant="card" className="mt-8" />

        {/* Logout Button */}
        <div className="mt-8 pt-8 border-t border-border">
          <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, color, highlight }: { icon: React.ReactNode; label: string; value: string; color: string; highlight?: boolean }) {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent-foreground',
    gold: 'gradient-gold text-accent-foreground',
  };

  return (
    <div className={`p-5 rounded-2xl bg-card shadow-card border border-border ${highlight ? 'ring-2 ring-accent' : ''} animate-scale-in`}>
      <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-heading font-bold ${highlight ? 'text-gradient-gold' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}

function ActionButton({ icon, label, description, to, variant }: { icon: React.ReactNode; label: string; description: string; to: string; variant: string }) {
  const variantClasses: Record<string, string> = {
    primary: 'gradient-primary text-primary-foreground shadow-glow',
    gold: 'gradient-gold text-accent-foreground shadow-gold',
    secondary: 'gradient-blue text-secondary-foreground',
    outline: 'bg-card border-2 border-border text-foreground hover:bg-muted',
  };

  return (
    <Link
      to={to}
      className={`flex items-center gap-4 p-5 rounded-2xl ${variantClasses[variant]} transition-all duration-200 hover:scale-105 hover:shadow-elevated`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div>
        <p className="font-heading font-semibold">{label}</p>
        <p className="text-sm opacity-80">{description}</p>
      </div>
    </Link>
  );
}