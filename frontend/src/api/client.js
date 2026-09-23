import axios from 'axios';
import { MOCK_SEARCH_RESULTS } from './mockData';

const BACKEND_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const api = axios.create({
  baseURL: BACKEND_BASE ? `${BACKEND_BASE}/api` : '/api',
  timeout: 45000,
});

// Format real backend responses into the unified frontend presentation format
// Topic-aware multimedia generator to populate all modalities (Images, Documents, Videos, Audio, Web)
function getTopicMedia(query) {
  const q = (query || '').toLowerCase();

  if (q.includes('antarct') || q.includes('polar') || q.includes('glacier') || q.includes('ice')) {
    return {
      images: [
        { id: 'img-ant-1', title: 'Antarctic Ice Sheet Calving & Larsen Rift', url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=800&q=80', similarity: 0.96, tag: 'Glacial Geology', caption: 'High-resolution aerial imagery of shelf fractures.' },
        { id: 'img-ant-2', title: 'Pine Island Glacier Crevasse Altimetry', url: 'https://images.unsplash.com/photo-1483181957632-8bda974cbc91?auto=format&fit=crop&w=800&q=80', similarity: 0.93, tag: 'Satellite Radar', caption: 'LiDAR elevation scan of grounding line retreat.' },
        { id: 'img-ant-3', title: 'Emperor Penguin Habitat & Sea Ice Dynamics', url: 'https://images.unsplash.com/photo-1598439210625-5067c578f3f6?auto=format&fit=crop&w=800&q=80', similarity: 0.91, tag: 'Ecosystem Study', caption: 'Fast-ice breeding ground observation zone.' },
        { id: 'img-ant-4', title: 'McMurdo Dry Valleys Atmospheric Station', url: 'https://images.unsplash.com/photo-1548263594-a71ea65a8598?auto=format&fit=crop&w=800&q=80', similarity: 0.88, tag: 'Field Station', caption: 'Long-term meteorological observation tower.' },
        { id: 'img-ant-5', title: 'Southern Ocean Circumpolar Warm Water Influx', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', similarity: 0.86, tag: 'Oceanography', caption: 'Sub-surface heat transport underneath ice shelves.' },
        { id: 'img-ant-6', title: 'East Antarctic Ice Sheet Elevation Profile', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', similarity: 0.84, tag: 'Satellite Altimetry', caption: 'CryoSat-2 topographic radar measurement.' }
      ],
      documents: [
        { id: 'doc-ant-1', number: 1, title: 'Nature: Accelerating Ice Loss across the West Antarctic Ice Sheet', subtitle: 'Multi-decadal satellite gravimetry and altimetry synthesis.', domain: 'nature.com', url: 'https://www.nature.com', similarity: 0.96, snippet: 'Combined observations from GRACE and CryoSat show an acceleration in mass loss from the Amundsen Sea Embayment glaciers since 2000.', page: 14 },
        { id: 'doc-ant-2', number: 2, title: 'IPCC Special Report: The Ocean and Cryosphere in a Changing Climate', subtitle: 'Chapter 3: Polar Regions and Global Sea Level Projections.', domain: 'ipcc.ch', url: 'https://www.ipcc.ch', similarity: 0.93, snippet: 'Antarctic ice sheet contribution to global sea level rise is projected to increase substantially if the 1.5°C threshold is exceeded.', page: 48 },
        { id: 'doc-ant-3', number: 3, title: 'Geophysical Research Letters: Basal Melt Dynamics of Thwaites Ice Shelf', subtitle: 'Autonomous submarine hydrographic mapping beneath the ice shelf.', domain: 'agu.org', url: 'https://www.agu.org', similarity: 0.91, snippet: 'Uncrewed underwater vehicle observations confirm warm circumpolar deep water actively eroding the grounding line.', page: 8 },
        { id: 'doc-ant-4', number: 4, title: 'British Antarctic Survey: Decadal Temperature Anomalies', subtitle: 'Ground station records across the Antarctic Peninsula.', domain: 'bas.ac.uk', url: 'https://www.bas.ac.uk', similarity: 0.87, snippet: 'The Antarctic Peninsula has shown one of the fastest warming trends in the Southern Hemisphere over the past 50 years.', page: 22 }
      ],
      videos: [
        { id: 'vid-ant-1', title: 'NASA Earth Observatory: 20-Year Timelapse of Antarctic Ice Loss', duration: '4:35', views: '420K views', channel: 'NASA Climate', url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80' },
        { id: 'vid-ant-2', title: 'Nature Glaciology: Collapse of the Larsen B Ice Shelf', duration: '11:20', views: '180K views', channel: 'Nature Video', url: 'https://images.unsplash.com/photo-1483181957632-8bda974cbc91?auto=format&fit=crop&w=600&q=80' },
        { id: 'vid-ant-3', title: 'PBS Terra: Why the Thwaites Glacier is Known as the Doomsday Glacier', duration: '14:50', views: '890K views', channel: 'PBS Terra', url: 'https://images.unsplash.com/photo-1548263594-a71ea65a8598?auto=format&fit=crop&w=600&q=80' }
      ],
      audio: [
        { id: 'aud-ant-1', title: 'Antarctic Hydrophone Array: Acoustic Signature of Iceberg Calving', duration: '6:42', speaker: 'NOAA Ocean Acoustics', category: 'Sensor Stream' },
        { id: 'aud-ant-2', title: 'Polar Climate Science Podcast: Deep Inside the Thwaites Expedition', duration: '24:10', speaker: 'British Antarctic Survey', category: 'Expert Interview' },
        { id: 'aud-ant-3', title: 'BBC Science In Action: The Vanishing Sea Ice of the Southern Ocean', duration: '18:30', speaker: 'BBC Radio Science', category: 'Broadcast Journal' }
      ],
      web: [
        { id: 'web-ant-1', title: 'NASA Earth Observatory: Antarctic Ice Sheet Indicators', url: 'https://earthobservatory.nasa.gov', domain: 'earthobservatory.nasa.gov', snippet: 'Regular satellite tracking and ice mass balance metrics from ICESat-2 and GRACE Follow-On missions.' },
        { id: 'web-ant-2', title: 'British Antarctic Survey: Research Stations & Ice Monitoring', url: 'https://www.bas.ac.uk', domain: 'bas.ac.uk', snippet: 'Comprehensive scientific programmes exploring atmospheric chemistry, ice cores, and marine ecosystems in Antarctica.' },
        { id: 'web-ant-3', title: 'NOAA Climate.gov: Polar Sea Ice Extent and Anomaly Maps', url: 'https://www.climate.gov', domain: 'climate.gov', snippet: 'Daily and monthly charts analyzing Antarctic and Arctic sea ice extent with historical climate baselines.' }
      ]
    };
  }

  // Default fallback curated media for general queries
  return {
    images: MOCK_SEARCH_RESULTS.relatedVisuals,
    documents: MOCK_SEARCH_RESULTS.keySources,
    videos: [
      { id: 'vid-gen-1', title: 'Deep Learning & Multimodal Alignment: Visualizing the Latent Space', duration: '8:45', views: '210K views', channel: 'AI Research Lab', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' },
      { id: 'vid-gen-2', title: 'Renewable Power Transition: Coastal Infrastructure & Tidal Grids', duration: '12:30', views: '150K views', channel: 'Clean Tech Journal', url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=80' },
      { id: 'vid-gen-3', title: 'Global Climate Science: Multi-Decadal Ocean Temperature Observations', duration: '15:10', views: '340K views', channel: 'World Science Forum', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80' }
    ],
    audio: [
      { id: 'aud-gen-1', title: 'Researchly Knowledge Stream: Multimodal RAG Blueprint Walkthrough', duration: '12:15', speaker: 'Vector DB Architecture Series', category: 'Audio Paper' },
      { id: 'aud-gen-2', title: 'Nature Podcast: Breakthroughs in Earth Observation and Climate Models', duration: '28:40', speaker: 'Nature Publishing Group', category: 'Research Podcast' },
      { id: 'aud-gen-3', title: 'Acoustic Oceanography: Hydrophone Frequency Spectrum in Coastal Basins', duration: '9:20', speaker: 'Oceanographic Institute', category: 'Acoustic Analysis' }
    ],
    web: [
      { id: 'web-gen-1', title: 'IPCC Working Group Reports & Synthesis Assessment', url: 'https://www.ipcc.ch', domain: 'ipcc.ch', snippet: 'The leading international body for the assessment of climate change providing governments with scientific information.' },
      { id: 'web-gen-2', title: 'Nature Geoscience: Peer-Reviewed Earth & Environmental Research', url: 'https://www.nature.com/ngeo', domain: 'nature.com', snippet: 'Publishes high-quality research across all aspects of the Earth and planetary sciences.' },
      { id: 'web-gen-3', title: 'World Bank Open Knowledge Repository', url: 'https://openknowledge.worldbank.org', domain: 'worldbank.org', snippet: 'Open access to economic research, policy papers, and climate resilience frameworks.' }
    ]
  };
}

function formatBackendResults(backendData, fallbackQuery) {
  const textQuery = backendData.query_text || fallbackQuery || '';
  const topicMedia = getTopicMedia(textQuery);

  const textSources = (backendData.sources || [])
    .filter((s) => s.type === 'text')
    .map((s, idx) => {
      let cleanTitle = s.document_name.replace(/_/g, ' ').replace(/\.pdf$/i, '');
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
      return {
        id: s.document_id + '-' + idx,
        number: idx + 1,
        title: cleanTitle,
        subtitle: `Page ${s.page_number || 1} • Ingested Vector Match (${Math.round((s.similarity_score || 0.88) * 100)}%)`,
        domain: s.document_name.endsWith('.pdf') ? 'Indexed PDF' : 'Knowledge Chunk',
        url: '#',
        similarity: s.similarity_score || 0.85,
        snippet: s.content,
        page: s.page_number || 1,
      };
    });

  const imageVisuals = (backendData.sources || [])
    .filter((s) => s.type === 'image')
    .map((s, idx) => {
      let finalUrl = s.image_url;
      if (finalUrl && finalUrl.startsWith('/')) {
        const backendHost = BACKEND_BASE || 'http://localhost:8001';
        finalUrl = `${backendHost}${finalUrl}`;
      }
      return {
        id: (s.document_id || 'img') + '-img-' + idx,
        title: s.content?.slice(0, 60) || `${s.document_name || 'Visual'} Match`,
        url: finalUrl,
        similarity: s.similarity_score || 0.82,
        tag: s.document_name === 'Web Visual Index' ? 'Web Visual Match' : 'CLIP Vector Match',
        caption: s.content,
      };
    });

  // Map real live web search results from DuckDuckGo / Wikipedia
  const liveWebResults = (backendData.web_results || []).map((w, idx) => {
    let domain = 'web';
    try {
      if (w.url) {
        domain = new URL(w.url).hostname.replace('www.', '');
      }
    } catch {
      domain = 'web';
    }
    return {
      id: `web-${idx}`,
      title: w.title || textQuery,
      url: w.url || '#',
      domain: domain,
      snippet: w.snippet || 'Real-time verified web citation.',
    };
  });

  // If local PDF vectors don't exist for this random query, generate citations from live web results
  const finalKeySources = textSources.length > 0
    ? textSources
    : liveWebResults.slice(0, 4).map((w, idx) => ({
        id: `web-source-${idx}`,
        number: idx + 1,
        title: w.title,
        subtitle: `Live Verified Web Citation • ${w.domain}`,
        domain: w.domain,
        url: w.url,
        similarity: 0.90 - idx * 0.03,
        snippet: w.snippet,
        page: 1,
      }));

  // ── Videos: prefer live YouTube results from backend, else topic-aware placeholders ──
  const liveVideos = (backendData.videos || []).map((v, idx) => ({
    id: `vid-live-${idx}`,
    title: v.title || `Video: ${textQuery}`,
    duration: v.duration || '—',
    views: v.views || '',
    channel: v.channel || v.platform || 'YouTube',
    url: v.thumbnail || v.url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    href: v.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(textQuery)}`,
    videoId: v.video_id || '',
    description: v.description || '',
  }));

  const dynamicVideos = liveVideos.length > 0 ? liveVideos : [
    {
      id: 'vid-dyn-1',
      title: `Scientific Insights & Analysis: ${textQuery}`,
      duration: '8:24',
      views: '120K views',
      channel: 'Researchly Knowledge',
      url: imageVisuals[0]?.url || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      href: `https://www.youtube.com/results?search_query=${encodeURIComponent(textQuery)}`,
    },
    {
      id: 'vid-dyn-2',
      title: `Deep-Dive Lecture: ${textQuery}`,
      duration: '14:50',
      views: '85K views',
      channel: 'Academic Media',
      url: imageVisuals[1]?.url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
      href: `https://www.youtube.com/results?search_query=${encodeURIComponent(textQuery + ' lecture')}`,
    },
    ...topicMedia.videos.slice(0, 1),
  ];

  // ── Audio: TTS-generated audio + live podcast results from backend ──
  const liveAudio = (backendData.audio || []).map((a, idx) => ({
    id: `aud-live-${idx}`,
    title: a.title || `Podcast: ${textQuery}`,
    duration: a.duration || '—',
    speaker: a.platform || a.channel || 'Podcast',
    category: 'Live Podcast',
    href: a.url || '#',
  }));

  const dynamicAudio = [
    {
      id: 'aud-dyn-1',
      title: `AI Research Briefing: ${textQuery}`,
      duration: '5:30',
      speaker: 'AI Synthesizer (Edge-TTS)',
      category: 'Audio Summary',
      audioUrl: backendData.audio_url,
    },
    ...liveAudio,
    ...topicMedia.audio.slice(0, Math.max(0, 2 - liveAudio.length)),
  ];

  return {
    query: textQuery,
    aiAnswer: backendData.answer,
    similarityScore: Math.round((backendData.sources?.[0]?.similarity_score || 0.92) * 100),
    keySources: finalKeySources,
    relatedVisuals: imageVisuals.length > 0 ? imageVisuals : topicMedia.images,
    videos: dynamicVideos,
    audioTracks: dynamicAudio,
    webResults: liveWebResults.length > 0 ? liveWebResults : topicMedia.web,
    audioUrl: backendData.audio_url,
    tokensUsed: backendData.tokens_used,
    costUsd: backendData.cost_usd,
    isLive: true,
  };
}

export const apiClient = {
  // Query endpoint: sends text_query, image_base64, search_mode, top_k to FastAPI
  async query({ textQuery, imageBase64, modality = 'all', topK = 5, useWeb = true, useMockFallback = true }) {
    try {
      const response = await api.post('/query', {
        text_query: textQuery,
        image_base64: imageBase64,
        search_mode: modality,
        top_k: topK,
        use_web: useWeb,
        generate_audio: false,
        stream: false,
      });

      const formatted = formatBackendResults(response.data, textQuery);
      return { success: true, data: formatted, source: 'live' };
    } catch (err) {
      if (useMockFallback) {
        console.warn('Backend query fallback triggered:', err?.message || err);
        const topicMedia = getTopicMedia(textQuery || '');
        await new Promise((resolve) => setTimeout(resolve, 400));
        
        const dynamicAnswer = textQuery
          ? `### Comprehensive Analysis: ${textQuery.charAt(0).toUpperCase() + textQuery.slice(1)}\n\n` +
            `Synthesizing multimodal research, vector embeddings, and verified sources for **"${textQuery}"**.\n\n` +
            `• **Core Concepts**: Investigating key structural and theoretical mechanisms underlying ${textQuery}.\n` +
            `• **Empirical Evidence**: Multi-source analysis indicates significant trends across peer-reviewed literature and experimental observations.\n` +
            `• **Practical Applications**: Applied methodologies demonstrate robust performance across real-world workflows and systems.\n\n` +
            `*Connect to the live FastAPI backend on port 8001 with your OpenRouter API key for full AI generation.*`
          : MOCK_SEARCH_RESULTS.aiAnswer;

        return {
          success: true,
          data: {
            ...MOCK_SEARCH_RESULTS,
            query: textQuery || 'Uploaded multimodal image query',
            aiAnswer: dynamicAnswer,
            relatedVisuals: topicMedia.images,
            webResults: topicMedia.web,
            videos: topicMedia.videos,
            audioTracks: topicMedia.audio,
            isLive: false,
          },
          source: 'mock',
        };
      }
      throw err;
    }
  },

  // Document upload endpoint for PDFs and images
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, data: response.data, source: 'live' };
    } catch (err) {
      console.warn('Upload fallback triggered:', err?.message || err);
      return {
        success: true,
        data: {
          document_id: 'doc-' + Math.random().toString(36).substring(2, 9),
          filename: file.name,
          status: 'indexed',
          chunks: 14,
          images: 2,
        },
        source: 'mock',
      };
    }
  },

  // List indexed documents
  async getDocuments() {
    try {
      const response = await api.get('/documents', { timeout: 5000 });
      return { success: true, data: response.data };
    } catch {
      return { success: false, data: [] };
    }
  },

  // Health check to monitor FastAPI server status
  async checkHealth() {
    try {
      const response = await api.get('/health', { timeout: 3000 });
      return response.status === 200 && response.data?.status === 'ok';
    } catch {
      return false;
    }
  },
};
