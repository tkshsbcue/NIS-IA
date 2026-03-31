import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
}

export function SplitLayout({ left, right, className }: SplitLayoutProps) {
  return (
    <div className={cn('flex flex-1 overflow-hidden', className)}>
      <div className="flex w-1/2 flex-col overflow-hidden border-r border-border">
        {left}
      </div>
      <div className="flex w-1/2 flex-col overflow-hidden">
        {right}
      </div>
    </div>
  );
}
