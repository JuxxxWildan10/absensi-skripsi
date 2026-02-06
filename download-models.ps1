# Download face-api.js models for face detection
$MODEL_DIR = "public/models"

# Ensure directory exists
if (!(Test-Path -Path $MODEL_DIR)) {
    New-Item -ItemType Directory -Path $MODEL_DIR | Out-Null
}

# Model URLs
$urls = @(
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json",
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1",
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json",
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1",
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json",
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1",
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2",
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json",
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1"
)

Write-Host "Downloading face-api.js models to $MODEL_DIR..." -ForegroundColor Cyan

foreach ($url in $urls) {
    $filename = Split-Path $url -Leaf
    $outfile = Join-Path $MODEL_DIR $filename
    
    Write-Host "Downloading $filename..." -ForegroundColor Yellow
    try {
        # Use .NET WebClient for better compatibility if Invoke-WebRequest fails in some envs, but Invoke-WebRequest is standard.
        # Adding -UseBasicParsing for compatibility
        Invoke-WebRequest -Uri $url -OutFile $outfile -UseBasicParsing
        Write-Host "  OK Downloaded $filename" -ForegroundColor Green
    }
    catch {
        Write-Host "  FAIL Failed to download $filename" -ForegroundColor Red
        Write-Error $_
    }
}

Write-Host "Done! Models are ready in $MODEL_DIR" -ForegroundColor Cyan
