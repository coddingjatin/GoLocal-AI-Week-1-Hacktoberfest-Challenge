import type { Mission, MissionPrefs, Source } from "./types";
import { demoMission, demoReflection } from "./demo";
import { DEFAULT_SAFETY, filterSafeTasks } from "./safety";

const CFG_KEY = "golocal.aiConfig";

export interface AiConfig {
  url: string;
  model: string;
  enabled: boolean;
}

export function defaultConfig(): AiConfig {
  return {
    url: (import.meta.env['VITE_OLLAMA_URL'] as string) || "http://localhost:11434",
    model: (import.meta.env['VITE_OLLAMA_MODEL'] as string) || "gemma3:4b",
    enabled: (import.meta.env['VITE_AI_ENABLED'] as string) !== "false",
  };
}

export function getConfig(): AiConfig {
  if (typeof window === "undefined") return defaultConfig();
  try {
    const raw = localStorage.getItem(CFG_KEY);
    return raw ? { ...defaultConfig(), ...JSON.parse(raw) } : defaultConfig();
  } catch {
    return defaultConfig();
  }
}

export function saveConfig(cfg: AiConfig) {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new Event("golocal-ai-config"));
}

export type AiStatus =
  | { state: "checking" }
  | { state: "connected"; model: string }
  | { state: "demo"; reason: string };

async function withTimeout(url: string, init: RequestInit, ms: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function checkStatus(cfg = getConfig()): Promise<AiStatus> {
  if (!cfg.enabled) return { state: "demo", reason: "AI disabled in settings" };
  try {
    const res = await withTimeout(`${cfg.url.replace(/\/$/, "")}/api/tags`, {}, 2500);
    if (!res.ok) return { state: "demo", reason: `Ollama responded ${res.status}` };
    const data = (await res.json()) as { models?: { name: string }[] };
    const names = (data.models ?? []).map((m) => m.name);
    const has = names.some((n) => n === cfg.model || n.split(":")[0] === cfg.model);
    if (!has) return { state: "demo", reason: `Model "${cfg.model}" is not installed` };
    return { state: "connected", model: cfg.model };
  } catch {
    return { state: "demo", reason: "Ollama not reachable" };
  }
}

async function chatJSON(system: string, user: string, cfg: AiConfig): Promise<unknown> {
  const res = await withTimeout(
    `${cfg.url.replace(/\/$/, "")}/api/chat`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: cfg.model,
        stream: false,
        format: "json",
        options: { temperature: 0.8 },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    },
    90000,
  );
  if (!res.ok) throw new Error(`Model error ${res.status}`);
  const data = (await res.json()) as { message?: { content?: string } };
  const content = data.message?.content ?? "";
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in model output");
  return JSON.parse(match[0]);
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function validateMission(raw: unknown, prefs: MissionPrefs, model: string): Mission | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const tasks = Array.isArray(o['tasks']) ? filterSafeTasks(o['tasks'].map(str).filter(Boolean)).slice(0, 6) : [];
  const title = str(o['title']);
  const description = str(o['description']);
  if (!title || !description || tasks.length < 4) return null;
  return {
    id: crypto.randomUUID(),
    title: title.slice(0, 80),
    description: description.slice(0, 400),
    tasks,
    durationMin: prefs.duration,
    exploration: str(o['exploration']) || "Wander a gentle loop on public, familiar ground.",
    phoneDown: str(o['phoneDown']) || "Start the timer and put your phone away until it ends.",
    safety: str(o['safety']) || DEFAULT_SAFETY,
    prefs,
    source: "ai",
    model,
  };
}

export interface GenResult<T> {
  value: T;
  source: Source;
  note?: string | undefined;
}

export async function generateMission(prefs: MissionPrefs): Promise<GenResult<Mission>> {
  const cfg = getConfig();
  const status = await checkStatus(cfg);
  if (status.state !== "connected") {
    return { value: demoMission(prefs), source: "demo", note: status.state === "demo" ? status.reason : undefined };
  }
  const system =
    "You design short, safe, real-world outdoor missions that help people spend less time on their phones. " +
    "Never suggest trespassing, roads or traffic, touching or feeding wildlife, climbing structures, isolated or hazardous places. " +
    "All tasks must be optional, observational, and adaptable to accessibility needs. Respond ONLY with JSON: " +
    '{"title": string, "description": string, "tasks": string[4..6], "exploration": string, "phoneDown": string, "safety": string}';
  const user = `Activity: ${prefs.activity}. Duration: ${prefs.duration} minutes. Difficulty: ${prefs.difficulty}. Environment: ${prefs.environment}. Interests/accessibility: ${prefs.notes || "none"}.`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const m = validateMission(await chatJSON(system, user, cfg), prefs, cfg.model);
      if (m) return { value: m, source: "ai" };
    } catch {
      /* retry then fall back */
    }
  }
  return { value: demoMission(prefs), source: "demo", note: "Model output was invalid — used demo mission" };
}

export async function summarizeReflection(
  reflection: string,
  missionTitle: string,
  tasks: { text: string; done: boolean }[],
): Promise<GenResult<{ discoveryTitle: string; summary: string }>> {
  const done = tasks.filter((t) => t.done).length;
  const fallback = () => demoReflection(reflection, missionTitle, done, tasks.length);
  const cfg = getConfig();
  if (!reflection.trim()) return { value: fallback(), source: "demo" };
  const status = await checkStatus(cfg);
  if (status.state !== "connected") return { value: fallback(), source: "demo", note: status.state === "demo" ? status.reason : undefined };
  try {
    const raw = (await chatJSON(
      "You write short journal entries from a user's outdoor reflection. Use ONLY details the user wrote; never invent sightings or events. " +
        'Respond ONLY with JSON: {"discoveryTitle": string (max 6 words), "summary": string (2-3 sentences, second person)}',
      `Mission: ${missionTitle}\nTasks completed: ${done}/${tasks.length}\nReflection: ${reflection}`,
      cfg,
    )) as Record<string, unknown>;
    const discoveryTitle = str(raw['discoveryTitle']).slice(0, 60);
    const summary = str(raw['summary']).slice(0, 600);
    if (discoveryTitle && summary) return { value: { discoveryTitle, summary }, source: "ai" };
  } catch {
    /* fall through */
  }
  return { value: fallback(), source: "demo", note: "Model output was invalid — used fallback summary" };
}
