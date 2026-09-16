import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, ExternalLink, Sparkles, Image as ImageIcon } from 'lucide-react';

export const ImageModal = () => {
  const { imageModal, closeImageModal, executeSearch } = useAppStore();

  if (!imageModal.isOpen || !imageModal.data) return null;

  const { title, url, similarity, tag, caption } = imageModal.data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-purple-100 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={closeImageModal}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left/Top Image Area */}
        <div className="md:w-3/5 bg-slate-950 flex items-center justify-center overflow-hidden">
          <img
            src={url}
            alt={title}
            className="w-full h-full object-contain max-h-[60vh] md:max-h-[80vh]"
          />
        </div>

        {/* Right/Bottom Meta & Actions */}
        <div className="md:w-2/5 p-6 flex flex-col justify-between text-left space-y-4 overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-brand-800 text-xs font-mono font-bold uppercase tracking-wide">
                {tag || 'Visual Vector'}
              </span>
              {similarity && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                  {(similarity * 100).toFixed(0)}% Similarity
                </span>
              )}
            </div>

            <h3 className="font-display font-bold text-xl text-slate-900 leading-snug">
              {title}
            </h3>

            {caption && (
              <p className="text-xs text-slate-600 font-serif leading-relaxed italic bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                "{caption}"
              </p>
            )}

            <div className="space-y-1.5 text-xs text-slate-500 font-mono">
              <p>• Embedding: CLIP ViT-B/32 (512-dim)</p>
              <p>• Cosine distance threshold: &gt;0.70</p>
              <p>• Modality: Vision to Text / Image</p>
            </div>
          </div>

          <div className="pt-4 border-t border-purple-100 flex flex-col gap-2">
            <button
              onClick={() => {
                closeImageModal();
                executeSearch(`Find documents related to ${title}`);
              }}
              className="w-full py-2.5 px-4 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amberGold" />
              <span>Search for Similar Insights</span>
            </button>
            <button
              onClick={closeImageModal}
              className="w-full py-2 px-4 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
