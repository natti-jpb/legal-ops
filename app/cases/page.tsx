"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Calendar,
  FileText,
  ArrowUpDown,
  LogOut,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define the case type
type Case = {
  id: string;
  title: string;
  type: string;
  status: string;
  court: string;
  judge: string;
  lastUpdated: string;
  transcriptCount: number;
  description: string;
};

export default function CasesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [username, setUsername] = useState<string | null>(null);
  const [casesData, setCasesData] = useState<Case[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Form state
  const [newCase, setNewCase] = useState({
    id: "",
    title: "",
    type: "",
    court: "",
    judge: ""
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<Case | null>(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Load cases data from CSV
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await fetch("/data/cases.csv");
        const csvText = await response.text();

        // Parse CSV
        const rows = csvText.split("\n").slice(1); // Skip header row
        const cases = rows.map((row) => {
          const [
            id,
            title,
            type,
            status,
            court,
            judge,
            lastUpdated,
            transcriptCount,
            description,
          ] = row.split(",");
          return {
            id,
            title,
            type,
            status: status ? status.trim() : "",
            court,
            judge,
            lastUpdated,
            transcriptCount: parseInt(transcriptCount),
            description,
          };
        });
        setCasesData(cases);
      } catch (error) {
        console.error("Error loading cases:", error);
        toast({
          title: "Error",
          description: "Failed to load cases data",
          variant: "destructive",
        });
      }
    };

    fetchCases();
  }, []);

  // Check authentication on component mount
  useEffect(() => {
    // Check if user is logged in (either in localStorage or sessionStorage)
    const storedUser =
      localStorage.getItem("courtTranscriptUser") ||
      sessionStorage.getItem("courtTranscriptUser");

    if (!storedUser) {
      // Redirect to login if not logged in
      router.push("/login");
    } else {
      setUsername(storedUser);
    }
  }, [router]);

  // Filter cases based on search query and filters
  const filteredCases = casesData.filter((caseItem) => {
    const matchesSearch =
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      caseItem.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType =
      typeFilter === "all" ||
      caseItem.type.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleLogout = () => {
    // Remove user from both storage types
    localStorage.removeItem("courtTranscriptUser");
    sessionStorage.removeItem("courtTranscriptUser");

    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });

    // Redirect to login
    router.push("/login");
  };

  const handleViewCase = (caseId: string) => {
    router.push(`/cases/${caseId}`);
  };

  const handleCreateCase = async () => {
    // Check if all fields are filled
    if (!newCase.id || !newCase.title || !newCase.type || !newCase.court || !newCase.judge) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Check if ID already exists
    if (casesData.some(caseItem => caseItem.id === newCase.id)) {
      toast({
        title: "Error",
        description: "This case ID already exists",
        variant: "destructive",
      });
      return;
    }

    const newCaseData = {
      id: newCase.id,
      title: newCase.title,
      type: newCase.type,
      status: "Active",
      court: newCase.court,
      judge: newCase.judge,
      lastUpdated: new Date().toISOString().split('T')[0],
      transcriptCount: 0,
      description: ""
    };

    try {
      // Add to CSV file
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCaseData),
      });

      if (!response.ok) throw new Error('Failed to create case');

      // Update local state
      setCasesData([...casesData, newCaseData]);
      
      // Reset form and close dialog
      setNewCase({ id: "", title: "", type: "", court: "", judge: "" });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Case created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create case",
        variant: "destructive",
      });
    }
  };

  // If not authenticated yet, don't render the content
  if (username === null) {
    return null;
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
            <span className="text-sm text-muted-foreground mr-2">
              Welcome, {username}
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Case Management</h1>
            <div className="flex items-center gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" size="sm">
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Case</DialogTitle>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Case ID</label>
                      <Input 
                        placeholder="Enter case ID" 
                        value={newCase.id}
                        onChange={(e) => setNewCase({...newCase, id: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Case Name</label>
                      <Input 
                        placeholder="Enter case name" 
                        value={newCase.title}
                        onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Case Type</label>
                      <Select 
                        value={newCase.type}
                        onValueChange={(value) => setNewCase({...newCase, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select case type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="civil">Civil</SelectItem>
                          <SelectItem value="criminal">Criminal</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Court Name</label>
                      <Input 
                        placeholder="Enter court name" 
                        value={newCase.court}
                        onChange={(e) => setNewCase({...newCase, court: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Judge Name</label>
                      <Input 
                        placeholder="Enter judge name" 
                        value={newCase.judge}
                        onChange={(e) => setNewCase({...newCase, judge: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleCreateCase}
                      disabled={!newCase.id || !newCase.title || !newCase.type || !newCase.court || !newCase.judge}
                    >
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
            {filteredCases.map((caseItem) => {
              console.log('CASE DEBUG:', caseItem.id, caseItem.status);
              return (
                <Card key={caseItem.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {caseItem.title}
                        </CardTitle>
                        <CardDescription>{caseItem.id}</CardDescription>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          caseItem.status?.trim().toLowerCase() === "active"
                            ? "bg-green-100 text-green-800"
                            : caseItem.status?.trim().toLowerCase() === "closed"
                            ? "bg-red-100 text-red-800"
                            : caseItem.status?.trim().toLowerCase() === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
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
                        {caseItem.transcriptCount} transcript
                        {caseItem.transcriptCount !== 1 ? "s" : ""}
                      </div>
                      <p className="pt-2">{caseItem.description}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
                    <div className="text-xs text-muted-foreground">
                      {caseItem.court} • {caseItem.judge}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCase(caseItem.id)}
                      >
                        View Case
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete case"
                        onClick={() => {
                          setCaseToDelete(caseItem);
                          setDeleteInput("");
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {filteredCases.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No cases found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
        {/* Delete Case Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Case</DialogTitle>
              <DialogDescription>
                {caseToDelete && (
                  <>
                    If you want to delete this case, please type '<b>{caseToDelete.title}</b>' below.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder={caseToDelete ? caseToDelete.title : "Case name"}
                value={deleteInput}
                onChange={e => setDeleteInput(e.target.value)}
                autoFocus
                onPaste={e => e.preventDefault()}
              />
              <p className="mt-6 text-sm text-muted-foreground">
                This will delete this case and all the documents it contains.<br />
                Consider closing this case instead! (<b>View Case</b> → <b>Edit Case Information</b>)
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting || !caseToDelete || deleteInput !== caseToDelete.title}
                onClick={async () => {
                  if (!caseToDelete) return;
                  setIsDeleting(true);
                  try {
                    const response = await fetch(`/api/cases/${caseToDelete.id}`, {
                      method: 'DELETE',
                    });
                    if (!response.ok) throw new Error('Failed to delete case');
                    setCasesData(casesData.filter(c => c.id !== caseToDelete.id));
                    setDeleteDialogOpen(false);
                    setCaseToDelete(null);
                    setDeleteInput("");
                    toast({
                      title: "Case deleted",
                      description: `Case '${caseToDelete.title}' was deleted successfully.`,
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: `Failed to delete case: ${caseToDelete.title}`,
                      variant: "destructive",
                    });
                  } finally {
                    setIsDeleting(false);
                  }
                }}
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
