"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Calendar, FileText, ArrowUpDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

// Sample case data
const casesData = [
  {
    id: "CR-2023-45678",
    title: "State v. Johnson",
    type: "Criminal",
    status: "Active",
    court: "Superior Court",
    judge: "Hon. Maria Garcia",
    lastUpdated: "May 15, 2023",
    transcriptCount: 3,
    description: "Felony assault and battery charges. Defendant pleaded not guilty.",
  },
  {
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
  {
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
  {
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
  {
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
  {
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
]

export default function CasesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [username, setUsername] = useState<string | null>(null)

  // Check authentication on component mount
  useEffect(() => {
    // Check if user is logged in (either in localStorage or sessionStorage)
    const storedUser = localStorage.getItem("courtTranscriptUser") || sessionStorage.getItem("courtTranscriptUser")

    if (!storedUser) {
      // Redirect to login if not logged in
      router.push("/login")
    } else {
      setUsername(storedUser)
    }
  }, [router])

  // Filter cases based on search query and filters
  const filteredCases = casesData.filter((caseItem) => {
    const matchesSearch =
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || caseItem.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesType = typeFilter === "all" || caseItem.type.toLowerCase() === typeFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesType
  })

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

  const handleViewCase = (caseId: string) => {
    router.push(`/cases/${caseId}`)
  }

  // If not authenticated yet, don't render the content
  if (username === null) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4 lg:px-6">
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
            <span className="text-sm text-muted-foreground mr-2">Welcome, {username}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
            <Button variant="outline" size="sm">
              New Case
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Case Management</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Case Number (A-Z)</DropdownMenuItem>
                <DropdownMenuItem>Case Number (Z-A)</DropdownMenuItem>
                <DropdownMenuItem>Last Updated (Newest)</DropdownMenuItem>
                <DropdownMenuItem>Last Updated (Oldest)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search cases..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <div className="w-[180px]">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[180px]">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Case Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="criminal">Criminal</SelectItem>
                    <SelectItem value="civil">Civil</SelectItem>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="probate">Probate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">More filters</span>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredCases.map((caseItem) => (
              <Card key={caseItem.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                      <CardDescription>{caseItem.id}</CardDescription>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        caseItem.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : caseItem.status === "Closed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {caseItem.status}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      Last updated: {caseItem.lastUpdated}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <FileText className="mr-2 h-4 w-4" />
                      {caseItem.transcriptCount} transcript{caseItem.transcriptCount !== 1 ? "s" : ""}
                    </div>
                    <p className="pt-2">{caseItem.description}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
                  <div className="text-xs text-muted-foreground">
                    {caseItem.court} • {caseItem.judge}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleViewCase(caseItem.id)}>
                    View Case
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredCases.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No cases found</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

