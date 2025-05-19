"use client"

import { useState } from "react"
import { Search, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TranscriptContent } from "@/components/transcript-content"
import { TranscriptSidebar } from "@/components/transcript-sidebar"
import { AudioPlayer } from "@/components/audio-player"

interface CaseData {
  id: string
  title: string
  type: string
  status: string
  court: string
  judge: string
  lastUpdated: string
  transcriptCount: number
  description: string
}

interface TranscriptViewerProps {
  caseData?: CaseData
  selectedTranscriptId?: string
  onBackToInfo?: () => void
}

export function TranscriptViewer({ caseData, selectedTranscriptId, onBackToInfo }: TranscriptViewerProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentAudioTime, setCurrentAudioTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Sample audio URL - replace with your actual audio file
  const audioUrl = "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"

  // Handle time updates from the audio player
  const handleTimeUpdate = (currentTime: number, duration: number) => {
    setCurrentAudioTime(currentTime)
    setAudioDuration(duration)
  }

  // Handle jumping to a specific time in the audio
  const handleJumpToTime = (timeInSeconds: number) => {
    setCurrentAudioTime(timeInSeconds)
  }

  // Get transcript day based on selected ID or default to Day 2
  const getTranscriptDay = () => {
    if (!selectedTranscriptId) return "Day 2"

    if (selectedTranscriptId === "transcript-1") return "Day 1"
    if (selectedTranscriptId === "transcript-2") return "Day 2"
    if (selectedTranscriptId === "transcript-3") return "Day 3"

    return "Day 2"
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold">{caseData?.title || "State v. Johnson"}</h2>
          <p className="text-sm text-muted-foreground">
            {caseData?.id || "Case #CR-2023-45678"} • {getTranscriptDay()} • {caseData?.lastUpdated || "May 15, 2023"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onBackToInfo && (
            <Button variant="outline" size="sm" onClick={onBackToInfo}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Case Info
            </Button>
          )}
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search transcript..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            Export
          </Button>
          <Button size="sm">Annotate</Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <TranscriptSidebar />
        <main className="flex-1 overflow-auto p-4">
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="exhibits">Exhibits</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="transcript" className="mt-0">
              <div className="rounded-lg border bg-card">
                {/* Audio Player */}
                <AudioPlayer
                  audioUrl={audioUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />

                {/* Transcript Content with Audio Sync */}
                <TranscriptContent
                  currentAudioTime={currentAudioTime}
                  audioDuration={audioDuration}
                  onJumpToTime={handleJumpToTime}
                />
              </div>
            </TabsContent>
            <TabsContent value="exhibits" className="mt-0">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-medium">Case Exhibits</h3>
                <p className="text-muted-foreground">Select an exhibit from the sidebar to view it here.</p>
              </div>
            </TabsContent>
            <TabsContent value="notes" className="mt-0">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-medium">Personal Notes</h3>
                <p className="text-muted-foreground">Your notes and annotations will appear here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

