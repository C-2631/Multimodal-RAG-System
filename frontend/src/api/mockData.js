// Rich realistic mock dataset matching Researchly design references

export const MOCK_USER_PROFILE = {
  name: "Priya Sharma",
  role: "Research Enthusiast",
  bio: "Exploring ideas, discovering knowledge, one search at a time.",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  stats: {
    totalSearches: 48,
    collections: 12,
    dayStreak: 3,
  },
};

export const MOCK_COLLECTIONS = [
  {
    id: "col-1",
    title: "Climate & Environment",
    itemCount: 12,
    theme: "emerald",
    icon: "Leaf",
    colorBg: "bg-emerald-50",
    colorBorder: "border-emerald-200",
    colorText: "text-emerald-700",
    colorBadge: "bg-emerald-100 text-emerald-800",
    description: "Coastal resilience, oceanographic models, global warming datasets",
  },
  {
    id: "col-2",
    title: "Health & Wellness",
    itemCount: 8,
    theme: "rose",
    icon: "Heart",
    colorBg: "bg-rose-50",
    colorBorder: "border-rose-200",
    colorText: "text-rose-700",
    colorBadge: "bg-rose-100 text-rose-800",
    description: "Nutritional biology, sleep architecture, clinical trial summaries",
  },
  {
    id: "col-3",
    title: "Technology & AI",
    itemCount: 15,
    theme: "violet",
    icon: "Cpu",
    colorBg: "bg-purple-50",
    colorBorder: "border-purple-200",
    colorText: "text-purple-700",
    colorBadge: "bg-purple-100 text-purple-800",
    description: "Transformer models, multimodal CLIP representations, RAG blueprints",
  },
  {
    id: "col-4",
    title: "Travel & Places",
    itemCount: 10,
    theme: "cyan",
    icon: "Plane",
    colorBg: "bg-cyan-50",
    colorBorder: "border-cyan-200",
    colorText: "text-cyan-700",
    colorBadge: "bg-cyan-100 text-cyan-800",
    description: "Alpine hydrology, geographic mapping, UNESCO heritage archives",
  },
];

export const MOCK_RECENT_ACTIVITY = [
  {
    id: "act-1",
    type: "search",
    title: "Searched: renewable energy coastal cities",
    timeAgo: "2 hours ago",
    badge: "Text + Image Query",
  },
  {
    id: "act-2",
    type: "upload",
    title: "Uploaded: research_paper.pdf",
    timeAgo: "5 hours ago",
    badge: "PDF Ingestion",
  },
  {
    id: "act-3",
    type: "view",
    title: "Viewed: AI in education",
    timeAgo: "1 day ago",
    badge: "Article Review",
  },
  {
    id: "act-4",
    type: "upload",
    title: "Indexed: ocean_topography.png",
    timeAgo: "2 days ago",
    badge: "Image Vectorized",
  },
];

