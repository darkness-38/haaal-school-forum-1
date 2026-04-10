🎯 GÖREV TANIMI

Sen bir senior full-stack developer'sın. Aşağıda detayları verilen HAAAL School Forum projesine tam çalışan bir backend entegre edeceksin. Proje şu an sadece hardcode sahte verilerle çalışan bir Next.js frontend'idir. Senin görevin bu projeyi baştan sona gerçek bir veritabanına bağlı, kimlik doğrulamalı, tam işlevsel bir web uygulamasına dönüştürmek.

GitHub Repo: https://github.com/OmerFirig/haaal-school-forum

Live Demo (mevcut frontend): https://v0-haaal-school-forum.vercel.app

Tech Stack: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui



📦 KULLANILACAK TEKNOLOJİLER

- Framework:     Next.js 14 (App Router) — zaten kurulu

- Database:      Supabase (PostgreSQL)

- ORM:           Prisma

- Auth:          NextAuth.js v5 (Auth.js)

- Şifreleme:     bcryptjs

- Validation:    zod

- Session:       JWT (NextAuth ile)

- Upload:        Supabase Storage (avatar için)

Kurulum komutları:

bashnpm install @prisma/client prisma

npm install next-auth@beta

npm install bcryptjs @types/bcryptjs

npm install zod

npm install @supabase/supabase-js

npx prisma init



🗄️ VERİTABANI ŞEMASI (Prisma Schema)

prisma/schema.prisma dosyasını AŞAĞIDAKİ TAMAMEN ile değiştir:

prismagenerator client {

  provider = "prisma-client-js"

}



datasource db {

  provider  = "postgresql"

  url       = env("DATABASE_URL")

  directUrl = env("DIRECT_URL")

}



enum UserRole {

  STUDENT

  TEACHER

  STAFF

  ADMIN

}



model User {

  id             String    @id @default(cuid())

  email          String?   @unique

  studentNumber  String?   @unique  // Öğrenci numarası

  username       String    @unique

  displayName    String

  passwordHash   String

  role           UserRole  @default(STUDENT)

  avatar         String?

  bio            String?

  points         Int       @default(0)

  postCount      Int       @default(0)

  isOnline       Boolean   @default(false)

  lastSeen       DateTime  @default(now())

  createdAt      DateTime  @default(now())

  updatedAt      DateTime  @updatedAt



  threads        Thread[]

  replies        Reply[]

  eventAttendees EventAttendee[]

  groupMembers   GroupMember[]

  badges         UserBadge[]



  @@map("users")

}



model Category {

  id          String   @id @default(cuid())

  name        String

  slug        String   @unique

  description String

  icon        String   @default("MessageSquare")

  color       String   @default("#6366f1")

  threadCount Int      @default(0)

  createdAt   DateTime @default(now())



  threads     Thread[]



  @@map("categories")

}



model Thread {

  id          String   @id @default(cuid())

  title       String

  content     String   @db.Text

  authorId    String

  categoryId  String

  views       Int      @default(0)

  replyCount  Int      @default(0)

  isPinned    Boolean  @default(false)

  isLocked    Boolean  @default(false)

  tags        String[] @default([])

  createdAt   DateTime @default(now())

  updatedAt   DateTime @updatedAt



  author      User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  replies     Reply[]



  @@map("threads")

}



model Reply {

  id        String   @id @default(cuid())

  content   String   @db.Text

  authorId  String

  threadId  String

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt



  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  thread    Thread   @relation(fields: [threadId], references: [id], onDelete: Cascade)



  @@map("replies")

}



model Event {

  id           String   @id @default(cuid())

  title        String

  description  String   @db.Text

  date         DateTime

  location     String

  attendeeCount Int     @default(0)

  createdAt    DateTime @default(now())



  attendees    EventAttendee[]



  @@map("events")

}



model EventAttendee {

  userId    String

  eventId   String

  createdAt DateTime @default(now())



  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)



  @@id([userId, eventId])

  @@map("event_attendees")

}



model Group {

  id          String   @id @default(cuid())

  name        String

  description String

  icon        String?

  memberCount Int      @default(0)

  createdAt   DateTime @default(now())



  members     GroupMember[]



  @@map("groups")

}



model GroupMember {

  userId    String

  groupId   String

  createdAt DateTime @default(now())



  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)



  @@id([userId, groupId])

  @@map("group_members")

}



