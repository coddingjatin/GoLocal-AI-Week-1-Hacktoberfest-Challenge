import { describe, expect, it } from "vitest";
import { isSafeTask } from "@/lib/safety";
import { pause, remaining, resume } from "@/lib/storage";
import { validateMission } from "@/lib/ai";
import { demoReflection } from "@/lib/demo";
import type { MissionPrefs, Session } from "@/lib/types";

const prefs: MissionPrefs = { activity: "Walk", duration: 30, difficulty: "Easy", environment: "City", notes: "" };

describe("rules", () => {
  it("rejects trespassing and wildlife-feeding tasks", () => {
    expect(isSafeTask("Trespass into the old yard")).toBe(false);
    expect(isSafeTask("Feed the ducks by the pond")).toBe(false);
    expect(isSafeTask("Count five shades of green")).toBe(true);
  });
  it("rejects AI missions with fewer than 4 safe tasks", () => {
    expect(validateMission({ title: "x", description: "y", tasks: ["a", "b", "c", "climb onto the roof"] }, prefs, "m")).toBeNull();
    expect(validateMission({ title: "x", description: "y", tasks: ["a", "b", "c", "d"] }, prefs, "m")?.tasks).toHaveLength(4);
  });
  it("timer pauses and resumes without losing time", () => {
    const s: Session = { mission: {} as never, checked: [], running: true, endAt: 1000 + 60000, remainingMs: 60000, startedAt: 1000, finished: false };
    const p = pause(s, 11000);
    expect(remaining(p, 999999)).toBe(50000);
    expect(remaining(resume(p, 20000), 30000)).toBe(40000);
  });
  it("fallback summary only quotes the user's words", () => {
    expect(demoReflection("I saw a heron.", "M", 2, 4).summary).toContain('"I saw a heron."');
  });
});
