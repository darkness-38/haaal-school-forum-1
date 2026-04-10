"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart3 } from "lucide-react"

export function ThreadPoll({ threadId }: { threadId: string }) {
  const [voted, setVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [poll, setPoll] = useState<any | null>(null)

  useEffect(() => {
    fetch(`/api/threads/${threadId}/poll`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setPoll(d))
      .catch(() => setPoll(null))
  }, [threadId])

  const totalVotes = useMemo(
    () => (poll?.options ?? []).reduce((sum: number, option: any) => sum + option.votes, 0),
    [poll],
  )

  const handleVote = () => {
    if (selectedOption !== null) {
      fetch(`/api/threads/${threadId}/poll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteOptionId: selectedOption }),
      }).then(() => {
        setVoted(true)
        return fetch(`/api/threads/${threadId}/poll`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => setPoll(d))
      })
    }
  }

  if (!poll) return null

  return (
    <div className="border rounded-md p-4 bg-muted/30">
      <div className="flex items-center gap-2 mb-3">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h4 className="font-medium">Anket: {poll.question}</h4>
      </div>

      <div className="space-y-3">
        {poll.options.map((option: any) => {
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0

          return (
            <div key={option.id} className="space-y-1">
              <div className="flex items-center gap-2">
                {!voted ? (
                  <input
                    type="radio"
                    id={`option-${option.id}`}
                    name="poll-option"
                    className="h-4 w-4 rounded-full border-gray-300"
                    onChange={() => setSelectedOption(option.id)}
                    checked={selectedOption === option.id}
                  />
                ) : null}
                <label
                  htmlFor={`option-${option.id}`}
                  className={`text-sm flex-1 ${voted && selectedOption === option.id ? "font-medium" : ""}`}
                >
                  {option.text}
                </label>
                {voted && <span className="text-sm font-medium">{percentage}%</span>}
              </div>
              {voted && (
                <Progress
                  value={percentage}
                  className="h-2"
                  indicatorClassName={selectedOption === option.id ? "bg-primary" : "bg-primary/60"}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {!voted ? (
          <Button size="sm" onClick={handleVote} disabled={selectedOption === null}>
            Oy Ver
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Toplam {totalVotes} oy</span>
        )}
        {voted && (
          <Button variant="ghost" size="sm" onClick={() => setVoted(false)}>
            Sonuçları Gizle
          </Button>
        )}
      </div>
    </div>
  )
}

// Default export for backward compatibility
export default ThreadPoll
