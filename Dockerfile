FROM node:18-bullseye-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Create app directory
WORKDIR /app

# Create a non-root user for Hugging Face compatibility
RUN useradd -m -u 1000 user
RUN chown -R user:user /app

# Switch to non-root user
USER user

# Copy package files and install dependencies
COPY --chown=user:user package*.json ./
RUN npm install

# Copy app source
COPY --chown=user:user . .

# Expose the port (Hugging Face uses 7860 by default)
EXPOSE 7860
ENV PORT=7860

# Start the bot
CMD ["npm", "start"]
