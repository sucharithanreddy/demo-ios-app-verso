'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  ArrowLeft,
  Key,
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  AlertCircle,
  Loader2,
  Calendar,
  Users,
  Shield,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useSafeUser } from '@/lib/safe-auth';
import { MobileHeader } from '@/components/MobileHeader';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface UnlockCode {
  id: string;
  code: string;
  planType: string;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
  isActive: boolean;
  usages: Array<{
    user: { id: string; name: string; email: string };
    usedAt: string;
  }>;
}

export default function AdminCodesPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useSafeUser();

  const [codes, setCodes] = useState<UnlockCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generator form state
  const [generateCount, setGenerateCount] = useState(5);
  const [planType, setPlanType] = useState('PRO');
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newCodes, setNewCodes] = useState<string[]>([]);

  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = stored === 'dark' || (!stored && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchCodes();
    }
  }, [isSignedIn]);

  const fetchCodes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/codes');
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Failed to load codes');
      } else {
        setCodes(result.codes);
      }
    } catch (err) {
      setError('Failed to load codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: generateCount,
          planType,
          maxUses,
          expiresInDays,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setNewCodes(result.codes.map((c: any) => c.code));
        fetchCodes();
        setShowGenerator(false);
      } else {
        setError(result.error || 'Failed to generate codes');
      }
    } catch (err) {
      setError('Failed to generate codes');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (codeId: string) => {
    if (!confirm('Are you sure you want to delete this code?')) return;

    try {
      const response = await fetch(`/api/codes?id=${codeId}`, { method: 'DELETE' });
      if (response.ok) {
        setCodes(codes.filter(c => c.id !== codeId));
      }
    } catch (err) {
      console.error('Failed to delete code');
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCodes = () => {
    const csv = [
      'Code,Plan Type,Max Uses,Used Count,Expires At,Created At',
      ...codes.map(c => 
        `${c.code},${c.planType},${c.maxUses},${c.usedCount},${c.expiresAt || 'Never'},${c.createdAt}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unlock_codes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  if (!mounted || !isLoaded || !isSignedIn) {
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden noise">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, oklch(0.45 0.2 270), oklch(0.55 0.22 300))' }}
        />
        <div className="absolute inset-0 dot-pattern opacity-30" />
      </div>

      <MobileHeader
        title="Unlock Codes"
        subtitle="Generate & manage codes"
        icon="key"
        onToggleDark={toggleDark}
        isDark={isDark}
      />

      <header className="sticky top-0 z-50 hide-on-mobile">
        <div className="glass border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="p-2 rounded-xl hover:bg-secondary/80 transition-colors">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Link>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-premium">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Unlock Codes</h1>
                  <p className="text-xs text-muted-foreground">Generate and manage access codes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleDark}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 pb-8 px-4 md:px-6 pt-6 md:pt-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Error State */}
          {error && !isLoading && (
            <div className="glass rounded-2xl border border-red-500/30 p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Access Required</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link
                href="/home"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading codes...</p>
            </div>
          )}

          {/* New Codes Banner */}
          {newCodes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl border border-green-500/30 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Check className="w-6 h-6 text-green-500" />
                <h3 className="text-lg font-semibold text-foreground">
                  {newCodes.length} codes generated successfully!
                </h3>
              </div>
              <div className="space-y-2 mb-4">
                {newCodes.map((code, i) => (
                  <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-lg px-4 py-2">
                    <code className="text-sm font-mono text-foreground">{code}</code>
                    <button
                      onClick={() => copyToClipboard(code, `new-${i}`)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedId === `new-${i}` ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setNewCodes([])}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {/* Action Buttons */}
          {!isLoading && !error && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowGenerator(!showGenerator)}
                className="inline-flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Generate Codes
              </button>
              <button
                onClick={exportCodes}
                className="inline-flex items-center gap-2 px-4 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          )}

          {/* Generator Form */}
          {showGenerator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl border border-border/50 p-6 shadow-premium"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Generate New Codes</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Number of Codes</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={generateCount}
                    onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-secondary rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Plan Type</label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value)}
                    className="w-full px-4 py-3 bg-secondary rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="PRO">Pro</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Max Uses per Code</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={maxUses}
                    onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-secondary rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Expires In (Days)</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 30)}
                    className="w-full px-4 py-3 bg-secondary rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  {isGenerating ? 'Generating...' : `Generate ${generateCount} Codes`}
                </button>
                <button
                  onClick={() => setShowGenerator(false)}
                  className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Codes List */}
          {!isLoading && !error && codes.length === 0 && (
            <div className="glass rounded-2xl border border-border/50 p-12 text-center">
              <Key className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No codes yet</h3>
              <p className="text-muted-foreground">Generate your first unlock codes to get started</p>
            </div>
          )}

          {!isLoading && !error && codes.length > 0 && (
            <div className="space-y-3">
              {codes.map((code) => (
                <motion.div
                  key={code.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl border border-border/50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="text-lg font-mono font-semibold text-foreground">
                          {code.code}
                        </code>
                        <button
                          onClick={() => copyToClipboard(code.code, code.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {copiedId === code.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          {code.planType}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {code.usedCount}/{code.maxUses} used
                        </span>
                        {code.expiresAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Expires: {new Date(code.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Created: {new Date(code.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {code.usages.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-2">Redeemed by:</p>
                          <div className="flex flex-wrap gap-2">
                            {code.usages.map((usage, i) => (
                              <span key={i} className="px-2 py-1 bg-secondary rounded text-xs text-foreground">
                                {usage.user.name || usage.user.email}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(code.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
