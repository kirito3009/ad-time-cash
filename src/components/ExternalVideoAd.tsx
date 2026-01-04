import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Play, Loader2, DollarSign, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExternalVideoAdProps {
  isOpen: boolean;
  onClose: () => void;
  onAdComplete: (earnedAmount: number) => void;
  rewardAmount: number;
  adDuration: number; // in seconds
}

export function ExternalVideoAd({ 
  isOpen, 
  onClose, 
  onAdComplete, 
  rewardAmount = 0.05,
  adDuration = 30 
}: ExternalVideoAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);

  // Load the Adsterra script when modal opens
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';
    setAdLoaded(false);
    setWatchTime(0);
    setIsWatching(false);
    setIsCompleted(false);
    setEarnedAmount(0);

    // Create and load the Adsterra script
    const script = document.createElement('script');
    script.src = 'https://pl28397048.effectivegatecpm.com/8e/f9/02/8ef902bcc134324c8ce6b84c6971a8a5.js';
    script.async = true;
    script.onload = () => {
      setAdLoaded(true);
      // Auto-start watching when ad loads
      startWatching();
    };
    script.onerror = () => {
      setAdLoaded(true); // Still set as loaded so user can see fallback
    };

    containerRef.current.appendChild(script);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen]);

  const startWatching = useCallback(() => {
    if (isWatching) return;
    
    setIsWatching(true);
    
    timerRef.current = setInterval(() => {
      setWatchTime(prev => {
        const newTime = prev + 1;
        const progress = Math.min(newTime / adDuration, 1);
        setEarnedAmount(rewardAmount * progress);
        
        // Check if completed
        if (newTime >= adDuration) {
          setIsCompleted(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
        }
        
        return newTime;
      });
    }, 1000);
  }, [isWatching, adDuration, rewardAmount]);

  // Handle tab visibility
  useEffect(() => {
    if (!isOpen) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isWatching && !isCompleted) {
        // Pause timer when tab is hidden
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setIsWatching(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isOpen, isWatching, isCompleted]);

  const handleCollect = () => {
    onAdComplete(earnedAmount);
    onClose();
  };

  const handleClose = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // If user watched some time, still give partial earnings
    if (watchTime > 0) {
      onAdComplete(earnedAmount);
    }
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((watchTime / adDuration) * 100, 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-card rounded-2xl shadow-elevated overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground">Sponsored Video</h3>
              <p className="text-xs text-muted-foreground">Watch to earn rewards</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Ad Container */}
        <div className="relative min-h-[300px] bg-foreground/5 flex items-center justify-center">
          {!adLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading ad...</p>
              </div>
            </div>
          )}
          
          {/* Adsterra script loads here */}
          <div 
            ref={containerRef} 
            className="w-full min-h-[280px] flex items-center justify-center"
          />
        </div>

        {/* Progress & Earnings Section */}
        <div className="p-4 bg-card border-t border-border">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Watch Progress</span>
              <span className="font-medium text-foreground">
                {formatTime(watchTime)} / {formatTime(adDuration)}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Earnings Display */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-accent/10 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Earning</p>
                <p className="text-lg font-heading font-bold text-gradient-gold">
                  ₹{earnedAmount.toFixed(4)}
                </p>
              </div>
            </div>
            {isCompleted && (
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium text-sm">Complete!</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!isWatching && !isCompleted && adLoaded && (
              <Button className="flex-1" onClick={startWatching}>
                <Play className="w-4 h-4 mr-2" />
                {watchTime > 0 ? 'Resume Watching' : 'Start Watching'}
              </Button>
            )}
            
            {isWatching && !isCompleted && (
              <div className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-primary/10 text-primary">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="font-medium">Watching...</span>
              </div>
            )}
            
            {isCompleted && (
              <Button className="flex-1 gradient-gold" onClick={handleCollect}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Collect ₹{earnedAmount.toFixed(4)}
              </Button>
            )}
            
            {watchTime > 0 && !isCompleted && (
              <Button variant="secondary" onClick={handleCollect}>
                Collect Early
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
