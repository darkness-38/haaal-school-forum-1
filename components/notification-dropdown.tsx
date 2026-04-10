"use client"

import { Bell } from "lucide-react"
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
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        if (mounted) setNotifications(Array.isArray(d) ? d : [])
      })
      .catch(() => {
        if (mounted) setNotifications([])
      })
    return () => {
      mounted = false
    }
  }, [])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  return (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
                  {unreadCount}
                </Badge>
                <span className="sr-only">Bildirimler</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Bildirimler</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Bildirimler</span>
          <Link href="/notifications" className="text-xs text-muted-foreground hover:underline">
            Tümünü Görüntüle
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="max-h-[300px] overflow-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} asChild>
                <Link href={notification.link} className="cursor-pointer">
                  <div className={`w-full p-1 ${notification.read ? "" : "font-medium"}`}>
                    <div className="flex justify-between items-start">
                      <p className="text-sm">{notification.title}</p>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: tr })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">Bildiriminiz bulunmamaktadır</div>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications/settings" className="cursor-pointer justify-center text-xs">
            Bildirim Ayarları
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
