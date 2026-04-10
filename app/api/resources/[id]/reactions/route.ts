import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: { id: string } }

export async function POST(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const value = typeof body.value === "number" ? body.value : 1

  await prisma.resourceReaction.upsert({
    where: { resourceId_userId: { resourceId: params.id, userId: session.user.id } },
    create: { resourceId: params.id, userId: session.user.id, value },
    update: { value },
  })
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await prisma.resourceReaction.deleteMany({
    where: { resourceId: params.id, userId: session.user.id },
  })
  return NextResponse.json({ success: true })
}

