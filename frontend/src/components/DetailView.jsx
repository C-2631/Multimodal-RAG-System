import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  ArrowLeft,
  Sparkles,
  Play,
  Check,
  Bookmark,
  Share2,
  ExternalLink,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
} from 'lucide-react';
import { ThreeDSimilarityRing } from './ThreeDSimilarityRing';
import { TiltCard3D } from './TiltCard3D';

export const DetailView = () => {
  const { detailItem, setActiveTab, navigateBack, openImageModal } = useAppStore();
  const [activeTabName, setActiveTabName] = useState('Overview');
  const [isSaved, setIsSaved] = useState(false);

  const tabs = ['Overview', 'Images', 'Documents', 'Videos', 'Audio'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      
      {/* Breadcrumb Navigation matching reference */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateBack()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-700 hover:text-brand-900 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-full border border-purple-100 shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
              isSaved
                ? 'bg-purple-100 border-brand-400 text-brand-800'
                : 'bg-white border-purple-100 text-slate-600 hover:bg-purple-50'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-brand-700 text-brand-700' : ''}`} />
            <span>{isSaved ? 'Saved to Collection' : 'Save'}</span>
          </button>
          <button
            onClick={() => alert('Link copied to clipboard!')}
            className="p-1.5 rounded-full bg-white border border-purple-100 text-slate-500 hover:text-brand-700 transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Header: Title + Concentric Similarity Score Gauge Ring */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-100 pb-6">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
            Knowledge Vector Deep Dive
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-1">
            {detailItem.title}
          </h1>
        </div>

        {/* Holographic 3D Similarity Energy Ring */}
        <div className="flex items-center gap-4 bg-white/95 px-5 py-2.5 rounded-2xl border border-amber-200/90 shadow-soft-card">
          <ThreeDSimilarityRing similarityPercent={detailItem.similarityPercent} />
          <div className="text-left">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-amberGold-dark flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-amberGold text-amberGold" />
              <span>3D Vector Match</span>
            </p>
            <p className="text-[11px] text-slate-500">
              Cosine Similarity Score
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Overview, Images, Documents, Videos, Audio) */}
      <div className="flex items-center gap-2 border-b border-purple-100 pb-3 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTabName(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
              activeTabName === tab
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-purple-100 hover:border-purple-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Detailed Editorial Content (8 cols), Right Related Images (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Hero Media Banner with Play Button */}
          <div className="relative rounded-3xl overflow-hidden aspect-video bg-slate-900 shadow-soft-card group border border-purple-100">
            <img
              src={detailItem.heroMediaUrl}
              alt={detailItem.title}
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            {/* Centered Play Button */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors">
              <button className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-brand-700 flex items-center justify-center shadow-xl hover:scale-110 transition-all pl-1">
                <Play className="w-7 h-7 fill-brand-700" />
              </button>
            </div>
            {/* Video Duration Badge */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-white font-mono text-xs font-semibold">
              {detailItem.videoDuration}
            </div>
          </div>

          {/* AI Summary Box (Golden Amber Tinted Box matching reference) */}
          <div className="bg-[#FFFDF7] rounded-2xl border border-amber-200 p-5 sm:p-6 shadow-xs space-y-2 text-left">
            <div className="flex items-center gap-2 text-amberGold-dark text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 fill-amberGold" />
              <span>AI Summary</span>
            </div>
            <p className="font-serif text-slate-800 text-base sm:text-lg leading-relaxed font-normal">
              "{detailItem.aiSummary}"
            </p>
          </div>

          {/* Key Points Section */}
          <div className="space-y-3 pt-2 text-left">
            <h3 className="font-display font-bold text-lg text-slate-900">
              Key Points
            </h3>
            <ul className="space-y-2.5">
              {detailItem.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-amberGold shrink-0 mt-2" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Keyword Topic Tags */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {detailItem.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-medium text-brand-800"
              >
                #{tag}
              </span>
            ))}
          </div>

        </div>

        {/* Right Column: Related Images Feed (4 cols) matching reference */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold text-lg text-slate-900">
              Related Images
            </h3>
            <button
              onClick={() => setActiveTab('explore')}
              className="text-xs font-medium text-brand-600 hover:text-brand-800"
            >
              View more →
            </button>
          </div>

          <div className="space-y-3">
            {detailItem.relatedImages.map((img) => (
              <TiltCard3D
                key={img.id}
                maxTilt={10}
                scale={1.02}
                onClick={() => openImageModal(img)}
                className="rounded-2xl overflow-hidden border border-purple-100 bg-white shadow-xs hover:shadow-md cursor-pointer group transition-all"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white font-mono text-[10px] font-bold">
                    {(img.similarity * 100).toFixed(0)}% Match
                  </span>
                </div>
                <div className="p-3 text-left">
                  <p className="font-semibold text-xs text-slate-800 group-hover:text-brand-700">
                    {img.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {img.type || 'Multimodal Vector'}
                  </p>
                </div>
              </TiltCard3D>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
