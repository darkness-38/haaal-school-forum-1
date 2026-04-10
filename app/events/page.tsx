"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, Search } from "lucide-react"
import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"
import { useSession } from "next-auth/react"

type EventItem = {
  id: string
  title: string
  description: string
  date: string
  location: string
  attendeeCount: number
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [q, setQ] = useState("")
  const router = useRouter()
  const { status } = useSession()

  const loadEvents = () => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data ?? []))
      .catch(() => {})
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const filtered = events.filter((e) => e.title.toLowerCase().includes(q.toLowerCase()) || e.description.toLowerCase().includes(q.toLowerCase()))

  const onAttend = async (id: string) => {
    if (status !== "authenticated") {
      router.push("/login")
      return
    }
    await fetch(`/api/events/${id}/attend`, { method: "POST" })
    loadEvents()
  }

  return (
    <div className="min-h-screen flex flex-col animated-bg">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid gap-6">
          <section className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight gradient-heading">Etkinlikler</h1>
                <p className="text-muted-foreground">Yaklaşan okul etkinlikleri ve aktiviteleri</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input placeholder="Etkinliklerde ara..." className="pr-10 w-[300px] gradient-border" value={q} onChange={(e) => setQ(e.target.value)} />
                  <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">Liste</TabsTrigger>
              </TabsList>
              <TabsContent value="grid" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((event) => (
                    <Card key={event.id} className="animated-card overflow-hidden group">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="font-medium text-lg">{event.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">{event.description}</div>
                          <div className="flex flex-col space-y-1.5 text-sm">
                            <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /><span>{new Date(event.date).toLocaleDateString("tr-TR")}</span></div>
                            <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" /><span>{new Date(event.date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span></div>
                            <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><span>{event.location}</span></div>
                            <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-muted-foreground" /><span>{event.attendeeCount} katılımcı</span></div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button size="sm" className="w-full animated-button" onClick={() => onAttend(event.id)}>Katıl</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="list" className="space-y-4">
                {filtered.map((event) => (
                  <Card key={event.id} className="animated-card">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-medium">{event.title}</h3>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        </div>
                        <Button size="sm" className="animated-button" onClick={() => onAttend(event.id)}>Katıl</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
      <ForumFooter />
    </div>
  )
}

