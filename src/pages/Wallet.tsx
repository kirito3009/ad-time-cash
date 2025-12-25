import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Wallet as WalletIcon, DollarSign, Clock, TrendingUp, Send, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  total_earnings: number;
  total_watch_time: number;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  processed_at: string | null;
}

export default function Wallet() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [minWithdrawal, setMinWithdrawal] = useState(100);
  const [todayEarnings, setTodayEarnings] = useState(0);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('total_earnings, total_watch_time')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
    }

    // Fetch withdrawals
    const { data: withdrawalData } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (withdrawalData) {
      setWithdrawals(withdrawalData);
    }

    // Fetch min withdrawal setting
    const { data: settingData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'min_withdrawal')
      .maybeSingle();

    if (settingData) {
      setMinWithdrawal(Number(settingData.value));
    }

    // Fetch today's earnings
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayData } = await supabase
      .from('watch_history')
      .select('earned_amount')
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    if (todayData) {
      const total = todayData.reduce((sum, item) => sum + Number(item.earned_amount), 0);
      setTodayEarnings(total);
    }
  };

  const pendingAmount = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + Number(w.amount), 0);

  const availableBalance = (profile?.total_earnings || 0) - pendingAmount;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = Number(withdrawAmount);
    
    if (amount < minWithdrawal) {
      toast({
        title: 'Minimum not met',
        description: `Minimum withdrawal amount is ₹${minWithdrawal}`,
        variant: 'destructive',
      });
      return;
    }

    if (amount > availableBalance) {
      toast({
        title: 'Insufficient balance',
        description: 'You don\'t have enough available balance',
        variant: 'destructive',
      });
      return;
    }

    if (!paymentMethod || !paymentDetails) {
      toast({
        title: 'Missing details',
        description: 'Please fill in all payment details',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('withdrawals')
      .insert({
        user_id: user!.id,
        amount,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit withdrawal request',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Request submitted!',
      description: 'Your withdrawal request is being processed',
    });

    setWithdrawAmount('');
    setPaymentMethod('');
    setPaymentDetails('');
    fetchData();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-accent" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-primary bg-primary/10';
      case 'rejected':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-accent-foreground bg-accent/20';
    }
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
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-8 flex items-center gap-3">
            <WalletIcon className="w-8 h-8 text-primary" />
            Your Wallet
          </h1>

          {/* Balance Cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="p-5 rounded-2xl bg-card shadow-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Today's Earnings</span>
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">₹{todayEarnings.toFixed(2)}</p>
            </div>

            <div className="p-5 rounded-2xl bg-card shadow-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Total Earnings</span>
              </div>
              <p className="text-2xl font-heading font-bold text-gradient-gold">₹{(profile?.total_earnings || 0).toFixed(2)}</p>
            </div>

            <div className="p-5 rounded-2xl bg-card shadow-card border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Pending Withdrawals</span>
              </div>
              <p className="text-2xl font-heading font-bold text-foreground">₹{pendingAmount.toFixed(2)}</p>
            </div>
          </div>

          {/* Withdrawal Form */}
          <div className="p-6 rounded-2xl bg-card shadow-card border border-border mb-8">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-2">Request Withdrawal</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Available balance: <span className="font-semibold text-primary">₹{availableBalance.toFixed(2)}</span>
              {' • '}Minimum withdrawal: ₹{minWithdrawal}
            </p>

            {availableBalance < minWithdrawal ? (
              <div className="p-4 rounded-xl bg-muted flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground" />
                <p className="text-muted-foreground">
                  You need ₹{(minWithdrawal - availableBalance).toFixed(2)} more to request a withdrawal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min={minWithdrawal}
                      max={availableBalance}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={`Min ₹${minWithdrawal}`}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Input
                      id="method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      placeholder="UPI / Bank Transfer / Paytm"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details">Payment Details</Label>
                  <Input
                    id="details"
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                    placeholder="UPI ID / Account Number / Phone Number"
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            )}
          </div>

          {/* Withdrawal History */}
          <div className="p-6 rounded-2xl bg-card shadow-card border border-border">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Withdrawal History</h2>
            
            {withdrawals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No withdrawal requests yet</p>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(withdrawal.status)}
                      <div>
                        <p className="font-medium text-foreground">₹{Number(withdrawal.amount).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {withdrawal.payment_method} • {new Date(withdrawal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}