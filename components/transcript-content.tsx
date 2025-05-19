"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Bookmark, MoreHorizontal, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Sample transcript data with timestamps in seconds
const transcriptData = [
  {
    id: 1,
    time: "09:30:15",
    timeInSeconds: 0,
    speaker: "THE COURT",
    content:
      "Good morning. We're on the record in the matter of State versus Johnson, case number CR-2023-45678. This is day two of the trial. Counsel, please state your appearances for the record.",
  },
  {
    id: 2,
    time: "09:30:42",
    timeInSeconds: 27,
    speaker: "MS. RODRIGUEZ",
    content: "Good morning, Your Honor. Maria Rodriguez for the State.",
  },
  {
    id: 3,
    time: "09:30:48",
    timeInSeconds: 33,
    speaker: "MR. PATEL",
    content:
      "Good morning, Your Honor. Raj Patel on behalf of the defendant, Michael Johnson, who is present in court.",
  },
  {
    id: 4,
    time: "09:31:05",
    timeInSeconds: 50,
    speaker: "THE COURT",
    content: "Thank you. Before we bring in the jury, are there any matters we need to address?",
  },
  {
    id: 5,
    time: "09:31:15",
    timeInSeconds: 60,
    speaker: "MS. RODRIGUEZ",
    content:
      "Yes, Your Honor. The State would like to address the admissibility of the defendant's prior statements to law enforcement.",
  },
  {
    id: 6,
    time: "09:31:30",
    timeInSeconds: 75,
    speaker: "THE COURT",
    content: "Mr. Patel, your position?",
  },
  {
    id: 7,
    time: "09:31:35",
    timeInSeconds: 80,
    speaker: "MR. PATEL",
    content:
      "Your Honor, we maintain that those statements were obtained in violation of my client's Miranda rights and should be excluded.",
  },
  {
    id: 8,
    time: "09:31:50",
    timeInSeconds: 95,
    speaker: "THE COURT",
    content:
      "I've reviewed the briefs submitted by both parties on this issue. Based on the evidence presented at the suppression hearing, I find that the defendant was properly advised of his rights before questioning. The motion to suppress is denied. The statements will be admissible. Anything else?",
  },
  {
    id: 9,
    time: "09:32:25",
    timeInSeconds: 130,
    speaker: "MR. PATEL",
    content: "No, Your Honor. We note our objection for the record.",
  },
  {
    id: 10,
    time: "09:32:32",
    timeInSeconds: 137,
    speaker: "THE COURT",
    content: "So noted. Ms. Rodriguez?",
  },
  {
    id: 11,
    time: "09:32:38",
    timeInSeconds: 143,
    speaker: "MS. RODRIGUEZ",
    content: "Nothing further, Your Honor.",
  },
  {
    id: 12,
    time: "09:32:42",
    timeInSeconds: 147,
    speaker: "THE COURT",
    content: "Very well. Let's bring in the jury. We'll resume with the State's first witness for today.",
  },
  {
    id: 13,
    time: "09:35:10",
    timeInSeconds: 295,
    speaker: "THE CLERK",
    content: "All rise for the jury.",
  },
  {
    id: 14,
    time: "09:36:05",
    timeInSeconds: 350,
    speaker: "THE COURT",
    content:
      "Good morning, ladies and gentlemen of the jury. We're ready to proceed with day two of the trial. Ms. Rodriguez, please call your next witness.",
  },
  {
    id: 15,
    time: "09:36:20",
    timeInSeconds: 365,
    speaker: "MS. RODRIGUEZ",
    content: "The State calls Officer James Wilson to the stand.",
  },
]

interface TranscriptContentProps {
  currentAudioTime?: number
  audioDuration?: number
  onJumpToTime?: (timeInSeconds: number) => void
}

export function TranscriptContent({
  currentAudioTime = 0,
  audioDuration = 400,
  onJumpToTime = () => {},
}: TranscriptContentProps) {
  const [bookmarkedLines, setBookmarkedLines] = useState<number[]>([])
  const [activeLineId, setActiveLineId] = useState<number | null>(null)

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
    const currentLine = transcriptData
      .filter((line) => line.timeInSeconds <= currentAudioTime)
      .sort((a, b) => b.timeInSeconds - a.timeInSeconds)[0]

    if (currentLine && currentLine.id !== activeLineId) {
      setActiveLineId(currentLine.id)
    }
  }, [currentAudioTime, activeLineId])

  // Handle clicking on a transcript line to jump to that time
  const handleLineClick = (timeInSeconds: number) => {
    if (onJumpToTime) {
      onJumpToTime(timeInSeconds)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Progress bar */}
      <div className="h-1 w-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="h-[calc(100vh-280px)] overflow-auto p-4">
        {transcriptData.map((line) => (
          <div
            key={line.id}
            className={`group mb-4 flex items-start gap-4 rounded-md p-2 hover:bg-muted/50 cursor-pointer ${
              activeLineId === line.id ? "bg-muted" : ""
            }`}
            onClick={() => handleLineClick(line.timeInSeconds)}
          >
            <div className="w-24 shrink-0 text-sm text-muted-foreground">{line.time}</div>
            <div className="w-32 shrink-0 font-semibold">{line.speaker}</div>
            <div className="flex-1">{line.content}</div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLineClick(line.timeInSeconds)
                }}
              >
                <Play className="h-4 w-4" />
                <span className="sr-only">Play from here</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => toggleBookmark(line.id, e)}>
                <Bookmark
                  className={`h-4 w-4 ${bookmarkedLines.includes(line.id) ? "fill-current text-primary" : ""}`}
                />
                <span className="sr-only">Bookmark</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Add note</DropdownMenuItem>
                  <DropdownMenuItem>Highlight</DropdownMenuItem>
                  <DropdownMenuItem>Copy text</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

