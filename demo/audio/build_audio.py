"""Build the voiceover, music and SFX for the cold-open demo.

Outputs:
  public/mix.wav          final audio mix
  src/timeline.json       frame timings shared with the Remotion composition
"""
import asyncio
import json
import os
import ssl
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
FPS = 30
BPM = 120
BEAT = 60 / BPM  # 0.5 s = 15 frames

# Voiceover lines. Each starts on the first beat after the previous line (plus `gap` beats),
# so every cut lands on the music grid.
LINES = {
    "wake": "You wake up.",
    "ago": "It's four and a half billion years ago.",
    "hit": "Earth has just been hit by a planet the size of Mars.",
    "air": "The air is so hot, it contains vaporized rock.",
    "breath": "You take one breath.",
    "visit": "That was your whole visit.",
}


# Voice engine. Edge TTS matches the money-generator pipeline (natural rate/pitch/volume) and needs
# network access to Microsoft's speech service; Festival is an offline placeholder (TTS=festival).
try:
    import edge_tts
    import edge_tts.communicate
except ImportError:
    edge_tts = None
USE_EDGE = edge_tts is not None and os.environ.get("TTS") != "festival"
VOICE = os.environ.get("VOICE", "en-US-JennyNeural")
if USE_EDGE and os.environ.get("SSL_CERT_FILE"):
    # edge-tts pins certifi's CA bundle; honor SSL_CERT_FILE (needed behind a TLS-inspecting proxy).
    edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=os.environ["SSL_CERT_FILE"])
TRIM = "silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_threshold=-45dB:stop_duration=0.25,"
POLISH = ("highpass=f=70,equalizer=f=180:t=q:w=1:g=3,"
          "acompressor=threshold=-18dB:ratio=3:attack=5:release=80")


def tts(text: str) -> np.ndarray:
    with tempfile.TemporaryDirectory() as d:
        proc = Path(d) / "proc.wav"
        if USE_EDGE:
            raw = Path(d) / "raw.mp3"
            comm = edge_tts.Communicate(text, VOICE, rate="+0%", pitch="+0Hz", volume="+0%")
            asyncio.run(comm.save(str(raw)))
            chain = TRIM + POLISH
        else:
            raw = Path(d) / "raw.wav"
            subprocess.run(
                ["text2wave", "-eval", "(voice_cmu_us_slt_arctic_hts)", "-o", str(raw)],
                input=text.encode(), check=True, capture_output=True,
            )
            # Robotic voice: slow and lower it slightly, plus a touch of room echo.
            chain = (TRIM + f"asetrate={wavfile.read(raw)[0]}*0.94,aresample={SR}," + POLISH
                     + ",aecho=0.8:0.4:40|70:0.1|0.06")
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", str(raw), "-af", chain,
             "-ac", "1", "-ar", str(SR), str(proc)],
            check=True,
        )
        sr, data = wavfile.read(proc)
    data = data.astype(np.float32) / 32768
    return data / (np.abs(data).max() + 1e-9) * 0.9


def word_timings(text: str, start: float, dur: float):
    """Approximate per-word timing, weighted by word length (for kinetic captions)."""
    words = text.split()
    weights = np.array([len(w) + 2 for w in words], dtype=float)
    edges = np.concatenate([[0], np.cumsum(weights)]) / weights.sum() * dur
    return [{"w": w, "f": round((start + edges[i]) * FPS)} for i, w in enumerate(words)]


# ---------- synth helpers ----------
def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(t / a, 1) * np.exp(-t / r)


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def kick(punch=1.0):
    t = t_axis(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.002, 0.16) * punch


def boom():
    t = t_axis(3.0)
    f = 28 + 90 * np.exp(-t * 6)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.003, 0.9)
    crack = lp(np.random.randn(len(t)), 2500) * env(len(t), 0.001, 0.25) * 0.8
    return np.tanh((sub + crack) * 1.6) * 0.9


def riser(sec):
    t = t_axis(sec)
    n = np.random.randn(len(t))
    out = np.zeros_like(n)
    # sweep a band of noise upward in chunks
    chunks = 40
    for i in range(chunks):
        s, e = i * len(t) // chunks, (i + 1) * len(t) // chunks
        hz = 300 * (12 ** (i / chunks))
        out[s:e] = lp(n[s:e], hz)
    return out * (t / sec) ** 2 * 0.5


def hat():
    n = hp(np.random.randn(int(0.06 * SR)), 7000)
    return n * env(len(n), 0.001, 0.015) * 0.25


def tick():
    t = t_axis(0.03)
    return np.sin(2 * np.pi * 2200 * t) * env(len(t), 0.0005, 0.006) * 0.35


def inhale():
    t = t_axis(1.1)
    n = np.random.randn(len(t))
    shaped = lp(hp(n, 500), 3000) * np.sin(np.pi * t / 1.1) ** 2
    return shaped * 0.35


def hiss():
    t = t_axis(0.9)
    return hp(np.random.randn(len(t)), 3000) * env(len(t), 0.002, 0.25) * 0.5


def reverse_swell(sec=1.5):
    t = t_axis(sec)
    n = lp(np.random.randn(len(t)), 6000)
    return n * (t / sec) ** 3 * 0.5


def drone(sec):
    t = t_axis(sec)
    x = (np.sin(2 * np.pi * 55 * t) + 0.6 * np.sin(2 * np.pi * 82.4 * t)
         + 0.3 * np.sin(2 * np.pi * 110 * t + np.sin(2 * np.pi * 0.3 * t)))
    x += 0.4 * lp(np.random.randn(len(t)), 120)  # rumble
    return np.tanh(x * 0.8) * 0.25


