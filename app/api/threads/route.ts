import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const createThreadSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(1),
  categoryId: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category") ?? undefined
  const sort = (searchParams.get("sort") ?? "new") as "new" | "popular" | "unanswered"
  const q = searchParams.get("q") ?? undefined
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "10") || 10))
  const skip = (page - 1) * limit

  let categoryId: string | undefined
  if (category) {
    const bySlug = await prisma.category.findUnique({ where: { slug: category } })
    categoryId = bySlug?.id ?? category
  }

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { content: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(sort === "unanswered" ? { replyCount: 0 } : {}),
  }

  const orderBy =
    sort === "popular"
      ? [{ isPinned: "desc" as const }, { views: "desc" as const }, { createdAt: "desc" as const }]
      : [{ isPinned: "desc" as const }, { createdAt: "desc" as const }]

  const [items, total] = await Promise.all([
    prisma.thread.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatar: true, role: true, points: true, postCount: true },
        },
        category: true,
        _count: { select: { replies: true } },
      },
    }),
    prisma.thread.count({ where }),
  ])

  return NextResponse.json({ items, page, limit, total })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createThreadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }

  const { title, content, categoryId, tags } = parsed.data

  const created = await prisma.$transaction(async (tx) => {
    const thread = await tx.thread.create({
      data: {
        title,
        content,
        categoryId,
        authorId: session.user.id,
        tags,
      },
      include: { category: true },
    })

    await tx.category.update({
      where: { id: categoryId },
      data: { threadCount: { increment: 1 } },
    })

    await tx.user.update({
      where: { id: session.user.id },
      data: { postCount: { increment: 1 }, points: { increment: 10 } },
    })

    return thread
  })

  return NextResponse.json(created, { status: 201 })
}

