import { create } from 'zustand';
import {
  MOCK_USER_PROFILE,
  MOCK_COLLECTIONS,
  MOCK_RECENT_ACTIVITY,
  MOCK_SEARCH_RESULTS,
  MOCK_DETAIL_DATA,
  MOCK_CHAT_THREADS,
} from '../api/mockData';
import { apiClient } from '../api/client';

export const useAppStore = create((set, get) => ({
  // Navigation: 'home' | 'search' | 'explore' | 'detail' | 'chat' | 'collections'
  activeTab: 'home',
  navHistory: ['home'],
  setActiveTab: (tab) => {
    const currentTab = get().activeTab;
    if (currentTab !== tab) {
      set((state) => ({
        activeTab: tab,
        navHistory: [...state.navHistory, currentTab],
      }));
    }
  },
  navigateBack: () => {
    const { navHistory } = get();
    if (navHistory.length > 0) {
      const prevTab = navHistory[navHistory.length - 1];
      const newHistory = navHistory.slice(0, -1);
      set({
        activeTab: prevTab || 'home',
        navHistory: newHistory.length > 0 ? newHistory : ['home'],
      });
    } else {
      set({ activeTab: 'home' });
    }
  },

  // User Profile
  userProfile: MOCK_USER_PROFILE,

  // Search State
  queryText: '',
  setQueryText: (queryText) => set({ queryText }),
  queryImage: null, // { file: File, previewUrl: string }
  setQueryImage: (queryImage) => set({ queryImage }),
  clearQueryImage: () => set({ queryImage: null }),
  activeModality: 'all', // 'all' | 'text' | 'image' | 'pdf' | 'audio' | 'video'
  setActiveModality: (activeModality) => set({ activeModality }),

  // Results & Loading
  isLoading: false,
  searchResults: MOCK_SEARCH_RESULTS,
  setSearchResults: (searchResults) => set({ searchResults }),
  searchViewMode: 'list', // 'list' | 'galaxy'
  setSearchViewMode: (searchViewMode) => set({ searchViewMode }),

  // Execute Search
  executeSearch: async (customQuery) => {
    const { queryText, queryImage, activeModality, setActiveTab } = get();
    const textToSearch = customQuery !== undefined ? customQuery : queryText;

    if (!textToSearch && !queryImage) return;

    set({ queryText: textToSearch, isLoading: true });
    setActiveTab('search');

    try {
      const response = await apiClient.query({
        textQuery: textToSearch,
        imageBase64: queryImage?.previewUrl || null,
        modality: activeModality,
        topK: 5,
        useMockFallback: true,
      });

      if (response.success) {
        set({
          searchResults: {
            ...response.data,
            query: textToSearch || 'Visual similarity search',
          },
          queryText: textToSearch,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Search failed:', err);
      set({ isLoading: false });
    }
  },

  // Detail View Item
  detailItem: MOCK_DETAIL_DATA,
  setDetailItem: (detailItem) => {
    const currentTab = get().activeTab;
    set((state) => ({
      detailItem,
      activeTab: 'detail',
      navHistory: [...state.navHistory, currentTab],
    }));
  },

  // Image Lightbox Modal
  imageModal: { isOpen: false, data: null },
  openImageModal: (img) => set({ imageModal: { isOpen: true, data: img } }),
  closeImageModal: () => set({ imageModal: { isOpen: false, data: null } }),

  // Chat Conversations
  chatThreads: MOCK_CHAT_THREADS,
  activeChatId: 'chat-1',
  isChatLoading: false,
  setActiveChatId: (activeChatId) => set({ activeChatId }),
  createNewChat: () => {
    const newId = `chat-${Date.now()}`;
    const newThread = {
      id: newId,
      title: 'New inquiry',
      timeGroup: 'Today',
      messages: [],
    };
    set((state) => ({
      chatThreads: [newThread, ...state.chatThreads],
      activeChatId: newId,
      activeTab: 'chat',
    }));
  },
  sendChatMessage: async (messageText, attachedImage = null) => {
    if (!messageText.trim() && !attachedImage) return;
    const { activeChatId, chatThreads } = get();
    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: messageText,
      image: attachedImage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update with user message
    const updatedThreads = chatThreads.map((thread) => {
      if (thread.id === activeChatId) {
        return {
          ...thread,
          messages: [...thread.messages, userMsg],
          title: thread.title === 'New inquiry' || thread.title === 'New conversation'
            ? (messageText.slice(0, 26) || 'Multimodal Query') + '...'
            : thread.title,
        };
      }
      return thread;
    });

    set({ chatThreads: updatedThreads, isChatLoading: true });

    // Query real live backend with OpenRouter
    try {
      const res = await apiClient.query({
        textQuery: messageText,
        imageBase64: attachedImage,
        topK: 4,
      });

      const answer = res.data?.aiAnswer || 'I searched the multimodal knowledge base for your query.';
      const citations = (res.data?.keySources || []).slice(0, 4).map((s) => ({
        name: s.title,
        domain: s.domain || 'Knowledge Base',
      }));

      const aiMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: answer,
        citations: citations.length > 0 ? citations : [{ name: 'OpenRouter AI', domain: 'live-model' }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      set((state) => ({
        isChatLoading: false,
        chatThreads: state.chatThreads.map((thread) => {
          if (thread.id === activeChatId) {
            return {
              ...thread,
              messages: [...thread.messages, aiMsg],
            };
          }
          return thread;
        }),
      }));
    } catch (err) {
      console.error('Chat live query error:', err);
      set({ isChatLoading: false });
    }
  },

  // Collections & Library
  collections: MOCK_COLLECTIONS,
  recentActivity: MOCK_RECENT_ACTIVITY,

  // Backend Health Status
  backendConnected: false,
  setBackendConnected: (backendConnected) => set({ backendConnected }),
}));
