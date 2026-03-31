import type { UserProgress } from '@/types';
import type { LeaderboardEntry } from '@/store';

const PROGRESS_PREFIX = 'web3-lab-progress-';
const LEADERBOARD_KEY = 'web3-lab-leaderboard';

export function saveProgress(
  address: string,
  progress: Record<number, UserProgress>,
): void {
  try {
    const key = PROGRESS_PREFIX + address.toLowerCase();
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

export function loadProgress(
  address: string,
): Record<number, UserProgress> | null {
  try {
    const key = PROGRESS_PREFIX + address.toLowerCase();
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as Record<number, UserProgress>;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save leaderboard:', error);
  }
}

export function loadLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    return [];
  }
}
