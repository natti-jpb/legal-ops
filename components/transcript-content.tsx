"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bookmark, MoreHorizontal, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TranscriptContentProps {
  currentAudioTime?: number
  audioDuration?: number
  onJumpToTime?: (timeInSeconds: number) => void
  transcriptUrl?: string
}

export function TranscriptContent({
  currentAudioTime = 0,
  audioDuration = 400,
  onJumpToTime = () => {},
  transcriptUrl,
}: TranscriptContentProps) {
  const [bookmarkedLines, setBookmarkedLines] = useState<number[]>([])
  const [activeLineId, setActiveLineId] = useState<number | null>(null)
  const [transcriptText, setTranscriptText] = useState<string>("");

  // Fetch transcript text when transcriptUrl changes
  useEffect(() => {
    if (!transcriptUrl) {
      setTranscriptText("");
      return;
    }
    fetch(transcriptUrl)
      .then((res) => res.ok ? res.text() : "")
      .then((text) => setTranscriptText(text))
      .catch(() => setTranscriptText(""));
  }, [transcriptUrl]);

  // Calculate progress percentage
  const progressPercentage = Math.min(100, Math.max(0, (currentAudioTime / audioDuration) * 100))

  // Toggle bookmark for a line
  const toggleBookmark = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setBookmarkedLines((prev) => (prev.includes(id) ? prev.filter((lineId) => lineId !== id) : [...prev, id]))
  }

  // Find the active line based on current audio time
  useEffect(() => {
    // Find the last line that starts before the current time
    // const currentLine = transcriptData
    //   .filter((line) => line.timeInSeconds <= currentAudioTime)
    //   .sort((a, b) => b.timeInSeconds - a.timeInSeconds)[0]

    // if (currentLine && currentLine.id !== activeLineId) {
    //   setActiveLineId(currentLine.id)
    // }
  }, [currentAudioTime, activeLineId])

  // Handle clicking on a transcript line to jump to that time
  const handleLineClick = (timeInSeconds: number) => {
    if (onJumpToTime) {
      onJumpToTime(timeInSeconds)
    }
  }

  // Remove transcriptData and all its usages
  return (
    <div className="flex flex-col">
      {/* Removed progress bar */}
      <div className="h-[calc(100vh-280px)] overflow-auto p-4">
        {transcriptText ? (
          <pre className="whitespace-pre-wrap font-sans text-base">{transcriptText}</pre>
        ) : (
          <span className="text-muted-foreground">No transcript available.</span>
        )}
      </div>
    </div>
  )
}

