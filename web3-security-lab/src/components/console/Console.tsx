import { useEffect, useRef } from 'react';
import { Trash2, Terminal } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store';
import type { ConsoleMessage } from '@/types';

const ETHERSCAN_BASE = 'https://sepolia.etherscan.io/tx/';

const typeColors: Record<ConsoleMessage['type'], string> = {
  info: 'text-accent',
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  tx: 'text-purple-400',
};

const typePrefix: Record<ConsoleMessage['type'], string> = {
  info: '[INFO]',
  success: '[OK]',
  error: '[ERR]',
  warning: '[WARN]',
  tx: '[TX]',
};

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-US', { hour12: false });
}

export function Console() {
  const { consoleMessages, clearConsole } = useStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleMessages.length]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-bg-secondary px-3 py-2">
        <div className="flex items-center gap-2 text-text-muted">
          <Terminal className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Console</span>
        </div>
        <Button size="sm" variant="ghost" onClick={clearConsole}>
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-bg-primary p-3 font-mono text-xs leading-relaxed">
        {consoleMessages.length === 0 && (
          <div className="text-text-muted">
            {'>'} Awaiting commands...
          </div>
        )}

        {consoleMessages.map((msg) => (
          <div key={msg.id} className="flex gap-2 py-0.5">
            <span className="shrink-0 text-text-muted">{formatTime(msg.timestamp)}</span>
            <span className={cn('shrink-0 font-bold', typeColors[msg.type])}>
              {typePrefix[msg.type]}
            </span>
            <span className={cn('break-all', typeColors[msg.type])}>
              {msg.message}
              {msg.txHash && (
                <>
                  {' '}
                  <a
                    href={`${ETHERSCAN_BASE}${msg.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-accent"
                  >
                    View on Etherscan
                  </a>
                </>
              )}
            </span>
          </div>
        ))}

        <div className="cursor-blink mt-1 text-accent" ref={bottomRef}>
          {'> '}
        </div>
      </div>
    </div>
  );
}
