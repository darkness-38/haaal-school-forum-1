import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const createSchema = z.object({
  type: z.enum(["DIRECT", "GROUP"]).default("DIRECT"),
  participantUserId: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: session.user.id } } },
    include: {
      group: true,
      participants: { include: { user: { select: { id: true, username: true, displayName: true, avatar: true } } } },
      messages: { take: 1, orderBy: { createdAt: "desc" } },
    },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(conversations)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })

  if (parsed.data.type === "DIRECT") {
    if (!parsed.data.participantUserId) return NextResponse.json({ error: "participantUserId gerekli" }, { status: 400 })
    const otherId = parsed.data.participantUserId
    const existing = await prisma.conversation.findFirst({
      where: {
        type: "DIRECT",
        participants: {
          every: { userId: { in: [session.user.id, otherId] } },
        },
      },
      include: { participants: true },
    })
    if (existing && existing.participants.length === 2) return NextResponse.json(existing)

    const created = await prisma.conversation.create({
      data: {
        type: "DIRECT",
        participants: {
          create: [{ userId: session.user.id }, { userId: otherId }],
        },
      },
    })
    return NextResponse.json(created, { status: 201 })
  }

  if (!["TEACHER", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const group = await prisma.group.create({
    data: {
      name: parsed.data.name ?? "Yeni Grup",
      description: parsed.data.description ?? "",
      memberCount: 1,
      members: { create: [{ userId: session.user.id }] },
    },
  })
  const created = await prisma.conversation.create({
    data: {
      type: "GROUP",
      groupId: group.id,
      participants: { create: [{ userId: session.user.id }] },
    },
  })
  return NextResponse.json(created, { status: 201 })
}

