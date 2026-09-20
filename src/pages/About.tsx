import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { IconKeyboard, IconNote, IconSparkle } from "@/components/ui/Icons";
import { useToast } from "@/context/ToastContext";

export const DEVELOPER = {
  name: "Ashutosh Palhare",
  initials: "AP",
  role: "Frontend-first Full Stack Developer & Cybersecurity Enthusiast",
  location: "Maharashtra, India",
  bio: "Passionate about building clean, modern, and functional web applications. Loves turning ideas into polished products. Works extremely well with AI tools as an engineering multiplier.",
  avatar: "https://github.com/ashutoshpalhare.png?size=400",
  links: {
    github: "https://github.com/ashutoshpalhare",
    portfolio: "https://ashutoshpalhare.github.io",
    linkedin: "https://in.linkedin.com/in/ashutoshpalhare",
    twitter: "https://twitter.com/AshutoshPalhare",
    repo: "https://github.com/ashutoshpalhare/VibeHai",
  },
};

/* ------------------------------ brand icons ------------------------------ */
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2.1c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
  </svg>
);
const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
    <path d="M12 21s-6-5.3-6-10.5a6 6 0 1 1 12 0C18 15.7 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2" />
  </svg>
);

const SOCIALS = [
  { label: "GitHub", handle: "@ashutoshpalhare", href: DEVELOPER.links.github, Icon: GitHubIcon, accent: "from-zinc-400 to-zinc-200" },
  { label: "Portfolio", handle: "ashutoshpalhare.github.io", href: DEVELOPER.links.portfolio, Icon: GlobeIcon, accent: "from-cyan-400 to-sky-500" },
  { label: "LinkedIn", handle: "in/ashutoshpalhare", href: DEVELOPER.links.linkedin, Icon: LinkedInIcon, accent: "from-sky-400 to-blue-600" },
  { label: "Twitter / X", handle: "@AshutoshPalhare", href: DEVELOPER.links.twitter, Icon: TwitterIcon, accent: "from-violet-400 to-fuchsia-500" },
];

const STACK = [
  { name: "React 19", note: "UI runtime", color: "#61dafb" },
  { name: "TypeScript", note: "Type safety", color: "#3178c6" },
  { name: "Vite 7", note: "Build tooling", color: "#a78bfa" },
  { name: "Tailwind CSS 4", note: "Design system", color: "#38bdf8" },
  { name: "Framer Motion", note: "Animations", color: "#f472b6" },
  { name: "React Router", note: "Hash routing", color: "#f43f5e" },
  { name: "Context API", note: "Player · Library · Theme", color: "#c084fc" },
  { name: "HTML5 Audio", note: "Playback + Media Session", color: "#fb923c" },
  { name: "localStorage", note: "Offline persistence", color: "#34d399" },
  { name: "Service Worker", note: "PWA shell caching", color: "#22d3ee" },
  { name: "JioSaavn API", note: "Unofficial catalogue", color: "#facc15" },
];

const HIGHLIGHTS = [
  { emoji: "🎧", title: "Real streaming", body: "Multi-bitrate playback with automatic fallback and skip-on-failure." },
  { emoji: "🔀", title: "Full queue engine", body: "Shuffle, repeat one/all, play next, drag-to-reorder and persistence." },
  { emoji: "💾", title: "Local-first", body: "Playlists, likes and history live in your browser. No accounts." },
  { emoji: "⌨️", title: "Keyboard native", body: "Space, arrows, and single-key shortcuts for everything." },
  { emoji: "🌗", title: "Two themes", body: "An immersive dark stage and a lavender light mode." },
  { emoji: "📱", title: "Installable PWA", body: "Manifest, icons and a service worker for the app shell." },
];

function Avatar() {
  const [failed, setFailed] = useState(false);
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="relative shrink-0"
    >
      <span className="absolute -inset-1.5 rounded-full bg-[conic-gradient(from_180deg,#8b5cf6,#22d3ee,#d946ef,#8b5cf6)] opacity-80 blur-[2px]" />
      <span className="absolute -inset-1.5 animate-[spin_9s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0%,#22d3ee_25%,transparent_50%,#a855f7_75%,transparent_100%)] opacity-70" />
      <span className="relative grid h-32 w-32 place-items-center overflow-hidden rounded-full bg-ink-850 ring-4 ring-ink-950 sm:h-40 sm:w-40">
        {failed ? (
          <span className="brand-text text-5xl font-extrabold">{DEVELOPER.initials}</span>
        ) : (
          <img
            src={DEVELOPER.avatar}
            alt={DEVELOPER.name}
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
            referrerPolicy="no-referrer"
          />
        )}
      </span>
      <span className="absolute -bottom-1 -right-1 grid h-10 w-10 place-items-center rounded-full brand-gradient text-[11px] font-extrabold text-white shadow-lg ring-4 ring-ink-950">
        {DEVELOPER.initials}
      </span>
    </motion.div>
  );
}

