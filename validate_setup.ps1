# ResumeAI Setup Validation Script
# This script checks if all components from AGENTS.md are properly instantiated

Write-Host "`n=== ResumeAI Setup Validation ===" -ForegroundColor Cyan
Write-Host "Checking instantiation status from AGENTS.md...`n" -ForegroundColor Gray

$allGood = $true

# Check 1: Node Modules
Write-Host "[1/7] Checking Dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✓ node_modules exists" -ForegroundColor Green
    $packageCount = (npm list --depth=0 2>$null | Select-String "├──|└──").Count
    Write-Host "  ✓ $packageCount packages installed" -ForegroundColor Green
} else {
    Write-Host "  ✗ node_modules missing - run 'npm install'" -ForegroundColor Red
    $allGood = $false
}

# Check 2: Environment Files
Write-Host "`n[2/7] Checking Environment Configuration..." -ForegroundColor Yellow
if (Test-Path ".env.example") {
    Write-Host "  ✓ .env.example exists" -ForegroundColor Green
} else {
    Write-Host "  ✗ .env.example missing" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path ".env.local") {
    Write-Host "  ✓ .env.local exists" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -Raw
    
    # Check for required variables
    $hasSupabaseUrl = $envContent -match "NEXT_PUBLIC_SUPABASE_URL"
    $hasSupabaseAnon = $envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    $hasSupabaseService = $envContent -match "SUPABASE_SERVICE_ROLE_KEY"
    $hasGemini = $envContent -match "GEMINI_API_KEY"
    
    if ($hasGemini) {
        Write-Host "  ✓ GEMINI_API_KEY configured" -ForegroundColor Green
    } else {
        Write-Host "  ✗ GEMINI_API_KEY missing" -ForegroundColor Red
        $allGood = $false
    }
    
    if ($hasSupabaseUrl -and $hasSupabaseAnon -and $hasSupabaseService) {
        # Check if they're still placeholders
        if ($envContent -match "your-project.supabase.co" -or $envContent -match "your_.*_key") {
            Write-Host "  ⚠ Supabase credentials are placeholders - need real values" -ForegroundColor Yellow
            $allGood = $false
        } else {
            Write-Host "  ✓ Supabase credentials configured" -ForegroundColor Green
        }
    } else {
        Write-Host "  ✗ Supabase environment variables missing" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "  ✗ .env.local missing" -ForegroundColor Red
    $allGood = $false
}

# Check 3: Database Migrations
Write-Host "`n[3/7] Checking Database Migrations..." -ForegroundColor Yellow
$migrations = @(
    "supabase\migrations\001_initial_schema.sql",
    "supabase\migrations\002_storage_setup.sql",
    "supabase\migrations\003_generated_resumes.sql"
)

$migrationsExist = $true
foreach ($migration in $migrations) {
    if (Test-Path $migration) {
        Write-Host "  ✓ $(Split-Path $migration -Leaf)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $(Split-Path $migration -Leaf) missing" -ForegroundColor Red
        $migrationsExist = $false
    }
}

if ($migrationsExist) {
    Write-Host "  ⚠ Migrations exist but need to be run in Supabase SQL Editor" -ForegroundColor Yellow
}

# Check 4: Core Application Files
Write-Host "`n[4/7] Checking Application Structure..." -ForegroundColor Yellow
$coreFiles = @(
    "src\app\page.tsx",
    "src\app\dashboard\page.tsx",
    "src\app\layout.tsx",
    "src\app\globals.css"
)

foreach ($file in $coreFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file missing" -ForegroundColor Red
        $allGood = $false
    }
}

# Check 5: API Routes
Write-Host "`n[5/7] Checking API Routes..." -ForegroundColor Yellow
$apiRoutes = @(
    "src\app\api\generate",
    "src\app\api\ingest"
)

foreach ($route in $apiRoutes) {
    if (Test-Path $route) {
        Write-Host "  ✓ $route" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $route missing" -ForegroundColor Red
        $allGood = $false
    }
}

# Check 6: Components
Write-Host "`n[6/7] Checking Components..." -ForegroundColor Yellow
if (Test-Path "src\components") {
    $componentCount = (Get-ChildItem "src\components" -File -Recurse).Count
    Write-Host "  ✓ Components directory exists ($componentCount files)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Components directory missing" -ForegroundColor Red
    $allGood = $false
}

# Check 7: Documentation
Write-Host "`n[7/7] Checking Documentation..." -ForegroundColor Yellow
$docs = @(
    "AGENTS.md",
    "README.md",
    "BACKEND_API_DOCS.md",
    "TESTING_GUIDE.md"
)

foreach ($doc in $docs) {
    if (Test-Path $doc) {
        Write-Host "  ✓ $doc" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $doc missing (optional)" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
if ($allGood) {
    Write-Host "✓ All core components are instantiated!" -ForegroundColor Green
    Write-Host "`nNext Steps:" -ForegroundColor Cyan
    Write-Host "1. Configure Supabase credentials in .env.local" -ForegroundColor White
    Write-Host "2. Run database migrations in Supabase SQL Editor" -ForegroundColor White
    Write-Host "3. Create storage bucket 'resumes' in Supabase" -ForegroundColor White
    Write-Host "4. Run 'npm run dev' to start development server" -ForegroundColor White
} else {
    Write-Host "✗ Some components need attention (see above)" -ForegroundColor Red
    Write-Host "`nPriority Actions:" -ForegroundColor Cyan
    Write-Host "1. Fix any missing files or configurations marked with ✗" -ForegroundColor White
    Write-Host "2. Address warnings marked with ⚠" -ForegroundColor White
    Write-Host "3. Review AGENTS.md for detailed setup instructions" -ForegroundColor White
}

Write-Host "`nFor detailed instructions, see:" -ForegroundColor Gray
Write-Host "  - AGENTS.md (complete setup guide)" -ForegroundColor Gray
Write-Host "  - instantiation_checklist.md (step-by-step checklist)" -ForegroundColor Gray
Write-Host ""
