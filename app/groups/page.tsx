"use client"

import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Users, Search, Lock, Globe, UserPlus, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"

export default function GroupsPage() {
  const { data: session } = useSession()
  const [groups, setGroups] = useState<any[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setGroups(Array.isArray(d) ? d : []))
      .catch(() => setGroups([]))
  }, [])

  const filtered = useMemo(
    () => groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase())),
    [groups, search],
  )
  const myGroups = useMemo(
    () => filtered.filter((g) => g.members?.some((m: any) => m.userId === session?.user?.id)),
    [filtered, session?.user?.id],
  )
  const featuredGroups = useMemo(() => [...filtered].sort((a, b) => b.memberCount - a.memberCount).slice(0, 9), [filtered])
  const suggestedGroups = useMemo(() => filtered.filter((g) => !myGroups.find((m) => m.id === g.id)), [filtered, myGroups])

  return (
    <div className="min-h-screen flex flex-col">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-heading">Gruplar</h1>
            <p className="text-muted-foreground">Ortak ilgi alanlarına sahip kişilerle bağlantı kurun ve tartışın</p>
          </div>
          <div className="flex gap-2">
            <Link href="/chat/group">
              <Button className="animated-button">
                <Users className="mr-2 h-4 w-4" />
                Yeni Grup Oluştur
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Grup ara..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Tabs defaultValue="featured" className="mb-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="featured" className="flex-1 md:flex-none">
              <Globe className="mr-2 h-4 w-4" />
              Öne Çıkan
            </TabsTrigger>
            <TabsTrigger value="my-groups" className="flex-1 md:flex-none">
              <Users className="mr-2 h-4 w-4" />
              Gruplarım
            </TabsTrigger>
            <TabsTrigger value="suggested" className="flex-1 md:flex-none">
              <UserPlus className="mr-2 h-4 w-4" />
              Önerilen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-groups" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myGroups.map((group) => (
                <GroupCard key={group.id} group={group} isMember />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggested" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestedGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <ForumFooter />
    </div>
  )
}

interface GroupCardProps {
  group: any
  isMember?: boolean
}

function GroupCard({ group, isMember = false }: GroupCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {group.name}
                {Boolean(group.isPrivate) && <Lock className="h-4 w-4 text-muted-foreground" />}
              </CardTitle>
              <CardDescription className="line-clamp-1">{group.description}</CardDescription>
            </div>
          </div>
          {group.unreadCount > 0 ? (
            <Badge variant="secondary" className="ml-2 pulse">
              {group.unreadCount}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            <span>{group.memberCount} üye</span>
          </div>
          <div className="flex items-center"><span>Aktif</span></div>
        </div>
      </CardContent>
      <CardFooter>
        {isMember ? (
          <Button variant="default" className="w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Sohbete Git
          </Button>
        ) : (
          <Button variant="outline" className="w-full">
            <UserPlus className="mr-2 h-4 w-4" />
            Katıl
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
