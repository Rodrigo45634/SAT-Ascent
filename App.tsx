
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { PracticeSession } from './components/PracticeSession';
import { ChallengeMode } from './components/ChallengeMode';
import { useSatLogic } from './hooks/useSatLogic';
import { BrainCircuit, Target, BarChart3, Trophy, Menu, X } from './components/icons';
import type { View, Subject } from './types';


const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { stats, dailyProgress, streak, updateStats, resetDailyProgress } = useSatLogic();

  const handlePracticeComplete = (subject: Subject, correct: boolean) => {
    updateStats(subject, correct);
  };
  
  // Fix: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const NavButton = ({ activeView, viewName, icon, label }: { activeView: View; viewName: View; icon: React.ReactElement; label: string }) => (
    <button
      onClick={() => {
        setView(viewName);
        setSidebarOpen(false);
      }}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        activeView === viewName
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-slate-600 hover:bg-slate-200'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full p-4 bg-slate-100 border-r border-slate-200">
      <div className="flex items-center mb-8">
        <Trophy className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-800 ml-2">SAT Ascent</h1>
      </div>
      <nav className="space-y-2">
        <NavButton activeView={view} viewName="dashboard" icon={<BarChart3 className="h-5 w-5" />} label="Dashboard" />
        <NavButton activeView={view} viewName="practice" icon={<BrainCircuit className="h-5 w-5" />} label="Practice" />
        <NavButton activeView={view} viewName="challenge" icon={<Target className="h-5 w-5" />} label="Challenge Mode" />
      </nav>
      <div className="mt-auto text-center text-xs text-slate-500">
          <p>&copy; 2024 SAT Ascent. All rights reserved.</p>
      </div>
    </div>
  );

  const renderView = () => {
    switch (view) {
      case 'practice':
        return <PracticeSession onQuestionAnswered={handlePracticeComplete} stats={stats} />;
      case 'challenge':
        return <ChallengeMode onQuestionAnswered={handlePracticeComplete} />;
      case 'dashboard':
      default:
        return <Dashboard stats={stats} dailyProgress={dailyProgress} streak={streak} resetDailyProgress={resetDailyProgress} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-30 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
        <div className="w-64 h-full">
            {sidebarContent}
        </div>
        <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex md:hidden items-center justify-between p-4 bg-slate-100 border-b border-slate-200">
            <div className="flex items-center">
                <Trophy className="h-7 w-7 text-blue-600" />
                <h1 className="text-xl font-bold text-slate-800 ml-2">SAT Ascent</h1>
            </div>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2">
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;