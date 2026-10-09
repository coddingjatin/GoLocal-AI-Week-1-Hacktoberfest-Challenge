import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Cpu, Database, Globe, ShieldCheck, Terminal } from "lucide-react";
import { defaultConfig, getConfig, saveConfig, type AiConfig } from "@/lib/ai";
import { useAiStatus } from "@/components/AiStatusBadge";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "Open-weight AI & privacy — GoLocal AI" },
      { name: "description", content: "Which model GoLocal AI uses, how local inference works, and what is stored." },
      { property: "og:title", content: "Open-weight AI & privacy — GoLocal AI" },
      { property: "og:description", content: "Transparent, local-first AI for outdoor missions." },
    ],
  }),
  component: AiPage,
});

function AiPage() {
  const status = useAiStatus();
  const [cfg, setCfg] = useState<AiConfig>(defaultConfig());
  const [saved, setSaved] = useState(false);
  useEffect(() => setCfg(getConfig()), []);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <p className="eyebrow">Open-source AI transparency</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">Honest about the machine.</h1>

      <section className="card-soft mt-8 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl">Model settings</h2>
          <span className="text-sm font-semibold">
            {status.state === "checking" ? "Checking…" : status.state === "connected" ? `Connected · ${status.model}` : `Demo mode · ${status.reason}`}
          </span>
        </div>
        <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); saveConfig(cfg); setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
          <label><span className="eyebrow mb-2 block">Ollama endpoint</span><input className="field" value={cfg.url} onChange={(e) => setCfg({ ...cfg, url: e.target.value })} /></label>
          <label><span className="eyebrow mb-2 block">Model name</span><input className="field" value={cfg.model} onChange={(e) => setCfg({ ...cfg, model: e.target.value })} /></label>
          <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={cfg.enabled} onChange={(e) => setCfg({ ...cfg, enabled: e.target.checked })} className="h-4 w-4 accent-[var(--primary)]" /> Use the local model when available (otherwise always demo mode)</label>
          <div className="flex gap-3 sm:col-span-2">
            <button className="btn btn-primary">{saved ? "Saved — rechecking" : "Save & test connection"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => { const d = defaultConfig(); setCfg(d); saveConfig(d); }}>Reset</button>
          </div>
        </form>
        <pre className="mt-6 overflow-x-auto rounded-2xl bg-night p-4 text-xs text-night-foreground">{`# Run a local open-weight model
ollama pull ${cfg.model}
OLLAMA_ORIGINS="*" ollama serve`}</pre>
        <p className="mt-2 text-xs text-muted-foreground">OLLAMA_ORIGINS lets this web page talk to Ollama on your machine. When the app is hosted, your browser still calls Ollama directly on localhost.</p>
      </section>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {[
          { i: Cpu, t: "How local inference works", d: "Your browser sends the mission preferences or your reflection straight to Ollama on your computer. The model (Gemma by default) runs on your hardware and returns JSON, which the app validates and safety-filters before showing." },
          { i: Terminal, t: "Why model choice matters", d: "Open weights mean you can inspect, swap, or fine-tune the model — pick a smaller one for speed, a larger one for creativity, or a model tuned for your language." },
          { i: ShieldCheck, t: "What stays private", d: "With a local model, reflections never go to a third-party server. That's only true while inference stays local — pointing the endpoint at a remote host would send your text there." },
          { i: Globe, t: "What needs internet", d: "Loading the app and its fonts the first time. Missions in demo mode and the journal work in the browser without any AI service. Voice input may use your browser vendor's online speech service." },
          { i: Database, t: "What is stored", d: "Your journal (titles, reflections, compressed photos), the active mission, and these settings — all in this browser's local storage. Nothing is sent to us. Clearing site data deletes it." },
          { i: ShieldCheck, t: "Demo mode, clearly labelled", d: "Without a model, missions come from a curated deterministic library and summaries quote your own words. They're always marked as demo — we never claim AI ran when it didn't." },
        ].map((c) => (
          <div key={c.t} className="card-soft p-6">
            <c.i className="h-5 w-5 text-primary" />
            <h3 className="mt-3 text-xl">{c.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
