import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { AiStatusBadge } from "./AiStatusBadge";

export function SiteHeader() {
  const link = "text-sm font-medium text-muted-foreground hover:text-foreground transition-colors";
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold">GoLocal AI</span>
        </Link>
        <nav className="hidden items-center gap-6 sm:flex">
          <Link to="/create" className={link} activeProps={{ className: "text-foreground" }}>New mission</Link>
          <Link to="/journal" className={link} activeProps={{ className: "text-foreground" }}>Journal</Link>
          <Link to="/ai" className={link} activeProps={{ className: "text-foreground" }}>Open AI</Link>
        </nav>
        <AiStatusBadge />
      </div>
      <nav className="flex justify-center gap-6 border-t border-border/60 py-2 sm:hidden">
        <Link to="/create" className={link}>New mission</Link>
        <Link to="/journal" className={link}>Journal</Link>
        <Link to="/ai" className={link}>Open AI</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <p><span className="font-display text-foreground">GoLocal AI</span> — Get out of the algorithm. Get into the real world.</p>
        <p>Hackathon MVP · Open-weight AI via Ollama · Your data stays in this browser.</p>
      </div>
    </footer>
  );
}
