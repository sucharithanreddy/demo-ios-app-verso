'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Shield,
  Crown,
  CheckCircle2,
  Edit2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    industry: '',
    organization: '',
    userType: '',
    joinDate: '',
  });

  useEffect(() => {
    // Load profile from session storage
    const storedName = sessionStorage.getItem('verso_user_name');
    const storedEmail = sessionStorage.getItem('verso_user_email');
    const storedType = sessionStorage.getItem('verso_user_type');
    
    setProfile({
      fullName: storedName || 'Demo User',
      email: storedEmail || 'demo@verso.app',
      phone: '',
      industry: '',
      organization: storedType === 'individual' ? '' : 'Organization',
      userType: storedType || 'individual',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    });
  }, []);

  const userTypeLabels: Record<string, string> = {
    individual: 'Individual User',
    sales_person: 'Sales Person',
    sales_manager: 'Sales Manager',
  };

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your account information">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background rounded-2xl border border-border/50 overflow-hidden"
        >
          {/* Cover gradient */}
          <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5" />
          
          {/* Avatar and name */}
          <div className="px-6 pb-6 -mt-10">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border-4 border-background flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1 pb-2">
                <h2 className="text-2xl font-bold text-foreground">{profile.fullName}</h2>
                <p className="text-muted-foreground">{userTypeLabels[profile.userType] || 'Individual User'}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-background rounded-2xl border border-border/50 p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Account Details</h3>
          
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-foreground font-medium">{profile.fullName}</p>
                )}
              </div>
              
              <div>
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <p className="mt-1 text-foreground font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Add phone number"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-foreground font-medium">{profile.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  Industry
                </Label>
                {isEditing ? (
                  <Input
                    value={profile.industry}
                    onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                    placeholder="e.g., Technology, Finance"
                    className="mt-1"
                  />
                ) : (
                  <p className="mt-1 text-foreground font-medium">{profile.industry || 'Not provided'}</p>
                )}
              </div>
            </div>

            {profile.userType !== 'individual' && (
              <div>
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  Organization
                </Label>
                <p className="mt-1 text-foreground font-medium">{profile.organization}</p>
              </div>
            )}

            <div>
              <Label className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Member Since
              </Label>
              <p className="mt-1 text-foreground font-medium">{profile.joinDate}</p>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex gap-3">
              <Button onClick={() => setIsEditing(false)} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}
        </motion.div>

        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-background rounded-2xl border border-border/50 p-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Subscription</h3>
              <p className="text-muted-foreground text-sm">Your current plan and benefits</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
              Free Plan
            </span>
          </div>

          <div className="space-y-3">
            {[
              { text: 'Sales Wellbeing Map Assessment', included: true },
              { text: 'Basic Pattern Results', included: true },
              { text: 'AI Therapy Engine', included: false },
              { text: 'Grounding Exercises', included: false },
              { text: 'Daily Check-in', included: false },
              { text: 'Personal Insights Dashboard', included: false },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center',
                  item.included ? 'bg-green-500/10' : 'bg-muted'
                )}>
                  <CheckCircle2 className={cn(
                    'w-4 h-4',
                    item.included ? 'text-green-500' : 'text-muted-foreground/50'
                  )} />
                </div>
                <span className={cn(
                  'text-sm',
                  item.included ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          <Button className="w-full mt-6 gap-2" variant="default">
            <Crown className="w-4 h-4" />
            Upgrade to Premium
          </Button>
        </motion.div>

        {/* Privacy Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-background rounded-2xl border border-border/50 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Your Privacy</h3>
              <p className="text-sm text-muted-foreground">
                Your data is private and secure. We use industry-standard encryption to protect your information. 
                Your wellbeing data is never shared with your organization without your explicit consent.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
