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

`render.mjs` uses the pre-installed headless Chromium. Set `CHROME_PATH` to use another one.
