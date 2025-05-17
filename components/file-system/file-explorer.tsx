"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Folder, File, FileText, Upload, MoreVertical, FolderPlus, Trash2, Edit, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

// Define file system types
export type FileType = "folder" | "document" | "image" | "audio" | "video" | "pdf" | "other"

export interface FileSystemItem {
  id: string
  name: string
  type: FileType
  parentId: string | null
  children?: string[]
  dateCreated: Date
  dateModified: Date
  size?: number
  url?: string
  metadata?: Record<string, any>
}

interface FileExplorerProps {
  onFileSelect?: (file: FileSystemItem) => void
  initialPath?: string[]
}

export function FileExplorer({ onFileSelect, initialPath = [] }: FileExplorerProps) {
  // Initial file system data
  const [fileSystem, setFileSystem] = useState<Record<string, FileSystemItem>>({
    root: {
      id: "root",
      name: "Trial Documents",
      type: "folder",
      parentId: null,
      children: ["folder-1", "folder-2", "folder-3"],
      dateCreated: new Date("2023-01-01"),
      dateModified: new Date("2023-01-01"),
    },
    "folder-1": {
      id: "folder-1",
      name: "Trial Days",
      type: "folder",
      parentId: "root",
      children: ["file-1", "file-2", "file-3"],
      dateCreated: new Date("2023-01-02"),
      dateModified: new Date("2023-01-02"),
    },
    "folder-2": {
      id: "folder-2",
      name: "Witnesses",
      type: "folder",
      parentId: "root",
      children: ["file-4", "file-5", "file-6"],
      dateCreated: new Date("2023-01-03"),
      dateModified: new Date("2023-01-03"),
    },
    "folder-3": {
      id: "folder-3",
      name: "Exhibits",
      type: "folder",
      parentId: "root",
      children: ["file-7", "file-8", "file-9"],
      dateCreated: new Date("2023-01-04"),
      dateModified: new Date("2023-01-04"),
    },
    "file-1": {
      id: "file-1",
      name: "Day 1 - May 14, 2023.pdf",
      type: "pdf",
      parentId: "folder-1",
      dateCreated: new Date("2023-05-14"),
      dateModified: new Date("2023-05-14"),
      size: 1024 * 1024 * 2.5, // 2.5 MB
    },
    "file-2": {
      id: "file-2",
      name: "Day 2 - May 15, 2023.pdf",
      type: "pdf",
      parentId: "folder-1",
      dateCreated: new Date("2023-05-15"),
      dateModified: new Date("2023-05-15"),
      size: 1024 * 1024 * 3.2, // 3.2 MB
    },
    "file-3": {
      id: "file-3",
      name: "Day 3 - May 16, 2023.pdf",
      type: "pdf",
      parentId: "folder-1",
      dateCreated: new Date("2023-05-16"),
      dateModified: new Date("2023-05-16"),
      size: 1024 * 1024 * 2.8, // 2.8 MB
    },
    "file-4": {
      id: "file-4",
      name: "Officer Smith.docx",
      type: "document",
      parentId: "folder-2",
      dateCreated: new Date("2023-05-14"),
      dateModified: new Date("2023-05-14"),
      size: 1024 * 512, // 512 KB
    },
    "file-5": {
      id: "file-5",
      name: "Dr. Williams.docx",
      type: "document",
      parentId: "folder-2",
      dateCreated: new Date("2023-05-15"),
      dateModified: new Date("2023-05-15"),
      size: 1024 * 480, // 480 KB
    },
    "file-6": {
      id: "file-6",
      name: "Ms. Thompson.docx",
      type: "document",
      parentId: "folder-2",
      dateCreated: new Date("2023-05-16"),
      dateModified: new Date("2023-05-16"),
      size: 1024 * 620, // 620 KB
    },
    "file-7": {
      id: "file-7",
      name: "Exhibit A - Police Report.pdf",
      type: "pdf",
      parentId: "folder-3",
      dateCreated: new Date("2023-05-14"),
      dateModified: new Date("2023-05-14"),
      size: 1024 * 1024 * 1.2, // 1.2 MB
    },
    "file-8": {
      id: "file-8",
      name: "Exhibit B - Photographs.zip",
      type: "other",
      parentId: "folder-3",
      dateCreated: new Date("2023-05-15"),
      dateModified: new Date("2023-05-15"),
      size: 1024 * 1024 * 15.7, // 15.7 MB
    },
    "file-9": {
      id: "file-9",
      name: "Exhibit C - Medical Records.pdf",
      type: "pdf",
      parentId: "folder-3",
      dateCreated: new Date("2023-05-16"),
      dateModified: new Date("2023-05-16"),
      size: 1024 * 1024 * 4.3, // 4.3 MB
    },
  })

  // Current navigation state
  const [currentPath, setCurrentPath] = useState<string[]>(initialPath.length ? initialPath : ["root"])
  const currentFolderId = currentPath[currentPath.length - 1]
  const currentFolder = fileSystem[currentFolderId]

  // UI state
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isRenaming, setIsRenaming] = useState<string | null>(null)
  const [newName, setNewName] = useState("")
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [isUploadingFile, setIsUploadingFile] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<FileList | null>(null)

  // Get children of current folder
  const currentItems = currentFolder?.children?.map((id) => fileSystem[id]) || []

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined) return "—"

    const units = ["B", "KB", "MB", "GB"]
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  // Get icon for file type
  const getFileIcon = (type: FileType) => {
    switch (type) {
      case "folder":
        return <Folder className="h-4 w-4" />
      case "document":
        return <File className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  // Navigate to a folder
  const navigateToFolder = (folderId: string) => {
    if (fileSystem[folderId]?.type !== "folder") return

    const newPath = [...currentPath]
    const existingIndex = newPath.indexOf(folderId)

    if (existingIndex !== -1) {
      // If folder is already in path, go back to that level
      setCurrentPath(newPath.slice(0, existingIndex + 1))
    } else {
      // Otherwise add to path
      setCurrentPath([...newPath, folderId])
    }
  }

  // Navigate up one level
  const navigateUp = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1))
    }
  }

  // Select a file
  const handleSelect = (item: FileSystemItem) => {
    setSelectedItem(item.id)
    if (item.type !== "folder" && onFileSelect) {
      onFileSelect(item)
    } else if (item.type === "folder") {
      navigateToFolder(item.id)
    }
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

    const newId = `folder-${Date.now()}`
    const newFolder: FileSystemItem = {
      id: newId,
      name: newFolderName,
      type: "folder",
      parentId: currentFolderId,
      children: [],
      dateCreated: new Date(),
      dateModified: new Date(),
    }

    // Update file system
    setFileSystem((prev) => {
      const updated = { ...prev, [newId]: newFolder }

      // Update parent's children
      const parent = { ...prev[currentFolderId] }
      parent.children = [...(parent.children || []), newId]
      parent.dateModified = new Date()

      return { ...updated, [currentFolderId]: parent }
    })

    setNewFolderName("")
    setIsCreatingFolder(false)

    toast({
      title: "Success",
      description: `Folder "${newFolderName}" created successfully`,
    })
  }

  // Upload files
  const handleUploadFiles = () => {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      toast({
        title: "Error",
        description: "No files selected for upload",
        variant: "destructive",
      })
      return
    }

    const newFiles: Record<string, FileSystemItem> = {}
    const newFileIds: string[] = []

    Array.from(uploadedFiles).forEach((file) => {
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const fileType = getFileTypeFromName(file.name)

      newFiles[fileId] = {
        id: fileId,
        name: file.name,
        type: fileType,
        parentId: currentFolderId,
        dateCreated: new Date(),
        dateModified: new Date(),
        size: file.size,
        // In a real app, you would upload the file to a server and get a URL
        url: URL.createObjectURL(file),
      }

      newFileIds.push(fileId)
    })

    // Update file system
    setFileSystem((prev) => {
      const updated = { ...prev, ...newFiles }

      // Update parent's children
      const parent = { ...prev[currentFolderId] }
      parent.children = [...(parent.children || []), ...newFileIds]
      parent.dateModified = new Date()

      return { ...updated, [currentFolderId]: parent }
    })

    setUploadedFiles(null)
    setIsUploadingFile(false)

    toast({
      title: "Success",
      description: `${newFileIds.length} file(s) uploaded successfully`,
    })
  }

  // Delete an item
  const handleDelete = (itemId: string) => {
    const item = fileSystem[itemId]
    if (!item) return

    // Recursively collect all descendant IDs for deletion
    const idsToDelete: string[] = [itemId]

    const collectDescendants = (id: string) => {
      const item = fileSystem[id]
      if (item?.children?.length) {
        item.children.forEach((childId) => {
          idsToDelete.push(childId)
          collectDescendants(childId)
        })
      }
    }

    if (item.type === "folder") {
      collectDescendants(itemId)
    }

    // Update file system
    setFileSystem((prev) => {
      const updated = { ...prev }

      // Remove all collected items
      idsToDelete.forEach((id) => {
        delete updated[id]
      })

      // Update parent's children
      if (item.parentId) {
        const parent = { ...prev[item.parentId] }
        parent.children = parent.children?.filter((id) => id !== itemId) || []
        parent.dateModified = new Date()
        updated[item.parentId] = parent
      }

      return updated
    })

    if (selectedItem === itemId) {
      setSelectedItem(null)
    }

    toast({
      title: "Success",
      description: `"${item.name}" deleted successfully`,
    })
  }

  // Rename an item
  const handleRename = (itemId: string) => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      })
      return
    }

    setFileSystem((prev) => {
      const item = { ...prev[itemId], name: newName, dateModified: new Date() }
      return { ...prev, [itemId]: item }
    })

    setIsRenaming(null)
    setNewName("")

    toast({
      title: "Success",
      description: `Item renamed successfully`,
    })
  }

  // Helper to determine file type from name
  const getFileTypeFromName = (fileName: string): FileType => {
    const extension = fileName.split(".").pop()?.toLowerCase() || ""

    switch (extension) {
      case "pdf":
        return "pdf"
      case "doc":
      case "docx":
      case "txt":
        return "document"
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "image"
      case "mp3":
      case "wav":
        return "audio"
      case "mp4":
      case "mov":
        return "video"
      default:
        return "other"
    }
  }

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()

    if (e.dataTransfer.files.length > 0) {
      setUploadedFiles(e.dataTransfer.files)
      setIsUploadingFile(true)
    }
  }, [])

  // Prevent default for drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  return (
    <div className="h-full flex flex-col" onDrop={handleDrop} onDragOver={handleDragOver}>
      {/* Navigation bar */}
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={navigateUp} disabled={currentPath.length <= 1}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="sr-only">Back</span>
          </Button>

          <div className="flex items-center text-sm">
            {currentPath.map((id, index) => (
              <div key={id} className="flex items-center">
                {index > 0 && <span className="mx-1">/</span>}
                <button
                  className="hover:underline font-medium"
                  onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                >
                  {fileSystem[id]?.name || id}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Dialog open={isCreatingFolder} onOpenChange={setIsCreatingFolder}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" title="New Folder">
                <FolderPlus className="h-4 w-4" />
                <span className="sr-only">New Folder</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>Enter a name for the new folder.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="folder-name">Folder Name</Label>
                <Input
                  id="folder-name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New Folder"
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
                <DialogDescription>Select files to upload to the current folder.</DialogDescription>
              </DialogHeader>
              <div className="py-4">
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

      {/* File list */}
      <div className="flex-1 overflow-auto">
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Folder className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">This folder is empty</h3>
            <p className="text-sm text-muted-foreground mt-1">Upload files or create a new folder to get started</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {currentItems.map((item) => (
              <ContextMenu key={item.id}>
                <ContextMenuTrigger>
                  <div
                    className={`flex items-center p-2 rounded-md cursor-pointer ${
                      selectedItem === item.id ? "bg-accent" : "hover:bg-muted"
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    {isRenaming === item.id ? (
                      <div className="flex-1 flex items-center">
                        <Input
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="h-8"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleRename(item.id)
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
                          className="ml-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRename(item.id)
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsRenaming(null)
                            setNewName("")
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="mr-2 text-muted-foreground">{getFileIcon(item.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="truncate font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.type === "folder"
                              ? `${item.children?.length || 0} item(s)`
                              : formatFileSize(item.size)}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {item.type !== "folder" && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // In a real app, you would download the file
                                  toast({
                                    title: "Download started",
                                    description: `Downloading ${item.name}`,
                                  })
                                }}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setIsRenaming(item.id)
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
                                handleDelete(item.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  {item.type !== "folder" && (
                    <ContextMenuItem
                      onClick={() => {
                        // In a real app, you would download the file
                        toast({
                          title: "Download started",
                          description: `Downloading ${item.name}`,
                        })
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </ContextMenuItem>
                  )}
                  <ContextMenuItem
                    onClick={() => {
                      setIsRenaming(item.id)
                      setNewName(item.name)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Rename
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

