"use client"

import { useState } from "react"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"

export default function UserCalendar({ username }: { username: string }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activityDates, setActivityDates] = useState<Date[]>([])
  const [dailyStats, setDailyStats] = useState<Record<string, { threads: number; replies: number }>>({})

  useEffect(() => {
    fetch(`/api/profile/${username}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        const map: Record<string, { threads: number; replies: number }> = {}
        ;(data.recentThreads ?? []).forEach((t: any) => {
          const key = new Date(t.createdAt).toDateString()
          map[key] = map[key] ?? { threads: 0, replies: 0 }
          map[key].threads += 1
        })
        ;(data.recentReplies ?? []).forEach((r: any) => {
          const key = new Date(r.createdAt).toDateString()
          map[key] = map[key] ?? { threads: 0, replies: 0 }
          map[key].replies += 1
        })
        setDailyStats(map)
        setActivityDates(Object.keys(map).map((k) => new Date(k)))
      })
      .catch(() => {
        setDailyStats({})
        setActivityDates([])
      })
  }, [username])

  const hasActivity = (date: Date) => {
    return activityDates.some(
      (activityDate) =>
        activityDate.getDate() === date.getDate() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getFullYear() === date.getFullYear(),
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Aktivite Takvimi</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{
            activity: activityDates,
          }}
          modifiersClassNames={{
            activity: "activity-day",
          }}
        />

        {date && hasActivity(date) && (
          <div className="mt-4 p-3 border rounded-md">
            <h4 className="text-sm font-medium mb-2">
              {date.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Yeni konu</span>
                <Badge variant="outline" className="text-xs">
                  {dailyStats[date.toDateString()]?.threads ?? 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Cevap</span>
                <Badge variant="outline" className="text-xs">
                  {dailyStats[date.toDateString()]?.replies ?? 0}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
