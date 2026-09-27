"""Synthesized score and sound design for the episode body.

Music is a sequence of cues (mood presets) that crossfade at section starts and at key lines. Each mood is
a slow chord progression voiced as a detuned-saw pad, a sub bass, an optional plucked arpeggio and optional
soft percussion, all sent through a synthetic reverb. SFX are placed on line starts by id.
"""
import numpy as np
from scipy.signal import butter, oaconvolve, sosfilt

SR = 44100
FPS = 30


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def saw(f, n, phase=0.0):
    return 2 * ((np.arange(n) * f / SR + phase) % 1.0) - 1


def adsr(n, a, r):
    e = np.ones(n, dtype=np.float32)
    na, nr = min(int(a * SR), n), min(int(r * SR), n)
    e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


# ---------------------------------------------------------------- moods
# chords: MIDI note lists; clen: seconds per chord; cutoff: pad brightness (Hz);
# arp: notes per second (0 = none); perc: 0 none, 1 soft pulse, 2 driving; bass: sub level
C, D, E, F, G, A, B = 60, 62, 64, 65, 67, 69, 71
MOODS = {
    "rules": dict(chords=[[C, E, G, B], [A - 12, C, E, G], [F - 12, A - 12, C, E], [G - 12, B - 12, D, A]],
                  clen=3.2, cutoff=1500, arp=4, perc=0, bass=0.5, gain=0.8),
    "hadean": dict(chords=[[D, F, A, E + 12], [A - 24 + 12, D, F, C + 12], [G - 12, A - 12, D, F], [F - 12, A - 12, C, E]],
                   clen=4.5, cutoff=1100, arp=2, perc=0, bass=0.7, gain=0.9),
    "archean": dict(chords=[[E, G, B, F + 12], [C, E, G, B], [A - 12, C, E, B], [B - 12, E, F + 1, A]],
                    clen=5.0, cutoff=900, arp=1.5, perc=0, bass=0.6, gain=0.85),
    "oxidation": dict(chords=[[F - 12, A - 12, C, G], [C - 12, E - 12, G - 12, D], [D - 12, F - 12, A - 12, E], [A - 24 + 12 - 2, D, F, C + 12]],
                      clen=3.6, cutoff=1500, arp=4, perc=0, bass=0.6, gain=0.85),
    "boring": dict(chords=[[G - 12, B - 12, D, A], [E - 12, G - 12, B - 12, D], [C - 12, E - 12, G - 12, B - 12], [D - 12, F + 1 - 12, A - 12, E]],
                   clen=2.0, cutoff=1800, arp=8, perc=1, bass=0.5, gain=0.75),
    "reveal": dict(chords=[[D - 12, A - 12, D, F], [D - 12, A - 12, C + 1, E], [D - 12, A - 12, D, G], [D - 12, A - 12, C, F]],
                   clen=3.0, cutoff=800, arp=0, perc=1, bass=0.9, gain=0.9),
    "snowball": dict(chords=[[A, C + 12, E + 12, B + 12], [F, A, C + 12, E + 12], [D, F, A, E + 12], [E, G + 1, B, D + 12]],
                     clen=5.0, cutoff=2400, arp=1, perc=0, bass=0.0, gain=0.6),
    "tension": dict(chords=[[D - 12, A - 12, E], [D - 12, A - 12, F]], clen=2.5, cutoff=700, arp=0, perc=1, bass=0.6, gain=0.7),
    "triumph": dict(chords=[[D - 12, F + 1 - 12, A - 12, D, A], [A - 24, E - 12, A - 12, C + 1, E], [B - 24, F + 1 - 12, B - 12, D, F + 1], [G - 24, D - 12, G - 12, B - 12, D]],
                    clen=2.4, cutoff=2600, arp=8, perc=2, bass=0.8, gain=1.0),
    "cambrian": dict(chords=[[D - 12, F + 1 - 12, A - 12, E], [B - 24, D - 12, F + 1 - 12, A - 12], [G - 24, B - 12, D, F + 1], [A - 24, C + 1 - 12, E - 12, B - 12]],
                     clen=3.2, cutoff=1600, arp=4, perc=1, bass=0.6, gain=0.8),
    "lush": dict(chords=[[E - 1 - 12, G - 12, B - 1 - 12, D], [C - 12, E - 1 - 12, G - 12, B - 1 - 12], [A - 1 - 24, C - 12, E - 1 - 12, G - 12], [B - 1 - 24, D - 12, F - 12, A - 1 - 12]],
                 clen=3.6, cutoff=1800, arp=4, perc=1, bass=0.7, gain=0.85),
    "fire": dict(chords=[[C - 12, G - 12, E - 1], [C - 12, G - 12, D], [A - 1 - 24, E - 1 - 12, C], [B - 1 - 24, F - 12, D]],
                 clen=2.2, cutoff=1300, arp=6, perc=2, bass=0.9, gain=0.9),
    "dark": dict(chords=[[C - 24, G - 24, C - 12, E - 1 - 12], [C - 24, A - 1 - 24, C - 12, E - 1 - 12], [C - 24, G - 24, B - 1 - 24, D - 12], [C - 24, F - 24, A - 1 - 24, C - 12]],
                 clen=4.0, cutoff=600, arp=0, perc=1, bass=1.0, gain=0.9),
    "warm": dict(chords=[[B - 1 - 12, D, F, C + 12], [G - 12, B - 1 - 12, D, F], [E - 1 - 12, G - 12, B - 1 - 12, D], [F - 12, A - 12, C, G]],
                 clen=3.4, cutoff=1700, arp=4, perc=1, bass=0.6, gain=0.8),
    "silence": dict(chords=[[B - 1 + 12]], clen=6.0, cutoff=3000, arp=0, perc=0, bass=0.0, gain=0.25),
    "hope": dict(chords=[[F - 12, A - 12, C, G], [D - 12, F - 12, A - 12, E], [B - 1 - 24, D - 12, F - 12, C], [C - 12, E - 12, G - 12, D]],
                 clen=3.0, cutoff=1400, arp=3, perc=0, bass=0.5, gain=0.8),
    "human": dict(chords=[[A - 12, C + 1, E, B], [E - 12, G + 1 - 12, B - 12, F + 1], [F + 1 - 12, A - 12, C + 1, E], [D - 12, F + 1 - 12, A - 12, E]],
                  clen=3.4, cutoff=1500, arp=4, perc=1, bass=0.6, gain=0.8),
    "twist": dict(chords=[[F + 1 - 12, A - 12, C + 1, E], [D - 12, F - 12, A - 12, C + 1]], clen=3.0, cutoff=900, arp=2, perc=0, bass=0.7, gain=0.8),
    "today": dict(chords=[[C - 12, E - 12, G - 12, D], [G - 24, B - 12, D, A], [A - 24, C - 12, E - 12, B - 12], [F - 24, A - 12, C, G]],
                  clen=3.6, cutoff=1300, arp=3, perc=0, bass=0.6, gain=0.85),
}

