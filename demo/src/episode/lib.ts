import {Easing, interpolate} from 'remotion';
import ep from '../episode.json';

export type Word = {w: string; f: number};
export type Line = {id: string; text: string; from: number; to: number; words: Word[]};
export type Section = {id: string; from: number; to: number; lines: Line[]};

export const EP = ep as {fps: number; durationFrames: number; sections: Section[]};
export const FPS = EP.fps;
export const SEC = Object.fromEntries(EP.sections.map((s) => [s.id, s])) as Record<string, Section>;
export const LN = Object.fromEntries(EP.sections.flatMap((s) => s.lines.map((l) => [l.id, l]))) as Record<string, Line>;
export const ALL_LINES = EP.sections.flatMap((s) => s.lines);

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
/** 0 → 1 over [a, b] frames with an ease. */
export const ramp = (frame: number, a: number, b: number, ease: (t: number) => number = Easing.inOut(Easing.cubic)) =>
	interpolate(frame, [a, b], [0, 1], {...clamp, easing: ease});
/** Frame of the n-th word of a line. */
export const wordF = (id: string, n: number) => LN[id].words[Math.min(n, LN[id].words.length - 1)].f;
/** Frame of the first word matching `w` (case-insensitive prefix) in a line. */
export const wordAt = (id: string, w: string, last = false) => {
	const hits = LN[id].words.filter((x) => x.w.toLowerCase().startsWith(w.toLowerCase()));
	return (last ? hits[hits.length - 1] : hits[0] ?? LN[id].words[0]).f;
};

type Vec3 = [number, number, number];
export type LandUniforms = {
	uHorizon: number; uCamH: number; uPan: number; uFogDist: number; uCoast: number; uLandType: number; uClouds: number;
	uStars: number; uWave: number; uLava: number; uSnow: number; uMtn: number; uHaze: number; uMoonSize: number;
	uSunSize: number; uDark: number; uSkyTop: Vec3; uSkyHor: Vec3; uFog: Vec3; uSunCol: Vec3; uWater: Vec3; uLand: Vec3;
	uLand2: Vec3; uCloudCol: Vec3; uMtnCol: Vec3; uLavaCol: Vec3; uSunPos: [number, number]; uMoonPos: [number, number];
};

const BASE: LandUniforms = {
	uHorizon: -0.08, uCamH: 1.0, uPan: 0, uFogDist: 40, uCoast: 4, uLandType: 0, uClouds: 0.4, uStars: 0, uWave: 0.3,
	uLava: 0, uSnow: 0, uMtn: 0, uHaze: 0, uMoonSize: 0, uSunSize: 0.035, uDark: 0,
	uSkyTop: [0.1, 0.25, 0.55], uSkyHor: [0.55, 0.7, 0.85], uFog: [0.55, 0.68, 0.8], uSunCol: [1.0, 0.9, 0.7],
	uWater: [0.03, 0.12, 0.2], uLand: [0.12, 0.1, 0.09], uLand2: [0.25, 0.2, 0.17], uCloudCol: [0.95, 0.95, 0.97],
	uMtnCol: [0.2, 0.22, 0.26], uLavaCol: [1.0, 0.35, 0.05], uSunPos: [0.5, 0.3], uMoonPos: [-0.4, 0.3],
};