export const MOCK_SEARCH_RESULTS = {
  query: "climate change impact on coastal cities",
  aiAnswer: "Climate change is significantly impacting coastal cities through rising sea levels, more frequent and intense storms, and coastal erosion. These changes increase flood risk, damage infrastructure, and threaten local ecosystems and economies.",
  similarityScore: 94,
  keySources: [
    {
      id: "src-1",
      number: 1,
      title: "IPCC Sixth Assessment Report",
      subtitle: "Climate change and its impact on coastal regions.",
      domain: "ipcc.ch",
      url: "https://www.ipcc.ch/assessment-report/ar6/",
      similarity: 0.96,
      snippet: "Global mean sea level increased by 0.20 m between 1901 and 2018. The average rate of sea level rise was 1.3 mm yr⁻¹ between 1901 and 1971, increasing to 3.7 mm yr⁻¹ between 2006 and 2018.",
      page: 42,
    },
    {
      id: "src-2",
      number: 2,
      title: "Nature - Coastal Cities and Sea Level Rise",
      subtitle: "Long-term projections and risk analysis.",
      domain: "nature.com",
      url: "https://www.nature.com",
      similarity: 0.93,
      snippet: "High-resolution elevation models reveal triple the vulnerability for coastal regions previously estimated by satellite radar topography, affecting over 300 million people by 2050.",
      page: 18,
    },
    {
      id: "src-3",
      number: 3,
      title: "World Bank - Climate Risk and Coastal Communities",
      subtitle: "Vulnerability and adaptation strategies.",
      domain: "worldbank.org",
      url: "https://www.worldbank.org",
      similarity: 0.89,
      snippet: "Economic loss projections in 136 of the world's largest coastal cities could surpass $1 trillion annually by 2050 unless substantial adaptation barriers are constructed.",
      page: 9,
    },
  ],
  relatedVisuals: [
    {
      id: "vis-1",
      title: "Aerial Coastal City Flooding Projection",
      url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80",
      similarity: 0.94,
      tag: "Aerial Mapping",
      caption: "LiDAR scan overlay showing 1.5m flood line encroaching urban perimeter.",
    },
    {
      id: "vis-2",
      title: "Offshore Storm Surge Impact",
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      similarity: 0.91,
      tag: "Satellite Radar",
      caption: "Severe high-tide sea defense collision during Category 3 storm sequence.",
    },
    {
      id: "vis-3",
      title: "Degraded Barrier Reef Submersion",
      url: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?auto=format&fit=crop&w=600&q=80",
      similarity: 0.87,
      tag: "Ecosystem Data",
      caption: "Natural breakwater coral bleaching and depth attenuation study.",
    },
    {
      id: "vis-4",
      title: "Urban Sea Defense Infrastructure",
      url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
      similarity: 0.82,
      tag: "Structural Engineering",
      caption: "Pneumatic surge barrier gate installed across tidal shipping channel.",
    },
  ],
  videos: [
    { id: "vid-1", title: "Rising Tides: Coastal Inundation & LiDAR Mapping", duration: "4:35", views: "340K views", channel: "Global Climate Observatory", url: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=600&q=80" },
    { id: "vid-2", title: "Engineering Storm Surge Barriers in Megacities", duration: "12:10", views: "190K views", channel: "Civil Tech Review", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80" },
    { id: "vid-3", title: "Oceanographic Thermal Expansion Models Explained", duration: "8:45", views: "520K views", channel: "Earth & Planetary Sciences", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
  ],
  audioTracks: [
    { id: "aud-1", title: "Field Hydrophone: Antarctic Ice Shelf Acoustic Signatures", duration: "6:42", speaker: "NOAA Ocean Acoustics", category: "Sensor Stream" },
    { id: "aud-2", title: "Nature Climate Podcast: Deep Cryosphere Expeditions", duration: "24:15", speaker: "Dr. Sarah Jenkins, Polar Institute", category: "Scientific Podcast" },
    { id: "aud-3", title: "Global Coastal Adaptation Briefing & Summit Panel", duration: "18:20", speaker: "IPCC Working Group Lead", category: "Conference Session" },
  ],
  webResults: [
    { id: "web-1", title: "IPCC AR6 Working Group II: Impacts, Adaptation and Vulnerability", url: "https://www.ipcc.ch/report/ar6/wg2/", domain: "ipcc.ch", snippet: "Assesses the impacts of climate change on ecosystems, biodiversity, and human communities at global and regional levels." },
    { id: "web-2", title: "Nature Geoscience: Coastal Inundation and Sea Level Rise Projections", url: "https://www.nature.com/ngeo", domain: "nature.com", snippet: "High-resolution elevation models reveal triple the vulnerability for global coastal regions previously estimated." },
    { id: "web-3", title: "NASA Earth Observatory: Sea Level Change Portal", url: "https://sealevel.nasa.gov", domain: "nasa.gov", snippet: "Direct access to satellite altimetry observations, ice sheet mass balance, and global sea level rise tracking." },
  ],
};

export const MOCK_DETAIL_DATA = {
  title: "The Future of Renewable Energy",
  similarityPercent: 92,
  breadcrumb: "Back to results",
  heroMediaUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80",
  videoDuration: "2:34",
  aiSummary: "Renewable energy, including solar, wind, and hydro power, is expected to play a crucial role in reducing carbon emissions and achieving a sustainable future. Advances in technology and policy support are accelerating its global adoption.",
  keyPoints: [
    "Global renewable energy capacity is growing rapidly across municipal and national grids.",
    "Solar and wind are currently the fastest-growing primary generation sources worldwide.",
    "Investment in long-duration clean energy storage and battery microgrids is expected to triple.",
    "Grid modernization and smart distribution are overcoming historical intermittency challenges.",
  ],
  tags: ["renewable energy", "sustainability", "clean tech", "climate change", "wind power", "solar array"],
  relatedImages: [
    {
      id: "rel-1",
      title: "Wind Turbines at Sunset",
      url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=500&q=80",
      similarity: 0.95,
      type: "Wind Farm",
    },
    {
      id: "rel-2",
      title: "High-Altitude Solar Field",
      url: "https://images.unsplash.com/photo-1508873696983-2df57046475a?auto=format&fit=crop&w=500&q=80",
      similarity: 0.93,
      type: "Photovoltaic",
    },
    {
      id: "rel-3",
      title: "Clean Mobility EV Infrastructure",
      url: "https://images.unsplash.com/photo-1558441719-8b489c63f74b?auto=format&fit=crop&w=500&q=80",
      similarity: 0.88,
      type: "Transportation",
    },
    {
      id: "rel-4",
      title: "Hydroelectric Cascade Dam",
      url: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=500&q=80",
      similarity: 0.84,
      type: "Hydro Power",
    },
  ],
};

export const MOCK_EXPLORE_EXAMPLES = [
  {
    id: "ex-1",
    category: "Nature",
    title: "Alpine Lakes & Glacial Topography",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    badge: "1.2k Vectors",
  },
  {
    id: "ex-2",
    category: "Architecture",
    title: "Classical Stone Facades & Arches",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80",
    badge: "890 Vectors",
  },
  {
    id: "ex-3",
    category: "Food",
    title: "Culinary Gastronomy & Spices",
    imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    badge: "640 Vectors",
  },
  {
    id: "ex-4",
    category: "Technology",
    title: "Semiconductor Wafers & Circuitry",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80",
    badge: "2.1k Vectors",
  },
  {
    id: "ex-5",
    category: "Art",
    title: "Geometric Modernist Installations",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80",
    badge: "450 Vectors",
  },
  {
    id: "ex-6",
    category: "Science",
    title: "Orbital Telescopes & Astrophotography",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80",
    badge: "3.4k Vectors",
  },
];

export const MOCK_CHAT_THREADS = [
  {
    id: "chat-1",
    title: "Renewable energy trends",
    timeGroup: "Today",
    messages: [
      {
        id: "msg-1",
        sender: "user",
        text: "What are the best renewable energy sources for coastal cities?",
        timestamp: "10:14 AM",
      },
      {
        id: "msg-2",
        sender: "ai",
        text: "Based on the latest research, the most suitable renewable energy sources for coastal cities are:\n\n1. **Offshore Wind Energy** — High efficiency and consistent output due to stronger, uninterrupted sea breezes.\n2. **Solar Energy** — Ideal for rooftop, urban facade, and floating coastal installations with high insolation.\n3. **Tidal Energy** — Highly predictable and reliable power generated from natural tidal surges.\n4. **Wave Energy** — Great potential for long-term power generation and coastal grid stabilization.\n\nThese solutions help reduce carbon emissions, build energy resilience, and support sustainable coastal development.",
        citations: [
          { name: "IPCC Report", domain: "ipcc.ch" },
          { name: "Nature Journal", domain: "nature.com" },
          { name: "World Bank", domain: "worldbank.org" }
        ],
        timestamp: "10:15 AM",
      },
    ],
  },
  {
    id: "chat-2",
    title: "Healthy diet plans",
    timeGroup: "Today",
    messages: [
      {
        id: "msg-21",
        sender: "user",
        text: "Compare Mediterranean vs Ketogenic diets for cardiovascular longevity.",
        timestamp: "09:05 AM",
      },
      {
        id: "msg-22",
        sender: "ai",
        text: "Clinical meta-analyses show the Mediterranean diet provides statistically superior markers for endothelial function and arterial elasticity over 5-year horizons.",
        citations: [{ name: "The Lancet", domain: "thelancet.com" }],
        timestamp: "09:06 AM",
      }
    ],
  },
  {
    id: "chat-3",
    title: "Best travel destinations",
    timeGroup: "Today",
    messages: [],
  },
  {
    id: "chat-4",
    title: "Science breakthroughs",
    timeGroup: "Today",
    messages: [],
  },
  {
    id: "chat-5",
    title: "AI in education",
    timeGroup: "Yesterday",
    messages: [],
  },
  {
    id: "chat-6",
    title: "Space exploration",
    timeGroup: "Yesterday",
    messages: [],
  },
];