# (line id or section id, mood). Section ids start at the section start; line ids at the line start.
CUES = [
    ("rules", "rules"), ("hadean", "hadean"), ("archean", "archean"), ("oxidation", "oxidation"),
    ("boring", "boring"), ("b4", "reveal"), ("snowball", "snowball"),
    ("cambrian", "tension"), ("c5", "triumph"), ("c8", "cambrian"),
    ("carboniferous", "lush"), ("k8", "fire"), ("k10", "lush"),
    ("dying", "dark"), ("cretaceous", "warm"), ("t5", "silence"), ("t8", "dark"), ("t12", "hope"),
    ("iceage", "human"), ("i6", "twist"), ("i8", "human"), ("today", "today"),
]


def render_mood(m, dur, seed):
    rng = np.random.default_rng(seed)
    n = int(dur * SR)
    out = np.zeros(n, dtype=np.float32)
    clen = m["clen"]
    nch = int(np.ceil(dur / clen)) + 1
    for i in range(nch):
        chord = m["chords"][i % len(m["chords"])]
        s = int(i * clen * SR)
        if s >= n:
            break
        ln = min(int((clen + 1.2) * SR), n - s)
        env = adsr(ln, 0.9, 1.4)
        # pad: 3 detuned saws per note, low-passed
        pad = np.zeros(ln, dtype=np.float32)
        for note in chord:
            f = midi(note)
            for det in (-0.08, 0.0, 0.07):
                pad += saw(f * 2 ** (det / 12), ln, rng.random()).astype(np.float32)
        pad = lp(pad, m["cutoff"], 2) * env / (len(chord) * 3) * 0.9
        out[s:s + ln] += pad
        # sub bass on the lowest note
        if m["bass"]:
            t = np.arange(ln) / SR
            out[s:s + ln] += (np.sin(2 * np.pi * midi(min(chord) - 12) * t) * env * 0.35 * m["bass"]).astype(np.float32)
        # plucked arpeggio
        if m["arp"]:
            step = 1 / m["arp"]
            k = 0
            while k * step < clen:
                ps = s + int(k * step * SR)
                note = sorted(chord)[k % len(chord)] + 12
                pl = int(0.9 * SR)
                if ps + pl > n:
                    break
                t = np.arange(pl) / SR
                f = midi(note)
                tone = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t))
                out[ps:ps + pl] += (tone * np.exp(-t * 6) * 0.11).astype(np.float32)
                k += 1
    # percussion
    if m["perc"]:
        beat = 0.5 if m["perc"] == 2 else 1.0
        for i in range(int(dur / beat)):
            ps = int(i * beat * SR)
            kl = int(0.35 * SR)
            if ps + kl > n:
                break
            t = np.arange(kl) / SR
            f = 45 + 80 * np.exp(-t * 30)
            kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * (0.5 if m["perc"] == 1 else 0.7)
            out[ps:ps + kl] += kick.astype(np.float32)
            hs = ps + int(beat / 2 * SR)
            hl = int(0.05 * SR)
            if hs + hl < n:
                out[hs:hs + hl] += (hp(rng.standard_normal(hl), 7000) * np.exp(-np.arange(hl) / SR * 80) * 0.12).astype(np.float32)
    return out * m["gain"]


