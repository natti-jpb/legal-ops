"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { TranscriptViewer } from "@/components/transcript-viewer"
import { CaseInformation } from "@/components/case-information"
import { LogOut, ArrowLeft } from "lucide-react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import Loading from "./loading"

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
}

interface Participant {
  name: string; // unique
  role: string;
  firm?: string;
  contact?: string;
}

// Add Document type compatible with CaseDocument
interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  pages?: number;
  audioFile?: string | number;
  [key: string]: any;
}

export default function CaseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const caseId = typeof params?.caseId === "string" ? params.caseId : ""
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [viewMode, setViewMode] = useState<"info" | "transcript">("info")
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | undefined>(undefined)
  const [caseData, setCaseData] = useState(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [showChat, setShowChat] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const [chatInput, setChatInput] = useState("")
  type ChatMessage = { role: "user" | "system"; content: string }
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Close chat when clicking outside
  useEffect(() => {
    if (!showChat) return
    function handleClick(event: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setShowChat(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showChat])

  // Fetch documents.json for the case
  const fetchDocuments = async () => {
    if (!caseId) return
    try {
      const res = await fetch(`/data/case-files/${caseId}/documents/documents.json?_=${Date.now()}`)
      if (!res.ok) throw new Error('Could not fetch documents')
      const docs = await res.json()
      setDocuments(docs)
    } catch (err) {
      setDocuments([])
    }
  }

  // Check authentication on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("courtTranscriptUser") || sessionStorage.getItem("courtTranscriptUser")
    if (!storedUser) {
      router.push("/login")
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  // Fetch case data from API
  useEffect(() => {
    if (!caseId) return
    setLoading(true)
    setError(null)
    // Fetch context.json and participants via API route in parallel
    Promise.all([
      fetch(`/api/cases/${caseId}/context`).then(res => {
        if (!res.ok) throw new Error('Case not found')
        return res.json()
      }),
      fetch(`/api/cases/${caseId}/participants`).then(res => {
        if (!res.ok) throw new Error('Participants not found')
        return res.json()
      })
    ])
      .then(([data, participantsData]) => {
        setCaseData(data)
        setParticipants(Array.isArray(participantsData) ? participantsData : [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setCaseData(null)
        setParticipants([])
        setLoading(false)
      })
  }, [caseId])

  // Fetch documents when caseId changes
  useEffect(() => {
    fetchDocuments()
  }, [caseId])

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

  // Find the selected transcript and its associated audio file
  const selectedTranscript = documents.find(
    (doc) => String(doc.id) === String(selectedTranscriptId)
  );
  let audioUrl = undefined;
  if (selectedTranscript && selectedTranscript.audioFile) {
    const audioDoc = documents.find(
      (doc) => String(doc.id) === String(selectedTranscript.audioFile)
    );
    if (audioDoc && audioDoc.name) {
      audioUrl = `/data/case-files/${caseId}/documents/${audioDoc.name}`;
    }
  }

  let transcriptUrl = undefined;
  if (selectedTranscript && selectedTranscript.name) {
    transcriptUrl = `/data/case-files/${caseId}/documents/${selectedTranscript.name}`;
  }

  // Helper for other devs to add a system message
  const addSystemMessage = (content: string) => {
    setChatMessages(prev => [...prev, { role: "system", content }])
    setIsLoading(false)
  }

  // If not authenticated yet, don't render the content
  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return <Loading />
  }
  if (error) {
    return <div>{error}</div>
  }
  if (!caseData) {
    return <div>No case data found.</div>
  }

  return (
    <div className="min-h-screen bg-background relative">
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
        <CaseInformation
          caseData={caseData}
          documents={documents}
          refreshDocuments={fetchDocuments}
          onViewTranscript={handleViewTranscript}
          participants={participants}
          setParticipants={setParticipants}
        />
      ) : (
        <TranscriptViewer
          caseData={caseData}
          selectedTranscriptId={selectedTranscriptId}
          audioUrl={audioUrl}
          transcriptUrl={transcriptUrl}
          onBackToInfo={() => setViewMode("info")}
        />
      )}

      {/* Floating Chat AI Assistant Button */}
      {!showChat && (
        <button
          type="button"
          className="fixed bottom-10 right-10 z-50 rounded-full bg-primary p-4 shadow-lg hover:bg-primary/90 transition-colors flex items-center justify-center"
          aria-label="Open AI Assistant Chat"
          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
          onClick={() => setShowChat(true)}
        >
          {/* Simple Robot SVG Icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="8" rx="4" />
            <circle cx="7.5" cy="12" r="1.5" fill="white" />
            <circle cx="16.5" cy="12" r="1.5" fill="white" />
            <path d="M12 8V4" />
            <circle cx="12" cy="2.5" r="1.5" fill="white" />
          </svg>
        </button>
      )}

      {/* Floating Chat Window */}
      {showChat && (
        <div
          ref={chatRef}
          className="fixed bottom-10 right-10 z-50 w-96 h-[30rem] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200"
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    msg.role === "user"
                      ? "bg-primary text-white px-4 py-2 rounded-2xl max-w-[75%] break-words shadow"
                      : "bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl max-w-[75%] break-words shadow"
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl max-w-[75%] break-words shadow flex items-center gap-2">
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Processing...</span>
                </div>
              </div>
            )}
          </div>
          <form
            className="p-3 border-t border-gray-200"
            onSubmit={async e => {
              e.preventDefault();
              if (chatInput.trim() !== "") {
                const userMessage = chatInput;
                setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
                setChatInput("");
                setIsLoading(true);

                try {
                  // Chamada para a API Python
                  const response = await fetch("http://localhost:8000/simple-rag", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      question: userMessage,
                      case_id: caseId,
                      model: "gpt-4.1-mini",
                      max_tokens: 512
                    })
                  });
                  const data = await response.json();
                  if (data.answer) {
                    setChatMessages(prev => [...prev, { role: "system", content: data.answer }]);
                  } else {
                    setChatMessages(prev => [...prev, { role: "system", content: "Error: invalid response from API." }]);
                  }
                } catch (err) {
                  setChatMessages(prev => [...prev, { role: "system", content: "Error connecting to API." }]);
                }
                setIsLoading(false);
              }
            }}
          >
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              placeholder="Type your message..."
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              autoFocus
              disabled={isLoading}
            />
          </form>
        </div>
      )}
    </div>
  )
}

