export interface Level {
  id: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  category: string;
  description: string;
  objective: string;
  vulnerableContract: string;
  attackContract: string;
  hints: string[];
  solution: string;
  explanation: string;
  secureCoding: string;
  realWorldImpact: string;
  moduleMapping: string;
  attackSteps: AttackStep[];
}

export interface AttackStep {
  title: string;
  description: string;
  code?: string;
  stateChange?: string;
}

export interface ConsoleMessage {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'tx';
  message: string;
  timestamp: number;
  txHash?: string;
}

export interface UserProgress {
  levelId: number;
  completed: boolean;
  completedAt?: number;
  timeSpent?: number;
  hintsUsed: number;
}

export interface CompilationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  abi?: unknown[];
  bytecode?: string;
  contractName?: string;
}

export interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  connected: boolean;
}
