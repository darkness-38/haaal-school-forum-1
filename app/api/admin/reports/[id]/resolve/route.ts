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
  const report = await prisma.report.update({
    where: { id: params.id },
    data: {
      status: "RESOLVED",
      assignedAdminId: session.user.id,
      resolutionNote: body.note ?? "Çözüldü",
      resolvedAt: new Date(),
    },
  })
  await prisma.moderationAction.create({
    data: {
      adminId: session.user.id,
      entityType: "REPORT",
      entityId: params.id,
      action: "RESOLVE_REPORT",
      meta: { note: body.note ?? null },
    },
  })
  return NextResponse.json(report)
}

