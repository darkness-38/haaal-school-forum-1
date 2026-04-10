import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") return forbidden()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const items = await prisma.report.findMany({
    where: status && status !== "all" ? { status: status as any } : {},
    orderBy: { createdAt: "desc" },
    include: {
      reporter: { select: { id: true, username: true, displayName: true } },
      assignedAdmin: { select: { id: true, username: true, displayName: true } },
    },
  })
  return NextResponse.json(items)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") return forbidden()
  const body = await req.json().catch(() => ({}))
  if (!body.id) return NextResponse.json({ error: "id gerekli" }, { status: 400 })
  const updated = await prisma.report.update({
    where: { id: body.id },
    data: {
      status: body.status ?? undefined,
      assignedAdminId: session.user.id,
      resolutionNote: body.resolutionNote ?? undefined,
    },
  })
  return NextResponse.json(updated)
}

