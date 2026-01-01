import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, X } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  ad_type: string;
  video_url: string;
  image_url: string | null;
  link_url: string | null;
  description: string | null;
  duration: number;
  reward_amount: number;
  placement: string[];
  priority: number;
}

interface AdDisplayProps {
  placement: 'home' | 'dashboard' | 'watch_page' | 'wallet' | 'sidebar' | 'popup';
  variant?: 'banner' | 'card' | 'inline' | 'popup';
  className?: string;
  maxAds?: number;
  onClose?: () => void;
}

export function AdDisplay({ placement, variant = 'card', className = '', maxAds = 1, onClose }: AdDisplayProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiddenAds, setHiddenAds] = useState<Set<string>>(new Set());

  const hideAd = (adId: string) => {
    setHiddenAds(prev => new Set([...prev, adId]));
  };

  const visibleAds = ads.filter(ad => !hiddenAds.has(ad.id));

  useEffect(() => {
    fetchAds();
  }, [placement]);

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .contains('placement', [placement])
      .order('priority', { ascending: false })
      .limit(maxAds);

    if (error) {
      console.error('Error fetching ads:', error);
      setLoading(false);
      return;
    }

    setAds(data || []);
    setLoading(false);
  };

  if (loading || visibleAds.length === 0) {
    return null;
  }

  const handleAdClick = (ad: Ad) => {
    if (ad.link_url) {
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderAd = (ad: Ad) => {
    const isClickable = !!ad.link_url;
    
    if (ad.ad_type === 'video') {
      return (
        <div className="relative aspect-video bg-foreground/5 rounded-lg overflow-hidden">
          <video
            src={ad.video_url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
          {ad.description && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm">{ad.description}</p>
            </div>
          )}
        </div>
      );
    }

    if (ad.ad_type === 'image' && ad.image_url) {
      return (
        <div
          className={`relative overflow-hidden rounded-lg ${isClickable ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
          onClick={() => handleAdClick(ad)}
        >
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-auto object-cover"
          />
          {ad.description && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-sm">{ad.description}</p>
            </div>
          )}
          {isClickable && (
            <div className="absolute top-2 right-2">
              <ExternalLink className="w-4 h-4 text-white drop-shadow-md" />
            </div>
          )}
        </div>
      );
    }

    if (ad.ad_type === 'banner' && ad.image_url) {
      return (
        <div
          className={`relative w-full overflow-hidden rounded-lg ${isClickable ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
          onClick={() => handleAdClick(ad)}
        >
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-auto object-cover"
          />
          {isClickable && (
            <div className="absolute top-2 right-2">
              <ExternalLink className="w-4 h-4 text-white drop-shadow-md" />
            </div>
          )}
        </div>
      );
    }

    if (ad.ad_type === 'link') {
      return (
        <div
          className="p-4 bg-card rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => handleAdClick(ad)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{ad.title}</p>
              {ad.description && (
                <p className="text-sm text-muted-foreground truncate">{ad.description}</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Close button component for ads
  const CloseButton = ({ adId }: { adId: string }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        hideAd(adId);
      }}
      className="absolute top-1 right-1 z-10 w-5 h-5 flex items-center justify-center bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
      aria-label="Close ad"
    >
      <X className="w-3 h-3" />
    </button>
  );

  // Banner variant - full width horizontal
  if (variant === 'banner') {
    return (
      <div className={`w-full ${className}`}>
        {visibleAds.map(ad => (
          <div key={ad.id} className="relative">
            <CloseButton adId={ad.id} />
            {renderAd(ad)}
            <span className="absolute top-1 left-8 px-1.5 py-0.5 bg-black/50 text-white text-[10px] rounded">
              Ad
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Popup variant - modal-like with close button
  if (variant === 'popup') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className={`relative max-w-lg w-full bg-card rounded-2xl shadow-elevated overflow-hidden ${className}`}>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors"
            aria-label="Close ad"
          >
            <X className="w-4 h-4" />
          </button>
          {visibleAds.map(ad => (
            <div key={ad.id}>
              {renderAd(ad)}
            </div>
          ))}
          <div className="p-4 text-center">
            <span className="text-xs text-muted-foreground">Sponsored</span>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar variant - vertical stack
  if (variant === 'inline') {
    return (
      <div className={`space-y-3 ${className}`}>
        {visibleAds.map(ad => (
          <div key={ad.id} className="relative">
            <CloseButton adId={ad.id} />
            {renderAd(ad)}
            <span className="absolute top-1 left-8 px-1.5 py-0.5 bg-black/50 text-white text-[10px] rounded">
              Ad
            </span>
          </div>
        ))}
      </div>
    );
  }

  // Default card variant
  return (
    <div className={`p-4 rounded-2xl bg-card/50 border border-border ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Sponsored</span>
      </div>
      <div className="space-y-3">
        {visibleAds.map(ad => (
          <div key={ad.id} className="relative">
            <CloseButton adId={ad.id} />
            {renderAd(ad)}
          </div>
        ))}
      </div>
    </div>
  );
}
