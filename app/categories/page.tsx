import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BookOpen, MessageCircle, TrendingUp, Users, Bell, Calendar, Award, Search } from "lucide-react"
import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"
import { prisma } from "@/lib/prisma"

const iconMap: Record<string, any> = {
  MessageSquare: MessageCircle,
  BookOpen,
  Users,
  Calendar,
  Bell,
  TrendingUp,
  Award,
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { threadCount: "desc" },
  })

  return (
    <div className="min-h-screen flex flex-col animated-bg">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight gradient-heading">Kategoriler</h1>
                <p className="text-muted-foreground">Tüm forum kategorilerini keşfedin</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input placeholder="Kategorilerde ara..." className="pr-10 w-[300px] gradient-border" />
                  <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Ara</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const Icon = iconMap[category.icon] ?? MessageCircle
                return (
                <Link href={`/category/${category.slug}`} key={category.id}>
                  <Card className="animated-card h-full hover:shadow-md transition-all duration-300 cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="p-2 rounded-md" style={{ backgroundColor: `${category.color}22`, color: category.color }}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-sm text-muted-foreground">{category.threadCount} konu</div>
                      </div>
                      <CardTitle className="mt-2">{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Son aktivite:</span>
                        <span>2 saat önce</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <Button variant="ghost" className="w-full hover:bg-primary/10 transition-colors duration-300">
                        Kategoriyi Görüntüle
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              )})}
            </div>
          </section>
        </div>
      </main>
      <ForumFooter />
    </div>
  )
}
