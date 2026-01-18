@echo off
echo Githubga yuklanmoqda...
echo.

git init
git add .
git commit -m "Birinchi yuklash"
git branch -M main
git remote add origin https://github.com/orifxonmarufxonov24-boop/do-kon.git
git push -u origin main

echo.
echo Agar xatolik chiqsa, Github akkauntingizga kirishingiz soralishi mumkin.
pause
