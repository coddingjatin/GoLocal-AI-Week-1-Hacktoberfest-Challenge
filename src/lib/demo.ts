import type { Activity, Mission, MissionPrefs } from "./types";
import { DEFAULT_SAFETY } from "./safety";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number, n: number): T[] {
  const out: T[] = [];
  const pool = [...arr];
  let s = seed;
  while (out.length < n && pool.length) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    out.push(pool.splice(s % pool.length, 1)[0] as T);
  }
  return out;
}

const TASKS: Record<Activity, string[]> = {
  Walk: [
    "Find three different textures within arm's reach — bark, stone, fabric, anything.",
    "Notice one sound you'd normally tune out and follow it for a minute.",
    "Spot something painted, carved or written that's older than you.",
    "Count five different shades of green on your way.",
    "Find the smallest living thing you can see without bending down.",
    "Pause at a corner and watch the light for sixty slow seconds.",
    "Look up above eye level and find a detail you've never noticed.",
    "Choose a colour and collect (with your eyes only) five things of that colour.",
  ],
  Nature: [
    "Find a leaf with an interesting edge and memorise its shape.",
    "Sit still for two minutes and listen for the farthest sound you can hear.",
    "Look for evidence of an animal — a track, a feather, a nibbled leaf. Don't touch, just notice.",
    "Find two plants that look alike but aren't the same.",
    "Notice where the wind is coming from using only the trees.",
    "Find a patch of moss or lichen and look at it up close.",
    "Spot something that is in the process of changing — budding, wilting, growing.",
  ],
  Run: [
    "For one minute, match your breath to your footsteps and count the rhythm.",
    "Run past three trees and name something different about each one.",
    "Ease into a slow jog and notice the temperature of the air on your face.",
    "Pick a landmark ahead and arrive at it at an easy, smiling pace.",
    "Notice how the ground changes under your feet — note three surfaces.",
    "Take a walking break and look at the sky for thirty seconds.",
    "Finish with two minutes of easy walking and notice your heartbeat settle.",
  ],
  Gardening: [
    "Get your hands in the soil and notice if it's warm, cool, dry or damp.",
    "Find one weed and look closely at its roots before deciding what to do.",
    "Look under three leaves for tiny visitors — just observe.",
    "Pick one plant and describe how it has changed since last week.",
    "Water slowly and watch where the water goes.",
    "Find something flowering and notice its scent.",
    "Tidy one small corner and pause to admire the difference.",
  ],
  Birdwatching: [
    "Stand still for three minutes and count how many different bird calls you hear.",
    "Find a bird and watch what it does for a full minute from a respectful distance.",
    "Notice which trees or rooftops the birds seem to prefer.",
    "Spot a bird in flight and follow it until it lands.",
    "Describe one bird's colours in your head as precisely as possible.",
    "Listen for a repeated song and try to remember its rhythm.",
    "Look for a nest from a distance — never approach it.",
  ],
};

const TITLES: Record<Activity, string[]> = {
  Walk: ["The Unnoticed Street", "Five Shades of Ordinary", "A Slow Loop Around", "Looking Up"],
  Nature: ["The Quiet Inventory", "Small Green Things", "Listening Field", "Leaf Detective"],
  Run: ["Rhythm & Air", "The Easy Miles", "Breath Map", "Ground Notes"],
  Gardening: ["Soil Hands", "The Tiny Visitors", "Roots & Rituals", "A Corner, Tended"],
  Birdwatching: ["Who's Singing?", "Feather Watch", "The Sky Census", "Branch Listening"],
};

const EXPLORE: Record<string, string> = {
  City: "Pick any direction from your door and take every second turn that feels calm and walkable. Return the way you came.",
  Park: "Choose the path you use least in your nearest park and follow it at whatever pace feels right.",
  Trail: "Stick to a marked trail you know, go out for half your time, then turn back.",
  Anywhere: "Wherever you are, wander in a gentle loop that keeps you on public, familiar ground.",
};

export function demoMission(prefs: MissionPrefs): Mission {
  const seed = hash(JSON.stringify(prefs) + new Date().toDateString());
  const count = prefs.duration >= 60 ? 6 : prefs.duration >= 30 ? 5 : 4;
  const tasks = pick(TASKS[prefs.activity], seed, count);
  const title = pick(TITLES[prefs.activity], seed >>> 3, 1)[0] ?? "Outside Today";
  const tone =
    prefs.difficulty === "Easy"
      ? "A gentle, unhurried"
      : prefs.difficulty === "Curious"
        ? "A curious, observant"
        : "A fuller, more adventurous";
  const note = prefs.notes.trim() ? ` Adapt anything as needed: "${prefs.notes.trim()}".` : "";
  return {
    id: crypto.randomUUID(),
    title,
    description: `${tone} ${prefs.duration}-minute ${prefs.activity.toLowerCase()} mission for ${prefs.environment.toLowerCase() === "anywhere" ? "wherever you are" : `the ${prefs.environment.toLowerCase()}`}.${note}`,
    tasks,
    durationMin: prefs.duration,
    exploration: EXPLORE[prefs.environment] ?? EXPLORE['Anywhere']!,
    phoneDown: "Start the timer, then put your phone in a pocket or bag. Only check it if you need to.",
    safety: DEFAULT_SAFETY,
    prefs,
    source: "demo",
  };
}

const STOP = new Set("the a an and or but i i'm it its was were is to of in on at for with my me we our that this there so just very really then some saw".split(" "));

export function demoReflection(reflection: string, missionTitle: string, done: number, total: number) {
  const text = reflection.trim();
  if (!text) {
    return {
      discoveryTitle: `Notes from ${missionTitle}`,
      summary: `You completed ${done} of ${total} tasks. No written reflection was added.`,
    };
  }
  const words = text.toLowerCase().replace(/[^a-z\s'-]/g, " ").split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w));
  const freq = new Map<string, number>();
  words.forEach((w) => freq.set(w, (freq.get(w) ?? 0) + 1));
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)[0]?.[0];
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const sentences = text.match(/[^.!?]+[.!?]?/g) ?? [text];
  const excerpt = sentences.slice(0, 2).join(" ").trim();
  return {
    discoveryTitle: top ? `The ${cap(top)} Moment` : `Notes from ${missionTitle}`,
    summary: `In your words: "${excerpt.length > 260 ? excerpt.slice(0, 257) + "…" : excerpt}" — ${done} of ${total} tasks completed.`,
  };
}
