import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {FONT} from '../fx';
import {ALL_LINES, FPS, LN, SEC, clamp, ramp} from './lib';

/* ------------------------------------------------------------------ per-era facts */
export type TimerKey = [string, number, number?]; // [line id | section id, seconds of survival, frame offset]
export type Era = {
	ago: number; // years ago
	when: string;
	name: string;
	stop?: number;
	timer?: {keys: TimerKey[]; dead: boolean; hideAfter?: string};
};
const M = 60;
const H = 3600;
const D = 86400;
const Y = 365 * D;
export const ERA: Record<string, Era> = {
	rules: {ago: 4.54e9, when: '', name: ''},
	hadean: {ago: 4.0e9, when: '4 BILLION YEARS AGO', name: 'THE HADEAN', stop: 1, timer: {keys: [['h1', 0], ['h6', 55], ['h8', 120, -8]], dead: true}},
	archean: {ago: 3.5e9, when: '3.5 BILLION YEARS AGO', name: 'THE ARCHEAN', stop: 2, timer: {keys: [['a1', 0], ['a6', 118, -8]], dead: true}},
	oxidation: {ago: 2.4e9, when: '2.4 BILLION YEARS AGO', name: 'THE GREAT OXIDATION', stop: 3, timer: {keys: [['o5', 0], ['o8', 150, -8]], dead: true}},
	boring: {ago: 1.8e9, when: '1.8 BILLION YEARS AGO', name: 'THE BORING BILLION', stop: 4},
	snowball: {ago: 6.5e8, when: '650 MILLION YEARS AGO', name: 'SNOWBALL EARTH', stop: 5, timer: {keys: [['s3', 0], ['s4', 180, -8]], dead: true}},
	cambrian: {
		ago: 5.2e8, when: '520 MILLION YEARS AGO', name: 'THE CAMBRIAN', stop: 6,
		timer: {keys: [['c1', 0], ['c2', 3 * M], ['c3', 4 * M], ['c4', 5 * M], ['c5', 6 * M], ['c9', 20 * M], ['c13', 5 * D], ['c14', 21 * D, 90]], dead: false},
	},
	carboniferous: {ago: 3.0e8, when: '300 MILLION YEARS AGO', name: 'THE CARBONIFEROUS', stop: 7, timer: {keys: [['k1', 0], ['k6', 40 * D], ['k10', 4 * Y, 60]], dead: false}},
	dying: {ago: 2.52e8, when: '252 MILLION YEARS AGO', name: 'THE GREAT DYING', stop: 8, timer: {keys: [['d4', 0], ['d7', 5 * H + 12 * M, -8]], dead: true}},
	cretaceous: {ago: 6.6e7, when: '66 MILLION YEARS AGO', name: 'THE LATE CRETACEOUS', stop: 9, timer: {keys: [['t2', 0], ['t4', Y + 2 * D, 20], ['t5', Y + 9 * D], ['t11', Y + 26 * D, -8]], dead: true}},
	iceage: {ago: 2.0e4, when: '20,000 YEARS AGO', name: 'THE LAST ICE AGE', stop: 10, timer: {keys: [['i3', 0], ['i6', 2 * Y], ['i8', 41 * Y, 50]], dead: false}},
	today: {ago: 0, when: 'TODAY', name: 'THE PRESENT', stop: 11, timer: {keys: [['today', 0, 40], ['y1', 73 * Y, 50]], dead: false, hideAfter: 'y2'}},
};
export const ORDER = Object.keys(ERA);

/* ------------------------------------------------------------------ timer */
export const keyFrame = (k: TimerKey) => (SEC[k[0]] ? SEC[k[0]].from : LN[k[0]].from) + (k[2] ?? 0);

/** Survival seconds at a frame, interpolated between keys (log-scale for long spans). */
export const timerValue = (frame: number, keys: TimerKey[]) => {
	const fs = keys.map(keyFrame);
	if (frame <= fs[0]) return 0;
	for (let i = 0; i < keys.length - 1; i++) {
		if (frame < fs[i + 1]) {
			const p = (frame - fs[i]) / (fs[i + 1] - fs[i]);
			const a = keys[i][1];
			const b = keys[i + 1][1];
			if (b > 3600 && b / Math.max(a, 1) > 20) return Math.exp(Math.log(Math.max(a, 1)) + (Math.log(b) - Math.log(Math.max(a, 1))) * p * p);
			return a + (b - a) * p;
		}
	}
	return keys[keys.length - 1][1];
};

