#!/bin/bash
set -e

echo "--- (sudo) Copying frontend files... ---"
/bin/cp -rf /home/manuel/Manuel.Best/manuel-best-vue/dist/* /var/www/manuel.best/

echo "--- (sudo) Publishing .NET API... ---"
/usr/bin/dotnet publish /home/manuel/Manuel.Best/manuel-best-vue/api/ManuelBestApi.csproj --configuration Release -o /var/www/manuel.best/backend

echo "--- (sudo) Final steps completed successfully! ---"