model Resource {

  id          String   @id @default(cuid())

  title       String

  description String

  url         String?

  fileUrl     String?

  categoryId  String

  uploaderId  String

  createdAt   DateTime @default(now())



  @@map("resources")

}



model Badge {

  id          String      @id @default(cuid())

  name        String

  description String

  icon        String



  users       UserBadge[]



  @@map("badges")

}



model UserBadge {

  userId    String

  badgeId   String

  awardedAt DateTime @default(now())



  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  badge     Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)



  @@id([userId, badgeId])

  @@map("user_badges")

}



🔐 GİRİŞ SİSTEMİ — DETAYLI SPEC

Login Sayfası (/login) — TAM YENİDEN YAZ

Mevcut login sayfasını tamamen sil ve sıfırdan yaz. Yeni login sayfası şöyle çalışacak:

ADIM 1 — Kullanıcı Tipi Seçimi:

Sayfa açıldığında iki büyük kart gösterilecek:

┌─────────────────────┐    ┌─────────────────────┐

│    🎒               │    │    👨‍🏫               │

│    ÖĞRENCİYİM       │    │    ÖĞRETMENİM       │

│                     │    │                     │

│  Öğrenci numarası   │    │  E-posta ile        │

│  ile giriş yap      │    │  giriş yap          │

└─────────────────────┘    └─────────────────────┘

ADIM 2 — Forma Geçiş (seçime göre):

Öğrenci seçerse:

Öğrenci Numarası: [input - sadece sayı]

Şifre:           [input - password]

                 [Giriş Yap butonu]

Öğretmen seçerse:

E-posta:  [input - email]

Şifre:    [input - password]

          [Giriş Yap butonu]

Her iki formda da "Geri" butonu olacak (kullanıcı tipini değiştirebilsin).

Auth Logic:



Öğrenci: studentNumber + passwordHash ile doğrula, role = STUDENT

Öğretmen/Personel/Admin: email + passwordHash ile doğrula, role = TEACHER | STAFF | ADMIN

Başarılı girişte session başlat, ana sayfaya yönlendir

Hatalı girişte: "Öğrenci numarası veya şifre hatalı" / "E-posta veya şifre hatalı" mesajı



Register Sayfası (/register) — TAM YENİDEN YAZ

Register sayfasında da aynı tip seçimi olacak:

Öğrenci kaydı:

Ad Soyad:         [text]

Öğrenci Numarası: [text - unique]

Kullanıcı Adı:    [text - unique, @ile gösterilecek]

Şifre:            [password]

Şifre Tekrar:     [password]

Öğretmen kaydı:

Ad Soyad:      [text]

E-posta:       [email - unique]

Kullanıcı Adı: [text - unique]

Şifre:         [password]

Şifre Tekrar:  [password]



🔑 NEXTAUTH KURULUMU

auth.ts (proje kökünde):

typescriptimport NextAuth from "next-auth"

import CredentialsProvider from "next-auth/providers/credentials"

import { prisma } from "@/lib/prisma"

import bcrypt from "bcryptjs"



export const { handlers, auth, signIn, signOut } = NextAuth({

  providers: [

    CredentialsProvider({

      name: "credentials",

      credentials: {

        identifier: { label: "identifier", type: "text" },

        password: { label: "password", type: "password" },

        loginType: { label: "loginType", type: "text" }, // "student" | "teacher"

      },

      async authorize(credentials) {

        if (!credentials?.identifier || !credentials?.password) return null

        

        let user = null

        

        if (credentials.loginType === "student") {

          user = await prisma.user.findUnique({

            where: { studentNumber: credentials.identifier as string }

          })

        } else {

          user = await prisma.user.findUnique({

            where: { email: credentials.identifier as string }

          })

        }

        

        if (!user) return null

        

        const passwordMatch = await bcrypt.compare(

          credentials.password as string,

          user.passwordHash

        )

        

        if (!passwordMatch) return null

        

        return {

          id: user.id,

          email: user.email,

          name: user.displayName,

          username: user.username,

          role: user.role,

          image: user.avatar,

        }

      }

    })

  ],

  callbacks: {

    async jwt({ token, user }) {

      if (user) {

        token.id = user.id

        token.username = (user as any).username

        token.role = (user as any).role

      }

      return token

    },

    async session({ session, token }) {

      if (token) {

        session.user.id = token.id as string

        session.user.username = token.username as string

        session.user.role = token.role as string

      }

      return session

    }

  },

  pages: {

    signIn: "/login",

  },

  session: { strategy: "jwt" }

})

