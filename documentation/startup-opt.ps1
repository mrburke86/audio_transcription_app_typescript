# ========================================
# 🚀 STARTUP PROGRAM OPTIMIZER
# Enhanced with colorful logging and emojis
# ========================================

# Color and emoji functions
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Cyan }
function Write-Progress { param($Message) Write-Host "🔄 $Message" -ForegroundColor Magenta }
function Write-Header { param($Message) Write-Host "`n🎯 $Message" -ForegroundColor Blue -BackgroundColor White }

# Initialize counters
$totalRemoved = 0
$totalChecked = 0
$programsProcessed = 0

Write-Host "`n" + "="*60 -ForegroundColor DarkGray
Write-Host "🛠️  WINDOWS 11 STARTUP OPTIMIZER" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host "   Removing resource-heavy startup programs" -ForegroundColor Gray
Write-Host "="*60 -ForegroundColor DarkGray

# Programs to disable with their expected impact
$programsToDisable = @{
    "Samsung DeX" = @{
        Name = "Samsung DeX"
        Impact = "30-80MB RAM"
        Emoji = "📱"
    }
    "Grammarly" = @{
        Name = "Grammarly" 
        Impact = "50-150MB RAM"
        Emoji = "✍️"
    }
    "MEGAsync" = @{
        Name = "MEGAsync"
        Impact = "40-100MB RAM" 
        Emoji = "☁️"
    }
}

