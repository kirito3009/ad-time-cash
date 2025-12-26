import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft, Play, Settings, Users, Film, DollarSign, MessageCircle,
  Plus, Trash2, Save, CheckCircle, XCircle, Clock, Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

// Validation schema for app settings
const settingsSchema = z.object({
  revenue_share_percent: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 100;
  }, { message: 'Revenue share must be between 0 and 100' }),
  min_withdrawal: z.string().refine(val => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0 && num <= 100000;
  }, { message: 'Minimum withdrawal must be between 0 and 100000' }),
  landing_text: z.string().max(5000, { message: 'Landing text must be less than 5000 characters' }),
  how_it_works_content: z.string().max(10000, { message: 'How it works content must be less than 10000 characters' }),
});

interface Profile {
  id: string;
  full_name: string | null;
  total_earnings: number;
  total_watch_time: number;
  ads_watched: number;
  created_at: string;
  email?: string; // Fetched separately via RPC for admins
}

interface Ad {
  id: string;
  title: string;
  video_url: string;
  duration: number;
  reward_amount: number;
  is_active: boolean;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  payment_method: string | null;
  payment_details: string | null;
  created_at: string | null;
  user_id: string;
  user_email?: string;
  user_name?: string;
  decrypted_method?: string;
  decrypted_details?: string;
}

interface SupportMessage {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  sender_name?: string;
  sender_email?: string;
}

interface AppSettings {
  revenue_share_percent: string;
  min_withdrawal: string;
  landing_text: string;
  how_it_works_content: string;
}