app/api/auth/[...nextauth]/route.ts:

typescriptimport { handlers } from "@/auth"

export const { GET, POST } = handlers

middleware.ts (proje kökünde):

typescriptimport { auth } from "@/auth"

import { NextResponse } from "next/server"



export default auth((req) => {

  const { nextUrl, auth: session } = req

  const isLoggedIn = !!session



  const protectedPaths = ["/new-thread", "/profile/edit", "/settings"]

  const isProtected = protectedPaths.some(p => nextUrl.pathname.startsWith(p))



  if (isProtected && !isLoggedIn) {

    return NextResponse.redirect(new URL("/login", nextUrl))

  }



  return NextResponse.next()

})



export const config = {

  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]

}



🌐 TÜM API ROUTE'LARI

1. Register — app/api/register/route.ts

typescriptPOST /api/register

Body: {

  displayName: string

  username: string

  password: string

  loginType: "student" | "teacher"

  studentNumber?: string  // loginType === "student" ise zorunlu

  email?: string          // loginType === "teacher" ise zorunlu

  role?: "STUDENT" | "TEACHER" | "STAFF"

}



bcrypt.hash(password, 12) ile şifrele

Unique check: username, studentNumber, email

Başarıda: { success: true, message: "Kayıt başarılı" }

Hata: { error: "Bu kullanıcı adı zaten alınmış" } vb.



2. Threads — app/api/threads/route.ts

typescriptGET /api/threads?category=&sort=new|popular|unanswered&page=1&limit=10&q=

→ Thread listesi, author ve category ile birlikte



POST /api/threads  [AUTH REQUIRED]

Body: { title, content, categoryId, tags[] }

→ Yeni thread oluştur, authorId session'dan al

→ Category threadCount'ı +1 artır

→ User postCount'ı +1 artır, points +10 ekle

3. Thread Detail — app/api/threads/[id]/route.ts

typescriptGET /api/threads/[id]

→ Thread + tüm replies (author bilgileriyle) döndür

→ Her GET'te views +1 artır



DELETE /api/threads/[id]  [AUTH - sadece yazar veya admin]

→ Thread ve tüm reply'larını sil

4. Replies — app/api/threads/[id]/replies/route.ts

typescriptPOST /api/threads/[id]/replies  [AUTH REQUIRED]

Body: { content }

→ Reply oluştur

→ Thread replyCount +1

→ User postCount +1, points +5

5. Categories — app/api/categories/route.ts

typescriptGET /api/categories

→ Tüm kategoriler + threadCount ile döndür

6. Events — app/api/events/route.ts

typescriptGET /api/events

→ Gelecekteki eventler (tarih sıralı)



POST /api/events  [AUTH - TEACHER veya ADMIN]

Body: { title, description, date, location }

7. Event Attend — app/api/events/[id]/attend/route.ts

typescriptPOST /api/events/[id]/attend  [AUTH REQUIRED]

→ Kullanıcıyı etkinliğe ekle, attendeeCount +1



DELETE /api/events/[id]/attend  [AUTH REQUIRED]

→ Kullanıcıyı etkinlikten çıkar, attendeeCount -1

8. Groups — app/api/groups/route.ts

typescriptGET /api/groups

→ Tüm gruplar + memberCount



POST /api/groups  [AUTH - TEACHER veya ADMIN]

Body: { name, description, icon }

9. Members — app/api/members/route.ts

typescriptGET /api/members?sort=points|posts|newest&q=

→ Kullanıcı listesi (şifre hariç tüm alanlar)

→ Sayfalama: page, limit

10. User Profile — app/api/profile/[username]/route.ts

typescriptGET /api/profile/[username]

→ Kullanıcı bilgisi + son threadleri + istatistikler



PATCH /api/profile/[username]  [AUTH - sadece kendi profili]

Body: { displayName, bio, avatar }

11. Leaderboard — app/api/leaderboard/route.ts

typescriptGET /api/leaderboard

→ points'e göre azalan sıralı top 20 kullanıcı

12. Search — app/api/search/route.ts

typescriptGET /api/search?q=&type=threads|users|all

