import { useEffect, useState } from "react";
import type { JournalEntry, Mission, Session } from "./types";

const K = { session: "golocal.session", journal: "golocal.journal", draft: "golocal.draft" };

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, v: unknown) {
  if (v === null) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(v));
  window.dispatchEvent(new Event("golocal-store"));
}

export const store = {
  getSession: () => read<Session | null>(K.session, null),
  setSession: (s: Session | null) => write(K.session, s),
  getDraft: () => read<Mission | null>(K.draft, null),
  setDraft: (m: Mission | null) => write(K.draft, m),
  getJournal: () => read<JournalEntry[]>(K.journal, []),
  addEntry: (e: JournalEntry) => write(K.journal, [e, ...store.getJournal()]),
  deleteEntry: (id: string) => write(K.journal, store.getJournal().filter((e) => e.id !== id)),
};

export function startSession(mission: Mission): Session {
  const now = Date.now();
  const s: Session = {
    mission,
    checked: mission.tasks.map(() => false),
    running: true,
    endAt: now + mission.durationMin * 60000,
    remainingMs: mission.durationMin * 60000,
    startedAt: now,
    finished: false,
  };
  store.setSession(s);
  return s;
}

export function remaining(s: Session, now = Date.now()): number {
  if (s.running && s.endAt) return Math.max(0, s.endAt - now);
  return Math.max(0, s.remainingMs);
}

export function pause(s: Session, now = Date.now()): Session {
  return { ...s, running: false, remainingMs: remaining(s, now), endAt: null };
}
export function resume(s: Session, now = Date.now()): Session {
  return { ...s, running: true, endAt: now + s.remainingMs };
}

/** Subscribe to a store value; returns undefined until hydrated on the client. */
export function useStore<T>(get: () => T): T | undefined {
  const [v, setV] = useState<T | undefined>(undefined);
  useEffect(() => {
    const sync = () => setV(get());
    sync();
    window.addEventListener("golocal-store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("golocal-store", sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

export async function compressImage(file: File, max = 900): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.72);
  } finally {
    URL.revokeObjectURL(url);
  }
}
