@echo off
echo Ozodbek Santehnika tizimi ishga tushmoqda...
echo.

echo 1. Kutubxonalar ornatilmoqda (npm install)...
call npm install
if %errorlevel% neq 0 (
    echo Xatolik: npm ornatilmagan yoki internetda muammo bor.
    echo Node.js ornatilganligini tekshiring.
    pause
    exit /b
)

echo.
echo 2. Dastur ishga tushirilmoqda...
echo Brauzerda ochish uchun quyidagi manzilga kiring (odatda http://localhost:5173).
echo Dasturni toxtatish uchun bu oynani yoping yoki Ctrl+C bosing.
echo.

call npm run dev
pause