def reverb(x, sec=2.6, seed=0):
    rng = np.random.default_rng(seed)
    n = int(sec * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 3.0 / sec * 2.3)
    ir = lp(ir, 5000) / np.sqrt(np.sum(ir ** 2))
    return oaconvolve(x, ir.astype(np.float32))[: len(x)]


# ---------------------------------------------------------------- SFX
def noise(sec, rng):
    return rng.standard_normal(int(sec * SR))


def whoosh(rng, sec=1.4):
    x = noise(sec, rng)
    t = np.arange(len(x)) / SR
    out = np.zeros_like(x)
    chunks = 30
    for i in range(chunks):
        a, b = i * len(x) // chunks, (i + 1) * len(x) // chunks
        u = i / chunks
        out[a:b] = bp(x[a:b], 200 + 3000 * u ** 1.5, 400 + 6000 * u ** 1.5)
    return out * np.sin(np.pi * t / sec) ** 2 * 0.6


def boom(rng, sec=3.0, amt=1.0):
    t = np.arange(int(sec * SR)) / SR
    f = 30 + 70 * np.exp(-t * 5)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.3)
    crack = lp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 5) * 0.6
    return np.tanh((sub + crack) * 1.5) * 0.8 * amt


def sting(rng):
    """Death: low hit + a hiss + a falling tone."""
    t = np.arange(int(1.6 * SR)) / SR
    f = 220 * np.exp(-t * 1.5)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.5) * 0.35
    hs = hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 5) * 0.25
    return boom(rng, 1.6, 0.6) + tone + hs


def chime(rng):
    """Record / survival: a bright major arpeggio."""
    out = np.zeros(int(1.8 * SR))
    for i, note in enumerate([79, 83, 86, 91]):
        s = int(i * 0.07 * SR)
        t = np.arange(len(out) - s) / SR
        out[s:] += np.sin(2 * np.pi * midi(note) * t) * np.exp(-t * 3) * 0.16
    return out


def tickclick(rng):
    t = np.arange(int(0.03 * SR)) / SR
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 180) * 0.25


