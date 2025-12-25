import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Shield } from 'lucide-react';

export default function Privacy() {
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
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-heading font-bold text-foreground m-0">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">Last Updated: December 2024</p>

          <h2 className="font-heading">Information We Collect</h2>
          <p>AdsEarn ("we", "our", "us") operates the website and platform where users watch advertisements and earn rewards. We are committed to protecting your privacy and handling your data securely.</p>
          <ul>
            <li>Google profile info (name, email)</li>
            <li>Device and browser details</li>
            <li>Watch time & ads viewed</li>
            <li>IP address (for security)</li>
            <li>Messages sent through support</li>
          </ul>

          <h2 className="font-heading">How We Use Your Information</h2>
          <ul>
            <li>To create and manage user accounts</li>
            <li>To calculate earnings based on activity</li>
            <li>To prevent fraud and multiple account abuse</li>
            <li>To improve our services</li>
          </ul>

          <h2 className="font-heading">Data Sharing</h2>
          <p>We do not sell or share your personal data with advertisers. We may share limited data only:</p>
          <ul>
            <li>When required by law</li>
            <li>With service providers (database, auth systems)</li>
          </ul>

          <h2 className="font-heading">Cookies</h2>
          <p>We use cookies for login and platform security.</p>

          <h2 className="font-heading">Your Rights</h2>
          <p>You may request:</p>
          <ul>
            <li>Account data access</li>
            <li>Deletion of your account</li>
            <li>Correction of profile data</li>
          </ul>

          <h2 className="font-heading">Contact</h2>
          <p>For privacy concerns, please contact us through our <Link to="/support" className="text-primary hover:underline">Support page</Link>.</p>
        </div>
      </main>
    </div>
  );
}