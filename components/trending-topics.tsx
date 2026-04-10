import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

type TrendingTopic = {
  id: string
  title: string
  category: string
  count: number
}

export default function TrendingTopics({ topics }: { topics?: TrendingTopic[] }) {
  const trendingTopics = topics ?? [
    { id: "1", title: "Final Sınav Programı", category: "Duyurular", count: 145 },
    { id: "3", title: "Bilim Fuarı Projeleri", category: "Akademik", count: 98 },
    { id: "5", title: "Yemekhane Menüsü", category: "Genel", count: 76 },
    { id: "2", title: "Basketbol Seçmeleri", category: "Spor", count: 54 },
    { id: "15", title: "Kampüs Çalışma Alanları", category: "Genel", count: 42 },
  ]

  return (
    <div className="space-y-3">
      {trendingTopics.map((topic) => (
        <Link key={topic.id} href={`/thread/${topic.id}`} className="flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm group-hover:underline">{topic.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {topic.count}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {topic.category}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  )
}
