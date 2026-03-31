import { useState } from 'react';
import { CheckCircle2, Play, ArrowRight, Code2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useStore } from '@/store';
import { getLevelById } from '@/levels';

export function AttackDashboard() {
  const { currentLevelId, addConsoleMessage } = useStore();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const level = getLevelById(currentLevelId);

  if (!level) {
    return (
      <div className="flex flex-1 items-center justify-center text-text-muted">
        No level selected
      </div>
    );
  }

  const steps = level.attackSteps;

  const executeStep = () => {
    const step = steps[activeStep];
    if (!step) return;

    addConsoleMessage({
      type: 'info',
      message: `Executing step ${activeStep + 1}: ${step.title}`,
    });

    if (step.stateChange) {
      addConsoleMessage({
        type: 'success',
        message: `State: ${step.stateChange}`,
      });
    }

    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(activeStep);
      return next;
    });

    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const resetSteps = () => {
    setActiveStep(0);
    setCompletedSteps(new Set());
    addConsoleMessage({ type: 'info', message: 'Attack steps reset.' });
  };

  return (
    <div className="flex flex-1 flex-col overflow-y-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Attack Visualization
        </h3>
        <Button size="sm" variant="ghost" onClick={resetSteps}>
          Reset
        </Button>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const isActive = i === activeStep;
          const isCompleted = completedSteps.has(i);

          return (
            <Card
              key={i}
              glow={isActive ? 'accent' : isCompleted ? 'success' : undefined}
              className={cn(
                'transition-all',
                isActive && 'border-accent/50',
                isCompleted && 'border-success/30',
              )}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
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
                      i + 1
                    )}
                  </span>
                  <CardTitle className="text-sm">{step.title}</CardTitle>
                  {isActive && !isCompleted && (
                    <ArrowRight className="ml-auto h-4 w-4 animate-pulse text-accent" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-2">{step.description}</p>

                {step.code && (
                  <div className="mb-2 flex items-start gap-2 rounded-md bg-bg-primary p-2">
                    <Code2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    <code className="break-all font-mono text-xs text-accent">
                      {step.code}
                    </code>
                  </div>
                )}

                {step.stateChange && (
                  <div className="rounded-md border border-border bg-bg-primary p-2 text-xs text-text-muted">
                    <span className="font-bold text-text-secondary">State: </span>
                    {step.stateChange}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Execute Button */}
      <div className="mt-4">
        <Button
          className="w-full"
          onClick={executeStep}
          disabled={completedSteps.size === steps.length}
        >
          <Play className="h-4 w-4" />
          {completedSteps.size === steps.length
            ? 'All Steps Complete'
            : `Execute Step ${activeStep + 1}`}
        </Button>
      </div>
    </div>
  );
}
