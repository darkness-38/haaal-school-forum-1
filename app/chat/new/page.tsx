"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"

type Member = { id: string; displayName: string; username: string; role: string }

export default function NewChatPage() {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [q, setQ] = useState("")

  useEffect(() => {
    fetch("/api/members?limit=50")
      .then((r) => r.json())
      .then((d) => setMembers(d.items ?? []))
      .catch(() => {})
  }, [])

  const startChat = async (userId: string) => {
    const r = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "DIRECT", participantUserId: userId }),
    })
    const data = await r.json()
    if (data?.id) router.push("/chat")
  }

  const filtered = members.filter((m) => m.displayName.toLowerCase().includes(q.toLowerCase()) || m.username.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className="min-h-screen flex flex-col">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader><CardTitle>Yeni Sohbet Başlat</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Kullanıcı ara..." value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="space-y-2">
              {filtered.map((m) => (
                <div key={m.id} className="flex items-center justify-between border rounded p-2">
                  <div>{m.displayName} <span className="text-xs text-muted-foreground">@{m.username}</span></div>
                  <Button size="sm" onClick={() => startChat(m.id)}>Mesaj Gönder</Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter><Button variant="outline" onClick={() => router.push("/chat")}>Geri</Button></CardFooter>
        </Card>
      </main>
      <ForumFooter />
    </div>
  )
}

