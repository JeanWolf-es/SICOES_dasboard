@echo off
setlocal
cd /d "%~dp0"
title Monitor SICOES Bolivia - Servidor Local

echo Iniciando Monitor SICOES Bolivia...

where py >nul 2>nul
if %errorlevel%==0 (
    py -3 "%~dp0iniciar_app.py"
    goto :end
)

where python >nul 2>nul
if %errorlevel%==0 (
    python "%~dp0iniciar_app.py"
    goto :end
)

where npx >nul 2>nul
if %errorlevel%==0 (
    echo Python no encontrado. Iniciando con npx serve...
    start "" "http://localhost:3000/index.html"
    npx --yes serve -l 3000 "%~dp0"
    goto :end
)

echo [ERROR] No se encontro Python ni Node.js (npx) en el sistema.
echo Instala Python 3 desde https://www.python.org/downloads/ para ejecutar el servidor local.
pause

:end
endlocal
