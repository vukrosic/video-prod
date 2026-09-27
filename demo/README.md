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

## Voice (Edge TTS, same as money-generator)

`build_audio.py` uses Edge TTS when the `edge-tts` Python package is installed (`en-US-JennyNeural`, natural
`+0%` rate / `+0Hz` pitch / `+0%` volume, matching money-generator). Otherwise, or with `TTS=festival`, it
falls back to the offline Festival voice. Try a deeper narrator with `VOICE=en-US-AndrewNeural` or
`VOICE=en-US-GuyNeural`. Every cut is re-timed from the new voice automatically.

```sh
pip install edge-tts numpy scipy

# Claude cloud container (needs network access to speech.platform.bing.com; the proxy's CA must be trusted)
SSL_CERT_FILE=/root/.ccr/ca-bundle.crt python3 audio/build_audio.py

# Mac
/Users/vukrosic/miniconda3/bin/python audio/build_audio.py
```

After generating, listen for mispronunciations and rewrite any line that sounds wrong.
