import { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useStore } from '@/store';

interface AggregatedEntry {
  address: string;
  levelsCompleted: number;
  totalHintsUsed: number;
}

export function Leaderboard() {
  const { leaderboard, walletState } = useStore();

  const aggregated = useMemo(() => {
    const map = new Map<string, AggregatedEntry>();

    for (const entry of leaderboard) {
      const existing = map.get(entry.address);
      if (existing) {
        existing.levelsCompleted += 1;
        existing.totalHintsUsed += entry.hintsUsed;
      } else {
        map.set(entry.address, {
          address: entry.address,
          levelsCompleted: 1,
          totalHintsUsed: entry.hintsUsed,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (b.levelsCompleted !== a.levelsCompleted) {
        return b.levelsCompleted - a.levelsCompleted;
      }
      return a.totalHintsUsed - b.totalHintsUsed;
    });
  }, [leaderboard]);

  const currentAddress = walletState.address?.toLowerCase();

  if (aggregated.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <Trophy className="h-10 w-10 text-text-muted" />
        <p className="text-sm text-text-muted">
          No entries yet. Complete levels to appear on the leaderboard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Trophy className="h-4 w-4 text-warning" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Leaderboard
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-text-muted">
              <th className="px-4 py-2.5">Rank</th>
              <th className="px-4 py-2.5">Address</th>
              <th className="px-4 py-2.5 text-right">Levels</th>
              <th className="px-4 py-2.5 text-right">Hints Used</th>
            </tr>
          </thead>
          <tbody>
            {aggregated.map((entry, i) => {
              const isCurrentUser =
                currentAddress && entry.address.toLowerCase() === currentAddress;
              const truncated = `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`;

              return (
                <tr
                  key={entry.address}
                  className={cn(
                    'border-b border-border/50 transition-colors',
                    isCurrentUser
                      ? 'bg-accent/5 text-accent'
                      : 'text-text-secondary hover:bg-bg-tertiary',
                  )}
                >
                  <td className="px-4 py-2.5 font-bold">
                    {i === 0 && '🥇 '}
                    {i === 1 && '🥈 '}
                    {i === 2 && '🥉 '}
                    {i + 1}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs">
                    {truncated}
                    {isCurrentUser && (
                      <span className="ml-2 text-[10px] font-bold uppercase text-accent">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">{entry.levelsCompleted}</td>
                  <td className="px-4 py-2.5 text-right">{entry.totalHintsUsed}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
