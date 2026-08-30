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

$expectedDigests = @{}
$manifestDigests = @{}
$evidenceSets = @(
  @{
    Checksums = Join-Path $repoRoot "release-checksums.txt"
    Manifest = Join-Path $repoRoot "release-manifest.json"
  },
  @{
    Checksums = Join-Path $repoRoot "final-release-checksums.txt"
    Manifest = Join-Path $repoRoot "final-release-manifest.json"
  }
)

foreach ($evidence in $evidenceSets) {
  if (-not (Test-Path -LiteralPath $evidence.Checksums -PathType Leaf)) {
    throw "Missing release checksum evidence: $($evidence.Checksums)"
  }
  foreach ($line in Get-Content -LiteralPath $evidence.Checksums) {
    if ([string]::IsNullOrWhiteSpace($line)) { continue }
    if ($line -notmatch '^([0-9a-fA-F]{64})\s{2}(.+\.zip)$') {
      throw "Invalid checksum evidence line in $($evidence.Checksums): $line"
    }
    $digest = $Matches[1].ToLowerInvariant()
    $filename = $Matches[2]
    if ($expectedDigests.ContainsKey($filename) -and $expectedDigests[$filename] -ne $digest) {
      throw "Conflicting checksum evidence for ${filename}."
    }
    $expectedDigests[$filename] = $digest
  }

  if (-not (Test-Path -LiteralPath $evidence.Manifest -PathType Leaf)) {
    throw "Missing release manifest evidence: $($evidence.Manifest)"
  }
  $manifest = Get-Content -LiteralPath $evidence.Manifest -Raw | ConvertFrom-Json
  foreach ($entry in $manifest.archives) {
    $filename = [string]$entry.filename
    $digest = ([string]$entry.sha256).ToLowerInvariant()
    if ($digest -notmatch '^[0-9a-f]{64}$') {
      throw "Invalid manifest digest for ${filename} in $($evidence.Manifest)."
    }
    if ($manifestDigests.ContainsKey($filename) -and $manifestDigests[$filename] -ne $digest) {
      throw "Conflicting manifest evidence for ${filename}."
    }
    $manifestDigests[$filename] = $digest
  }
}

foreach ($name in $expected) {
  if (-not $expectedDigests.ContainsKey($name)) {
    throw "No committed checksum evidence for ${name}."
  }
  if (-not $manifestDigests.ContainsKey($name)) {
    throw "No committed manifest digest for ${name}."
  }
  if ($expectedDigests[$name] -ne $manifestDigests[$name]) {
    throw "Checksum and manifest digests disagree for ${name}."
  }
}

$tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
foreach ($name in $expected) {
  $archive = Join-Path $releaseRoot $name
  if (-not (Test-Path -LiteralPath $archive -PathType Leaf)) { throw "Missing release archive: $name" }
  $actualDigest = (Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($actualDigest -ne $expectedDigests[$name]) {
    throw "Release digest mismatch for ${name}: expected $($expectedDigests[$name]), actual ${actualDigest}."
  }
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
    Write-Output "PASS $name files=$($files.Count) sha256=${actualDigest}"
  } finally {
    $resolvedExtract = [System.IO.Path]::GetFullPath($extract)
    if ($resolvedExtract.StartsWith($tempRoot, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedExtract)) {
      Remove-Item -LiteralPath $resolvedExtract -Recurse -Force
    }
  }
}
