// Sabina (سبينة) — Mizher Medical Hub's AI doctor-assistant.
// Same experience as Olga's Shams (living guide + speech bubble + chat panel + voice +
// offline brain), redesigned for Mizher with a medical "heartbeat scan" entrance and exit.
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { Mic, Minus, RotateCcw, Send, Volume2, VolumeX } from "lucide-react";

import { useLanguage } from "@/lib/i18n";
import baseAsset from "@/assets/sabina/sabina-base.webp.asset.json";
import waveAsset from "@/assets/sabina/sabina-wave.webp.asset.json";
import explainAsset from "@/assets/sabina/sabina-explain.webp.asset.json";
import thinkAsset from "@/assets/sabina/sabina-think.webp.asset.json";
import mouthAsset from "@/assets/sabina/sabina-mouth.webp.asset.json";
import blinkAsset from "@/assets/sabina/sabina-blink.webp.asset.json";
import faceAsset from "@/assets/sabina/sabina-face.webp.asset.json";
import { detectLang, localReply, type SabinaLang } from "./sabina-brain";
import { renderMarkdown } from "./sabina-markdown";
import { SABINA_T } from "./sabina-text";
import { SabinaVoice } from "./sabina-voice";
import { SabinaLive } from "./SabinaLive";

const CHAT_URL = "/api/public/sabina-chat";
const ENTER_MS = 2200;
const LEAVE_MS = 1600;
const HIDDEN_KEY = "sab-hidden";
const VOICE_KEY = "sab-voice";