→ Thread title/content içinde arama (ilike)

→ User displayName/username içinde arama

→ Kombine sonuç döndür

13. Stats — app/api/stats/route.ts

typescriptGET /api/stats

→ {

    totalThreads: count,

    totalReplies: count,

    totalUsers: count,

    onlineUsers: count,

    todayPosts: count,

    newestMember: { displayName, username }

  }

14. Online Status — app/api/online/route.ts

typescriptPOST /api/online  [AUTH REQUIRED]

→ User.isOnline = true, lastSeen = now()

→ Uygulama her 30 saniyede bir bunu çağırır (heartbeat)

→ 5 dakika heartbeat gelmeyen user offline sayılır



📄 FRONTEND ENTEGRASYONU — SAYFA SAYFA

Ana Sayfa (app/page.tsx)

Şu an hardcode olan verileri kaldır, gerçek fetch ekle:

typescript// Server Component - bu şekilde yap

import { prisma } from "@/lib/prisma"



export default async function HomePage() {

  const [threads, categories, events, stats, topUsers] = await Promise.all([

    prisma.thread.findMany({

      take: 10,

      orderBy: { createdAt: "desc" },

      include: { author: true, category: true, _count: { select: { replies: true } } }

    }),

    prisma.category.findMany({ orderBy: { threadCount: "desc" } }),

    prisma.event.findMany({

      where: { date: { gte: new Date() } },

      take: 4,

      orderBy: { date: "asc" }

    }),

    // stats fetch

    // topUsers fetch

  ])

  

  // JSX return (mevcut tasarımı koru, sadece verileri değiştir)

}

Trend konular: views'a göre top 5 thread

En aktif kullanıcılar: points'e göre top 3

Yaklaşan etkinlikler: ilk 4 gelecek event

İstatistikler: /api/stats'tan çek

Aktif kullanıcılar: isOnline: true olan userlar

Kategoriler Sayfası (app/categories/page.tsx)



/api/categories endpoint'inden çek

10 kategori: Duyurular, Akademik, Kulüpler & Aktiviteler, Etkinlikler, Genel Tartışma, Kaynaklar, Soru & Cevap, Teknoloji, Spor, Sanat & Kültür

Her kategoride threadCount ve son aktivite göster



Kategori Detay (app/category/[slug]/page.tsx)



Slug'a göre kategoriyi bul

O kategorideki threadleri listele

Filtreleme: yeni / popüler / cevaplanmamış



Thread Detay (app/thread/[id]/page.tsx)



Thread + replies fetch et

Reply formu — sadece giriş yapmış kullanıcılar görsün

Giriş yapmamışlara: "Cevap yazmak için giriş yap" linki

Reply submit → POST /api/threads/[id]/replies



Yeni Konu (app/new-thread/page.tsx)



Login olmadan bu sayfaya girilemesin (middleware halleder)

Form: başlık, kategori seç (dropdown), içerik (textarea), etiketler

Submit → POST /api/threads

Başarıda yeni thread'in sayfasına yönlendir



Üyeler (app/members/page.tsx)



/api/members endpoint'inden çek

Arama ve sıralama (points/posts/yeni) çalışsın

Sayfalama çalışsın



Profil (app/profile/[username]/page.tsx)



/api/profile/[username] endpoint'inden çek

Kullanıcı bilgileri, istatistikler

Son threadler

Kendi profili ise "Düzenle" butonu göster



Etkinlikler (app/events/page.tsx)



/api/events endpoint'inden çek

"Katıl" butonu:



Giriş yapmamışsa → login sayfasına yönlendir

Giriş yapmışsa → POST /api/events/[id]/attend

Zaten katılmışsa → "Ayrıl" butonu göster







Leaderboard (app/leaderboard/page.tsx)



/api/leaderboard endpoint'inden çek

İlk 3 için özel tasarım (altın/gümüş/bronz)





🌱 SEED DATA (Başlangıç Verileri)

prisma/seed.ts dosyası oluştur:

typescriptimport { PrismaClient } from "@prisma/client"

import bcrypt from "bcryptjs"



const prisma = new PrismaClient()



