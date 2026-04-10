"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type Category = { id: string; name: string }

export default function NewThreadPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {})
  }, [])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        categoryId,
        content,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      }),
    })
    setLoading(false)
    if (!res.ok) return
    const data = await res.json()
    router.push(`/thread/${data.id}`)
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Button variant="ghost" size="sm" asChild className="mb-6">
        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />Geri Dön</Link>
      </Button>
      <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader><CardTitle>Yeni Gönderi Oluştur</CardTitle></CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Başlık</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Bir kategori seçin" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>İçerik</Label><Textarea className="min-h-[180px]" value={content} onChange={(e) => setContent(e.target.value)} required /></div>
            <div className="space-y-2"><Label>Etiketler (virgülle)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>İptal</Button>
            <Button type="submit" disabled={loading}>{loading ? "Gönderiliyor..." : "Gönderiyi Oluştur"}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

