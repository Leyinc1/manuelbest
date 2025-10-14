#!/bin/bash
# Script para desplegar la aplicación Manuel Best desde GitHub

# Navegar al directorio del proyecto
cd /home/manuel/Manuel.Best/manuel-best-vue || exit

# Redirigir toda la salida a un archivo de log para poder depurar
exec >> /home/manuel/Manuel.Best/manuel-best-vue/deployment.log 2>&1

echo "----------------------------------------"
echo "Iniciando despliegue: $(date)"
echo "----------------------------------------"

# Solucionar problema de permisos de Git
echo "Ejecutando chown para solucionar problema de permisos de Git. Puede que se te pida la contraseña de sudo."
sudo chown -R manuel:manuel .git

# Descargar los últimos cambios de GitHub
git pull origin master

# Configurar nvm y usar la versión de Node.js correcta
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm install 20.19.0
nvm use 20.19.0

# Instalar dependencias de Node.js
echo "Instalando dependencias de npm..."
npm install

# Compilar el frontend de Vue
echo "Compilando el frontend..."
npm run build

# Desplegar los archivos compilados
echo "Copiando archivos del frontend..."
sudo /bin/cp -rf dist/* /var/www/manuel.best/

echo "Publicando la API de .NET..."
sudo /usr/bin/dotnet publish api/ManuelBestApi.csproj --configuration Release -o /var/www/manuel.best/backend

echo "----------------------------------------"
echo "Despliegue finalizado: $(date)"
echo ""
