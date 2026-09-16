import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { apiClient } from './api/client';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { SearchResultsView } from './components/SearchResultsView';
import { ExploreImageView } from './components/ExploreImageView';
import { DetailView } from './components/DetailView';
import { ChatView } from './components/ChatView';
import { CollectionsView } from './components/CollectionsView';
import { ImageModal } from './components/ImageModal';
import { ThreeDAICompanion } from './components/ThreeDAICompanion';

export const App = () => {
  const { activeTab, setBackendConnected } = useAppStore();

  useEffect(() => {
    // Check if FastAPI backend is available on startup
    apiClient.checkHealth().then((isLive) => {
      setBackendConnected(isLive);
    });
  }, [setBackendConnected]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9FE] text-slate-800 font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Top Navbar */}
      <Navbar />

      {/* Main View Renderer based on activeTab */}
      <main className="flex-1">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'search' && <SearchResultsView />}
        {activeTab === 'explore' && <ExploreImageView />}
        {activeTab === 'detail' && <DetailView />}
        {activeTab === 'chat' && <ChatView />}
        {activeTab === 'collections' && <CollectionsView />}
      </main>

      {/* Lightbox Modal for Visual Assets */}
      <ImageModal />

      {/* 3D Cartoon / Movie AI Companion Mascot */}
      <ThreeDAICompanion />

      {/* Editorial Footer */}
      <footer className="w-full border-t border-purple-100/70 py-6 bg-white/50 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Researchly Multimodal RAG • Powered by CLIP & Qdrant</span>
          <span>Editorial Research Journal meets Modern AI</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
