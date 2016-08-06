@ECHO off

:prompt
set /P c=Are you sure you want to uninstall BetterDiscord [Y/N]? 
echo.
if /I "%c%" EQU "Y" goto :removeBetterDiscord
if /I "%c%" EQU "N" goto :eof
goto :prompt

:removeBetterDiscord
echo Removing BetterDiscord...
echo.

:: Delete %appdata%\BetterDiscord
call:deleteFolder %appdata%\BetterDiscord

:: Remove BetterDiscord from all app versions
for /d %%G in ("%localappdata%\Discord\app-*") do (
    call:deleteFolder "%%G\resources\node_modules\BetterDiscord"
    call:deleteFolder "%%G\resources\app"
    SET latestDiscordVersion=%%G
)

goto:end

:: Checks whether a folder exists and deletes it if it does
:deleteFolder
if exist "%~1" (
    @RD /S /Q "%~1"
    echo Folder "%~1" removed.
) else (
    echo Folder "%~1" does not exist.
)
goto:eof

:end
echo.
echo Restarting Discord...
taskkill /f /im Discord.exe 1>nul 2>nul
"%localappdata%\Discord\Update.exe" --processStart Discord.exe

echo.
echo BetterDiscord has been removed!
echo.

pause