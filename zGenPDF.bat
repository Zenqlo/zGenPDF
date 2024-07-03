@echo off

set "mongoosePath=.\src\zserver.exe"
set "directoryToServe=./src/"



start "" /B "%mongoosePath%" -l "http://0.0.0.0:38000" -d "%directoryToServe%"


timeout /t 1 >nul


start "" http://localhost:38000


echo Server started at http://localhost:38000


pause