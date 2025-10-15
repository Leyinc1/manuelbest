#!/bin/bash
set -e

echo "--- (sudo) Ensuring destination directory exists... ---"
mkdir -p /var/www/manuel.best/html

echo "--- (sudo) Copying frontend files to correct path... ---"
/bin/cp -rf /home/manuel/Manuel.Best/manuel-best-vue/dist/* /var/www/manuel.best/html/

echo "--- (sudo) Publishing .NET API... ---"
/usr/bin/dotnet publish /home/manuel/Manuel.Best/manuel-best-vue/api/ManuelBestApi.csproj --configuration Release -o /var/www/manuel.best/backend

echo "--- (sudo) Restarting backend service... ---"
/bin/systemctl restart manuelbest-api.service

echo "--- (sudo) Final steps completed successfully! ---"