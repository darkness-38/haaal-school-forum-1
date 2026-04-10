import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: { id: string } }

export async function POST(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const item = await prisma.resource.update({
    where: { id: params.id },
    data: { status: "APPROVED", approvedById: session.user.id, approvedAt: new Date(), rejectionReason: null },
  })
  return NextResponse.json(item)
}

