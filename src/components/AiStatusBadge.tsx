import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cpu, FlaskConical, Loader2 } from "lucide-react";
import { checkStatus, type AiStatus } from "@/lib/ai";

export function useAiStatus() {
  const [status, setStatus] = useState<AiStatus>({ state: "checking" });
  useEffect(() => {
    let alive = true;
    const run = () => checkStatus().then((s) => alive && setStatus(s));
    run();
    window.addEventListener("golocal-ai-config", run);
    return () => {
      alive = false;
      window.removeEventListener("golocal-ai-config", run);
    };
  }, []);
  return status;
}

export function AiStatusBadge() {
  const s = useAiStatus();
  return (
    <Link
      to="/ai"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
      title={s.state === "demo" ? s.reason : undefined}
    >
      {s.state === "checking" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {s.state === "connected" && (
        <>
          <span className="h-2 w-2 rounded-full bg-primary" />
          <Cpu className="h-3.5 w-3.5" /> {s.model}
        </>
      )}
      {s.state === "demo" && (
        <>
          <span className="h-2 w-2 rounded-full bg-earth" />
          <FlaskConical className="h-3.5 w-3.5" /> Demo mode
        </>
      )}
    </Link>
  );
}
