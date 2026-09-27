# Cold-open demo (Remotion)

A 22-second test of the episode 1 cold open, made entirely from code.

- `audio/build_audio.py` generates the voiceover (offline Festival TTS, a placeholder), synthesizes the
  music and SFX on a 120 BPM grid, mixes everything to `public/mix.wav`, and writes `src/timeline.json`
  (the frame of every line, word and event).
- `src/` is the Remotion composition. Every cut, shake, flash and caption reads its timing from
  `timeline.json`, so picture and sound stay in sync when the voice changes.

## Build

```sh
# system deps: ffmpeg festival festvox-us-slt-hts fonts-inter; python: numpy scipy
npm install
python3 audio/build_audio.py      # voice + music + timeline
node render.mjs                    # -> out/cold-open.mp4
node render.mjs --stills=40,240    # quick preview frames
npx remotion studio src/Root.tsx   # live editor in the browser
```

`render.mjs` uses the cloud container's headless Chromium when present. Otherwise Remotion downloads its own.

## Real voice (Edge TTS, same as money-generator)

`build_audio.py` uses Edge TTS when it's available (`en-US-JennyNeural`, natural `+0%` rate / `+0Hz` pitch /
`+0%` volume, matching money-generator), and otherwise falls back to the offline Festival voice. Edge TTS
needs Microsoft's speech service, which the Claude cloud container can't reach, so run it on the Mac:

```sh
cd video-prod/demo
npm install
/Users/vukrosic/miniconda3/bin/pip install numpy scipy
EDGE_TTS=/Users/vukrosic/miniconda3/bin/edge-tts VOICE=en-US-JennyNeural \
  /Users/vukrosic/miniconda3/bin/python audio/build_audio.py
node render.mjs
```

Every cut is re-timed from the new voice automatically. To try a deeper narrator, set e.g.
`VOICE=en-US-AndrewNeural` or `VOICE=en-US-GuyNeural`. Then listen for mispronunciations and rewrite any line that sounds wrong.