$registryPaths = @(
    @{ Path = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Run"; Name = "Current User Registry" },
    @{ Path = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Run"; Name = "Local Machine Registry" }
)

Write-Info "Target programs: $($programsToDisable.Count) applications"
Write-Info "Scanning locations: Registry, Startup folders, Scheduled tasks"
Write-Host ""

foreach ($programKey in $programsToDisable.Keys) {
    $program = $programsToDisable[$programKey]
    $programsProcessed++
    
    Write-Header "$($program.Emoji) Processing: $($program.Name) (Expected savings: $($program.Impact))"
    
    $removedThisProgram = 0
    
    # ================================
    # 🔍 REGISTRY SCAN
    # ================================
    Write-Progress "Scanning Windows Registry locations..."
    
    foreach ($regLocation in $registryPaths) {
        $totalChecked++
        try {
            $regEntry = Get-ItemProperty -Path $regLocation.Path -Name $program.Name -ErrorAction SilentlyContinue
            if ($regEntry) {
                Remove-ItemProperty -Path $regLocation.Path -Name $program.Name -ErrorAction Stop
                Write-Success "Removed from $($regLocation.Name): $($regLocation.Path)"
                $removedThisProgram++
                $totalRemoved++
            } else {
                Write-Info "Not found in $($regLocation.Name)"
            }
        } catch {
            Write-Error "Failed to access $($regLocation.Name): $($_.Exception.Message)"
        }
    }
    
    # ================================
    # 📁 STARTUP FOLDER SCAN  
    # ================================
    Write-Progress "Scanning Windows Startup folders..."
    
    $startupFolders = @(
        @{ Path = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\"; Name = "User Startup Folder" },
        @{ Path = "$env:ALLUSERSPROFILE\Microsoft\Windows\Start Menu\Programs\Startup\"; Name = "System Startup Folder" }
    )
    
    foreach ($folder in $startupFolders) {
        $totalChecked++
        try {
            if (Test-Path $folder.Path) {
                $startupFiles = Get-ChildItem $folder.Path -Name "*$($program.Name)*" -ErrorAction SilentlyContinue
                if ($startupFiles) {
                    foreach ($file in $startupFiles) {
                        Remove-Item "$($folder.Path)\$file" -ErrorAction Stop
                        Write-Success "Removed shortcut: $file from $($folder.Name)"
                        $removedThisProgram++
                        $totalRemoved++
                    }
                } else {
                    Write-Info "No shortcuts found in $($folder.Name)"
                }
            } else {
                Write-Warning "$($folder.Name) does not exist"
            }
        } catch {
            Write-Error "Failed to scan $($folder.Name): $($_.Exception.Message)"
        }
    }
    
    # ================================
    # ⏰ SCHEDULED TASKS SCAN
    # ================================
    Write-Progress "Scanning Windows Scheduled Tasks..."
    
    $totalChecked++
    try {
        $tasks = Get-ScheduledTask -TaskName "*$($program.Name)*" -ErrorAction SilentlyContinue
        if ($tasks) {
            foreach ($task in $tasks) {
                try {
                    Disable-ScheduledTask -TaskName $task.TaskName -ErrorAction Stop | Out-Null
                    Write-Success "Disabled scheduled task: $($task.TaskName)"
                    $removedThisProgram++
                    $totalRemoved++
                } catch {
                    Write-Error "Failed to disable task $($task.TaskName): $($_.Exception.Message)"
                }
            }
        } else {
            Write-Info "No scheduled tasks found for $($program.Name)"
        }
    } catch {
        Write-Warning "Could not scan scheduled tasks for $($program.Name)"
    }
    
    # ================================
    # 📊 PROGRAM SUMMARY
    # ================================
    if ($removedThisProgram -gt 0) {
        Write-Host "🎉 " -NoNewline -ForegroundColor Green
        Write-Host "$($program.Name) successfully disabled! " -NoNewline -ForegroundColor Green
        Write-Host "($removedThisProgram entries removed)" -ForegroundColor DarkGreen
    } else {
        Write-Host "🔍 " -NoNewline -ForegroundColor Yellow
        Write-Host "$($program.Name) was not found in startup locations" -ForegroundColor Yellow
    }
    
    # Progress indicator
    $percentComplete = [math]::Round(($programsProcessed / $programsToDisable.Count) * 100)
    Write-Host "📈 Progress: $percentComplete% ($programsProcessed/$($programsToDisable.Count) programs)" -ForegroundColor DarkCyan
    Write-Host ""
}

# ================================
# 🎯 FINAL RESULTS SUMMARY
# ================================
Write-Host "="*60 -ForegroundColor DarkGray
Write-Host "🏁 OPTIMIZATION COMPLETE!" -ForegroundColor White -BackgroundColor DarkGreen
Write-Host "="*60 -ForegroundColor DarkGray

Write-Host "📊 " -NoNewline -ForegroundColor Cyan
Write-Host "PERFORMANCE SUMMARY:" -ForegroundColor Cyan -BackgroundColor DarkBlue

if ($totalRemoved -gt 0) {
    Write-Success "Total startup entries removed: $totalRemoved"
    Write-Success "Total locations scanned: $totalChecked"
    Write-Host "💾 " -NoNewline -ForegroundColor Green
    Write-Host "Estimated RAM savings: 120-330MB" -ForegroundColor Green
    Write-Host "⚡ " -NoNewline -ForegroundColor Yellow
    Write-Host "Expected boot time improvement: 10-25 seconds" -ForegroundColor Yellow
    Write-Host "🔄 " -NoNewline -ForegroundColor Magenta
    Write-Host "Restart required to see full benefits" -ForegroundColor Magenta
} else {
    Write-Warning "No startup programs were found to remove"
    Write-Info "This could mean programs are already disabled or stored in different locations"
}

Write-Host ""

# ================================
# 🔍 VERIFICATION SCAN
# ================================
Write-Header "🔍 Verification: Checking remaining startup programs"

try {
    $remainingPrograms = Get-CimInstance Win32_StartupCommand | 
        Where-Object {$_.Name -match "Samsung|Grammarly|MEGA"} | 
        Select-Object Name, Command, Location
    
    if ($remainingPrograms) {
        Write-Warning "Some target programs still found in startup:"
        $remainingPrograms | ForEach-Object {
            Write-Host "   🔸 $($_.Name)" -ForegroundColor Yellow
        }
        Write-Info "You may need to disable these manually through their application settings"
    } else {
        Write-Success "Verification complete! No target programs found in startup"
    }
} catch {
    Write-Warning "Could not perform verification scan: $($_.Exception.Message)"
}

# ================================
# 💡 NEXT STEPS
# ================================
Write-Host "`n💡 " -NoNewline -ForegroundColor Blue
Write-Host "RECOMMENDED NEXT STEPS:" -ForegroundColor Blue

Write-Host "   1️⃣  Restart your computer to apply changes"
Write-Host "   2️⃣  Monitor boot time and system performance"  
Write-Host "   3️⃣  Continue with other optimization steps"
Write-Host "   4️⃣  Check Task Manager > Startup tab for remaining programs"

Write-Host "`n🎯 " -NoNewline -ForegroundColor Green
Write-Host "Startup optimization completed successfully!" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor DarkGray