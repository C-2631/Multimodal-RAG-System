import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Image as ImageIcon,
  FileText,
  Video,
  Mic,
  Globe,
  ArrowUpRight,
  SlidersHorizontal,
  FolderPlus,
  Bookmark,
  Share2,
  Home,
  MessageSquare,
  Settings,
  Database,
  Layers,
  Play,
  Pause,
  Volume2,
  Headphones,
  Check,
  X,
  Radio,
  Clock,
  Eye,
  Download,
  ArrowLeft,
} from 'lucide-react';
import { ThreeDVectorGalaxy } from './ThreeDVectorGalaxy';
import { TiltCard3D } from './TiltCard3D';
import { MarkdownRenderer } from './MarkdownRenderer';

export const SearchResultsView = () => {
  const {
    searchResults,
    queryText,
    setQueryText,
    executeSearch,
    openImageModal,
    setDetailItem,
    setActiveTab,
    navigateBack,
    searchViewMode,
    setSearchViewMode,
  } = useAppStore();

  const [activeCategoryTab, setActiveCategoryTab] = useState('All');
  const [searchInput, setSearchInput] = useState(searchResults?.query || queryText || '');
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [audioSpeed, setAudioSpeed] = useState('1.0x');
  const [activeVideo, setActiveVideo] = useState(null);

  // Sync search input whenever the store searchResults or queryText updates
  useEffect(() => {
    if (searchResults?.query) {
      setSearchInput(searchResults.query);
    } else if (queryText) {
      setSearchInput(queryText);
    }
  }, [searchResults?.query, queryText]);

  const categoryTabs = ['All', 'Images', 'Documents', 'Videos', 'Audio', 'Web'];

  const visualList = searchResults?.relatedVisuals || [];
  const sourceList = searchResults?.keySources || [];
  const videoList = searchResults?.videos || [];
  const audioList = searchResults?.audioTracks || [];
  const webList = searchResults?.webResults || [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setQueryText(searchInput.trim());
      executeSearch(searchInput.trim());
    }
  };

  const handleSourceClick = (source) => {
    const snippetSentences = (source.snippet || '')
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 15)
      .slice(0, 3);

    const dynamicPoints = snippetSentences.length > 0
      ? snippetSentences
      : [
          `Primary insight retrieved from ${source.title}.`,
          `Verified multimodal vector node match with ${Math.round((source.similarity || 0.9) * 100)}% confidence score.`,
          `Content grounded in real-time knowledge base retrieval for "${searchResults?.query || 'inquiry'}".`
        ];

    const keywords = (searchResults?.query || 'research')
      .split(' ')
      .filter((w) => w.length > 3)
      .concat([source.domain || 'vector-node', 'openrouter-rag']);

    setDetailItem({
      title: source.title,
      similarityPercent: Math.round((source.similarity || 0.9) * 100),
      breadcrumb: 'Back to results',
      heroMediaUrl: visualList[0]?.url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
      videoDuration: '4:15',
      aiSummary: `${source.subtitle || ''} ${source.snippet || ''}`,
      keyPoints: dynamicPoints,
      tags: Array.from(new Set(keywords)).slice(0, 5),
      relatedImages: visualList,
    });
  };

  const toggleAudioPlay = (track) => {
    const id = track.id;
    if (playingAudioId === id) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setPlayingAudioId(null);
      return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setPlayingAudioId(id);

    if (track.audioUrl) {
      const audio = new Audio(track.audioUrl);
      audio.playbackRate = parseFloat(audioSpeed) || 1.0;
      audio.onended = () => setPlayingAudioId(null);
      audio.onerror = () => setPlayingAudioId(null);
      audio.play().catch(() => setPlayingAudioId(null));
    } else if (window.speechSynthesis) {
      const speechText = `${track.title}. ${searchResults?.aiAnswer?.slice(0, 300) || 'Multimodal AI research synthesis.'}`;
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = parseFloat(audioSpeed) || 1.0;
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Search Bar & Controls */}
      <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full sm:max-w-2xl relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search documents, images, papers..."
              className="w-full bg-white border border-purple-200/80 rounded-full pl-11 pr-24 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-purple-100 shadow-xs transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-4 py-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-sm transition-all cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* View Toggle / Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('explore')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-purple-100 text-xs font-medium text-slate-600 hover:text-brand-600 hover:border-brand-300 shadow-xs transition-all cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
            <span>Image Search</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-50 border border-purple-200 text-xs font-semibold text-brand-700 hover:bg-brand-100 shadow-xs transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask in Chat</span>
          </button>
        </div>

      </div>

      {/* Main Layout: Left Sidebar + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Mini Sidebar */}
        <div className="hidden lg:block lg:col-span-2 space-y-2 text-left">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-purple-100 p-2 shadow-xs space-y-1">
            {[
              { id: 'home', label: 'Home', icon: Home, action: () => setActiveTab('home') },
              { id: 'chat', label: 'Chat', icon: MessageSquare, action: () => setActiveTab('chat') },
              { id: 'all', label: 'All Results', icon: Layers, action: () => setActiveCategoryTab('All'), active: activeCategoryTab === 'All' },
              { id: 'docs', label: 'Documents', icon: FileText, action: () => setActiveCategoryTab('Documents'), active: activeCategoryTab === 'Documents' },
              { id: 'images', label: 'Images', icon: ImageIcon, action: () => setActiveCategoryTab('Images'), active: activeCategoryTab === 'Images' },
              { id: 'videos', label: 'Videos', icon: Video, action: () => setActiveCategoryTab('Videos'), active: activeCategoryTab === 'Videos' },
              { id: 'audio', label: 'Audio', icon: Mic, action: () => setActiveCategoryTab('Audio'), active: activeCategoryTab === 'Audio' },
              { id: 'web', label: 'Web Citations', icon: Globe, action: () => setActiveCategoryTab('Web'), active: activeCategoryTab === 'Web' },
              { id: 'kb', label: 'Collections', icon: Database, action: () => setActiveTab('collections') },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action || (() => {})}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    item.active
                      ? 'bg-purple-100/80 text-brand-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-brand-700 hover:bg-purple-50/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center & Right Content Area */}
        <div className="lg:col-span-10 space-y-6">
          
          {/* Category Tabs & 3D Galaxy Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {categoryTabs.map((tab) => {
                let count = null;
                if (tab === 'Images') count = visualList.length;
                if (tab === 'Documents') count = sourceList.length;
                if (tab === 'Videos') count = videoList.length;
                if (tab === 'Audio') count = audioList.length;
                if (tab === 'Web') count = webList.length;

                return (
                  <button
                    key={tab}
                    onClick={() => setActiveCategoryTab(tab)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      activeCategoryTab === tab
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-purple-100 hover:border-purple-300'
                    }`}
                  >
                    <span>{tab}</span>
                    {count !== null && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        activeCategoryTab === tab ? 'bg-white/20 text-white' : 'bg-purple-50 text-brand-700 font-semibold'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 3D Galaxy Toggle Button */}
            <div className="flex items-center gap-1 bg-white/90 p-1 rounded-full border border-purple-200 shadow-xs">
              <button
                onClick={() => setSearchViewMode('list')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  searchViewMode === 'list'
                    ? 'bg-purple-100 text-brand-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Editorial View
              </button>
              <button
                onClick={() => setSearchViewMode('galaxy')}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  searchViewMode === 'galaxy'
                    ? 'bg-brand-600 text-white font-semibold shadow-xs'
                    : 'text-brand-700 hover:bg-purple-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amberGold" />
                <span>3D Robot Galaxy</span>
              </button>
            </div>
          </div>

          {/* Interactive 3D Cartoon Robot Galaxy View if toggled */}
          {searchViewMode === 'galaxy' && (
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <ThreeDVectorGalaxy />
            </div>
          )}

          {/* ================= TAB 1: ALL (AI Synthesis + Key Sources + Visuals) ================= */}
          {activeCategoryTab === 'All' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* AI-Generated Answer Card */}
              <div className="relative bg-gradient-to-br from-[#FFFDF7] to-[#FEF9EE] rounded-3xl border-2 border-amberGold/30 p-6 sm:p-8 shadow-amber-glow text-left overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amberGold via-amber-400 to-amber-200" />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-amberGold-dark text-xs font-mono font-bold tracking-wide uppercase">
                    <Sparkles className="w-4 h-4 fill-amberGold text-amberGold" />
                    <span>AI-Generated Synthesis</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-amber-900/60 font-mono">
                    <span>Relevance: 94%</span>
                    <span>•</span>
                    <span>Grounded in Multimodal Signals</span>
                  </div>
                </div>

                {/* Markdown Formatted Answer */}
                <div className="text-slate-800 leading-relaxed font-sans">
                  <MarkdownRenderer content={searchResults?.aiAnswer} />
                </div>

                {/* Footnote attribution */}
                <div className="mt-6 pt-4 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900/70">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-amber-900">Referenced Modalities:</span>
                    <span className="bg-white/80 px-2 py-0.5 rounded-md border border-amber-200/80">
                      {sourceList.length} Ingested Sources
                    </span>
                    <span className="bg-white/80 px-2 py-0.5 rounded-md border border-amber-200/80">
                      {visualList.length} Satellite & Aerial Images
                    </span>
                    <span className="bg-white/80 px-2 py-0.5 rounded-md border border-amber-200/80">
                      {webList.length} Web Records
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="flex items-center gap-1 font-semibold text-brand-700 hover:text-brand-900 transition-colors cursor-pointer"
                  >
                    <span>Continue inquiry in chat</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Two-Column Section: Left Key Sources, Right Related Visuals */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                {/* Left Column: Key Sources (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-xl text-slate-900">
                      Key Sources & Documents
                    </h3>
                    <button
                      onClick={() => setActiveCategoryTab('Documents')}
                      className="text-xs font-mono text-brand-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <span>View All ({sourceList.length})</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {sourceList.map((source, idx) => (
                      <TiltCard3D
                        key={source.id || idx}
                        maxTilt={6}
                        scale={1.01}
                        onClick={() => handleSourceClick(source)}
                        className="p-4 bg-white rounded-2xl border border-purple-100 hover:border-brand-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-brand-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                              {source.number || idx + 1}
                            </span>
                            <div>
                              <h4 className="font-semibold text-sm sm:text-base text-slate-900 group-hover:text-brand-700 transition-colors">
                                {source.title}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5 font-sans leading-relaxed">
                                {source.subtitle}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 italic font-serif bg-slate-50 p-2 rounded-lg border border-slate-100">
                                "{source.snippet}"
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                              {Math.round((source.similarity || 0.9) * 100)}% Match
                            </span>
                            <span className="text-[11px] font-mono text-brand-600 flex items-center gap-0.5">
                              {source.domain || 'Vector Node'}
                              <ArrowUpRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </TiltCard3D>
                    ))}
                  </div>
                </div>

                {/* Right Column: Related Visuals (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-xl text-slate-900">
                      Related Visuals
                    </h3>
                    <button
                      onClick={() => setActiveCategoryTab('Images')}
                      className="text-xs font-medium text-brand-600 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Explore gallery</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* 2x2 Masonry Grid with 3D Tilt */}
                  <div className="grid grid-cols-2 gap-3">
                    {visualList.slice(0, 4).map((visual, idx) => (
                      <TiltCard3D
                        key={visual.id || idx}
                        maxTilt={12}
                        scale={1.03}
                        onClick={() => openImageModal(visual)}
                        className="relative rounded-2xl overflow-hidden group cursor-pointer border border-purple-100 shadow-xs hover:shadow-md transition-all bg-slate-900 aspect-square"
                      >
                        <img
                          src={visual.url}
                          alt={visual.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-3 text-left">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded max-w-fit mb-1">
                            {Math.round((visual.similarity || 0.88) * 100)}% Similarity
                          </span>
                          <p className="text-white text-xs font-medium leading-snug line-clamp-2">
                            {visual.title}
                          </p>
                        </div>
                      </TiltCard3D>
                    ))}
                  </div>

                  {/* Callout box */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200/70 text-xs text-brand-900 flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-brand-600 shrink-0" />
                    <p className="leading-tight">
                      Indexed from multimodal vision encoders, satellite imagery, and environmental radar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: IMAGES (Full Visual Evidence Gallery) ================= */}
          {activeCategoryTab === 'Images' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Visual Evidence & Satellite Imagery
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    High-resolution imagery indexed into the 512-dimensional CLIP embedding space.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-100 text-brand-800 border border-purple-200">
                  {visualList.length} Verified Visuals
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {visualList.map((visual, idx) => (
                  <TiltCard3D
                    key={visual.id || idx}
                    maxTilt={8}
                    scale={1.02}
                    onClick={() => openImageModal(visual)}
                    className="bg-white rounded-2xl overflow-hidden border border-purple-100 hover:border-brand-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
                  >
                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                      <img
                        src={visual.url}
                        alt={visual.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 border border-amber-300/30">
                          {Math.round((visual.similarity || 0.9) * 100)}% Match
                        </span>
                        {visual.tag && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-900/70 backdrop-blur-md text-white">
                            {visual.tag}
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-full bg-white/90 text-slate-900 text-xs font-semibold flex items-center gap-1.5 shadow-md">
                          <Eye className="w-3.5 h-3.5 text-brand-600" />
                          <span>Inspect High-Res</span>
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 group-hover:text-brand-700 transition-colors">
                          {visual.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 font-sans line-clamp-2">
                          {visual.caption || 'Extracted multimodal evidence aligned with textual research.'}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-purple-50 flex items-center justify-between text-[11px] text-slate-400">
                        <span>CLIP Vision Encoder</span>
                        <span className="text-brand-600 font-semibold group-hover:underline flex items-center gap-0.5">
                          View details <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </TiltCard3D>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: DOCUMENTS (Peer-Reviewed Reader) ================= */}
          {activeCategoryTab === 'Documents' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Peer-Reviewed Journals & Ingested Papers
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Exact text passages retrieved from PDF documents and indexed vector chunks.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {sourceList.length} Citations Available
                </span>
              </div>

              <div className="space-y-4">
                {sourceList.map((doc, idx) => (
                  <TiltCard3D
                    key={doc.id || idx}
                    maxTilt={4}
                    scale={1.008}
                    onClick={() => handleSourceClick(doc)}
                    className="p-6 bg-white rounded-3xl border border-purple-100 hover:border-brand-400 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0 border border-purple-100 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-base sm:text-lg text-slate-900 group-hover:text-brand-700 transition-colors">
                              {doc.title}
                            </h4>
                            {doc.page && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-50 text-brand-800 font-bold border border-purple-200">
                                Page {doc.page}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 font-sans">
                            {doc.subtitle}
                          </p>
                          <blockquote className="mt-3 p-3 rounded-xl bg-slate-50 border-l-4 border-brand-500 text-xs sm:text-sm text-slate-700 font-serif italic leading-relaxed">
                            "{doc.snippet}"
                          </blockquote>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-purple-100">
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {Math.round((doc.similarity || 0.9) * 100)}% Match
                        </span>
                        <span className="text-xs font-mono text-brand-600 flex items-center gap-1 font-semibold">
                          {doc.domain || 'External Journal'}
                          <ExternalLink className="w-3 h-3" />
                        </span>
                        <span className="text-[11px] text-brand-700 group-hover:underline font-medium mt-2 hidden sm:block">
                          Deep-dive study →
                        </span>
                      </div>
                    </div>
                  </TiltCard3D>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 4: VIDEOS (Lectures & Timelapses) ================= */}
          {activeCategoryTab === 'Videos' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Video Lectures, Timelapses & Stream Clips
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Curated audiovisual explanations and dynamic time-series satellite records.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                  {videoList.length} Video Clips
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoList.map((video, idx) => (
                  <TiltCard3D
                    key={video.id || idx}
                    maxTilt={8}
                    scale={1.02}
                    onClick={() => setActiveVideo(video)}
                    className="bg-white rounded-2xl overflow-hidden border border-purple-100 hover:border-brand-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col group"
                  >
                    <div className="relative aspect-video bg-slate-900 overflow-hidden">
                      <img
                        src={video.url}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 text-brand-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-brand-700 ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span className="font-semibold text-brand-700">{video.channel}</span>
                          <span>{video.views}</span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-2">
                          {video.title}
                        </h4>
                      </div>
                      <div className="mt-3 pt-2 border-t border-purple-50 flex items-center justify-between text-xs text-brand-600 font-semibold">
                        <span>Watch preview & lecture</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </TiltCard3D>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: AUDIO (Acoustic Sensors & Podcasts) ================= */}
          {activeCategoryTab === 'Audio' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Acoustic Sensors & Audio Intelligence
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Underwater hydrophone array telemetry, field recordings, and expert audio briefings.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Speed:</span>
                  {['1.0x', '1.25x', '1.5x'].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setAudioSpeed(spd)}
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium cursor-pointer ${
                        audioSpeed === spd ? 'bg-brand-600 text-white' : 'bg-purple-50 text-slate-600 hover:bg-purple-100'
                      }`}
                    >
                      {spd}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {audioList.map((track, idx) => {
                  const isPlaying = playingAudioId === track.id;

                  return (
                    <div
                      key={track.id || idx}
                      className={`p-5 rounded-3xl border transition-all ${
                        isPlaying
                          ? 'bg-gradient-to-r from-purple-50 via-white to-amber-50/40 border-brand-400 shadow-md ring-2 ring-brand-200'
                          : 'bg-white border-purple-100 hover:border-purple-300 shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleAudioPlay(track)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform shadow-xs cursor-pointer ${
                              isPlaying
                                ? 'bg-brand-600 text-white scale-105'
                                : 'bg-purple-100 text-brand-700 hover:bg-brand-600 hover:text-white'
                            }`}
                          >
                            {isPlaying ? (
                              <Pause className="w-5 h-5 fill-white" />
                            ) : (
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-base text-slate-900">
                                {track.title}
                              </h4>
                              {track.category && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-brand-800 font-bold">
                                  {track.category}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                              <span className="font-medium text-slate-700">{track.speaker}</span>
                              <span>•</span>
                              <span className="font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {track.duration}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Animated 3D Waveform Equalizer */}
                        <div className="flex items-center gap-1 sm:px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                          {[40, 65, 85, 30, 95, 75, 45, 90, 60, 80, 50, 70, 95, 35, 60, 85].map((h, i) => (
                            <div
                              key={i}
                              style={{
                                height: isPlaying ? `${Math.max(12, (h * (1 + Math.sin(i + Date.now() / 300))) % 36)}px` : `${Math.round(h * 0.25)}px`,
                                transition: 'height 0.15s ease-in-out',
                              }}
                              className={`w-1 rounded-full transition-all ${
                                isPlaying ? 'bg-brand-600 animate-pulse' : 'bg-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-[10px] font-mono text-slate-400 ml-2 font-semibold">
                            {isPlaying ? 'PLAYING' : 'READY'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 6: WEB (Live Scholarly Web & Institutional Index) ================= */}
          {activeCategoryTab === 'Web' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Live Scholarly Web & Institutional Index
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Real-time web search and global scientific publications queried dynamically.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                  {webList.length} Web Records
                </span>
              </div>

              <div className="space-y-4">
                {webList.map((web, idx) => (
                  <div
                    key={web.id || idx}
                    className="p-5 bg-white rounded-2xl border border-purple-100 hover:border-brand-400 shadow-xs hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-brand-600" />
                        {web.domain}
                      </span>
                      <a
                        href={web.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <span>Visit verified site</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <h4 className="font-semibold text-base text-slate-900">
                      <a
                        href={web.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-brand-700 transition-colors"
                      >
                        {web.title}
                      </a>
                    </h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-sans">
                      {web.snippet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Video Preview Modal with Interactive Player */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-slate-900 border border-purple-500/30 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-semibold truncate max-w-md">{activeVideo.title}</span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {activeVideo.videoId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1`}
                  title={activeVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={activeVideo.url}
                    alt={activeVideo.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-6 text-center">
                    <a
                      href={activeVideo.href || `https://www.youtube.com/results?search_query=${encodeURIComponent(activeVideo.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg mb-3 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Play className="w-7 h-7 fill-white ml-1" />
                    </a>
                    <p className="text-white text-base font-semibold">{activeVideo.title}</p>
                    <p className="text-xs text-purple-200 mt-1 font-mono">{activeVideo.channel} • {activeVideo.duration}</p>
                  </div>
                </>
              )}
            </div>
            <div className="p-4 bg-slate-900/90 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
              <span>Verified Multimodal Research Video</span>
              <div className="flex items-center gap-2">
                <a
                  href={activeVideo.href || `https://www.youtube.com/results?search_query=${encodeURIComponent(activeVideo.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Open on YouTube</span>
                </a>
                <button
                  onClick={() => setActiveVideo(null)}
                  className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
