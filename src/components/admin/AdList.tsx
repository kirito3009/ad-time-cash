import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Play, Image, Link as LinkIcon, Search, Eye, EyeOff } from 'lucide-react';

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
  is_active: boolean;
  created_at: string;
}

interface AdListProps {
  ads: Ad[];
  onEdit: (ad: Ad) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const PLACEMENT_LABELS: Record<string, string> = {
  home: 'Home',
  dashboard: 'Dashboard',
  watch_page: 'Watch',
  wallet: 'Wallet',
  sidebar: 'Sidebar',
  popup: 'Popup',
};

export function AdList({ ads, onEdit, onDelete, onToggleActive }: AdListProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || ad.ad_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && ad.is_active) || 
      (filterStatus === 'inactive' && !ad.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'image':
      case 'banner':
        return <Image className="w-4 h-4" />;
      case 'link':
        return <LinkIcon className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'image':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      case 'banner':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'link':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search ads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="banner">Banner</SelectItem>
            <SelectItem value="link">Link</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <span>Total: {ads.length}</span>
        <span>Active: {ads.filter(a => a.is_active).length}</span>
        <span>Showing: {filteredAds.length}</span>
      </div>

      {/* Ad List */}
      <div className="space-y-3">
        {filteredAds.map(ad => (
          <div
            key={ad.id}
            className="p-4 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="w-20 h-14 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {ad.ad_type === 'video' && ad.video_url ? (
                  <video src={ad.video_url} className="w-full h-full object-cover" muted />
                ) : (ad.ad_type === 'image' || ad.ad_type === 'banner') && ad.image_url ? (
                  <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-muted-foreground">{getTypeIcon(ad.ad_type)}</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{ad.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeColor(ad.ad_type)}`}>
                    {getTypeIcon(ad.ad_type)}
                    {ad.ad_type}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{ad.duration}s</span>
                  <span className="text-primary font-medium">₹{Number(ad.reward_amount).toFixed(4)}</span>
                  <span>Priority: {ad.priority}</span>
                </div>

                {/* Placements */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {(ad.placement || []).map(p => (
                    <span key={p} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                      {PLACEMENT_LABELS[p] || p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant={ad.is_active ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onToggleActive(ad.id, ad.is_active)}
                  className="gap-1"
                >
                  {ad.is_active ? (
                    <>
                      <Eye className="w-3 h-3" />
                      <span className="hidden sm:inline">Active</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span className="hidden sm:inline">Inactive</span>
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={() => onEdit(ad)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(ad.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredAds.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {ads.length === 0 ? (
              <p>No ads yet. Create your first ad above!</p>
            ) : (
              <p>No ads match your filters.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
