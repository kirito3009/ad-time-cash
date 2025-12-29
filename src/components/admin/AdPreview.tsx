import { AdFormData } from './AdForm';
import { Play, Image, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface AdPreviewProps {
  ad: Partial<AdFormData>;
}

export function AdPreview({ ad }: AdPreviewProps) {
  const getTypeIcon = () => {
    switch (ad.ad_type) {
      case 'video':
        return <Play className="w-8 h-8" />;
      case 'image':
      case 'banner':
        return <Image className="w-8 h-8" />;
      case 'link':
        return <LinkIcon className="w-8 h-8" />;
      default:
        return <Play className="w-8 h-8" />;
    }
  };

  const renderPreview = () => {
    if (ad.ad_type === 'video' && ad.video_url) {
      return (
        <div className="aspect-video bg-foreground/5 rounded-lg overflow-hidden">
          <video
            src={ad.video_url}
            className="w-full h-full object-contain"
            controls
            muted
          />
        </div>
      );
    }

    if ((ad.ad_type === 'image' || ad.ad_type === 'banner') && ad.image_url) {
      return (
        <div className={`${ad.ad_type === 'banner' ? 'aspect-[4/1]' : 'aspect-video'} bg-foreground/5 rounded-lg overflow-hidden`}>
          <img
            src={ad.image_url}
            alt={ad.title || 'Ad preview'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '';
              e.currentTarget.alt = 'Failed to load image';
            }}
          />
        </div>
      );
    }

    if (ad.ad_type === 'link' && ad.link_url) {
      return (
        <div className="p-6 bg-foreground/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{ad.title || 'Untitled Ad'}</p>
              <p className="text-sm text-muted-foreground truncate">{ad.link_url}</p>
            </div>
          </div>
        </div>
      );
    }

    // Placeholder when no content
    return (
      <div className="aspect-video bg-foreground/5 rounded-lg flex flex-col items-center justify-center gap-3 text-muted-foreground">
        {getTypeIcon()}
        <p className="text-sm">No preview available</p>
        <p className="text-xs">Add a {ad.ad_type || 'video'} URL to see preview</p>
      </div>
    );
  };

  const placementLabels: Record<string, string> = {
    home: 'Home Page',
    dashboard: 'Dashboard',
    watch_page: 'Watch Page',
    wallet: 'Wallet Page',
    sidebar: 'Sidebar',
    popup: 'Popup',
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-heading font-semibold">Preview</h3>
      
      {renderPreview()}

      {/* Ad Info */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Title:</span>
          <span className="font-medium">{ad.title || 'Untitled'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type:</span>
          <span className="capitalize">{ad.ad_type || 'video'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Duration:</span>
          <span>{ad.duration || 30}s</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Reward:</span>
          <span className="text-primary font-medium">₹{(ad.reward_amount || 0).toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Priority:</span>
          <span>{ad.priority || 0}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-muted-foreground">Placements:</span>
          <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
            {(ad.placement || []).length > 0 ? (
              ad.placement?.map(p => (
                <span key={p} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                  {placementLabels[p] || p}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground italic">None selected</span>
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status:</span>
          <span className={ad.is_active ? 'text-primary' : 'text-muted-foreground'}>
            {ad.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
}
