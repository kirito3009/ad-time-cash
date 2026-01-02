import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { AuthModal } from '@/components/AuthModal';
import { Play, TrendingUp, Shield, Clock, DollarSign, Users, Mail } from 'lucide-react';
import { AdDisplay } from '@/components/AdDisplay';
import { PageScriptBlock } from '@/components/PageScriptBlock';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <nav className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground fill-current" />
              </div>
              <span className="text-xl sm:text-2xl font-heading font-bold text-foreground">
                Ads<span className="text-gradient">Earn</span>
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/how-it-works" className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors font-medium hidden xs:block">
                How it Works
              </Link>
              <Button size="sm" onClick={() => setAuthModalOpen(true)} className="text-xs sm:text-sm">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Sign In</span>
                <span className="xs:hidden">Login</span>
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Content */}
        <main className="relative z-10 container mx-auto px-3 sm:px-4 pt-10 sm:pt-16 pb-16 sm:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-slide-up">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                Start earning today
              </span>
            </div>
            
            <h1 className="animate-slide-up-delay-1 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading font-extrabold text-foreground leading-tight mb-4 sm:mb-6">
              Watch Ads.{' '}
              <span className="text-gradient">Earn Rewards.</span>{' '}
              <span className="text-gradient-gold">Repeat.</span>
            </h1>
            
            <p className="animate-slide-up-delay-2 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-10 px-2">
              Turn your spare time into real earnings. Watch advertisements, accumulate rewards, and withdraw your earnings. Simple, transparent, and secure.
            </p>
            
            <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" onClick={() => setAuthModalOpen(true)} className="w-full sm:w-auto">
                <Play className="w-5 h-5" />
                Start Earning Now
              </Button>
              <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
                <Link to="/how-it-works">
                  Learn How It Works
                </Link>
              </Button>
            </div>

            {/* Login Card */}
            <div className="mt-12 animate-slide-up-delay-3">
              <div className="inline-flex flex-col items-center gap-4 p-6 rounded-2xl bg-card shadow-elevated border border-border">
                <p className="text-sm text-muted-foreground">Create a free account to get started</p>
                <Button size="lg" onClick={() => setAuthModalOpen(true)} className="w-full">
                  <Mail className="w-5 h-5" />
                  Sign Up with Email
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-muted/50">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-center text-foreground mb-8 sm:mb-12">
            Why Choose <span className="text-gradient">AdsEarn</span>?
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              icon={<DollarSign className="w-6 h-6" />}
              title="Real Earnings"
              description="Earn actual money for your time. No points, no gimmicks - just real rupees in your wallet."
              color="primary"
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Secure & Transparent"
              description="Your earnings are tracked in real-time. See exactly how much you've earned and when."
              color="accent"
            />
            <FeatureCard
              icon={<Clock className="w-6 h-6" />}
              title="Watch Anytime"
              description="Earn at your own pace. Watch ads whenever it's convenient for you."
              color="secondary"
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Fair Revenue Share"
              description="We share 50% of our ad revenue with you. The more you watch, the more you earn."
              color="primary"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Growing Community"
              description="Join thousands of users who are already earning with AdsEarn every day."
              color="accent"
            />
            <FeatureCard
              icon={<Play className="w-6 h-6" />}
              title="Easy to Use"
              description="Just create an account and start watching. It's that simple."
              color="secondary"
            />
          </div>
        </div>
      </section>

      {/* Sponsored Banner */}
      <section className="container mx-auto px-3 sm:px-4 py-4 sm:py-6" aria-label="Sponsored">
        <AdDisplay placement="home" variant="banner" />

        {/* Custom Ad Script Block (Ad network HTML/JS) */}
        <div className="mt-4 sm:mt-6 rounded-xl sm:rounded-2xl bg-card shadow-card border border-border p-3 sm:p-4 min-h-[80px] sm:min-h-[90px]">
          <h2 className="sr-only">Sponsored content</h2>
          <PageScriptBlock settingKey="home_page_script" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5"></div>
        <div className="container mx-auto px-3 sm:px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-foreground mb-4 sm:mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto px-2">
            Join AdsEarn today and turn your screen time into earnings. It's free to join!
          </p>
          <Button size="lg" variant="gold" onClick={() => setAuthModalOpen(true)}>
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col gap-4 sm:gap-6 items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground fill-current" />
              </div>
              <span className="text-base sm:text-lg font-heading font-bold text-foreground">AdsEarn</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
              <Link to="/how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
              <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2024 AdsEarn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: 'primary' | 'secondary' | 'accent' }) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent-foreground',
  };

  return (
    <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card shadow-card border border-border hover:shadow-elevated transition-shadow duration-300">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3 sm:mb-4`}>
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-heading font-semibold text-foreground mb-1 sm:mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
