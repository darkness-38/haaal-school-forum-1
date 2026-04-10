"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"
import RecentThreadCard from "@/components/recent-thread-card"

export default function ProfilePage() {
  const params = useParams<{ username: string }>()
  const { data: session } = useSession()
  const [data, setData] = useState<any>(null)
  const [bio, setBio] = useState("")

  const load = () => {
    fetch(`/api/profile/${params.username}`).then((r) => r.json()).then((d) => {
      setData(d)
      setBio(d?.user?.bio ?? "")
    }).catch(() => {})
  }
  useEffect(() => { load() }, [params.username])
  if (!data?.user) return <div className="min-h-screen"><ForumHeader /><main className="container py-6">Yükleniyor...</main><ForumFooter /></div>

  const isOwn = session?.user?.username === data.user.username

  const save = async () => {
    await fetch(`/api/profile/${params.username}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    })
    load()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6 space-y-4">
        <Card>
          <CardHeader><CardTitle>{data.user.displayName} (@{data.user.username})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div>Rol: {data.user.role}</div>
            <div>Puan: {data.user.points} • Gönderi: {data.user.postCount}</div>
            {isOwn ? (
              <div className="space-y-2">
                <textarea className="w-full border rounded p-2" value={bio} onChange={(e) => setBio(e.target.value)} />
                <Button onClick={save}>Profili Güncelle</Button>
              </div>
            ) : (
              <p>{data.user.bio ?? "Bio yok"}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Son Konular</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {(data.recentThreads ?? []).map((t: any) => (
              <RecentThreadCard
                key={t.id}
                id={t.id}
                title={t.title}
                author={data.user.displayName}
                authorUsername={data.user.username}
                authorRole={data.user.role}
                category={t.category.name}
                categorySlug={t.category.slug}
                replies={t._count.replies}
                views={t.views}
                timestamp={new Date(t.createdAt).toLocaleDateString("tr-TR")}
                tags={t.tags}
              />
            ))}
          </CardContent>
        </Card>
      </main>
      <ForumFooter />
    </div>
  )
}

