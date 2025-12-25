import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Play, TrendingUp, Shield, Clock, DollarSign, Users } from 'lucide-react';

export default function Landing() {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

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
        <header className="relative z-10 container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Play className="w-5 h-5 text-primary-foreground fill-current" />
              </div>
              <span className="text-2xl font-heading font-bold text-foreground">
                Ads<span className="text-gradient">Earn</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                How it Works
              </Link>
              <Button variant="google" onClick={handleGoogleLogin} className="hidden sm:flex">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign In
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Content */}
        <main className="relative z-10 container mx-auto px-4 pt-16 pb-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-slide-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <TrendingUp className="w-4 h-4" />
                Start earning today
              </span>
            </div>
            
            <h1 className="animate-slide-up-delay-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-foreground leading-tight mb-6">
              Watch Ads.{' '}
              <span className="text-gradient">Earn Rewards.</span>{' '}
              <span className="text-gradient-gold">Repeat.</span>
            </h1>
            
            <p className="animate-slide-up-delay-2 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Turn your spare time into real earnings. Watch advertisements, accumulate rewards, and withdraw your earnings. Simple, transparent, and secure.
            </p>
            
            <div className="animate-slide-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="xl" onClick={handleGoogleLogin} className="w-full sm:w-auto">
                <Play className="w-5 h-5" />
                Start Earning Now
              </Button>
              <Button variant="outline" size="xl" asChild className="w-full sm:w-auto">
                <Link to="/how-it-works">
                  Learn How It Works
                </Link>
              </Button>
            </div>

            {/* Google Login Card */}
            <div className="mt-12 animate-slide-up-delay-3">
              <div className="inline-flex flex-col items-center gap-4 p-6 rounded-2xl bg-card shadow-elevated border border-border">
                <p className="text-sm text-muted-foreground">Sign in with your Google account to get started</p>
                <Button variant="google" size="lg" onClick={handleGoogleLogin} className="w-full">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-center text-foreground mb-12">
            Why Choose <span className="text-gradient">AdsEarn</span>?
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
              description="Just sign in with Google and start watching. It's that simple."
              color="secondary"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join AdsEarn today and turn your screen time into earnings. It's free to join!
          </p>
          <Button size="xl" variant="gold" onClick={handleGoogleLogin}>
            <Play className="w-5 h-5" />
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Play className="w-4 h-4 text-primary-foreground fill-current" />
              </div>
              <span className="text-lg font-heading font-bold text-foreground">AdsEarn</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
              <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 AdsEarn. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
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
    <div className="p-6 rounded-2xl bg-card shadow-card border border-border hover:shadow-elevated transition-shadow duration-300">
      <div className={`w-12 h-12 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}