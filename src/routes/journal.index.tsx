import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Search, ImageIcon } from "lucide-react";
import { store, useStore } from "@/lib/storage";
import { ACTIVITIES } from "@/lib/types";

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "Exploration journal — GoLocal AI" },
      { name: "description", content: "Your history of outdoor missions, reflections and discoveries." },
      { property: "og:title", content: "Exploration journal — GoLocal AI" },
      { property: "og:description", content: "A private journal of real-world discoveries." },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  const entries = useStore(store.getJournal);
  const [q, setQ] = useState("");
  const [act, setAct] = useState<string>("All");
  const list = useMemo(
    () => (entries ?? []).filter((e) => (act === "All" || e.activity === act) && `${e.missionTitle} ${e.discoveryTitle} ${e.reflection}`.toLowerCase().includes(q.toLowerCase())),
    [entries, q, act],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <p className="eyebrow">Your journal</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">Things you noticed.</h1>
      {entries && entries.length > 0 && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="field pl-10" placeholder="Search reflections…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search journal" />
          </label>
          <div className="flex flex-wrap gap-2">
            {["All", ...ACTIVITIES].map((a) => <button key={a} className="chip" aria-pressed={act === a} onClick={() => setAct(a)}>{a}</button>)}
          </div>
        </div>
      )}
      {entries === undefined ? null : entries.length === 0 ? (
        <div className="mt-12 rounded-[1.5rem] border border-dashed border-border p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-display text-2xl">Your journal is waiting for its first page</p>
          <p className="mt-1 text-muted-foreground">Complete a mission and reflect — it'll show up here.</p>
          <Link to="/create" className="btn btn-primary mt-6">Start your first mission</Link>
        </div>
      ) : list.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">No entries match your search.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((e) => (
            <Link key={e.id} to="/journal/$id" params={{ id: e.id }} className="card-soft overflow-hidden transition-transform hover:-translate-y-1">
              {e.photo ? <img src={e.photo} alt="" className="h-44 w-full object-cover" loading="lazy" /> : <div className="grid h-24 place-items-center bg-secondary"><ImageIcon className="h-5 w-5 text-primary/50" /></div>}
              <div className="p-5">
                <p className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString(undefined, { dateStyle: "medium" })} · {e.activity} · {e.minutesSpent} min</p>
                <h2 className="mt-2 text-xl">{e.discoveryTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{e.missionTitle}</p>
                <p className="mt-3 line-clamp-3 text-sm">{e.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
