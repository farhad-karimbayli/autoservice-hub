# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY AutoServiceHub.Api/AutoServiceHub.Api.csproj AutoServiceHub.Api/
RUN dotnet restore AutoServiceHub.Api/AutoServiceHub.Api.csproj
COPY . .
WORKDIR /src/AutoServiceHub.Api
RUN dotnet publish AutoServiceHub.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM runtime AS final
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AutoServiceHub.Api.dll"]
