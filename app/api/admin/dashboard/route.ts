import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [users, threads, activeUsers, pendingReports, latestThreads, reports] = await Promise.all([
    prisma.user.count(),
    prisma.thread.count(),
    prisma.user.count({ where: { isOnline: true } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.thread.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { username: true, displayName: true } }, category: true },
    }),
    prisma.report.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { reporter: { select: { username: true, displayName: true } } },
    }),
  ])

  return NextResponse.json({
    metrics: { users, threads, activeUsers, pendingReports },
    latestThreads,
    reports,
  })
}

