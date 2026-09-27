// Building blocks shared by the episode scenes: shader backdrops, staging, the character's arrival and death.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame} from 'remotion';
import {Character, CharacterProps} from '../Character';
import {FONT} from '../fx';
import {Shader} from '../Shader';
import {LANDSCAPE, SPACE, UNDERWATER} from '../shaders';
import {FPS, LandUniforms, clamp} from './lib';

/** Shader resolution for backdrops: 2/3 of 1080p, upscaled by the browser. Keeps the long render tractable. */
export const BG_SCALE = 0.667;

export const Land: React.FC<{u: LandUniforms; style?: React.CSSProperties; time?: number}> = ({u, style, time}) => (
	<Shader frag={LANDSCAPE} scale={BG_SCALE} uniforms={u} style={style} time={time} />
);

type SpaceU = {zoom?: number; cx?: number; cy?: number; earth?: [number, number, number]; rock?: [number, number, number]; contact?: [number, number]; impact?: number; mode?: number; spin?: number; nebula?: number; freeze?: number};
export const Space: React.FC<SpaceU & {style?: React.CSSProperties}> = ({zoom = 1, cx = 0, cy = 0, earth = [0, 0, 0.36], rock = [0, 0, 0], contact = [0, 0], impact = -1, mode = 1, spin = 0, nebula = 1, freeze = 0, style}) => (
	<Shader
		frag={SPACE}
		scale={BG_SCALE}
		style={style}
		uniforms={{uCam: [zoom, cx, cy], uEarth: earth, uTheia: rock, uContact: contact, uImpact: impact, uMode: mode, uSpin: spin, uNebula: nebula, uFreeze: freeze}}
	/>
);

export const Sea: React.FC<{pan?: number; murk?: number; water?: [number, number, number]; deep?: [number, number, number]; sand?: [number, number, number]; floorY?: number}> = ({
	pan = 0,
	murk = 0.1,
	water = [0.1, 0.45, 0.5],
	deep = [0.01, 0.08, 0.14],
	sand = [0.55, 0.5, 0.38],
	floorY = -0.15,
}) => <Shader frag={UNDERWATER} scale={BG_SCALE} uniforms={{uWaterCol: water, uDeepCol: deep, uSandCol: sand, uFloorY: floorY, uPan: pan, uMurk: murk}} />;

/** Screen y (px) of the landscape horizon for a given uHorizon. */
export const horizonPx = (uHorizon: number) => 540 - uHorizon * 1080;
/** Perspective size factor for something standing on the ground at screen y (1 at y=940 with the default horizon). */
export const depthScale = (y: number, uHorizon = -0.08) => (y - horizonPx(uHorizon)) / (940 - horizonPx(-0.08));

