@echo off
:: Dorker Verify — Uninstaller
echo Uninstalling Dorker Verify...
set "INSTALL_DIR=%LOCALAPPDATA%\DorkerVerify"
set "REG_KEY=HKCU\Software\Google\Chrome\NativeMessagingHosts\com.dorker.verifier"
reg delete "%REG_KEY%" /f >nul 2>&1
rmdir /S /Q "%INSTALL_DIR%" >nul 2>&1
echo Done. Dorker Verify has been removed.
pause
