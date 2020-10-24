@REM @echo off
set /p id="commit message: "
git add *
git commit -m "%id%"
git push origin main
git subtree push --prefix server_proxy origin server_proxy
git subtree push --prefix feuser origin feuser
set /p e="[enter] exit"