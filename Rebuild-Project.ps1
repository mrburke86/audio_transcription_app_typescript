# Stop and remove containers
docker-compose down -v

# Remove Docker images
docker images -a | Where-Object {$_ -like "*nextjs_app*"} | ForEach-Object { docker rmi $_.ID -f }

# Clean up Docker system
docker system prune -a -f

# Remove Next.js build artifacts
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue .next

# Remove node_modules and reinstall dependencies
# Remove-Item -Recurse -Force -ErrorAction SilentlyContinue node_modules
# Remove-Item -Force -ErrorAction SilentlyContinue bun.lockb  # Added line to remove bun.lockb
# bun install

# Rebuild and run Docker containers
docker-compose up --build -d

Write-Host "Process completed."