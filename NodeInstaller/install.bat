@echo off
where node.exe >nul 2>nul
if %errorlevel%==1 (
    echo "Node.exe not found, opening your browser..."
    start "" "https://nodejs.org/dist/latest/win-x86/node.exe"
    pause
) else (
	cmd /k node.exe index.js
)
exit