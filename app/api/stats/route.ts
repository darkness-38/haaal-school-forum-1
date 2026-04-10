import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const [totalThreads, totalReplies, totalUsers, onlineUsers, todayThreads, todayReplies, newestMember] =
    await Promise.all([
      prisma.thread.count(),
      prisma.reply.count(),
      prisma.user.count(),
      prisma.user.count({ where: { isOnline: true } }),
      prisma.thread.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.reply.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.user.findFirst({
        orderBy: { createdAt: "desc" },
        select: { displayName: true, username: true },
      }),
    ])

  return NextResponse.json({
    totalThreads,
    totalReplies,
    totalUsers,
    onlineUsers,
    todayPosts: todayThreads + todayReplies,
    newestMember,
  })
}

