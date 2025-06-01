"use client"

import { useState } from "react"
import { useProject } from "@/context/project-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function ProjectSelector() {
  const { projects, currentProject, selectProject, createProject, deleteProject } = useProject()
  const [newProjectName, setNewProjectName] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim())
      setNewProjectName("")
      setIsCreateDialogOpen(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {" "}
      {/* Reduced gap */}
      <div className="flex items-center gap-1">
        {" "}
        {/* Reduced gap */}
        <Select value={currentProject?.id} onValueChange={selectProject}>
          <SelectTrigger className="w-[140px] h-7 text-xs">
            {" "}
            {/* Reduced width, height, and text size */}
            <SelectValue placeholder="Select project" /> {/* Shortened placeholder */}
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id} className="text-xs">
                {" "}
                {/* Reduced text size */}
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-7 w-7">
              {" "}
              {/* Reduced size */}
              <PlusCircle className="h-3 w-3" /> {/* Reduced icon size */}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Enter a name for your new project.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Awesome Project"
                className="mt-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateProject()
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {currentProject && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="text-destructive h-7 w-7">
                {" "}
                {/* Reduced size */}
                <Trash2 className="h-3 w-3" /> {/* Reduced icon size */}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the project "{currentProject.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteProject(currentProject.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
