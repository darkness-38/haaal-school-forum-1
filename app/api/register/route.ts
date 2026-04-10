import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Yeni kayıt kapalı. Lütfen yöneticiden tanımlı kullanıcı bilgisi alın." },
    { status: 403 },
  )
}

