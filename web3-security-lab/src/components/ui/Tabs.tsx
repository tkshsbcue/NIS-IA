import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { cn } from '@/lib/cn';

interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs components must be used within a Tabs provider');
  return ctx;
}

interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultTab: string;
  children: ReactNode;
}

function Tabs({ defaultTab, children, className, ...props }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('flex flex-col', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

function TabList({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex border-b border-border bg-bg-secondary',
        className,
      )}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
}

interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
}

function Tab({ value, className, children, ...props }: TabProps) {
  const { activeTab, setActiveTab } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={cn(
        'px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer',
        isActive
          ? 'text-accent border-b-2 border-accent'
          : 'text-text-muted hover:text-text-secondary border-b-2 border-transparent',
        className,
      )}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabPanel({ value, className, children, ...props }: TabPanelProps) {
  const { activeTab } = useTabs();

  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn('flex-1 overflow-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabList, Tab, TabPanel };
