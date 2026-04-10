import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"

export default function RegisterClosedPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6 flex items-center justify-center">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Kayıt Olma Kapalı</CardTitle>
            <CardDescription>
              Bu sistemde yeni kullanıcı oluşturma kapalıdır. Sadece tanımlı öğrenci ve öğretmen hesapları giriş yapabilir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Hesap bilgilerinizi okul yönetimi veya sistem yöneticinizden alabilirsiniz.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/login">Giriş Sayfasına Dön</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
      <ForumFooter />
    </div>
  )
}

