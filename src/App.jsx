import React from 'react';
import { GameProvider, useGameContext } from './context/GameContext.jsx';
import Navigation from './components/layout/Navigation.jsx';
import Footer from './components/layout/Footer.jsx';

import LandingPage from './pages/LandingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GameSelectionPage from './pages/GameSelectionPage.jsx';
import InstructionsPage from './pages/InstructionsPage.jsx';
import PracticeGamePage from './pages/PracticeGamePage.jsx';
import MockAssessmentPage from './pages/MockAssessmentPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import DevPage from './pages/DevPage.jsx';

function AppContent() {
  const { activeView, settings } = useGameContext();
  const isAssessmentActive = activeView === 'practice' || activeView === 'mock';

  const isDark = settings?.darkMode;

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-brand-500 selection:text-white transition-colors duration-200 ${
      isDark ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {!isAssessmentActive && <Navigation />}

      <main className="flex-1">
        {activeView === 'landing' && <LandingPage />}
        {activeView === 'dashboard' && <DashboardPage />}
        {activeView === 'selection' && <GameSelectionPage />}
        {activeView === 'instructions' && <InstructionsPage />}
        {activeView === 'practice' && <PracticeGamePage />}
        {activeView === 'mock' && <MockAssessmentPage />}
        {activeView === 'results' && <ResultsPage />}
        {activeView === 'dev' && <DevPage />}
      </main>

      {!isAssessmentActive && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
