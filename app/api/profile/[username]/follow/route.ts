import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: { username: string } }

export async function POST(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const target = await prisma.user.findUnique({ where: { username: params.username }, select: { id: true } })
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (target.id === session.user.id) return NextResponse.json({ error: "Cannot follow self" }, { status: 400 })
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: session.user.id, followingId: target.id } },
    create: { followerId: session.user.id, followingId: target.id },
    update: {},
  })
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const target = await prisma.user.findUnique({ where: { username: params.username }, select: { id: true } })
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 })
  await prisma.follow.deleteMany({
    where: { followerId: session.user.id, followingId: target.id },
  })
  return NextResponse.json({ success: true })
}

