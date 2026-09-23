FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
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

# Hugging Face Spaces listens on port 7860
ENV PORT=7860
ENV HOST=0.0.0.0

EXPOSE 7860

CMD ["python", "run_main.py"]
