@echo off
chcp 65001 >nul
title Netzilon Ultra bauen
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo [FEHLER] Node.js fehlt. Bitte LTS installieren: https://nodejs.org
  start https://nodejs.org
  pause & exit /b 1
)
echo [1/3] Pakete installieren...
call npm install || (echo [FEHLER] npm install & pause & exit /b 1)
echo [2/3] Netzilon Ultra (portable .exe) bauen...
call npm run build || (echo [FEHLER] Build & pause & exit /b 1)
echo [3/3] iPhone-/Browser-Version bauen (eine HTML-Datei)...
call npm run build:html || (echo [FEHLER] HTML-Build & pause & exit /b 1)
echo.
echo Fertig:
echo   dist\*.exe          (Windows, portable)
echo   ..\dist\Netzilon-Ultra.html    (iPhone/Browser, offline)
echo Tipp: Ist die HTML zu gross, "npm run build:html:split" erzeugt je Bereich eine eigene Datei.
explorer dist
pause
