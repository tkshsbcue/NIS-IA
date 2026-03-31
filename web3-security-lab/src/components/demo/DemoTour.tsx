import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Play, Sparkles } from 'lucide-react';
import { useStore } from '@/store';

interface TourStep {
  target: string; // CSS selector or 'none' for center overlay
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // run before showing this step
  tab?: { panel: 'left' | 'right'; value: string };
}

const TOUR_STEPS: TourStep[] = [
  {
    target: 'none',
    title: 'Welcome to Web3 Security Lab!',
    description:
      'This interactive platform teaches you smart contract security by letting you exploit real vulnerabilities on the Ethereum Sepolia testnet. Let\'s take a quick tour of all the features!',
    position: 'center',
  },
  {
    target: '[data-tour="header"]',
    title: 'Header Bar',
    description:
      'The top bar shows the platform logo, your connected network status (Sepolia badge), and your wallet connection. Everything starts here.',
    position: 'bottom',
  },
  {
    target: '[data-tour="wallet"]',
    title: 'Wallet Connection',
    description:
      'Click "Connect Wallet" to link your MetaMask. The app auto-detects your network and prompts you to switch to Sepolia if needed. Your address and ETH balance are displayed once connected.',
    position: 'bottom',
  },
  {
    target: '[data-tour="sidebar"]',
    title: 'Challenge Levels',
    description:
      'The sidebar lists all 5 challenge levels, each targeting a real smart contract vulnerability: Reentrancy, Ownership Takeover, Delegatecall, Integer Overflow, and Selfdestruct. Click any level to begin. Difficulty badges and completion checkmarks track your progress.',
    position: 'right',
  },
  {
    target: '[data-tour="progress"]',
    title: 'Progress Tracker',
    description:
      'This bar shows how many levels you\'ve completed out of 5. Your progress is saved automatically in your browser — come back anytime to continue.',
    position: 'right',
  },
  {
    target: '[data-tour="left-tabs"]',
    title: 'Left Panel — Editor, Challenge & Leaderboard',
    description:
      'The left side has three tabs: the Code Editor for writing Solidity, the Challenge panel with level details and hints, and the Leaderboard showing rankings.',
    position: 'right',
    tab: { panel: 'left', value: 'editor' },
  },
  {
    target: '[data-tour="editor"]',
    title: 'Solidity Code Editor',
    description:
      'A full Monaco Editor (same engine as VS Code) with Solidity syntax highlighting. Each level pre-loads a vulnerable smart contract. You can edit, modify, or write your own attack contracts here.',
    position: 'right',
    tab: { panel: 'left', value: 'editor' },
  },
  {
    target: '[data-tour="editor-toolbar"]',
    title: 'Compile, Deploy & Reset',
    description:
      'Compile your Solidity code in the browser, deploy it to Sepolia via MetaMask with one click, or reset to the original challenge code. Compilation errors and warnings appear in the console.',
    position: 'bottom',
    tab: { panel: 'left', value: 'editor' },
  },
  {
    target: '[data-tour="challenge-tab"]',
    title: 'Challenge Panel',
    description:
      'Switch to the Challenge tab to see the current level\'s description, objective, attack steps checklist, and the hint system. This is your mission briefing!',
    position: 'right',
    tab: { panel: 'left', value: 'challenge' },
    action: () => {
      // Trigger tab switch via click
      const tab = document.querySelector('[data-tour="challenge-tab"]') as HTMLButtonElement;
      tab?.click();
    },
  },
  {
    target: '[data-tour="hints"]',
    title: 'Progressive Hint System',
    description:
      'Stuck? Reveal hints one at a time — each progressively more specific. Hint 1 gives a general direction, Hint 2 points to the exact vulnerability, and Hint 3 nearly gives the solution. Fewer hints used = higher leaderboard rank!',
    position: 'right',
    tab: { panel: 'left', value: 'challenge' },
  },
  {
    target: '[data-tour="solution-toggle"]',
    title: 'Solution & Insights Toggles',
    description:
      'Completely stuck? Reveal the full solution. After completing a level, the Insights toggle shows deep security education — vulnerability explanations, secure coding patterns, and real-world hack case studies.',
    position: 'right',
    tab: { panel: 'left', value: 'challenge' },
  },
  {
    target: '[data-tour="right-tabs"]',
    title: 'Right Panel — Console, Dashboard & Insights',
    description:
      'The right side has: a terminal Console for compilation/transaction output, the Attack Dashboard for guided step-by-step exploitation, and the Insights panel for post-level security education.',
    position: 'left',
    tab: { panel: 'right', value: 'console' },
  },
  {
    target: '[data-tour="console"]',
    title: 'Console Output',
    description:
      'A terminal-style console shows all activity: compilation results, deployment confirmations, transaction hashes (clickable links to Etherscan), errors, and warnings — all color-coded for quick scanning.',
    position: 'left',
    tab: { panel: 'right', value: 'console' },
  },
  {
    target: '[data-tour="attack-tab"]',
    title: 'Attack Dashboard',
    description:
      'The Attack Dashboard walks you through each exploit step-by-step. Each step shows what to do, the code involved, and how the contract\'s state changes. Click "Execute Step" to advance through the attack sequence.',
    position: 'left',
    tab: { panel: 'right', value: 'attack' },
    action: () => {
      const tab = document.querySelector('[data-tour="attack-tab"]') as HTMLButtonElement;
      tab?.click();
    },
  },
  {
    target: '[data-tour="insights-tab"]',
    title: 'Security Insights',
    description:
      'After completing a level, this panel teaches you the defense: what caused the vulnerability, the secure coding pattern that prevents it (with code examples), the real-world hack it mirrors, and which academic module it maps to (Module 3.1 / 3.4).',
    position: 'left',
    tab: { panel: 'right', value: 'insights' },
    action: () => {
      const tab = document.querySelector('[data-tour="insights-tab"]') as HTMLButtonElement;
      tab?.click();
    },
  },
  {
    target: '[data-tour="leaderboard-tab"]',
    title: 'Leaderboard',
    description:
      'Compete with others! The leaderboard ranks users by levels completed and hints efficiency. Complete all 5 levels with minimal hints to top the rankings.',
    position: 'right',
    tab: { panel: 'left', value: 'leaderboard' },
    action: () => {
      const tab = document.querySelector('[data-tour="leaderboard-tab"]') as HTMLButtonElement;
      tab?.click();
    },
  },
  {
    target: 'none',
    title: 'You\'re All Set!',
    description:
      'Connect your MetaMask wallet, pick a level from the sidebar, and start hacking! Remember: exploit the contract first, then learn the defense. That\'s how real security auditors think. Good luck!',
    position: 'center',
  },
];

