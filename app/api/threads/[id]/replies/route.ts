import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: { id: string } }

const createReplySchema = z.object({
  content: z.string().min(1),
})

export async function POST(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createReplySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  }

  const threadId = params.id

  const reply = await prisma.$transaction(async (tx) => {
    const created = await tx.reply.create({
      data: {
        content: parsed.data.content,
        threadId,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatar: true, role: true } },
      },
    })

    await tx.thread.update({
      where: { id: threadId },
      data: { replyCount: { increment: 1 } },
    })

    await tx.user.update({
      where: { id: session.user.id },
      data: { postCount: { increment: 1 }, points: { increment: 5 } },
    })

    return created
  })

  return NextResponse.json(reply, { status: 201 })
}

