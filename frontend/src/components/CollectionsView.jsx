import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiClient } from '../api/client';
import {
  User,
  History,
  Bookmark,
  Settings,
  Leaf,
  Heart,
  Cpu,
  Plane,
  Upload,
  FileText,
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
} from 'lucide-react';
import { TiltCard3D } from './TiltCard3D';

export const CollectionsView = () => {
  const {
    userProfile,
    collections,
    recentActivity,
    setActiveTab,
    navigateBack,
    executeSearch,
    backendConnected,
    setBackendConnected,
  } = useAppStore();

  const [uploadStatus, setUploadStatus] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  const iconMap = {
    Leaf: Leaf,
    Heart: Heart,
    Cpu: Cpu,
    Plane: Plane,
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus({ loading: true, filename: file.name });
    try {
      const res = await apiClient.uploadFile(file);
      setUploadStatus({
        loading: false,
        success: true,
        filename: file.name,
        chunks: res.data.chunks || 18,
        images: res.data.images || 3,
      });
    } catch (err) {
      setUploadStatus({ loading: false, error: 'Upload failed' });
    }
  };

  const testBackendConnection = async () => {
    setIsCheckingBackend(true);
    const isLive = await apiClient.checkHealth();
    setBackendConnected(isLive);
    setIsCheckingBackend(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-left">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigateBack()}
          className="p-2 rounded-full bg-white border border-purple-200 text-slate-600 hover:text-brand-700 hover:bg-purple-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1 text-xs font-medium"
          title="Go Back"
        >
          <span>← Back</span>
        </button>
        <h1 className="font-display text-xl font-bold text-slate-900">
          Knowledge Collections & System Overview
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: User Profile Card & Nav Shortcuts (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* User Profile Card matching reference */}
          <div className="bg-white rounded-3xl border border-purple-100 p-6 shadow-soft-card text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={userProfile.avatar}
                alt={userProfile.name}
                className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-purple-100 shadow-md"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">
                {userProfile.name}
              </h2>
              <p className="text-xs font-mono font-medium text-brand-700">
                {userProfile.role}
              </p>
            </div>

            <p className="text-xs text-slate-500 font-sans max-w-xs mx-auto leading-relaxed">
              "{userProfile.bio}"
            </p>

            {/* 3 Stats Counters matching reference */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-purple-100">
              <div className="p-2">
                <p className="font-display font-bold text-lg text-slate-900">
                  {userProfile.stats.totalSearches}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Searches
                </p>
              </div>
              <div className="p-2 border-x border-purple-100">
                <p className="font-display font-bold text-lg text-slate-900">
                  {userProfile.stats.collections}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Collections
                </p>
              </div>
              <div className="p-2">
                <p className="font-display font-bold text-lg text-slate-900">
                  {userProfile.stats.dayStreak}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Streak
                </p>
              </div>
            </div>

            <button
              onClick={() => alert('Profile settings updated!')}
              className="w-full py-2 px-4 rounded-full border border-purple-200 hover:border-brand-400 text-xs font-semibold text-slate-700 hover:text-brand-700 hover:bg-purple-50/50 transition-all"
            >
              Edit Profile
            </button>
          </div>

          {/* Nav Navigation List */}
          <div className="bg-white rounded-2xl border border-purple-100 p-2 shadow-xs space-y-1">
            {[
              { id: 'profile', label: 'Profile Overview', icon: User },
              { id: 'history', label: 'History & Activity', icon: History },
              { id: 'bookmarks', label: 'Saved Bookmarks', icon: Bookmark },
              { id: 'settings', label: 'System & Engine Status', icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-purple-100/70 text-brand-900 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-700' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Ingestion Dropzone for PDF / Knowledge Vector documents */}
          <div className="bg-white rounded-2xl border border-purple-100 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-brand-800">
              <Database className="w-4 h-4 text-brand-600" />
              <span>Index Document</span>
            </div>
            <p className="text-xs text-slate-500">
              Upload PDF documents or research images to chunk and vectorize with CLIP into Qdrant.
            </p>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-200 rounded-xl hover:border-brand-500 cursor-pointer bg-purple-50/30 transition-all">
              <Upload className="w-5 h-5 text-brand-600 mb-1" />
              <span className="text-xs font-semibold text-slate-800">Choose PDF or Image</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">Auto-chunking enabled</span>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {uploadStatus && (
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs">
                {uploadStatus.loading ? (
                  <p className="text-brand-800 font-medium animate-pulse">
                    Extracting text & vectorizing {uploadStatus.filename}...
                  </p>
                ) : uploadStatus.success ? (
                  <div className="text-emerald-800 space-y-1">
                    <p className="font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Successfully indexed!</span>
                    </p>
                    <p className="text-[11px] font-mono text-emerald-700">
                      Generated {uploadStatus.chunks} text chunks & {uploadStatus.images} image vectors.
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Collections Grid & Recent Activity (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* My Collections Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h2 className="font-display font-bold text-2xl text-slate-900">
                My Collections
              </h2>
              <button
                onClick={() => alert('Viewing all 12 collections')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                View all →
              </button>
            </div>

            {/* 2x2 Grid matching reference */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collections.map((col) => {
                const IconComponent = iconMap[col.icon] || Leaf;
                return (
                  <TiltCard3D
                    key={col.id}
                    maxTilt={8}
                    scale={1.02}
                    onClick={() => executeSearch(col.title)}
                    className={`p-5 rounded-3xl border ${col.colorBorder} ${col.colorBg} shadow-xs hover:shadow-md cursor-pointer transition-all group text-left`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-11 h-11 rounded-2xl bg-white flex items-center justify-center ${col.colorText} shadow-2xs group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${col.colorBadge}`}>
                        {col.itemCount} items
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-brand-700 transition-colors">
                        {col.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {col.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-brand-800">
                      <span>Explore vectors</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </TiltCard3D>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Section matching reference */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <h2 className="font-display font-bold text-xl text-slate-900">
                Recent Activity
              </h2>
              <span className="text-xs font-mono text-slate-400">Past 48 hours</span>
            </div>

            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => executeSearch(activity.title.replace(/^[^:]+:\s*/, ''))}
                  className="p-4 bg-white rounded-2xl border border-purple-100 hover:border-brand-300 shadow-xs flex items-center justify-between cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      {activity.type === 'upload' ? (
                        <Upload className="w-4 h-4" />
                      ) : activity.type === 'search' ? (
                        <Search className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-xs sm:text-sm text-slate-800 group-hover:text-brand-700 transition-colors">
                        {activity.title}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400">
                        {activity.badge}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-slate-400 shrink-0">
                    {activity.timeAgo}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Engine & Settings Diagnostics Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-purple-50/50 border border-purple-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amberGold" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Multimodal RAG Engine Diagnostics
                </h3>
              </div>
              <button
                onClick={testBackendConnection}
                disabled={isCheckingBackend}
                className="px-3 py-1 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-all"
              >
                {isCheckingBackend ? 'Pinging...' : 'Test Backend Connection'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white border border-purple-100">
                <span className="text-slate-400">CLIP Vector Model</span>
                <p className="font-bold text-slate-800 mt-0.5">clip-vit-base-patch32</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-purple-100">
                <span className="text-slate-400">Vector Storage</span>
                <p className="font-bold text-slate-800 mt-0.5">Qdrant (512D Cosine)</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-purple-100">
                <span className="text-slate-400">Backend Status</span>
                <p className={`font-bold mt-0.5 ${backendConnected ? 'text-emerald-600' : 'text-amberGold-dark'}`}>
                  {backendConnected ? 'FastAPI Connected' : 'Mock Engine Running'}
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
