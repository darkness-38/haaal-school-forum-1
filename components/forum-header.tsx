"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bell,
  Menu,
  MessageSquare,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Languages,
  Search,
  Home,
  Layers,
  Users,
  Calendar,
  Group,
  FileText,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NotificationDropdown from "@/components/notification-dropdown"
import MessagesDropdown from "@/components/messages-dropdown"
import { useTheme } from "next-themes"
import { toast } from "@/components/ui/use-toast"
import { signOut, useSession } from "next-auth/react"

export default function ForumHeader() {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
    toast({
      title: "Çıkış yapıldı",
      description: "Güvenli bir şekilde çıkış yaptınız.",
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      toast({
        title: "Arama yapılıyor",
        description: `"${searchQuery}" için sonuçlar getiriliyor...`,
      })
      // Gerçek uygulamada burada arama sayfasına yönlendirme yapılabilir
      // router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const navItems = [
    { name: "Ana Sayfa", href: "/", icon: Home },
    { name: "Kategoriler", href: "/categories", icon: Layers },
    { name: "Üyeler", href: "/members", icon: Users },
    { name: "Etkinlikler", href: "/events", icon: Calendar },
    { name: "Gruplar", href: "/groups", icon: Group },
    { name: "Kaynaklar", href: "/resources", icon: FileText },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur transition-all duration-300",
        isScrolled ? "bg-background/95 supports-[backdrop-filter]:bg-background/60 shadow-md" : "bg-background",
      )}
    >
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 group">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary transition-transform duration-300 group-hover:scale-110">
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-primary-foreground">
                H
              </span>
            </div>
            <div>
              <span className="font-bold text-xl gradient-heading">HAAAL</span>
              <span className="text-muted-foreground transition-colors duration-300 group-hover:text-foreground">
                Forum
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md transition-all duration-300",
                  pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                    ? "text-foreground bg-muted"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted/50",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2 gradient-border">
                <Search className="h-4 w-4" />
                <span>Ara</span>
                <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle className="gradient-heading text-xl">Forumda Ara</DialogTitle>
                <DialogDescription>Konular, mesajlar ve kullanıcılar arasında arama yapın</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSearch} className="space-y-4 py-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Arama sorgusu yazın..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Tabs defaultValue="threads">
                  <TabsList className="w-full">
                    <TabsTrigger value="threads" className="flex-1">
                      Konular
                    </TabsTrigger>
                    <TabsTrigger value="posts" className="flex-1">
                      Mesajlar
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex-1">
                      Kullanıcılar
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="threads" className="mt-2">
                    <div className="text-sm text-muted-foreground text-center py-8">
                      Arama yapmak için bir sorgu girin
                    </div>
                  </TabsContent>
                  <TabsContent value="posts" className="mt-2">
                    <div className="text-sm text-muted-foreground text-center py-8">
                      Arama yapmak için bir sorgu girin
                    </div>
                  </TabsContent>
                  <TabsContent value="users" className="mt-2">
                    <div className="text-sm text-muted-foreground text-center py-8">
                      Arama yapmak için bir sorgu girin
                    </div>
                  </TabsContent>
                </Tabs>
                <div className="flex justify-end">
                  <Button type="submit" className="animated-button">
                    Ara
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {isLoggedIn ? (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-muted/80 transition-all duration-300"
                      onClick={() => {
                        toast({
                          title: "Bildirimler",
                          description: "Tüm bildirimleriniz görüntüleniyor.",
                        })
                      }}
                    >
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 pulse">
                        3
                      </Badge>
                      <span className="sr-only">Bildirimler</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bildirimler</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <NotificationDropdown />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-muted/80 transition-all duration-300"
                      onClick={() => {
                        router.push("/chat")
                      }}
                    >
                      <MessageSquare className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 pulse">
                        2
                      </Badge>
                      <span className="sr-only">Mesajlar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mesajlar</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <MessagesDropdown />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full overflow-hidden transition-all duration-300 hover:ring-2 hover:ring-primary/50"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="@username" />
                      <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Seda Çelik</p>
                      <p className="text-xs leading-none text-muted-foreground">seda.celik@haaal.edu</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push("/profile/seda-celik")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/my-threads")}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Konularım</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Ayarlar</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Languages className="mr-2 h-4 w-4" />
                        <span>Dil</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem
                            onClick={() => {
                              toast({
                                title: "Dil değiştirildi",
                                description: "Forum dili Türkçe olarak ayarlandı.",
                              })
                            }}
                          >
                            <span>Türkçe</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              toast({
                                title: "Language changed",
                                description: "Forum language is set to English.",
                              })
                            }}
                          >
                            <span>English</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              toast({
                                title: "Sprache geändert",
                                description: "Forumsprache ist auf Deutsch eingestellt.",
                              })
                            }}
                          >
                            <span>Deutsch</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              toast({
                                title: "Langue modifiée",
                                description: "La langue du forum est définie sur Français.",
                              })
                            }}
                          >
                            <span>Français</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuItem
                      onClick={() => {
                        setTheme(theme === "dark" ? "light" : "dark")
                        toast({
                          title: theme === "dark" ? "Aydınlık tema aktif" : "Karanlık tema aktif",
                          description:
                            theme === "dark"
                              ? "Forum teması aydınlık moda geçirildi."
                              : "Forum teması karanlık moda geçirildi.",
                        })
                      }}
                    >
                      {theme === "dark" ? (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          <span>Aydınlık Tema</span>
                        </>
                      ) : (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          <span>Karanlık Tema</span>
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/help")}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Yardım</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Çıkış yap</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="gradient-border transition-all duration-300">
                  Giriş yap
                </Button>
              </Link>
              <Link href="/register">
                <Button className="animated-button">Kayıt ol</Button>
              </Link>
            </>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-muted/80 transition-all duration-300">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menüyü aç</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="py-4">
                <div className="relative mb-4">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Forumda ara..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        toast({
                          title: "Arama yapılıyor",
                          description: `"${searchQuery}" için sonuçlar getiriliyor...`,
                        })
                      }
                    }}
                  />
                </div>
              </div>
              <nav className="flex flex-col gap-2 text-base font-medium">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-300",
                      pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
                        ? "text-foreground bg-muted"
                        : "text-foreground/60 hover:text-foreground hover:bg-muted/50",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
