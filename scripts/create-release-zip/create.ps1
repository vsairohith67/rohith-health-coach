[CmdletBinding()]
param(
  [ValidateSet("rc1", "rc2", "rc3", "rc4", "rc5", "rc6", "rc7")]
  [string]$Version = "rc6",
  [string]$OutputDirectory = "release"
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$outputRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $OutputDirectory))
if (-not $outputRoot.StartsWith($repoRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "OutputDirectory must resolve inside the repository."
}
[System.IO.Directory]::CreateDirectory($outputRoot) | Out-Null
$archive = Join-Path $outputRoot "rohith-health-coach-v1.0.0-$Version.zip"
if (Test-Path -LiteralPath $archive) { Remove-Item -LiteralPath $archive -Force }

$staging = Join-Path ([System.IO.Path]::GetTempPath()) ("rohith-health-release-" + [guid]::NewGuid().ToString("N"))
$payload = Join-Path $staging "rohith-health-coach"
[System.IO.Directory]::CreateDirectory($payload) | Out-Null
$excludedDirectories = @(".git", ".next", ".venv", ".vercel", ".supabase", ".pytest_cache", ".ruff_cache", ".temp", ".branches", ".turbo", "__pycache__", "coverage", "node_modules", "playwright-report", "release", "test-results")
try {
  Get-ChildItem -LiteralPath $repoRoot -Recurse -Force -File | ForEach-Object {
    $relative = [System.IO.Path]::GetRelativePath($repoRoot, $_.FullName)
    $segments = $relative -split '[\\/]'
    if ($segments | Where-Object { $_ -in $excludedDirectories }) { return }
    if ($_.Name -in @("release-manifest.json", "release-checksums.txt", "final-release-manifest.json", "final-release-checksums.txt", "rc5-release-manifest.json", "rc5-release-checksums.txt", "RC5_RELEASE_REPORT.md", "rc6-release-manifest.json", "rc6-release-checksums.txt", "RC6_RELEASE_REPORT.md", "rc7-release-manifest.json", "rc7-release-checksums.txt", "RC7_RELEASE_REPORT.md")) { return }
    if ($_.Extension -ieq ".zip") { return }
    if ($_.Name -match '^\.env(?!\.example$)') { return }
    if ($_.Extension -in @(".fit", ".gguf", ".key", ".log", ".p12", ".pfx", ".pem", ".pyc")) { return }
    $destination = Join-Path $payload $relative
    [System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($destination)) | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $destination
  }
  $phase = [ordered]@{
    artifact = "rohith-health-coach-v1.0.0-$Version.zip"
    source_version = "1.0.0-$Version"
    release_gate = $Version
    reconstructed_from_cumulative_source = ($Version -in @("rc1", "rc2", "rc3"))
    contains_personal_health_data = $false
    production_integrations_enabled = $false
    generated_at = [DateTimeOffset]::UtcNow.ToString("o")
  }
  $phaseJson = (($phase | ConvertTo-Json) -replace "`r`n", "`n") + "`n"
  [System.IO.File]::WriteAllText(
    (Join-Path $payload "release-phase.json"),
    $phaseJson,
    [System.Text.UTF8Encoding]::new($false)
  )
  Compress-Archive -LiteralPath $payload -DestinationPath $archive -CompressionLevel Optimal
  Write-Output $archive
} finally {
  $tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
  $resolvedStaging = [System.IO.Path]::GetFullPath($staging)
  if ($resolvedStaging.StartsWith($tempRoot, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedStaging)) {
    Remove-Item -LiteralPath $resolvedStaging -Recurse -Force
  }
}
