'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Briefcase,
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Users,
  Clock,
  Globe,
  Share2,
  RefreshCw,
  Shield,
  ArrowLeftRight,
} from 'lucide-react';
import Link from 'next/link';
import { ManagerDashboardLayout } from '@/components/dashboard/ManagerDashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  avatarUrl: string | null;
  userType: string;
  industry: string | null;
  designation: string | null;
  companyName: string | null;
  department: string | null;
  bio: string | null;
  timezone: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  managerCode: string | null;
  managerId: string | null;
}

const TIMEZONES = [
  'Asia/Calcutta',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC',
];

export default function ManagerSettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    industry: '',
    designation: '',
    companyName: '',
    department: '',
    bio: '',
    timezone: 'Asia/Calcutta',
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        
        // Populate form
        setFormData({
          name: data.user.name || '',
          phone: data.user.phone || '',
          industry: data.user.industry || '',
          designation: data.user.designation || '',
          companyName: data.user.companyName || '',
          department: data.user.department || '',
          bio: data.user.bio || '',
          timezone: data.user.timezone || 'Asia/Calcutta',
          streetAddress: data.user.streetAddress || '',
          city: data.user.city || '',
          state: data.user.state || '',
          country: data.user.country || '',
          zipCode: data.user.zipCode || '',
        });
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setProfile(data.user);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(data.error || data.details || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const copyManagerCode = async () => {
    if (profile?.managerCode) {
      await navigator.clipboard.writeText(profile.managerCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateManagerCode = async () => {
    setIsGeneratingCode(true);
    setError('');

    try {
      const res = await fetch('/api/manager/generate-code', {
        method: 'POST',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Update profile with new code
        setProfile(prev => prev ? { ...prev, managerCode: data.managerCode } : prev);
      } else {
        // Show error with details if available
        const errorMsg = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || 'Failed to generate manager code';
        setError(errorMsg);
      }
    } catch (error) {
      console.error('Error generating manager code:', error);
      setError('Failed to generate manager code. Please try again.');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Get email from profile (stored in database during signup)
  const displayEmail = profile?.email || '';

  if (isLoading) {
    return (
      <ManagerDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-purple-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-xl bg-purple-500/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-4 rounded-lg bg-purple-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </ManagerDashboardLayout>
    );
  }

  return (
    <ManagerDashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Account Settings</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-green-600">Profile saved successfully!</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-600">{error}</span>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Manager Code Section - Important! */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl border border-purple-500/30 p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Your Manager Code</h2>
                <p className="text-xs text-muted-foreground">Share this code with your team members to link them to you</p>
              </div>
            </div>

            {profile?.managerCode ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-4 rounded-xl bg-secondary/50 border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">Your Manager Code</p>
                    <p className="text-2xl font-mono font-bold text-foreground tracking-wider">
                      {profile.managerCode}
                    </p>
                  </div>
                  <Button
                    onClick={copyManagerCode}
                    variant="outline"
                    className="h-16 px-6 border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-start gap-3">
                    <Share2 className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">How to share</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Send this code to your team members. They can enter it in their profile settings 
                        under "Link to Manager" to connect with you. Once linked, you'll be able to see 
                        their wellbeing insights on your dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Manager Code Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate a unique code to share with your team members so they can link to you.
                </p>
                <Button
                  onClick={generateManagerCode}
                  disabled={isGeneratingCode}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  {isGeneratingCode ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Generate Manager Code
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>

          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
                <p className="text-xs text-muted-foreground">Your basic details</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={displayEmail}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/30 border border-border/50 text-foreground cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Shield className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Email from your account</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Timezone
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground appearance-none cursor-pointer"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Bio / About Me
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60 resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Work Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Work Information</h2>
                <p className="text-xs text-muted-foreground">Your professional details</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company / Organization
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Company name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Sales, Marketing, etc."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Designation / Role
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Sales Manager, Team Lead, etc."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Industry
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="Technology, Finance, etc."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Address Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Address</h2>
                <p className="text-xs text-muted-foreground">Your location details</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                  placeholder="123 Main Street, Apt 4B"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Mumbai"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State / Province
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Maharashtra"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="India"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ZIP / Postal Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="400001"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
          </motion.div>

          {/* Role & Account — switch role / view as different user type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-2xl border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Role & Account</h2>
                <p className="text-xs text-muted-foreground">Switch your role or update account type</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div>
                <p className="text-sm font-medium text-foreground">Current role</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  {profile?.userType
                    ? profile.userType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
                    : '—'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Want to switch between Individual, Sales Person, or Sales Manager? Use the profile setup page to change your role.
                </p>
              </div>
              <Link
                href="/complete-profile"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 hover:bg-purple-500/20 transition-colors text-sm font-medium whitespace-nowrap"
              >
                <ArrowLeftRight className="w-4 h-4" />
                Switch Role
              </Link>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end"
          >
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </ManagerDashboardLayout>
  );
}
