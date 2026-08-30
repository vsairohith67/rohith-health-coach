[CmdletBinding()]
param([string]$OutputDirectory = "release")

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$outputRoot = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $OutputDirectory))
& (Join-Path $repoRoot "scripts\create-release-zip\create.ps1") -Version rc4 -OutputDirectory $OutputDirectory

$pluginSource = Join-Path $repoRoot "plugins\rohith-health"
$pluginArchive = Join-Path $outputRoot "rohith-health-private-plugin-v1.0.0-rc4.zip"
if (Test-Path -LiteralPath $pluginArchive) { Remove-Item -LiteralPath $pluginArchive -Force }
$staging = Join-Path ([System.IO.Path]::GetTempPath()) ("rohith-health-plugin-" + [guid]::NewGuid().ToString("N"))
$payload = Join-Path $staging "rohith-health"
try {
  Copy-Item -LiteralPath $pluginSource -Destination $payload -Recurse
  Compress-Archive -LiteralPath $payload -DestinationPath $pluginArchive -CompressionLevel Optimal
  Write-Output $pluginArchive
} finally {
  $tempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
  $resolvedStaging = [System.IO.Path]::GetFullPath($staging)
  if ($resolvedStaging.StartsWith($tempRoot, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedStaging)) {
    Remove-Item -LiteralPath $resolvedStaging -Recurse -Force
  }
}