async function main() {

  // 10 Kategori oluştur

  const categories = await Promise.all([

    prisma.category.upsert({ where: { slug: "duyurular" }, update: {}, create: { name: "Duyurular", slug: "duyurular", description: "Resmi okul duyuruları", icon: "Megaphone", color: "#ef4444" }}),

    prisma.category.upsert({ where: { slug: "akademik" }, update: {}, create: { name: "Akademik", slug: "akademik", description: "Dersler ve ödevler", icon: "BookOpen", color: "#3b82f6" }}),

    prisma.category.upsert({ where: { slug: "kulupler" }, update: {}, create: { name: "Kulüpler & Aktiviteler", slug: "kulupler", description: "Okul kulüpleri", icon: "Users", color: "#8b5cf6" }}),

    prisma.category.upsert({ where: { slug: "etkinlikler" }, update: {}, create: { name: "Etkinlikler", slug: "etkinlikler", description: "Okul etkinlikleri", icon: "Calendar", color: "#f59e0b" }}),

    prisma.category.upsert({ where: { slug: "genel" }, update: {}, create: { name: "Genel Tartışma", slug: "genel", description: "Genel konular", icon: "MessageCircle", color: "#10b981" }}),

    prisma.category.upsert({ where: { slug: "kaynaklar" }, update: {}, create: { name: "Kaynaklar", slug: "kaynaklar", description: "Ders notları ve kaynaklar", icon: "FolderOpen", color: "#06b6d4" }}),

    prisma.category.upsert({ where: { slug: "soru-cevap" }, update: {}, create: { name: "Soru & Cevap", slug: "soru-cevap", description: "Sorular ve cevaplar", icon: "HelpCircle", color: "#f97316" }}),

    prisma.category.upsert({ where: { slug: "teknoloji" }, update: {}, create: { name: "Teknoloji", slug: "teknoloji", description: "Teknoloji ve yazılım", icon: "Cpu", color: "#6366f1" }}),

    prisma.category.upsert({ where: { slug: "spor" }, update: {}, create: { name: "Spor", slug: "spor", description: "Spor etkinlikleri", icon: "Trophy", color: "#ec4899" }}),

    prisma.category.upsert({ where: { slug: "sanat-kultur" }, update: {}, create: { name: "Sanat & Kültür", slug: "sanat-kultur", description: "Sanat ve müzik", icon: "Palette", color: "#14b8a6" }}),

  ])



  const adminPass = await bcrypt.hash("admin123", 12)

  const teacherPass = await bcrypt.hash("ogretmen123", 12)

  const studentPass = await bcrypt.hash("ogrenci123", 12)



  // Kullanıcılar

  const admin = await prisma.user.upsert({

    where: { username: "mudur-yilmaz" }, update: {},

    create: { username: "mudur-yilmaz", displayName: "Müdür Yılmaz", email: "mudur@haaal.edu.tr", passwordHash: adminPass, role: "ADMIN", points: 1800, postCount: 120 }

  })

  const teacher1 = await prisma.user.upsert({

    where: { username: "ayse-ogretmen" }, update: {},

    create: { username: "ayse-ogretmen", displayName: "Ayşe Öğretmen", email: "ayse@haaal.edu.tr", passwordHash: teacherPass, role: "TEACHER", points: 1250, postCount: 145 }

  })

  const student1 = await prisma.user.upsert({

    where: { username: "ali-yilmaz" }, update: {},

    create: { username: "ali-yilmaz", displayName: "Ali Yılmaz", studentNumber: "20210001", passwordHash: studentPass, role: "STUDENT", points: 980, postCount: 87 }

  })

  const student2 = await prisma.user.upsert({

    where: { username: "zeynep-kaya" }, update: {},

    create: { username: "zeynep-kaya", displayName: "Zeynep Kaya", studentNumber: "20210002", passwordHash: studentPass, role: "STUDENT", points: 845, postCount: 64 }

  })



  // Örnek thread'ler

  await prisma.thread.createMany({

    skipDuplicates: true,

    data: [

      { title: "Final Sınav Programı Yayınlandı", content: "Değerli öğrenciler, final sınav programı aşağıdaki gibidir...", authorId: teacher1.id, categoryId: categories[0].id, views: 145, replyCount: 12, isPinned: true, tags: ["önemli", "sınavlar"] },

      { title: "Basketbol Takımı Seçmeleri Gelecek Hafta", content: "Okul basketbol takımı için seçmeler başlıyor...", authorId: admin.id, categoryId: categories[8].id, views: 97, replyCount: 8, tags: ["spor", "basketbol"] },

      { title: "Bilim Fuarı Proje Fikirleri", content: "Bu yıl bilim fuarına hangi projelerle katılıyorsunuz?", authorId: student1.id, categoryId: categories[1].id, views: 210, replyCount: 23, tags: ["bilim", "projeler"] },

      { title: "Yemekhane Menü Önerileri", content: "Yemekhane menüsüne eklenecek yiyecekler için önerilerinizi yazın.", authorId: student2.id, categoryId: categories[4].id, views: 256, replyCount: 31, tags: ["yemekhane", "öneri"] },

    ]

  })



  // Etkinlikler

  await prisma.event.createMany({

    skipDuplicates: true,

    data: [

      { title: "Bahar Konseri", description: "Yıllık bahar konseri", date: new Date("2025-05-25T19:00:00"), location: "Okul Konferans Salonu", attendeeCount: 42 },

      { title: "Final Sınavları Başlangıcı", description: "Final sınav dönemi başlıyor", date: new Date("2025-06-10T08:30:00"), location: "Tüm Sınıflar", attendeeCount: 523 },

      { title: "Mezuniyet Töreni", description: "2025 mezuniyet töreni", date: new Date("2025-06-18T13:00:00"), location: "Okul Bahçesi", attendeeCount: 156 },

    ]

  })



  // Gruplar

  await prisma.group.createMany({

    skipDuplicates: true,

    data: [

      { name: "Bilim Kulübü", description: "Bilim ve araştırma meraklıları", memberCount: 24 },

      { name: "Münazara Takımı", description: "Tartışma ve münazara", memberCount: 18 },

      { name: "Matematik Kulübü", description: "Matematik yarışmaları", memberCount: 31 },

      { name: "Spor Departmanı", description: "Okul spor takımları", memberCount: 45 },

    ]

  })



  // Kategorilerin threadCount'larını güncelle

  for (const cat of categories) {

    const count = await prisma.thread.count({ where: { categoryId: cat.id } })

    await prisma.category.update({ where: { id: cat.id }, data: { threadCount: count } })

  }



  console.log("✅ Seed tamamlandı!")

}



