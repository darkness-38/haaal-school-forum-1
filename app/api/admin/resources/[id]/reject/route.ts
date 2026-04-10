import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: { id: string } }

export async function POST(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const body = await req.json().catch(() => ({}))
  const item = await prisma.resource.update({
    where: { id: params.id },
    data: { status: "REJECTED", rejectionReason: body.reason ?? "Uygun değil" },
  })
  return NextResponse.json(item)
}

