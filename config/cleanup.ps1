# Script de limpeza de processos para JumboIA no Windows
# Para executar: .\config\cleanup.ps1

Write-Host "JumboIA - Script de Limpeza de Processos" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Função para verificar e encerrar processos em uma porta específica
function Clear-Port {
    param (
        [int]$PortNumber
    )
    
    Write-Host "Verificando processos na porta $PortNumber..." -ForegroundColor Yellow
    
    $processes = netstat -ano | Select-String -Pattern ":$PortNumber\s+" | ForEach-Object { $_ -match '\s+(\d+)$' > $null; $matches[1] }
    $processes = $processes | Sort-Object -Unique
    
    if ($processes.Count -eq 0) {
        Write-Host "✅ Nenhum processo usando a porta $PortNumber" -ForegroundColor Green
        return
    }
    
    foreach ($processId in $processes) {
        try {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "Processo encontrado: $($process.Name) (PID: $processId)" -ForegroundColor Yellow
                Write-Host "Tentando encerrar o processo..." -ForegroundColor Yellow
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                
                # Verificar se o processo foi encerrado
                if (Get-Process -Id $processId -ErrorAction SilentlyContinue) {
                    Write-Host "❌ Falha ao encerrar o processo" -ForegroundColor Red
                } else {
                    Write-Host "✅ Processo finalizado com sucesso!" -ForegroundColor Green
                }
            }
        } catch {
            Write-Host "❌ Erro ao encerrar o processo: $_" -ForegroundColor Red
        }
    }
}

# Limpar portas utilizadas pelo JumboIA
Clear-Port -PortNumber 3000
Clear-Port -PortNumber 3001
Clear-Port -PortNumber 5173
Clear-Port -PortNumber 5174

Write-Host "`nLimpeza de processos concluída!" -ForegroundColor Green
Write-Host "Agora você pode iniciar a aplicação usando: .\config\startup.ps1" -ForegroundColor Yellow 