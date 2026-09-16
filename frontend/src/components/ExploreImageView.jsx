import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MOCK_EXPLORE_EXAMPLES } from '../api/mockData';
import {
  UploadCloud,
  Sparkles,
  MapPin,
  ArrowRight,
  CheckCircle,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';

export const ExploreImageView = () => {
  const { setQueryImage, executeSearch, setActiveTab, navigateBack } = useAppStore();
  const [selectedExample, setSelectedExample] = useState(MOCK_EXPLORE_EXAMPLES[0]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setQueryImage({ file, previewUrl });
      setSelectedExample({
        category: 'Custom Upload',
        title: file.name,
        imageUrl: previewUrl,
        badge: 'User Query Vector',
      });
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setQueryImage({ file, previewUrl });
      setSelectedExample({
        category: 'Custom Upload',
        title: file.name,
        imageUrl: previewUrl,
        badge: 'User Query Vector',
      });
    }
  };

  const handleSearchWithImage = () => {
    executeSearch(`Multimodal visual analysis for ${selectedExample.title}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 text-left">
      
      {/* Top Header & Back Button */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateBack()}
            className="p-2 rounded-full bg-white border border-purple-200 text-slate-600 hover:text-brand-700 hover:bg-purple-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1 text-xs font-medium"
            title="Go Back"
          >
            <span>← Back</span>
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-mono font-semibold text-brand-700 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multimodal Vision Search</span>
          </div>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
          Explore with images
        </h1>
        <p className="text-slate-600 text-sm sm:text-base max-w-2xl font-sans leading-relaxed">
          Upload an image or drag and drop a file. Our AI will find relevant information, similar images, and detailed insights using joint text-vision CLIP embeddings.
        </p>
      </div>

      {/* Main Two-Column Box: Upload Dropzone on Left, Active Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Drag & Drop Area */}
        <div className="lg:col-span-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleFileDrop}
            className={`h-80 rounded-3xl border-2 border-dashed p-8 flex flex-col items-center justify-center text-center transition-all bg-white/70 backdrop-blur-xs ${
              isDragOver
                ? 'border-brand-500 bg-purple-50/50 scale-[1.01]'
                : 'border-purple-200 hover:border-brand-400'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-100/70 text-brand-700 flex items-center justify-center mb-4 shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="font-semibold text-base text-slate-900 mb-1">
              Drag & drop an image here
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-mono">
              Supports PNG, JPG, WEBP up to 25MB
            </p>

            <label className="px-6 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-medium shadow-md shadow-brand-500/20 cursor-pointer transition-all">
              <span>Upload Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Right Column: Active Preview Card with Interactive Pin */}
        <div className="lg:col-span-6">
          <div className="relative rounded-3xl overflow-hidden shadow-soft-card border border-purple-100 group bg-slate-900 h-80">
            <img
              src={selectedExample.imageUrl}
              alt={selectedExample.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-between p-6">
              
              {/* Interactive Floating Pin matching reference */}
              <div className="self-end">
                <button
                  onClick={handleSearchWithImage}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 text-slate-900 hover:text-brand-700 text-xs font-semibold shadow-lg hover:scale-105 transition-all"
                >
                  <Compass className="w-4 h-4 text-brand-600" />
                  <span>Find similar locations & information</span>
                </button>
              </div>

              {/* Bottom Card Meta */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-600/90 text-white font-mono text-[10px] uppercase font-bold tracking-wider">
                    {selectedExample.category}
                  </span>
                  <span className="text-white/80 font-mono text-xs">
                    {selectedExample.badge}
                  </span>
                </div>
                <h4 className="font-display text-xl text-white font-bold">
                  {selectedExample.title}
                </h4>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleSearchWithImage}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amberGold text-slate-900 hover:bg-amber-400 font-semibold text-xs shadow-sm transition-colors"
                  >
                    <span>Run Image Query</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* Bottom Examples Carousel matching reference */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-purple-100 pb-3">
          <h3 className="font-display font-bold text-xl text-slate-900">
            Try these examples
          </h3>
          <span className="text-xs text-slate-400 font-mono">Click to preview & search</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {MOCK_EXPLORE_EXAMPLES.map((example) => {
            const isSelected = selectedExample.category === example.category;
            return (
              <div
                key={example.id}
                onClick={() => setSelectedExample(example)}
                className={`group cursor-pointer rounded-2xl p-2 bg-white border transition-all text-center ${
                  isSelected
                    ? 'border-brand-500 ring-2 ring-purple-200 shadow-sm'
                    : 'border-purple-100 hover:border-brand-300'
                }`}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2 relative">
                  <img
                    src={example.imageUrl}
                    alt={example.category}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <p className="font-semibold text-xs text-slate-800 group-hover:text-brand-700">
                  {example.category}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {example.badge}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
