@echo off
:: Dorker Verify — Native Messaging Installer for Windows
:: Installs dorker_verify.exe and registers it with Chrome

echo ================================================
echo   Dorker Verify — Email Verification Engine
echo   Version 1.0.0
echo ================================================
echo.

:: Set paths
set "INSTALL_DIR=%LOCALAPPDATA%\DorkerVerify"
set "EXE_NAME=dorker_verify.exe"
set "MANIFEST_NAME=com.dorker.verifier.json"
set "REG_KEY=HKCU\Software\Google\Chrome\NativeMessagingHosts\com.dorker.verifier"

:: Create install directory
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Copy executable
echo [1/4] Installing dorker_verify.exe...
copy /Y "%~dp0target\release\%EXE_NAME%" "%INSTALL_DIR%\%EXE_NAME%" >nul 2>&1
if errorlevel 1 (
    copy /Y "%~dp0%EXE_NAME%" "%INSTALL_DIR%\%EXE_NAME%" >nul 2>&1
    if errorlevel 1 (
        echo ERROR: dorker_verify.exe not found!
        echo       File must be in this folder or in target\release\ folder
        pause
        exit /b 1
    )
)
echo       OK: %INSTALL_DIR%\%EXE_NAME%

:: Get Extension ID from user
echo.
echo [2/4] Chrome Extension ID required:
echo.
echo   1. Open chrome://extensions in Chrome
echo   2. Find "Google Dorker PRO"
echo   3. Copy the ID (e.g.: abcdefghijk...)
echo.
set /p EXT_ID="   Enter Extension ID: "

if "%EXT_ID%"=="" (
    echo   No ID entered - using universal mode
    set "ORIGIN=chrome-extension://*/"
) else (
    echo       OK: %EXT_ID%
    set "ORIGIN=chrome-extension://%EXT_ID%/"
)

:: Create native messaging manifest
echo [3/4] Creating native messaging manifest...
set "ESCAPED_PATH=%INSTALL_DIR:\=\\%\\%EXE_NAME%"
(
    echo {
    echo   "name": "com.dorker.verifier",
    echo   "description": "Dorker PRO Email Verification Engine",
    echo   "path": "%ESCAPED_PATH%",
    echo   "type": "stdio",
    echo   "allowed_origins": [
    echo     "%ORIGIN%"
    echo   ]
    echo }
) > "%INSTALL_DIR%\%MANIFEST_NAME%"
echo       OK: %INSTALL_DIR%\%MANIFEST_NAME%

:: Register in Windows Registry
echo [4/4] Registering with Chrome...
reg add "%REG_KEY%" /ve /t REG_SZ /d "%INSTALL_DIR%\%MANIFEST_NAME%" /f >nul 2>&1
if errorlevel 1 (
    echo ERROR: Failed to write to Registry.
    pause
    exit /b 1
)
echo       OK: Registry key created

echo.
echo ================================================
echo   Installation completed successfully!
echo.
echo   Next steps:
echo   1. Restart Chrome (close and reopen)
echo   2. Open Dorker PRO extension
echo   3. Green status bar will appear:
echo      "SMTP Verifier Active - 99%% accuracy"
echo ================================================
echo.
pause
