@echo off
echo Xatoliklar togirlanmoqda...
echo.

:: 1. Ism va Emailni avtomatik sozlash (Admin sifatida)
git config --global user.email "admin@ozodbek.uz"
git config --global user.name "Ozodbek Admin"

:: 2. Noto'g'ri keshni tozalash (node_modules ni chiqarib tashlash uchun)
echo Fayllar qayta saralanmoqda...
git rm -r --cached . > nul 2>&1

:: 3. To'g'ri yuklash
git add .
git commit -m "Fixed upload"

:: 4. Githubga yuborish
git branch -M main
git remote remove origin > nul 2>&1
git remote add origin https://github.com/orifxonmarufxonov24-boop/do-kon.git
git push -u origin main --force

echo.
echo Tayyor! Agar login sorasa, kiriting.
pause
