// Load Inter from public/fonts so text looks the same on every machine (it is rarely installed on a Mac).
import {continueRender, delayRender, staticFile} from 'remotion';

const WEIGHTS: [string, number][] = [
	['Regular', 400],
	['Medium', 500],
	['SemiBold', 600],
	['Bold', 700],
	['ExtraBold', 800],
	['Black', 900],
];

if (typeof document !== 'undefined') {
	const handle = delayRender('Loading Inter');
	Promise.all(
		WEIGHTS.map(([name, weight]) => {
			const face = new FontFace('Inter', `url(${staticFile(`fonts/Inter-${name}.otf`)}) format('opentype')`, {weight: String(weight)});
			return face.load().then((f) => document.fonts.add(f));
		}),
	)
		.then(() => continueRender(handle))
		.catch((err) => {
			console.error('Inter failed to load, falling back to system fonts', err);
			continueRender(handle);
		});
}
