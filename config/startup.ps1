# Script de inicialização para JumboIA no Windows
# Para executar: .\config\startup.ps1

Write-Host "JumboIA - Script de Inicialização" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Definir o diretório de trabalho para a raiz do projeto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath
Set-Location $projectRoot

# Executar o script de limpeza primeiro
$cleanupScript = Join-Path $scriptPath "cleanup.ps1"
if (Test-Path $cleanupScript) {
    Write-Host "Executando limpeza de processos..." -ForegroundColor Yellow
    & $cleanupScript
    Write-Host "Limpeza concluída." -ForegroundColor Green
} else {
    Write-Host "Script de limpeza não encontrado: $cleanupScript" -ForegroundColor Red
}

# Verificar se o arquivo env.backend.js existe nas localizações esperadas
$configFile1 = Join-Path $projectRoot "config\env.backend.js"
$configFile2 = Join-Path $projectRoot "backend\env.backend.js"

Write-Host "Verificando arquivos de configuração..." -ForegroundColor Yellow
if (Test-Path $configFile1) {
    Write-Host "✅ Arquivo de configuração encontrado em: $configFile1" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo de configuração NÃO encontrado em: $configFile1" -ForegroundColor Red
}

if (Test-Path $configFile2) {
    Write-Host "✅ Arquivo de configuração encontrado em: $configFile2" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo de configuração NÃO encontrado em: $configFile2" -ForegroundColor Red
}

# Copiar o arquivo de configuração para backend, se necessário
if ((Test-Path $configFile1) -and (-not (Test-Path $configFile2))) {
    Write-Host "Copiando arquivo de configuração para pasta backend..." -ForegroundColor Yellow
    Copy-Item -Path $configFile1 -Destination $configFile2
    Write-Host "Arquivo copiado com sucesso." -ForegroundColor Green
}

# Iniciar a aplicação
Write-Host "`nIniciando a aplicação JumboIA..." -ForegroundColor Yellow

# Abrir duas janelas PowerShell, uma para o backend e outra para o frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot'; Write-Host 'Iniciando Backend na porta 3001...' -ForegroundColor Green; npm run dev:backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$projectRoot'; Write-Host 'Iniciando Frontend na porta 5173...' -ForegroundColor Green; npm run dev:frontend"

Write-Host "`nAplicação iniciada em janelas separadas!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "`nPressione qualquer tecla para encerrar este script..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 