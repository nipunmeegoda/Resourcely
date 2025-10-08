# Multi-stage build for Full-Stack .NET + Next.js Application

# Stage 1: Build Backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /src

# Copy backend project files
COPY Backend-Resourcely/Backend-Resourcely/*.csproj ./Backend-Resourcely/
COPY Backend-Resourcely/backend.Test/*.csproj ./backend.Test/

# Restore backend dependencies
RUN dotnet restore Backend-Resourcely/Backend-Resourcely.csproj

# Copy backend source code
COPY Backend-Resourcely/ ./

# Build and publish backend
RUN dotnet publish Backend-Resourcely/Backend-Resourcely.csproj -c Release -o /app/backend

# Stage 2: Build Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app

# Copy frontend package files
COPY Frontend-Resourcely/package*.json ./

# Install dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy frontend source code
COPY Frontend-Resourcely/ ./

# Build frontend
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Stage 3: Runtime - Combine Backend + Frontend
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy backend from build stage
COPY --from=backend-build /app/backend .

# Copy frontend build from build stage
COPY --from=frontend-build /app/.next ./.next
COPY --from=frontend-build /app/public ./public
COPY --from=frontend-build /app/package.json ./package.json

# Copy SQL scripts
COPY Backend-Resourcely/Backend-Resourcely/SqlScripts/ ./SqlScripts/

# Install Node.js runtime for serving frontend
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Expose ports
EXPOSE 8080 3000

# Create startup script
RUN echo '#!/bin/bash\n\
dotnet Backend-Resourcely.dll &\n\
BACKEND_PID=$!\n\
cd /app && npm start &\n\
FRONTEND_PID=$!\n\
wait $BACKEND_PID $FRONTEND_PID' > /app/start.sh && chmod +x /app/start.sh

# Start both services
CMD ["/app/start.sh"]