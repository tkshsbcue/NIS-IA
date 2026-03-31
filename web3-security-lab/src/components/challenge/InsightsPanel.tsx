import { ShieldAlert, ShieldCheck, Globe, BookMarked } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/store';
import { getLevelById } from '@/levels';

export function InsightsPanel() {
  const { currentLevelId, progress, showInsights } = useStore();
  const level = getLevelById(currentLevelId);
  const isCompleted = progress[currentLevelId]?.completed;

  if (!level) {
    return (
      <div className="flex flex-1 items-center justify-center text-text-muted">
        No level selected
      </div>
    );
  }

  if (!isCompleted && !showInsights) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <ShieldAlert className="h-10 w-10 text-text-muted" />
        <p className="text-sm text-text-muted">
          Complete this level or toggle "Show Insights" in the Challenge panel to
          reveal security education content.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      {/* Vulnerability Explanation */}
      <Card glow="danger">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-danger" />
            <CardTitle>Vulnerability Explanation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">{level.explanation}</p>
        </CardContent>
      </Card>

      {/* Secure Coding Practices */}
      <Card glow="success">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success" />
            <CardTitle>Secure Coding Practices</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-bg-primary p-3 font-mono text-xs leading-relaxed text-text-secondary">
            {level.secureCoding}
          </pre>
        </CardContent>
      </Card>

      {/* Real-World Impact */}
      <Card glow="accent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            <CardTitle>Real-World Impact</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed">{level.realWorldImpact}</p>
        </CardContent>
      </Card>

      {/* Module Mapping */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-text-muted" />
            <CardTitle>Module Reference</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Badge variant="info">{level.moduleMapping}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
