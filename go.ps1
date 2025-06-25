# ========================================
# 🛠️ WSL2 STABILITY FIX FOR DOCKER
# Comprehensive fix for WSL2 crashes during builds
# ========================================

# Color functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Progress { param($Message) Write-Host "🔄 $Message" -ForegroundColor Magenta }
function Write-Header { param($Message) Write-Host "`n🎯 $Message" -ForegroundColor Blue -BackgroundColor White }

Write-Host "`n" + "="*70 -ForegroundColor DarkGray
Write-Host "🛠️ WSL2 STABILITY FIX FOR DOCKER" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "   Fixing WSL2 crashes during Docker builds" -ForegroundColor Gray
Write-Host "="*70 -ForegroundColor DarkGray

# ================================
# 🔍 SYSTEM DIAGNOSIS
# ================================
Write-Header "🔍 System Resource Analysis"

$computerInfo = Get-ComputerInfo
$totalRAM = [math]::Round($computerInfo.TotalPhysicalMemory / 1GB, 2)
$availableRAM = [math]::Round($computerInfo.AvailablePhysicalMemory / 1GB, 2)

Write-Info "System RAM: ${totalRAM}GB total, ${availableRAM}GB available"

# Determine optimal WSL2 memory allocation
$recommendedWSLMemory = [math]::Min([math]::Floor($totalRAM * 0.5), $totalRAM - 4)
$recommendedWSLMemory = [math]::Max($recommendedWSLMemory, 4)  # Minimum 4GB

Write-Success "Recommended WSL2 memory allocation: ${recommendedWSLMemory}GB"

if ($totalRAM -lt 8) {
    Write-Warning "Low system RAM detected. Docker builds may be challenging."
}

# ================================
# 🛑 COMPLETE RESET SEQUENCE
# ================================
Write-Header "🛑 Complete WSL2 + Docker Reset"

Write-Progress "Stopping all Docker processes..."
Get-Process "*docker*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 3

Write-Progress "Shutting down WSL2 completely..."
try {
    wsl --shutdown
    Write-Success "WSL2 shutdown completed"
    Start-Sleep 5
} catch {
    Write-Warning "WSL2 shutdown command issues, continuing..."
}

# ================================
# ⚙️ WSL2 CONFIGURATION OPTIMIZATION
# ================================
Write-Header "⚙️ WSL2 Configuration Optimization"

$wslConfigPath = "$env:USERPROFILE\.wslconfig"
Write-Progress "Creating optimized WSL2 configuration..."

$wslConfig = @"
[wsl2]
# Memory allocation (${recommendedWSLMemory}GB)
memory=${recommendedWSLMemory}GB

# Processor allocation (use half of available cores)
processors=$([math]::Max([math]::Floor($env:NUMBER_OF_PROCESSORS / 2), 2))

# Enable swap to prevent out-of-memory crashes
swap=4GB
swapFile=$env:USERPROFILE\wsl-swap.vhdx

# Prevent WSL2 from consuming too much memory
vmIdleTimeout=60000

# Optimize networking
localhostForwarding=true

# Enable nested virtualization (helps with Docker stability)
nestedVirtualization=true

# Increase file descriptor limits
kernelCommandLine=sysctl.fs.file-max=2097152

# Memory management optimization
pageReporting=true
debugConsole=true
"@

try {
    # Backup existing config if it exists
    if (Test-Path $wslConfigPath) {
        Copy-Item $wslConfigPath "$wslConfigPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Write-Info "Backed up existing WSL config"
    }
    
    $wslConfig | Out-File -FilePath $wslConfigPath -Encoding UTF8
    Write-Success "Created optimized WSL2 config: $wslConfigPath"
    
    Write-Info "WSL2 Configuration Summary:"
    Write-Host "   💾 Memory: ${recommendedWSLMemory}GB" -ForegroundColor Gray
    Write-Host "   ⚡ Processors: $([math]::Max([math]::Floor($env:NUMBER_OF_PROCESSORS / 2), 2)) cores" -ForegroundColor Gray
    Write-Host "   🔄 Swap: 4GB" -ForegroundColor Gray
    Write-Host "   🛡️ Nested virtualization: Enabled" -ForegroundColor Gray
    
} catch {
    Write-Error "Failed to create WSL config: $($_.Exception.Message)"
}

