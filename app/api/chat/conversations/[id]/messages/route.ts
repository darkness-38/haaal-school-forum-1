import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

type Params = { params: { id: string } }

const createSchema = z.object({
  content: z.string().min(1),
})

export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const exists = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: params.id, userId: session.user.id } },
  })
  if (!exists) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const messages = await prisma.message.findMany({
    where: { conversationId: params.id },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, username: true, displayName: true, avatar: true } } },
  })

  return NextResponse.json(messages)
}

export async function POST(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const exists = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId: params.id, userId: session.user.id } },
  })
  if (!exists) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })

  const message = await prisma.message.create({
    data: { conversationId: params.id, senderId: session.user.id, content: parsed.data.content },
    include: { sender: { select: { id: true, username: true, displayName: true, avatar: true } } },
  })

  await prisma.conversation.update({
    where: { id: params.id },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json(message, { status: 201 })
}

