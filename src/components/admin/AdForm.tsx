import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Save, X } from 'lucide-react';
import { z } from 'zod';

const AD_TYPES = [
  { value: 'video', label: 'Video Ad' },
  { value: 'image', label: 'Image Ad' },
  { value: 'banner', label: 'Banner Ad' },
  { value: 'link', label: 'Link Ad' },
];

const PLACEMENTS = [
  { value: 'home', label: 'Home Page' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'watch_page', label: 'Watch Page' },
  { value: 'wallet', label: 'Wallet Page' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'popup', label: 'Popup' },
];

const adSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  ad_type: z.enum(['video', 'image', 'banner', 'link']),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  link_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  duration: z.number().min(1, 'Duration must be at least 1 second').max(300, 'Duration must be less than 300 seconds'),
  reward_amount: z.number().min(0, 'Reward must be positive').max(1000, 'Reward must be less than 1000'),
  placement: z.array(z.string()).min(1, 'Select at least one placement'),
  priority: z.number().min(0).max(100),
});

export interface AdFormData {
  id?: string;
  title: string;
  ad_type: 'video' | 'image' | 'banner' | 'link';
  video_url: string;
  image_url: string;
  link_url: string;
  description: string;
  duration: number;
  reward_amount: number;
  placement: string[];
  priority: number;
  is_active: boolean;
}

interface AdFormProps {
  initialData?: Partial<AdFormData>;
  onSubmit: (data: AdFormData) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export function AdForm({ initialData, onSubmit, onCancel, isEditing = false }: AdFormProps) {
  const [formData, setFormData] = useState<AdFormData>({
    title: '',
    ad_type: 'video',
    video_url: '',
    image_url: '',
    link_url: '',
    description: '',
    duration: 30,
    reward_amount: 0.01,
    placement: [],
    priority: 0,
    is_active: true,
    ...initialData,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    try {
      adSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Type-specific validation
    if (formData.ad_type === 'video' && !formData.video_url) {
      setErrors({ video_url: 'Video URL is required for video ads' });
      return;
    }
    if ((formData.ad_type === 'image' || formData.ad_type === 'banner') && !formData.image_url) {
      setErrors({ image_url: 'Image URL is required for image/banner ads' });
      return;
    }
    if (formData.ad_type === 'link' && !formData.link_url) {
      setErrors({ link_url: 'Link URL is required for link ads' });
      return;
    }

    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlacementChange = (placement: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      placement: checked
        ? [...prev.placement, placement]
        : prev.placement.filter(p => p !== placement),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Ad Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter ad title"
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
        </div>

        {/* Ad Type */}
        <div className="space-y-2">
          <Label>Ad Type *</Label>
          <Select
            value={formData.ad_type}
            onValueChange={(value: AdFormData['ad_type']) => setFormData(prev => ({ ...prev, ad_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AD_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Optional description for this ad"
          rows={2}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      {/* URL fields based on ad type */}
      <div className="grid sm:grid-cols-2 gap-4">
        {(formData.ad_type === 'video') && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="video_url">Video URL *</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={e => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
              placeholder="https://example.com/video.mp4"
              className={errors.video_url ? 'border-destructive' : ''}
            />
            {errors.video_url && <p className="text-xs text-destructive">{errors.video_url}</p>}
          </div>
        )}

        {(formData.ad_type === 'image' || formData.ad_type === 'banner') && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="image_url">Image URL *</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={e => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className={errors.image_url ? 'border-destructive' : ''}
            />
            {errors.image_url && <p className="text-xs text-destructive">{errors.image_url}</p>}
          </div>
        )}

        {/* Link URL (for all types except video) */}
        {formData.ad_type !== 'video' && (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="link_url">
              {formData.ad_type === 'link' ? 'Link URL *' : 'Click-through URL'}
            </Label>
            <Input
              id="link_url"
              value={formData.link_url}
              onChange={e => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
              placeholder="https://example.com"
              className={errors.link_url ? 'border-destructive' : ''}
            />
            {errors.link_url && <p className="text-xs text-destructive">{errors.link_url}</p>}
          </div>
        )}
      </div>

      {/* Duration and Reward */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={e => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
            min={1}
            max={300}
          />
          {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="reward_amount">Reward Amount (₹)</Label>
          <Input
            id="reward_amount"
            type="number"
            step="0.0001"
            value={formData.reward_amount}
            onChange={e => setFormData(prev => ({ ...prev, reward_amount: Number(e.target.value) }))}
            min={0}
          />
          {errors.reward_amount && <p className="text-xs text-destructive">{errors.reward_amount}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority (0-100)</Label>
          <Input
            id="priority"
            type="number"
            value={formData.priority}
            onChange={e => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
            min={0}
            max={100}
          />
          <p className="text-xs text-muted-foreground">Higher = shown first</p>
        </div>
      </div>

      {/* Placements */}
      <div className="space-y-3">
        <Label>Display Locations *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PLACEMENTS.map(placement => (
            <div key={placement.value} className="flex items-center space-x-2">
              <Checkbox
                id={`placement-${placement.value}`}
                checked={formData.placement.includes(placement.value)}
                onCheckedChange={(checked) => handlePlacementChange(placement.value, !!checked)}
              />
              <Label htmlFor={`placement-${placement.value}`} className="text-sm font-normal cursor-pointer">
                {placement.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.placement && <p className="text-xs text-destructive">{errors.placement}</p>}
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: !!checked }))}
        />
        <Label htmlFor="is_active" className="font-normal cursor-pointer">
          Active (show this ad on the website)
        </Label>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
          ) : isEditing ? (
            <Save className="w-4 h-4 mr-2" />
          ) : (
            <Plus className="w-4 h-4 mr-2" />
          )}
          {isEditing ? 'Update Ad' : 'Add Ad'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
