# mark-start.ps1
# Registra o timestamp de início de um prompt do Gemini CLI
# Salva em um arquivo temporário vinculado ao session_id

$inputRaw = $input | Out-String
if (-not $inputRaw) { exit }

try {
    $inputJson = $inputRaw | ConvertFrom-Json
    $sessionId = $inputJson.session_id

    if ($sessionId) {
        $tempFile = Join-Path $env:TEMP "gemini-start-$sessionId.txt"
        $startTime = [double](Get-Date -UFormat %s)
        $startTime | Out-File -FilePath $tempFile -Encoding utf8
    }
} catch {
    # Falha silenciosa para não interromper o CLI
}
