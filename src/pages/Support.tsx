import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Play, Send, MessageCircle, Mail, HelpCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const supportSchema = z.object({
  subject: z.string().trim().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
});

export default function Support() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Require authentication
  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to contact support.',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [user, loading, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Must be authenticated
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be signed in to submit a support message.',
        variant: 'destructive',
      });
      return;
    }

    // Validate
    const result = supportSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from('support_messages')
      .insert({
        user_id: user.id,
        subject: formData.subject,
        message: formData.message,
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitted(true);
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6 shadow-glow">
            <CheckCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground mb-3">Message Sent!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for contacting us. We'll get back to you as soon as possible.
          </p>
          <Button asChild>
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/dashboard">
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
        <div className="max-w-2xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl gradient-blue flex items-center justify-center mx-auto mb-6 shadow-lg">
              <HelpCircle className="w-8 h-8 text-secondary-foreground" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
              Need Help?
            </h1>
            <p className="text-muted-foreground">
              We're here to assist you. Send us a message and we'll respond as soon as possible.
            </p>
            {user && (
              <p className="text-sm text-muted-foreground mt-2">
                Sending as: <span className="font-medium text-foreground">{user.email}</span>
              </p>
            )}
          </div>

          {/* Contact Form */}
          <div className="p-6 sm:p-8 rounded-2xl bg-card shadow-elevated border border-border">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What's this about?"
                  className={errors.subject ? 'border-destructive' : ''}
                />
                {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your issue or question in detail..."
                  rows={6}
                  className={errors.message ? 'border-destructive' : ''}
                />
                {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">support@adsearn.com</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Response Time</p>
                <p className="font-medium text-foreground">Within 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
