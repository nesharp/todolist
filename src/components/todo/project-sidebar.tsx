"use client";

import { FolderInput, Inbox, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, useRef, useEffect } from "react";

import {
  createProjectAction,
  deleteProjectAction,
} from "@/app/actions/projects";
import type { ProjectItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

type ProjectSidebarProps = {
  projects: ProjectItem[];
  activeProjectId: string | null;
};

export function ProjectSidebar({
  projects,
  activeProjectId,
}: ProjectSidebarProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const onCreate = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Enter at least 2 characters.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const created = await createProjectAction(trimmed);
        setName("");
        setIsCreating(false);
        router.push(`/?project=${encodeURIComponent(created.id)}`);
        router.refresh();
      } catch {
        setError("Could not create project.");
      }
    });
  };

  const onDelete = (id: string) => {
    if (!window.confirm("Delete this project? Tasks will move to Inbox."))
      return;
    startTransition(async () => {
      try {
        await deleteProjectAction(id);
        if (activeProjectId === id) {
          router.push("/");
        }
        router.refresh();
      } catch {
        setError("Could not delete project.");
      }
    });
  };

  return (
    <nav aria-label="Projects" className="flex w-full flex-col gap-3">
      <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <Link
          href="/"
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors shadow-sm",
            activeProjectId === null
              ? "bg-primary text-primary-foreground"
              : "bg-card/50 border border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Inbox className="h-4 w-4" aria-hidden />
          Inbox
        </Link>

        {projects.map((p) => (
          <div key={p.id} className="group relative flex shrink-0 items-center">
            <Link
              href={`/?project=${encodeURIComponent(p.id)}`}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 pr-10 text-sm font-medium transition-colors shadow-sm",
                activeProjectId === p.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/50 border border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <FolderInput className="h-4 w-4" aria-hidden />
              <span>{p.name}</span>
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "absolute right-1 h-7 w-7 rounded-lg opacity-0 transition-opacity hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100",
                activeProjectId === p.id
                  ? "text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
                  : "text-muted-foreground",
              )}
              aria-label={`Delete project ${p.name}`}
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                onDelete(p.id);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}

        {!isCreating ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="shrink-0 h-[38px] rounded-xl border-dashed bg-transparent hover:bg-accent/50 gap-2"
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        ) : null}
      </div>

      <AnimatePresence>
        {isCreating ? (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 4 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="flex flex-col gap-2 overflow-hidden"
          >
            <div className="flex items-center gap-2 max-w-sm">
              <Input
                ref={inputRef}
                data-testid="new-project-name"
                placeholder="Project name..."
                value={name}
                disabled={pending}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onCreate();
                  } else if (e.key === "Escape") {
                    setIsCreating(false);
                    setName("");
                    setError(null);
                  }
                }}
                className="h-9 flex-1"
              />
              <Button
                size="sm"
                data-testid="new-project-submit"
                disabled={pending}
                onClick={onCreate}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() => {
                  setIsCreating(false);
                  setName("");
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </div>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
