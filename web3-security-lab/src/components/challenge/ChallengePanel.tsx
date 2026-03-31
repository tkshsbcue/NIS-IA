import { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff, BookOpen, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useStore } from '@/store';
import { getLevelById } from '@/levels';

const difficultyVariant = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
  Expert: 'danger',
} as const;

export function ChallengePanel() {
  const {
    currentLevelId,
    progress,
    showHints,
    hintsRevealed,
    showSolution,
    showInsights,
    revealNextHint,
    toggleSolution,
    toggleInsights,
    completeLevel,
  } = useStore();
  const [confirmComplete, setConfirmComplete] = useState(false);

  const level = getLevelById(currentLevelId);
  const isCompleted = progress[currentLevelId]?.completed;

  if (!level) {
    return (
      <div className="flex flex-1 items-center justify-center text-text-muted">
        No level selected
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      {/* Title + Meta */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-text-primary">{level.title}</h2>
          {isCompleted && <CheckCircle2 className="h-5 w-5 text-success" />}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={difficultyVariant[level.difficulty]}>{level.difficulty}</Badge>
          <Badge variant="info">{level.category}</Badge>
        </div>
      </div>

      {/* Description */}
      <Card className="mb-4">
        <CardContent>
          <p className="leading-relaxed">{level.description}</p>
        </CardContent>
      </Card>

      {/* Objective */}
      <Card className="mb-4" glow="accent">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider text-accent">
            Objective
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{level.objective}</p>
        </CardContent>
      </Card>

      {/* Attack Steps Checklist */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm">Attack Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {level.attackSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-bg-tertiary text-[10px] font-bold text-text-muted">
                  {i + 1}
                </span>
                <span className="text-text-secondary">{step.title}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Hints */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Hints</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={revealNextHint}
              disabled={hintsRevealed >= level.hints.length}
            >
              {hintsRevealed < level.hints.length
                ? `Reveal Hint ${hintsRevealed + 1}`
                : 'All Hints Revealed'}
            </Button>
          </div>
        </CardHeader>
        {showHints && hintsRevealed > 0 && (
          <CardContent>
            <div className="space-y-2">
              {level.hints.slice(0, hintsRevealed).map((hint, i) => (
                <div
                  key={i}
                  className="rounded-md border border-border bg-bg-tertiary p-3 text-xs text-text-secondary"
                >
                  <span className="mr-2 font-bold text-warning">Hint {i + 1}:</span>
                  {hint}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Solution Toggle */}
      <Card className="mb-4">
        <button
          onClick={toggleSolution}
          className="flex w-full items-center justify-between p-4 text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            {showSolution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </div>
          {showSolution ? (
            <ChevronDown className="h-4 w-4 text-text-muted" />
          ) : (
            <ChevronRight className="h-4 w-4 text-text-muted" />
          )}
        </button>
        {showSolution && (
          <CardContent className="border-t border-border px-4 pb-4 pt-3">
            <p className="leading-relaxed">{level.solution}</p>
          </CardContent>
        )}
      </Card>

      {/* Insights Toggle */}
      <Card className="mb-4">
        <button
          onClick={toggleInsights}
          className="flex w-full items-center justify-between p-4 text-left cursor-pointer"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <BookOpen className="h-4 w-4" />
            {showInsights ? 'Hide Insights' : 'Show Insights'}
          </div>
          {showInsights ? (
            <ChevronDown className="h-4 w-4 text-text-muted" />
          ) : (
            <ChevronRight className="h-4 w-4 text-text-muted" />
          )}
        </button>
        {showInsights && (
          <CardContent className="border-t border-border px-4 pb-4 pt-3">
            <p className="leading-relaxed">{level.explanation}</p>
          </CardContent>
        )}
      </Card>

      {/* Complete Button */}
      {!isCompleted && (
        <div className="mt-auto pt-4">
          {!confirmComplete ? (
            <Button
              variant="success"
              size="lg"
              className="w-full"
              onClick={() => setConfirmComplete(true)}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark as Complete
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-center text-sm text-text-secondary">
                Are you sure you want to mark this level as complete?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setConfirmComplete(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="success"
                  className="flex-1"
                  onClick={() => {
                    completeLevel(currentLevelId, hintsRevealed);
                    setConfirmComplete(false);
                  }}
                >
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {isCompleted && (
        <div className={cn(
          'mt-auto rounded-lg border border-success/30 bg-success/10 p-4 text-center',
        )}>
          <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-success" />
          <p className="text-sm font-medium text-success">Level Completed</p>
        </div>
      )}
    </div>
  );
}
