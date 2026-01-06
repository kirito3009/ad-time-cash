import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Play, ArrowLeft, DollarSign, Pause, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Default reward settings
const EARN_DURATION = 30; // seconds
const REWARD_AMOUNT = 0.01; // ₹ per session

export default function StartEarning() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [sessionEarnings, setSessionEarnings] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const pauseEarning = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsTabActive(isVisible);
      
      if (!isVisible && isPlaying) {
        pauseEarning();
        toast({
          title: 'Paused',
          description: 'Please stay on this tab to continue earning.',
          variant: 'destructive',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, toast, pauseEarning]);

  // Window blur detection
  useEffect(() => {
    const handleBlur = () => {
      if (isPlaying) {
        pauseEarning();
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isPlaying, pauseEarning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startEarning = useCallback(() => {
    if (!isTabActive) return;
    
    setIsPlaying(true);
    setWatchTime(0);
    setEarnedAmount(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setWatchTime(prev => {
        const newTime = prev + 1;
        const progress = Math.min(newTime / EARN_DURATION, 1);
        setEarnedAmount(REWARD_AMOUNT * progress);
        return newTime;
      });
    }, 1000);
  }, [isTabActive]);

  const completeEarning = useCallback(async () => {
    if (!user) return;

    pauseEarning();

    const completed = watchTime >= EARN_DURATION;
    const finalEarned = completed ? REWARD_AMOUNT : earnedAmount;

    // Update profile earnings directly
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_earnings, total_watch_time, ads_watched')
      .eq('id', user.id)
      .single();

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          total_earnings: (Number(profile.total_earnings) || 0) + finalEarned,
          total_watch_time: (Number(profile.total_watch_time) || 0) + watchTime,
          ads_watched: (Number(profile.ads_watched) || 0) + (completed ? 1 : 0),
        })
        .eq('id', user.id);
    }

    setSessionEarnings(prev => prev + finalEarned);
    if (completed) {
      setSessionsCompleted(prev => prev + 1);
    }

    toast({
      title: completed ? 'Completed!' : 'Session Ended',
      description: `You earned ₹${finalEarned.toFixed(4)}`,
    });

    // Reset for next session
    setWatchTime(0);
    setEarnedAmount(0);
  }, [user, watchTime, earnedAmount, pauseEarning, toast]);

  // Auto-complete when timer ends
  useEffect(() => {
    if (watchTime >= EARN_DURATION && isPlaying) {
      completeEarning();
    }
  }, [watchTime, isPlaying, completeEarning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm px-2 sm:px-3">
              <Link to="/dashboard">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                <span className="font-medium">₹{sessionEarnings.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Play className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <span className="font-medium">{sessionsCompleted} <span className="hidden xs:inline">sessions</span></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Tab Status Warning */}
        {!isTabActive && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 sm:gap-3">
            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0" />
            <p className="text-destructive font-medium text-sm sm:text-base">Paused - Stay on this tab to earn</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
              Start Earning
            </h1>
            <p className="text-muted-foreground">
              Stay for {EARN_DURATION} seconds to earn <span className="text-gradient-gold font-semibold">₹{REWARD_AMOUNT.toFixed(4)}</span>
            </p>
          </div>

          {/* Earning Container */}
          <div className="relative aspect-video bg-foreground/5 rounded-2xl overflow-hidden mb-6 shadow-elevated flex items-center justify-center">
            {!isPlaying ? (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Button size="lg" onClick={startEarning} disabled={!isTabActive} className="gap-2">
                  <Play className="w-6 h-6" />
                  {watchTime > 0 ? 'Resume' : 'Start Earning'}
                </Button>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="text-center">
                  <div className="animate-pulse mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                      <Eye className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <p className="text-lg font-medium text-foreground">Earning in Progress...</p>
                  <p className="text-sm text-muted-foreground">Keep this tab active to earn rewards</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress & Controls */}
          <div className="p-6 rounded-2xl bg-card shadow-card border border-border">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {formatTime(watchTime)} / {formatTime(EARN_DURATION)}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary transition-all duration-300"
                  style={{ width: `${Math.min((watchTime / EARN_DURATION) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Earnings Display */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-accent/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Earnings</p>
                  <p className="text-xl font-heading font-bold text-gradient-gold">
                    ₹{earnedAmount.toFixed(4)}
                  </p>
                </div>
              </div>
              {watchTime >= EARN_DURATION && (
                <div className="flex items-center gap-2 text-primary">
                  <RefreshCw className="w-5 h-5" />
                  <span className="font-medium">Ready for next!</span>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
              {isPlaying ? (
                <Button variant="outline" className="flex-1" onClick={pauseEarning}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button className="flex-1" onClick={startEarning} disabled={!isTabActive}>
                  <Play className="w-4 h-4 mr-2" />
                  {watchTime > 0 ? 'Resume' : 'Start'}
                </Button>
              )}
              <Button
                variant="secondary"
                className="flex-1"
                onClick={completeEarning}
                disabled={watchTime === 0}
              >
                Collect & Next
              </Button>
            </div>
          </div>

          {/* Fair Play Notice */}
          <div className="mt-6 p-4 rounded-xl bg-muted/50 flex items-start gap-3">
            <Eye className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Fair Play Notice</p>
              <p>Timer will pause if you switch tabs or minimize the window. Please stay on this page to maximize your earnings.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