def bed(kind, sec, rng):
    """Looping ambience: waves, wind, fire, bubbles, rumble."""
    n = int(sec * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n)
    if kind == "waves":
        swell = 0.5 + 0.5 * np.sin(2 * np.pi * t / 6.5) ** 2
        return lp(x, 900) * swell * 0.18
    if kind == "wind":
        g = 0.6 + 0.4 * np.sin(2 * np.pi * t / 5.1) * np.sin(2 * np.pi * t / 2.3)
        return bp(x, 300, 1400) * g * 0.22
    if kind == "fire":
        crackle = (rng.random(n) > 0.9993) * rng.standard_normal(n) * 3
        return lp(x, 600) * 0.15 + hp(lp(crackle, 5000), 1500) * 0.5
    if kind == "bubbles":
        out = lp(x, 400) * 0.05
        for _ in range(int(sec * 3)):
            s = rng.integers(0, n - SR // 5)
            tt = np.arange(SR // 5) / SR
            f = 500 + 900 * rng.random()
            out[s:s + len(tt)] += np.sin(2 * np.pi * f * (1 + tt * 3) * tt) * np.exp(-tt * 30) * 0.12
        return out
    if kind == "rumble":
        return lp(x, 120) * 0.45
    raise ValueError(kind)


def mix(vo, timeline, total):
    rng = np.random.default_rng(5)
    n = len(vo)
    secs = {s["id"]: s for s in timeline["sections"]}
    lines = {l["id"]: l for s in timeline["sections"] for l in s["lines"]}

    def at(key):  # seconds
        if key in secs:
            return secs[key]["from"] / FPS
        return lines[key]["from"] / FPS

    def end(key):
        if key in secs:
            return secs[key]["to"] / FPS
        return lines[key]["to"] / FPS

    # ---- music: crossfaded cues
    music = np.zeros(n, dtype=np.float32)
    times = [at(k) for k, _ in CUES] + [total]
    xf = 1.5
    for i, (key, mood) in enumerate(CUES):
        s, e = times[i], times[i + 1]
        seg = render_mood(MOODS[mood], e - s + xf, seed=i)
        env = np.ones(len(seg), dtype=np.float32)
        a = int(xf * SR)
        env[:a] = np.linspace(0, 1, a) if i else 1
        env[-a:] *= np.linspace(1, 0, a)
        si = int(s * SR)
        ln = min(len(seg), n - si)
        music[si:si + ln] += (seg * env)[:ln]
    music = music + 0.55 * reverb(music, 3.0)
    music *= 0.4

    # ---- sfx
    sfx = np.zeros(n, dtype=np.float32)

    def put(clip, sec, gain=1.0):
        s = int(sec * SR)
        e = min(n, s + len(clip))
        if 0 <= s < n:
            sfx[s:e] += (clip[: e - s] * gain).astype(np.float32)

    for s in timeline["sections"][1:]:
        put(whoosh(rng), s["from"] / FPS + 0.2, 0.9)
        put(boom(rng, 2.5, 0.5), s["from"] / FPS + 1.3)
    for k in ["h8", "a6", "o8", "s4", "d7", "t11"]:
        put(sting(rng), at(k) - 0.5, 0.9)
    for k in ["c5", "c14", "k10", "i8", "y1"]:
        put(chime(rng), at(k) - 0.2, 0.9)
    # Boring Billion montage: a death tick on each flash
    b2 = at("b2")
    for i in range(10):
        put(tickclick(rng), b2 - 1.5 + i * 0.9, 1.0)
        put(boom(rng, 0.6, 0.25), b2 - 1.5 + i * 0.9)
    # Cambrian timer passing the old records
    for k in ["c2", "c3", "c4"]:
        put(tickclick(rng), at(k) - 0.1, 1.2)
    # ambience beds
    for key0, key1, kind, g in [("hadean", "archean", "waves", 1.0), ("archean", "oxidation", "waves", 0.8),
                                ("o4", "boring", "waves", 0.7), ("s3", "cambrian", "wind", 1.0),
                                ("cambrian", "c11", "waves", 0.9), ("c11", "carboniferous", "bubbles", 1.0),
                                ("o1", "o2", "bubbles", 1.0), ("k9", "k11", "fire", 1.0),
                                ("dying", "cretaceous", "rumble", 0.7), ("t9", "t12", "wind", 0.6),
                                ("iceage", "i6", "wind", 0.5)]:
        s, e = at(key0), at(key1)
        b = bed(kind, e - s, rng)
        fade = np.minimum(1, np.minimum(np.arange(len(b)), np.arange(len(b))[::-1]) / (1.0 * SR))
        put(b * fade, s, g)
    put(boom(rng, 3.0, 1.0), at("k9") + 1.2, 0.8)  # thunder
    # asteroid: rumble swell, then the impact
    sw = bed("rumble", 3.0, rng) * np.linspace(0, 1, int(3.0 * SR)) ** 2
    put(sw, at("t7") - 3.0, 1.4)
    put(boom(rng, 4.0, 1.0), at("t7") - 0.2, 1.3)
    # 24-hour clock ticking
    for i in range(int((end("y5") - at("y2")) / 0.5)):
        put(tickclick(rng), at("y2") + i * 0.5, 0.6)

    # ---- duck the music under the voice, then master
    env = lp(np.abs(vo), 6)
    duck = 1 - 0.65 * np.clip(env / (env.max() + 1e-9) * 5, 0, 1)
    speech = env > env.max() * 0.05
    db = lambda x: 20 * np.log10(np.sqrt(np.mean(x[speech] ** 2)) + 1e-9)  # noqa: E731
    print(f"under speech: voice {db(vo):.1f} dB, music {db(music * duck):.1f} dB")
    m = music * duck + sfx * 0.7 + vo * 1.0
    m = np.tanh(m * 1.05) * 0.95
    fade = int(3.0 * SR)
    m[-fade:] *= np.linspace(1, 0, fade)
    # gentle stereo width from the reverb-heavy music
    wide = reverb(music * duck, 1.2, seed=3) * 0.25
    return np.stack([m + wide, m - wide], axis=1).astype(np.float32)