main().catch(console.error).finally(() => prisma.$disconnect())

package.json'a ekle:

json"prisma": {

  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"

}

Seed çalıştır: npx prisma db seed



📁 lib/prisma.ts DOSYASI

typescriptimport { PrismaClient } from "@prisma/client"



const globalForPrisma = globalThis as unknown as {

  prisma: PrismaClient | undefined

}



export const prisma =

  globalForPrisma.prisma ??

  new PrismaClient({

    log: ["query"],

  })



if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma



🌍 .env.local (Supabase Bilgileri)

env# Supabase'den alınacak:

DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"



# NextAuth - rastgele güçlü bir string:

NEXTAUTH_SECRET="buraya-cok-uzun-ve-rastgele-bir-secret-yaz"

NEXTAUTH_URL="http://localhost:3000"



# Supabase (storage için):

NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"

NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON-KEY]"



✅ UYGULAMA KONTROL LİSTESİ

Aşağıdakilerin HEPSİ çalışmalı:

Auth



 /login sayfasında öğrenci/öğretmen tipi seçimi

 Öğrenci: öğrenci no + şifre ile giriş

 Öğretmen: email + şifre ile giriş

 /register sayfasında öğrenci/öğretmen kaydı

 Giriş sonrası navbar'da kullanıcı adı ve avatar göster

 Çıkış yap butonu çalışsın

 Korunan sayfalar login olmadan açılmasın



Threads



 Ana sayfa gerçek thread listesi göstersin

 Thread tıklanınca detay sayfası açılsın

 Thread detayında gerçek reply'lar görünsün

 Giriş yapmış kullanıcı reply yazabilsin

 "Yeni Konu" butonu çalışsın (login gerekli)

 Thread oluştururken kategori seçilebilsin

 Etiket eklenebilsin

 Thread views sayılsın



Kategoriler



 Kategoriler sayfası gerçek verileri göstersin

 Kategori tıklanınca o kategorinin thread'leri listelensin



Üyeler



 Üyeler sayfası gerçek kullanıcıları göstersin

 Arama çalışsın

 Sıralama çalışsın



Profil



 Profil sayfası gerçek verileri göstersin

 Kendi profilini düzenleyebilsin



