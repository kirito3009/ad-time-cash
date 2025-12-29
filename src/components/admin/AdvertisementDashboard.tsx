import { useState } from 'react';
import { AdForm, AdFormData } from './AdForm';
import { AdPreview } from './AdPreview';
import { AdList } from './AdList';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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

interface AdvertisementDashboardProps {
  ads: Ad[];
  onRefresh: () => void;
}

export function AdvertisementDashboard({ ads, onRefresh }: AdvertisementDashboardProps) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [formData, setFormData] = useState<Partial<AdFormData>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAddAd = async (data: AdFormData) => {
    const { error } = await supabase.from('ads').insert({
      title: data.title,
      ad_type: data.ad_type,
      video_url: data.video_url || '',
      image_url: data.image_url || null,
      link_url: data.link_url || null,
      description: data.description || null,
      duration: data.duration,
      reward_amount: data.reward_amount,
      placement: data.placement,
      priority: data.priority,
      is_active: data.is_active,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to add ad: ' + error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Success', description: 'Ad added successfully' });
    setShowForm(false);
    setFormData({});
    onRefresh();
  };

  const handleUpdateAd = async (data: AdFormData) => {
    if (!editingAd) return;

    const { error } = await supabase
      .from('ads')
      .update({
        title: data.title,
        ad_type: data.ad_type,
        video_url: data.video_url || '',
        image_url: data.image_url || null,
        link_url: data.link_url || null,
        description: data.description || null,
        duration: data.duration,
        reward_amount: data.reward_amount,
        placement: data.placement,
        priority: data.priority,
        is_active: data.is_active,
      })
      .eq('id', editingAd.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update ad: ' + error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Success', description: 'Ad updated successfully' });
    setEditingAd(null);
    setFormData({});
    onRefresh();
  };

  const handleDeleteAd = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('ads').delete().eq('id', deleteId);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete ad', variant: 'destructive' });
      return;
    }

    toast({ title: 'Success', description: 'Ad deleted' });
    setDeleteId(null);
    onRefresh();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('ads').update({ is_active: !isActive }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update ad', variant: 'destructive' });
      return;
    }
    onRefresh();
  };

  const handleEditClick = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      id: ad.id,
      title: ad.title,
      ad_type: ad.ad_type as AdFormData['ad_type'],
      video_url: ad.video_url || '',
      image_url: ad.image_url || '',
      link_url: ad.link_url || '',
      description: ad.description || '',
      duration: ad.duration,
      reward_amount: ad.reward_amount,
      placement: ad.placement || [],
      priority: ad.priority,
      is_active: ad.is_active,
    });
    setShowForm(false);
  };

  const handleCancelEdit = () => {
    setEditingAd(null);
    setFormData({});
  };

  const handleCancelAdd = () => {
    setShowForm(false);
    setFormData({});
  };

  const isFormVisible = showForm || editingAd;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold">Advertisement Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Manage all your ads in one place. {ads.length} total ads.
          </p>
        </div>
        {!isFormVisible && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Ad
          </Button>
        )}
      </div>

      {/* Form Section */}
      {isFormVisible && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-card shadow-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading font-semibold">
                {editingAd ? 'Edit Ad' : 'Create New Ad'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={editingAd ? handleCancelEdit : handleCancelAdd}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <AdForm
              initialData={editingAd ? formData : undefined}
              onSubmit={editingAd ? handleUpdateAd : handleAddAd}
              onCancel={editingAd ? handleCancelEdit : handleCancelAdd}
              isEditing={!!editingAd}
            />
          </div>
          <div className="p-6 rounded-2xl bg-card shadow-card border border-border">
            <AdPreview ad={editingAd ? formData : formData} />
          </div>
        </div>
      )}

      {/* Ad List */}
      <div className="p-6 rounded-2xl bg-card shadow-card border border-border">
        <h3 className="text-lg font-heading font-semibold mb-4">All Ads ({ads.length})</h3>
        <AdList
          ads={ads}
          onEdit={handleEditClick}
          onDelete={(id) => setDeleteId(id)}
          onToggleActive={handleToggleActive}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ad</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this ad? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAd} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
