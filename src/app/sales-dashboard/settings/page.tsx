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
  Link2,
  X,
  Clock,
  Globe,
  Shield,
} from 'lucide-react';
import { SalesDashboardLayout } from '@/components/dashboard/SalesDashboardLayout';
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
  manager: {
    id: string;
    name: string | null;
    email: string;
    designation: string | null;
  } | null;
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

export default function SalesSettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

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

  // Manager linking
  const [managerCode, setManagerCode] = useState('');
  const [linkedManager, setLinkedManager] = useState<UserProfile['manager']>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setLinkedManager(data.user.manager);
        
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
        setError(data.error || 'Failed to save profile');
      }
    } catch (error) {
      setError('An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLinkManager = async () => {
    if (!managerCode.trim()) return;
    
    setIsLinking(true);
    setLinkError('');
    
    try {
      const res = await fetch('/api/manager/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerCode: managerCode.trim() }),
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setLinkedManager(data.manager);
        setShowLinkInput(false);
        setManagerCode('');
      } else {
        setLinkError(data.message || data.error || 'Failed to link manager');
      }
    } catch (error) {
      setLinkError('An error occurred. Please try again.');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkManager = async () => {
    try {
      await fetch('/api/manager/link', { method: 'DELETE' });
      setLinkedManager(null);
    } catch (error) {
      console.error('Error unlinking manager:', error);
    }
  };

  // Get email from profile (stored in database during signup)
  const displayEmail = profile?.email || '';

  if (isLoading) {
    return (
      <SalesDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-2xl bg-purple-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-xl bg-purple-500/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-4 rounded-lg bg-purple-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </SalesDashboardLayout>
    );
  }

  return (
    <SalesDashboardLayout>
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
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
            transition={{ delay: 0.1 }}
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
                    placeholder="Your job title"
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
            transition={{ delay: 0.2 }}
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

          {/* Manager Link Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl border border-border/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Manager Connection</h2>
                <p className="text-xs text-muted-foreground">Link to your manager for personalized support</p>
              </div>
            </div>

            {linkedManager ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {linkedManager.name?.charAt(0) || linkedManager.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{linkedManager.name || linkedManager.email}</p>
                    {linkedManager.designation && (
                      <p className="text-xs text-muted-foreground">{linkedManager.designation}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUnlinkManager}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-1" />
                  Unlink
                </Button>
              </div>
            ) : showLinkInput ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={managerCode}
                    onChange={(e) => setManagerCode(e.target.value.toUpperCase())}
                    placeholder="Enter manager code (e.g., MGR-ABC123)"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60"
                  />
                  <Button
                    onClick={handleLinkManager}
                    disabled={!managerCode.trim() || isLinking}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    {isLinking ? 'Linking...' : 'Link'}
                  </Button>
                </div>
                {linkError && (
                  <p className="text-sm text-destructive">{linkError}</p>
                )}
                <button
                  onClick={() => { setShowLinkInput(false); setLinkError(''); }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <Button
                onClick={() => setShowLinkInput(true)}
                variant="outline"
                className="w-full border-purple-500/30 text-purple-500 hover:bg-purple-500/10"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Link to Manager
              </Button>
            )}
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
    </SalesDashboardLayout>
  );
}
