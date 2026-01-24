# ============================================================
# Script PowerShell para crear tarea programada
# Ejecutar como Administrador
# ============================================================

$TaskName = "LiriosEventos_Notificaciones"
$TaskDescription = "Procesa notificaciones pendientes y reintentos de WhatsApp cada 5 minutos"
$ScriptPath = "C:\Users\User\Documents\EvolucionLiriosEventos\utilidades\ejecutar_notificaciones.bat"

# Verificar si ya existe la tarea
$ExistingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

if ($ExistingTask) {
    Write-Host "La tarea '$TaskName' ya existe. Eliminando para recrear..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Crear la acción (ejecutar el script batch)
$Action = New-ScheduledTaskAction -Execute $ScriptPath

# Crear el trigger (cada 5 minutos)
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 9999)

# Configuración de la tarea
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Crear la tarea (ejecutar con el usuario actual)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

# Registrar la tarea
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Description $TaskDescription

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host " Tarea programada creada exitosamente!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host " Nombre: $TaskName"
Write-Host " Frecuencia: Cada 5 minutos"
Write-Host " Script: $ScriptPath"
Write-Host ""
Write-Host " Para verificar: Get-ScheduledTask -TaskName '$TaskName'"
Write-Host " Para ejecutar ahora: Start-ScheduledTask -TaskName '$TaskName'"
Write-Host " Para eliminar: Unregister-ScheduledTask -TaskName '$TaskName'"
Write-Host ""
