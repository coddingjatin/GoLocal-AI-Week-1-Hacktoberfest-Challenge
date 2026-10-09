import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Footprints, Leaf, Timer, PhoneOff, NotebookPen, Sparkles, Lock, Cpu, Wind } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { SiteFooter } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GoLocal AI — Get out of the algorithm" },
      { name: "description", content: "Turn ordinary walks into meaningful little adventures with an open-weight AI companion that wants you off your phone." },
      { property: "og:title", content: "GoLocal AI — Get out of the algorithm" },
      { property: "og:description", content: "Personalized outdoor missions powered by local, open-weight AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const cards = [
  { icon: Footprints, name: "Walk" as const, text: "Notice the street you think you know." },
  { icon: Leaf, name: "Nature" as const, text: "Slow down with leaves, moss and birdsong." },
  { icon: Wind, name: "Run" as const, text: "Easy miles, tuned to breath and air." },
];

function Home() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-10 sm:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="eyebrow">An AI that wants you off your phone</p>
            <h1 className="mt-4 text-5xl font-medium leading-[1.02] sm:text-7xl">
              Get out of the <em className="text-primary">algorithm.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Turn ordinary walks into meaningful little adventures with your open-source AI companion.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/create" className="btn btn-primary">Start Exploring <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how" className="btn btn-ghost">How it works</a>
            </div>
          </div>
          <div className="relative">
            <img src={hero} alt="A person walking down a misty tree-lined path" width={1600} height={1008} className="aspect-[4/3] w-full rounded-[2rem] object-cover" />
            <div className="card-soft absolute -bottom-6 left-4 right-4 p-5 sm:left-auto sm:right-[-1rem] sm:w-72">
              <p className="eyebrow flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Featured mission</p>
              <p className="mt-2 font-display text-xl">Five Shades of Ordinary</p>
              <p className="mt-1 text-sm text-muted-foreground">30 min · Walk · Curious</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li>· Count five shades of green</li>
                <li>· Follow one ignored sound</li>
                <li>· Look up above eye level</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.name} to="/create" search={{ activity: c.name }} className="card-soft group p-6 transition-transform hover:-translate-y-1">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-primary"><c.icon className="h-5 w-5" /></span>
              <h3 className="mt-5 text-2xl">{c.name}</h3>
              <p className="mt-1 text-muted-foreground">{c.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Create mission <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto mt-24 max-w-6xl scroll-mt-24 px-5">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 max-w-xl text-4xl">Four steps. Most of them happen away from the screen.</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { i: Sparkles, t: "Choose", d: "Pick an activity, time and mood. The AI crafts a mission for you." },
            { i: PhoneOff, t: "Phone down", d: "Start the timer, pocket your phone, and go." },
            { i: Timer, t: "Explore", d: "Small observational tasks — all optional, all adaptable." },
            { i: NotebookPen, t: "Reflect", d: "Come back, write or speak what you noticed. Save it to your journal." },
          ].map((s, n) => (
            <div key={s.t} className="border-t border-border pt-5">
              <span className="font-display text-sm text-muted-foreground">0{n + 1}</span>
              <s.i className="mt-3 h-5 w-5 text-primary" />
              <h3 className="mt-3 text-xl">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="grid gap-8 rounded-[2rem] bg-night p-8 text-night-foreground sm:p-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-night-foreground/60">Privacy & open-weight AI</p>
            <h2 className="mt-3 text-4xl">Your reflections don't need to leave your device.</h2>
          </div>
          <div className="space-y-4 text-night-foreground/80">
            <p className="flex gap-3"><Cpu className="mt-1 h-5 w-5 shrink-0 text-lime" /> Connect a local open-weight model like Gemma through Ollama — missions and journal summaries are generated on your own machine.</p>
            <p className="flex gap-3"><Lock className="mt-1 h-5 w-5 shrink-0 text-lime" /> Your journal is stored in this browser only. No accounts, no feed, no tracking.</p>
            <Link to="/ai" className="btn btn-lime mt-2">See how the AI works</Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
