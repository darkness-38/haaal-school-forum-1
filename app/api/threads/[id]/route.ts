import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const id = params.id

  const thread = await prisma.$transaction(async (tx) => {
    await tx.thread.update({
      where: { id },
      data: { views: { increment: 1 } },
    })

    return tx.thread.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, displayName: true, avatar: true, role: true } },
        category: true,
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, username: true, displayName: true, avatar: true, role: true } },
          },
        },
      },
    })
  })

  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(thread)
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const id = params.id
  const thread = await prisma.thread.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  })

  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const isOwner = thread.authorId === session.user.id
  const isAdmin = session.user.role === "ADMIN"

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.thread.delete({ where: { id } })

  return NextResponse.json({ success: true })
}