Etkinlikler



 Etkinlikler gerçek veritabanından gelsin

 Katıl/Ayrıl butonu çalışsın



İstatistikler



 Ana sayfadaki istatistikler (toplam konu/cevap/üye) gerçek olsun





🚫 YAPILMAYACAKLAR



Mevcut Tailwind tasarımını değiştirme

Mevcut component yapısını değiştirme

Yeni UI kütüphanesi ekleme

Sadece verileri hardcode'dan dinamiğe çevir





🔄 ÇALIŞMA SIRASI



.env.local dosyasını Supabase bilgileriyle oluştur

prisma/schema.prisma dosyasını yaz

npx prisma db push ile tabloları oluştur

lib/prisma.ts oluştur

auth.ts ve NextAuth route'larını oluştur

middleware.ts oluştur

/login ve /register sayfalarını yeniden yaz

Tüm API route'larını yaz (app/api/...)

Seed dosyasını çalıştır: npx prisma db seed

Her sayfayı teker teker gerçek API'ye bağla

npm run dev ile test et

Her özelliği test et







supabase project_id: ehhntugvxtjeuhwltcli

project name: haaalforum

Hedefi netleştirip en az riskli entegrasyon planını çıkaracağım: mevcut App Router sayfalarında hardcode verileri Prisma/Supabase kaynaklı gerçek sorgulara çevireceğiz, NextAuth Credentials ile login/register akışını ekleyeceğiz, ardından API route’larını ve seed’i tamamlayacağız. Önce kod tabanında şu anki sahte data nerede/ nasıl kullanılıyor onu hızlıca tarıyorum.

Kod tarafında önemli iki tespit var: proje Next.js 15.2.4 kullanıyor (spec’te 14 yazıyor) ve şu an hiç app/api/* route’u yok; login/register tamamen client-side “redirect” yapıyor. Planı doğru kilitlemek için 2 kritik tercih soracağım.

Projede Next.js sürümü şu an 15.2.4. Backend/Auth entegrasyonunu bu sürümde mi yapalım, yoksa spec’e uyması için Next.js 14’e düşürelim mi?

Next.js 15.2.4 ile devam edelim (önerilen, daha az risk/iş)
Repo’da app/chat/* sayfaları var ama spec’te chat backend’i yok. Chat’i de gerçek DB’ye bağlayıp endpointler yazmamı ister misin, yoksa şimdilik mock kalsın mı?

Chat’i de implemente et (ek tablo+API gerekir)
Chat’i hangi kapsamda gerçekleyelim? (Mevcut sayfalar: /chat, /chat/new, /chat/group, ayrıca mesaj dropdown/notification UI var.)

DM + grup (Conversation/Participant/Message gibi ekstra tablolar; /chat ve /chat/new de tam çalışsın)
Chat (DM+grup) için Prisma şemasına yeni modeller eklemem gerekiyor. schema.prismayı verdiğin şemanın ÜZERİNE eklememi onaylıyor musun? (Aksi halde chat’i backend’e bağlamak mümkün değil.)

Evet, şemayı genişlet (mevcut modelleri bozma, sadece ekle)
Next.js 15.2.4 App Router projesini Supabase(Postgres)+Prisma+NextAuth v5 ile gerçek backend’e bağlayıp; auth (student/teacher), API route’ları, seed, upload (avatar) ve sayfa bazlı entegrasyonları tamamlamak.

Planı uygulamaya başlıyorum: önce bağımlılıkları kurup .env şablonunu hazırlayacağım, ardından Prisma şeması + client, sonra NextAuth ve middleware, sonra API route’ları/seed ve en son sayfaları gerçek veriye bağlayıp dev ortamında uçtan uca test edeceğim.

Bağımlılıkları mevcut proje düzenine uygun şekilde (pnpm lockfile var) kurup, repoya güvenli şekilde commitlenebilecek bir .env.example oluşturacağım (gerçek .env.local zaten .gitignore ile dışarıda kalacak).

Node/npm komutları bu ortamda PATH’te görünmüyor (node/npm/pnpm/yarn yok). O yüzden paketleri gerçekten “install” edemesem de, package.json’ı doğru bağımlılıklarla güncelleyip repoya .env.example ekleyerek senin makinede tek komutla kurulabilir hale getireceğim.

