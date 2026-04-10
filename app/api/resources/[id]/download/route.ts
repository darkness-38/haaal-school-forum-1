import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

type Params = { params: { id: string } }

export async function POST(req: Request, { params }: Params) {
  const session = await auth()
  const resource = await prisma.resource.findUnique({ where: { id: params.id } })
  if (!resource) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const ipHash = req.headers.get("x-forwarded-for") ?? "unknown"
  await prisma.$transaction([
    prisma.resourceDownload.create({
      data: { resourceId: params.id, userId: session?.user?.id ?? null, ipHash },
    }),
    prisma.resource.update({
      where: { id: params.id },
      data: { downloadCount: { increment: 1 }, viewCount: { increment: 1 } },
    }),
  ])

  return NextResponse.json({ success: true })
}

