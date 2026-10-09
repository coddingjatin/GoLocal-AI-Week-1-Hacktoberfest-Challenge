import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Check, Loader2, Mic, MicOff, Sun, X } from "lucide-react";
import { compressImage, remaining, store, useStore } from "@/lib/storage";
import { summarizeReflection } from "@/lib/ai";

export const Route = createFileRoute("/reflect")({
  head: () => ({
    meta: [
      { title: "Reflect — GoLocal AI" },
      { name: "description", content: "Write or speak what you noticed, and save it to your exploration journal." },
      { property: "og:title", content: "Reflect — GoLocal AI" },
      { property: "og:description", content: "Turn your outdoor reflection into a discovery journal entry." },
    ],
  }),
  component: ReflectPage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SR = any;

function ReflectPage() {
  const session = useStore(store.getSession);
  const navigate = useNavigate();
  const [checked, setChecked] = useState<boolean[]>([]);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [speechOk, setSpeechOk] = useState(false);
  const recRef = useRef<SR>(null);

  useEffect(() => {
    if (session) setChecked(session.checked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.mission.id]);

  useEffect(() => {
    const w = window as SR;
    setSpeechOk(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    return () => recRef.current?.stop?.();
  }, []);

  function toggleMic() {
    if (listening) { recRef.current?.stop(); return; }
    const w = window as SR;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e: SR) => {
      const t = Array.from(e.results as ArrayLike<SR>).slice(e.resultIndex).map((r: SR) => r[0].transcript).join(" ");
      setText((p) => (p ? p.trimEnd() + " " : "") + t.trim());
    };
    rec.onerror = () => { setListening(false); setError("Voice input stopped — you can keep typing instead."); };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  if (session === undefined) return <div className="min-h-[60vh]" />;
  if (!session)
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <h1 className="text-3xl">Nothing to reflect on yet</h1>
        <p className="mt-2 text-muted-foreground">Finish a mission and you'll land here.</p>
        <Link to="/create" className="btn btn-primary mt-6">Start a mission</Link>
      </div>
    );

  async function save() {
    if (!session) return;
    setSaving(true);
    setError(null);
    const tasks = session.mission.tasks.map((t, i) => ({ text: t, done: !!checked[i] }));
    try {
      const r = await summarizeReflection(text, session.mission.title, tasks);
      const spent = Math.max(1, Math.round((session.mission.durationMin * 60000 - remaining(session)) / 60000));
      const id = crypto.randomUUID();
      store.addEntry({
        id, date: Date.now(), missionTitle: session.mission.title, activity: session.mission.prefs.activity,
        durationMin: session.mission.durationMin, minutesSpent: spent, tasks, reflection: text.trim(),
        discoveryTitle: r.value.discoveryTitle, summary: r.value.summary, photo, source: r.source,
        model: r.source === "ai" ? session.mission.model ?? undefined : undefined,
      });
      store.setSession(null);
      navigate({ to: "/journal/$id", params: { id } });
    } catch (e) {
      setError(e instanceof DOMException && e.name === "QuotaExceededError" ? "Browser storage is full — try removing the photo or deleting old entries." : "Couldn't save the entry. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="text-center">
        <Sun className="mx-auto h-8 w-8 text-earth" />
        <h1 className="mt-4 text-4xl sm:text-5xl">Welcome back.</h1>
        <p className="mt-2 text-muted-foreground">How was <span className="font-semibold text-foreground">{session.mission.title}</span>?</p>
      </div>

      <section className="card-soft mt-10 p-6">
        <p className="eyebrow">What did you do?</p>
        <ul className="mt-4 space-y-2">
          {session.mission.tasks.map((t, i) => (
            <li key={i}>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-muted">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--primary)]" checked={!!checked[i]} onChange={() => setChecked((c) => c.map((v, j) => (j === i ? !v : v)))} />
                <span>{t}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-soft mt-6 p-6">
        <div className="flex items-center justify-between">
          <p className="eyebrow">What did you notice?</p>
          {speechOk ? (
            <button type="button" onClick={toggleMic} className={`chip ${listening ? "animate-pulse" : ""}`} aria-pressed={listening}>
              {listening ? <><MicOff className="h-4 w-4" /> Stop</> : <><Mic className="h-4 w-4" /> Speak</>}
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">Voice input not supported here — type instead</span>
          )}
        </div>
        <textarea className="field mt-4 min-h-40" placeholder="The light through the trees, a sound you hadn't noticed, how you felt…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="mt-4">
          {photo ? (
            <div className="relative inline-block">
              <img src={photo} alt="Your photo from this mission" className="h-32 rounded-xl object-cover" />
              <button onClick={() => setPhoto(undefined)} className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-foreground text-background" aria-label="Remove photo"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <label className="chip cursor-pointer"><Camera className="h-4 w-4" /> Add a photo (optional)
              <input type="file" accept="image/*" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { try { setPhoto(await compressImage(f)); } catch { setError("That image couldn't be read."); } } }} />
            </label>
          )}
        </div>
      </section>

      {error && <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <button onClick={save} disabled={saving} className="btn btn-primary mt-8 w-full">
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Writing your journal entry…</> : <><Check className="h-4 w-4" /> Save to journal</>}
      </button>
      <p className="mt-3 text-center text-xs text-muted-foreground">Your entry is built only from what you write here — nothing is invented.</p>
    </div>
  );
}
