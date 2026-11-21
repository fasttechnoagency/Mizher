// Sabina "live" body: two real filmed loops (idle + talking) shot on green screen, keyed out
// in real time with WebGL so she stands on the page with soft hair edges and no green spill.
// Talking is driven by her actual voice: the talk loop cross-fades in when she speaks, its
// speed follows voice loudness (fast syllables = faster lips), and it eases back to idle in pauses.
import { useEffect, useRef } from "react";

const SRC = {
  idle: ["/sabina/sabina-idle.webm", "/sabina/sabina-idle.mp4"],
  talk: ["/sabina/sabina-talk.webm", "/sabina/sabina-talk.mp4"],
} as const;

const VS = `attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5,.5-p.y*.5);gl_Position=vec4(p,0.,1.);}`;
// Chroma key in YCbCr against the clip's own backdrop colour (sampled from its top corners),
// soft matte for hair, edge despill, and a light contrast lift for a natural skin tone.
const FS = `precision mediump float;varying vec2 uv;uniform sampler2D a;uniform sampler2D b;uniform float m;
vec3 ycc(vec3 c){return vec3(.299*c.r+.587*c.g+.114*c.b,-.169*c.r-.331*c.g+.5*c.b,.5*c.r-.419*c.g-.081*c.b);}
vec4 key(sampler2D t){vec3 bg=(texture2D(t,vec2(.03,.02)).rgb+texture2D(t,vec2(.97,.02)).rgb)*.5;
vec4 c=texture2D(t,uv);float d=distance(ycc(c.rgb).yz,ycc(bg).yz);float al=smoothstep(.085,.2,d);
float sp=c.g-max(c.r,c.b);if(sp>0.){c.g-=sp*(1.-al*.35);c.rgb+=sp*.18;}
c.rgb=clamp((c.rgb-.5)*1.03+.5,0.,1.);return vec4(c.rgb*al,al);}
void main(){gl_FragColor=mix(key(a),key(b),m);}`;

type Props = {
  talking: boolean;
  level: () => number;
  onReady: (ok: boolean) => void;
};

function makeVideo(srcs: readonly string[]) {
  const v = document.createElement("video");
  v.muted = true;
  v.loop = true;
  v.playsInline = true;
  v.preload = "auto";
  v.crossOrigin = "anonymous";
  v.setAttribute("playsinline", "");
  for (const s of srcs) {
    const el = document.createElement("source");
    el.src = s;
    el.type = s.endsWith(".webm") ? "video/webm" : "video/mp4";
    v.appendChild(el);
  }
  return v;
}

export function SabinaLive({ talking, level, onReady }: Props) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const talkingRef = useRef(talking);
  talkingRef.current = talking;
  const levelRef = useRef(level);
  levelRef.current = level;
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) {
      readyRef.current(false);
      return;
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      readyRef.current(false);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = [0, 1].map((i) => {
      const t = gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return t;
    });
    gl.uniform1i(gl.getUniformLocation(prog, "a"), 0);
    gl.uniform1i(gl.getUniformLocation(prog, "b"), 1);
    const uMix = gl.getUniformLocation(prog, "m");

    const idle = makeVideo(SRC.idle);
    const talk = makeVideo(SRC.talk);
    let alive = true;
    let ready = false;
    let failed = false;
    const fail = () => {
      if (failed || ready) return;
      failed = true;
      readyRef.current(false);
    };
    idle.addEventListener("error", fail, true);
    talk.addEventListener("error", fail, true);
    const failTimer = setTimeout(fail, 12000);
    void idle.play().catch(() => {});

    let mix = 0;
    let amp = 0;
    let silentFor = 0;
    let last = performance.now();
    let raf = 0;
    const upload = (i: number, v: HTMLVideoElement) => {
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, tex[i]!);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
    };
    const tick = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const lv = levelRef.current();
      amp += (lv - amp) * 0.2;
      silentFor = lv > 0.03 ? 0 : silentFor + dt;
      const speaking = talkingRef.current && silentFor < 0.45;
      if (speaking && talk.paused) {
        // start at a random spot so repeated answers never look identical
        if (talk.readyState >= 1 && mix < 0.05) talk.currentTime = Math.random() * (talk.duration || 8) * 0.8;
        void talk.play().catch(() => {});
      }
      mix += ((speaking ? 1 : 0) - mix) * Math.min(1, dt * (speaking ? 7 : 4));
      if (talk.readyState >= 2) talk.playbackRate = 0.8 + Math.min(1, amp * 1.6) * 0.35;
      if (!speaking && mix < 0.01 && !talk.paused) talk.pause();
      if (idle.readyState >= 2) {
        if (cv.width !== idle.videoWidth) {
          cv.width = idle.videoWidth;
          cv.height = idle.videoHeight;
        }
        gl.viewport(0, 0, cv.width, cv.height);
        upload(0, idle);
        if (talk.readyState >= 2) upload(1, talk);
        gl.uniform1f(uMix, talk.readyState >= 2 ? mix : 0);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (!ready && !failed) {
          ready = true;
          clearTimeout(failTimer);
          readyRef.current(true);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onVis = () => (document.hidden ? idle.pause() : void idle.play().catch(() => {}));
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(failTimer);
      document.removeEventListener("visibilitychange", onVis);
      for (const v of [idle, talk]) {
        v.pause();
        v.removeAttribute("src");
        v.innerHTML = "";
        v.load();
      }
    };
  }, []);

  return <canvas ref={cvRef} className="sab-live" aria-hidden="true" width={440} height={1280} />;
}
