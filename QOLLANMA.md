# 📘 Ozodbek Santehnika - Tizimning To'liq Tavsifi va Qo'llanmasi

Ushbu hujjat **"Ozodbek Santehnika"** veb-sayti va uning **Admin Boshqaruv Paneli** bo'yicha to'liq qo'llanma hisoblanadi. Unda har bir funksiya qanday ishlashi va nima uchun kerakligi batafsil tushuntirilgan.

---

## 🌍 1-Qism: Sayt (Mijozlar Uchun)
Oddiy foydalanuvchilar (mijozlar) ko'radigan qism.

### 1.1. Bosh Sahifa (Header)
- **Logotip:** Sayt brendi. Unga bosilganda sahifa yangilanadi.
- **Qidiruv (Search):** Eng kuchli vosita. Mijoz istalgan narsani yozishi mumkin:
  - *Nomi bo'yicha* (masalan: "Vanna")
  - *Kategoriyasi bo'yicha* (masalan: "Unitaz")
  - *Rangi bo'yicha* (masalan: "Oq", "Qora")
  - *O'lchami bo'yicha* (masalan: "60sm")
  - *Qidiruv barcha kategoriyalar bo'ylab ishlaydi.*
- **Til (RU/UZ):** Sayt tilini o'zgartiradi (hozircha to'liq tarjima qilinmagan bo'lishi mumkin).
- **Mavzu (Oy/Quyosh):** Saytni Qoraytiradi (Dark Mode) yoki Yoritadi (Light Mode).

### 1.2. Mahsulotlar Katalogi
- **Kategoriyalar tugmalari:** (Barchasi, Vanna, Unitaz...). Bosilsa, faqat shu turdagi mahsulotlar qoladi.
- **Mahsulot Kartasi:**
  - **Rasm:** Mahsulotning asosiy rasmi.
  - **Nomi va Narxi:** Aniq ko'rinib turadi.
  - **Status:** "Yangi" yoki "Chegirma" belgilari (agar admin belgilagan bo'lsa).
  - **Batafsil:** Bosilganda mahsulot haqida to'liq ma'lumot (rasmlar galereyasi, tavsifi) ochiladi.

### 1.3. Chat (Admin bilan aloqa)
- Saytning pastki o'ng burchagidagi **Xabar tugmasi**.
- Mijoz u yerdan Ism va Telefonini yozib, administratorga to'g'ridan-to'g'ri xabar yuborishi mumkin.
- Bu xabar darhol Admin Panelga "Bildirishnoma" bo'lib boradi.

### 1.4. Xarita va Manzil
- Pastki qismda (Footer) do'kon joylashuvi Google/Yandex xaritada ko'rsatiladi.
- Telefon raqamlar va ijtimoiy tarmoqlar havolalari shu yerda joylashgan.

---

## 🔐 2-Qism: Admin Panel (Boshqaruv)
Bu qism faqat do'kon egasi uchun. Kirish uchun maxsus login/parol talab qilinadi.

### 2.1. Mahsulotlar Bo'limi (Asosiy)
Bu yerda siz omborni boshqarasiz.
- **Qo'shish (+):** Yangi tovar kiritish. Rasm yuklash, narx, o'lcham, rang va sonini kiritish.
- **Tahrirlash (Qalamcha):** Mavjud tovar narxini yoki rasmini o'zgartirish.
- **O'chirish (Musor qutisi):** Tovarni bazadan butunlay o'chirish.
- **Sotish (🛒 Savat tugmasi):** **ENG MUHIM FUNKSIYA!**
  - Agar mijoz do'konga kelib tovar olsa, shu tugmani bosasiz.
  - Nechta sotilganini yozasiz (masalan: 2 ta).
  - Tizim avtomatik ravishda:
    1. Ombordagi qoldiqdan 2 tani ayiradi.
    2. Statistikaga "+2 sotildi" deb yozib qo'yadi.

### 2.2. 📊 Statistika Bo'limi
Sizning biznesingiz qanday ketayotganini ko'rsatadi.
- **Kartalar:** Umumiy nechta tovar sotildi, qancha pul tushdi (taxminiy).
- **Eng Xaridorgir (Top 5):** Qaysi tovar eng ko'p ketayotganini grafikda ko'rasiz.
- **Kategoriyalar:** Qaysi bo'lim (masalan, Vanna) ko'proq foyda keltiryapti.
- **Haftalik Dinamika:** Qaysi kunlari savdo zo'r bo'ldi, qaysi kunlari sust.

### 2.3. 🤖 AI Tavsiya (Sun'iy Intellekt)
Bu bo'limda "kompyuter" sizga maslahat beradi:
- **Ogohlantirish ⚠️:** "Falonchi kran tugayapti, omborda 2 ta qoldi, lekin talab katta. Tezroq olib keling!"
- **Tavsiya 📈:** "So'nggi 3 kunda Unitazlar savdosi oshdi, vitrinaga ko'proq unitaz qo'ying."
- **O'lik Tovar 📉:** "Bu vanna 1 oydan beri sotilmadi. Balki arzonlashtirarsiz?"

### 2.4. Xabarlar (Chat)
- Saytdan mijozlar yozgan xabarlar shu yerga tushadi.
- Siz shu yerdan turib javob yozsangiz, mijozning telefoniga SMS bo'lib bormaydi, lekin saytga qaytib kirsa javobingizni ko'radi (Telegram uslubida).
- Chatlarni o'chirib tashlash mumkin.

### 2.5. Sozlamalar
- **Manzil & Telefon:** Do'kon ko'chsa yoki raqam o'zgarsa, dasturchini chaqirish shart emas. Shu yerdan o'zingiz o'zgartiraasiz.
- **Xarita:** Xaritadagi "tochkangizni" siljitib qo'yishingiz mumkin.
- **Mavzu (Theme):** Admin panelni qora yoki oq rangga o'tkazish.

---

## 🛠 3-Qism: Texnik Tushunchalar (Dasturchi uchun)
- **Baza (Firestore):** Hamma ma'lumotlar Google bulutida saqlanadi. Kompyuter buzilsa ham, ma'lumot o'chib ketmaydi.
- **Rasmlar:** Yuklangan rasmlar alohida "Storage" da turadi.
- **Xavfsizlik:** Admin bo'lmagan odam hech narsani o'chira olmaydi (buni "Security Rules" himoya qiladi).

Ushbu tizim sizning "Raqamli Yordamchingiz" hisoblanadi. Uni qanchalik to'g'ri ishlatsangiz (ayniqsa "Sotish" tugmasini), statistika va AI shunchalik aniq maslahat beradi.
