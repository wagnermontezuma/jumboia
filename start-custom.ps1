Write-Host "JumboIA - Script de Inicialização Personalizado" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Limpar processos existentes
Write-Host "Matando todos os processos node.exe..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null

# Verificar portas
Write-Host "Verificando portas em uso..." -ForegroundColor Yellow
$ports = @(3001, 5173, 5174, 5175)
foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($process) {
        Write-Host "Porta $port em uso pelo processo $process, tentando encerrar..." -ForegroundColor Red
        Stop-Process -Id $process -Force -ErrorAction SilentlyContinue
    }
}

# Aguardar um momento para garantir que as portas sejam liberadas
Start-Sleep -Seconds 2

# Iniciar o backend
Write-Host "Iniciando o backend na porta 3001..." -ForegroundColor Cyan
$backendProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command cd '$PSScriptRoot\backend'; npx ts-node '.\src\server.ts'" -PassThru -WindowStyle Normal

# Aguardar um momento para o backend iniciar
Start-Sleep -Seconds 3

# Iniciar o frontend
Write-Host "Iniciando o frontend na porta 5175..." -ForegroundColor Cyan
$frontendProcess = Start-Process -FilePath "powershell" -ArgumentList "-Command cd '$PSScriptRoot'; npx vite --port 5175 --host" -PassThru -WindowStyle Normal

Write-Host "Aplicação iniciada em janelas separadas!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5175" -ForegroundColor Green
Write-Host "Backend: http://localhost:3001" -ForegroundColor Green
Write-Host "Pressione qualquer tecla para encerrar este script (as janelas dos servidores continuarão rodando)..." -ForegroundColor Yellow

$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 