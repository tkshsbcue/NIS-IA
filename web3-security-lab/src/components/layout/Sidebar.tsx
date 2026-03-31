import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store';
import levels from '@/levels';

const difficultyVariant = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
  Expert: 'danger',
} as const;

export function Sidebar() {
  const { currentLevelId, progress, setCurrentLevel } = useStore();

  const completedCount = Object.values(progress).filter((p) => p.completed).length;

  return (
    <aside className="flex w-72 flex-col border-r border-border bg-bg-secondary">
      <div className="border-b border-border p-4">
        <div className="text-xs font-medium uppercase tracking-wider text-text-muted">
          Progress
        </div>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-accent">{completedCount}</span>
          <span className="text-sm text-text-muted">/ {levels.length} completed</span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-bg-tertiary">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{
              width: levels.length > 0
                ? `${(completedCount / levels.length) * 100}%`
                : '0%',
            }}
          />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {levels.map((level) => {
          const isActive = level.id === currentLevelId;
          const isCompleted = progress[level.id]?.completed;

          return (
            <button
              key={level.id}
              onClick={() => setCurrentLevel(level.id)}
              className={cn(
                'flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition-colors cursor-pointer',
                isActive
                  ? 'border-accent bg-accent/5 text-text-primary'
                  : 'border-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  isCompleted
                    ? 'bg-success/15 text-success'
                    : isActive
                      ? 'bg-accent/15 text-accent'
                      : 'bg-bg-tertiary text-text-muted',
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  level.id
                )}
              </span>

              <div className="flex-1 truncate">
                <div className="truncate text-sm font-medium">{level.title}</div>
                <Badge
                  variant={difficultyVariant[level.difficulty]}
                  className="mt-1"
                >
                  {level.difficulty}
                </Badge>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