def place(buf, clip, sec, gain=1.0):
    s = int(sec * SR)
    e = min(len(buf), s + len(clip))
    if s < len(buf):
        buf[s:e] += clip[: e - s] * gain


def main():
    print(f"voice: edge-tts {VOICE}" if USE_EDGE else "voice: festival (offline placeholder)")
    clips = {k: tts(v) for k, v in LINES.items()}
    beats_of = lambda k: len(clips[k]) / SR / BEAT  # noqa: E731
    nxt = lambda beat, k, gap=0: int(np.ceil(beat + beats_of(k))) + gap  # noqa: E731

    starts = {"wake": 1}
    starts["ago"] = nxt(starts["wake"], "wake")
    starts["hit"] = nxt(starts["ago"], "ago")
    IMPACT_BEAT = nxt(starts["hit"], "hit")        # Theia hits right after "Mars"
    SURFACE_BEAT = IMPACT_BEAT + 2                  # cut to the magma surface
    starts["air"] = SURFACE_BEAT
    starts["breath"] = nxt(starts["air"], "air", 1)
    INHALE_BEAT = nxt(starts["breath"], "breath")
    DEATH_BEAT = INHALE_BEAT + 2                     # timer stops, hiss, cut to black
    starts["visit"] = DEATH_BEAT + 2
    TITLE_BEAT = nxt(starts["visit"], "visit", 1)   # title slam
    END_BEAT = TITLE_BEAT + 7

    total = END_BEAT * BEAT
    music = np.zeros(int(total * SR))
    sfx = np.zeros_like(music)
    vo = np.zeros_like(music)

    timeline = {"fps": FPS, "bpm": BPM, "beatFrames": round(BEAT * FPS),
                "durationFrames": round(total * FPS), "lines": []}

    for lid, text in LINES.items():
        clip, beat = clips[lid], starts[lid]
        start = beat * BEAT
        place(vo, clip, start)
        dur = len(clip) / SR
        timeline["lines"].append({
            "id": lid, "text": text, "from": round(start * FPS),
            "to": round((start + dur) * FPS), "words": word_timings(text, start, dur),
        })
        print(f"{lid:7s} beat {beat:>2} start {start:5.2f}s dur {dur:4.2f}s")

    b = lambda n: n * BEAT  # noqa: E731
    timeline["events"] = {k: round(b(v) * FPS) for k, v in {
        "impact": IMPACT_BEAT, "surface": SURFACE_BEAT, "inhale": INHALE_BEAT,
        "death": DEATH_BEAT, "title": TITLE_BEAT}.items()}

    # --- music bed: drone until death, silence, then title hit ---
    d = drone(b(DEATH_BEAT))
    d *= np.minimum(np.arange(len(d)) / (SR * 1.5), 1)  # fade in
    place(music, d, 0)
    # heartbeat kicks (on-beat) before the impact, driving kicks after it
    for n in range(0, IMPACT_BEAT):
        place(music, kick(0.7), b(n))
        if n % 2 == 1:
            place(music, kick(0.45), b(n) + 0.18)  # "lub-dub"
    for n in range(SURFACE_BEAT, DEATH_BEAT):
        place(music, kick(1.0), b(n))
        place(music, hat(), b(n) + BEAT / 2)
    # timer ticks every 8th note on the surface
    for i in range((DEATH_BEAT - SURFACE_BEAT) * 2):
        place(sfx, tick(), b(SURFACE_BEAT) + i * BEAT / 2)

    place(sfx, riser(b(4)), b(IMPACT_BEAT - 4), 0.9)
    place(sfx, boom(), b(IMPACT_BEAT), 1.0)
    place(sfx, boom(), b(SURFACE_BEAT), 0.45)
    place(sfx, inhale(), b(INHALE_BEAT), 1.0)
    place(sfx, hiss(), b(DEATH_BEAT), 1.0)
    place(sfx, kick(1.2), b(DEATH_BEAT), 0.8)
    place(sfx, reverse_swell(b(3)), b(TITLE_BEAT - 3), 0.8)
    place(sfx, boom(), b(TITLE_BEAT), 1.1)
    # title groove
    for n in range(TITLE_BEAT, END_BEAT):
        place(music, kick(1.0), b(n))
        place(music, hat(), b(n) + BEAT / 2)
    tail = drone(b(END_BEAT - TITLE_BEAT))
    tail *= np.linspace(1, 0, len(tail)) ** 0.5
    place(music, tail, b(TITLE_BEAT), 1.2)

    # duck music under the voice (sidechain-style)
    vo_env = lp(np.abs(vo), 8)
    duck = 1 - 0.55 * np.clip(vo_env / (vo_env.max() + 1e-9) * 4, 0, 1)
    mix = music * duck * 0.9 + sfx * 0.8 + vo * 1.0
    mix = np.tanh(mix * 1.1) * 0.95
    # fade out
    fade = int(0.4 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)
    stereo = np.stack([mix, mix], axis=1)

    (ROOT / "public").mkdir(exist_ok=True)
    wavfile.write(ROOT / "public" / "mix.wav", SR, (stereo * 32767).astype(np.int16))
    (ROOT / "src" / "timeline.json").write_text(json.dumps(timeline, indent=1))
    print("wrote public/mix.wav and src/timeline.json,", f"{total:.1f}s")


if __name__ == "__main__":
    np.random.seed(7)
    main()
