"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"

type Thread = any

export default function ThreadPage() {
  const params = useParams<{ id: string }>()
  const { status } = useSession()
  const [thread, setThread] = useState<Thread | null>(null)
  const [content, setContent] = useState("")

  const load = () => {
    fetch(`/api/threads/${params.id}`).then((r) => r.json()).then(setThread).catch(() => {})
  }
  useEffect(() => { load() }, [params.id])

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    const res = await fetch(`/api/threads/${params.id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })
    if (res.ok) {
      setContent("")
      load()
    }
  }

  if (!thread) return <div className="min-h-screen"><ForumHeader /><main className="container py-6">Yükleniyor...</main><ForumFooter /></div>

  return (
    <div className="min-h-screen flex flex-col animated-bg">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-4">
        <div className="text-sm text-muted-foreground">
          <Link href="/">Ana Sayfa</Link> / <Link href={`/category/${thread.category.slug}`}>{thread.category.name}</Link> / Konu
        </div>
        <h1 className="text-2xl font-bold gradient-heading">{thread.title}</h1>
        <div className="flex gap-2 flex-wrap">{thread.tags.map((t: string) => <Badge key={t}>#{t}</Badge>)}</div>

        <Card>
          <CardHeader>
            <div className="text-sm text-muted-foreground">
              {thread.author.displayName} • {new Date(thread.createdAt).toLocaleString("tr-TR")}
            </div>
          </CardHeader>
          <CardContent><p className="whitespace-pre-wrap">{thread.content}</p></CardContent>
          <CardFooter className="text-sm text-muted-foreground">Görüntülenme: {thread.views} • Cevap: {thread.replyCount}</CardFooter>
        </Card>

        <div className="space-y-2">
          <h3 className="font-semibold">Cevaplar ({thread.replies?.length ?? 0})</h3>
          {(thread.replies ?? []).map((r: any) => (
            <Card key={r.id}><CardContent className="p-4"><div className="text-xs text-muted-foreground">{r.author.displayName}</div><p>{r.content}</p></CardContent></Card>
          ))}
        </div>

        {status === "authenticated" ? (
          <Card>
            <form onSubmit={sendReply}>
              <CardContent className="p-4"><Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Cevabınızı yazın..." /></CardContent>
              <CardFooter><Button type="submit">Cevap Gönder</Button></CardFooter>
            </form>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">Cevap yazmak için <Link className="underline" href="/login">giriş yap</Link>.</p>
        )}
      </main>
      <ForumFooter />
    </div>
  )
}

