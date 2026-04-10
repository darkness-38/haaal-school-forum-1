"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Users, ArrowUpDown } from "lucide-react"
import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Member = {
  id: string
  username: string
  displayName: string
  role: string
  avatar: string | null
  points: number
  postCount: number
  isOnline: boolean
  createdAt: string
}

function roleLabel(role: string) {
  if (role === "ADMIN") return "Yönetici"
  if (role === "TEACHER") return "Öğretmen"
  if (role === "STAFF") return "Personel"
  return "Öğrenci"
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [q, setQ] = useState("")
  const [sort, setSort] = useState("points")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/members?sort=${sort}&q=${encodeURIComponent(q)}&page=${page}&limit=12`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        setMembers(data.items ?? [])
        setTotal(data.total ?? 0)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [q, sort, page])

  return (
    <div className="min-h-screen flex flex-col animated-bg">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight gradient-heading">Üyeler</h1>
                <p className="text-muted-foreground">Toplam {total} üye</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    placeholder="Üyelerde ara..."
                    className="pr-10 w-[300px] gradient-border"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                    <Search className="h-4 w-4" />
                    <span className="sr-only">Ara</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filtrele</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>Tüm Üyeler</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select defaultValue="points" onValueChange={setSort}>
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Sıralama" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">İtibar Puanı</SelectItem>
                    <SelectItem value="posts">Gönderi Sayısı</SelectItem>
                    <SelectItem value="newest">Katılım Tarihi</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span>Azalan</span>
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>Çevrimiçi: {members.filter((m) => m.isOnline).length}</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <Link href={`/profile/${member.username}`} key={member.id}>
                  <Card className="animated-card h-full hover:shadow-md transition-all duration-300 cursor-pointer">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12 border">
                            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.displayName} />
                            <AvatarFallback>{member.displayName.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          {member.isOnline && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background pulse"></div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">{member.displayName}</div>
                          <div className="text-xs text-muted-foreground">@{member.username}</div>
                          <div className="text-xs text-muted-foreground">{roleLabel(member.role)}</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">{roleLabel(member.role)}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div className="bg-muted/50 p-2 rounded-md">
                            <div className="font-medium">{member.postCount}</div>
                            <div className="text-xs text-muted-foreground">Gönderiler</div>
                          </div>
                          <div className="bg-muted/50 p-2 rounded-md">
                            <div className="font-medium">{member.points}</div>
                            <div className="text-xs text-muted-foreground">İtibar</div>
                          </div>
                          <div className="bg-muted/50 p-2 rounded-md">
                            <div className="font-medium">{new Date(member.createdAt).toLocaleDateString("tr-TR")}</div>
                            <div className="text-xs text-muted-foreground">Katılım</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="flex justify-center mt-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Önceki
                </Button>
                <Button variant="outline" size="sm" className="bg-primary/10">
                  {page}
                </Button>
                <Button variant="outline" size="sm" disabled={members.length < 12} onClick={() => setPage((p) => p + 1)}>
                  Sonraki
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <ForumFooter />
    </div>
  )
}

