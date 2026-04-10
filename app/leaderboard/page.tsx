import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export default async function LeaderboardPage() {
  const users = await prisma.user.findMany({
    orderBy: { points: "desc" },
    take: 20,
    select: { id: true, displayName: true, username: true, points: true, postCount: true },
  })

  return (
    <div className="min-h-screen flex flex-col animated-bg">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Card>
          <CardHeader><CardTitle>Leaderboard</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {users.map((u, idx) => (
              <div key={u.id} className="flex justify-between border rounded p-2">
                <div>#{idx + 1} {u.displayName} (@{u.username})</div>
                <div>{u.points} puan</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
      <ForumFooter />
    </div>
  )
}

