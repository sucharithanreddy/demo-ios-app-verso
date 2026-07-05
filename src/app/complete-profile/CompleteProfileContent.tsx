'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@clerk/nextjs';
import { ArrowLeft, Moon, Sun, User, Briefcase, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type UserType = 'INDIVIDUAL' | 'SALES_PERSON' | 'SALES_MANAGER';

export function CompleteProfileContent() {
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const [mounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [userType, setUserType] = useState<UserType>('INDIVIDUAL');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    phone: '',
    industry: '',
    organizationName: '',
    organizationCode: '',
    managerName: '',
    managerEmail: '',
    designation: '',
  });

  // Handle mounting - only render after hydration
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');

    // Read stored user type from sessionStorage (set on landing page)
    const storedUserType = sessionStorage.getItem('verso_selected_user_type');
    if (storedUserType) {
      // Convert to uppercase format used in the form
      const upperType = storedUserType.toUpperCase();
      if (['INDIVIDUAL', 'SALES_PERSON', 'SALES_MANAGER'].includes(upperType)) {
        setUserType(upperType as UserType);
      }
    }
  }, []);

  // Redirect if not signed in
  useEffect(() => {
    if (authLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [authLoaded, isSignedIn, router]);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          ...formData,
        }),
      });

      if (response.ok) {
        router.push('/redirect');
      } else {
        const error = await response.json();
        console.error('Failed to complete profile:', error);
        alert('Failed to complete profile. Please try again.');
      }
    } catch (error) {
      console.error('Error completing profile:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state - show before hydration
  if (!mounted || !authLoaded || !userLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse" />
          <div className="absolute inset-2 rounded-xl bg-primary/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="absolute inset-4 rounded-lg bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Redirecting to sign in...</p>
      </div>
    );
  }

  const displayName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'User';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden noise">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, oklch(0.45 0.2 270), oklch(0.55 0.22 300))' }}
        />
        <div
          className="absolute -bottom-[20%] -left-[10%] w-[40%] h-[40%] rounded-full opacity-15 blur-[100px]"
          style={{ background: 'linear-gradient(135deg, oklch(0.55 0.18 200), oklch(0.45 0.2 270))' }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50">
        <div className="glass border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="p-2 rounded-xl hover:bg-secondary/80 transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium">
                  <img src="/logo.svg" alt="Verso" className="w-6 h-6" style={{ filter: 'brightness(0) invert(1)' }} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Complete Your Profile</h1>
                  <p className="text-xs text-muted-foreground">Tell us about yourself</p>
                </div>
              </div>
              <button
                onClick={toggleDark}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-2xl mx-auto p-6 pt-10">
        <Card className="glass border-border/50 shadow-premium">
          <CardHeader>
            <CardTitle>Welcome, {displayName}!</CardTitle>
            <CardDescription>
              Let&apos;s set up your profile. Choose your account type to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* User Type Selection */}
              <div className="space-y-3">
                <Label>I am a...</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Individual */}
                  <button
                    type="button"
                    onClick={() => setUserType('INDIVIDUAL')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      userType === 'INDIVIDUAL' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <User className="w-8 h-8 mb-2 text-primary" />
                    <h3 className="font-semibold">Individual</h3>
                    <p className="text-xs text-muted-foreground">Personal wellbeing journey</p>
                  </button>

                  {/* Sales Person */}
                  <button
                    type="button"
                    onClick={() => setUserType('SALES_PERSON')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      userType === 'SALES_PERSON' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Briefcase className="w-8 h-8 mb-2 text-primary" />
                    <h3 className="font-semibold">Sales Person</h3>
                    <p className="text-xs text-muted-foreground">Part of a sales team</p>
                  </button>

                  {/* Sales Manager */}
                  <button
                    type="button"
                    onClick={() => setUserType('SALES_MANAGER')}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      userType === 'SALES_MANAGER' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Users className="w-8 h-8 mb-2 text-primary" />
                    <h3 className="font-semibold">Sales Manager</h3>
                    <p className="text-xs text-muted-foreground">Leading a sales team</p>
                  </button>
                </div>
              </div>

              {/* Individual Fields */}
              {userType === 'INDIVIDUAL' && (
                <div className="space-y-4 p-4 rounded-xl bg-secondary/30">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry / Profession</Label>
                    <Input
                      id="industry"
                      name="industry"
                      placeholder="e.g., Technology, Healthcare, Finance"
                      value={formData.industry}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {/* Sales Person Fields */}
              {userType === 'SALES_PERSON' && (
                <div className="space-y-4 p-4 rounded-xl bg-secondary/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name *</Label>
                      <Input
                        id="organizationName"
                        name="organizationName"
                        placeholder="Your company name"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationCode">Organization Code *</Label>
                    <Input
                      id="organizationCode"
                      name="organizationCode"
                      placeholder="Enter your organization code"
                      value={formData.organizationCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="managerName">Manager Name *</Label>
                      <Input
                        id="managerName"
                        name="managerName"
                        placeholder="Your manager's name"
                        value={formData.managerName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="managerEmail">Manager Email *</Label>
                      <Input
                        id="managerEmail"
                        name="managerEmail"
                        type="email"
                        placeholder="manager@company.com"
                        value={formData.managerEmail}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sales Manager Fields */}
              {userType === 'SALES_MANAGER' && (
                <div className="space-y-4 p-4 rounded-xl bg-secondary/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+1 234 567 8900"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation *</Label>
                      <Input
                        id="designation"
                        name="designation"
                        placeholder="e.g., Regional Sales Manager"
                        value={formData.designation}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="organizationName">Organization Name *</Label>
                      <Input
                        id="organizationName"
                        name="organizationName"
                        placeholder="Your company name"
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="organizationCode">Organization Code *</Label>
                      <Input
                        id="organizationCode"
                        name="organizationCode"
                        placeholder="Enter or create an organization code"
                        value={formData.organizationCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A unique manager code will be generated for your team members to connect with you.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-accent text-white shadow-premium"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Setting up...' : 'Complete Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
