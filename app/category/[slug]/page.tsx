import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle } from "lucide-react"
import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"
import RecentThreadCard from "@/components/recent-thread-card"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale/tr"

function roleLabel(role: string) {
  if (role === "ADMIN") return "Admin"
  if (role === "TEACHER") return "Öğretmen"
  if (role === "STAFF") return "Personel"
  return "Öğrenci"
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } })
  if (!category) return notFound()

  const [recent, popular, unanswered] = await Promise.all([
    prisma.thread.findMany({
      where: { categoryId: category.id },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      include: { author: true, _count: { select: { replies: true } } },
    }),
    prisma.thread.findMany({
      where: { categoryId: category.id },
      orderBy: [{ views: "desc" }, { createdAt: "desc" }],
      include: { author: true, _count: { select: { replies: true } } },
    }),
    prisma.thread.findMany({
      where: { categoryId: category.id, replyCount: 0 },
      orderBy: { createdAt: "desc" },
      include: { author: true, _count: { select: { replies: true } } },
    }),
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted p-2 rounded-lg"><MessageCircle className="h-6 w-6" /></div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder={`${category.name.toLowerCase()} içinde ara...`} className="max-w-[300px]" />
                <Link href="/new-thread">
                  <Button>Yeni Konu</Button>
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Link href="/" className="text-sm text-muted-foreground hover:underline">
                Ana Sayfa
              </Link>
              <span className="text-sm text-muted-foreground">/</span>
              <Link href="/categories" className="text-sm text-muted-foreground hover:underline">
                Kategoriler
              </Link>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm">{category.name}</span>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>{category.name} içindeki konular</CardTitle>
                <CardDescription>Bu kategoride {category.threadCount} konu</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="recent" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="recent">Yeni</TabsTrigger>
                    <TabsTrigger value="popular">Popüler</TabsTrigger>
                    <TabsTrigger value="unanswered">Cevaplanmamış</TabsTrigger>
                  </TabsList>
                  <TabsContent value="recent" className="space-y-4">
                    {recent.map((thread) => (
                      <RecentThreadCard
                        key={thread.id}
                        title={thread.title}
                        author={thread.author.displayName}
                        authorUsername={thread.author.username}
                        authorRole={roleLabel(thread.author.role)}
                        category={category.name}
                        categorySlug={category.slug}
                        replies={thread._count.replies}
                        views={thread.views}
                        timestamp={formatDistanceToNow(thread.createdAt, { addSuffix: true, locale: tr })}
                        id={thread.id}
                        tags={thread.tags}
                        isPinned={thread.isPinned}
                        authorAvatar={thread.author.avatar}
                      />
                    ))}
                  </TabsContent>
                  <TabsContent value="popular" className="space-y-4">
                    {popular.map((thread) => (
                        <RecentThreadCard
                          key={thread.id}
                          title={thread.title}
                          author={thread.author.displayName}
                          authorUsername={thread.author.username}
                          authorRole={roleLabel(thread.author.role)}
                          category={category.name}
                          categorySlug={category.slug}
                          replies={thread._count.replies}
                          views={thread.views}
                          timestamp={formatDistanceToNow(thread.createdAt, { addSuffix: true, locale: tr })}
                          id={thread.id}
                          tags={thread.tags}
                          isPinned={thread.isPinned}
                          authorAvatar={thread.author.avatar}
                        />
                      ))}
                  </TabsContent>
                  <TabsContent value="unanswered" className="space-y-4">
                    {unanswered.map((thread) => (
                        <RecentThreadCard
                          key={thread.id}
                          title={thread.title}
                          author={thread.author.displayName}
                          authorUsername={thread.author.username}
                          authorRole={roleLabel(thread.author.role)}
                          category={category.name}
                          categorySlug={category.slug}
                          replies={thread._count.replies}
                          views={thread.views}
                          timestamp={formatDistanceToNow(thread.createdAt, { addSuffix: true, locale: tr })}
                          id={thread.id}
                          tags={thread.tags}
                          isPinned={thread.isPinned}
                          authorAvatar={thread.author.avatar}
                        />
                      ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {recent.length} konudan {recent.length} tanesi gösteriliyor
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Önceki
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Sonraki
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </section>
        </div>
      </main>
      <ForumFooter />
    </div>
  )
}
