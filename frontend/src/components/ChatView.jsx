import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  Plus,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Mic,
  Copy,
  ThumbsUp,
  Share2,
  FolderPlus,
  ExternalLink,
  Check,
  ChevronLeft,
  X,
  Loader2,
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

export const ChatView = () => {
  const {
    chatThreads,
    activeChatId,
    setActiveChatId,
    createNewChat,
    sendChatMessage,
    userProfile,
    navigateBack,
    isChatLoading,
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState(null); // base64 preview
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const activeThread = chatThreads.find((t) => t.id === activeChatId) || chatThreads[0];

  const todayThreads = chatThreads.filter((t) => t.timeGroup === 'Today');
  const yesterdayThreads = chatThreads.filter((t) => t.timeGroup === 'Yesterday');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isChatLoading]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputMessage.trim() || attachedImage) {
      sendChatMessage(inputMessage, attachedImage);
      setInputMessage('');
      setAttachedImage(null);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } catch (err) {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 h-[calc(100vh-5rem)] flex gap-6 text-left">
      
      {/* Left Chat Sessions Sidebar */}
      <div className="hidden md:flex flex-col w-72 bg-white/80 backdrop-blur-md rounded-3xl border border-purple-100 p-4 shadow-xs shrink-0 justify-between">
        
        <div className="space-y-4 overflow-y-auto pr-1">
          
          {/* New Chat Button */}
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Today's Chats */}
          <div className="space-y-1">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Today
            </p>
            {todayThreads.map((thread) => {
              const isActive = thread.id === activeChatId;
              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveChatId(thread.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-100/80 text-brand-800 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/50'
                  }`}
                >
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="truncate">{thread.title}</span>
                </button>
              );
            })}
          </div>

          {/* Yesterday's Chats */}
          <div className="space-y-1 pt-2">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
              Previous
            </p>
            {yesterdayThreads.map((thread) => {
              const isActive = thread.id === activeChatId;
              return (
                <button
                  key={thread.id}
                  onClick={() => setActiveChatId(thread.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-100/80 text-brand-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/50'
                  }`}
                >
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span className="truncate">{thread.title}</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Bottom Action */}
        <div className="pt-3 border-t border-purple-100">
          <button
            onClick={() => navigateBack()}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-brand-900 hover:bg-purple-50 rounded-xl transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-brand-600" />
            <span>Back to previous page</span>
          </button>
        </div>

      </div>

      {/* Main Chat Thread Area */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-purple-100 shadow-soft-card overflow-hidden">
        
        {/* Chat Thread Header with Back Button */}
        <div className="px-6 py-3.5 border-b border-purple-100/80 flex items-center justify-between bg-white/70 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateBack()}
              className="p-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-brand-700 transition-colors cursor-pointer"
              title="Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg text-slate-900 leading-tight">
                {activeThread?.title || 'Multimodal AI Research Chat'}
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Grounded in Qdrant Vector DB & OpenRouter AI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-50 text-amberGold-dark font-semibold border border-amber-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-amberGold" />
              <span>OpenRouter AI Active</span>
            </span>
          </div>
        </div>

        {/* Message Bubble Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeThread?.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-brand-600 flex items-center justify-center mb-3">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-display font-semibold text-lg text-slate-700">How can I assist your research?</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Ask any question, attach diagrams or images, and get grounded answers with citations.
              </p>
            </div>
          ) : (
            activeThread?.messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amberGold to-amber-300 flex items-center justify-center text-slate-900 shadow-xs shrink-0 mt-1">
                      <Sparkles className="w-4 h-4 fill-slate-900" />
                    </div>
                  )}

                  <div className={`max-w-2xl space-y-2 ${isUser ? 'items-end text-right' : 'text-left'}`}>
                    
                    {/* Attached Image Thumbnail */}
                    {msg.image && (
                      <div className="mb-2 max-w-xs rounded-2xl overflow-hidden border border-purple-200 shadow-xs">
                        <img src={msg.image} alt="User attachment" className="w-full h-auto object-cover max-h-48" />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`p-4 sm:p-5 rounded-3xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-purple-100/90 text-brand-950 font-medium rounded-tr-xs shadow-xs whitespace-pre-line font-sans'
                          : 'bg-[#FFFDF9] text-slate-800 border border-amber-200/70 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {isUser ? (
                        <div className="font-sans">{msg.text}</div>
                      ) : (
                        <MarkdownRenderer content={msg.text} />
                      )}

                      {/* Attached Citation Pills */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-amber-200/50 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-900">
                            Citations:
                          </span>
                          {msg.citations.map((cite, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-amber-200 text-xs font-semibold text-brand-800 shadow-2xs"
                            >
                              <span>{cite.name}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Toolbar & Timestamp */}
                    <div className={`flex items-center gap-3 text-[11px] text-slate-400 px-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <>
                          <button
                            onClick={() => handleCopy(msg.id, msg.text)}
                            className="hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button className="hover:text-brand-700 cursor-pointer">
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button className="hover:text-brand-700 cursor-pointer">
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>

                  </div>

                  {isUser && (
                    <img
                      src={userProfile.avatar}
                      alt={userProfile.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-purple-200 shrink-0 mt-1 shadow-xs"
                    />
                  )}
                </div>
              );
            })
          )}

          {/* Typing / Loading Indicator */}
          {isChatLoading && (
            <div className="flex items-center gap-3 text-brand-700 text-xs font-mono p-3 bg-purple-50/70 rounded-2xl w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Researchly is synthesizing grounded response via OpenRouter...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sticky Bottom Chat Input Bar */}
        <div className="p-4 border-t border-purple-100 bg-white/90">
          
          {/* Image Attachment Preview Badge */}
          {attachedImage && (
            <div className="mb-2 flex items-center gap-2 p-1.5 pl-2 pr-3 bg-purple-50 rounded-xl border border-purple-200 w-fit">
              <img src={attachedImage} alt="Attachment preview" className="w-8 h-8 rounded-lg object-cover" />
              <span className="text-xs text-brand-800 font-medium">Image Attached</span>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-[#FAF9FE] border border-purple-200 rounded-full p-1.5 pl-4 pr-1.5 shadow-xs focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-purple-100 transition-all"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isListening ? "Listening to your voice..." : "Ask anything with text, image, or voice..."}
              className="flex-1 bg-transparent border-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />

            {/* Hidden File Input for Image Attachment */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-brand-600 rounded-full hover:bg-purple-100 transition-colors cursor-pointer"
              title="Attach Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isListening ? 'bg-amber-100 text-amber-700 animate-pulse' : 'text-slate-400 hover:text-amberGold hover:bg-amber-50'
              }`}
              title={isListening ? "Stop listening" : "Speak voice prompt"}
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              type="submit"
              disabled={!inputMessage.trim() && !attachedImage}
              className="w-9 h-9 rounded-full bg-brand-600 hover:bg-brand-700 active:scale-95 text-white flex items-center justify-center shadow-sm transition-all disabled:opacity-40 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
