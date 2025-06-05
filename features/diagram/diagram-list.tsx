"use client"

import { useState } from "react"
import { useProjectStore } from "@/lib/hooks/use-project-store"
import type { DiagramMetadata } from "@/types"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Edit2, Trash2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RenameDiagramDialog } from "@/features/diagram/rename-diagram-dialog"

interface DiagramListProps {
  diagrams: DiagramMetadata[]
}

export function DiagramList({ diagrams }: DiagramListProps) {
  const { currentProject, deleteDiagram, selectedDiagramId, selectDiagram } = useProjectStore()
  const [diagramToDelete, setDiagramToDelete] = useState<string | null>(null)
  const [diagramToRename, setDiagramToRename] = useState<DiagramMetadata | null>(null)

  const handleDeleteDiagram = () => {
    if (diagramToDelete && currentProject) {
      deleteDiagram(currentProject.id, diagramToDelete)
      if (selectedDiagramId === diagramToDelete && diagrams.length > 1) {
        const remainingDiagrams = diagrams.filter((d) => d.id !== diagramToDelete)
        if (remainingDiagrams.length > 0) {
          selectDiagram(remainingDiagrams[0].id)
        }
      }
      setDiagramToDelete(null)
    }
  }

  return (
    <div className="space-y-1">
      {diagrams.length > 0 ? (
        <ScrollArea className="h-[120px] pr-1">
          {" "}
          {/* Reduced height and padding */}
          <div className="space-y-1">
            {diagrams.map((diagram) => (
              <div
                key={diagram.id}
                className={`group flex items-center justify-between p-1 rounded-sm cursor-pointer transition-colors text-xs ${
                  selectedDiagramId === diagram.id ? "bg-primary/10 border border-primary/30" : "hover:bg-accent"
                }`} // Reduced padding, border radius, and text size
                onClick={() => selectDiagram(diagram.id)}
              >
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  {" "}
                  {/* Reduced gap */}
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" /> {/* Reduced size */}
                  <span className="font-medium truncate">{diagram.name}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" // Reduced size
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-2.5 w-2.5" /> {/* Reduced icon size */}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-28">
                    {" "}
                    {/* Reduced width */}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        setDiagramToRename(diagram)
                      }}
                      className="text-xs" // Reduced text size
                    >
                      <Edit2 className="h-2.5 w-2.5 mr-1" /> {/* Reduced icon size and margin */}
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        setDiagramToDelete(diagram.id)
                      }}
                      className="text-destructive text-xs" // Reduced text size
                    >
                      <Trash2 className="h-2.5 w-2.5 mr-1" /> {/* Reduced icon size and margin */}
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center text-muted-foreground p-2 text-xs">
          {" "}
          {/* Reduced padding */}
          <p>No diagrams yet.</p>
        </div>
      )}

      <AlertDialog open={!!diagramToDelete} onOpenChange={(open) => !open && setDiagramToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Diagram</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this diagram? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDiagram}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <RenameDiagramDialog
        open={!!diagramToRename}
        onOpenChange={(open) => !open && setDiagramToRename(null)}
        diagram={diagramToRename}
        projectId={currentProject?.id || ""}
      />
    </div>
  )
}
