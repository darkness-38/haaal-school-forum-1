"use client"

import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export default function MessagesDropdown() {
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    fetch("/api/chat/conversations")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (!mounted) return
        const rows = Array.isArray(d) ? d : []
        setMessages(
          rows.map((conv: any) => {
            const last = conv.messages?.[0]
            const other = conv.participants?.[0]?.user
            return {
              id: conv.id,
              sender: other?.displayName ?? (conv.type === "GROUP" ? conv.group?.name ?? "Grup" : "Sohbet"),
              avatar: other?.avatar ?? "/placeholder.svg",
              message: last?.content ?? "Henüz mesaj yok",
              createdAt: last?.createdAt ?? conv.updatedAt,
              read: false,
            }
          }),
        )
      })
      .catch(() => {
        if (mounted) setMessages([])
      })
    return () => {
      mounted = false
    }
  }, [])

  const unreadCount = useMemo(() => messages.filter((m) => !m.read).length, [messages])

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                  {unreadCount}
                </Badge>
                <span className="sr-only">Mesajlar</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mesajlar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Mesajlar</span>
          <Link href="/messages" className="text-xs text-muted-foreground hover:underline">
            Tümünü Görüntüle
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-auto">
          {messages.length > 0 ? (
            messages.map((message) => (
              <DropdownMenuItem key={message.id} asChild>
                <Link href={`/messages/${message.id}`} className="cursor-pointer">
                  <div className="w-full p-1">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.avatar || "/placeholder.svg"} alt={message.sender} />
                        <AvatarFallback>
                          {message.sender
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                            .substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm ${message.read ? "" : "font-medium"}`}>{message.sender}</p>
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: tr })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{message.message}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">Mesajınız bulunmamaktadır</div>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/messages/new" className="cursor-pointer justify-center text-xs">
            Yeni Mesaj
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
