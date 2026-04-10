"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"

type Conversation = { id: string; type: "DIRECT" | "GROUP"; participants: any[]; messages: any[]; group?: { name: string } | null }
type Message = { id: string; content: string; sender: { displayName: string }; createdAt: string }

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState("")

  const loadConversations = () => {
    fetch("/api/chat/conversations")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setConversations(data ?? [])
        if (!activeId && data?.[0]?.id) setActiveId(data[0].id)
      })
      .catch(() => {})
  }

  const loadMessages = (id: string) => {
    fetch(`/api/chat/conversations/${id}/messages`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMessages(data ?? []))
      .catch(() => {})
  }

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (activeId) loadMessages(activeId)
  }, [activeId])

  const send = async () => {
    if (!activeId || !text.trim()) return
    await fetch(`/api/chat/conversations/${activeId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    })
    setText("")
    loadMessages(activeId)
    loadConversations()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card className="h-[calc(100vh-12rem)] grid grid-cols-1 md:grid-cols-4">
          <div className="border-r p-3 space-y-2">
            {conversations.map((c) => (
              <button key={c.id} className={`w-full text-left p-2 rounded ${activeId === c.id ? "bg-muted" : ""}`} onClick={() => setActiveId(c.id)}>
                {c.type === "GROUP" ? c.group?.name ?? "Grup" : c.participants.find((p: any) => p.user)?.user?.displayName ?? "DM"}
              </button>
            ))}
          </div>
          <div className="md:col-span-3 flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {messages.map((m) => (
                  <div key={m.id} className="p-2 rounded bg-muted/50">
                    <div className="text-xs text-muted-foreground">{m.sender?.displayName ?? "Kullanıcı"}</div>
                    <div>{m.content}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-3 border-t flex gap-2">
              <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Mesaj yaz..." />
              <Button onClick={send}>Gönder</Button>
            </div>
          </div>
        </Card>
      </main>
      <ForumFooter />
    </div>
  )
}

