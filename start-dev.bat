@echo off
setlocal

REM Resolve project root (folder containing this script)
set "ROOT=%~dp0"

REM Default mode: fast (skip reinstall when possible)
set "MODE=fast"
if /I "%~1"=="--full" set "MODE=full"
if /I "%~1"=="full" set "MODE=full"

echo Launch mode: %MODE%
echo.

where python >nul 2>nul
if errorlevel 1 (
	echo [ERROR] python command not found.
	echo Install Python 3.11+ and enable "Add python.exe to PATH".
	echo Then run this script again.
	echo.
	pause
	endlocal
	exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
	echo [WARN] npm command not found. Trying automatic Node.js LTS install...
	where winget >nul 2>nul
	if errorlevel 1 (
		echo [WARN] winget is not available. Frontend will be skipped.
		echo Install Node.js LTS manually, then run this script again.
		echo Download: https://nodejs.org/
		echo.
		set "SKIP_FRONTEND=1"
	) else (
		winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements

		REM Make common Node install paths available in current cmd session
		if exist "%ProgramFiles%\nodejs" set "PATH=%ProgramFiles%\nodejs;%PATH%"
		if exist "%AppData%\npm" set "PATH=%AppData%\npm;%PATH%"

		where npm >nul 2>nul
		if errorlevel 1 (
			echo [WARN] Node install attempted but npm is still unavailable in this session.
			echo Please close and reopen terminal/VS Code, then run start-dev.bat again.
			echo.
			set "SKIP_FRONTEND=1"
		) else (
			echo [OK] npm detected after automatic install.
			echo.
			set "SKIP_FRONTEND=0"
		)
	)
) else (
	set "SKIP_FRONTEND=0"
)

echo [1/2] Starting backend on http://localhost:8000 ...
if /I "%MODE%"=="full" (
	start "Vibecoding Backend" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%ROOT%backend'; if (-not (Test-Path .venv)) { python -m venv .venv }; .\.venv\Scripts\python.exe -m pip install -r requirements.txt; .\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
) else (
	start "Vibecoding Backend" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%ROOT%backend'; if (-not (Test-Path .venv)) { python -m venv .venv }; .\.venv\Scripts\python.exe -c 'import uvicorn, fastapi' 2>$null; if ($LASTEXITCODE -ne 0) { .\.venv\Scripts\python.exe -m pip install -r requirements.txt }; .\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"
)

if "%SKIP_FRONTEND%"=="0" (
	echo [2/2] Starting frontend on http://localhost:5173 ...
	if /I "%MODE%"=="full" (
	    start "Vibecoding Frontend" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%ROOT%frontend'; npm.cmd install; npm.cmd run dev"
	) else (
	    start "Vibecoding Frontend" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%ROOT%frontend'; if (-not (Test-Path node_modules)) { npm.cmd install }; npm.cmd run dev"
	)
) else (
	echo [2/2] Frontend skipped ^(npm not found^).
)

echo.
echo Dev servers are launching in separate windows.
echo - Backend : http://localhost:8000
if "%SKIP_FRONTEND%"=="0" (
	echo - Frontend: http://localhost:5173
) else (
	echo - Frontend: not started
)
echo.
echo Usage:
echo - Fast mode (default): start-dev.bat
echo - Full reinstall mode : start-dev.bat --full
echo.
echo Waiting for service readiness and opening browser...
if "%SKIP_FRONTEND%"=="0" (
	powershell -ExecutionPolicy Bypass -Command "$ErrorActionPreference='SilentlyContinue'; $ready=$false; for($i=0; $i -lt 90; $i++){ try { Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing | Out-Null; $ready=$true; break } catch {}; Start-Sleep -Seconds 1 }; if($ready){ Start-Process 'http://localhost:5173' } else { Start-Process 'http://localhost:8000/docs' }"
) else (
	powershell -ExecutionPolicy Bypass -Command "$ErrorActionPreference='SilentlyContinue'; $ready=$false; for($i=0; $i -lt 60; $i++){ try { Invoke-WebRequest -Uri 'http://localhost:8000/docs' -UseBasicParsing | Out-Null; $ready=$true; break } catch {}; Start-Sleep -Seconds 1 }; Start-Process 'http://localhost:8000/docs'"
)
echo.
echo Close each PowerShell window to stop its server.

endlocal