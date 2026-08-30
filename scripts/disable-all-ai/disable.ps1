[CmdletBinding()]
param(
  [string]$EnvFile = ".env.local"
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$target = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $EnvFile))
if (-not $target.StartsWith($repoRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "EnvFile must resolve inside the repository."
}

$flags = @(
  "ENABLE_AI_NARRATIVE",
  "ENABLE_LOCAL_LLM",
  "ENABLE_HUGGINGFACE_PROVIDER",
  "ENABLE_OPENAI_PROVIDER",
  "ENABLE_AGENT_RUNTIME",
  "ENABLE_HEALTH_MCP",
  "ENABLE_CHATGPT_APP",
  "ENABLE_CODEX_MCP",
  "ENABLE_CHATGPT_WIDGET",
  "ENABLE_FUTURE_AGENT_WRITES",
  "ENABLE_PUBLIC_MCP",
  "ENABLE_RAW_HEALTH_TO_AI",
  "ENABLE_NOTES_TO_AI",
  "ENABLE_GPS_TO_AI"
)
$lines = if (Test-Path -LiteralPath $target) { [System.Collections.Generic.List[string]](Get-Content -LiteralPath $target) } else { [System.Collections.Generic.List[string]]::new() }
foreach ($flag in $flags) {
  $replacement = "$flag=false"
  $index = -1
  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "^$([regex]::Escape($flag))=") { $index = $i; break }
  }
  if ($index -ge 0) { $lines[$index] = $replacement } else { $lines.Add($replacement) }
}
[System.IO.Directory]::CreateDirectory([System.IO.Path]::GetDirectoryName($target)) | Out-Null
[System.IO.File]::WriteAllLines($target, $lines, [System.Text.UTF8Encoding]::new($false))
Write-Output "AI, MCP, ChatGPT, and external-provider flags are disabled in $target"