type Stage = "idle" | "hidden" | "entering" | "on" | "leaving";
/** Full-body poses — same canvas, so they cross-fade in place (only the arms move). */
const POSES = [
  ["base", baseAsset.url],
  ["wave", waveAsset.url],
  ["explain", explainAsset.url],
  ["think", thinkAsset.url],
] as const;
type Pose = (typeof POSES)[number][0];
type Gesture = Exclude<Pose, "base" | "think">;
type Msg = { id: number; role: "u" | "b"; text: string; lang: SabinaLang; local?: boolean };
type Bubble = { text: string; on: boolean; bye: boolean };

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult:
    ((e: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecCtor = new () => SpeechRec;

export default function SabinaAssistant() {
  const [mounted, setMounted] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setMounted(true), []);
  if (!mounted || pathname.startsWith("/video-call")) return null;
  return <SabinaInner pathname={pathname} />;
}

/** One heartbeat "PQRST" shape over a cycle 0..1 — drives the voice monitors. */
function ecg(p: number): number {
  const g = (c: number, w: number, h: number) => h * Math.exp(-((p - c) ** 2) / (2 * w * w));
  return (
    g(0.12, 0.025, 0.12) +
    g(0.3, 0.008, -0.18) +
    g(0.33, 0.01, 1) +
    g(0.36, 0.01, -0.3) +
    g(0.58, 0.045, 0.28)
  );
}

function SabinaInner({ pathname }: { pathname: string }) {
  const { lang: siteLang, isRTL } = useLanguage() as { lang: string; isRTL: boolean };
  const router = useRouter();
  const [lang, setLang] = useState<SabinaLang>(siteLang === "ar" ? "ar" : "en");
  const [stage, setStage] = useState<Stage>("idle");
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState<Bubble>({ text: "", on: false, bye: false });
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [talking, setTalking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [listening, setListening] = useState(false);
  const [aside, setAside] = useState(false);
  const [input, setInput] = useState("");
  const [gesture, setGesture] = useState<Gesture | null>(null);
  const [live, setLive] = useState<boolean | null>(null);

  const T = SABINA_T[lang];
  const voice = useMemo(() => new SabinaVoice(), []);
  const rootRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bubbleMon = useRef<HTMLCanvasElement>(null);
  const headMon = useRef<HTMLCanvasElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bodyRef = useRef<HTMLSpanElement>(null);
  const gestureTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const byeRef = useRef(false);
  const lastHover = useRef(0);
  const interacted = useRef(false);
  const msgsRef = useRef<Msg[]>([]);
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const idRef = useRef(1);
  const langRef = useRef(lang);
  const voiceOnRef = useRef(voiceOn);
  const stageRef = useRef(stage);
  const pathRef = useRef(pathname);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const SR = useMemo<SpeechRecCtor | null>(() => {
    const w = window as unknown as {
      SpeechRecognition?: SpeechRecCtor;
      webkitSpeechRecognition?: SpeechRecCtor;
    };
    return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
  }, []);

  msgsRef.current = msgs;
  langRef.current = lang;
  voiceOnRef.current = voiceOn;
  stageRef.current = stage;
  pathRef.current = pathname;

  useEffect(() => setLang(siteLang === "ar" ? "ar" : "en"), [siteLang]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  /** Plays one hand gesture (wave / explain) for `ms`, then she returns to her resting pose. */
  const doGesture = useCallback(
    (g: Gesture, ms: number) => {
      if (reduced) return;
      clearTimeout(gestureTimer.current);
      setGesture(g);
      gestureTimer.current = setTimeout(() => setGesture(null), ms);
    },
    [reduced],
  );

  const showBubble = useCallback(
    (text: string, bye = false) => setBubble({ text, on: true, bye }),
    [],
  );
  const hideBubble = useCallback(() => setBubble((b) => ({ ...b, on: false })), []);

  const enter = useCallback(
    (after?: () => void) => {
      clearTimers();
      setStage("entering");
      later(
        () => {
          setStage("on");
          after?.();
        },
        reduced ? 60 : ENTER_MS,
      );
    },
    [clearTimers, later, reduced],
  );

  const leave = useCallback(
    (after?: () => void) => {
      clearTimers();
      setOpen(false);
      hideBubble();
      setStage("leaving");
      later(
        () => {
          setStage("hidden");
          after?.();
        },
        reduced ? 60 : LEAVE_MS,
      );
    },
    [clearTimers, hideBubble, later, reduced],
  );

  // First appearance: she materialises shortly after the page opens (unless the visitor dismissed her).
  useEffect(() => {
    voice.onTalk = setTalking;
    let hidden = false;
    try {
      hidden = sessionStorage.getItem(HIDDEN_KEY) === "1";
      if (sessionStorage.getItem(VOICE_KEY) === "0") setVoiceOn(false);
    } catch {
      /* storage blocked */
    }
    if (hidden) setStage("hidden");
    else
      later(
        () =>
          enter(() =>
            later(() => {
              showBubble(SABINA_T[langRef.current].hello);
              doGesture("wave", 2600);
            }, 250),
          ),
        1300,
      );
    return () => {
      clearTimers();
      clearTimeout(gestureTimer.current);
      voice.stop();
      abortRef.current?.abort();
      recRef.current?.stop();
    };
  }, [clearTimers, doGesture, enter, later, showBubble, voice]);

  // Natural blinking (sometimes a double blink) while she is on screen.
  useEffect(() => {
    if (reduced || (stage !== "on" && stage !== "leaving")) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const setBlink = (v: boolean) => {
      const el = bodyRef.current;
      if (el) el.dataset["blink"] = v ? "1" : "0";
    };
    const blinkOnce = (then: () => void) => {
      setBlink(true);
      t = setTimeout(() => {
        setBlink(false);
        then();
      }, 130);
    };
    const loop = () => {
      t = setTimeout(
        () =>
          blinkOnce(() => {
            if (Math.random() < 0.22) t = setTimeout(() => blinkOnce(loop), 170);
            else loop();
          }),
        2200 + Math.random() * 3600,
      );
    };
    loop();
    return () => {
      clearTimeout(t);
      setBlink(false);
    };
  }, [stage, reduced]);

  // While she speaks she explains with her hand, again every few seconds of a long answer.
  useEffect(() => {
    if (!talking || byeRef.current) return;
    doGesture("explain", 2600);
    const iv = setInterval(() => {
      if (!byeRef.current) doGesture("explain", 2300);
    }, 7000);
    return () => clearInterval(iv);
  }, [talking, doGesture]);

  // A friendly wave now and then while her greeting waits for an answer.
  useEffect(() => {
    if (stage !== "on" || open || !bubble.on || bubble.bye) return;
    let n = 0;
    const iv = setInterval(() => {
      if (n++ < 2 && !busyRef.current) doGesture("wave", 1900);
    }, 15000);
    return () => clearInterval(iv);
  }, [stage, open, bubble.on, bubble.bye, doGesture]);

  // Keep the greeting bubble in the chosen language.
  useEffect(() => {
    setBubble((b) => (b.on && !b.bye ? { ...b, text: SABINA_T[lang].hello } : b));
  }, [lang]);

  // Scroll the conversation to the newest message.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing, open]);

  // Phones: while the visitor scrolls, Sabina steps aside so nothing is covered.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      if (window.innerWidth >= 768 || open) return;
      setAside(true);
      clearTimeout(t);
      t = setTimeout(() => setAside(false), 1300);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(t);
    };
  }, [open]);

  // Escape closes the chat.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Heartbeat loop: voice loudness -> glow (--sab-amp) + live ECG voice monitors.
  useEffect(() => {
    if (stage !== "on" && !open) return;
    let raf = 0;
    let phase = 0;
    let amp = 0;
    let mouth = 0;
    const hist: number[] = [];
    const draw = (cv: HTMLCanvasElement | null) => {
      if (!cv || !cv.offsetParent) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      const w = cv.width;
      const h = cv.height;
      ctx.clearRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, "rgba(63,213,224,0)");
      grad.addColorStop(0.65, "rgba(63,213,224,.85)");
      grad.addColorStop(1, "rgba(255,255,255,1)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineJoin = "round";
      ctx.beginPath();
      const n = hist.length;
      for (let i = 0; i < n; i++) {
        const x = (i / Math.max(1, n - 1)) * w;
        const y = h * 0.62 - (hist[i] ?? 0) * h * 0.55;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      const lx = w;
      const ly = h * 0.62 - (hist[n - 1] ?? 0) * h * 0.55;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(lx - 2, ly, 2.4, 0, Math.PI * 2);
      ctx.fill();
    };
    const tick = () => {
      const lv = voice.level();
      amp += (lv - amp) * 0.25;
      const speed = 0.012 + amp * 0.03;
      phase = (phase + speed) % 1;
      const gain = 0.22 + amp * 1.25;
      hist.push(ecg(phase) * gain + (Math.random() - 0.5) * amp * 0.12);
      if (hist.length > 90) hist.shift();
      // Lip-sync: open the mouth with her voice, in syllable-like pulses.
      const target =
        lv > 0.02
          ? Math.min(1, Math.max(0, (amp - 0.03) * 2.6)) *
            (0.55 + 0.45 * Math.abs(Math.sin(performance.now() / 75)))
          : 0;
      mouth += (target - mouth) * 0.45;
      rootRef.current?.style.setProperty("--sab-amp", amp.toFixed(3));
      rootRef.current?.style.setProperty("--sab-mouth", mouth.toFixed(3));
      draw(bubbleMon.current);
      draw(headMon.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      rootRef.current?.style.setProperty("--sab-mouth", "0");
    };
  }, [stage, open, voice]);

  const touch = useCallback(() => {
    interacted.current = true;
    voice.unlock();
  }, [voice]);

  const openPanel = useCallback(() => {
    touch();
    hideBubble();
    setOpen(true);
    doGesture("explain", 1900);
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350);
  }, [doGesture, hideBubble, touch]);

  const farewell = useCallback(async () => {
    if (stageRef.current !== "on") return;
    touch();
    setOpen(false);
    const L = langRef.current;
    byeRef.current = true;
    showBubble(SABINA_T[L].bye, true);
    doGesture("wave", 9000);
    if (voiceOnRef.current) {
      await Promise.race([
        voice.speak(SABINA_T[L].bye, L),
        new Promise((r) => setTimeout(r, 7000)),
      ]);
      await new Promise((r) => setTimeout(r, 350));
    } else {
      await new Promise((r) => setTimeout(r, 2600));
    }
    voice.stop();
    leave(() => {
      try {
        sessionStorage.setItem(HIDDEN_KEY, "1");
      } catch {
        /* storage blocked */
      }
    });
  }, [doGesture, leave, showBubble, touch, voice]);

  const summon = useCallback(() => {
    touch();
    try {
      sessionStorage.removeItem(HIDDEN_KEY);
    } catch {
      /* storage blocked */
    }
    byeRef.current = false;
    enter(() => {
      openPanel();
      doGesture("wave", 2200);
    });
  }, [doGesture, enter, openPanel, touch]);

  const onFigure = useCallback(() => {
    if (stageRef.current !== "on") return;
    touch();
    hideBubble();
    if (!open) doGesture("explain", 1900);
    setOpen(!open);
  }, [doGesture, hideBubble, open, touch]);

  const upsertBot = useCallback((id: number, text: string, L: SabinaLang, local = false) => {
    setMsgs((prev) => {
      const i = prev.findIndex((m) => m.id === id);
      const msg: Msg = { id, role: "b", text, lang: L, local };
      if (i < 0) return [...prev, msg];
      const next = prev.slice();
      next[i] = msg;
      return next;
    });
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, 1000);
      if (!text || busyRef.current) return;
      touch();
      voice.stop();
      const L = detectLang(text, langRef.current);
      const userMsg: Msg = { id: idRef.current++, role: "u", text, lang: L };
      const history = [...msgsRef.current, userMsg].slice(-30);
      setMsgs(history);
      setInput("");
      busyRef.current = true;
      setBusy(true);
      setTyping(true);
      const botId = idRef.current++;
      const payload = history.slice(-12).map((m) => ({
        role: m.role === "u" ? ("user" as const) : ("assistant" as const),
        content: m.text.slice(0, 2000),
      }));
      let acc = "";
      const ctl = new AbortController();
      abortRef.current = ctl;
      // Only guards the wait for the first words; a reply that has started is never cut.
      const firstByte = setTimeout(() => ctl.abort(), 35000);
      try {
        const res = await fetch(CHAT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang: L, page: pathRef.current, messages: payload }),
          signal: ctl.signal,
        });
        if (!res.ok || !res.body) throw new Error(`chat ${res.status}`);
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!value) continue;
          if (!acc) {
            clearTimeout(firstByte);
            setTyping(false);
          }
          acc += value;
          upsertBot(botId, acc, L);
        }
      } catch {
        /* fall back to the built-in brain below */
      }
      clearTimeout(firstByte);
      const cleared = abortRef.current !== ctl; // the chat was reset while waiting
      abortRef.current = null;
      if (cleared) {
        busyRef.current = false;
        setBusy(false);
        setTyping(false);
        return;
      }
      if (!acc.trim()) {
        acc = localReply(text, L).text;
        upsertBot(botId, acc, L, true);
      }
      setTyping(false);
      busyRef.current = false;
      setBusy(false);
      if (voiceOnRef.current && interacted.current) void voice.speak(acc, L);
    },
    [touch, upsertBot, voice],
  );

  const clearChat = useCallback(() => {
    voice.stop();
    const a = abortRef.current;
    abortRef.current = null;
    a?.abort();
    setMsgs([]);
    setTyping(false);
  }, [voice]);

  const toggleVoice = useCallback(() => {
    touch();
    setVoiceOn((v) => {
      const next = !v;
      if (!next) voice.stop();
      try {
        sessionStorage.setItem(VOICE_KEY, next ? "1" : "0");
      } catch {
        /* storage blocked */
      }
      return next;
    });
  }, [touch, voice]);

  const toggleMic = useCallback(() => {
    if (!SR) return;
    touch();
    if (listening) {
      recRef.current?.stop();
      return;
    }
    voice.stop();
    const rec = new SR();
    recRef.current = rec;
    rec.lang = langRef.current === "ar" ? "ar-JO" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (!r) continue;
        t += r[0].transcript;
        if (r.isFinal) finalText = t;
      }
      setInput(t);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
      if (finalText.trim()) void send(finalText);
    };
    rec.onerror = () => setListening(false);
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [SR, listening, send, touch, voice]);

  const onLogClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const a = (e.target as HTMLElement).closest("a[data-int]");
      if (!a) return;
      e.preventDefault();
      const href = a.getAttribute("href");
      if (!href) return;
      router.history.push(href);
      if (window.innerWidth < 768) setOpen(false);
    },
    [router],
  );

  const parts = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        cross: i % 3 !== 2,
        style: {
          "--x": `${8 + Math.random() * 84}%`,
          "--y": `${30 + Math.random() * 60}%`,
          "--d": `${(Math.random() * 0.9).toFixed(2)}s`,
          "--s": `${(0.6 + Math.random() * 0.9).toFixed(2)}`,
          "--r": `${Math.round(Math.random() * 60 - 30)}px`,
        } as CSSProperties,
      })),
    [],
  );

  const langDir = lang === "ar" ? "rtl" : "ltr";
  // While she waits for the answer she thinks (finger on chin); otherwise the current gesture.
  const pose: Pose = stage === "entering" ? "base" : typing ? "think" : (gesture ?? "base");
  const onHover = () => {
    if (stage !== "on" || talking || busy || gesture) return;
    if (Date.now() - lastHover.current < 9000) return;
    lastHover.current = Date.now();
    doGesture("wave", 1700);
  };
  const rootCls = [
    `sab-${stage}`,
    open ? "is-open" : "",
    talking ? "is-talking" : "",
    aside ? "is-aside" : "",
    reduced ? "is-reduced" : "",
    live ? "is-live" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const visible = stage === "entering" || stage === "on" || stage === "leaving";

  return (
    <div id="sab-root" ref={rootRef} dir={isRTL ? "rtl" : "ltr"} className={rootCls}>
      <div id="sab-guide" aria-hidden={!visible}>
        <div
          id="sab-bubble"
          className={bubble.on && stage === "on" ? "is-on" : ""}
          role="status"
          dir={langDir}
        >
          <p dangerouslySetInnerHTML={{ __html: renderMarkdown(bubble.text) }} />
          <canvas
            ref={bubbleMon}
            className="sab-monitor"
            width={240}
            height={30}
            aria-hidden="true"
          />
          <div className="sab-row">
            <button
              type="button"
              className="sab-btn"
              onClick={() => {
                touch();
                void voice.speak(bubble.text, lang);
              }}
            >
              {T.hear}
            </button>
            {!bubble.bye && (
              <>
                <button type="button" className="sab-btn sab-btn--pri" onClick={openPanel}>
                  {T.ask}
                </button>
                <button type="button" className="sab-btn" onClick={() => void farewell()}>
                  {T.thx}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="sab-stage">
          <span className="sab-halo" />
          <span className="sab-pad">
            <i />
            <i />
          </span>
          <svg
            className="sab-ecg"
            viewBox="0 0 300 80"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 48 H92 L102 42 L110 52 L122 8 L136 74 L146 40 L156 48 H190 L198 44 L206 48 H300" />
          </svg>
          <span className="sab-cross" aria-hidden="true">
            <svg viewBox="0 0 64 64">
              <path d="M24 6h16v18h18v16H40v18H24V40H6V24h18z" />
            </svg>
          </span>
          <button
            type="button"
            className="sab-fig"
            onClick={onFigure}
            onMouseEnter={onHover}
            aria-label={T.open}
            tabIndex={stage === "on" ? 0 : -1}
          >
            <span className="sab-body" ref={bodyRef} data-pose={pose}>
              <span
                className="sab-canvas"
                style={{ "--sab-fig": `url(${baseAsset.url})` } as CSSProperties}
              >
                {POSES.map(([key, src]) => (
                  <img
                    key={key}
                    className={`sab-pose${pose === key ? " is-on" : ""}`}
                    src={src}
                    alt={key === "base" ? T.name : ""}
                    draggable={false}
                    width={512}
                    height={1100}
                    decoding="async"
                  />
                ))}
                <img className="sab-fx sab-blink" src={blinkAsset.url} alt="" draggable={false} />
                <img className="sab-fx sab-mouth" src={mouthAsset.url} alt="" draggable={false} />
                <span className="sab-holo" />
              </span>
            </span>
            {!reduced && live !== false && (
              <SabinaLive talking={talking} level={() => voice.level()} onReady={setLive} />
            )}
          </button>
          <span className="sab-beam" />
          <span className="sab-parts" aria-hidden="true">
            {parts.map((p, i) => (
              <i key={i} className={p.cross ? "is-cross" : "is-dot"} style={p.style} />
            ))}
          </span>
        </div>
      </div>

      <button type="button" id="sab-launch" onClick={summon} aria-label={T.open} title={T.open}>
        <img src={faceAsset.url} alt="" width={64} height={64} />
        <span className="sab-launch-badge" aria-hidden="true">
          +
        </span>
      </button>

      <div id="sab-panel" role="dialog" aria-label={T.name} aria-hidden={!open} dir={langDir}>
        <div id="sab-head">
          <div id="sab-face">
            <img src={faceAsset.url} alt="" width={46} height={46} />
            <i />
          </div>
          <div id="sab-ttl">
            <b>{T.name}</b>
            <span>{T.sub}</span>
            <canvas
              ref={headMon}
              className="sab-monitor sab-monitor--head"
              width={150}
              height={18}
              aria-hidden="true"
            />
          </div>
          <button
            type="button"
            className="sab-hb"
            onClick={toggleVoice}
            aria-pressed={voiceOn}
            aria-label={voiceOn ? T.voiceOff : T.voiceOn}
            title={voiceOn ? T.voiceOff : T.voiceOn}
          >
            {voiceOn ? <Volume2 /> : <VolumeX />}
          </button>
          <button
            type="button"
            className="sab-hb sab-hb--txt"
            onClick={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
            aria-label="Language"
          >
            {T.lang}
          </button>
          <button
            type="button"
            className="sab-hb"
            onClick={clearChat}
            aria-label={T.clear}
            title={T.clear}
          >
            <RotateCcw />
          </button>
          <button
            type="button"
            className="sab-hb"
            onClick={() => setOpen(false)}
            aria-label={T.min}
            title={T.min}
          >
            <Minus />
          </button>
        </div>

        <div id="sab-log" ref={logRef} onClick={onLogClick}>
          <div
            className="sab-m sab-b"
            dir={langDir}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(T.hi) }}
          />
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`sab-m ${m.role === "u" ? "sab-u" : "sab-b"}`}
              dir={m.lang === "ar" ? "rtl" : "ltr"}
            >
              {m.local && <small className="sab-note">{SABINA_T[m.lang].err}</small>}
              {m.role === "u" ? (
                m.text
              ) : (
                <span dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }} />
              )}
            </div>
          ))}
          {typing && (
            <div className="sab-typing" aria-hidden="true">
              <svg viewBox="0 0 60 20">
                <path d="M0 12 H18 L22 9 L26 14 L31 2 L36 18 L40 10 L44 12 H60" />
              </svg>
            </div>
          )}
        </div>

        <div id="sab-quick">
          {T.q.map((q) => (
            <button
              key={q}
              type="button"
              className="sab-btn"
              disabled={busy}
              onClick={() => void send(q)}
            >
              {q}
            </button>
          ))}
        </div>

        <form
          id="sab-form"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <label htmlFor="sab-in" className="sab-sr">
            {T.input}
          </label>
          <textarea
            id="sab-in"
            ref={inputRef}
            rows={1}
            maxLength={1000}
            value={input}
            placeholder={listening ? T.listening : T.ph}
            onChange={(e) => {
              setInput(e.target.value);
              const el = e.target;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send(input);
              }
            }}
          />
          {SR && (
            <button
              type="button"
              className={`sab-fb sab-fb--mic${listening ? " is-on" : ""}`}
              onClick={toggleMic}
              aria-label={T.mic}
              title={T.mic}
            >
              <Mic />
            </button>
          )}
          <button
            type="submit"
            className="sab-fb"
            disabled={busy || !input.trim()}
            aria-label={T.send}
            title={T.send}
          >
            <Send />
          </button>
        </form>
        <div id="sab-disc">{T.disclaimer}</div>
      </div>
    </div>
  );
}