export const formatSurvival = (s: number): {big: string; small?: string} => {
	const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
	if (s < H) return {big: `${pad(s / 60)}:${pad(s % 60)}`};
	if (s < D) return {big: `${pad(s / H)}:${pad((s % H) / 60)}:${pad(s % 60)}`};
	if (s < Y) {
		const d = Math.floor(s / D);
		return {big: `${d} DAY${d === 1 ? '' : 'S'}`, small: `${pad((s % D) / H)}:${pad((s % H) / 60)}:${pad(s % 60)}`};
	}
	const y = Math.floor(s / Y);
	const d = Math.floor((s % Y) / D);
	return {big: `${y} YEAR${y === 1 ? '' : 'S'}`, small: `${d} DAY${d === 1 ? '' : 'S'}`};
};

export const TimerCard: React.FC<{seconds: number; state: 'live' | 'dead' | 'alive'; scale?: number}> = ({seconds, state, scale = 1}) => {
	const f = formatSurvival(seconds);
	const dead = state === 'dead';
	const good = state === 'alive';
	const accent = dead ? '#ff6a5d' : good ? '#8dffb0' : '#ffd79a';
	return (
		<div
			style={{
				fontFamily: FONT,
				background: dead ? 'linear-gradient(180deg, rgba(120,10,10,0.85), rgba(60,0,0,0.85))' : good ? 'rgba(10,50,30,0.6)' : 'rgba(12,8,10,0.5)',
				border: `1.5px solid ${dead ? 'rgba(255,110,100,0.8)' : good ? 'rgba(140,255,170,0.6)' : 'rgba(255,255,255,0.18)'}`,
				borderRadius: 20,
				padding: '14px 28px 12px',
				color: 'white',
				textAlign: 'center',
				backdropFilter: 'blur(14px)',
				boxShadow: dead ? '0 0 70px rgba(255,40,40,0.5)' : good ? '0 0 50px rgba(80,255,140,0.3)' : '0 10px 40px rgba(0,0,0,0.35)',
				transform: `scale(${scale})`,
				transformOrigin: 'top right',
				minWidth: 230,
			}}
		>
			<div style={{fontSize: 16, fontWeight: 700, letterSpacing: 5, color: accent}}>{dead ? 'SURVIVED' : good ? 'STILL ALIVE' : 'SURVIVAL TIME'}</div>
			<div style={{fontSize: 60, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1.08, letterSpacing: -1, whiteSpace: 'nowrap'}}>{f.big}</div>
			{f.small && <div style={{fontSize: 20, fontWeight: 700, opacity: 0.75, fontVariantNumeric: 'tabular-nums', letterSpacing: 2}}>{f.small}</div>}
		</div>
	);
};

/* ------------------------------------------------------------------ deaths */
// frames at which the death tally goes up (the cold open death is counted from the start)
const BORING_DEATHS = 6;
export const deathFrames = (): number[] => {
	const out: number[] = [];
	for (const id of ORDER) {
		const t = ERA[id].timer;
		if (t?.dead) out.push(keyFrame(t.keys[t.keys.length - 1]));
	}
	const b2 = LN.b2.from;
	for (let i = 0; i < BORING_DEATHS; i++) out.push(b2 - 45 + i * 27);
	return out.sort((a, b) => a - b);
};
const DEATHS = deathFrames();

export const DeathTally: React.FC = () => {
	const frame = useCurrentFrame();
	const n = 1 + DEATHS.filter((f) => frame >= f).length;
	const last = DEATHS.filter((f) => frame >= f).pop() ?? -100;
	const pop = spring({frame: frame - last, fps: FPS, config: {damping: 9, stiffness: 300}});
	return (
		<div style={{position: 'absolute', left: 60, top: 54, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 12, transform: `scale(${1 + (1 - pop) * 0.4})`, transformOrigin: 'left center'}}>
			<svg width="34" height="34" viewBox="0 0 24 24">
				<path d="M12 2C7 2 3.5 5.6 3.5 10.2c0 2.7 1.3 4.6 3 5.8V19a1 1 0 0 0 1 1h1.5v-2h1.5v2h3v-2h1.5v2H16.5a1 1 0 0 0 1-1v-3c1.7-1.2 3-3.1 3-5.8C20.5 5.6 17 2 12 2z" fill="rgba(255,255,255,0.92)" />
				<circle cx="8.8" cy="11" r="2.1" fill="#1a0a0a" />
				<circle cx="15.2" cy="11" r="2.1" fill="#1a0a0a" />
			</svg>
			<span style={{fontSize: 34, fontWeight: 800, color: frame - last < 20 ? '#ff6a5d' : 'white', textShadow: '0 2px 12px rgba(0,0,0,0.6)', fontVariantNumeric: 'tabular-nums'}}>× {n}</span>
		</div>
	);
};

