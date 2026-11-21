// Sabina's voice: natural streamed speech from the server (24 kHz PCM over SSE), played
// through an analyser so her "voice monitor" can follow it. Falls back to the browser's own voice.
import type { SabinaLang } from "./sabina-brain";

const SPEECH_URL = "/api/public/sabina-tts";

export function speakableText(md: string, max = 650): string {
  let t = String(md)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#>`~]/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/\u200D|\uFE0F/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (t.length > max) {
    const cut = t.slice(0, max);
    const end = Math.max(
      cut.lastIndexOf("."),
      cut.lastIndexOf("؟"),
      cut.lastIndexOf("!"),
      cut.lastIndexOf("،"),
      cut.lastIndexOf("?"),
    );
    t = end > max * 0.5 ? cut.slice(0, end + 1) : cut;
  }
  return t;
}

export class SabinaVoice {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private data: Uint8Array<ArrayBuffer> | null = null;
  private sources = new Set<AudioBufferSourceNode>();
  private abort: AbortController | null = null;
  private gen = 0;
  private synthTalking = false;
  onTalk: (talking: boolean) => void = () => {};

  /** Must be called from a user gesture (tap/click) so the browser allows sound. */
  unlock() {
    try {
      if (!this.ctx) {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC({ sampleRate: 24000 });
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.55;
        this.analyser.connect(this.ctx.destination);
        this.data = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
      }
      if (this.ctx.state === "suspended") void this.ctx.resume();
    } catch {
      /* audio not available */
    }
  }

  /** Current loudness 0..1 — drives the heartbeat glow and voice monitor. */
  level(): number {
    if (this.synthTalking)
      return 0.35 + 0.35 * Math.abs(Math.sin(performance.now() / 95)) * Math.random();
    if (!this.analyser || !this.data || this.sources.size === 0) return 0;
    this.analyser.getByteTimeDomainData(this.data);
    let sum = 0;
    for (let i = 0; i < this.data.length; i++) {
      const v = ((this.data[i] ?? 128) - 128) / 128;
      sum += v * v;
    }
    return Math.min(1, Math.sqrt(sum / this.data.length) * 4.2);
  }

  stop() {
    this.gen++;
    this.abort?.abort();
    this.abort = null;
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    }
    this.sources.clear();
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* no synthesis */
    }
    if (this.synthTalking) this.synthTalking = false;
    this.onTalk(false);
  }

  /** Speaks the text; resolves when finished (true) or interrupted/failed (false). */
  async speak(markdown: string, lang: SabinaLang): Promise<boolean> {
    const text = speakableText(markdown);
    this.stop();
    if (!text) return false;
    const my = this.gen;
    this.unlock();
    const ok = await this.streamNatural(text, lang, my).catch(() => false);
    if (ok || my !== this.gen) return ok;
    return this.browserVoice(text, lang, my);
  }

  private async streamNatural(text: string, lang: SabinaLang, my: number): Promise<boolean> {
    const ctx = this.ctx;
    const analyser = this.analyser;
    if (!ctx || !analyser) return false;
    const controller = new AbortController();
    this.abort = controller;
    const res = await fetch(SPEECH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang }),
      signal: controller.signal,
    });
    if (!res.ok || !res.body || my !== this.gen) return false;

    let playhead = 0;
    let pending = new Uint8Array(0);
    let started = false;
    let done = false;
    let last: Promise<void> = Promise.resolve();
    const play = (b64: string) => {
      const bin = atob(b64);
      const incoming = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) incoming[i] = bin.charCodeAt(i);
      const bytes = new Uint8Array(pending.length + incoming.length);
      bytes.set(pending);
      bytes.set(incoming, pending.length);
      const usable = bytes.length - (bytes.length % 2);
      const view = new DataView(bytes.buffer, 0, usable);
      const samples = new Float32Array(usable / 2);
      for (let i = 0; i < samples.length; i++) samples[i] = view.getInt16(i * 2, true) / 32768;
      pending = bytes.slice(usable);
      if (!samples.length || my !== this.gen) return;
      const buffer = ctx.createBuffer(1, samples.length, 24000);
      buffer.copyToChannel(samples, 0);
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(analyser);
      this.sources.add(src);
      last = new Promise<void>((resolve) => {
        src.onended = () => {
          this.sources.delete(src);
          resolve();
        };
      });
      playhead = Math.max(playhead, ctx.currentTime + 0.06);
      src.start(playhead);
      playhead += buffer.duration;
      if (!started) {
        started = true;
        this.onTalk(true);
      }
    };

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buf = "";
    try {
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        buf += next.value;
        let idx: number;
        while ((idx = buf.indexOf("\n\n")) >= 0) {
          const block = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          for (const line of block.split("\n")) {
            if (!line.startsWith("data:")) continue;
            const raw = line.slice(5).trim();
            if (!raw || raw === "[DONE]") continue;
            const ev = JSON.parse(raw) as { type?: string; audio?: string; error?: unknown };
            if (ev.type === "error" || ev.error) throw new Error("speech error");
            if (ev.type === "speech.audio.done") done = true;
            else if (ev.type === "speech.audio.delta" && ev.audio) play(ev.audio);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    if (!started || my !== this.gen) return false;
    await last;
    // wait for any tail still scheduled
    while (this.sources.size > 0 && my === this.gen) await new Promise((r) => setTimeout(r, 80));
    if (my === this.gen) this.onTalk(false);
    return done && my === this.gen;
  }

  private browserVoice(text: string, lang: SabinaLang, my: number): Promise<boolean> {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) return Promise.resolve(false);
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "ar" ? "ar-JO" : "en-US";
      const voices = synth.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang));
      const female = voices.find((v) =>
        /female|zira|samantha|hoda|salma|laila|mariam|google/i.test(v.name),
      );
      const chosen = female ?? voices[0];
      if (chosen) u.voice = chosen;
      u.rate = lang === "ar" ? 0.95 : 1;
      u.pitch = 1.1;
      u.onstart = () => {
        if (my !== this.gen) return;
        this.synthTalking = true;
        this.onTalk(true);
      };
      const end = (ok: boolean) => {
        if (my === this.gen) {
          this.synthTalking = false;
          this.onTalk(false);
        }
        resolve(ok && my === this.gen);
      };
      u.onend = () => end(true);
      u.onerror = () => end(false);
      synth.speak(u);
    });
  }
}
