import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, FileText } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-foreground fill-current" />
              </div>
              <span className="font-heading font-bold text-foreground">AdsEarn</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto prose prose-gray dark:prose-invert">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground m-0">Terms & Conditions</h1>
          </div>
          <p className="text-muted-foreground">Last Updated: December 2024</p>

          <p>By using AdsEarn you agree to these terms.</p>

          <h2 className="font-heading">1. Platform Purpose</h2>
          <p>AdsEarn allows users to watch ads and earn rewards. Earnings depend on ad availability and platform revenue.</p>

          <h2 className="font-heading">2. No Guaranteed Income</h2>
          <p>Earnings are based on:</p>
          <ul>
            <li>Total ads available</li>
            <li>Time watched</li>
            <li>Website revenue</li>
            <li>Anti-cheat verification</li>
          </ul>
          <p><strong>We do not guarantee a fixed or minimum income.</strong></p>

          <h2 className="font-heading">3. Eligibility</h2>
          <p>Users must:</p>
          <ul>
            <li>Have 1 legitimate Google account</li>
            <li>Not use VPN or proxy to cheat</li>
            <li>Not use automation/bots/hacks</li>
          </ul>
          <p>Accounts violating rules may be suspended.</p>

          <h2 className="font-heading">4. Payout Policy</h2>
          <ul>
            <li>Minimum withdrawal: ₹100 (configurable)</li>
            <li>Payout method: UPI/Bank/Paytm/etc.</li>
            <li>Verification required for suspicious accounts</li>
            <li>Payout may take 3-7 business days</li>
          </ul>

          <h2 className="font-heading">5. Admin Rights</h2>
          <p>Admins can:</p>
          <ul>
            <li>Change earning percentages</li>
            <li>Update withdrawal requirements</li>
            <li>Suspend accounts for fraud</li>
            <li>Update policy anytime</li>
          </ul>

          <h2 className="font-heading">6. Responsibility</h2>
          <p>We are not responsible for:</p>
          <ul>
            <li>Ad content quality</li>
            <li>Network issues</li>
            <li>Third-party advertiser claims</li>
          </ul>

          <h2 className="font-heading">Disclaimer</h2>
          <p>AdsEarn is an earning support platform. It is not a job or guaranteed income source. Income depends on ad availability, advertisers, platform revenue, and user activity. We do not promise fixed daily/weekly income. If you do not agree, please do not use the platform.</p>
        </div>
      </main>
    </div>
  );
}