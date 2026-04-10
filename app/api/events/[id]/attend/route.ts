import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: { id: string } }

export async function POST(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const eventId = params.id
  const userId = session.user.id

  try {
    await prisma.$transaction(async (tx) => {
      await tx.eventAttendee.create({ data: { eventId, userId } })
      await tx.event.update({ where: { id: eventId }, data: { attendeeCount: { increment: 1 } } })
    })
  } catch {
    // already attending (unique constraint) or event not found
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const eventId = params.id
  const userId = session.user.id

  const deleted = await prisma.eventAttendee.deleteMany({
    where: { eventId, userId },
  })

  if (deleted.count > 0) {
    await prisma.event.update({
      where: { id: eventId },
      data: { attendeeCount: { decrement: 1 } },
    })
  }

  return NextResponse.json({ success: true })
}

