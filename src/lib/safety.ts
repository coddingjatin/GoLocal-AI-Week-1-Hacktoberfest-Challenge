// Rejects tasks that suggest unsafe or disrespectful behaviour.
const UNSAFE =
  /trespass|private (property|land|yard)|climb(ing)? (on|onto|up|over)|rooftop|roof|railway|rail track|train track|highway|motorway|middle of the road|jaywalk|feed (the )?(wild|birds|animals|ducks)|touch (a |the )?(wild|snake|bird|animal)|approach (a |the )?(wild|stray|nest)|cliff|abandoned|construction site|at night alone|isolated|swim in|fence/i;

export function isSafeTask(task: string): boolean {
  return !UNSAFE.test(task);
}

export function filterSafeTasks(tasks: string[]): string[] {
  return tasks.filter(isSafeTask);
}

export const DEFAULT_SAFETY =
  "Stay aware of traffic and your surroundings, keep to public paths, respect private property and wildlife, and skip any task that doesn't feel safe or comfortable.";
