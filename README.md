# Ozodbek Santehnika - Omborni Boshqarish Tizimi

Ozodbek Santehnika do'koni uchun maxsus ishlab chiqilgan, zamonaviy "Dark Mode" dizayndagi omborni boshqarish tizimi.

## Texnologiyalar
- **Frontend**: React + Vite
- **Dizayn**: Tailwind CSS + Framer Motion (Glassmorphism & Neon effektlari)
- **Backend / Baza**: Firebase (Auth, Firestore, Storage)

## 🚀 Ishga Tushirish

### 1. Kutubxonalarni o'rnatish
Kompyuteringizda Node.js o'rnatilgan bo'lishi kerak.
Terminalni ushbu papkada oching va quyidagi buyruqni bering:

```bash
npm install
```

### 2. Firebase-ni Sozlash
1. [Firebase Console](https://console.firebase.google.com/) ga kiring.
2. Yangi loyiha yarating.
3. **Authentication** (Email/Password) ni yoqing.
4. **Firestore Database** ni yarating (boshlanishiga **Test Mode** da).
5. **Storage** ni yoqing (rasmlar uchun).
6. **Project Settings** > **General** > **Your apps** > **Web** (</>) bo'limiga o'ting va `firebaseConfig` kodlarini nusxalang.
7. `src/firebase.js` faylini oching va u yerdagi kodlarni o'zingizniki bilan almashtiring.

### 3. Dasturni ishga tushirish
```bash
npm run dev
```
Terminalda chiqqan havolani oching (odatda `http://localhost:5173`).

## 🔐 Admin Kirish
1. Dasturga birinchi marta kirganda `/login` sahifasiga o'ting.
2. Ro'yxatdan o'tish sahifasi yo'qligi sababli (xavfsizlik uchun), Firebase Console orqali Authentication bo'limida qo'lda (Add user) admin yarating.
3. Yoki vaqtincha `Login.jsx` faylida `register` funksiyasini yoqib, birinchi adminni yaratib olishingiz mumkin.

## Imkoniyatlar
- **Mijozlar uchun katalog**: QR kod orqali kirish mumkin. Faqat ko'rish rejimi.
- **Admin Panel**: Xavfsiz kirish, mahsulotlarni qo'shish/tahrirlash/o'chirish.
- **Jonli Ombor**: Ma'lumotlar real vaqt rejimida yangilanadi (Firestore).
