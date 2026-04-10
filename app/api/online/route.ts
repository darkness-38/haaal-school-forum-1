import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  const offlineThreshold = new Date(now.getTime() - 5 * 60 * 1000)

  await prisma.$transaction([
    prisma.user.updateMany({
      where: { isOnline: true, lastSeen: { lt: offlineThreshold } },
      data: { isOnline: false },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { isOnline: true, lastSeen: now },
    }),
  ])

  return NextResponse.json({ success: true })
}

