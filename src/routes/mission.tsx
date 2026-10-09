import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Pause, Play, Square, Flag } from "lucide-react";
import { pause, remaining, resume, store, useStore } from "@/lib/storage";
import type { Session } from "@/lib/types";

export const Route = createFileRoute("/mission")({
  head: () => ({
    meta: [
      { title: "Phone Down Mode — GoLocal AI" },
      { name: "description", content: "A distraction-free timer for your outdoor mission." },
      { property: "og:title", content: "Phone Down Mode — GoLocal AI" },
      { property: "og:description", content: "Go explore. We'll be here when you return." },
    ],
  }),
  component: MissionPage,
});

function fmt(ms: number) {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function MissionPage() {
  const session = useStore(store.getSession);
  const navigate = useNavigate();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!session?.running) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [session?.running]);

  const left = session ? remaining(session, now) : 0;
  const done = session ? session.running && left <= 0 : false;

  useEffect(() => {
    if (done && session) store.setSession({ ...pause(session), finished: true });
  }, [done, session]);

  if (session === undefined) return <div className="min-h-[70vh]" />;
  if (session === null)
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="text-3xl">No active mission</h1>
        <p className="mt-2 text-muted-foreground">Create one first, then come back here to start the timer.</p>
        <Link to="/create" className="btn btn-primary mt-6">Create a mission</Link>
      </div>
    );

  const s: Session = session;
  const total = s.mission.durationMin * 60000;
  const pct = Math.min(1, 1 - left / total);
  const update = (n: Session) => store.setSession(n);
  const toggle = (i: number) => update({ ...s, checked: s.checked.map((c, j) => (j === i ? !c : c)) });
  const finish = () => {
    update({ ...pause(s), finished: true });
    navigate({ to: "/reflect" });
  };
  const ended = s.finished || left <= 0;

  return (
    <div className="min-h-[calc(100vh-57px)] bg-night text-night-foreground">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-5 py-12 text-center">
        <p className="eyebrow text-night-foreground/60">Phone Down Mode · {s.mission.title}</p>
        <div className="relative mt-10 grid h-72 w-72 place-items-center sm:h-80 sm:w-80">
          <div className="absolute inset-0 rounded-full bg-lime/10 animate-breathe" />
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden>
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="2" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--lime)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={289} strokeDashoffset={289 * (1 - pct)} style={{ transition: "stroke-dashoffset .5s linear" }} />
          </svg>
          <div>
            <div className="font-display text-7xl tabular-nums sm:text-8xl" role="timer" aria-live="off">{fmt(left)}</div>
            <p className="mt-1 text-sm text-night-foreground/60">{ended ? "Time's up" : s.running ? "remaining" : "paused"}</p>
          </div>
        </div>
        <p className="mt-10 font-display text-2xl italic">{ended ? "Welcome back." : "Go explore. We'll be here when you return."}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {!ended && (s.running ? (
            <button className="btn btn-night" onClick={() => update(pause(s))}><Pause className="h-4 w-4" /> Pause</button>
          ) : (
            <button className="btn btn-night" onClick={() => update(resume(s))}><Play className="h-4 w-4" /> Resume</button>
          ))}
          <button className="btn btn-lime" onClick={finish}><Flag className="h-4 w-4" /> {ended ? "Reflect on your mission" : "Complete mission"}</button>
          {!ended && <button className="btn btn-night" onClick={() => { if (confirm("End this mission without saving?")) { store.setSession(null); navigate({ to: "/create" }); } }}><Square className="h-4 w-4" /> End</button>}
        </div>

        <ul className="mt-12 w-full space-y-2 text-left">
          {s.mission.tasks.map((t, i) => (
            <li key={i}>
              <button onClick={() => toggle(i)} className="flex w-full items-start gap-3 rounded-2xl border border-night-foreground/10 p-4 text-left transition-colors hover:bg-night-foreground/5" aria-pressed={s.checked[i]}>
                <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border ${s.checked[i] ? "border-lime bg-lime text-accent-foreground" : "border-night-foreground/40"}`}>{s.checked[i] && <Check className="h-3 w-3" />}</span>
                <span className={s.checked[i] ? "text-night-foreground/50 line-through" : ""}>{t}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs text-night-foreground/50">GoLocal can't lock your phone or know where it is — that part's up to you.</p>
      </div>
    </div>
  );
}
