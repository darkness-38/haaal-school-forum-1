"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"

export default function CreateGroupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const onCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    const res = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "GROUP", name, description }),
    })
    setLoading(false)
    if (res.ok) router.push("/chat")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="max-w-xl mx-auto">
          <CardHeader><CardTitle>Yeni Grup Oluştur</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Grup adı" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Açıklama" value={description} onChange={(e) => setDescription(e.target.value)} />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/chat")}>İptal</Button>
            <Button onClick={onCreate} disabled={loading}>{loading ? "Oluşturuluyor..." : "Grup Oluştur"}</Button>
          </CardFooter>
        </Card>
      </main>
      <ForumFooter />
    </div>
  )
}

