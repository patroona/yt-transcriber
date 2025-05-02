# Use a Node.js base image
FROM node:18

# Install yt-dlp and ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg curl && \
    curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod +x /usr/local/bin/yt-dlp

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Expose the port
EXPOSE 3000

# Start the app
CMD [ "node", "server.js" ]
