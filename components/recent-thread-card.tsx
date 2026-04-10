import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MessageSquare, Eye, Paperclip, ImageIcon, BarChart2, Pin } from "lucide-react"

interface RecentThreadCardProps {
  title: string
  author: string
  authorUsername?: string
  authorRole: string
  category: string
  categorySlug?: string
  replies: number
  views: number
  timestamp: string
  id: string
  authorAvatar?: string | null
  isPinned?: boolean
  hasAttachments?: boolean
  hasImages?: boolean
  hasPolls?: boolean
  tags?: string[]
}

export default function RecentThreadCard({
  title,
  author,
  authorUsername,
  authorRole,
  category,
  categorySlug,
  replies,
  views,
  timestamp,
  id,
  authorAvatar,
  isPinned = false,
  hasAttachments = false,
  hasImages = false,
  hasPolls = false,
  tags = [],
}: RecentThreadCardProps) {
  const profileHref = authorUsername
    ? `/profile/${authorUsername}`
    : `/profile/${author.toLowerCase().replace(" ", "-")}`

  const categoryHref = categorySlug ? `/category/${categorySlug}` : `/category/${category.toLowerCase()}`

  return (
    <Card className="animated-card overflow-hidden group">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="hidden sm:flex h-10 w-10 transition-transform duration-300 group-hover:scale-110">
            <AvatarImage src={authorAvatar ?? `/placeholder.svg?text=${author.substring(0, 2)}`} alt={author} />
            <AvatarFallback>{author.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/thread/${id}`}
                    className="font-semibold hover:text-primary transition-colors duration-300 group-hover:underline"
                  >
                    {title}
                  </Link>
                  {isPinned && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Pin className="h-3.5 w-3.5 text-muted-foreground rotate-45" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Sabitlenmiş konu</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Link
                    href={profileHref}
                    className="hover:text-primary transition-colors duration-300"
                  >
                    {author}
                  </Link>
                  <span className="text-muted-foreground/60">•</span>
                  <span>{authorRole}</span>
                  <span className="text-muted-foreground/60">•</span>
                  <Link
                    href={categoryHref}
                    className="hover:text-primary transition-colors duration-300"
                  >
                    {category}
                  </Link>
                  <span className="text-muted-foreground/60">•</span>
                  <span>{timestamp}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{replies}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{views}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link href={`/tags/${tag}`} key={tag}>
                  <Badge
                    variant="secondary"
                    className="transition-all duration-300 hover:bg-primary/10 hover:text-primary"
                  >
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              {hasAttachments && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Dosya ekleri var</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {hasImages && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Resimler var</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {hasPolls && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Anket içeriyor</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
    </Card>
  )
}