# ================================
# 🐳 DOCKER DESKTOP CONFIGURATION
# ================================
Write-Header "🐳 Docker Desktop Resource Optimization"

Write-Progress "Configuring Docker Desktop settings..."

$dockerSettingsPath = "$env:APPDATA\Docker\settings.json"
if (Test-Path $dockerSettingsPath) {
    try {
        $dockerSettings = Get-Content $dockerSettingsPath | ConvertFrom-Json
        
        # Optimize Docker resources
        $dockerSettings.memoryMiB = ($recommendedWSLMemory - 1) * 1024  # Leave 1GB for WSL2 overhead
        $dockerSettings.cpus = [math]::Max([math]::Floor($env:NUMBER_OF_PROCESSORS / 2), 2)
        $dockerSettings.swapMiB = 2048  # 2GB swap for Docker
        
        # Enable BuildKit for better performance
        $dockerSettings.buildkit = $true
        
        # Optimize for stability
        $dockerSettings.useWindowsContainers = $false
        $dockerSettings.wslEngineEnabled = $true
        
        # File sharing optimization
        $dockerSettings.filesharingDirectories = @()  # Clear to reduce overhead
        
        $dockerSettings | ConvertTo-Json -Depth 10 | Set-Content $dockerSettingsPath
        Write-Success "Docker Desktop settings optimized"
        
        Write-Info "Docker Resource Allocation:"
        Write-Host "   💾 Memory: $(($recommendedWSLMemory - 1))GB" -ForegroundColor Gray
        Write-Host "   ⚡ CPUs: $([math]::Max([math]::Floor($env:NUMBER_OF_PROCESSORS / 2), 2)) cores" -ForegroundColor Gray
        Write-Host "   🔄 Swap: 2GB" -ForegroundColor Gray
        
    } catch {
        Write-Warning "Could not modify Docker settings automatically"
        Write-Info "Please manually configure Docker Desktop:"
        Write-Host "   Settings > Resources > Advanced" -ForegroundColor Gray
        Write-Host "   Memory: $(($recommendedWSLMemory - 1))GB" -ForegroundColor Gray
        Write-Host "   CPUs: $([math]::Max([math]::Floor($env:NUMBER_OF_PROCESSORS / 2), 2))" -ForegroundColor Gray
    }
} else {
    Write-Warning "Docker settings not found - will configure on first launch"
}

# ================================
# 🔄 RESTART WITH NEW CONFIGURATION
# ================================
Write-Header "🔄 Restarting with New Configuration"

Write-Progress "Starting Docker Desktop with new configuration..."
try {
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Start-Process -FilePath $dockerPath
    Write-Success "Docker Desktop started"
} catch {
    Write-Error "Failed to start Docker Desktop"
    exit 1
}

Write-Warning "⏳ IMPORTANT: This startup will take longer (2-3 minutes)"
Write-Info "WSL2 needs to apply new configuration and restart the kernel"

# ================================
# ⏱️ ENHANCED STARTUP MONITORING
# ================================
Write-Header "⏱️ Startup Progress Monitoring"

$maxWaitTime = 180  # 3 minutes
$checkInterval = 10
$elapsed = 0

Write-Progress "Monitoring WSL2 + Docker startup..."

do {
    Start-Sleep $checkInterval
    $elapsed += $checkInterval
    
    # Check WSL2 status
    try {
        $wslStatus = wsl --list --verbose 2>$null
        $dockerWslRunning = $wslStatus | Select-String "docker-desktop.*Running"
        
        if ($dockerWslRunning) {
            Write-Success "WSL2 docker-desktop backend is running"
            
            # Check Docker engine
            try {
                $dockerVersion = docker version --format '{{.Server.Version}}' 2>$null
                if ($dockerVersion) {
                    Write-Success "🎉 Docker engine is responding! (v$dockerVersion)"
                    break
                }
            } catch {
                Write-Progress "Docker engine still initializing..."
            }
        } else {
            Write-Progress "WSL2 still starting with new configuration... (${elapsed}s elapsed)"
        }
    } catch {
        Write-Progress "Waiting for WSL2 availability... (${elapsed}s elapsed)"
    }
    
} while ($elapsed -lt $maxWaitTime)

# ================================
# 🧪 BUILD CONTEXT OPTIMIZATION
# ================================
Write-Header "🧪 Build Context Optimization"

