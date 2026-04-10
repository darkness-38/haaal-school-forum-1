import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: { id: string } }

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  if (!body.status) return NextResponse.json({ error: "status gerekli" }, { status: 400 })
  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { status: body.status },
    select: { id: true, username: true, displayName: true, status: true },
  })
  return NextResponse.json(updated)
}

