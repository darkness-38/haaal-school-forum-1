import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

const schema = z.object({
  targetType: z.enum(["THREAD", "REPLY", "RESOURCE", "USER"]),
  targetId: z.string().min(1),
  reasonCode: z.string().optional(),
  reasonText: z.string().min(3),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 })

  const created = await prisma.report.create({
    data: {
      ...parsed.data,
      reporterId: session.user.id,
      status: "OPEN",
    },
  })
  return NextResponse.json(created, { status: 201 })
}

