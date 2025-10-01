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

# Install only production dependencies for runtime
RUN npm ci --only=production

# Stage 3: Runtime - Combine Backend + Frontend
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy backend from build stage
COPY --from=backend-build /app/backend .

# Copy frontend build from build stage
# MY FIX - Copy node_modules with production dependencies
COPY --from=frontend-build /app/package.json ./package.json
COPY --from=frontend-build /app/node_modules ./node_modules  
COPY --from=frontend-build /app/.next ./.next
COPY --from=frontend-build /app/public ./public

# Copy SQL scripts
COPY Backend-Resourcely/Backend-Resourcely/SqlScripts/ ./SqlScripts/

# Install Node.js runtime for serving frontend
# MY FIX - Proper Node.js installation for Debian
RUN apt-get update && \
    apt-get install -y curl nginx && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*


# Copy nginx config (ADD THESE 2 LINES)
COPY nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

# Expose ports
EXPOSE 8080 

# Create startup script
# MY FIX - Use supervisor as proper process manager
RUN apt-get update && apt-get install -y supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]