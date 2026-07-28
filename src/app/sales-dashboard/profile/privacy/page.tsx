'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Shield,
  User,
  EyeOff,
  AlertCircle,
  Check,
  ChevronLeft,
  Loader2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SalesDashboardLayout } from '@/components/dashboard/SalesDashboardLayout';
import { cn } from '@/lib/utils';
import Link from 'next/link';

type ManagerVisibility = 'NAMED' | 'ANONYMOUS';

interface PrivacyData {
  managerVisibility: ManagerVisibility;
  userType: string;
  hasManager: boolean;
  objection: {
    status: string;
    reason: string | null;
    createdAt: string;
    resolvedAt: string | null;
  } | null;
}

export default function SalesPrivacySettingsPage() {
  const router = useRouter();
  const [data, setData] = useState<PrivacyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ManagerVisibility>('NAMED');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Objection form state
  const [showObjectionForm, setShowObjectionForm] = useState(false);
  const [objectionReason, setObjectionReason] = useState('');
  const [isSubmittingObjection, setIsSubmittingObjection] = useState(false);

  useEffect(() => {
    fetchPrivacyData();
  }, []);

  const fetchPrivacyData = async () => {
    try {
      const res = await fetch('/api/profile/manager-visibility');
      if (res.ok) {
        const data = await res.json();
        setData(data);
        setSelectedOption(data.managerVisibility);
      }
    } catch (error) {
      console.error('Error fetching privacy data:', error);
      setErrorMessage('Failed to load privacy settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/profile/manager-visibility', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerVisibility: selectedOption }),
      });

      if (res.ok) {
        const data = await res.json();
        setSaveStatus('success');
        setData((prev) => (prev ? { ...prev, managerVisibility: data.managerVisibility } : prev));
        setTimeout(() => setSaveStatus('idle'), 2500);
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.error || 'Failed to save. Please try again.');
        setSaveStatus('error');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitObjection = async () => {
    setIsSubmittingObjection(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/profile/object-to-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: objectionReason || null }),
      });

      if (res.ok) {
        setShowObjectionForm(false);
        await fetchPrivacyData();
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMessage(err.error || 'Failed to submit objection.');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmittingObjection(false);
    }
  };

  const handleWithdrawObjection = async () => {
    setIsSubmittingObjection(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/profile/object-to-manager', {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchPrivacyData();
      } else {
        setErrorMessage('Failed to withdraw objection.');
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmittingObjection(false);
    }
  };

  if (isLoading) {
    return (
      <SalesDashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </SalesDashboardLayout>
    );
  }

  // If user is not a sales person and not part of a team, show a notice
  const isSalesPerson = data?.userType === 'SALES_PERSON';
  const hasObjection = !!(data?.objection && ['PENDING', 'APPROVED'].includes(data.objection.status));

  return (
    <SalesDashboardLayout>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-premium">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Manager Visibility</h2>
              <p className="text-sm text-muted-foreground">
                Control how your manager sees your wellbeing data
              </p>
            </div>
          </div>

          {/* Pending objection banner */}
          {hasObjection && (
            <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    Your objection request is {data?.objection?.status.toLowerCase()}
                  </p>
                  <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
                    {data?.objection?.status === 'PENDING'
                      ? 'While your request is being reviewed, your data is hidden from all manager views. We will contact you within 5 business days.'
                      : 'Your request has been approved. Your data is permanently excluded from manager views.'}
                  </p>
                  <button
                    onClick={handleWithdrawObjection}
                    disabled={isSubmittingObjection}
                    className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
                  >
                    Withdraw request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notice if user is not a sales person */}
          {!isSalesPerson && !hasObjection && (
            <div className="mb-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    You are not currently part of a manager&apos;s team
                  </p>
                  <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">
                    These settings will apply if you join a team in the future. Your individual data is always private and only visible to you.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Two options */}
          <div className="space-y-3">
            {/* NAMED option */}
            <button
              onClick={() => setSelectedOption('NAMED')}
              disabled={hasObjection}
              className={cn(
                'w-full text-left p-4 rounded-xl border-2 transition-all',
                selectedOption === 'NAMED'
                  ? 'border-primary bg-primary/5'
                  : 'border-border/50 bg-secondary/30 hover:border-primary/30',
                hasObjection && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center',
                    selectedOption === 'NAMED' ? 'border-primary' : 'border-muted-foreground/40'
                  )}
                >
                  {selectedOption === 'NAMED' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-primary" />
                    <p className="font-semibold text-foreground">Show my name</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your manager sees your name with your archetype, dimension scores, and check-in trends.
                    This supports personalized coaching and team-level insights.
                  </p>
                </div>
              </div>
            </button>

            {/* ANONYMOUS option */}
            <button
              onClick={() => setSelectedOption('ANONYMOUS')}
              disabled={hasObjection}
              className={cn(
                'w-full text-left p-4 rounded-xl border-2 transition-all',
                selectedOption === 'ANONYMOUS'
                  ? 'border-primary bg-primary/5'
                  : 'border-border/50 bg-secondary/30 hover:border-primary/30',
                hasObjection && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center',
                    selectedOption === 'ANONYMOUS' ? 'border-primary' : 'border-muted-foreground/40'
                  )}
                >
                  {selectedOption === 'ANONYMOUS' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <EyeOff className="w-4 h-4 text-primary" />
                    <p className="font-semibold text-foreground">Show as &ldquo;Anonymous team member&rdquo;</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your manager still sees your archetype, dimension scores, and trends - but your name and email are replaced with &ldquo;Anonymous team member.&rdquo;
                    Your data still contributes to team-level insights.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Save button */}
          {!hasObjection && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || selectedOption === data?.managerVisibility}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-premium"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : saveStatus === 'success' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    'Save preference'
                  )}
                </Button>
              </div>
              {errorMessage && (
                <p className="text-xs text-red-500 mt-2">{errorMessage}</p>
              )}
            </div>
          )}
        </motion.div>

        {/* GDPR rights info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-2xl border border-border/50 p-6"
        >
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            Your privacy rights
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Individual results are private.</strong>{' '}
              Your manager only sees aggregated team trends - never your individual check-in responses or AI Companion conversations.
            </p>
            <p>
              <strong className="text-foreground">Managers cannot use this data for performance decisions.</strong>{' '}
              Per Verso&apos;s terms of use, individual results must not be used for recruitment, promotion, disciplinary, or performance-management decisions.
            </p>
            <p>
              <strong className="text-foreground">You can withdraw consent at any time.</strong>{' '}
              Toggle your preference above, or submit a formal objection below.
            </p>
            <p>
              <strong className="text-foreground">All manager views are audited.</strong>{' '}
              Every time a manager views the team dashboard, the access is logged for security and accountability.
            </p>
          </div>
        </motion.div>

        {/* Buried: Right to object entirely (GDPR Article 21) */}
        {!hasObjection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl border border-border/50 p-6"
          >
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Object to manager visibility entirely
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Under GDPR Article 21, you have the right to object to your data being processed for legitimate interests.
              If you submit this request, your data will be hidden from all manager views while we review your request
              (usually within 5 business days).
            </p>

            {!showObjectionForm ? (
              <button
                onClick={() => setShowObjectionForm(true)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                Submit a formal objection request
                <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={objectionReason}
                  onChange={(e) => setObjectionReason(e.target.value)}
                  placeholder="Optional: Tell us why you'd like to object. This helps us review your request."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground/60 text-sm resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitObjection}
                    disabled={isSubmittingObjection}
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {isSubmittingObjection ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit objection'
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowObjectionForm(false);
                      setObjectionReason('');
                    }}
                    disabled={isSubmittingObjection}
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
                {errorMessage && (
                  <p className="text-xs text-red-500">{errorMessage}</p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Back to profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Link href="/sales-dashboard/profile" className="block">
            <Button variant="outline" className="w-full gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back to profile
            </Button>
          </Link>
        </motion.div>

        <p className="text-xs text-muted-foreground/60 text-center pt-4">
          Verso Privacy v1.0 · GDPR-compliant · Your data is encrypted and never sold.
        </p>
      </div>
    </SalesDashboardLayout>
  );
}
