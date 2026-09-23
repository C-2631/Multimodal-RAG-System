---
title: Multimodal RAG Backend
emoji: 🌌
colorFrom: purple
colorTo: indigo
sdk: docker
pinned: false
app_port: 7860
---

# 🌌 Multimodal RAG System (Retrieval-Augmented Generation)

An end-to-end, enterprise-grade Multimodal Retrieval-Augmented Generation (RAG) platform that seamlessly retrieves, synthesizes, and visualizes knowledge across **text documents, PDFs, high-resolution images, videos, audio/podcasts, and real-time live web sources**.

Featuring an editorial UI design, interactive **3D Vector Galaxy AI Robot companion** (Three.js), multi-provider LLM support (OpenRouter, Groq, OpenAI), and vector database persistence via Qdrant and SQLite.

---

## ✨ Features

- **🌐 6-in-1 Multimodal Search & Retrieval**:
  - **All**: Unified multimodal answer with verified citations and cross-modal evidence.
  - **Images**: Visual similarity and zero-shot retrieval with OpenAI CLIP embeddings.
  - **Documents / PDF**: Page-level extraction with OCR, text chunking, and PDF viewing.
  - **Videos**: Keyframe extraction, scene captioning, and video segment retrieval.
  - **Audio / Podcasts**: Speech-to-text transcript synthesis and audio ribbon playback.
  - **Web Search**: Real-time live DuckDuckGo web search integration with clean citations.
- **🤖 Multi-Provider LLM Generation**:
  - OpenRouter (`meta-llama/llama-3.3-70b-instruct`, `llama-3.2-11b-vision`, etc.)
  - Groq (`llama-3.3-70b-versatile`, `llama-3.2-11b-vision-preview`)
  - OpenAI (`gpt-4o`, `gpt-4o-mini`)
- **🪐 3D AI Robot Galaxy Companion**:
  - Built with `@react-three/fiber` and `@react-three/drei`.
  - Floating 3D AI Robot with interactive hovering, glowing orbital particle rings, and dynamic mood animations (idle, thinking, searching).
- **📝 High-Precision Rich Markdown Renderer**:
  - Complete zero-dependency rendering for headers, bold text, code blocks, bullet points, numbered lists, blockquotes, and tables.
- **⚡ Vector Engine & Storage**:
  - Qdrant Vector Database (Embedded local storage or Qdrant Cloud cluster)
  - SQLite + SQLAlchemy async metadata persistence
  - OpenAI CLIP ViT-B/32 multimodal embeddings (512-dim)

---

## 🛠️ Architecture

```
                      ┌─────────────────────────────────┐
                      │    Modern React + Vite UI       │
                      │  (3D Robot, Markdown, Audio)    │
                      └────────────────┬────────────────┘
                                       │ HTTP / REST
                                       ▼
                      ┌─────────────────────────────────┐
                      │    FastAPI Multimodal Backend   │
                      └───────┬─────────────────┬───────┘
                              │                 │
              ┌───────────────▼──┐           ┌──▼───────────────┐
              │  CLIP Embeddings │           │   LLM Generator  │
              │  (ViT-B/32 512d) │           │ (OpenRouter/Groq)│
              └───────┬──────────┘           └──┬───────────────┘
                      │                         │
              ┌───────▼──────────┐           ┌──▼───────────────┐
              │  Qdrant Storage  │           │   SQLite Metadata│
              │  (Vectors & Pay) │           │   (Documents/Logs│
              └──────────────────┘           └──────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Python 3.10+** (Tested on Python 3.12)
- **Node.js 18+** & `npm`
- Git

### 2. Clone the Repository
```bash
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
cd "Multimodal RAG System"
```

### 3. Backend Setup
```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Configure Environment Variables
cp .env.example .env
# Edit .env and insert your OPENROUTER_API_KEY or GROQ_API_KEY
```

### 4. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

### 5. Run the Application
You can start both backend and frontend using the unified launcher:
```bash
python run_main.py
```
Or start them individually:
- **Backend**: `python run_backend.py` (Runs on `http://127.0.0.1:8001`)
- **Frontend**: `cd frontend && npm run dev` (Runs on `http://localhost:5173`)

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Environment Variables Configuration

Copy `.env.example` to `.env`:

```env
# Server Settings
APP_NAME=Multimodal RAG System
PORT=8001
HOST=127.0.0.1

# Vector Database (Qdrant)
QDRANT_STORAGE_PATH=./data/qdrant
QDRANT_TEXT_COLLECTION=text_chunks
QDRANT_IMAGE_COLLECTION=images

# Model Embeddings
CLIP_MODEL_NAME=openai/clip-vit-base-patch32
EMBEDDING_DIM=512
DEVICE=cpu

# LLM Providers (Choose any or auto-detect)
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct

GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

---

## 📂 Project Structure

```
├── backend/
│   ├── api/routes/          # FastAPI endpoints (query, upload, documents, health, stats)
│   ├── core/                # RAG pipeline, CLIP embedder, LLM generator, retriever, reranker, web search
│   ├── ingestion/           # PDF parser, image loader, video parser, text chunker
│   ├── models/              # Pydantic schemas & SQLAlchemy DB models
│   ├── storage/             # Qdrant vector store & SQLite object storage
│   ├── utils/               # Loggers, image helpers, progress managers
│   ├── config.py            # Pydantic Settings configuration
│   ├── main.py              # FastAPI app lifecycle & CORS
│   └── requirements.txt     # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client & API integrations
│   │   ├── components/      # React components (Home, SearchResults, 3D Robot Galaxy, Chat, etc.)
│   │   ├── store/           # Zustand global state store
│   │   ├── App.jsx          # Top-level view routing & modal manager
│   │   └── index.css        # Tailwind styles & theme variables
│   ├── package.json         # Frontend dependencies & scripts
│   └── vite.config.js       # Vite bundler & API proxy configuration
├── tests/                   # Pytest automated test suites
├── .env.example             # Template for API keys & server parameters
├── .gitignore               # Protection against secret & binary leaks
├── run_backend.py           # Single command backend startup script
├── run_main.py              # Fullstack launcher script
└── README.md                # Project documentation
```

---

## 🧪 Testing

Run backend unit and integration test suites:
```bash
pytest tests/ -v
```

---

## 🛡️ Security Note

- **Never commit `.env` or sensitive API keys to version control.**
- Ensure `.gitignore` is active and vector data/databases remain strictly local.

---

## 📄 License
This project is licensed under the MIT License.