export default function About() {
  const { toast } = useToast();

  return (
    <div className="mx-auto max-w-4xl space-y-10 pb-6">
      {/* hero */}
      <header className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-ink-850 p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-[100px]" />
          <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-[110px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] bg-[length:22px_22px] opacity-40" />
        </div>

        <div className="relative flex flex-col items-center gap-7 text-center sm:flex-row sm:items-center sm:text-left">
          <Avatar />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-300/80">
              Built by
            </p>
            <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {DEVELOPER.name}{" "}
              <span className="brand-text">({DEVELOPER.initials})</span>
            </h1>
            <p className="mt-2 text-sm font-semibold text-white/75">{DEVELOPER.role}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/45">
              <PinIcon /> {DEVELOPER.location}
            </p>
            <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-white/60">
              {DEVELOPER.bio}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              <a href={DEVELOPER.links.github} target="_blank" rel="noreferrer">
                <Button variant="brand">
                  <GitHubIcon /> Follow on GitHub
                </Button>
              </a>
              <a href={DEVELOPER.links.portfolio} target="_blank" rel="noreferrer">
                <Button variant="outline">
                  <GlobeIcon /> Portfolio
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* social links */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">Find me online</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOCIALS.map((s, i) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${s.accent} text-ink-950 shadow-lg`}
              >
                <s.Icon />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-white">{s.label}</span>
                <span className="block truncate text-xs text-white/45">{s.handle}</span>
              </span>
              <span className="text-white/30 transition group-hover:translate-x-1 group-hover:text-white">
                →
              </span>
            </motion.a>
          ))}
        </div>
      </section>

      {/* tech stack */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">Tech stack</h2>
          <p className="mt-0.5 text-xs text-white/45">What powers VibeHai under the hood.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STACK.map((t, i) => (
            <motion.span
              key={t.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-2 pr-3.5 text-[12.5px]"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.color, boxShadow: `0 0 10px ${t.color}` }} />
              <span className="font-semibold text-white/90">{t.name}</span>
              <span className="text-white/35">·</span>
              <span className="text-white/45">{t.note}</span>
            </motion.span>
          ))}
        </div>
      </section>

      {/* project highlights */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">About the project</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.title}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
            >
              <span className="text-2xl">{h.emoji}</span>
              <p className="mt-2 text-sm font-bold text-white">{h.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/50">{h.body}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <a href={DEVELOPER.links.repo} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              <GitHubIcon /> View source
            </Button>
          </a>
          <Link to="/shortcuts">
            <Button variant="ghost" size="sm">
              <IconKeyboard className="h-4 w-4" /> Keyboard shortcuts
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href.split("#")[0]).then(
                () => toast("Link copied — share the vibe!", { tone: "success" }),
                () => toast("Couldn't copy link", { tone: "error" }),
              );
            }}
          >
            <IconSparkle className="h-4 w-4" /> Share VibeHai
          </Button>
        </div>
      </section>

      {/* credits */}
      <section className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-brand-700/20 via-ink-850 to-cyan-900/20 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl brand-gradient text-white">
            <IconNote className="h-5 w-5" />
          </span>
          <div className="text-[13px] leading-relaxed text-white/60">
            <p className="font-bold text-white">Credits & disclaimer</p>
            <p className="mt-1">
              Music metadata and streams come from JioSaavn via an open, unofficial community API.
              All songs, artwork and trademarks belong to their respective owners. VibeHai is a
              non-commercial portfolio project and is not affiliated with JioSaavn.
            </p>
            <p className="mt-2">
              Built with <span className="text-rose-400">❤</span> by{" "}
              <a href={DEVELOPER.links.portfolio} target="_blank" rel="noreferrer" className="font-semibold text-brand-200 hover:underline">
                {DEVELOPER.name}
              </a>{" "}
              in {DEVELOPER.location}.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
