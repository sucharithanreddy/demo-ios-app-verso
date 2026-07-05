// ============================================================================
// React Query hooks — data fetching with caching + optimistic updates
// ============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchProfile,
  fetchLatestDiagnostic,
  fetchCheckIns,
  createCheckIn,
  fetchStreak,
  fetchCoachingTips,
  sendCoachMessage,
  type CoachRequest,
} from './api';
import type { CheckInInput, EngineResponse } from './types';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const queryKeys = {
  profile: ['profile'] as const,
  diagnostic: ['diagnostic', 'latest'] as const,
  checkIns: (limit: number) => ['checkIns', limit] as const,
  streak: ['streak'] as const,
  coaching: (situation: string) => ['coaching', situation] as const,
};

// ---------------------------------------------------------------------------
// User & Profile
// ---------------------------------------------------------------------------

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useLatestDiagnostic() {
  return useQuery({
    queryKey: queryKeys.diagnostic,
    queryFn: fetchLatestDiagnostic,
    staleTime: 10 * 60 * 1000, // 10 min
  });
}

// ---------------------------------------------------------------------------
// Check-ins
// ---------------------------------------------------------------------------

export function useCheckIns(limit = 30) {
  return useQuery({
    queryKey: queryKeys.checkIns(limit),
    queryFn: () => fetchCheckIns(limit),
    staleTime: 60 * 1000, // 1 min
  });
}

export function useCreateCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CheckInInput) => createCheckIn(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checkIns'] });
      qc.invalidateQueries({ queryKey: queryKeys.streak });
    },
  });
}

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------

export function useStreak() {
  return useQuery({
    queryKey: queryKeys.streak,
    queryFn: fetchStreak,
    staleTime: 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Coaching tips
// ---------------------------------------------------------------------------

export function useCoachingTips(situation = 'morning') {
  return useQuery({
    queryKey: queryKeys.coaching(situation),
    queryFn: () => fetchCoachingTips(situation),
    staleTime: 5 * 60 * 1000,
  });
}

// ---------------------------------------------------------------------------
// AI Coach
// ---------------------------------------------------------------------------

export function useSendMessage() {
  return useMutation({
    mutationFn: (req: CoachRequest) => sendCoachMessage(req),
  });
}
