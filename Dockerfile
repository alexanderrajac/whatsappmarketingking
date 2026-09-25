FROM node:20-bookworm-slim

# Install Python 3, venv, pip, Nginx, and curl (Debian Bookworm)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    nginx \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Setup persistent Python virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

WORKDIR /app

# 1. Build Frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# 2. Setup Backend
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ./backend/requirements.txt
COPY backend/ ./backend/

# 3. Setup WhatsApp Service
COPY whatsapp-service/package*.json ./whatsapp-service/
RUN cd whatsapp-service && npm ci --omit=dev
COPY whatsapp-service/ ./whatsapp-service/

# 4. Setup Nginx and Entrypoint
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/sites-available/default
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 80 8000 3001

CMD ["/app/entrypoint.sh"]
