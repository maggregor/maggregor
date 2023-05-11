FROM node:19-alpine

WORKDIR /app

COPY package.json ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

COPY . .

# Configure environment variables
ENV NODE_ENV=production
ENV PROXY_PORT=4000
ENV HTTP_PORT=3000
ENV MONGODB_TARGET_URI=
ENV MONGODB_METADATA_URI=

# Build the app
RUN pnpm build

# Link the image to the github repo
LABEL org.opencontainers.image.source="https://github.com/maggregor/maggregor"

# Run the builded app
ENTRYPOINT [ "node", "dist/src/main.js" ]