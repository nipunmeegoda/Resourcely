# Frontend build stage
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY Frontend-Resourcely/package*.json ./
RUN npm ci
COPY Frontend-Resourcely/ ./
RUN npm run build

# Backend build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build
WORKDIR /src
COPY Backend-Resourcely/Backend-Resourcely/Backend-Resourcely.csproj ./Backend-Resourcely/
RUN dotnet restore ./Backend-Resourcely/Backend-Resourcely.csproj
COPY Backend-Resourcely/Backend-Resourcely/ ./Backend-Resourcely/
WORKDIR /src/Backend-Resourcely
RUN dotnet publish Backend-Resourcely.csproj -c Release -o /app/publish

# Final stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=backend-build /app/publish .
COPY --from=frontend-build /app/frontend/dist ./wwwroot

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "Backend-Resourcely.dll"]
