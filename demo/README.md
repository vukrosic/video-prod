# Cold-open demo (Remotion)

A 20-second test of the episode 1 cold open, made entirely from code.

- `audio/build_audio.py` generates the voiceover, synthesizes the music and SFX on a 120 BPM grid, mixes
  everything to `public/mix.wav`, and writes `src/timeline.json` (the frame of every line, word and event).
- `src/` is the Remotion composition. Every cut, shake, flash and caption reads its timing from
  `timeline.json`, so picture and sound stay in sync when the voice changes.
- `src/shaders.ts` holds the GLSL shaders that paint the planets (molten Earth, Theia, the impact, and the
  later-era Earths in the title), the lava ocean and the ash sky. `src/Shader.tsx` draws one per frame.
  The character and HUD are SVG/HTML in `src/fx.tsx`.

## Build

```sh
# system deps: ffmpeg fonts-inter; python: numpy scipy (+ a voice engine, below)
npm install
python3 audio/build_audio.py      # voice + music + timeline
node render.mjs                    # -> out/cold-open.mp4
node render.mjs --stills=40,240    # quick preview frames
npx remotion studio src/Root.tsx   # live editor in the browser
```

`render.mjs` uses the cloud container's headless Chromium when present. Otherwise Remotion downloads its own.
Shaders need WebGL: it uses SwiftShader (CPU, ~1-2 s per frame at 1080p) on Linux and the GPU (`angle`) on a
Mac; override with `GL=swangle|angle|egl`.

## Voice

`build_audio.py` picks the engine with `TTS=kokoro|edge|festival` (default: the first one installed).

- **Kokoro** (default, `af_heart`): an open 82M-parameter neural voice that runs locally on CPU. It sounds much
  less robotic than Edge TTS and returns real word timestamps, which drive the captions. The model downloads
  from Hugging Face on first run. Other voices: `VOICE=af_bella`, `am_michael`, `am_fenrir`, `bm_george`,
  `bm_fable`. `SPEED` defaults to 0.95.
- **Edge TTS** (`en-US-JennyNeural` by default, as in money-generator). Needs network access to
  speech.platform.bing.com. `VOICE=en-US-AndrewMultilingualNeural` is a more natural option.
- **Festival**: an offline, robotic fallback.

```sh
pip install torch --index-url https://download.pytorch.org/whl/cpu   # CPU build (Linux); plain `pip install torch` on a Mac
pip install kokoro soundfile numpy scipy
python3 audio/build_audio.py

TTS=edge VOICE=en-US-AndrewMultilingualNeural python3 audio/build_audio.py
# behind a TLS-inspecting proxy (the Claude cloud container), edge-tts needs the proxy CA:
TTS=edge SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3 audio/build_audio.py
```

Every cut is re-timed from the new voice automatically. After generating, listen for mispronunciations and
rewrite any line that sounds wrong.
