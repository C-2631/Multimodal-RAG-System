FROM python:3.11-slim

WORKDIR /app

# Install system tools required for building packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies with CPU-only torch to keep image light and fast
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Hugging Face Spaces and container cloud platforms use port 7860 or 8001
ENV PORT=7860
ENV HOST=0.0.0.0

EXPOSE 7860

CMD ["python", "run_main.py"]
