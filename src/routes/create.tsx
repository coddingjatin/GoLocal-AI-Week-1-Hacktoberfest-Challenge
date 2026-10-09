import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, PhoneOff, RefreshCw, ShieldCheck, Compass, FlaskConical, Cpu } from "lucide-react";
import { ACTIVITIES, DIFFICULTIES, DURATIONS, ENVIRONMENTS, type Activity, type Mission, type MissionPrefs } from "@/lib/types";
import { generateMission } from "@/lib/ai";
import { startSession, store } from "@/lib/storage";

export const Route = createFileRoute("/create")({
  validateSearch: (s: Record<string, unknown>): { activity?: Activity | undefined } => ({
    activity: ACTIVITIES.includes(s['activity'] as Activity) ? (s['activity'] as Activity) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create a mission — GoLocal AI" },
      { name: "description", content: "Design a personalized outdoor mission by activity, time, difficulty and setting." },
      { property: "og:title", content: "Create a mission — GoLocal AI" },
      { property: "og:description", content: "Generate a personalized real-world mission with open-weight AI." },
    ],
  }),
  component: CreatePage,
});

function Chips<T extends string | number>({ label, options, value, onChange, fmt }: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void; fmt?: (v: T) => string }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-3">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button type="button" key={String(o)} className="chip" aria-pressed={o === value} onClick={() => onChange(o)}>
            {fmt ? fmt(o) : String(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function CreatePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<MissionPrefs>({ activity: search.activity ?? "Walk", duration: 30, difficulty: "Curious", environment: "Anywhere", notes: "" });
  const [loading, setLoading] = useState(false);
  const [mission, setMission] = useState<Mission | null>(null);
  const [note, setNote] = useState<string | undefined>();
  const set = <K extends keyof MissionPrefs>(k: K, v: MissionPrefs[K]) => setPrefs((p) => ({ ...p, [k]: v }));

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      const r = await generateMission(prefs);
      setMission(r.value);
      setNote(r.note);
      store.setDraft(r.value);
    } finally {
      setLoading(false);
    }
  }

  function start() {
    if (!mission) return;
    startSession(mission);
    navigate({ to: "/mission" });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <p className="eyebrow">Mission creator</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">What kind of outside today?</h1>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <form onSubmit={submit} className="card-soft space-y-7 p-6 sm:p-8">
          <Chips label="Activity" options={ACTIVITIES} value={prefs['activity']} onChange={(v) => set("activity", v)} />
          <Chips label="Duration" options={DURATIONS} value={prefs.duration as (typeof DURATIONS)[number]} onChange={(v) => set("duration", v)} fmt={(v) => `${v} min`} />
          <Chips label="Difficulty" options={DIFFICULTIES} value={prefs.difficulty} onChange={(v) => set("difficulty", v)} />
          <Chips label="Environment" options={ENVIRONMENTS} value={prefs.environment} onChange={(v) => set("environment", v)} />
          <label className="block">
            <span className="eyebrow mb-3 block">Interests or accessibility (optional)</span>
            <textarea className="field min-h-24" maxLength={300} placeholder="e.g. I love trees, I use a wheelchair, I prefer quiet spots…" value={prefs.notes} onChange={(e) => set("notes", e.target.value)} />
          </label>
          <button className="btn btn-primary w-full" disabled={loading}>
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Crafting your mission…</> : "Generate mission"}
          </button>
        </form>

        <div aria-live="polite">
          {!mission && !loading && (
            <div className="grid h-full min-h-72 place-items-center rounded-[1.5rem] border border-dashed border-border p-8 text-center">
              <div>
                <Compass className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-display text-xl">Your mission will appear here</p>
                <p className="mt-1 text-sm text-muted-foreground">Pick your preferences and hit generate.</p>
              </div>
            </div>
          )}
          {loading && !mission && (
            <div className="card-soft space-y-3 p-8">
              {[60, 90, 75, 85, 70].map((w, i) => <div key={i} className="h-4 animate-pulse rounded bg-muted" style={{ width: `${w}%` }} />)}
            </div>
          )}
          {mission && (
            <article className={`card-soft p-6 sm:p-8 ${loading ? "opacity-50" : ""}`}>
              <div className="flex flex-wrap items-center gap-2">
                {mission.source === "ai" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold"><Cpu className="h-3 w-3" /> Generated by {mission.model}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold" title={note}><FlaskConical className="h-3 w-3" /> Demo mission (no AI inference)</span>
                )}
                <span className="text-xs text-muted-foreground">{mission.durationMin} min · {mission.prefs['activity']} · {mission.prefs.difficulty}</span>
              </div>
              {note && mission.source === "demo" && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
              <h2 className="mt-4 text-3xl">{mission.title}</h2>
              <p className="mt-2 text-muted-foreground">{mission.description}</p>
              <ol className="mt-6 space-y-3">
                {mission.tasks.map((t, i) => (
                  <li key={i} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">{i + 1}</span><span>{t}</span></li>
                ))}
              </ol>
              <div className="mt-6 space-y-3 rounded-2xl bg-muted p-4 text-sm">
                <p className="flex gap-2"><Compass className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{mission.exploration}</p>
                <p className="flex gap-2"><PhoneOff className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{mission.phoneDown}</p>
                <p className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{mission.safety}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={start} className="btn btn-primary"><PhoneOff className="h-4 w-4" /> Start Phone Down Mode</button>
                <button onClick={() => submit()} disabled={loading} className="btn btn-ghost"><RefreshCw className="h-4 w-4" /> Regenerate</button>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
