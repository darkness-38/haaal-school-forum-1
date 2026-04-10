import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: Promise<{ id: string }> }

const schema = z.object({
  question: z.string().min(2),
  options: z.array(z.string().min(1)).min(2).max(8),
})

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const poll = await prisma.poll.findFirst({
    where: { threadId: id },
    include: { options: { orderBy: { createdAt: "asc" } } },
  })
  if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 })
  return NextResponse.json(poll)
}

export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => null)

  if (body?.voteOptionId) {
    const optionId = String(body.voteOptionId)
    const option = await prisma.pollOption.findUnique({ where: { id: optionId } })
    if (!option) return NextResponse.json({ error: "Option not found" }, { status: 404 })
    await prisma.$transaction(async (tx) => {
      await tx.pollVote.upsert({
        where: { pollId_userId: { pollId: option.pollId, userId: session.user.id } },
        create: { pollId: option.pollId, optionId, userId: session.user.id },
        update: { optionId },
      })
      const counts = await tx.pollVote.groupBy({ by: ["optionId"], where: { pollId: option.pollId }, _count: true })
      await Promise.all(
        counts.map((c) => tx.pollOption.update({ where: { id: c.optionId }, data: { votes: c._count } })),
      )
    })
    return NextResponse.json({ success: true })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })
  const poll = await prisma.poll.create({
    data: {
      threadId: id,
      question: parsed.data.question,
      options: { create: parsed.data.options.map((text) => ({ text })) },
    },
    include: { options: true },
  })
  return NextResponse.json(poll, { status: 201 })
}

