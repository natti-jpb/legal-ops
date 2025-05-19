"use client"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, RotateCcw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AudioPlayerProps {
  audioUrl: string
  onTimeUpdate?: (currentTime: number, duration: number) => void
  onPlay?: () => void
  onPause?: () => void
}

export function AudioPlayer({
  audioUrl,
  onTimeUpdate = () => {},
  onPlay = () => {},
  onPause = () => {},
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.pause()
    }
  }, [audioUrl])

  // Set up event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      onTimeUpdate(audio.currentTime, audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onPause()
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [onTimeUpdate, onPause])

  // Update playback speed when it changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.playbackRate = playbackSpeed
  }, [playbackSpeed])

  // Update audio time when currentTime changes externally
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || Math.abs(audio.currentTime - currentTime) < 0.5) return

    audio.currentTime = currentTime
  }, [currentTime])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      onPause()
    } else {
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            onPlay()
          })
          .catch((error) => {
            console.error("Error playing audio:", error)
          })
      }
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = value[0]
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = value[0]
    setVolume(newVolume)
    audio.volume = newVolume
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const skipBackward = () => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = Math.max(0, audio.currentTime - 10)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const skipForward = () => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = Math.min(duration, audio.currentTime + 10)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const restartPlayback = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    setCurrentTime(0)

    if (!isPlaying) {
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
            onPlay()
          })
          .catch((error) => {
            console.error("Error playing audio:", error)
          })
      }
    }
  }

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed)
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    const formattedHours = hours > 0 ? `${hours}:` : ""
    const formattedMinutes = minutes < 10 && hours > 0 ? `0${minutes}` : minutes
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds

    return `${formattedHours}${formattedMinutes}:${formattedSeconds}`
  }

  return (
    <div className="flex flex-col gap-2 p-3 border-b">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-16">{formatTime(currentTime)}</span>
        <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="flex-1" />
        <span className="text-sm font-medium w-16 text-right">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={restartPlayback} title="Restart playback">
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Restart</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={skipBackward} title="Skip back 10 seconds">
            <SkipBack className="h-4 w-4" />
            <span className="sr-only">Skip back 10 seconds</span>
          </Button>

          <Button variant="outline" size="icon" onClick={togglePlayPause} className="h-8 w-8">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </Button>

          <Button variant="ghost" size="icon" onClick={skipForward} title="Skip forward 10 seconds">
            <SkipForward className="h-4 w-4" />
            <span className="sr-only">Skip forward 10 seconds</span>
          </Button>

          {/* Playback Speed Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <Settings className="h-3 w-3 mr-1" />
                {playbackSpeed}x
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => changePlaybackSpeed(0.5)}>0.5x</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changePlaybackSpeed(0.75)}>0.75x</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changePlaybackSpeed(1)}>1x (Normal)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changePlaybackSpeed(1.25)}>1.25x</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changePlaybackSpeed(1.5)}>1.5x</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changePlaybackSpeed(2)}>2x</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
          </Button>

          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  )
}

