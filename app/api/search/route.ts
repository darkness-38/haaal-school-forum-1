import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") ?? "").trim()
  const type = (searchParams.get("type") ?? "all") as "threads" | "users" | "all"

  if (!q) {
    return NextResponse.json({ threads: [], users: [] })
  }

  const [threads, users] = await Promise.all([
    type === "users"
      ? Promise.resolve([])
      : prisma.thread.findMany({
          where: {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { content: { contains: q, mode: "insensitive" } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 20,
          include: {
            author: { select: { id: true, username: true, displayName: true, avatar: true, role: true } },
            category: true,
          },
        }),
    type === "threads"
      ? Promise.resolve([])
      : prisma.user.findMany({
          where: {
            OR: [
              { displayName: { contains: q, mode: "insensitive" } },
              { username: { contains: q, mode: "insensitive" } },
            ],
          },
          orderBy: { points: "desc" },
          take: 20,
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true,
            avatar: true,
            points: true,
            postCount: true,
          },
        }),
  ])

  return NextResponse.json({ threads, users })
}

