import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { AuthModal } from '@/components/AuthModal';
import { ArrowLeft, Play, LogIn, Eye, DollarSign, Wallet, CheckCircle, Shield, Clock, AlertTriangle } from 'lucide-react';

export default function HowItWorks() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to={user ? '/dashboard' : '/'}>
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
        <div className="max-w-3xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
              How <span className="text-gradient">AdsEarn</span> Works
            </h1>
            <p className="text-lg text-muted-foreground">
              A complete guide to earning with AdsEarn
            </p>
          </div>

          {/* What is AdsEarn */}
          <section className="mb-12">
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">What is AdsEarn?</h2>
            <p className="text-muted-foreground leading-relaxed">
              AdsEarn is a platform where you can earn real money by watching advertisements. We share our advertising revenue with our users based on their watch time. It's simple, transparent, and completely free to join.
            </p>
          </section>

          {/* Steps */}
          <section className="mb-12">
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">How to Start Earning</h2>
            <div className="space-y-4">
              <Step
                number={1}
                icon={<LogIn className="w-5 h-5" />}
                title="Create an Account"
                description="Sign up with your email and password. It's free and takes just seconds."
              />
              <Step
                number={2}
                icon={<Play className="w-5 h-5" />}
                title="Click 'Start Earning'"
                description="Head to the dashboard and click the Start Earning button to begin watching ads."
              />
              <Step
                number={3}
                icon={<Eye className="w-5 h-5" />}
                title="Watch Ads Completely"
                description="Watch advertisements fully. Your earnings increase as you watch more. Partial watches also count!"
              />
              <Step
                number={4}
                icon={<DollarSign className="w-5 h-5" />}
                title="Earnings Update Automatically"
                description="Your earnings are tracked in real-time. See exactly how much you've earned after each ad."
              />
              <Step
                number={5}
                icon={<Wallet className="w-5 h-5" />}
                title="Withdraw When Ready"
                description="Once you reach the minimum withdrawal amount, request a payout to your preferred payment method."
              />
            </div>
          </section>

          {/* Revenue Model */}
          <section className="mb-12 p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-4 flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-primary" />
              Revenue Sharing Model
            </h2>
            <p className="text-muted-foreground mb-4">
              We believe in fair compensation for your time. Here's how it works:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground"><strong>50% Revenue Share</strong> - We share half of our advertising revenue with users</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground"><strong>Watch Time Based</strong> - Earnings are calculated based on your total watch time</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground"><strong>Transparent Tracking</strong> - See your earnings update in real-time</span>
              </li>
            </ul>
          </section>

          {/* Rules */}
          <section className="mb-12">
            <h2 className="text-2xl font-heading font-semibold text-foreground mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-secondary" />
              Rules & Fair Play Policy
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-card shadow-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">Stay on the Page</h3>
                <p className="text-sm text-muted-foreground">Videos will pause if you switch tabs or minimize the window. This ensures fair earnings for active users.</p>
              </div>
              <div className="p-4 rounded-xl bg-card shadow-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">One Account Per Person</h3>
                <p className="text-sm text-muted-foreground">Multiple accounts or automated watching tools are not allowed and will result in account suspension.</p>
              </div>
              <div className="p-4 rounded-xl bg-card shadow-card border border-border">
                <h3 className="font-semibold text-foreground mb-2">No VPN or Proxy</h3>
                <p className="text-sm text-muted-foreground">Using VPNs or proxies to artificially increase earnings is prohibited.</p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="mb-12 p-6 rounded-2xl bg-accent/10 border border-accent/20">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-accent-foreground" />
              Important Disclaimer
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Earnings depend on ad availability, which varies based on advertiser demand and market conditions. AdsEarn does not guarantee a fixed or minimum income. This is a reward-sharing platform, not a job or guaranteed income source. Always watch ads genuinely to maintain a healthy platform for everyone.
            </p>
          </section>

          {/* CTA */}
          {!user && (
            <div className="text-center py-8 border-t border-border">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-4">Ready to Start Earning?</h2>
              <Button size="lg" onClick={() => setAuthModalOpen(true)}>
                <Play className="w-5 h-5 mr-2" />
                Get Started Now
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 AdsEarn. All rights reserved.</p>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}

function Step({ number, icon, title, description }: { number: number; icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-card shadow-card border border-border">
      <div className="flex-shrink-0 w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-primary">{icon}</span>
          <h3 className="font-heading font-semibold text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
