"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useEffect, useState } from "react"

export function RelatedThreads({ threadId, categoryId }: { threadId: string; categoryId?: string }) {
  const [relatedThreads, setRelatedThreads] = useState<any[]>([])
  useEffect(() => {
    const query = categoryId ? `?category=${categoryId}&sort=popular&limit=5` : "?sort=popular&limit=5"
    fetch(`/api/threads${query}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setRelatedThreads((d.items ?? []).filter((t: any) => t.id !== threadId).slice(0, 5)))
      .catch(() => setRelatedThreads([]))
  }, [threadId, categoryId])

  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">İlgili Konular</h3>
      </CardHeader>
      <CardContent className="space-y-3">
        {relatedThreads.map((thread) => (
          <div key={thread.id} className="space-y-1">
            <Link href={`/thread/${thread.id}`} className="text-sm font-medium hover:underline line-clamp-1">
              {thread.title}
            </Link>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{thread.category.name}</span>
              <span>{thread.replyCount} cevap</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Default export for backward compatibility
export default RelatedThreads
