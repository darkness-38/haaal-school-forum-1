"use client"

import { useEffect, useState } from "react"
import RelatedThreads from "@/components/related-threads"
import ThreadPoll from "@/components/thread-poll"

export default function ThreadClientPage({ threadId }: { threadId: string }) {
  const [thread, setThread] = useState<any | null>(null)

  useEffect(() => {
    fetch(`/api/threads/${threadId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setThread(d))
      .catch(() => setThread(null))
  }, [threadId])

  if (!thread) return null

  return (
    <div className="space-y-4">
      <ThreadPoll threadId={threadId} />
      <RelatedThreads threadId={threadId} categoryId={thread.categoryId} />
    </div>
  )
}

