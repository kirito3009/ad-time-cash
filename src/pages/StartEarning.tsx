import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Play, ArrowLeft, AlertCircle, CheckCircle, Clock, DollarSign, Pause, Eye, EyeOff, Sparkles, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageScriptBlock } from '@/components/PageScriptBlock';
import { ExternalVideoAd } from '@/components/ExternalVideoAd';

interface Ad {
  id: string;
  title: string;
  video_url: string;
  duration: number;
  reward_amount: number;
}

// External ad reward config
const EXTERNAL_AD_REWARD = 0.10; // ₹0.10 per external video ad
const EXTERNAL_AD_DURATION = 30; // 30 seconds

export default function StartEarning() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [sessionEarnings, setSessionEarnings] = useState(0);
  const [adsWatchedSession, setAdsWatchedSession] = useState(0);
  const [showExternalAd, setShowExternalAd] = useState(false);
  const [externalAdsWatched, setExternalAdsWatched] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchAds();
  }, []);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      setIsTabActive(isVisible);
      
      if (!isVisible && isPlaying) {
        pauseAd();
        toast({
          title: 'Video Paused',
          description: 'Please stay on this tab to continue earning.',
          variant: 'destructive',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

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

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('is_active', true);

    if (error) {
      return;
    }

    setAds(data || []);
    if (data && data.length > 0) {
      setCurrentAd(data[0]);
    }
  };

  const startAd = useCallback(() => {
    if (!currentAd || !isTabActive) return;
    
    setIsPlaying(true);
    setWatchTime(0);
    setEarnedAmount(0);
    
    if (videoRef.current) {
      videoRef.current.play();
    }

    // Start timer
    timerRef.current = setInterval(() => {
      setWatchTime(prev => {
        const newTime = prev + 1;
        if (currentAd) {
          const progress = Math.min(newTime / currentAd.duration, 1);
          setEarnedAmount(Number(currentAd.reward_amount) * progress);
        }
        return newTime;
      });
    }, 1000);
  }, [currentAd, isTabActive]);

  const pauseAd = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  const completeAd = useCallback(async () => {
    if (!currentAd || !user) return;

    pauseAd();

    const completed = watchTime >= currentAd.duration;
    const finalEarned = completed ? Number(currentAd.reward_amount) : earnedAmount;

    // Save watch history
    const { error } = await supabase
      .from('watch_history')
      .insert({
        user_id: user.id,
        ad_id: currentAd.id,
        watch_time: watchTime,
        earned_amount: finalEarned,
        completed,
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save your earnings. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setSessionEarnings(prev => prev + finalEarned);
    if (completed) {
      setAdsWatchedSession(prev => prev + 1);
    }

    toast({
      title: completed ? 'Ad Completed!' : 'Ad Ended',
      description: `You earned ₹${finalEarned.toFixed(4)}`,
    });

    // Move to next ad
    const currentIndex = ads.findIndex(ad => ad.id === currentAd.id);
    const nextIndex = (currentIndex + 1) % ads.length;
    setCurrentAd(ads[nextIndex]);
    setWatchTime(0);
    setEarnedAmount(0);
  }, [currentAd, user, watchTime, earnedAmount, ads, pauseAd, toast]);

  // Auto-complete when video ends
  useEffect(() => {
    if (currentAd && watchTime >= currentAd.duration && isPlaying) {
      completeAd();
    }
  }, [watchTime, currentAd, isPlaying, completeAd]);

  // Handle external ad completion
  const handleExternalAdComplete = async (earned: number) => {
    if (!user) return;
    
    // Save to watch history with a special external ad marker
    const { error } = await supabase
      .from('watch_history')
      .insert({
        user_id: user.id,
        ad_id: currentAd?.id || ads[0]?.id, // Use current or first ad as reference
        watch_time: EXTERNAL_AD_DURATION,
        earned_amount: earned,
        completed: earned >= EXTERNAL_AD_REWARD * 0.9, // 90% watched = complete
      });

    if (!error) {
      setSessionEarnings(prev => prev + earned);
      setExternalAdsWatched(prev => prev + 1);
      setAdsWatchedSession(prev => prev + 1);
      
      toast({
        title: 'Reward Collected! 🎉',
        description: `You earned ₹${earned.toFixed(4)} from the sponsored video`,
      });
    }
    
    setShowExternalAd(false);
  };

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
        {/* Bonus Ad CTA Card */}
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-foreground">Bonus Video Ads</h3>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent/20 text-accent">
                    +₹{EXTERNAL_AD_REWARD.toFixed(2)}/ad
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Watch sponsored videos for extra rewards!</p>
              </div>
            </div>
            <Button 
              onClick={() => setShowExternalAd(true)} 
              className="gradient-gold shadow-lg hover:scale-105 transition-transform w-full sm:w-auto"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Watch Bonus Ad
            </Button>
          </div>
          {externalAdsWatched > 0 && (
            <div className="mt-3 pt-3 border-t border-primary/10 text-xs text-muted-foreground">
              ✨ You've watched {externalAdsWatched} bonus ad{externalAdsWatched > 1 ? 's' : ''} this session
            </div>
          )}
        </div>

        {/* Tab Status Warning */}
        {!isTabActive && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2 sm:gap-3">
            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0" />
            <p className="text-destructive font-medium text-sm sm:text-base">Video paused - Stay on this tab to earn</p>
          </div>
        )}

        {/* No Ads State */}
        {ads.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-3">No Ads Available</h2>
            <p className="text-muted-foreground mb-6">Check back later for new earning opportunities!</p>
            <Button 
              onClick={() => setShowExternalAd(true)}
              className="gradient-gold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Watch Bonus Ad Instead
            </Button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Current Ad Info */}
            {currentAd && (
              <>
                <div className="mb-6 text-center">
                  <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
                    {currentAd.title}
                  </h1>
                  <p className="text-muted-foreground">
                    Watch the full video to earn <span className="text-gradient-gold font-semibold">₹{Number(currentAd.reward_amount).toFixed(4)}</span>
                  </p>
                </div>

                {/* Video Player */}
                <div className="relative aspect-video bg-foreground/5 rounded-2xl overflow-hidden mb-6 shadow-elevated">
                  <video
                    ref={videoRef}
                    src={currentAd.video_url}
                    className="w-full h-full object-contain"
                    playsInline
                    onEnded={completeAd}
                  />
                  
                  {/* Overlay when not playing */}
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
                      <Button size="xl" onClick={startAd} disabled={!isTabActive}>
                        <Play className="w-6 h-6 mr-2" />
                        {watchTime > 0 ? 'Resume' : 'Start Watching'}
                      </Button>
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
                        {formatTime(watchTime)} / {formatTime(currentAd.duration)}
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-primary transition-all duration-300"
                        style={{ width: `${Math.min((watchTime / currentAd.duration) * 100, 100)}%` }}
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
                    {watchTime >= currentAd.duration && (
                      <div className="flex items-center gap-2 text-primary">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Completed!</span>
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
                      Skip & Collect
                    </Button>
                  </div>
                </div>

                {/* Anti-cheat Notice */}
                <div className="mt-6 p-4 rounded-xl bg-muted/50 flex items-start gap-3">
                  <Eye className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Fair Play Notice</p>
                    <p>Video will pause if you switch tabs or minimize the window. Please watch ads fully to maximize your earnings.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Custom Ad Script Block */}
        <PageScriptBlock settingKey="watch_page_script" className="mt-8" />
      </main>

      {/* External Video Ad Modal */}
      <ExternalVideoAd
        isOpen={showExternalAd}
        onClose={() => setShowExternalAd(false)}
        onAdComplete={handleExternalAdComplete}
        rewardAmount={EXTERNAL_AD_REWARD}
        adDuration={EXTERNAL_AD_DURATION}
      />
    </div>
  );
}