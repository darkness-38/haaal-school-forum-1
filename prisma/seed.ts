import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "duyurular" },
      update: {},
      create: {
        name: "Duyurular",
        slug: "duyurular",
        description: "Resmi okul duyuruları",
        icon: "Megaphone",
        color: "#ef4444",
      },
    }),
    prisma.category.upsert({
      where: { slug: "akademik" },
      update: {},
      create: {
        name: "Akademik",
        slug: "akademik",
        description: "Dersler ve ödevler",
        icon: "BookOpen",
        color: "#3b82f6",
      },
    }),
    prisma.category.upsert({
      where: { slug: "kulupler" },
      update: {},
      create: {
        name: "Kulüpler & Aktiviteler",
        slug: "kulupler",
        description: "Okul kulüpleri",
        icon: "Users",
        color: "#8b5cf6",
      },
    }),
    prisma.category.upsert({
      where: { slug: "etkinlikler" },
      update: {},
      create: {
        name: "Etkinlikler",
        slug: "etkinlikler",
        description: "Okul etkinlikleri",
        icon: "Calendar",
        color: "#f59e0b",
      },
    }),
    prisma.category.upsert({
      where: { slug: "genel" },
      update: {},
      create: {
        name: "Genel Tartışma",
        slug: "genel",
        description: "Genel konular",
        icon: "MessageCircle",
        color: "#10b981",
      },
    }),
    prisma.category.upsert({
      where: { slug: "kaynaklar" },
      update: {},
      create: {
        name: "Kaynaklar",
        slug: "kaynaklar",
        description: "Ders notları ve kaynaklar",
        icon: "FolderOpen",
        color: "#06b6d4",
      },
    }),
    prisma.category.upsert({
      where: { slug: "soru-cevap" },
      update: {},
      create: {
        name: "Soru & Cevap",
        slug: "soru-cevap",
        description: "Sorular ve cevaplar",
        icon: "HelpCircle",
        color: "#f97316",
      },
    }),
    prisma.category.upsert({
      where: { slug: "teknoloji" },
      update: {},
      create: {
        name: "Teknoloji",
        slug: "teknoloji",
        description: "Teknoloji ve yazılım",
        icon: "Cpu",
        color: "#6366f1",
      },
    }),
    prisma.category.upsert({
      where: { slug: "spor" },
      update: {},
      create: {
        name: "Spor",
        slug: "spor",
        description: "Spor etkinlikleri",
        icon: "Trophy",
        color: "#ec4899",
      },
    }),
    prisma.category.upsert({
      where: { slug: "sanat-kultur" },
      update: {},
      create: {
        name: "Sanat & Kültür",
        slug: "sanat-kultur",
        description: "Sanat ve müzik",
        icon: "Palette",
        color: "#14b8a6",
      },
    }),
  ])

  const adminPass = await bcrypt.hash("admin123", 12)
  const teacherPass = await bcrypt.hash("ogretmen123", 12)
  const studentPass = await bcrypt.hash("ogrenci123", 12)

  const admin = await prisma.user.upsert({
    where: { username: "mudur-yilmaz" },
    update: {},
    create: {
      username: "mudur-yilmaz",
      displayName: "Müdür Yılmaz",
      email: "mudur@haaal.edu.tr",
      passwordHash: adminPass,
      role: "ADMIN",
      points: 1800,
      postCount: 120,
    },
  })

  const teacher1 = await prisma.user.upsert({
    where: { username: "ayse-ogretmen" },
    update: {},
    create: {
      username: "ayse-ogretmen",
      displayName: "Ayşe Öğretmen",
      email: "ayse@haaal.edu.tr",
      passwordHash: teacherPass,
      role: "TEACHER",
      points: 1250,
      postCount: 145,
    },
  })

  const student1 = await prisma.user.upsert({
    where: { username: "ali-yilmaz" },
    update: {},
    create: {
      username: "ali-yilmaz",
      displayName: "Ali Yılmaz",
      studentNumber: "20210001",
      passwordHash: studentPass,
      role: "STUDENT",
      points: 980,
      postCount: 87,
    },
  })

  const student2 = await prisma.user.upsert({
    where: { username: "zeynep-kaya" },
    update: {},
    create: {
      username: "zeynep-kaya",
      displayName: "Zeynep Kaya",
      studentNumber: "20210002",
      passwordHash: studentPass,
      role: "STUDENT",
      points: 845,
      postCount: 64,
    },
  })

  await prisma.thread.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "Final Sınav Programı Yayınlandı",
        content: "Değerli öğrenciler, final sınav programı aşağıdaki gibidir...",
        authorId: teacher1.id,
        categoryId: categories[0].id,
        views: 145,
        replyCount: 12,
        isPinned: true,
        tags: ["önemli", "sınavlar"],
      },
      {
        title: "Basketbol Takımı Seçmeleri Gelecek Hafta",
        content: "Okul basketbol takımı için seçmeler başlıyor...",
        authorId: admin.id,
        categoryId: categories[8].id,
        views: 97,
        replyCount: 8,
        tags: ["spor", "basketbol"],
      },
      {
        title: "Bilim Fuarı Proje Fikirleri",
        content: "Bu yıl bilim fuarına hangi projelerle katılıyorsunuz?",
        authorId: student1.id,
        categoryId: categories[1].id,
        views: 210,
        replyCount: 23,
        tags: ["bilim", "projeler"],
      },
      {
        title: "Yemekhane Menü Önerileri",
        content: "Yemekhane menüsüne eklenecek yiyecekler için önerilerinizi yazın.",
        authorId: student2.id,
        categoryId: categories[4].id,
        views: 256,
        replyCount: 31,
        tags: ["yemekhane", "öneri"],
      },
    ],
  })

  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "Bahar Konseri",
        description: "Yıllık bahar konseri",
        date: new Date("2025-05-25T19:00:00"),
        location: "Okul Konferans Salonu",
        attendeeCount: 42,
      },
      {
        title: "Final Sınavları Başlangıcı",
        description: "Final sınav dönemi başlıyor",
        date: new Date("2025-06-10T08:30:00"),
        location: "Tüm Sınıflar",
        attendeeCount: 523,
      },
      {
        title: "Mezuniyet Töreni",
        description: "2025 mezuniyet töreni",
        date: new Date("2025-06-18T13:00:00"),
        location: "Okul Bahçesi",
        attendeeCount: 156,
      },
    ],
  })

  await prisma.group.createMany({
    skipDuplicates: true,
    data: [
      { name: "Bilim Kulübü", description: "Bilim ve araştırma meraklıları", memberCount: 24 },
      { name: "Münazara Takımı", description: "Tartışma ve münazara", memberCount: 18 },
      { name: "Matematik Kulübü", description: "Matematik yarışmaları", memberCount: 31 },
      { name: "Spor Departmanı", description: "Okul spor takımları", memberCount: 45 },
    ],
  })

  for (const cat of categories) {
    const count = await prisma.thread.count({ where: { categoryId: cat.id } })
    await prisma.category.update({ where: { id: cat.id }, data: { threadCount: count } })
  }

  const resCats = await Promise.all([
    prisma.resourceCategory.upsert({
      where: { slug: "ders-notlari" },
      update: {},
      create: { name: "Ders Notları", slug: "ders-notlari" },
    }),
    prisma.resourceCategory.upsert({
      where: { slug: "video-dersler" },
      update: {},
      create: { name: "Video Dersler", slug: "video-dersler" },
    }),
  ])

  const r1 = await prisma.resource.create({
    data: {
      title: "Matematik Sınav Hazırlık Kılavuzu",
      description: "Lise matematik sınavları için kapsamlı kaynak.",
      uploaderId: teacher1.id,
      categoryId: resCats[0].id,
      type: "DOCUMENT",
      fileType: "PDF",
      fileSizeBytes: 2400000,
      downloadCount: 120,
      viewCount: 240,
      status: "APPROVED",
    },
  })
  const r2 = await prisma.resource.create({
    data: {
      title: "Kimya Deneyleri Video Serisi",
      description: "Kimya deneylerinin anlatımlı video serisi.",
      uploaderId: admin.id,
      categoryId: resCats[1].id,
      type: "VIDEO",
      fileType: "MP4",
      fileSizeBytes: 240000000,
      downloadCount: 88,
      viewCount: 160,
      status: "PENDING_REVIEW",
    },
  })

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: student1.id, followingId: teacher1.id } },
    update: {},
    create: { followerId: student1.id, followingId: teacher1.id },
  })
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: student2.id, followingId: student1.id } },
    update: {},
    create: { followerId: student2.id, followingId: student1.id },
  })

  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        title: "Yeni yanıt",
        message: "Konuna yeni bir yanıt geldi.",
        link: "/",
      },
      {
        userId: student1.id,
        title: "Yeni kaynak",
        message: "Kaynak onaylandı.",
        link: "/resources",
      },
    ],
  })

  const thread = await prisma.thread.findFirst({ where: { authorId: student1.id } })
  if (thread) {
    const poll = await prisma.poll.create({
      data: {
        threadId: thread.id,
        question: "Sınava nasıl hazırlanıyorsunuz?",
        options: {
          create: [{ text: "Deneme çözüyorum" }, { text: "Konu tekrarı yapıyorum" }],
        },
      },
      include: { options: true },
    })
    await prisma.pollVote.create({
      data: { pollId: poll.id, optionId: poll.options[0].id, userId: student2.id },
    })
    await prisma.pollOption.update({ where: { id: poll.options[0].id }, data: { votes: 1 } })
    await prisma.report.create({
      data: {
        reporterId: student2.id,
        targetType: "THREAD",
        targetId: thread.id,
        reasonText: "Uygunsuz içerik şüphesi",
      },
    })
  }

  await prisma.resourceReaction.create({
    data: { resourceId: r1.id, userId: student1.id, value: 5 },
  })
  await prisma.resourceBookmark.create({
    data: { resourceId: r1.id, userId: student2.id },
  })
  await prisma.resourceDownload.create({
    data: { resourceId: r1.id, userId: student1.id, ipHash: "seed" },
  })
  await prisma.report.create({
    data: {
      reporterId: student1.id,
      targetType: "RESOURCE",
      targetId: r2.id,
      reasonText: "İçerik doğrulanmalı",
    },
  })

  console.log("✅ Seed tamamlandı!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

