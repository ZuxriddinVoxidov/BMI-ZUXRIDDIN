# EduFlow - Loyiha Arxitekturasi va Hujjatlari

Ushbu hujjat EduFlow platformasining (46-maktab uchun mo'ljallangan yagona tizim) texnik arxitekturasi, fayllar strukturasi, ma'lumotlar bazasi va asosiy ish mantiqlarini (logika) tushuntirib beradi. Bu hujjat sun'iy intellekt (Claude, ChatGPT va h.k) loyihani tez tushunib olishi uchun maxsus tayyorlangan.

## 1. Asosiy Texnologiyalar (Tech Stack)
- **Framework:** Next.js 14 (App Router)
- **Dasturlash tili:** TypeScript
- **Styling:** Tailwind CSS
- **UI Komponentlar:** Shadcn UI, Framer Motion (animatsiyalar), Lucide React (ikonkalar)
- **Ma'lumotlar bazasi & Backend:** Supabase (PostgreSQL, jadvallar, auth, storage, RLS)
- **Autentifikatsiya:** Supabase SSR Auth (Cookies orqali)
- **Holat boshqaruvi (State Management):** Zustand (zarurat bo'lganda), React Context.

## 2. Loyiha Strukturasi (File Structure)
```text
src/
├── app/                  # Next.js App Router sahifalari va API route'lar
│   ├── (auth)/           # login, register sahifalari (layout bilan o'ralgan)
│   ├── actions/          # BARCHA Server Action'lar (DB ga yozish/o'qish shu yerdan qilinadi)
│   │   ├── auth.ts, attendance.ts, rewards.ts, clubs.ts, admin-students.ts, contact.ts ...
│   ├── api/              # RESTful API route'lar (agar kerak bo'lsa)
│   ├── dashboard/        # Admin panel (Role: 'super_admin', 'school_admin')
│   ├── director/         # Direktor paneli (Role: 'director')
│   ├── student/          # O'quvchi paneli (Role: 'student')
│   ├── teacher/          # O'qituvchi paneli (Role: 'teacher')
│   ├── globals.css       # Tailwind CSS va global stillar
│   ├── layout.tsx        # Root layout (va fontlar konfiguratsiyasi)
│   └── page.tsx          # Asosiy Landing Page
├── components/           # Qayta ishlatiladigan React komponentlar
│   ├── dashboard/        # Rollarga ajratilgan dashboard komponentlari (admin, director, student, teacher)
│   │   ├── admin/        # Admin UI (Chartlar, Tablelar, Missed Attendance logikasi)
│   │   ├── student/      # O'quvchi UI (GrowingTree gamification, Mening ishlarim, Rewards)
│   │   ├── teacher/      # O'qituvchi UI (O'quvchilar ro'yxati, Davomat olish, Ishlarni baholash)
│   ├── landing/          # Asosiy sahifa seksiyalari (Hero, Features, Stats, Testimonials, Clubs Carousel)
│   ├── shared/           # Umumiy komponentlar (Navbar, Footer, Skeleton loaderlar)
│   └── ui/               # Shadcn UI bazaviy komponentlari (Button, Modal, Input)
├── lib/                  # Yordamchi funksiyalar va konfiguratsiyalar
│   ├── supabase/         # Supabase client'lari (server.ts, client.ts, admin.ts)
│   ├── levels.ts         # Gamification mantiqi (Ballarni darajalarga o'girish)
│   ├── utils.ts          # Tailwind merge (cn) va boshqa utilitalar
└── middleware.ts         # Supabase Auth Session'ni yangilash va ruxsatlarni tekshirish uchun
```

## 3. Rol va Ruxsatlar (Role-Based Access Control)
Tizimda 4 xil rol mavjud:
1. **Admin (`super_admin` yoki `school_admin`):** Tizim sozlamalari, barcha o'qituvchi va o'quvchilarni tahrirlash, to'garaklarni boshqarish. O'qituvchilar dars o'tgan-o'tmaganini (Missed Attendance) nazorat qiladi. Bloklash (is_blocked) funksiyasi mavjud.
2. **Direktor (`director`):** Faqat tahlil (analytics), statistika va hisobotlarni ko'radi.
3. **O'qituvchi (`teacher`):** Faqat o'ziga biriktirilgan to'garak o'quvchilarini ko'radi. Dars jadvaliga mos kunlari davomat oladi (timetable validation). O'quvchilarga rag'bat beradi (10 ball) va o'quvchilarning ishlari, loyihalarini baholaydi (5 ball).
4. **O'quvchi (`student`):** To'garaklarga a'zo bo'ladi, o'z ballari va darajasini ("Daraxt" animatsiyasi orqali) kuzatib boradi. Vazifalar va loyihalar yuklaydi.

## 4. Ma'lumotlar Bazasi Strukturasi (PostgreSQL / Supabase)
Asosiy jadvallar:
- `profiles`: Barcha foydalanuvchilar (id, user_id, full_name, role, school_id, is_blocked).
- `clubs`: To'garaklar (id, name, teacher_id, schedule).
- `enrollments`: O'quvchilarning to'garakka a'zoliklari (id, student_id, club_id, status: 'pending'/'approved').
- `attendance`: Davomat (id, student_id, club_id, date, status: 'present'/'absent'/'excused').
- `student_points`: O'quvchilar yig'gan jami ballar (student_id, total_points).
- `teacher_rewards`: O'qituvchilar bergan rag'batlar tarixi (id, teacher_id, student_id, points_given, lesson_date).
- `student_works`: O'quvchilar yuklagan proyekt/ishlar (id, student_id, club_id, file_url, title, is_rewarded).

## 5. Dasturning Mantiqiy Qoidalari (Core Logic)

### 5.1 Xavfsizlik va RLS (Row Level Security) mantiqi
- Supabase'da jadvallar RLS bilan himoyalangan, shuning uchun Frontend orqali to'g'ridan-to'g'ri (Anon key bilan) ma'lumotlarni yozish/o'chirish xatolik beradi (Silent Error).
- **Yechim:** DB ga yozadigan YOKI o'zgartiradigan barcha Server Action'lar (`src/app/actions/*.ts`) Maxsus Service Role Client orqali bajariladi (`src/lib/supabase/admin.ts`). Ya'ni RLS backend tarafida chetlab o'tiladi.
- Bloklangan foydalanuvchilar (profiles.is_blocked = true) `middleware.ts` yoki sahifalarning `layout.tsx` (masalan `src/app/dashboard/layout.tsx`) qismida tekshirilib, tizimdan darhol chetlatiladi (force redirect to `/login?error=blocked`).

### 5.2 Gamification (O'yinlashtirish) va Ballar tizimi
- **O'quvchi darsga kelsa:** +1 ball (har bir 'present' attendance bazada avtomat ishlov beriladi / yoki alohida point beradi).
- **O'qituvchi "Rag'bat" bersa:** O'qituvchi panelidan bir kunda maksimal 7 marta faol o'quvchilarga +10 balldan rag'bat bera oladi. (Bazada `teacher_rewards` ga tushadi yozuvi).
- **O'quvchi "Mening ishlarim"dan fayl yuklasa:** Yuklagan onidayoq +5 ball qo'shiladi. 
- **Qo'shimcha baholash:** O'qituvchi o'quvchilarining ishlarini ko'rib chiqib maxsus **5 ball** ("Baholangan") berishi mumkin (Bazada `student_works.is_rewarded` tekshiruvi orqali takroriy baholash oldi olinadi).
- Barcha amallar orqa fonda `add_student_points` PostgreSQL RPC funksiyasini chaqiradi va `student_points` jadvaliga ballarni qo'shadi. Darajalar "Nihol"dan tortib to "Chinor"gacha hisoblab olinadi (`src/lib/levels.ts`).

### 5.3 Yagona Maktab (Single Tenant Logic)
- Login / Register sahifasidagi dizaynda `school_id` uchun hech qanday input ochilmaydi.
- O'quvchi ro'yxatdan o'tayotganida hardcode qilingan yagona maktab ID`si (`00000000-0000-0000-0000-000000000001` - 46-maktab uchun mo'ljallangan maxfiylantirilgan yagona ID) profiliga avtomat yoziladi. Bu ro'yxatdan o'tgan foydalanuvchilar "yo'qolib" qolmasligi va faqat o'zimizning adminlarga ko'rinishini ta'minlaydi. 

### 5.4 O'qituvchi Davomati (Validation)
- O'qituvchi davomat olish sahifasiga `teacher/attendance` kirganda tizim uning dars kunini tekshiradi (Masalan: jadvaldagi `"Dushanba", "Juma"` kabi matnlarni haftaning bugungi kuniga solishtiradi). Mos tushmasa davomat olish tugmasi o'chiriladi (Disabled) va ruxsat berilmaydi.
- Asosiy funksiya: o'qituvchining chindan ham darsi bo'la turib hali davomat olmagan bo'lsa, xuddi shu logika `Admin Dashboard`da kuzatib turiladi va Adminga *"Missed Attendance"* (davomat qilinmagan darslar) sifatida qizil blokda ogohlantirish qaytariladi.

## 6. Integratsiyalash (Next Steps / Prompts for Claude AI)
Hurmatli Claude (yoki boshqa LLM dasturchi bot): Agarda siz ushbu loyihada qandaydir o'zgartirish qilsangiz yoki yangi imkoniyat qo'shsangiz, quyidagilarni yodda tuting:
- **Server Action lar:** DB insert, update, delete larni faqat `/src/app/actions/` papkasida `createAdminClient()` (yoki postgresql RPC) ishlatgan holda bajaring. Client componentlarda `.insert()` bajarmang!
- **Data Fetching:** Sahifalarda asosan Server-side rendering qilingan `createClient()` (cookies bilan) hamda `export const dynamic = 'force-dynamic'` larni ishlatingki sahifalar real-time yangilanuvchan (freshed) bo'lsin.
- **Client Components:** UI uchun faqat `createBrowserClient` ishlatiladi, u asosan READ qilingan malumotni chizish uchun, Action larni esa alohida import qilib `.tsx` fayldagi event (onClick) larga beramiz.
- Barcha TypeScript xatolarini "any" solmasdan toza kod (`Record<string, unknown>` va Interface'lar orqali) tekshirib chiqing, yuzaga chiqqan log warning (ESLint) larga katta e'tibor qarating.
