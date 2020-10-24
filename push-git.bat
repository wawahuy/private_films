@REM @echo off
set /p id="commit message: "
git add *
git commit -m "%id%"
git push origin main
git subtree push --prefix server_proxy origin server_proxy
set /p e="[enter] exit"