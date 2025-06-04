# Create Zustand Stores Directory Structure
# Run this script from the root directory of your audio_transcription_app_typescript project

Write-Host "🚀 Creating Zustand store structure for Audio Transcription App..." -ForegroundColor Green
Write-Host ""

# Define the base path
$basePath = "src/stores"

# Create main directories
Write-Host "📁 Creating main directories..." -ForegroundColor Yellow
$directories = @(
    "$basePath",
    "$basePath/slices",
    "$basePath/middlewares", 
    "$basePath/hooks"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✅ Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  Already exists: $dir" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "📄 Creating TypeScript files..." -ForegroundColor Yellow

# Define all files to create
$files = @(
    # Main store file
    @{
        Path = "$basePath/store.ts"
        Description = "Main store composition"
    },
    
    # Slice files
    @{
        Path = "$basePath/slices/knowledgeSlice.ts"
        Description = "Document management & vector DB slice"
    },
    @{
        Path = "$basePath/slices/llmSlice.ts"
        Description = "OpenAI streaming & conversations slice"
    },
    @{
        Path = "$basePath/slices/speechSlice.ts"
        Description = "Audio recording & transcription slice"
    },
    @{
        Path = "$basePath/slices/interviewSlice.ts"
        Description = "Interview context & flow slice"
    },
    @{
        Path = "$basePath/slices/uiSlice.ts"
        Description = "Modals, notifications, theme slice"
    },
    @{
        Path = "$basePath/slices/index.ts"
        Description = "Export all slices"
    },
    
    # Middleware files
    @{
        Path = "$basePath/middlewares/persistenceMiddleware.ts"
        Description = "Custom persistence middleware"
    },
    @{
        Path = "$basePath/middlewares/errorHandlingMiddleware.ts"
        Description = "Custom error handling middleware"
    },
    @{
        Path = "$basePath/middlewares/performanceMiddleware.ts"
        Description = "Custom performance monitoring middleware"
    },
    
    # Hook files
    @{
        Path = "$basePath/hooks/useKnowledge.ts"
        Description = "Optimized knowledge store hooks"
    },
    @{
        Path = "$basePath/hooks/useLLM.ts"
        Description = "Optimized LLM store hooks"
    },
    @{
        Path = "$basePath/hooks/useSpeech.ts"
        Description = "Optimized speech store hooks"
    },
    @{
        Path = "$basePath/hooks/useSelectors.ts"
        Description = "Optimized selector hooks"
    }
)

# Create each file
foreach ($file in $files) {
    if (!(Test-Path $file.Path)) {
        New-Item -ItemType File -Path $file.Path -Force | Out-Null
        Write-Host "  ✅ Created: $($file.Path) - $($file.Description)" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  Already exists: $($file.Path)" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "🎉 Zustand store structure created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Summary of created structure:" -ForegroundColor White
Write-Host "  📁 src/stores/" -ForegroundColor Blue
Write-Host "  │   📄 store.ts (Main store composition)" -ForegroundColor Gray
Write-Host "  │   📁 slices/" -ForegroundColor Blue
Write-Host "  │   │   📄 knowledgeSlice.ts (Document management & vector DB)" -ForegroundColor Gray
Write-Host "  │   │   📄 llmSlice.ts (OpenAI streaming & conversations)" -ForegroundColor Gray
Write-Host "  │   │   📄 speechSlice.ts (Audio recording & transcription)" -ForegroundColor Gray
Write-Host "  │   │   📄 interviewSlice.ts (Interview context & flow)" -ForegroundColor Gray
Write-Host "  │   │   📄 uiSlice.ts (Modals, notifications, theme)" -ForegroundColor Gray
Write-Host "  │   │   📄 index.ts (Export all slices)" -ForegroundColor Gray
Write-Host "  │   📁 middlewares/" -ForegroundColor Blue
Write-Host "  │   │   📄 persistenceMiddleware.ts (Custom persistence)" -ForegroundColor Gray
Write-Host "  │   │   📄 errorHandlingMiddleware.ts (Custom error handling)" -ForegroundColor Gray
Write-Host "  │   │   📄 performanceMiddleware.ts (Performance monitoring)" -ForegroundColor Gray
Write-Host "  │   📁 hooks/" -ForegroundColor Blue
Write-Host "  │   │   📄 useKnowledge.ts (Knowledge store hooks)" -ForegroundColor Gray
Write-Host "  │   │   📄 useLLM.ts (LLM store hooks)" -ForegroundColor Gray
Write-Host "  │   │   📄 useSpeech.ts (Speech store hooks)" -ForegroundColor Gray
Write-Host "  │   │   📄 useSelectors.ts (Optimized selectors)" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Magenta
Write-Host "  1. Install Zustand dependencies: npm install zustand immer" -ForegroundColor White
Write-Host "  2. Create type definitions in src/types/store.ts" -ForegroundColor White
Write-Host "  3. Implement each slice according to the migration guide" -ForegroundColor White
Write-Host "  4. Update your components to use the new Zustand stores" -ForegroundColor White
Write-Host ""
Write-Host "✨ Happy coding with Zustand! Your state management is about to get much cleaner!" -ForegroundColor Green