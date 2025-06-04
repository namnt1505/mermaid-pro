"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { useProject } from "@/context/project-context"
import { DIAGRAM_TEMPLATES } from "@/lib/constants"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface AddDiagramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onDiagramAdded?: (diagramId: string) => void
}

export function AddDiagramDialog({ open, onOpenChange, projectId, onDiagramAdded }: AddDiagramDialogProps) {
  const { addDiagram } = useProject()
  const dispatch = useDispatch()
  const [diagramName, setDiagramName] = useState("")
  const [diagramCode, setDiagramCode] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  const handleSelectTemplate = (templateName: string) => {
    const template = DIAGRAM_TEMPLATES.find((t) => t.name === templateName)
    if (template) {
      setDiagramCode(template.code)
      if (!diagramName) {
        setDiagramName(template.name)
      }
    }
    setSelectedTemplate(templateName)
  }

  const handleAddDiagram = () => {
    if (diagramName.trim() && diagramCode.trim() && projectId) {
      const newDiagramId = addDiagram(projectId, diagramName.trim(), diagramCode.trim())
      setDiagramName("")
      setDiagramCode("")
      setSelectedTemplate("")
      onOpenChange(false)
      if (onDiagramAdded && newDiagramId) {
        onDiagramAdded(newDiagramId)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Diagram</DialogTitle>
          <DialogDescription>Create a new diagram or select from a template to get started.</DialogDescription>
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
              placeholder="My Diagram"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="diagram-template" className="text-right">
              Template
            </Label>
            <Select value={selectedTemplate} onValueChange={handleSelectTemplate}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a template or start from scratch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Start from scratch</SelectItem>
                {DIAGRAM_TEMPLATES.map((template) => (
                  <SelectItem key={template.name} value={template.name}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="diagram-code" className="text-right pt-2">
              Code
            </Label>
            <Textarea
              id="diagram-code"
              value={diagramCode}
              onChange={(e) => setDiagramCode(e.target.value)}
              placeholder="Enter your Mermaid code here..."
              className="col-span-3 h-[200px] font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddDiagram} disabled={!diagramName.trim() || !diagramCode.trim()}>
            Add Diagram
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