/** Per-era looks for the landscape shader. */
export const LAND: Record<string, LandUniforms> = {
	hadean: {
		...BASE, uSkyTop: [0.03, 0.05, 0.06], uSkyHor: [0.22, 0.24, 0.2], uFog: [0.2, 0.22, 0.19], uWater: [0.02, 0.08, 0.07],
		uLand: [0.05, 0.045, 0.045], uLand2: [0.12, 0.1, 0.09], uCloudCol: [0.3, 0.3, 0.28], uClouds: 0.55, uCoast: 9,
		uSunSize: 0.0, uMoonSize: 0.3, uMoonPos: [0.35, 0.3], uSunPos: [1.2, 0.2], uWave: 0.5, uStars: 0.3, uMtn: 0.8, uMtnCol: [0.04, 0.04, 0.045], uFogDist: 30,
		uLava: 0.25, uLavaCol: [1.0, 0.3, 0.05],
	},
	archean: {
		...BASE, uSkyTop: [0.18, 0.25, 0.35], uSkyHor: [0.55, 0.55, 0.5], uFog: [0.5, 0.5, 0.45], uWater: [0.04, 0.12, 0.14],
		uLand: [0.18, 0.15, 0.12], uLand2: [0.35, 0.3, 0.24], uCoast: 8.5, uSunSize: 0.026, uSunPos: [-0.45, 0.22], uSunCol: [1.0, 0.85, 0.65],
		uClouds: 0.3, uCloudCol: [0.85, 0.8, 0.72], uWave: 0.15, uMtn: 0.4, uMtnCol: [0.3, 0.28, 0.27],
	},
	archeanHaze: {
		...BASE, uSkyTop: [0.35, 0.18, 0.08], uSkyHor: [0.85, 0.5, 0.2], uFog: [0.75, 0.45, 0.2], uWater: [0.08, 0.1, 0.08],
		uLand: [0.2, 0.14, 0.1], uLand2: [0.38, 0.27, 0.18], uCoast: 8.5, uSunSize: 0.026, uSunPos: [-0.45, 0.22], uSunCol: [1.0, 0.7, 0.35],
		uClouds: 0.3, uCloudCol: [0.9, 0.6, 0.35], uWave: 0.15, uMtn: 0.4, uMtnCol: [0.35, 0.22, 0.14],
	},
	oxidation: {
		...BASE, uSkyTop: [0.15, 0.3, 0.5], uSkyHor: [0.6, 0.65, 0.7], uFog: [0.58, 0.62, 0.66], uWater: [0.03, 0.14, 0.16],
		uLand: [0.35, 0.14, 0.08], uLand2: [0.5, 0.25, 0.14], uCoast: 8.5, uSunPos: [0.55, 0.26], uClouds: 0.35, uMtn: 0.5, uMtnCol: [0.35, 0.18, 0.12],
	},
	snowball: {
		...BASE, uSkyTop: [0.35, 0.45, 0.6], uSkyHor: [0.82, 0.86, 0.9], uFog: [0.8, 0.84, 0.88], uLandType: 1, uCoast: 1000,
		uLand: [0.72, 0.8, 0.9], uLand2: [0.95, 0.97, 1.0], uSunSize: 0.022, uSunPos: [-0.3, 0.12], uSunCol: [1.0, 0.97, 0.9],
		uClouds: 0.5, uCloudCol: [0.85, 0.88, 0.92], uSnow: 0.7, uMtn: 0.5, uMtnCol: [0.6, 0.66, 0.75], uFogDist: 18, uHaze: 0.12,
	},
	cambrian: {
		...BASE, uSkyTop: [0.12, 0.32, 0.62], uSkyHor: [0.65, 0.78, 0.9], uFog: [0.65, 0.75, 0.85], uWater: [0.02, 0.15, 0.25],
		uLand: [0.28, 0.24, 0.2], uLand2: [0.5, 0.44, 0.38], uCoast: 8, uSunPos: [0.6, 0.35], uClouds: 0.35, uWave: 0.35, uMtn: 0.6, uMtnCol: [0.32, 0.3, 0.3],
	},
	carboniferous: {
		...BASE, uSkyTop: [0.3, 0.42, 0.35], uSkyHor: [0.62, 0.7, 0.55], uFog: [0.42, 0.52, 0.38], uWater: [0.05, 0.12, 0.08],
		uLand: [0.08, 0.14, 0.05], uLand2: [0.16, 0.26, 0.08], uLandType: 2, uCoast: 1000, uSunPos: [0.2, 0.4], uSunCol: [1.0, 0.95, 0.75],
		uClouds: 0.3, uCloudCol: [0.8, 0.85, 0.75], uFogDist: 9, uMtn: 0, uHaze: 0.1,
	},
	dying: {
		...BASE, uSkyTop: [0.25, 0.12, 0.06], uSkyHor: [0.75, 0.42, 0.18], uFog: [0.6, 0.35, 0.18], uLandType: 3, uCoast: 1000,
		uLand: [0.28, 0.17, 0.1], uLand2: [0.45, 0.3, 0.18], uSunPos: [0.1, 0.25], uSunSize: 0.03, uSunCol: [1.0, 0.6, 0.3],
		uClouds: 0.55, uCloudCol: [0.45, 0.28, 0.18], uLava: 0.9, uLavaCol: [1.0, 0.3, 0.04], uMtn: 0.5, uMtnCol: [0.2, 0.1, 0.06], uFogDist: 20, uHaze: 0.1,
	},
	cretaceous: {
		...BASE, uSkyTop: [0.1, 0.3, 0.6], uSkyHor: [0.62, 0.78, 0.88], uFog: [0.6, 0.72, 0.8], uWater: [0.05, 0.2, 0.22],
		uLand: [0.12, 0.28, 0.08], uLand2: [0.3, 0.42, 0.12], uLandType: 2, uCoast: 11, uSunPos: [0.55, 0.3], uClouds: 0.45, uMtn: 0.7, uMtnCol: [0.22, 0.32, 0.3], uFogDist: 25,
	},
	iceage: {
		...BASE, uSkyTop: [0.3, 0.42, 0.6], uSkyHor: [0.78, 0.8, 0.82], uFog: [0.72, 0.75, 0.78], uLandType: 2, uCoast: 1000,
		uLand: [0.45, 0.42, 0.3], uLand2: [0.65, 0.6, 0.45], uSunPos: [-0.55, 0.18], uSunSize: 0.025, uSunCol: [1.0, 0.88, 0.7],
		uClouds: 0.45, uCloudCol: [0.88, 0.88, 0.9], uMtn: 1.0, uMtnCol: [0.4, 0.45, 0.52], uFogDist: 22, uSnow: 0.12,
	},
	today: {
		...BASE, uSkyTop: [0.08, 0.1, 0.3], uSkyHor: [1.0, 0.55, 0.3], uFog: [0.8, 0.55, 0.45], uLand: [0.1, 0.22, 0.08], uLand2: [0.2, 0.35, 0.1],
		uLandType: 2, uCoast: 1000, uSunPos: [0.35, 0.02], uSunSize: 0.045, uSunCol: [1.0, 0.65, 0.3], uClouds: 0.35, uCloudCol: [1.0, 0.7, 0.55],
		uMtn: 0.6, uMtnCol: [0.25, 0.2, 0.3], uStars: 0.4,
	},
};

/** Blend two landscape presets (numbers and vectors) by t. */
export const mixLand = (a: LandUniforms, b: LandUniforms, t: number): LandUniforms => {
	const out = {...a} as Record<string, number | number[]>;
	for (const k of Object.keys(a) as (keyof LandUniforms)[]) {
		const va = a[k];
		const vb = b[k];
		out[k] = typeof va === 'number' ? va + ((vb as number) - va) * t : (va as number[]).map((x, i) => x + ((vb as number[])[i] - x) * t);
	}
	return out as unknown as LandUniforms;
};
