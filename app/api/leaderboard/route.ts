import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { points: "desc" },
    take: 20,
    select: {
      id: true,
      username: true,
      displayName: true,
      role: true,
      avatar: true,
      points: true,
      postCount: true,
    },
  })

  return NextResponse.json(users)
}

