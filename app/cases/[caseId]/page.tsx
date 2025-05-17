"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { TranscriptViewer } from "@/components/transcript-viewer"
import { CaseInformation } from "@/components/case-information"
import { LogOut, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

// Sample case data - in a real app, you would fetch this based on the caseId
const casesData = {
  "CR-2023-45678": {
    id: "CR-2023-45678",
    title: "State v. Johnson",
    type: "Criminal",
    status: "Active",
    court: "Superior Court",
    judge: "Hon. Maria Garcia",
    lastUpdated: "May 15, 2023",
    transcriptCount: 3,
    description: "Felony assault and battery charges. Defendant pleaded not guilty.",
    filingDate: "April 30, 2023",
    participants: [
      { name: "Maria Rodriguez", role: "Prosecutor", firm: "District Attorney's Office" },
      { name: "Raj Patel", role: "Defense Attorney", firm: "Patel & Associates" },
      { name: "Michael Johnson", role: "Defendant" },
      { name: "Hon. Maria Garcia", role: "Judge", firm: "Superior Court" },
    ],
    courtDates: [
      {
        date: "May 14, 2023",
        time: "9:30 AM",
        type: "Initial Hearing",
        location: "Courtroom 302",
        notes: "Defendant arraigned, pleaded not guilty",
      },
      {
        date: "May 15, 2023",
        time: "9:30 AM",
        type: "Evidentiary Hearing",
        location: "Courtroom 302",
        notes: "Officer testimony, motion to suppress denied",
      },
      {
        date: "May 16, 2023",
        time: "9:30 AM",
        type: "Witness Testimony",
        location: "Courtroom 302",
      },
      {
        date: "June 20, 2023",
        time: "10:00 AM",
        type: "Pre-trial Conference",
        location: "Courtroom 302",
      },
    ],
  },
  "CV-2023-12345": {
    id: "CV-2023-12345",
    title: "Smith v. Acme Corp",
    type: "Civil",
    status: "Active",
    court: "District Court",
    judge: "Hon. Robert Chen",
    lastUpdated: "June 2, 2023",
    transcriptCount: 5,
    description: "Product liability claim for defective manufacturing equipment.",
  },
  "CR-2023-98765": {
    id: "CR-2023-98765",
    title: "State v. Williams",
    type: "Criminal",
    status: "Active",
    court: "Superior Court",
    judge: "Hon. James Wilson",
    lastUpdated: "May 22, 2023",
    transcriptCount: 2,
    description: "Fraud and embezzlement charges related to corporate accounting.",
  },
  "CV-2023-56789": {
    id: "CV-2023-56789",
    title: "Thompson v. City of Springfield",
    type: "Civil",
    status: "Closed",
    court: "Federal Court",
    judge: "Hon. Sarah Johnson",
    lastUpdated: "April 10, 2023",
    transcriptCount: 7,
    description: "Civil rights violation claim against local police department.",
  },
  "PR-2023-34567": {
    id: "PR-2023-34567",
    title: "Estate of Davis",
    type: "Probate",
    status: "Active",
    court: "Probate Court",
    judge: "Hon. Michael Brown",
    lastUpdated: "June 8, 2023",
    transcriptCount: 1,
    description: "Contested will and estate distribution proceedings.",
  },
  "FA-2023-23456": {
    id: "FA-2023-23456",
    title: "Martinez v. Martinez",
    type: "Family",
    status: "Active",
    court: "Family Court",
    judge: "Hon. Elizabeth Taylor",
    lastUpdated: "May 30, 2023",
    transcriptCount: 2,
    description: "Child custody and support modification hearing.",
  },
}

export default function CaseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const caseId = typeof params?.caseId === "string" ? params.caseId : ""
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [viewMode, setViewMode] = useState<"info" | "transcript">("info")
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | undefined>(undefined)

  // Check authentication on component mount
  useEffect(() => {
    // Check if user is logged in (either in localStorage or sessionStorage)
    const storedUser = localStorage.getItem("courtTranscriptUser") || sessionStorage.getItem("courtTranscriptUser")

    if (!storedUser) {
      // Redirect to login if not logged in
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  // Default to a fallback case if the ID doesn't exist
  const defaultCase = {
    id: "CR-2023-45678",
    title: "State v. Johnson",
    type: "Criminal",
    status: "Active",
    court: "Superior Court",
    judge: "Hon. Maria Garcia",
    lastUpdated: "May 15, 2023",
    transcriptCount: 3,
    description: "Felony assault and battery charges. Defendant pleaded not guilty.",
  }

  const caseData =
    caseId && casesData[caseId as keyof typeof casesData] ? casesData[caseId as keyof typeof casesData] : defaultCase

  // Handle logout
  const handleLogout = () => {
    // Remove user from both storage types
    localStorage.removeItem("courtTranscriptUser")
    sessionStorage.removeItem("courtTranscriptUser")

    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })

    // Redirect to login
    router.push("/login")
  }

  // Navigate back to cases list
  const handleBackToCases = () => {
    router.push("/cases")
  }

  // Handle viewing a transcript
  const handleViewTranscript = (transcriptId?: string) => {
    setSelectedTranscriptId(transcriptId)
    setViewMode("transcript")
  }

  // If not authenticated yet, don't render the content
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="mr-2" onClick={handleBackToCases}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to cases</span>
          </Button>
          <div className="flex items-center gap-2 font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
            <span>Court Transcript System</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {viewMode === "transcript" && (
              <Button variant="outline" size="sm" onClick={() => setViewMode("info")}>
                Back to Case Info
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {viewMode === "info" ? (
        <CaseInformation caseData={caseData} onViewTranscript={handleViewTranscript} />
      ) : (
        <TranscriptViewer
          caseData={caseData}
          selectedTranscriptId={selectedTranscriptId}
          onBackToInfo={() => setViewMode("info")}
        />
      )}
    </div>
  )
}

