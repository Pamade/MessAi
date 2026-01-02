@echo off
REM Production Build Script for Messenger AI Assistant (Windows)

echo Building Messenger AI Assistant for Production...

REM Clean previous build
echo Cleaning previous build...
if exist dist rmdir /s /q dist

REM Build the extension
echo Building extension...
call npm run build

REM Check if build was successful
if not exist dist (
    echo Build failed! dist folder not created.
    exit /b 1
)

REM Copy icons
echo Copying icons...
if exist public\icon16.png (
    copy public\icon16.png dist\
    copy public\icon48.png dist\
    copy public\icon128.png dist\
    echo Icons copied
) else (
    echo Warning: Icons not found in public\ folder
    echo Please create icon16.png, icon48.png, and icon128.png
)

REM Copy manifest
echo Copying manifest...
copy manifest.json dist\

REM Create zip (requires PowerShell)
echo Creating zip file...
powershell Compress-Archive -Path dist\* -DestinationPath messenger-ai-assistant-v1.0.0.zip -Force

echo Build complete!
echo.
echo Package created: messenger-ai-assistant-v1.0.0.zip
echo.
echo Next steps:
echo 1. Test the extension by loading dist\ folder in Chrome
echo 2. Upload messenger-ai-assistant-v1.0.0.zip to Chrome Web Store
echo.
echo Ready for deployment!
pause
