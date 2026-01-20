# 🛁 Ozodbek Santehnika - Zamonaviy E-Commerce Tizimi

Ushbu loyiha **Ozodbek Santehnika** do'koni uchun maxsus ishlab chiqilgan bo'lib, u nafaqat onlayn katalog, balki to'liq **omborni boshqarish (CRM/ERP)**, **sotuvlar statistikasi** va **sun'iy intellekt (AI) maslahatchisi** vazifasini ham bajaradi.

---

## 🔥 Asosiy Imkoniyatlar

### 🛒 Mijozlar Tomoni (Frontend)
- **Zamonaviy Dizayn:** Glassmorphism uslubidagi hashamatli interfeys.
- **Dark / Light Mode:** Tungi va kunduzgi rejim (Admin tomonidan boshqarilishi ham mumkin).
- **Aqlli Qidiruv:** Nomi, rangi, o'lchami yoki kategoriyasi bo'yicha global qidiruv.
- **Jonli Chat:** Admin bilan to'g'ridan-to'g'ri bog'lanish (Telegram uslubida).
- **Fikr va Sharhlar:** Mahsulotlarga izoh qoldirish va yulduzcha (rating) qo'yish.

### 🔐 Admin Panel (Boshqaruv)
- **Umumiy Statistika:**
  - 📊 Haftalik sotuvlar grafigi.
  - 🏆 Eng ko'p sotilgan mahsulotlar (Top 5).
  - 📈 Kategoriyalar ulushi (Pie Chart).
- **AI Maslahatchisi (Sun'iy Ong):**
  - 🤖 Omborda kam qolgan tovarlar haqida ogohlantirish.
  - 📉 "O'lik" (sotilmayotgan) tovarlarni aniqlash.
  - 🚀 Trenddagi kategoriyalarni tavsiya qilish.
- **Sotuv Tizimi:** "Sotish" tugmasi orqali omborni avtomatik kamaytirish va hisobotga yozish.
- **Chat Markazi:** Barcha mijozlar bilan yozishmalarni bir joydan boshqarish.
- **Sozlamalar:** Do'kon manzili, telefon raqami, xarita lokatsiyasi va sayt mavzusini (Theme) o'zgartirish.

---

## 🛠 Texnologiyalar
- **Frontend:** React.js + Vite
- **Styling:** Tailwind CSS + Framer Motion (Animatsiyalar)
- **Charts:** Recharts (Grafikalar uchun)
- **Backend:** Google Firebase (Auth, Firestore, Storage)

---

## 🚀 Ishga Tushirish (Qo'llanma)

### 1. Loyihani yuklab olish va o'rnatish
```bash
# Kerakli kutubxonalarni o'rnating
npm install
```

### 2. Dasturni ishga tushirish
```bash
npm run dev
```
Sayt `http://localhost:5173` manzilida ochiladi.

---

## ⚙️ Firebase Sozlamalari (Muhim!)

Loyiha to'g'ri ishlashi uchun **Firestore Database Rules** quyidagicha bo'lishi shart. Buni [Firebase Console](https://console.firebase.google.com) -> **Firestore Database** -> **Rules** bo'limiga nusxalab qo'ying:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // --- SETTINGS (Sozlamalar) ---
    match /settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // --- PRODUCTS (Mahsulotlar) ---
    match /products/{productId} {
      allow read: if true;
      allow write, update: if request.auth != null;
    }
    
    // --- SALES (Sotuvlar Statistikasi) ---
    match /sales/{saleId} {
      allow read, write: if request.auth != null;
    }

    // --- CHATS (Yozishmalar) ---
    match /chats/{chatId} {
      allow create: if true;
      allow read, write: if true; // Xavfsizlikni oshirish uchun keyinchalik o'zgartirish mumkin
      
      match /messages/{msgId} {
        allow read, write: if true;
      }
    }
    
    // --- REVIEWS (Sharhlar) ---
    match /reviews/{revId} {
      allow create: if true;
      allow read: if true;
      allow update, delete: if request.auth != null;
    }
  }
}
```

---

## 📱 Admin Panelga Kirish

1. Saytga kiring va URL oxiriga `/login` qo'shing (masalan: `ozodbek-shop.vercel.app/login`).
2. Email va Parol orqali kiring.
   - *Eslatma: Admin yaratish uchun Firebase Console -> Authentication bo'limidan "Add User" tugmasini bosing.*

---

## 🤝 Mualliflik
Ushbu tizim **[Orifxon Marufxonov]** buyurtmasi asosida maxsus tayyorlandi.
Barcha huquqlar himoyalangan © 2026.
