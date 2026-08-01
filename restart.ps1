# AutoCar - Reiniciar servicios (Windows)
# Mata los puertos 4000 (backend) y 3000 (frontend) y los vuelve a lanzar.
# Uso:  powershell -ExecutionPolicy Bypass -File .\restart.ps1
#      o simplemente clic derecho -> Ejecutar con PowerShell

$ErrorActionPreference = 'Continue'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "=== AutoCar: Reiniciando servicios ===" -ForegroundColor Cyan

# 1) Matar procesos que escuchan en los puertos
foreach ($Port in 4000, 3000) {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
        foreach ($c in $conns) {
            $pidToKill = $c.OwningProcess
            Write-Host "  Matando proceso $pidToKill en puerto $Port" -ForegroundColor Yellow
            Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
        }
    } else {
        Write-Host "  Puerto $Port libre" -ForegroundColor DarkGray
    }
}

Start-Sleep -Seconds 2

# 2) Lanzar backend (puerto 4000)
Write-Host "  Lanzando backend en http://localhost:4000 ..." -ForegroundColor Green
Start-Process -FilePath "npm.cmd" -ArgumentList "run","dev" -WorkingDirectory "$Root\backend" -WindowStyle Normal

Start-Sleep -Seconds 2

# 3) Lanzar frontend (puerto 3000)
Write-Host "  Lanzando frontend en http://localhost:3000 ..." -ForegroundColor Green
Start-Process -FilePath "npm.cmd" -ArgumentList "run","dev" -WorkingDirectory "$Root\frontend" -WindowStyle Normal

Write-Host ""
Write-Host "=== Listo. Backend: http://localhost:4000 | Frontend: http://localhost:3000 ===" -ForegroundColor Cyan
Write-Host "Los logs se ven en las ventanas que se abrieron." -ForegroundColor DarkGray
