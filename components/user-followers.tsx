"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UserFollowers({ username }: { username: string }) {
  const [followers, setFollowers] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/profile/${username}/followers`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setFollowers(Array.isArray(d) ? d : []))
      .catch(() => setFollowers([]))
  }, [username])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Takipçiler</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {followers.map((follower) => (
          <div key={follower.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={follower.avatar || "/placeholder.svg"} alt={follower.name} />
                <AvatarFallback>
                  {follower.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/profile/${follower.username}`} className="text-sm font-medium hover:underline">
                  {follower.name}
                </Link>
                <p className="text-xs text-muted-foreground">{follower.role}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetch(`/api/profile/${follower.username}/follow`, { method: "POST" })}>
              Takip
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
