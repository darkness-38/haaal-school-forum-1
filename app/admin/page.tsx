"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])

  const refresh = async () => {
    const [d, u, r] = await Promise.all([
      fetch("/api/admin/dashboard").then((x) => (x.ok ? x.json() : null)),
      fetch("/api/members?limit=20").then((x) => (x.ok ? x.json() : { items: [] })),
      fetch("/api/admin/resources").then((x) => (x.ok ? x.json() : [])),
    ])
    setData(d)
    setUsers(u.items ?? [])
    setResources(Array.isArray(r) ? r : [])
  }

  useEffect(() => {
    refresh().catch(() => null)
  }, [])

  const updateUserStatus = async (userId: string, status: string) => {
    await fetch(`/api/admin/users/${userId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    await refresh()
  }

  const updateThreadStatus = async (threadId: string, status: string) => {
    await fetch(`/api/admin/threads/${threadId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    await refresh()
  }

  const resolveReport = async (reportId: string, action: "resolve" | "reject") => {
    await fetch(`/api/admin/reports/${reportId}/${action}`, { method: "POST" })
    await refresh()
  }

  if (!data) return null

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader><CardTitle>Toplam Kullanıcı</CardTitle></CardHeader><CardContent>{data.metrics.users}</CardContent></Card>
        <Card><CardHeader><CardTitle>Toplam Konu</CardTitle></CardHeader><CardContent>{data.metrics.threads}</CardContent></Card>
        <Card><CardHeader><CardTitle>Aktif Kullanıcı</CardTitle></CardHeader><CardContent>{data.metrics.activeUsers}</CardContent></Card>
        <Card><CardHeader><CardTitle>Bekleyen Şikayet</CardTitle></CardHeader><CardContent>{data.metrics.pendingReports}</CardContent></Card>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Raporlar</TabsTrigger>
          <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
          <TabsTrigger value="threads">Konular</TabsTrigger>
          <TabsTrigger value="resources">Kaynaklar</TabsTrigger>
        </TabsList>
        <TabsContent value="reports" className="space-y-3">
          {data.reports.map((r: any) => (
            <Card key={r.id}><CardContent className="py-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.reasonText}</div>
                <div className="text-xs text-muted-foreground">{r.targetType} - {r.reporter?.displayName}</div>
              </div>
              <div className="flex gap-2 items-center">
                <Badge>{r.status}</Badge>
                <Button size="sm" onClick={() => resolveReport(r.id, "resolve")}>Çöz</Button>
                <Button size="sm" variant="outline" onClick={() => resolveReport(r.id, "reject")}>Reddet</Button>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="users" className="space-y-3">
          {users.map((u) => (
            <Card key={u.id}><CardContent className="py-4 flex items-center justify-between">
              <div>{u.displayName} @{u.username}</div>
              <div className="flex gap-2">
                <Badge>{u.role}</Badge>
                <Button size="sm" variant="outline" onClick={() => updateUserStatus(u.id, "SUSPENDED")}>Askıya Al</Button>
                <Button size="sm" onClick={() => updateUserStatus(u.id, "ACTIVE")}>Aktif Et</Button>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="threads" className="space-y-3">
          {data.latestThreads.map((t: any) => (
            <Card key={t.id}><CardContent className="py-4 flex items-center justify-between">
              <div className="cursor-pointer" onClick={() => router.push(`/thread/${t.id}`)}>{t.title}</div>
              <div className="flex gap-2">
                <Badge>{t.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => updateThreadStatus(t.id, "HIDDEN")}>Gizle</Button>
                <Button size="sm" onClick={() => updateThreadStatus(t.id, "PUBLISHED")}>Yayınla</Button>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="resources" className="space-y-3">
          {resources.map((res) => (
            <Card key={res.id}><CardContent className="py-4 flex items-center justify-between">
              <div>{res.title}</div>
              <div className="flex gap-2">
                <Badge>{res.status}</Badge>
                <Button size="sm" onClick={() => fetch(`/api/admin/resources/${res.id}/approve`, { method: "POST" }).then(refresh)}>Onayla</Button>
                <Button size="sm" variant="outline" onClick={() => fetch(`/api/admin/resources/${res.id}/reject`, { method: "POST" }).then(refresh)}>Reddet</Button>
              </div>
            </CardContent></Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

