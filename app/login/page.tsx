"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"

type LoginType = "student" | "teacher" | null

export default function LoginPage() {
  const [loginType, setLoginType] = useState<LoginType>(null)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginType) return
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      identifier,
      password,
      loginType,
      redirect: false,
    })

    setLoading(false)
    if (result?.ok) router.push("/")
    else setError("Kullanıcı adı veya şifre hatalı")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6 flex items-center justify-center">
        {!loginType ? (
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl w-full">
            <Card className="cursor-pointer" onClick={() => setLoginType("student")}>
              <CardHeader><CardTitle>🎒 ÖĞRENCİYİM</CardTitle><CardDescription>Kullanıcı adı ile giriş yap</CardDescription></CardHeader>
            </Card>
            <Card className="cursor-pointer" onClick={() => setLoginType("teacher")}>
              <CardHeader><CardTitle>👨‍🏫 ÖĞRETMENİM</CardTitle><CardDescription>Kullanıcı adı ile giriş yap</CardDescription></CardHeader>
            </Card>
          </div>
        ) : (
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{loginType === "student" ? "Öğrenci Girişi" : "Öğretmen Girişi"}</CardTitle>
            </CardHeader>
            <form onSubmit={onSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Kullanıcı Adı</Label>
                  <Input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Şifre</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error ? <p className="text-sm text-red-500">{error}</p> : null}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => { setLoginType(null); setIdentifier(""); setPassword(""); setError("") }}>
                  Geri
                </Button>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </CardFooter>
            </form>
            <CardFooter>
              <div className="text-sm">Yeni hesap açma kapalı. Sistemde tanımlı hesabınla giriş yap.</div>
            </CardFooter>
          </Card>
        )}
      </main>
      <ForumFooter />
    </div>
  )
}