/* ------------------------------------------------------------------ deep-time bar */
export const agoToP = (ago: number) => 1 - ago / 4.54e9;
export const formatAgo = (ago: number) => {
	if (ago <= 0) return 'TODAY';
	if (ago >= 1e9) return `${(ago / 1e9).toFixed(ago % 1e9 === 0 ? 0 : 1)} BILLION YEARS AGO`;
	if (ago >= 1e6) return `${Math.round(ago / 1e6)} MILLION YEARS AGO`;
	return `${Math.round(ago).toLocaleString('en-US')} YEARS AGO`;
};

export const DeepBar: React.FC<{ago: number; red?: number; width?: number; big?: boolean; label?: string; fill?: string}> = ({ago, red = 0, width = 820, big = false, label, fill = 'linear-gradient(90deg, #ff3b2f, #ff6a3d)'}) => {
	const p = agoToP(ago);
	const h = big ? 26 : 4;
	return (
		<div style={{width, fontFamily: FONT, position: 'relative'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: big ? 24 : 14, fontWeight: 700, letterSpacing: 4, marginBottom: big ? 14 : 8}}>
				<span>EARTH FORMS</span>
				<span>TODAY</span>
			</div>
			<div style={{height: h, background: 'rgba(255,255,255,0.18)', borderRadius: h / 2, position: 'relative', overflow: 'visible'}}>
				{red > 0 && <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${red * 100}%`, background: fill, borderRadius: h / 2, boxShadow: '0 0 30px rgba(255,60,40,0.6)'}} />}
				<div style={{position: 'absolute', left: `${p * 100}%`, top: h / 2 - (big ? 16 : 7), width: big ? 32 : 14, height: big ? 32 : 14, marginLeft: big ? -16 : -7, borderRadius: 20, background: '#ffd79a', boxShadow: '0 0 18px #ffb04a'}} />
				{label !== '' && (
					<div
						style={{
							position: 'absolute',
							left: `${Math.min(Math.max(p, 0.08), 0.92) * 100}%`,
							transform: 'translateX(-50%)',
							top: h + (big ? 22 : 10),
							color: '#ffd79a',
							fontSize: big ? 26 : 15,
							fontWeight: 800,
							letterSpacing: 3,
							whiteSpace: 'nowrap',
						}}
					>
						{label ?? formatAgo(ago)}
					</div>
				)}
			</div>
		</div>
	);
};

/* ------------------------------------------------------------------ era title card */
export const EraCard: React.FC<{id: string}> = ({id}) => {
	const frame = useCurrentFrame();
	const sec = SEC[id];
	const era = ERA[id];
	const prev = ERA[ORDER[ORDER.indexOf(id) - 1]];
	const t = frame - sec.from;
	const firstLine = sec.lines[0].from;
	const len = firstLine - sec.from;
	if (t < 0 || frame > firstLine + 6) return null;
	const inP = spring({frame: t - 4, fps: FPS, config: {damping: 16, stiffness: 160}});
	const out = interpolate(frame, [firstLine - 10, firstLine + 4], [1, 0], clamp);
	const roll = ramp(frame, sec.from + 2, sec.from + Math.min(40, len * 0.5), Easing.out(Easing.cubic));
	const ago = prev.ago + (era.ago - prev.ago) * roll;
	const nameIn = ramp(frame, sec.from + 16, sec.from + 34);
	return (
		<AbsoluteFill style={{opacity: out, pointerEvents: 'none'}}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)'}} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', fontFamily: FONT, transform: `scale(${0.9 + 0.1 * inP})`}}>
				{era.stop && (
					<div style={{fontSize: 22, fontWeight: 700, letterSpacing: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 14, opacity: inP}}>
						STOP {era.stop}
					</div>
				)}
				<div
					style={{
						fontSize: 104,
						fontWeight: 800,
						letterSpacing: -2,
						color: 'white',
						fontVariantNumeric: 'tabular-nums',
						textShadow: '0 6px 50px rgba(0,0,0,0.6)',
						opacity: inP,
						whiteSpace: 'nowrap',
					}}
				>
					{id === 'today' && roll > 0.98 ? 'TODAY' : formatAgo(ago)}
				</div>
				<div
					style={{
						fontSize: 40,
						fontWeight: 700,
						letterSpacing: 14 + (1 - nameIn) * 20,
						color: '#ffd79a',
						marginTop: 10,
						opacity: nameIn,
					}}
				>
					{era.name}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ captions */
type Chunk = {words: {w: string; f: number}[]; from: number; to: number};
const chunkLine = (l: (typeof ALL_LINES)[number]): Chunk[] => {
	const chunks: Chunk[] = [];
	let cur: {w: string; f: number}[] = [];
	l.words.forEach((w, i) => {
		cur.push(w);
		const punct = /[.,:;!?]$/.test(w.w);
		const last = i === l.words.length - 1;
		if (last || cur.length >= 8 || (punct && cur.length >= 3 && l.words.length - i > 2)) {
			chunks.push({words: cur, from: cur[0].f, to: 0});
			cur = [];
		}
	});
	chunks.forEach((c, i) => (c.to = i < chunks.length - 1 ? chunks[i + 1].from : l.to + 10));
	return chunks;
};
const CHUNKS = ALL_LINES.flatMap(chunkLine);

export const EpCaptions: React.FC = () => {
	const frame = useCurrentFrame();
	const c = CHUNKS.find((x) => frame >= x.from - 1 && frame < x.to);
	if (!c) return null;
	const inP = interpolate(frame, [c.from - 1, c.from + 4], [0, 1], clamp);
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 70, pointerEvents: 'none'}}>
			<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1300, gap: '0 14px', opacity: inP, transform: `translateY(${(1 - inP) * 10}px)`}}>
				{c.words.map((w, i) => {
					const next = c.words[i + 1]?.f ?? c.to;
					const active = frame >= w.f && frame < next;
					const said = frame >= w.f;
					return (
						<span
							key={i}
							style={{
								fontFamily: FONT,
								fontWeight: 700,
								fontSize: 50,
								color: active ? '#ffd79a' : 'white',
								opacity: said ? 1 : 0.55,
								textShadow: '0 2px 16px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)',
								letterSpacing: -0.5,
							}}
						>
							{w.w}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

/* ------------------------------------------------------------------ small widgets */
/** Horizontal gauge, e.g. oxygen %. */
export const Gauge: React.FC<{title: string; max: number; value: number; marks: {v: number; label: string; color?: string}[]; unit?: string; appear: number}> = ({title, max, value, marks, unit = '%', appear}) => (
	<div style={{fontFamily: FONT, width: 760, padding: '22px 30px 44px', borderRadius: 22, background: 'rgba(8,10,14,0.6)', border: '1.5px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', opacity: appear, transform: `translateY(${(1 - appear) * 30}px)`}}>
		<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', color: 'white'}}>
			<span style={{fontSize: 24, fontWeight: 700, letterSpacing: 5, opacity: 0.8}}>{title}</span>
			<span style={{fontSize: 52, fontWeight: 800, fontVariantNumeric: 'tabular-nums'}}>
				{value < 1 ? value.toFixed(1) : value.toFixed(0)}
				{unit}
			</span>
		</div>
		<div style={{position: 'relative', height: 16, background: 'rgba(255,255,255,0.12)', borderRadius: 8, marginTop: 14}}>
			<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(value / max) * 100}%`, borderRadius: 8, background: 'linear-gradient(90deg, #4fc3ff, #8dffb0)'}} />
			{marks.map((m) => (
				<div key={m.label} style={{position: 'absolute', left: `${(m.v / max) * 100}%`, top: -8, bottom: -8, width: 3, background: m.color ?? 'white', borderRadius: 2}}>
					<div style={{position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: m.color ?? 'white', fontSize: 18, fontWeight: 700, letterSpacing: 1}}>{m.label}</div>
				</div>
			))}
		</div>
	</div>
);

