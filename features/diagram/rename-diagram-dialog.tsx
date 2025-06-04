"use client"

import { useState, useEffect } from "react"
import { useProject } from "@/lib/context/project-context"
import type { Diagram } from "@/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface RenameDiagramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  diagram: Diagram | null
  projectId: string
}

export function RenameDiagramDialog({ open, onOpenChange, diagram, projectId }: RenameDiagramDialogProps) {
  const { updateDiagram } = useProject()
  const [diagramName, setDiagramName] = useState("")

  useEffect(() => {
    if (diagram) {
      setDiagramName(diagram.name)
    }
  }, [diagram])

  const handleRenameDiagram = () => {
    if (diagramName.trim() && diagram && projectId) {
      updateDiagram(projectId, diagram.id, { name: diagramName.trim() })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Diagram</DialogTitle>
          <DialogDescription>Enter a new name for your diagram.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="diagram-name" className="text-right">
              Name
            </Label>
            <Input
              id="diagram-name"
              value={diagramName}
              onChange={(e) => setDiagramName(e.target.value)}
              className="col-span-3"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameDiagram()
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRenameDiagram} disabled={!diagramName.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
