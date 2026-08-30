[CmdletBinding()]
param(
  [string]$ReleaseDirectory = "release"
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$releaseRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $ReleaseDirectory))
if (-not $releaseRoot.StartsWith($repoRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "ReleaseDirectory must resolve inside the repository."
}
$expected = @(
  "rohith-health-coach-v1.0.0-rc1.zip",
  "rohith-health-coach-v1.0.0-rc2.zip",
  "rohith-health-coach-v1.0.0-rc3.zip",
  "rohith-health-coach-v1.0.0-rc4.zip",
  "rohith-health-private-plugin-v1.0.0-rc4.zip"
)
$tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
foreach ($name in $expected) {
  $archive = Join-Path $releaseRoot $name
  if (-not (Test-Path -LiteralPath $archive -PathType Leaf)) { throw "Missing release archive: $name" }
  $extract = Join-Path $tempRoot ("verify-rohith-health-" + [guid]::NewGuid().ToString("N"))
  try {
    Expand-Archive -LiteralPath $archive -DestinationPath $extract
    $files = Get-ChildItem -LiteralPath $extract -Recurse -Force -File
    $forbidden = $files | Where-Object {
      $_.Name -match '^\.env(?!\.example$)' -or
      $_.Extension -in @(".fit", ".gguf", ".key", ".p12", ".pfx", ".pem", ".pyc", ".log") -or
      $_.FullName -match '[\\/](node_modules|\.next|\.venv|\.git|test-results|playwright-report)[\\/]'
    }
    if ($forbidden) { throw "Forbidden release content in ${name}: $($forbidden.FullName -join ', ')" }
    node (Join-Path $repoRoot "scripts\verify-no-secrets.mjs") $extract
    if ($LASTEXITCODE -ne 0) { throw "Secret scan failed for $name" }
    Write-Output "PASS $name files=$($files.Count) sha256=$((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant())"
  } finally {
    $resolvedExtract = [System.IO.Path]::GetFullPath($extract)
    if ($resolvedExtract.StartsWith($tempRoot, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedExtract)) {
      Remove-Item -LiteralPath $resolvedExtract -Recurse -Force
    }
  }
}
