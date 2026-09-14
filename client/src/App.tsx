import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { VideoUploadPage } from './pages/VideoUploadPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { VideoReviewPage } from './pages/VideoReviewPage';
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage';
import { PlayerComparisonPage } from './pages/PlayerComparisonPage';
import { SavedReportsPage } from './pages/SavedReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AnalysisRecord } from './types/basketball';
import { fetchAnalyses, updateAnalysis, deleteAnalysis } from './services/api';
import { SAMPLE_ANALYSES } from './services/sampleData';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>(SAMPLE_ANALYSES);
  const [activeAnalysisId, setActiveAnalysisId] = useState<string>('analysis-curry-stepback-3pt');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load analyses on mount
  useEffect(() => {
    fetchAnalyses().then((data) => {
      if (data && data.length > 0) {
        setAnalyses(data);
        if (!activeAnalysisId) {
          setActiveAnalysisId(data[0].id);
        }
      }
    });
  }, []);

  const currentAnalysis = analyses.find(a => a.id === activeAnalysisId) || analyses[0] || SAMPLE_ANALYSES[0];

  const handleNavigate = (page: string, id?: string) => {
    if (id) {
      setActiveAnalysisId(id);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchSample = (sampleId: string) => {
    setActiveAnalysisId(sampleId);
    setCurrentPage('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartProcessing = (analysisId: string) => {
    setProcessingId(analysisId);
    setActiveAnalysisId(analysisId);
    setCurrentPage('processing');
  };

  const handleProcessingComplete = (completedRecord: AnalysisRecord) => {
    setAnalyses(prev => {
      const idx = prev.findIndex(a => a.id === completedRecord.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = completedRecord;
        return next;
      }
      return [completedRecord, ...prev];
    });
    setActiveAnalysisId(completedRecord.id);
    setCurrentPage('review');
  };

  const handleUpdateAnalysis = async (id: string, patch: Partial<AnalysisRecord>) => {
    const updated = await updateAnalysis(id, patch);
    if (updated) {
      setAnalyses(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
    }
  };

  const handleUpdateTitle = async (id: string, newTitle: string) => {
    await handleUpdateAnalysis(id, { title: newTitle });
  };

  const handleDeleteAnalysis = async (id: string) => {
    await deleteAnalysis(id);
    setAnalyses(prev => prev.filter(a => a.id !== id));
    if (activeAnalysisId === id) {
      const remaining = analyses.filter(a => a.id !== id);
      if (remaining.length > 0) {
        setActiveAnalysisId(remaining[0].id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activePage={currentPage}
        onNavigate={handleNavigate}
        activeAnalysisId={activeAnalysisId}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            onNavigate={handleNavigate}
            onLaunchSample={handleLaunchSample}
          />
        )}

        {currentPage === 'auth' && (
          <AuthPage
            onLoginSuccess={() => handleNavigate('dashboard')}
          />
        )}

        {currentPage === 'dashboard' && (
          <DashboardPage
            analyses={analyses}
            onNavigate={handleNavigate}
            onSelectAnalysis={(id) => setActiveAnalysisId(id)}
          />
        )}

        {currentPage === 'upload' && (
          <VideoUploadPage
            onStartProcessing={handleStartProcessing}
            onLaunchSample={handleLaunchSample}
          />
        )}

        {currentPage === 'processing' && processingId && (
          <ProcessingPage
            analysisId={processingId}
            onComplete={handleProcessingComplete}
            onCancel={() => handleNavigate('upload')}
          />
        )}

        {currentPage === 'review' && currentAnalysis && (
          <VideoReviewPage
            analysis={currentAnalysis}
            onNavigate={handleNavigate}
            onUpdateAnalysis={handleUpdateAnalysis}
          />
        )}

        {currentPage === 'analytics' && currentAnalysis && (
          <AnalyticsDashboardPage
            analysis={currentAnalysis}
            onNavigate={handleNavigate}
            onUpdateAnalysis={handleUpdateAnalysis}
          />
        )}

        {currentPage === 'compare' && (
          <PlayerComparisonPage
            analyses={analyses}
          />
        )}

        {currentPage === 'reports' && (
          <SavedReportsPage
            analyses={analyses}
            onNavigate={handleNavigate}
            onUpdateTitle={handleUpdateTitle}
            onDeleteAnalysis={handleDeleteAnalysis}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsPage />
        )}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default App;
