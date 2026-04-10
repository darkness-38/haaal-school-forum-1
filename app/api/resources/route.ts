import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const createSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(2),
  url: z.string().url().optional(),
  fileUrl: z.string().url().optional(),
  categoryId: z.string().optional(),
  type: z.enum(["DOCUMENT", "VIDEO", "SPREADSHEET", "IMAGE", "LINK"]).optional(),
  tags: z.array(z.string()).optional().default([]),
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const sort = searchParams.get("sort") ?? "recent"
  const type = searchParams.get("type") ?? undefined

  const where: any = {
    status: "APPROVED",
    ...(type && type !== "all" ? { type } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const orderBy =
    sort === "popular"
      ? [{ downloadCount: "desc" as const }, { createdAt: "desc" as const }]
      : sort === "top-rated"
        ? [{ createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }]

  const items = await prisma.resource.findMany({
    where,
    orderBy,
    include: {
      uploader: { select: { id: true, username: true, displayName: true, avatar: true } },
      category: true,
      tags: { include: { tag: true } },
      reactions: true,
    },
  })

  return NextResponse.json(
    items.map((r) => ({
      ...r,
      rating: r.reactions.length
        ? Number((r.reactions.reduce((a, b) => a + b.value, 0) / r.reactions.length).toFixed(1))
        : 0,
      tags: r.tags.map((t) => t.tag.name),
      author: r.uploader,
    })),
  )
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })

  const { tags, ...data } = parsed.data
  const created = await prisma.resource.create({
    data: {
      ...data,
      uploaderId: session.user.id,
      status: "PENDING_REVIEW",
      tags: {
        create: await Promise.all(
          tags.map(async (name) => {
            const tag = await prisma.resourceTag.upsert({
              where: { name },
              create: { name },
              update: {},
            })
            return { tagId: tag.id }
          }),
        ),
      },
    },
  })

  return NextResponse.json(created, { status: 201 })
}

