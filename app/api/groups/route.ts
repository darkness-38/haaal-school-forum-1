import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const createGroupSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(1),
  icon: z.string().optional(),
})

export async function GET() {
  const groups = await prisma.group.findMany({
    orderBy: { memberCount: "desc" },
    include: { members: true },
  })

  return NextResponse.json(groups)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!["TEACHER", "ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createGroupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }

  const created = await prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        ...parsed.data,
        memberCount: 1,
        members: {
          create: [{ userId: session.user.id }],
        },
      },
    })

    const conversation = await tx.conversation.create({
      data: {
        type: "GROUP",
        groupId: group.id,
        participants: {
          create: [{ userId: session.user.id }],
        },
      },
    })

    return { group, conversationId: conversation.id }
  })

  return NextResponse.json(created, { status: 201 })
}

