import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sort = (searchParams.get("sort") ?? "points") as "points" | "posts" | "newest"
  const q = searchParams.get("q") ?? undefined
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20") || 20))
  const skip = (page - 1) * limit

  const where = q
    ? {
        OR: [
          { displayName: { contains: q, mode: "insensitive" as const } },
          { username: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {}

  const orderBy =
    sort === "posts"
      ? { postCount: "desc" as const }
      : sort === "newest"
        ? { createdAt: "desc" as const }
        : { points: "desc" as const }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
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
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ items, page, limit, total })
}