/** A row of icon rules/checks that pop in on given frames. */
export const Checklist: React.FC<{items: {label: string; ok: boolean; at: number}[]; columns?: number}> = ({items, columns = 4}) => {
	const frame = useCurrentFrame();
	return (
		<div style={{display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 18, fontFamily: FONT}}>
			{items.map((it) => {
				const s = spring({frame: frame - it.at, fps: FPS, config: {damping: 12, stiffness: 220}});
				return (
					<div
						key={it.label}
						style={{
							opacity: frame >= it.at ? s : 0,
							transform: `scale(${0.6 + 0.4 * s})`,
							background: 'rgba(8,10,14,0.62)',
							border: `1.5px solid ${it.ok ? 'rgba(140,255,170,0.5)' : 'rgba(255,110,100,0.5)'}`,
							borderRadius: 18,
							padding: '14px 22px',
							display: 'flex',
							alignItems: 'center',
							gap: 14,
							backdropFilter: 'blur(10px)',
						}}
					>
						<span style={{width: 34, height: 34, borderRadius: 17, background: it.ok ? '#3ddc84' : '#ff5a4d', color: '#0b0b0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900}}>
							{it.ok ? '✓' : '✕'}
						</span>
						<span style={{color: 'white', fontSize: 28, fontWeight: 700, whiteSpace: 'nowrap'}}>{it.label}</span>
					</div>
				);
			})}
		</div>
	);
};

/** Big stat that pops in: number + caption. */
export const Stat: React.FC<{at: number; value: string; label: string; color?: string; size?: number; until?: number}> = ({at, value, label, color = '#ffd79a', size = 120, until}) => {
	const frame = useCurrentFrame();
	const end = until ?? at + 180;
	const s = spring({frame: frame - at, fps: FPS, config: {damping: 13, stiffness: 200}}) * interpolate(frame, [end - 10, end], [1, 0], clamp);
	if (frame < at || frame > end) return null;
	return (
		<div style={{fontFamily: FONT, textAlign: 'center', opacity: s, transform: `scale(${0.7 + 0.3 * s})`}}>
			<div style={{fontSize: size, fontWeight: 800, color, letterSpacing: -2, lineHeight: 1, textShadow: '0 6px 40px rgba(0,0,0,0.6)'}}>{value}</div>
			<div style={{fontSize: size * 0.24, fontWeight: 700, color: 'white', letterSpacing: 4, marginTop: 12, textShadow: '0 2px 20px rgba(0,0,0,0.8)'}}>{label}</div>
		</div>
	);
};

/** Thermometer with a label. */
export const Thermo: React.FC<{temp: number; min?: number; max?: number; label: string; appear: number}> = ({temp, min = -60, max = 60, label, appear}) => {
	const p = (temp - min) / (max - min);
	const col = temp < 0 ? '#6fc8ff' : temp > 35 ? '#ff5a3d' : '#ffd24a';
	return (
		<div style={{fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 26, opacity: appear, transform: `translateX(${(1 - appear) * -40}px)`}}>
			<svg width="70" height="360" viewBox="0 0 70 360">
				<rect x="22" y="10" width="26" height="290" rx="13" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
				<circle cx="35" cy="315" r="32" fill={col} />
				<rect x="28" y={290 - p * 270} width="14" height={p * 270 + 20} rx="7" fill={col} />
				{[0, 0.25, 0.5, 0.75, 1].map((k) => (
					<line key={k} x1="48" x2="58" y1={290 - k * 270} y2={290 - k * 270} stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
				))}
			</svg>
			<div>
				<div style={{fontSize: 96, fontWeight: 800, color: col, lineHeight: 1, textShadow: '0 4px 30px rgba(0,0,0,0.5)'}}>
					{temp > 0 ? '+' : ''}
					{Math.round(temp)}°C
				</div>
				<div style={{fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: 3, marginTop: 8, textShadow: '0 2px 16px rgba(0,0,0,0.8)'}}>{label}</div>
			</div>
		</div>
	);
};

/** Frame at which the character dies in each era (undefined if they survive). */
export const DEAD_AT: Record<string, number | undefined> = Object.fromEntries(
	ORDER.map((id) => {
		const t = ERA[id].timer;
		return [id, t?.dead ? keyFrame(t.keys[t.keys.length - 1]) : undefined];
	}),
);
