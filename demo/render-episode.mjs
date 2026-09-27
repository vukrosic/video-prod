// Render the full episode (cold open + body) in resumable chunks, then join them and add the soundtrack.
// Usage: node render-episode.mjs [--chunk=1200] [--concurrency=4] [--from=0 --to=N]
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';

const containerChrome = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = process.env.CHROME_PATH ?? (fs.existsSync(containerChrome) ? containerChrome : null);
const chromiumOptions = {gl: process.env.GL ?? (process.platform === 'darwin' ? 'angle' : 'swangle')};
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const CHUNK = Number(args.chunk ?? 1200);
const concurrency = Number(args.concurrency ?? 4);

const serveUrl = await bundle({entryPoint: path.resolve('src/Root.tsx')});
const composition = await selectComposition({serveUrl, id: 'Episode', browserExecutable, chromiumOptions});
const total = composition.durationInFrames;
const from = Number(args.from ?? 0);
const to = Math.min(Number(args.to ?? total), total);
fs.mkdirSync('out/chunks', {recursive: true});

const chunks = [];
for (let a = 0; a < total; a += CHUNK) chunks.push([a, Math.min(a + CHUNK, total) - 1]);
for (const [a, b] of chunks) {
	const file = `out/chunks/${String(a).padStart(6, '0')}.mp4`;
	if (a < from || a >= to || fs.existsSync(file)) continue;
	const t0 = Date.now();
	await renderMedia({composition, serveUrl, codec: 'h264', crf: 18, muted: true, outputLocation: file + '.tmp.mp4', browserExecutable, chromiumOptions, frameRange: [a, b], concurrency});
	fs.renameSync(file + '.tmp.mp4', file);
	console.log(`chunk ${a}-${b} done in ${((Date.now() - t0) / 1000).toFixed(0)} s (${(((Date.now() - t0) / 1000) / (b - a + 1)).toFixed(2)} s/frame)`);
}

const done = chunks.every(([a]) => fs.existsSync(`out/chunks/${String(a).padStart(6, '0')}.mp4`));
if (!done) process.exit(0);
// join video, build the soundtrack (cold open mix padded to its exact length + episode), mux
const list = chunks.map(([a]) => `file '${path.resolve(`out/chunks/${String(a).padStart(6, '0')}.mp4`)}'`).join('\n');
fs.writeFileSync('out/chunks/list.txt', list);
const fps = composition.fps;
const cold = total - JSON.parse(fs.readFileSync('src/episode.json', 'utf8')).durationFrames;
const hasFfmpeg = (() => {
	try {
		execFileSync('ffmpeg', ['-version'], {stdio: 'ignore'});
		return true;
	} catch {
		return false;
	}
})();
// system ffmpeg if installed, else the copy that ships with Remotion
const ff = (a) =>
	hasFfmpeg ? execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], {stdio: 'inherit'}) : execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-loglevel', 'error', ...a], {stdio: 'inherit'});
ff(['-f', 'concat', '-safe', '0', '-i', 'out/chunks/list.txt', '-c', 'copy', 'out/episode-video.mp4']);
const src = (n) => (fs.existsSync(`public/${n}.wav`) ? `public/${n}.wav` : `public/${n}.m4a`);
ff(['-i', src('mix'), '-i', src('episode'), '-filter_complex', `[0:a]apad,atrim=0:${cold / fps},aformat=sample_rates=48000:channel_layouts=stereo[a0];[1:a]aformat=sample_rates=48000:channel_layouts=stereo[a1];[a0][a1]concat=n=2:v=0:a=1[a]`, '-map', '[a]', 'out/episode-audio.wav']);
ff(['-i', 'out/episode-video.mp4', '-i', 'out/episode-audio.wav', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', 'out/episode.mp4']);
console.log('done: out/episode.mp4');
