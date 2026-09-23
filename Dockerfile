FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set up user for Hugging Face Spaces (UID 1000)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Install Python dependencies
COPY --chown=user:user backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy application source
COPY --chown=user:user . .

# Ensure data directory exists and is writable
RUN mkdir -p data/uploads data/qdrant

# Default ports: Render uses 10000, HF Spaces uses 7860, local uses 8001
ENV PORT=10000
ENV HOST=0.0.0.0

EXPOSE 10000 7860 8001

CMD ["python", "run_main.py"]
