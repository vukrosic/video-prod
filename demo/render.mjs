// Render the demo. Usage: node render.mjs [--frames=start-end] [--stills=f1,f2,...]
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';

const browserExecutable =
	process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));

const serveUrl = await bundle({entryPoint: path.resolve('src/Root.tsx')});
const composition = await selectComposition({serveUrl, id: 'ColdOpen', browserExecutable});

if (args.stills) {
	for (const f of args.stills.split(',').map(Number)) {
		await renderStill({composition, serveUrl, frame: f, output: `out/still-${f}.png`, browserExecutable});
		console.log('still', f);
	}
} else {
	const frameRange = args.frames ? args.frames.split('-').map(Number) : null;
	let last = 0;
	await renderMedia({
		composition,
		serveUrl,
		codec: 'h264',
		crf: 18,
		outputLocation: 'out/cold-open.mp4',
		browserExecutable,
		frameRange,
		concurrency: 4,
		onProgress: ({progress}) => {
			if (progress - last >= 0.1) {
				last = progress;
				console.log(`${Math.round(progress * 100)}%`);
			}
		},
	});
	console.log('done: out/cold-open.mp4');
}
