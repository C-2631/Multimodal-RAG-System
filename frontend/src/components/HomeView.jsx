import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { ThreeDVectorOrb } from './ThreeDVectorOrb';
import { ThreeDAudioRibbon } from './ThreeDAudioRibbon';
import { ThreeDVectorGalaxy } from './ThreeDVectorGalaxy';
import { TiltCard3D } from './TiltCard3D';
import {
  Search,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  FileCode,
  Mic,
  Video,
  X,
  Compass,
  CheckCircle2,
  Clock,
  Database,
  Sparkles,
  Upload,
  Bot,
} from 'lucide-react';

export const HomeView = () => {
  const {
    queryText,
    setQueryText,
    queryImage,
    setQueryImage,
    clearQueryImage,
    activeModality,
    setActiveModality,
    executeSearch,
    setActiveTab,
    setSearchViewMode,
  } = useAppStore();

  const [isDragging, setIsDragging] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [hero3DMode, setHero3DMode] = useState('galaxy'); // 'galaxy' | 'orb'

  const modalityChips = [
    { id: 'all', label: 'All Formats', icon: Sparkles },
    { id: 'text', label: 'Text', icon: FileText },
    { id: 'image', label: 'Image', icon: ImageIcon },
    { id: 'pdf', label: 'PDF', icon: FileCode },
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'video', label: 'Video', icon: Video },
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (queryText.trim() || queryImage) {
        setSearchViewMode('list');
        executeSearch(queryText.trim());
      }
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setQueryImage({ file, previewUrl });
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setQueryImage({ file, previewUrl });
    }
  };

  return (
    <div className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      
      {/* Soft pastel decorative gradient blooms */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-pastel-lavender/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-96 h-96 bg-pastel-peach/25 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid: Left Copy & Search, Right 3D Visual & Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-purple-200/70 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
              <span className="font-mono text-xs uppercase tracking-widest font-semibold text-brand-800">
                Multimodal RAG System
              </span>
            </div>

            {/* Editorial Serif Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.12]">
              Search Smarter. <br />
              <span className="italic font-normal bg-gradient-to-r from-brand-700 via-brand-600 to-amberGold bg-clip-text text-transparent">
                Discover Deeper.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg max-w-xl font-sans leading-relaxed">
              Ask anything — from text, images, documents, videos or audio. Our AI finds the most relevant and up-to-date information, with clear verified sources.
            </p>

            {/* Massive Pill-Shaped Search Bar matching reference */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleImageDrop}
              className={`relative bg-white rounded-full p-2 pl-5 pr-2.5 shadow-float-pill border transition-all duration-300 ${
                isDragging
                  ? 'border-brand-500 ring-4 ring-purple-100 scale-[1.01]'
                  : 'border-purple-200/80 hover:border-brand-400 focus-within:border-brand-600 focus-within:ring-4 focus-within:ring-purple-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />

                {/* Optional dropped image preview badge inside input */}
                {queryImage && (
                  <div className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-medium text-brand-800 shrink-0">
                    <img
                      src={queryImage.previewUrl}
                      alt="Query preview"
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="max-w-[100px] truncate">Image Query</span>
                    <button
                      onClick={clearQueryImage}
                      className="text-slate-400 hover:text-rose-500 ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search with text, images, files, or voice..."
                  className="w-full bg-transparent border-none text-slate-800 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-0"
                />

                {/* Upload Image trigger */}
                <label className="p-2 text-slate-400 hover:text-brand-600 cursor-pointer rounded-full hover:bg-purple-50 transition-colors shrink-0" title="Attach Image Query">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <ImageIcon className="w-5 h-5" />
                </label>

                {/* Voice Search trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setIsVoiceActive(!isVoiceActive);
                    if (!isVoiceActive) {
                      setQueryText("Synthesizing coastal oceanographic frequency wave data...");
                    }
                  }}
                  className={`p-2 rounded-full transition-colors shrink-0 ${
                    isVoiceActive
                      ? 'bg-amber-100 text-amberGold-dark'
                      : 'text-slate-400 hover:text-amberGold hover:bg-amber-50'
                  }`}
                  title="Toggle 3D Acoustic Ribbon"
                >
                  <Mic className="w-5 h-5" />
                </button>

                {/* Submit Circle Button */}
                <button
                  onClick={() => {
                    if (queryText.trim() || queryImage) {
                      setSearchViewMode('list');
                      executeSearch(queryText.trim());
                    }
                  }}
                  className="w-11 h-11 rounded-full bg-brand-600 hover:bg-brand-700 active:scale-95 text-white flex items-center justify-center shadow-md shadow-brand-500/25 transition-all shrink-0 cursor-pointer"
                  title="Run Multimodal Search"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 3D Acoustic & Resonance Wave Ribbon (Feature 5) */}
            {(isVoiceActive || activeModality === 'audio') && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <ThreeDAudioRibbon isListening={true} />
              </div>
            )}

            {/* Modality Filter Chips (Text, Image, PDF, Audio, Video) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {modalityChips.map((chip) => {
                const Icon = chip.icon;
                const isSelected = activeModality === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => {
                      setActiveModality(chip.id);
                      if (chip.id === 'audio') setIsVoiceActive(true);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-brand-50 text-brand-800 border-brand-300 font-semibold shadow-xs'
                        : 'bg-white/80 text-slate-600 border-slate-200/80 hover:border-purple-200 hover:bg-purple-50/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                    {chip.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Sample Prompts */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Try asking:</span>
              <button
                onClick={() => {
                  setSearchViewMode('list');
                  setQueryText("climate change in antarctica");
                  executeSearch("climate change in antarctica");
                }}
                className="underline hover:text-brand-700 decoration-purple-300 font-medium"
              >
                "climate change in antarctica"
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setSearchViewMode('list');
                  setQueryText("climate change impact on coastal cities");
                  executeSearch("climate change impact on coastal cities");
                }}
                className="underline hover:text-brand-700 decoration-purple-300 font-medium"
              >
                "coastal city flood impact"
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setSearchViewMode('list');
                  setQueryText("The Future of Renewable Energy");
                  executeSearch("The Future of Renewable Energy");
                }}
                className="underline hover:text-brand-700 decoration-purple-300 font-medium"
              >
                "renewable energy trends"
              </button>
            </div>

          </div>

          {/* Right Hero Column: Interactive 3D Vector Space & Floating Media Cards */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            
            {/* 3D Mode Selector on Home Page */}
            <div className="mb-3 flex items-center gap-1.5 p-1 rounded-full bg-white/90 backdrop-blur-md border border-purple-200 shadow-xs">
              <button
                onClick={() => setHero3DMode('galaxy')}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  hero3DMode === 'galaxy'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-brand-700'
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-amberGold" />
                <span>3D Robot Galaxy</span>
              </button>
              <button
                onClick={() => setHero3DMode('orb')}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  hero3DMode === 'orb'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-brand-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amberGold" />
                <span>3D Vector Orb</span>
              </button>
            </div>

            {/* The 3D Canvas (Displays Cartoon Robot Galaxy or Vector Orb) */}
            <div className="w-full relative z-10 bg-white/40 backdrop-blur-sm rounded-4xl border border-purple-100/80 p-2 shadow-soft-card overflow-hidden">
              {hero3DMode === 'galaxy' ? <ThreeDVectorGalaxy /> : <ThreeDVectorOrb />}
            </div>

            {/* Floating Editorial Satellite Cards with 3D Tilt */}
            <div className="w-full mt-4 grid grid-cols-2 gap-3 z-20">
              
              {/* Card 1: Visual insight thumbnail */}
              <TiltCard3D
                maxTilt={12}
                scale={1.03}
                onClick={() => setActiveTab('explore')}
                className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-purple-100 shadow-sm flex items-center gap-3 cursor-pointer hover:border-brand-400 transition-all group text-left"
              >
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=150&q=80"
                  alt="Explore"
                  className="w-12 h-12 rounded-xl object-cover group-hover:scale-105 transition-transform"
                />
                <div className="text-left">
                  <span className="font-mono text-[10px] text-amberGold font-bold uppercase tracking-wider">Visual Search</span>
                  <p className="text-xs font-semibold text-slate-800 leading-tight">Explore with Images</p>
                </div>
              </TiltCard3D>

              {/* Card 2: Knowledge vectors */}
              <TiltCard3D
                maxTilt={12}
                scale={1.03}
                onClick={() => setActiveTab('chat')}
                className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-purple-100 shadow-sm flex items-center gap-3 cursor-pointer hover:border-brand-400 transition-all group text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-brand-600 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <span className="font-mono text-[10px] text-brand-600 font-bold uppercase tracking-wider">AI Assistant</span>
                  <p className="text-xs font-semibold text-slate-800 leading-tight">Ask Researchly</p>
                </div>
              </TiltCard3D>
            </div>

            {/* Direct 3D Galaxy Launch Button */}
            <button
              onClick={() => {
                setSearchViewMode('galaxy');
                setQueryText("climate change impact on coastal cities");
                executeSearch("climate change impact on coastal cities");
              }}
              className="mt-3 w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-amberGold text-white text-xs font-semibold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amberGold fill-amberGold animate-spin-slow" />
              <span>Launch 3D Vector Galaxy & Results</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Handwritten style subtext note */}
            <p className="mt-3 text-xs font-mono text-purple-700/80 tracking-wide font-medium italic">
              ✦ Cross-modal CLIP embeddings across text & visuals
            </p>

          </div>

        </div>

        {/* Amber ruled divider */}
        <hr className="amber-rule my-14" />

        {/* Bottom Trust Metrics Bar matching reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left divide-y md:divide-y-0 md:divide-x divide-purple-100">
          
          <div className="sm:px-6">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-brand-700">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display font-bold text-3xl text-slate-900">10M+</p>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Knowledge Sources</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-sans">
              Indexed multimodal vectors across journals, high-res diagrams & research repositories.
            </p>
          </div>

          <div className="sm:px-6 pt-4 md:pt-0">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amberGold-dark">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display font-bold text-3xl text-slate-900">99.2%</p>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Accuracy Rate</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-sans">
              Cross-encoder reranking guarantees grounded citation attribution with zero hallucinations.
            </p>
          </div>

          <div className="sm:px-6 pt-4 md:pt-0">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display font-bold text-3xl text-slate-900">&lt; 2s</p>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">Average Response</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-sans">
              HNSW vector index query pipeline optimized for real-time sub-second retrieval.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
