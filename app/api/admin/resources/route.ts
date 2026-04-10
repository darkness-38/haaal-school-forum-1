import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const items = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      uploader: { select: { id: true, username: true, displayName: true } },
      category: true,
    },
  })
  return NextResponse.json(items)
}

