"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, FileText, Folder, MoreHorizontal, FolderPlus, Upload, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { toast } from "@/components/ui/use-toast"

export function TranscriptSidebar() {
  // File system state
  const [fileSystem, setFileSystem] = useState({
    trialDays: {
      name: "Trial Days",
      isOpen: true,
      items: [
        { id: "day1", name: "Day 1 - May 14, 2023", type: "file" },
        { id: "day2", name: "Day 2 - May 15, 2023", type: "file", active: true },
        { id: "day3", name: "Day 3 - May 16, 2023", type: "file" },
      ],
    },
    witnesses: {
      name: "Witnesses",
      isOpen: true,
      items: [
        { id: "witness1", name: "Officer Smith", type: "file" },
        { id: "witness2", name: "Dr. Williams", type: "file" },
        { id: "witness3", name: "Ms. Thompson", type: "file" },
      ],
    },
    exhibits: {
      name: "Exhibits",
      isOpen: false,
      items: [
        { id: "exhibit1", name: "Exhibit A - Police Report", type: "file" },
        { id: "exhibit2", name: "Exhibit B - Photographs", type: "file" },
        { id: "exhibit3", name: "Exhibit C - Medical Records", type: "file" },
      ],
    },
  })

  // UI state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null)
  const [isRenaming, setIsRenaming] = useState<{ section: string; itemId: string } | null>(null)
  const [newName, setNewName] = useState("")
  const [targetSection, setTargetSection] = useState<string | null>(null)

  // Toggle section open/closed
  const toggleSection = (section: string) => {
    setFileSystem((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        isOpen: !prev[section as keyof typeof prev].isOpen,
      },
    }))
  }

  // Create a new folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      })
      return
    }

    setFileSystem((prev) => ({
      ...prev,
      [newFolderName.toLowerCase().replace(/\s+/g, "")]: {
        name: newFolderName,
        isOpen: false,
        items: [],
      },
    }))

    setNewFolderName("")
    setIsCreatingFolder(false)

    toast({
      title: "Success",
      description: `Folder "${newFolderName}" created successfully`,
    })
  }

  // Upload files
  const handleUploadFiles = () => {
    if (!uploadedFiles || uploadedFiles.length === 0 || !targetSection) {
      toast({
        title: "Error",
        description: "No files selected for upload or no target folder selected",
        variant: "destructive",
      })
      return
    }

    const newItems = Array.from(uploadedFiles).map((file) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      type: "file",
    }))

    setFileSystem((prev) => ({
      ...prev,
      [targetSection]: {
        ...prev[targetSection as keyof typeof prev],
        items: [...prev[targetSection as keyof typeof prev].items, ...newItems],
      },
    }))

    setUploadedFiles(null)
    setIsUploadingFile(false)
    setTargetSection(null)

    toast({
      title: "Success",
      description: `${newItems.length} file(s) uploaded successfully`,
    })
  }

  // Delete an item
  const handleDelete = (section: string, itemId: string) => {
    setFileSystem((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        items: prev[section as keyof typeof prev].items.filter((item) => item.id !== itemId),
      },
    }))

    toast({
      title: "Success",
      description: "Item deleted successfully",
    })
  }

  // Delete a section
  const handleDeleteSection = (section: string) => {
    setFileSystem((prev) => {
      const { [section]: _, ...rest } = prev
      return rest
    })

    toast({
      title: "Success",
      description: `Section "${fileSystem[section as keyof typeof fileSystem].name}" deleted successfully`,
    })
  }

  // Rename an item
  const handleRename = () => {
    if (!isRenaming || !newName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      })
      return
    }

    const { section, itemId } = isRenaming

    setFileSystem((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        items: prev[section as keyof typeof prev].items.map((item) =>
          item.id === itemId ? { ...item, name: newName } : item,
        ),
      },
    }))

    setIsRenaming(null)
    setNewName("")

    toast({
      title: "Success",
      description: "Item renamed successfully",
    })
  }

  // Rename a section
  const handleRenameSection = (section: string, newSectionName: string) => {
    if (!newSectionName.trim()) {
      toast({
        title: "Error",
        description: "Section name cannot be empty",
        variant: "destructive",
      })
      return
    }

    setFileSystem((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        name: newSectionName,
      },
    }))

    toast({
      title: "Success",
      description: "Section renamed successfully",
    })
  }

  // Handle file drop
  const handleDrop = (e: React.DragEvent, section: string) => {
    e.preventDefault()

    if (e.dataTransfer.files.length > 0) {
      setUploadedFiles(e.dataTransfer.files)
      setTargetSection(section)
      setIsUploadingFile(true)
    }
  }

  // Prevent default for drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="hidden border-r bg-muted/40 lg:block lg:w-64" onDragOver={handleDragOver}>
      <div className="h-full py-2 overflow-auto">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2 px-4">
            <h2 className="text-lg font-semibold tracking-tight">Trial Navigation</h2>
            <div className="flex items-center space-x-1">
              <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="New Section">
                    <FolderPlus className="h-4 w-4" />
                    <span className="sr-only">New Section</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Section</DialogTitle>
                    <DialogDescription>Enter a name for the new section.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="folder-name">Section Name</Label>
                    <Input
                      id="folder-name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="New Section"
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatingFolder(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFolder}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isUploadingFile} onOpenChange={setIsUploadingFile}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" title="Upload Files">
                    <Upload className="h-4 w-4" />
                    <span className="sr-only">Upload Files</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>Select files to upload and choose a target section.</DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <div>
                      <Label htmlFor="target-section">Target Section</Label>
                      <select
                        id="target-section"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                        value={targetSection || ""}
                        onChange={(e) => setTargetSection(e.target.value)}
                      >
                        <option value="">Select a section</option>
                        {Object.keys(fileSystem).map((key) => (
                          <option key={key} value={key}>
                            {fileSystem[key as keyof typeof fileSystem].name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="file-upload">Files</Label>
                      <div className="mt-2 border-2 border-dashed rounded-md p-6 text-center">
                        <Input
                          id="file-upload"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => setUploadedFiles(e.target.files)}
                        />
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {uploadedFiles
                              ? `${uploadedFiles.length} file(s) selected`
                              : "Click to select files or drag and drop"}
                          </span>
                        </Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadingFile(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUploadFiles}>Upload</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="space-y-1">
            {Object.entries(fileSystem).map(([key, section]) => (
              <ContextMenu key={key}>
                <Collapsible open={section.isOpen} onOpenChange={() => toggleSection(key)}>
                  <ContextMenuTrigger>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between px-4 font-normal">
                        <div className="flex items-center">
                          <Folder className="mr-2 h-4 w-4" />
                          <span>{section.name}</span>
                        </div>
                        <div className="flex items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setTargetSection(key)
                                  setIsUploadingFile(true)
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload to this section
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const newName = prompt("Enter new name for section:", section.name)
                                  if (newName) handleRenameSection(key, newName)
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Rename section
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (
                                    confirm(
                                      `Are you sure you want to delete the "${section.name}" section and all its contents?`,
                                    )
                                  ) {
                                    handleDeleteSection(key)
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete section
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${section.isOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </Button>
                    </CollapsibleTrigger>
                  </ContextMenuTrigger>

                  <CollapsibleContent className="px-4 pb-2">
                    <div className="space-y-1" onDrop={(e) => handleDrop(e, key)}>
                      {section.items.map((item) => (
                        <ContextMenu key={item.id}>
                          <ContextMenuTrigger>
                            {isRenaming && isRenaming.section === key && isRenaming.itemId === item.id ? (
                              <div className="flex items-center pl-6 pr-2 py-1">
                                <Input
                                  value={newName}
                                  onChange={(e) => setNewName(e.target.value)}
                                  className="h-8 mr-2"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleRename()
                                    } else if (e.key === "Escape") {
                                      setIsRenaming(null)
                                      setNewName("")
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRename()
                                  }}
                                >
                                  Save
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                className={`w-full justify-start pl-6 font-normal ${
                                  item.active ? "bg-accent text-accent-foreground" : ""
                                }`}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                <span className="truncate">{item.name}</span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="ml-auto h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">More</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setIsRenaming({ section: key, itemId: item.id })
                                        setNewName(item.name)
                                      }}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
                                          handleDelete(key, item.id)
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </Button>
                            )}
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem
                              onClick={() => {
                                setIsRenaming({ section: key, itemId: item.id })
                                setNewName(item.name)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Rename
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
                                  handleDelete(key, item.id)
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}

                      {section.items.length === 0 && (
                        <div className="py-2 px-2 text-sm text-muted-foreground italic">
                          No items. Drag files here or use the upload button.
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => {
                      setTargetSection(key)
                      setIsUploadingFile(true)
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload to this section
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => {
                      const newName = prompt("Enter new name for section:", section.name)
                      if (newName) handleRenameSection(key, newName)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Rename section
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => {
                      if (
                        confirm(`Are you sure you want to delete the "${section.name}" section and all its contents?`)
                      ) {
                        handleDeleteSection(key)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete section
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

