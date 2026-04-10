import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, MessageCircle, Users, Bell, Calendar, Award, FileText, HelpCircle, TrendingUp } from "lucide-react"
import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"
import RecentThreadCard from "@/components/recent-thread-card"
import TrendingTopics from "@/components/trending-topics"
import AnnouncementBanner from "@/components/announcement-banner"
import EventCard from "@/components/event-card"
import UserRankingCard from "@/components/user-ranking-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { prisma } from "@/lib/prisma"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale/tr"

function roleLabel(role: string) {
  switch (role) {
    case "ADMIN":
      return "Admin"
    case "TEACHER":
      return "Öğretmen"
    case "STAFF":
      return "Personel"
    default:
      return "Öğrenci"
  }
}

function relativeTime(date: Date) {
  return formatDistanceToNow(date, { addSuffix: true, locale: tr })
}

const categoryIconBySlug: Record<string, any> = {
  duyurular: Bell,
  akademik: BookOpen,
  kulupler: Users,
  etkinlikler: Calendar,
  genel: MessageCircle,
  kaynaklar: FileText,
  "soru-cevap": HelpCircle,
}

export default async function Home() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [recentThreads, popularThreads, unansweredThreads, categories, events, stats, topUsers, trendingThreads, onlineUsers] =
    await Promise.all([
      prisma.thread.findMany({
        take: 10,
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        include: { author: true, category: true, _count: { select: { replies: true } } },
      }),
      prisma.thread.findMany({
        take: 10,
        orderBy: [{ isPinned: "desc" }, { views: "desc" }, { createdAt: "desc" }],
        include: { author: true, category: true, _count: { select: { replies: true } } },
      }),
      prisma.thread.findMany({
        take: 10,
        where: { replyCount: 0 },
        orderBy: [{ createdAt: "desc" }],
        include: { author: true, category: true, _count: { select: { replies: true } } },
      }),
      prisma.category.findMany({ orderBy: { threadCount: "desc" }, take: 7 }),
      prisma.event.findMany({
        where: { date: { gte: new Date() } },
        take: 4,
        orderBy: { date: "asc" },
      }),
      (async () => {
        const [totalThreads, totalReplies, totalUsers, onlineUsersCount, todayThreads, todayReplies, newestMember] =
          await Promise.all([
            prisma.thread.count(),
            prisma.reply.count(),
            prisma.user.count(),
            prisma.user.count({ where: { isOnline: true } }),
            prisma.thread.count({ where: { createdAt: { gte: startOfDay } } }),
            prisma.reply.count({ where: { createdAt: { gte: startOfDay } } }),
            prisma.user.findFirst({
              orderBy: { createdAt: "desc" },
              select: { displayName: true, username: true },
            }),
          ])
        return {
          totalThreads,
          totalReplies,
          totalUsers,
          onlineUsers: onlineUsersCount,
          todayPosts: todayThreads + todayReplies,
          newestMember,
        }
      })(),
      prisma.user.findMany({
        take: 3,
        orderBy: { points: "desc" },
        select: { displayName: true, role: true, points: true, avatar: true, username: true },
      }),
      prisma.thread.findMany({
        take: 5,
        orderBy: [{ views: "desc" }, { createdAt: "desc" }],
        include: { category: true },
      }),
      prisma.user.findMany({
        take: 6,
        where: { isOnline: true },
        orderBy: { lastSeen: "desc" },
        select: { displayName: true, username: true },
      }),
    ])

  return (
    <div className="min-h-screen flex flex-col animated-bg">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <AnnouncementBanner
          title="Yeni Forum Özellikleri Eklendi!"
          description="Canlı sohbet, anketler ve dosya paylaşımı gibi yeni özelliklerimizi keşfedin."
          link="/announcements/new-features"
        />

        <div className="grid gap-6">
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight gradient-heading">HAAAL Forum'a Hoş Geldiniz</h1>
                <p className="text-muted-foreground">Okul topluluğunuzla bağlantı kurun, tartışın ve paylaşın</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input placeholder="Tartışmaları ara..." className="pr-10 w-[300px] gradient-border" />
                  <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-search"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <span className="sr-only">Ara</span>
                  </Button>
                </div>
                <Link href="/new-thread">
                  <Button className="animated-button">Yeni Konu</Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-6">
                <Card className="animated-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Kategoriler</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {categories.map((cat) => {
                      const Icon = categoryIconBySlug[cat.slug] ?? MessageCircle
                      return (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-all duration-300 hover:translate-x-1"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{cat.name}</span>
                        </Link>
                      )
                    })}
                  </CardContent>
                  <CardFooter>
                    <Link
                      href="/categories"
                      className="text-sm text-muted-foreground hover:underline hover:text-primary transition-colors duration-300"
                    >
                      Tüm kategorileri görüntüle
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="animated-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Trend Konular</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TrendingTopics
                      topics={trendingThreads.map((t) => ({
                        id: t.id,
                        title: t.title,
                        category: t.category.name,
                        count: t.views,
                      }))}
                    />
                  </CardContent>
                </Card>

                <Card className="animated-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>En Aktif Kullanıcılar</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topUsers.map((u, idx) => (
                      <UserRankingCard
                        key={u.username}
                        name={u.displayName}
                        role={roleLabel(u.role)}
                        points={u.points}
                        rank={idx + 1}
                        avatar={u.avatar ?? `/placeholder.svg?text=${u.displayName.substring(0, 2)}`}
                      />
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Link
                      href="/leaderboard"
                      className="text-sm text-muted-foreground hover:underline hover:text-primary transition-colors duration-300"
                    >
                      Sıralamayı görüntüle
                    </Link>
                  </CardFooter>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <Tabs defaultValue="recent" className="w-full">
                  <TabsList className="mb-4 w-full justify-start">
                    <TabsTrigger value="recent">Yeni</TabsTrigger>
                    <TabsTrigger value="popular">Popüler</TabsTrigger>
                    <TabsTrigger value="unanswered">Cevaplanmamış</TabsTrigger>
                    <TabsTrigger value="following">Takip Ettiklerim</TabsTrigger>
                  </TabsList>
                  <TabsContent value="recent" className="space-y-4">
                    {recentThreads.map((t) => (
                      <RecentThreadCard
                        key={t.id}
                        title={t.title}
                        author={t.author.displayName}
                        authorUsername={t.author.username}
                        authorRole={roleLabel(t.author.role)}
                        category={t.category.name}
                        categorySlug={t.category.slug}
                        replies={t._count.replies}
                        views={t.views}
                        timestamp={relativeTime(t.createdAt)}
                        id={t.id}
                        isPinned={t.isPinned}
                        tags={t.tags}
                        authorAvatar={t.author.avatar}
                      />
                    ))}
                  </TabsContent>
                  <TabsContent value="popular" className="space-y-4">
                    {popularThreads.map((t) => (
                      <RecentThreadCard
                        key={t.id}
                        title={t.title}
                        author={t.author.displayName}
                        authorUsername={t.author.username}
                        authorRole={roleLabel(t.author.role)}
                        category={t.category.name}
                        categorySlug={t.category.slug}
                        replies={t._count.replies}
                        views={t.views}
                        timestamp={relativeTime(t.createdAt)}
                        id={t.id}
                        isPinned={t.isPinned}
                        tags={t.tags}
                        authorAvatar={t.author.avatar}
                      />
                    ))}
                  </TabsContent>
                  <TabsContent value="unanswered" className="space-y-4">
                    {unansweredThreads.map((t) => (
                      <RecentThreadCard
                        key={t.id}
                        title={t.title}
                        author={t.author.displayName}
                        authorUsername={t.author.username}
                        authorRole={roleLabel(t.author.role)}
                        category={t.category.name}
                        categorySlug={t.category.slug}
                        replies={t._count.replies}
                        views={t.views}
                        timestamp={relativeTime(t.createdAt)}
                        id={t.id}
                        isPinned={t.isPinned}
                        tags={t.tags}
                        authorAvatar={t.author.avatar}
                      />
                    ))}
                  </TabsContent>
                  <TabsContent value="following" className="space-y-4">
                    {recentThreads.slice(0, 5).map((t) => (
                      <RecentThreadCard
                        key={t.id}
                        title={t.title}
                        author={t.author.displayName}
                        authorUsername={t.author.username}
                        authorRole={roleLabel(t.author.role)}
                        category={t.category.name}
                        categorySlug={t.category.slug}
                        replies={t._count.replies}
                        views={t.views}
                        timestamp={relativeTime(t.createdAt)}
                        id={t.id}
                        isPinned={t.isPinned}
                        tags={t.tags}
                        authorAvatar={t.author.avatar}
                      />
                    ))}
                  </TabsContent>
                </Tabs>

                <div className="flex justify-center">
                  <Button variant="outline" className="gradient-border hover:bg-muted/50 transition-all duration-300">
                    Daha Fazla Göster
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <Card className="animated-card">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Yaklaşan Etkinlikler</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[300px]">
                      <div className="p-4 space-y-4">
                        {events.map((e) => (
                          <EventCard
                            key={e.id}
                            title={e.title}
                            date={e.date.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
                            time={e.date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                            location={e.location}
                            attendees={e.attendeeCount}
                            id={e.id}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter>
                    <Link
                      href="/events"
                      className="text-sm text-muted-foreground hover:underline hover:text-primary transition-colors duration-300"
                    >
                      Tam takvimi görüntüle
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="animated-card">
                  <CardHeader>
                    <CardTitle className="text-lg">İstatistikler</CardTitle>
                    <CardDescription>Forum aktivite özeti</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Toplam Konular:</span>
                        <span className="font-medium">{stats.totalThreads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Toplam Cevaplar:</span>
                        <span className="font-medium">{stats.totalReplies}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aktif Kullanıcılar:</span>
                        <span className="font-medium">{stats.onlineUsers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">En Yeni Üye:</span>
                        <span className="font-medium">{stats.newestMember?.displayName ?? "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bugünkü Mesajlar:</span>
                        <span className="font-medium">{stats.todayPosts}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="animated-card">
                  <CardHeader>
                    <CardTitle className="text-lg">Aktif Kullanıcılar</CardTitle>
                    <CardDescription>Şu anda çevrimiçi</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {onlineUsers.map((u) => (
                        <Link
                          key={u.username}
                          href={`/profile/${u.username}`}
                          className="flex items-center gap-2 bg-muted px-2 py-1 rounded-full text-sm transition-all duration-300 hover:bg-primary/10 hover:scale-105"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-500 pulse"></div>
                          <span>{u.displayName}</span>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="text-sm text-muted-foreground">{stats.onlineUsers} kullanıcı şu anda çevrimiçi</div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </main>
      <ForumFooter />
    </div>
  )
}
