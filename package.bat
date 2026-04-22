@echo off
setlocal

set EXT_NAME=ssl-setup-helper
set VERSION=1.4.0
set OUTPUT=%EXT_NAME%-%VERSION%.zip

if exist "%OUTPUT%" del "%OUTPUT%"

powershell -Command ^
  "Add-Type -AssemblyName System.IO.Compression.FileSystem;" ^
  "$zip = [System.IO.Compression.ZipFile]::Open('%OUTPUT%', 'Create');" ^
  "$files = @(" ^
    "'manifest.json'," ^
    "'popup.html'," ^
    "'settings.html'," ^
    "'settings.js'," ^
    "'popup.js'," ^
    "'styles.css'," ^
    "'images\icon-16.png'," ^
    "'images\icon-48.png'," ^
    "'images\icon-128.png'," ^
    "'js\constants.js'," ^
    "'js\qrcode.min.js'," ^
    "'js\qrGenerator.js'," ^
    "'js\stations.js'," ^
    "'js\storage.js'," ^
    "'js\utils.js'," ^
    "'js\workCenter.js'" ^
  ");" ^
  "foreach ($f in $files) {" ^
    "$entry = $f -replace '\\','/';" ^
    "[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $f, $entry) | Out-Null;" ^
  "}" ^
  "$zip.Dispose();" ^
  "Write-Host 'Done'"

echo.
echo ========================================
echo  Package created: %OUTPUT%
echo ========================================
echo.
echo Upload this file to:
echo   Chrome: https://chrome.google.com/webstore/devconsole
echo   Edge:   https://partner.microsoft.com/en-us/dashboard/microsoftedge
echo.
echo Set visibility to UNLISTED (Chrome) or PRIVATE (Edge) during submission.
echo.
