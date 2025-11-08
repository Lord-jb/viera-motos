@echo off
echo ===========================================================
echo      🚀 PUBLICADOR AUTOMÁTICO - AVELLOZ MOTOS SITE
echo ===========================================================

:: Configurar usuário Git (somente se ainda não estiver configurado)
git config --global user.name "Senhor-jb"
git config --global user.email "bjeslee19@gmail.com"

:: Inicializa repositório (caso não exista)
if not exist ".git" (
    echo 🧱 Inicializando repositório Git...
    git init
    git branch -M main
)

:: Adiciona todos os arquivos
echo 📦 Adicionando arquivos...
git add .

:: Cria commit com data atual
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
    set today=%%a-%%b-%%c
)
git commit -m "Atualização automática %date% %time%"

:: Adiciona repositório remoto (só se ainda não existir)
git remote -v | find "origin" >nul
if %errorlevel% neq 0 (
    echo 🔗 Conectando ao repositório remoto...
    git remote add origin https://github.com/Senhor-jb/avelloz-motos-site.git
)

:: Faz push para o GitHub
echo 🚀 Enviando arquivos para o GitHub...
git push -u origin main

echo ===========================================================
echo ✅ SITE ENVIADO COM SUCESSO!
echo Acesse: https://github.com/Senhor-jb/avelloz-motos-site
echo ===========================================================
pause
