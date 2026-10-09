import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Cpu, FlaskConical, Trash2 } from "lucide-react";
import { store, useStore } from "@/lib/storage";

export const Route = createFileRoute("/journal/$id")({
  head: () => ({
    meta: [
      { title: "Journal entry — GoLocal AI" },
      { name: "description", content: "A discovery from one of your outdoor missions." },
      { property: "og:title", content: "Journal entry — GoLocal AI" },
      { property: "og:description", content: "A discovery from a real-world mission." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EntryPage,
});

function EntryPage() {
  const { id } = Route.useParams();
  const entries = useStore(store.getJournal);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  if (entries === undefined) return <div className="min-h-[60vh]" />;
  const e = entries.find((x) => x.id === id);
  if (!e)
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="text-3xl">Entry not found</h1>
        <Link to="/journal" className="btn btn-ghost mt-6">Back to journal</Link>
      </div>
    );

  return (
    <article className="mx-auto max-w-2xl px-5 py-10">
      <Link to="/journal" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Journal</Link>
      <p className="mt-8 text-sm text-muted-foreground">{new Date(e.date).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">{e.discoveryTitle}</h1>
      <p className="mt-2 text-muted-foreground">{e.missionTitle} · {e.activity} · {e.minutesSpent} of {e.durationMin} min</p>
      <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">
        {e.source === "ai" ? <><Cpu className="h-3 w-3" /> Summary by local model</> : <><FlaskConical className="h-3 w-3" /> Deterministic summary (no AI)</>}
      </span>
      {e.photo && <img src={e.photo} alt="Photo from this mission" className="mt-8 w-full rounded-[1.5rem] object-cover" />}
      <p className="mt-8 font-display text-xl leading-relaxed">{e.summary}</p>
      {e.reflection && (
        <section className="mt-8">
          <p className="eyebrow">Your reflection</p>
          <p className="mt-2 whitespace-pre-wrap">{e.reflection}</p>
        </section>
      )}
      <section className="mt-8">
        <p className="eyebrow">Tasks</p>
        <ul className="mt-3 space-y-2">
          {e.tasks.map((t, i) => (
            <li key={i} className={`flex gap-2 ${t.done ? "" : "text-muted-foreground"}`}>
              <Check className={`mt-1 h-4 w-4 shrink-0 ${t.done ? "text-primary" : "opacity-20"}`} />{t.text}
            </li>
          ))}
        </ul>
      </section>
      <div className="mt-12 border-t border-border pt-6">
        {confirming ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm">Delete this entry permanently?</span>
            <button className="btn bg-destructive text-destructive-foreground" onClick={() => { store.deleteEntry(e.id); navigate({ to: "/journal" }); }}>Delete</button>
            <button className="btn btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        ) : (
          <button className="btn btn-ghost text-destructive" onClick={() => setConfirming(true)}><Trash2 className="h-4 w-4" /> Delete entry</button>
        )}
      </div>
    </article>
  );
}
