import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Play, ArrowLeft, DollarSign, Pause, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Default reward settings for Adsterra ads
const AD_DURATION = 30; // seconds
const REWARD_AMOUNT = 0.01; // ₹ per ad view

export default function StartEarning() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [sessionEarnings, setSessionEarnings] = useState(0);
  const [adsWatchedSession, setAdsWatchedSession] = useState(0);
  const [adLoaded, setAdLoaded] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsTabActive(isVisible);
      
      if (!isVisible && isPlaying) {
        pauseAd();
        toast({
          title: 'Ad Paused',
          description: 'Please stay on this tab to continue earning.',
          variant: 'destructive',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, toast]);

  // Window blur detection
  useEffect(() => {
    const handleBlur = () => {
      if (isPlaying) {
        pauseAd();
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Load Adsterra ad script
  const loadAdScript = useCallback(() => {
    // Remove existing ad scripts
    const existingScripts = document.querySelectorAll('script[data-ad-script="adsterra"]');
    existingScripts.forEach(s => s.remove());

    const script = document.createElement('script');
    script.setAttribute('data-ad-script', 'adsterra');
    script.async = true;
    script.referrerPolicy = 'no-referrer-when-downgrade';
    script.src = '//adolescentzone.com/b.X/VlszdKG/l/0oY_WMce/fe/mr9/uxZ/UFlDkaPQTqYA3/NXD_I/0dNPDZY/tdN/jgct0-M/jQQP0LN/wS';
    
    script.onload = () => {
      setAdLoaded(true);
    };
    
    document.body.appendChild(script);
  }, []);

  const startAd = useCallback(() => {
    if (!isTabActive) return;
    
    // Load ad script when user clicks to start earning
    loadAdScript();
    
    setIsPlaying(true);
    setWatchTime(0);
    setEarnedAmount(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setWatchTime(prev => {
        const newTime = prev + 1;
        const progress = Math.min(newTime / AD_DURATION, 1);
        setEarnedAmount(REWARD_AMOUNT * progress);
        return newTime;
      });
    }, 1000);
  }, [isTabActive, loadAdScript]);

  const pauseAd = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const completeAd = useCallback(async () => {
    if (!user) return;

    pauseAd();

    const completed = watchTime >= AD_DURATION;
    const finalEarned = completed ? REWARD_AMOUNT : earnedAmount;

    // Save watch history - use a placeholder ad_id for Adsterra ads
    // First, check if we have a placeholder ad in the database
    let adId = 'adsterra-external';
    
    // Try to get or create a placeholder ad entry
    const { data: existingAd } = await supabase
      .from('ads')
      .select('id')
      .eq('title', 'Adsterra External Ad')
      .single();

    if (existingAd) {
      adId = existingAd.id;
    }

    // Only save if we have a valid ad_id (foreign key constraint)
    if (existingAd) {
      await supabase
        .from('watch_history')
        .insert({
          user_id: user.id,
          ad_id: adId,
          watch_time: watchTime,
          earned_amount: finalEarned,
          completed,
        });
    }

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
      setAdsWatchedSession(prev => prev + 1);
    }

    toast({
      title: completed ? 'Ad Completed!' : 'Ad Ended',
      description: `You earned ₹${finalEarned.toFixed(4)}`,
    });

    // Reset for next ad
    setWatchTime(0);
    setEarnedAmount(0);
    setAdLoaded(false);
  }, [user, watchTime, earnedAmount, pauseAd, toast]);

  // Auto-complete when timer ends
  useEffect(() => {
    if (watchTime >= AD_DURATION && isPlaying) {
      completeAd();
    }
  }, [watchTime, isPlaying, completeAd]);

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
                <span className="font-medium">{adsWatchedSession} <span className="hidden xs:inline">ads</span></span>
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
            <p className="text-destructive font-medium text-sm sm:text-base">Ad paused - Stay on this tab to earn</p>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
              Watch Ads & Earn
            </h1>
            <p className="text-muted-foreground">
              Watch for {AD_DURATION} seconds to earn <span className="text-gradient-gold font-semibold">₹{REWARD_AMOUNT.toFixed(4)}</span>
            </p>
          </div>

          {/* Ad Container */}
          <div 
            ref={adContainerRef}
            className="relative aspect-video bg-foreground/5 rounded-2xl overflow-hidden mb-6 shadow-elevated flex items-center justify-center"
          >
            {!isPlaying ? (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <Button size="lg" onClick={startAd} disabled={!isTabActive} className="gap-2">
                  <Play className="w-6 h-6" />
                  {watchTime > 0 ? 'Resume Watching' : 'Start Earning'}
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
                  <p className="text-lg font-medium text-foreground">Ad Playing...</p>
                  <p className="text-sm text-muted-foreground">Keep watching to earn rewards</p>
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
                  {formatTime(watchTime)} / {formatTime(AD_DURATION)}
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full gradient-primary transition-all duration-300"
                  style={{ width: `${Math.min((watchTime / AD_DURATION) * 100, 100)}%` }}
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
              {watchTime >= AD_DURATION && (
                <div className="flex items-center gap-2 text-primary">
                  <RefreshCw className="w-5 h-5" />
                  <span className="font-medium">Ready for next!</span>
                </div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
              {isPlaying ? (
                <Button variant="outline" className="flex-1" onClick={pauseAd}>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button className="flex-1" onClick={startAd} disabled={!isTabActive}>
                  <Play className="w-4 h-4 mr-2" />
                  {watchTime > 0 ? 'Resume' : 'Start'}
                </Button>
              )}
              <Button
                variant="secondary"
                className="flex-1"
                onClick={completeAd}
                disabled={watchTime === 0}
              >
                Collect & Next
              </Button>
            </div>
          </div>

          {/* Anti-cheat Notice */}
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
