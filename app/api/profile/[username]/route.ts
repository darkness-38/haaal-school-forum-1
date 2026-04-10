import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ username: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      avatar: true,
      bio: true,
      points: true,
      postCount: true,
      isOnline: true,
      lastSeen: true,
      createdAt: true,
    },
  })

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const [recentThreads, recentReplies] = await Promise.all([
    prisma.thread.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true, _count: { select: { replies: true } } },
    }),
    prisma.reply.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { thread: { include: { category: true } } },
    }),
  ])

  return NextResponse.json({
    user,
    recentThreads,
    recentReplies,
  })
}

const patchSchema = z.object({
  displayName: z.string().min(2).optional(),
  bio: z.string().max(500).optional().nullable(),
  avatar: z.string().url().optional().nullable(),
})

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { username } = await params
  if (session.user.username !== username) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })

  const updated = await prisma.user.update({
    where: { username },
    data: parsed.data,
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      avatar: true,
      bio: true,
      points: true,
      postCount: true,
      isOnline: true,
      lastSeen: true,
      createdAt: true,
    },
  })

  return NextResponse.json(updated)
}