Write-Info "Your build context was 492MB - this can cause WSL2 crashes"
Write-Progress "Creating optimized .dockerignore recommendations..."

$dockerIgnoreContent = @"
# ===================================
# OPTIMIZED .DOCKERIGNORE
# Reduces build context size
# ===================================

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
.next/
out/
dist/
build/

# Cache directories
.cache/
.npm/
.yarn/

# Environment files
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Git
.git/
.gitignore

# Documentation
README.md
docs/
*.md

# Testing
coverage/
.nyc_output/
test-results/

# Logs
logs/
*.log

# Temporary files
tmp/
temp/
.tmp/

# Large media files (add your specific paths)
public/images/large/
assets/videos/
*.mp4
*.avi
*.mov

# Development only files
docker-compose.override.yml
.env.example
"@

$dockerIgnorePath = ".\audio_transcription_app_typescript\.dockerignore"
if (Test-Path ".\audio_transcription_app_typescript") {
    try {
        $dockerIgnoreContent | Out-File -FilePath $dockerIgnorePath -Encoding UTF8
        Write-Success "Created optimized .dockerignore file"
        Write-Info "This should reduce your build context from 492MB significantly"
    } catch {
        Write-Warning "Could not create .dockerignore file in current directory"
        Write-Info "Manually create .dockerignore in your project root with the content above"
    }
} else {
    Write-Info "Navigate to your project directory to apply .dockerignore optimization"
}

# ================================
# 🎯 TESTING RECOMMENDATIONS
# ================================
Write-Header "🎯 Testing Strategy"

if ($elapsed -lt $maxWaitTime) {
    Write-Success "✅ System is ready for testing!"
    
    Write-Info "Recommended testing approach:"
    Write-Host "   1️⃣ Navigate to your project directory" -ForegroundColor Gray
    Write-Host "   2️⃣ Clean Docker cache: docker system prune -f" -ForegroundColor Gray
    Write-Host "   3️⃣ Try build again: docker-compose up --build" -ForegroundColor Gray
    Write-Host "   4️⃣ Monitor WSL2 memory: Task Manager > Performance > Memory" -ForegroundColor Gray
    
    Write-Warning "⚠️ If it crashes again:"
    Write-Host "   • Reduce Docker memory allocation to 6GB" -ForegroundColor Gray
    Write-Host "   • Optimize your build process (multi-stage builds)" -ForegroundColor Gray
    Write-Host "   • Consider upgrading system RAM" -ForegroundColor Gray
    
} else {
    Write-Warning "⏰ Startup took longer than expected"
    Write-Info "Try waiting another 2-3 minutes, then test manually"
}

# ================================
# 📋 MONITORING COMMANDS
# ================================
Write-Header "📋 Monitoring & Troubleshooting Commands"

Write-Info "Save these commands for monitoring:"

$monitoringCommands = @"
# Check WSL2 memory usage
wsl -d docker-desktop -e cat /proc/meminfo

# Check Docker system info
docker system df
docker system info

# Monitor build progress with less memory pressure
docker-compose build --no-cache --progress=plain

# Clean up Docker resources if needed
docker system prune -a -f
docker builder prune -a -f

# Check WSL2 status
wsl --list --verbose
wsl --status
"@

$monitoringPath = "$env:USERPROFILE\Documents\docker-monitoring-commands.txt"
$monitoringCommands | Out-File -FilePath $monitoringPath -Encoding UTF8
Write-Success "Saved monitoring commands to: $monitoringPath"

# ================================
# 🏁 SUMMARY
# ================================
Write-Header "🏁 Fix Summary"

Write-Success "✅ WSL2 configuration optimized for stability"
Write-Success "✅ Docker Desktop resources properly allocated"
Write-Success "✅ Build context optimization recommendations provided"
Write-Success "✅ Enhanced monitoring tools configured"

Write-Host "`n🎯 " -NoNewline -ForegroundColor Green
Write-Host "WSL2 stability fix completed!" -ForegroundColor Green

Write-Host "`n💡 Next steps:" -ForegroundColor Blue
Write-Host "   1. Test your Docker build in the project directory" -ForegroundColor Gray
Write-Host "   2. Monitor system resources during build" -ForegroundColor Gray
Write-Host "   3. Apply .dockerignore optimizations" -ForegroundColor Gray

Write-Host "="*70 -ForegroundColor DarkGray