"use client"

import ForumHeader from "@/components/forum-header"
import ForumFooter from "@/components/forum-footer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Search,
  FileText,
  Download,
  Video,
  FileQuestion,
  FileSpreadsheet,
  FileImage,
  Plus,
  Star,
  Clock,
  Eye,
  ThumbsUp,
  Filter,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useMemo, useState } from "react"

export default function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [type, setType] = useState("all")
  const [sort, setSort] = useState("recent")

  useEffect(() => {
    fetch(`/api/resources?q=${encodeURIComponent(query)}&type=${type}&sort=${sort}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setResources(Array.isArray(d) ? d : []))
      .catch(() => setResources([]))
  }, [query, type, sort])

  const featuredResources = useMemo(() => resources.slice(0, 6), [resources])
  const recentResources = useMemo(() => [...resources].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 6), [resources])
  const popularResources = useMemo(() => [...resources].sort((a, b) => b.downloadCount - a.downloadCount).slice(0, 6), [resources])

  return (
    <div className="min-h-screen flex flex-col">
      <ForumHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-heading">Eğitim Kaynakları</h1>
            <p className="text-muted-foreground">Öğretmenler ve öğrenciler tarafından paylaşılan eğitim materyalleri</p>
          </div>
          <div className="flex gap-2">
            <Button className="animated-button">
              <Plus className="mr-2 h-4 w-4" />
              Kaynak Ekle
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Kaynak ara..." className="pl-10" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Dosya Türü" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Dosyalar</SelectItem>
                <SelectItem value="DOCUMENT">Dokümanlar</SelectItem>
                <SelectItem value="VIDEO">Videolar</SelectItem>
                <SelectItem value="SPREADSHEET">Tablolar</SelectItem>
                <SelectItem value="IMAGE">Görseller</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSort("recent")}>En Yeni</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSort("popular")}>En Popüler</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSort("popular")}>En Çok İndirilen</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSort("top-rated")}>En Yüksek Puanlı</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="featured" className="mb-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="featured" className="flex-1 md:flex-none">
              <Star className="mr-2 h-4 w-4" />
              Öne Çıkan
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1 md:flex-none">
              <Clock className="mr-2 h-4 w-4" />
              Yeni Eklenen
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex-1 md:flex-none">
              <ThumbsUp className="mr-2 h-4 w-4" />
              Popüler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <ForumFooter />
    </div>
  )
}

interface ResourceCardProps {
  resource: {
    id: string
    title: string
    description: string
    type: string
    fileType: string
    fileSize: string
    downloadCount: number
    rating: number
    author: {
      name: string
      avatar: string
    }
    createdAt: string
    tags: string[]
  }
}

function ResourceCard({ resource }: ResourceCardProps) {
  // Dosya türüne göre ikon belirleme
  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-6 w-6 text-blue-500" />
      case "video":
        return <Video className="h-6 w-6 text-red-500" />
      case "spreadsheet":
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />
      case "image":
        return <FileImage className="h-6 w-6 text-purple-500" />
      default:
        return <FileQuestion className="h-6 w-6 text-gray-500" />
    }
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <div className="mt-1">{getFileIcon(resource.type)}</div>
          <div>
            <CardTitle className="text-lg">{resource.title}</CardTitle>
            <CardDescription className="line-clamp-2">{resource.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1 mb-2">
          {resource.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={resource.author.avatar || "/placeholder.svg"} alt={resource.author.name} />
              <AvatarFallback>{resource.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{resource.author.name}</span>
          </div>
          <div>{resource.createdAt}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center">
            <Eye className="mr-1 h-4 w-4" />
            <span>{resource.downloadCount}</span>
          </div>
          <div className="flex items-center">
            <Star className="mr-1 h-4 w-4 text-yellow-500" />
            <span>{resource.rating}</span>
          </div>
          <div>
            <Badge variant="outline" className="text-xs">
              {resource.fileType} • {resource.fileSize}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
