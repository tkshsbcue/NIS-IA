import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { SplitLayout } from '@/components/layout/SplitLayout';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { Console } from '@/components/console/Console';
import { ChallengePanel } from '@/components/challenge/ChallengePanel';
import { AttackDashboard } from '@/components/challenge/AttackDashboard';
import { InsightsPanel } from '@/components/challenge/InsightsPanel';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { Tabs, TabList, Tab, TabPanel } from '@/components/ui/Tabs';

function App() {
  return (
    <div className="flex h-screen flex-col bg-bg-primary text-text-primary">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <SplitLayout
          left={
            <Tabs defaultTab="editor" className="flex flex-1 flex-col overflow-hidden">
              <TabList>
                <Tab value="editor">Editor</Tab>
                <Tab value="challenge">Challenge</Tab>
                <Tab value="leaderboard">Leaderboard</Tab>
              </TabList>
              <TabPanel value="editor" className="flex flex-1 flex-col">
                <CodeEditor />
              </TabPanel>
              <TabPanel value="challenge" className="flex flex-1 flex-col">
                <ChallengePanel />
              </TabPanel>
              <TabPanel value="leaderboard" className="flex flex-1 flex-col">
                <Leaderboard />
              </TabPanel>
            </Tabs>
          }
          right={
            <Tabs defaultTab="console" className="flex flex-1 flex-col overflow-hidden">
              <TabList>
                <Tab value="console">Console</Tab>
                <Tab value="attack">Attack Dashboard</Tab>
                <Tab value="insights">Insights</Tab>
              </TabList>
              <TabPanel value="console" className="flex flex-1 flex-col">
                <Console />
              </TabPanel>
              <TabPanel value="attack" className="flex flex-1 flex-col">
                <AttackDashboard />
              </TabPanel>
              <TabPanel value="insights" className="flex flex-1 flex-col">
                <InsightsPanel />
              </TabPanel>
            </Tabs>
          }
        />
      </div>
    </div>
  );
}

export default App;
