import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ConsoleMessage,
  CompilationResult,
  WalletState,
  UserProgress,
} from '@/types';

export interface LeaderboardEntry {
  address: string;
  levelId: number;
  completedAt: number;
  hintsUsed: number;
}

interface AppState {
  currentLevelId: number;
  progress: Record<number, UserProgress>;
  consoleMessages: ConsoleMessage[];
  walletState: WalletState;
  compilationResult: CompilationResult | null;
  editorCode: string;
  showHints: boolean;
  hintsRevealed: number;
  showSolution: boolean;
  showInsights: boolean;
  leaderboard: LeaderboardEntry[];

  setCurrentLevel: (id: number) => void;
  addConsoleMessage: (msg: Omit<ConsoleMessage, 'id' | 'timestamp'>) => void;
  clearConsole: () => void;
  setWallet: (state: Partial<WalletState>) => void;
  setCompilationResult: (result: CompilationResult | null) => void;
  setEditorCode: (code: string) => void;
  completeLevel: (levelId: number, hintsUsed: number) => void;
  revealNextHint: () => void;
  toggleSolution: () => void;
  toggleInsights: () => void;
  resetProgress: () => void;
}

const initialWalletState: WalletState = {
  address: null,
  balance: null,
  chainId: null,
  connected: false,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentLevelId: 1,
      progress: {},
      consoleMessages: [],
      walletState: initialWalletState,
      compilationResult: null,
      editorCode: '',
      showHints: false,
      hintsRevealed: 0,
      showSolution: false,
      showInsights: false,
      leaderboard: [],

      setCurrentLevel: (id: number) =>
        set({
          currentLevelId: id,
          editorCode: '',
          showHints: false,
          hintsRevealed: 0,
          showSolution: false,
          showInsights: false,
          compilationResult: null,
          consoleMessages: [],
        }),

      addConsoleMessage: (msg) =>
        set((state) => ({
          consoleMessages: [
            ...state.consoleMessages,
            {
              ...msg,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),

      clearConsole: () => set({ consoleMessages: [] }),

      setWallet: (partial) =>
        set((state) => ({
          walletState: { ...state.walletState, ...partial },
        })),

      setCompilationResult: (result) => set({ compilationResult: result }),

      setEditorCode: (code) => set({ editorCode: code }),

      completeLevel: (levelId: number, hintsUsed: number) => {
        const { walletState, leaderboard } = get();
        const now = Date.now();

        set((state) => ({
          progress: {
            ...state.progress,
            [levelId]: {
              levelId,
              completed: true,
              completedAt: now,
              hintsUsed,
            },
          },
          leaderboard: [
            ...leaderboard,
            {
              address: walletState.address ?? 'anonymous',
              levelId,
              completedAt: now,
              hintsUsed,
            },
          ],
        }));
      },

      revealNextHint: () =>
        set((state) => ({
          showHints: true,
          hintsRevealed: Math.min(state.hintsRevealed + 1, 3),
        })),

      toggleSolution: () =>
        set((state) => ({ showSolution: !state.showSolution })),

      toggleInsights: () =>
        set((state) => ({ showInsights: !state.showInsights })),

      resetProgress: () =>
        set({
          progress: {},
          leaderboard: [],
          currentLevelId: 1,
          editorCode: '',
          showHints: false,
          hintsRevealed: 0,
          showSolution: false,
          showInsights: false,
          compilationResult: null,
          consoleMessages: [],
        }),
    }),
    {
      name: 'web3-security-lab',
      partialize: (state) => ({
        currentLevelId: state.currentLevelId,
        progress: state.progress,
        leaderboard: state.leaderboard,
        editorCode: state.editorCode,
      }),
    },
  ),
);
