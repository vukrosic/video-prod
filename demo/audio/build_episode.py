"""Build the voiceover, score and timeline for the episode body (everything after the cold open).

Outputs:
  public/episode.wav      narration + music + SFX
  src/episode.json        frame timings of every section, line and word

Voice clips are cached in audio/cache/ (keyed by voice and text), so re-running to tweak the score is fast.
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile

sys.path.insert(0, str(Path(__file__).parent))
from build_audio import ENGINE, FPS, ROOT, SR, SPEED, VOICE, tts, word_timings  # noqa: E402
from episode_script import END_CARD_SECONDS, SECTION_PAUSE, SECTIONS  # noqa: E402
import score  # noqa: E402

CACHE = Path(__file__).parent / "cache"
LINE_GAP = 0.45  # default silence between lines


def cached_tts(text):
    key = hashlib.sha1(f"{ENGINE}|{VOICE}|{SPEED}|{text}".encode()).hexdigest()[:16]
    f = CACHE / f"{key}.npz"
    if f.exists():
        z = np.load(f, allow_pickle=True)
        return z["audio"], (z["words"].tolist() if z["words"].size else None)
    audio, words = tts(text)
    CACHE.mkdir(exist_ok=True)
    np.savez(f, audio=audio, words=np.array(words or [], dtype=float))
    return audio, words


def main():
    print(f"voice: {ENGINE} {VOICE}")
    t = 0.0
    placed = []  # (start_seconds, clip)
    sections = []
    for sec in SECTIONS:
        sec_start = t
        t += sec.get("pause", SECTION_PAUSE)
        lines = []
        for lid, text, pause in sec["lines"]:
            clip, stamps = cached_tts(text)
            t += pause + (LINE_GAP if lines else 0)
            dur = len(clip) / SR
            placed.append((t, clip))
            lines.append({"id": lid, "text": text, "from": round(t * FPS), "to": round((t + dur) * FPS),
                          "words": word_timings(text, t, dur, stamps)})
            t += dur
        t += 1.0  # breathing room at the end of each section
        sections.append({"id": sec["id"], "from": round(sec_start * FPS), "to": round(t * FPS), "lines": lines})
        print(f"{sec['id']:14s} {sec_start / 60:5.2f} min  ({(t - sec_start):5.1f} s, {len(lines)} lines)")
    sections[-1]["to"] = round((t + END_CARD_SECONDS) * FPS)
    total = t + END_CARD_SECONDS

    vo = np.zeros(int(total * SR) + SR)
    for start, clip in placed:
        s = int(start * SR)
        vo[s:s + len(clip)] += clip
    timeline = {"fps": FPS, "durationFrames": round(total * FPS), "sections": sections}
    mix = score.mix(vo, timeline, total)

    stereo = np.clip(mix, -1, 1)
    (ROOT / "public").mkdir(exist_ok=True)
    wavfile.write(ROOT / "public" / "episode.wav", SR, (stereo * 32767).astype(np.int16))
    (ROOT / "src" / "episode.json").write_text(json.dumps(timeline, indent=1))
    print(f"wrote public/episode.wav and src/episode.json, {total / 60:.2f} min")


if __name__ == "__main__":
    np.random.seed(11)
    main()
