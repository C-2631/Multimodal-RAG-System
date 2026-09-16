import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, Search, Compass, FolderHeart, MessageSquareText, ShieldCheck, ArrowLeft } from 'lucide-react';

export const Navbar = () => {
  const { activeTab, setActiveTab, userProfile, backendConnected, navigateBack } = useAppStore();

  const navLinks = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'collections', label: 'Collections', icon: FolderHeart },
    { id: 'chat', label: 'Chat', icon: MessageSquareText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF9FE]/85 backdrop-blur-md border-b border-purple-100/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-amberGold text-amberGold" />
          </div>
          <div>
            <span className="font-display font-bold text-2xl tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">
              Researchly
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-purple-100/80 text-brand-800 font-semibold border border-purple-200/50">
              Multimodal RAG
            </span>
          </div>
        </div>

        {/* Navigation Tabs (pill style matching reference) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/70 p-1.5 rounded-full border border-purple-100 shadow-sm">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-brand-700 hover:bg-purple-50/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amberGold' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Status Indicator & User Profile */}
        <div className="flex items-center gap-3">
          
          {/* Back Button — shown on all non-home pages */}
          {activeTab !== 'home' && (
            <button
              onClick={navigateBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-purple-200 text-xs font-medium text-slate-600 hover:text-brand-700 hover:bg-purple-50 shadow-xs transition-all cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-brand-600" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          {/* Backend Engine Status Pill */}
          <div 
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-medium border bg-white/80 shadow-xs"
            title={backendConnected ? 'Connected to FastAPI backend' : 'Running on high-fidelity mock vector engine'}
          >
            <span className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amberGold'}`} />
            <span className="text-slate-700">
              {backendConnected ? 'FastAPI Live' : 'Mock Engine'}
            </span>
          </div>

          {/* Quick Search trigger button */}
          <button
            onClick={() => setActiveTab('search')}
            className="p-2.5 rounded-full text-slate-500 hover:text-brand-700 hover:bg-purple-50 transition-colors"
            title="Open Search Results"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User Profile Avatar */}
          <div
            onClick={() => setActiveTab('collections')}
            className="flex items-center gap-2.5 cursor-pointer pl-1 group"
          >
            <div className="relative">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-200 group-hover:ring-brand-500 transition-all shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight group-hover:text-brand-700">
                {userProfile.name}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                {userProfile.role}
              </p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
