@echo off
REM Build script for Copy Rich URL Chrome Extension
REM Creates a zip file suitable for uploading to Chrome Web Store

echo Building Copy Rich URL extension...

REM Get version from manifest.json
for /f "tokens=2 delims=:, " %%a in ('findstr /C:"\"version\"" manifest.json') do set VERSION=%%~a

REM Create build directory if it doesn't exist
if not exist "build" mkdir build

REM Define output filename
set OUTPUT=build\CopyRichURL-v%VERSION%.zip

REM Delete old build if exists
if exist "%OUTPUT%" del "%OUTPUT%"

echo Creating %OUTPUT%...

REM Create zip with only the necessary files for Chrome Web Store
powershell -Command "Compress-Archive -Path manifest.json,LICENSE.txt,icons,src -DestinationPath '%OUTPUT%' -Force"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: Extension packaged successfully!
    echo Output: %OUTPUT%
    echo.
    echo Ready to upload to Chrome Web Store.
) else (
    echo.
    echo ERROR: Failed to create zip file
    exit /b 1
)