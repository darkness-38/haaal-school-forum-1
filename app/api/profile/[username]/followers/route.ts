import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = { params: { username: string } }

export async function GET(_req: Request, { params }: Params) {
  const target = await prisma.user.findUnique({ where: { username: params.username }, select: { id: true } })
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const followers = await prisma.follow.findMany({
    where: { followingId: target.id },
    include: {
      follower: {
        select: { id: true, username: true, displayName: true, avatar: true, role: true },
      },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(followers.map((f) => f.follower))
}