function getTooltipStyle(
  rect: DOMRect | null,
  position: string,
  windowW: number,
  windowH: number,
): React.CSSProperties {
  if (!rect || position === 'center') {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  }

  const gap = 12;
  const style: React.CSSProperties = { position: 'fixed' };

  switch (position) {
    case 'bottom':
      style.top = rect.bottom + gap;
      style.left = Math.max(12, Math.min(rect.left, windowW - 420));
      break;
    case 'top':
      style.bottom = windowH - rect.top + gap;
      style.left = Math.max(12, Math.min(rect.left, windowW - 420));
      break;
    case 'right':
      style.top = Math.max(12, Math.min(rect.top, windowH - 280));
      style.left = rect.right + gap;
      break;
    case 'left':
      style.top = Math.max(12, Math.min(rect.top, windowH - 280));
      style.right = windowW - rect.left + gap;
      break;
  }

  return style;
}

export function DemoTour() {
  const [isActive, setIsActive] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const addConsoleMessage = useStore((s) => s.addConsoleMessage);

  const currentStep = TOUR_STEPS[step];

  const updateTargetRect = useCallback(() => {
    if (!isActive) return;
    const s = TOUR_STEPS[step];
    if (s.target === 'none') {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(s.target);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [isActive, step]);

  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [updateTargetRect]);

  const startTour = () => {
    setStep(0);
    setIsActive(true);
    addConsoleMessage({
      type: 'info',
      message: 'Demo tour started! Follow the highlights to explore all features.',
    });
  };

  const endTour = () => {
    setIsActive(false);
    setStep(0);
    // Reset tabs to defaults
    const editorTab = document.querySelector('[data-tour="editor-tab"]') as HTMLButtonElement;
    const consoleTab = document.querySelector('[data-tour="console-tab"]') as HTMLButtonElement;
    editorTab?.click();
    consoleTab?.click();
    addConsoleMessage({
      type: 'success',
      message: 'Demo tour complete! Connect your wallet and start hacking.',
    });
  };

  const goNext = () => {
    if (step < TOUR_STEPS.length - 1) {
      const nextStep = step + 1;
      const next = TOUR_STEPS[nextStep];
      // Execute action before showing step
      if (next.action) {
        next.action();
        // Small delay for DOM update after tab switch
        setTimeout(() => {
          setStep(nextStep);
        }, 100);
      } else {
        setStep(nextStep);
      }
    } else {
      endTour();
    }
  };

  const goPrev = () => {
    if (step > 0) {
      const prevStep = step - 1;
      const prev = TOUR_STEPS[prevStep];
      if (prev.action) {
        prev.action();
        setTimeout(() => setStep(prevStep), 100);
      } else {
        setStep(prevStep);
      }
    }
  };

  // Demo button (always visible)
  if (!isActive) {
    return (
      <button
        onClick={startTour}
        data-tour="demo-button"
        className="flex items-center gap-2 rounded-md bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-all hover:from-cyan-500 hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
      >
        <Play className="h-3.5 w-3.5" />
        Demo Tour
      </button>
    );
  }

  const padding = 6;
  const spotlightStyle: React.CSSProperties = targetRect
    ? {
        top: targetRect.top - padding,
        left: targetRect.left - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
        borderRadius: 8,
      }
    : { top: 0, left: 0, width: 0, height: 0 };

  const tooltipStyle = getTooltipStyle(
    targetRect,
    currentStep.position,
    window.innerWidth,
    window.innerHeight,
  );

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay with cutout */}
      <svg className="fixed inset-0 h-full w-full" style={{ zIndex: 1 }}>
        <defs>
          <mask id="tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={spotlightStyle.left as number}
                y={spotlightStyle.top as number}
                width={spotlightStyle.width as number}
                height={spotlightStyle.height as number}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.75)"
          mask="url(#tour-mask)"
        />
      </svg>

      {/* Spotlight border glow */}
      {targetRect && (
        <div
          className="fixed border-2 border-cyan-400 pointer-events-none"
          style={{
            ...spotlightStyle,
            zIndex: 2,
            boxShadow: '0 0 20px rgba(34,211,238,0.4), 0 0 40px rgba(34,211,238,0.15)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{ ...tooltipStyle, zIndex: 3, maxWidth: 400, minWidth: 320 }}
        className="rounded-xl border border-slate-600 bg-slate-900 p-5 shadow-2xl shadow-black/50"
      >
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-medium text-cyan-400">
              Step {step + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          <button
            onClick={endTour}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Title */}
        <h3 className="mb-2 text-base font-bold text-white">{currentStep.title}</h3>

        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-slate-300">
          {currentStep.description}
        </p>

        {/* Progress bar */}
        <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
            style={{ width: `${((step + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={endTour}
            className="text-xs text-slate-500 transition-colors hover:text-slate-300 cursor-pointer"
          >
            Skip Tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={goPrev}
                className="flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-slate-500 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Back
              </button>
            )}
            <button
              onClick={goNext}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:from-cyan-500 hover:to-blue-500 cursor-pointer"
            >
              {step === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              {step < TOUR_STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
