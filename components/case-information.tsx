"use client"

import type React from "react"

import { Calendar, User, Gavel, FileText, MapPin, AlertCircle, Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"

interface CaseParticipant {
  name: string
  role: string
  firm?: string
  contact?: string
}

interface CourtDate {
  date: string
  time: string
  type: string
  location: string
  notes?: string
}

interface CaseDocument {
  id: string
  name: string
  type: string
  date: string
  pages?: number
}

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
  filingDate?: string
  participants?: CaseParticipant[]
  courtDates?: CourtDate[]
  documents?: CaseDocument[]
  notes?: string
}

interface CaseInformationProps {
  caseData: CaseData
  onViewTranscript: (transcriptId?: string) => void
}

export function CaseInformation({ caseData, onViewTranscript }: CaseInformationProps) {
  const [addDateDialogOpen, setAddDateDialogOpen] = useState(false)
  const [addDocumentDialogOpen, setAddDocumentDialogOpen] = useState(false)
  const [newCourtDate, setNewCourtDate] = useState({
    date: "",
    time: "",
    type: "",
    location: "",
    notes: "",
  })
  const [newDocument, setNewDocument] = useState({
    name: "",
    type: "Legal Document",
    date: "",
    pages: "",
  })
  // Provide default values for optional fields
  const participants = caseData.participants || [
    { name: "Maria Rodriguez", role: "Prosecutor", firm: "District Attorney's Office" },
    { name: "Raj Patel", role: "Defense Attorney", firm: "Patel & Associates" },
    { name: "Michael Johnson", role: "Defendant" },
    { name: "Hon. Maria Garcia", role: "Judge", firm: "Superior Court" },
  ]

  const courtDates = caseData.courtDates || [
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
  ]

  const documents = caseData.documents || [
    {
      id: "doc-1",
      name: "Indictment",
      type: "Legal Document",
      date: "April 30, 2023",
      pages: 5,
    },
    {
      id: "transcript-1",
      name: "Day 1 - May 14, 2023",
      type: "Transcript",
      date: "May 14, 2023",
      pages: 42,
    },
    {
      id: "transcript-2",
      name: "Day 2 - May 15, 2023",
      type: "Transcript",
      date: "May 15, 2023",
      pages: 68,
    },
    {
      id: "transcript-3",
      name: "Day 3 - May 16, 2023",
      type: "Transcript",
      date: "May 16, 2023",
      pages: 53,
    },
    {
      id: "doc-2",
      name: "Motion to Suppress",
      type: "Legal Document",
      date: "May 10, 2023",
      pages: 12,
    },
    {
      id: "doc-3",
      name: "Evidence List",
      type: "Legal Document",
      date: "May 12, 2023",
      pages: 8,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const handleAddCourtDate = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would save this to your database
    toast({
      title: "Court date added",
      description: `Added ${newCourtDate.type} on ${newCourtDate.date}`,
    })
    setAddDateDialogOpen(false)
    // Reset form
    setNewCourtDate({
      date: "",
      time: "",
      type: "",
      location: "",
      notes: "",
    })
  }

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would save this to your database
    toast({
      title: "Document added",
      description: `Added ${newDocument.name}`,
    })
    setAddDocumentDialogOpen(false)
    // Reset form
    setNewDocument({
      name: "",
      type: "Legal Document",
      date: "",
      pages: "",
    })
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="flex flex-col gap-6">
        {/* Case header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{caseData.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-muted-foreground">{caseData.id}</span>
              <span className="text-muted-foreground">•</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseData.status)}`}>
                {caseData.status}
              </span>
            </div>
            <p className="mt-2 text-muted-foreground">{caseData.description}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => onViewTranscript()}>View Latest Transcript</Button>
          </div>
        </div>

        {/* Case details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Gavel className="h-5 w-5 mr-2" />
                Court Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Court</dt>
                  <dd>{caseData.court}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Judge</dt>
                  <dd>{caseData.judge}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Case Type</dt>
                  <dd>{caseData.type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Filing Date</dt>
                  <dd>{caseData.filingDate || "April 30, 2023"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd>{caseData.lastUpdated}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <User className="h-5 w-5 mr-2" />
                Case Participants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="bg-primary/10 rounded-full p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{participant.name}</div>
                      <div className="text-sm text-muted-foreground">{participant.role}</div>
                      {participant.firm && <div className="text-sm">{participant.firm}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="schedule">Court Schedule</TabsTrigger>
            <TabsTrigger value="documents">Documents & Transcripts</TabsTrigger>
            <TabsTrigger value="notes">Case Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Court Dates
                  </CardTitle>
                  <CardDescription>Scheduled hearings and proceedings for this case</CardDescription>
                </div>
                <Button size="sm" onClick={() => setAddDateDialogOpen(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Add Date
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {courtDates.map((date, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-4 pb-4">
                      <div className="flex-shrink-0 sm:w-32">
                        <div className="font-medium">{date.date}</div>
                        <div className="text-sm text-muted-foreground">{date.time}</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{date.type}</div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {date.location}
                        </div>
                        {date.notes && (
                          <div className="text-sm mt-1 bg-muted p-2 rounded-md">
                            <span className="font-medium">Notes:</span> {date.notes}
                          </div>
                        )}
                      </div>
                      {index < courtDates.length - 1 && <Separator className="sm:hidden" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-0">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Documents & Transcripts
                  </CardTitle>
                  <CardDescription>Case documents and hearing transcripts ({documents.length} total)</CardDescription>
                </div>
                <Button size="sm" onClick={() => setAddDocumentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Document</th>
                        <th className="text-left py-3 px-4 font-medium">Type</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Pages</th>
                        <th className="text-right py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{doc.name}</td>
                          <td className="py-3 px-4">
                            <Badge variant={doc.type === "Transcript" ? "default" : "outline"}>{doc.type}</Badge>
                          </td>
                          <td className="py-3 px-4">{doc.date}</td>
                          <td className="py-3 px-4">{doc.pages} pages</td>
                          <td className="py-3 px-4 text-right">
                            {doc.type === "Transcript" ? (
                              <Button variant="outline" size="sm" onClick={() => onViewTranscript(doc.id)}>
                                View Transcript
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                View Document
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Case Notes
                </CardTitle>
                <CardDescription>Important notes and observations about this case</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p>
                    The defendant is charged with felony assault and battery. The incident allegedly occurred on April
                    15, 2023, at approximately 11:30 PM at the Corner Bar on Main Street.
                  </p>
                  <p>
                    Key evidence includes surveillance footage from the bar, testimony from the victim and three
                    witnesses, and medical records documenting the victim's injuries.
                  </p>
                  <p>
                    The defense has filed a motion to suppress the defendant's statements to police, arguing that they
                    were obtained in violation of Miranda rights. This motion was denied on May 15, 2023.
                  </p>
                  <p>
                    <strong>Next Steps:</strong> Prepare for witness testimony scheduled for the next hearing. Review
                    medical expert's report on the extent of injuries.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        {/* Add Court Date Dialog */}
        <Dialog open={addDateDialogOpen} onOpenChange={setAddDateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Court Date</DialogTitle>
              <DialogDescription>Add a new hearing or proceeding date for this case.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCourtDate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newCourtDate.date}
                      onChange={(e) => setNewCourtDate({ ...newCourtDate, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newCourtDate.time}
                      onChange={(e) => setNewCourtDate({ ...newCourtDate, time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="type">Hearing Type</Label>
                  <Select
                    value={newCourtDate.type}
                    onValueChange={(value) => setNewCourtDate({ ...newCourtDate, type: value })}
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select hearing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Initial Hearing">Initial Hearing</SelectItem>
                      <SelectItem value="Evidentiary Hearing">Evidentiary Hearing</SelectItem>
                      <SelectItem value="Witness Testimony">Witness Testimony</SelectItem>
                      <SelectItem value="Pre-trial Conference">Pre-trial Conference</SelectItem>
                      <SelectItem value="Trial">Trial</SelectItem>
                      <SelectItem value="Sentencing">Sentencing</SelectItem>
                      <SelectItem value="Status Conference">Status Conference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Courtroom 302"
                    value={newCourtDate.location}
                    onChange={(e) => setNewCourtDate({ ...newCourtDate, location: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional details about this hearing"
                    value={newCourtDate.notes}
                    onChange={(e) => setNewCourtDate({ ...newCourtDate, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Court Date</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Document Dialog */}
        <Dialog open={addDocumentDialogOpen} onOpenChange={setAddDocumentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Document</DialogTitle>
              <DialogDescription>Add a new document or transcript to this case.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddDocument}>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="doc-name">Document Name</Label>
                  <Input
                    id="doc-name"
                    placeholder="e.g., Motion to Dismiss"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="doc-type">Document Type</Label>
                  <Select
                    value={newDocument.type}
                    onValueChange={(value) => setNewDocument({ ...newDocument, type: value })}
                    required
                  >
                    <SelectTrigger id="doc-type">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Legal Document">Legal Document</SelectItem>
                      <SelectItem value="Transcript">Transcript</SelectItem>
                      <SelectItem value="Evidence">Evidence</SelectItem>
                      <SelectItem value="Exhibit">Exhibit</SelectItem>
                      <SelectItem value="Audio Recording">Audio Recording</SelectItem>
                      <SelectItem value="Video Recording">Video Recording</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="doc-date">Date</Label>
                    <Input
                      id="doc-date"
                      type="date"
                      value={newDocument.date}
                      onChange={(e) => setNewDocument({ ...newDocument, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="doc-pages">Pages</Label>
                    <Input
                      id="doc-pages"
                      type="number"
                      placeholder="Number of pages"
                      value={newDocument.pages}
                      onChange={(e) => setNewDocument({ ...newDocument, pages: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="doc-file">Upload File</Label>
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Drag and drop your file here, or click to browse</p>
                    <Input id="doc-file" type="file" className="hidden" />
                    <Label htmlFor="doc-file" className="mt-2 inline-block">
                      <Button type="button" variant="outline" size="sm">
                        Browse Files
                      </Button>
                    </Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDocumentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Document</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