export default function Admin() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    revenue_share_percent: '50',
    min_withdrawal: '100',
    landing_text: '',
    how_it_works_content: '',
  });

  const [newAd, setNewAd] = useState({ title: '', video_url: '', duration: 30, reward_amount: 0.01 });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/dashboard');
    }
  }, [user, loading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    // Fetch profiles (email is no longer in profiles table for security)
    const { data: profilesData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    
    if (profilesData) {
      // Fetch emails for each user via secure RPC function (admin only)
      const profilesWithEmails = await Promise.all(
        profilesData.map(async (profile) => {
          const { data: email } = await supabase.rpc('get_user_email', { _user_id: profile.id });
          return { ...profile, email: email || 'N/A' };
        })
      );
      setProfiles(profilesWithEmails);
    }

    // Fetch ads
    const { data: adsData } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
    if (adsData) setAds(adsData);

    // Fetch withdrawals
    const { data: withdrawalsData } = await supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (withdrawalsData) {
      // Fetch profile names and emails for each withdrawal via secure RPC
      const userIds = [...new Set(withdrawalsData.map(w => w.user_id))];
      const { data: profilesForWithdrawals } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      const profileMap = new Map(profilesForWithdrawals?.map(p => [p.id, p]) || []);
      
      // Fetch emails via secure RPC
      const emailMap = new Map<string, string>();
      await Promise.all(
        userIds.map(async (userId) => {
          const { data: email } = await supabase.rpc('get_user_email', { _user_id: userId });
          emailMap.set(userId, email || 'N/A');
        })
      );
      
      const withdrawalsWithProfiles = withdrawalsData.map(w => ({
        ...w,
        user_email: emailMap.get(w.user_id),
        user_name: profileMap.get(w.user_id)?.full_name,
      }));
      
      setWithdrawals(withdrawalsWithProfiles);
    }

    // Fetch messages and get sender info via secure RPC
    const { data: messagesData } = await supabase.from('support_messages').select('*').order('created_at', { ascending: false });
    if (messagesData) {
      // Fetch sender info for each message via secure RPC function
      const messagesWithSenderInfo = await Promise.all(
        messagesData.map(async (message) => {
          const { data: senderInfo } = await supabase.rpc('get_support_message_sender_info', { _user_id: message.user_id });
          const sender = senderInfo?.[0];
          return {
            ...message,
            sender_name: sender?.full_name || 'Unknown User',
            sender_email: sender?.email || 'N/A',
          };
        })
      );
      setMessages(messagesWithSenderInfo);
    }

    // Fetch settings
    const { data: settingsData } = await supabase.from('app_settings').select('key, value');
    if (settingsData) {
      const settingsObj: Record<string, string> = {};
      settingsData.forEach(s => { settingsObj[s.key] = s.value; });
      setSettings(prev => ({ ...prev, ...settingsObj }));
    }
  };

  const handleAddAd = async () => {
    if (!newAd.title || !newAd.video_url) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('ads').insert(newAd);
    if (error) {
      toast({ title: 'Error', description: 'Failed to add ad', variant: 'destructive' });
      return;
    }

    toast({ title: 'Success', description: 'Ad added successfully' });
    setNewAd({ title: '', video_url: '', duration: 30, reward_amount: 0.01 });
    fetchAllData();
  };

  const handleDeleteAd = async (id: string) => {
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete ad', variant: 'destructive' });
      return;
    }
    toast({ title: 'Success', description: 'Ad deleted' });
    fetchAllData();
  };

  const handleToggleAd = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from('ads').update({ is_active: !isActive }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update ad', variant: 'destructive' });
      return;
    }
    fetchAllData();
  };

  const handleWithdrawalStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('withdrawals')
      .update({ status, processed_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: 'Failed to update withdrawal', variant: 'destructive' });
      return;
    }
    toast({ title: 'Success', description: `Withdrawal ${status}` });
    fetchAllData();
  };

  const handleDecryptPayment = async (withdrawal: Withdrawal) => {
    try {
      // Decrypt payment method
      const { data: methodData, error: methodError } = await supabase.rpc('decrypt_payment_details', {
        encrypted_data: withdrawal.payment_method
      });

      // Decrypt payment details
      const { data: detailsData, error: detailsError } = await supabase.rpc('decrypt_payment_details', {
        encrypted_data: withdrawal.payment_details
      });

      if (methodError || detailsError) {
        toast({ title: 'Error', description: 'Failed to decrypt payment details', variant: 'destructive' });
        return;
      }

      // Update the withdrawal in state with decrypted values
      setWithdrawals(prev => prev.map(w => 
        w.id === withdrawal.id 
          ? { ...w, decrypted_method: methodData, decrypted_details: detailsData }
          : w
      ));

      toast({ title: 'Decrypted', description: 'Payment details decrypted successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to decrypt payment details', variant: 'destructive' });
    }
  };

  const handleMessageStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('support_messages').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update message', variant: 'destructive' });
      return;
    }
    fetchAllData();
  };

  const handleSaveSettings = async () => {
    // Validate settings before saving
    const validationResult = settingsSchema.safeParse(settings);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => e.message).join(', ');
      toast({ title: 'Validation Error', description: errors, variant: 'destructive' });
      return;
    }

    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('app_settings').update({ value, updated_at: new Date().toISOString() }).eq('key', key);
    }
    toast({ title: 'Success', description: 'Settings saved' });
  };

  if (loading || !isAdmin) {
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Play className="w-4 h-4 text-primary-foreground fill-current" />
                </div>
                <span className="font-heading font-bold text-foreground">Admin Panel</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="ads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="ads" className="flex items-center gap-2 py-3">
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 py-3">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2 py-3">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Withdrawals</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2 py-3">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 py-3">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Ads Tab */}
          <TabsContent value="ads" className="space-y-6">
            <div className="p-6 rounded-2xl bg-card shadow-card border border-border">
              <h2 className="text-xl font-heading font-semibold mb-4">Add New Ad</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={newAd.title} onChange={e => setNewAd(prev => ({ ...prev, title: e.target.value }))} placeholder="Ad title" />
                </div>
                <div className="space-y-2">
                  <Label>Video URL</Label>
                  <Input value={newAd.video_url} onChange={e => setNewAd(prev => ({ ...prev, video_url: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Duration (seconds)</Label>
                  <Input type="number" value={newAd.duration} onChange={e => setNewAd(prev => ({ ...prev, duration: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Reward (₹)</Label>
                  <Input type="number" step="0.01" value={newAd.reward_amount} onChange={e => setNewAd(prev => ({ ...prev, reward_amount: Number(e.target.value) }))} />
                </div>
              </div>
              <Button onClick={handleAddAd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Ad
              </Button>
            </div>

            <div className="p-6 rounded-2xl bg-card shadow-card border border-border">
              <h2 className="text-xl font-heading font-semibold mb-4">Manage Ads ({ads.length})</h2>
              <div className="space-y-3">
                {ads.map(ad => (
                  <div key={ad.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                    <div>
                      <p className="font-medium">{ad.title}</p>
                      <p className="text-sm text-muted-foreground">{ad.duration}s • ₹{Number(ad.reward_amount).toFixed(4)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant={ad.is_active ? 'default' : 'outline'} size="sm" onClick={() => handleToggleAd(ad.id, ad.is_active)}>
                        {ad.is_active ? 'Active' : 'Inactive'}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAd(ad.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {ads.length === 0 && <p className="text-muted-foreground text-center py-8">No ads yet</p>}
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="p-6 rounded-2xl bg-card shadow-card border border-border">
              <h2 className="text-xl font-heading font-semibold mb-4">Users ({profiles.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border">
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Ads Watched</th>
                      <th className="pb-3 font-medium">Watch Time</th>
                      <th className="pb-3 font-medium">Earnings</th>
                      <th className="pb-3 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {profiles.map(profile => (
                      <tr key={profile.id} className="border-b border-border/50">
                        <td className="py-3">
                          <p className="font-medium">{profile.full_name || 'N/A'}</p>
                          <p className="text-muted-foreground">{profile.email}</p>
                        </td>
                        <td className="py-3">{profile.ads_watched}</td>
                        <td className="py-3">{Math.floor((profile.total_watch_time || 0) / 60)}m</td>
                        <td className="py-3 font-medium text-primary">₹{Number(profile.total_earnings || 0).toFixed(2)}</td>
                        <td className="py-3 text-muted-foreground">{new Date(profile.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <div className="p-6 rounded-2xl bg-card shadow-card border border-border">
              <h2 className="text-xl font-heading font-semibold mb-4">Withdrawal Requests</h2>
              <div className="space-y-3">
                {withdrawals.map(w => (
                  <div key={w.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/50">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">₹{Number(w.amount).toFixed(2)}</p>
                        {w.decrypted_method ? (
                          <span className="text-sm text-primary">via {w.decrypted_method}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">via [encrypted]</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {w.user_email || 'Unknown'} • {w.decrypted_details || '[encrypted]'}
                      </p>
                      <p className="text-xs text-muted-foreground">{w.created_at ? new Date(w.created_at).toLocaleString() : 'N/A'}</p>
                      {!w.decrypted_method && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => handleDecryptPayment(w)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Decrypt Payment Info
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {w.status === 'pending' ? (
                        <>
                          <Button size="sm" onClick={() => handleWithdrawalStatus(w.id, 'approved')}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleWithdrawalStatus(w.id, 'rejected')}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${w.status === 'approved' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                          {w.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {withdrawals.length === 0 && <p className="text-muted-foreground text-center py-8">No withdrawal requests</p>}
              </div>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="p-6 rounded-2xl bg-card shadow-card border border-border">
              <h2 className="text-xl font-heading font-semibold mb-4">Support Messages</h2>
              <div className="space-y-3">
                {messages.map(m => (
                  <div key={m.id} className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <p className="font-medium">{m.subject}</p>
                        <p className="text-sm text-muted-foreground">{m.sender_name} • {m.sender_email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {m.status === 'unread' && (
                          <Button size="sm" variant="outline" onClick={() => handleMessageStatus(m.id, 'read')}>
                            <Eye className="w-4 h-4 mr-1" />
                            Mark Read
                          </Button>
                        )}
                        {m.status !== 'resolved' && (
                          <Button size="sm" onClick={() => handleMessageStatus(m.id, 'resolved')}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{m.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(m.created_at).toLocaleString()}</p>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-muted-foreground text-center py-8">No messages</p>}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="p-6 rounded-2xl bg-card shadow-card border border-border">
              <h2 className="text-xl font-heading font-semibold mb-6">App Settings</h2>
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Revenue Share (%)</Label>
                    <Input
                      type="number"
                      value={settings.revenue_share_percent}
                      onChange={e => setSettings(prev => ({ ...prev, revenue_share_percent: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Withdrawal (₹)</Label>
                    <Input
                      type="number"
                      value={settings.min_withdrawal}
                      onChange={e => setSettings(prev => ({ ...prev, min_withdrawal: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Landing Page Text</Label>
                  <Textarea
                    value={settings.landing_text}
                    onChange={e => setSettings(prev => ({ ...prev, landing_text: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>How It Works Content</Label>
                  <Textarea
                    value={settings.how_it_works_content}
                    onChange={e => setSettings(prev => ({ ...prev, how_it_works_content: e.target.value }))}
                    rows={5}
                  />
                </div>
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}