/** Place children so that their bottom-centre sits at (x, y), scaled by s. */
export const At: React.FC<{x: number; y: number; s?: number; w: number; h: number; rot?: number; flip?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({
	x,
	y,
	s = 1,
	w,
	h,
	rot = 0,
	flip = false,
	style,
	children,
}) => (
	<div
		style={{
			position: 'absolute',
			left: x - w / 2,
			top: y - h,
			width: w,
			height: h,
			transform: `scale(${flip ? -s : s}, ${s}) rotate(${rot}deg)`,
			transformOrigin: 'bottom center',
			...style,
		}}
	>
		{children}
	</div>
);

export type ActorProps = CharacterProps & {
	x: number;
	y: number;
	s?: number;
	/** frame the character is beamed in (with a light column) */
	arrive?: number;
	/** frame the character starts collapsing */
	collapse?: number;
	/** 0..1 CSS tint for freezing etc. */
	frost?: number;
	sway?: number;
	flip?: boolean;
	shadow?: boolean;
};

/** The main character standing on the ground at (x, y), with arrival beam, idle bob and collapse. */
export const Actor: React.FC<ActorProps> = ({x, y, s = 1, arrive, collapse, frost = 0, sway = 0, flip, shadow = true, ...cp}) => {
	const frame = useCurrentFrame();
	if (arrive !== undefined && frame < arrive) return null;
	const appear = arrive === undefined ? 1 : spring({frame: frame - arrive, fps: FPS, config: {damping: 12, stiffness: 200}});
	const beam = arrive === undefined ? 0 : interpolate(frame - arrive, [0, 3, 16], [0, 1, 0], clamp);
	const fall = collapse === undefined ? 0 : interpolate(frame, [collapse, collapse + 16], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const bounce = collapse === undefined ? 0 : interpolate(frame, [collapse + 16, collapse + 20, collapse + 26], [0, 1, 0], clamp);
	const dead = cp.dead ?? (collapse !== undefined && frame >= collapse + 10);
	const rot = fall * 84 + sway;
	return (
		<>
			{beam > 0 && (
				<div style={{position: 'absolute', left: x - 60 * s, top: 0, width: 120 * s, height: y, background: 'linear-gradient(90deg, transparent, rgba(255,240,210,0.9), transparent)', opacity: beam, filter: 'blur(6px)'}} />
			)}
			{shadow && <div style={{position: 'absolute', left: x - (70 + fall * 110) * s, top: y - 12 * s, width: (140 + fall * 220) * s, height: 24 * s, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', filter: 'blur(6px)', opacity: appear}} />}
			<div
				style={{
					position: 'absolute',
					left: x - 120,
					top: y - 490 - bounce * 10 * s,
					width: 240,
					height: 495,
					transform: `scale(${(flip ? -1 : 1) * s * interpolate(appear, [0, 1], [0.4, 1])}, ${s * appear}) rotate(${rot}deg)`,
					transformOrigin: '50% 490px',
					filter: frost > 0 ? `grayscale(${frost * 0.65}) brightness(${1 + frost * 0.35}) contrast(${1 - frost * 0.2})` : undefined,
				}}
			>
				<Character {...cp} dead={dead} pain={dead ? 0 : cp.pain} />
			</div>
		</>
	);
};

/** Time in seconds for idle loops. */
export const useT = () => useCurrentFrame() / FPS;

/** Fade/blur-in used at the start of each section, and a dip to black at the end. */
export const SectionFrame: React.FC<{from: number; to: number; children: React.ReactNode; desat?: number}> = ({from, to, children, desat = 0}) => {
	const frame = useCurrentFrame();
	const inP = interpolate(frame, [from, from + 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const outP = interpolate(frame, [to - 10, to], [1, 0], clamp);
	return (
		<AbsoluteFill
			style={{
				overflow: 'hidden',
				background: 'black',
				opacity: outP,
				transform: `scale(${1.08 - 0.08 * inP})`,
				filter: `blur(${(1 - inP) * 14}px)${desat > 0 ? ` grayscale(${desat}) brightness(${1 - desat * 0.45})` : ''}`,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

/** Desaturation after a death: 0 before, ramps to 1 over ~20 frames. */
export const deathDesat = (frame: number, deadAt: number | undefined) => (deadAt === undefined ? 0 : interpolate(frame, [deadAt, deadAt + 24], [0, 0.85], clamp));

/** Simple label that pops in (for things like 'NEW RECORD'). */
export const Badge: React.FC<{at: number; text: string; color?: string; bg?: string; size?: number; rot?: number; until?: number}> = ({at, text, color = '#0b0b0b', bg = '#ffd79a', size = 44, rot = -4, until}) => {
	const frame = useCurrentFrame();
	if (frame < at || (until !== undefined && frame > until)) return null;
	const s = spring({frame: frame - at, fps: FPS, config: {damping: 9, stiffness: 260}});
	const out = until === undefined ? 1 : interpolate(frame, [until - 8, until], [1, 0], clamp);
	return (
		<div
			style={{
				fontFamily: FONT,
				fontWeight: 900,
				fontSize: size,
				letterSpacing: 4,
				color,
				background: bg,
				padding: `${size * 0.2}px ${size * 0.55}px`,
				borderRadius: size * 0.3,
				transform: `rotate(${rot}deg) scale(${interpolate(s, [0, 1], [2, 1])})`,
				opacity: Math.min(s, out),
				boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
				whiteSpace: 'nowrap',
			}}
		>
			{text}
		</div>
	);
};

/** Big centred text that fades in and out. */
export const Title: React.FC<{at: number; until: number; text: string; sub?: string; size?: number; color?: string; y?: number}> = ({at, until, text, sub, size = 110, color = 'white', y = 0}) => {
	const frame = useCurrentFrame();
	if (frame < at || frame > until) return null;
	const s = spring({frame: frame - at, fps: FPS, config: {damping: 14, stiffness: 180}});
	const out = interpolate(frame, [until - 10, until], [1, 0], clamp);
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', fontFamily: FONT, opacity: Math.min(s, out), transform: `translateY(${y}px)`}}>
			<div style={{fontSize: size, fontWeight: 900, color, letterSpacing: -2, textShadow: '0 8px 50px rgba(0,0,0,0.6)', transform: `scale(${0.85 + 0.15 * s})`, textAlign: 'center', lineHeight: 1.05}}>{text}</div>
			{sub && <div style={{fontSize: size * 0.3, fontWeight: 700, color: '#ffd79a', letterSpacing: 8, marginTop: 16, textShadow: '0 2px 20px rgba(0,0,0,0.8)'}}>{sub}</div>}
		</AbsoluteFill>
	);
};

/** Stacked composition bar for the air. */
export const AirBar: React.FC<{at: number; parts: {label: string; v: number; color: string}[]; o2: string; o2Color?: string; until?: number}> = ({at, parts, o2, o2Color = '#ff6a5d', until}) => {
	const frame = useCurrentFrame();
	if (frame < at || (until !== undefined && frame > until)) return null;
	const s = spring({frame: frame - at, fps: FPS, config: {damping: 16, stiffness: 160}});
	const out = until === undefined ? 1 : interpolate(frame, [until - 10, until], [1, 0], clamp);
	const grow = interpolate(frame, [at + 4, at + 26], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<div style={{fontFamily: FONT, width: 640, opacity: Math.min(s, out), transform: `translateY(${(1 - s) * 30}px)`, padding: '20px 26px 22px', borderRadius: 22, background: 'rgba(8,10,14,0.6)', border: '1.5px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', color: 'white', alignItems: 'baseline'}}>
				<span style={{fontSize: 22, fontWeight: 700, letterSpacing: 5, opacity: 0.8}}>THE AIR</span>
				<span style={{fontSize: 38, fontWeight: 800, color: o2Color}}>O₂ {o2}</span>
			</div>
			<div style={{display: 'flex', height: 34, borderRadius: 10, overflow: 'hidden', marginTop: 12, width: `${grow * 100}%`}}>
				{parts.map((p) => (
					<div key={p.label} style={{flex: p.v, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'rgba(0,0,0,0.75)', letterSpacing: 1, whiteSpace: 'nowrap', overflow: 'hidden'}}>
						{p.label}
					</div>
				))}
			</div>
		</div>
	);
};

/** Wobbly heat shimmer / dizziness overlay: a few drifting translucent bands. */
export const Particles: React.FC<{n: number; seed: string; color: string; size?: number; speed?: number; dir?: 1 | -1; area?: [number, number, number, number]; blur?: number; opacity?: number}> = ({
	n,
	seed,
	color,
	size = 6,
	speed = 60,
	dir = -1,
	area = [0, 0, 1920, 1080],
	blur = 0,
	opacity = 1,
}) => {
	const frame = useCurrentFrame();
	const [x0, y0, w, h] = area;
	return (
		<>
			{new Array(n).fill(0).map((_, i) => {
				const r = (k: string) => random(`${seed}${k}${i}`);
				const sp = speed * (0.5 + r('s'));
				const y = y0 + ((((r('y') * h + dir * (frame / FPS) * sp) % h) + h) % h);
				const x = x0 + r('x') * w + Math.sin(frame / 20 + i) * 12;
				const sz = size * (0.5 + r('z'));
				return <div key={i} style={{position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%', background: color, filter: blur ? `blur(${blur}px)` : undefined, opacity: opacity * (0.4 + 0.6 * r('o'))}} />;
			})}
		</>
	);
};

/** Measuring bar with end ticks and a label (e.g. wingspan). */
export const Measure: React.FC<{x: number; y: number; w: number; label: string; at: number; color?: string}> = ({x, y, w, label, at, color = '#ffd79a'}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	const p = interpolate(frame, [at, at + 14], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: FONT}}>
			<svg width={w} height="30" style={{overflow: 'visible', display: 'block'}}>
				<line x1={w / 2 - (w / 2) * p} x2={w / 2 + (w / 2) * p} y1="15" y2="15" stroke={color} strokeWidth="3" />
				<line x1={w / 2 - (w / 2) * p} x2={w / 2 - (w / 2) * p} y1="3" y2="27" stroke={color} strokeWidth="3" />
				<line x1={w / 2 + (w / 2) * p} x2={w / 2 + (w / 2) * p} y1="3" y2="27" stroke={color} strokeWidth="3" />
			</svg>
			<div style={{textAlign: 'center', color, fontSize: 38, fontWeight: 800, letterSpacing: 2, opacity: p, textShadow: '0 2px 14px rgba(0,0,0,0.8)'}}>{label}</div>
		</div>
	);
};

/** A dot grid where a share of the dots dies (extinction share). */
export const SpeciesGrid: React.FC<{at: number; share: number; label: string; cols?: number; rows?: number}> = ({at, share, label, cols = 20, rows = 10}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	const appear = spring({frame: frame - at, fps: FPS, config: {damping: 16}});
	const n = cols * rows;
	const kill = interpolate(frame, [at + 20, at + 80], [0, share], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const order = new Array(n).fill(0).map((_, i) => i).sort((a, b) => random(`sg${a}`) - random(`sg${b}`));
	const rank = new Array(n);
	order.forEach((v, k) => (rank[v] = k));
	return (
		<div style={{fontFamily: FONT, opacity: appear, padding: 28, borderRadius: 24, background: 'rgba(8,8,10,0.62)', backdropFilter: 'blur(10px)', border: '1.5px solid rgba(255,255,255,0.15)'}}>
			<div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 26px)`, gap: 8}}>
				{new Array(n).fill(0).map((_, i) => {
					const dead = rank[i] < kill * n;
					return <div key={i} style={{width: 26, height: 26, borderRadius: 13, background: dead ? 'rgba(255,90,77,0.25)' : '#8dffb0', border: dead ? '2px solid rgba(255,90,77,0.6)' : 'none', transform: `scale(${dead ? 0.7 : 1})`}} />;
				})}
			</div>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 20, color: 'white'}}>
				<span style={{fontSize: 26, fontWeight: 700, letterSpacing: 3}}>{label}</span>
				<span style={{fontSize: 64, fontWeight: 900, color: '#ff6a5d'}}>{Math.round(kill * 100)}%</span>
			</div>
		</div>
	);
};

/** Oxygen tank prop. */
export const Tank: React.FC<{w?: number}> = ({w = 70}) => (
	<svg width={w} height={w * 2.6} viewBox="0 0 70 182" style={{overflow: 'visible', display: 'block'}}>
		<defs>
			<linearGradient id="tank" x1="0" x2="1">
				<stop offset="0" stopColor="#1f7a4a" />
				<stop offset="0.4" stopColor="#4fd08a" />
				<stop offset="1" stopColor="#135a34" />
			</linearGradient>
		</defs>
		<rect x="27" y="0" width="16" height="20" rx="3" fill="#aaa" />
		<rect x="5" y="16" width="60" height="166" rx="28" fill="url(#tank)" />
		<text x="35" y="110" fill="white" fontSize="22" fontWeight="900" textAnchor="middle" fontFamily="Inter">O₂</text>
	</svg>
);
