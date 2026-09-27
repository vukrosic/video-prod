import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from './timeline.json';

export const FONT = 'Inter, "Helvetica Neue", Arial, sans-serif';
export const BEAT = timeline.beatFrames;
export const L = Object.fromEntries(timeline.lines.map((l) => [l.id, l])) as Record<
	string,
	(typeof timeline.lines)[number]
>;
export const E = timeline.events;
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** 1 on a beat, decaying to 0 before the next one. */
export const beatPulse = (frame: number, decay = 6) => Math.exp(-((frame % BEAT) / BEAT) * decay);

/** Camera shake that starts at `start` and decays. Returns a CSS translate. */
export const shake = (frame: number, start: number, amp: number, decayFrames = 20) => {
	if (frame < start) return 'translate(0px, 0px)';
	const k = Math.exp(-(frame - start) / decayFrames) * amp;
	const x = (random(`sx${frame}`) - 0.5) * 2 * k;
	const y = (random(`sy${frame}`) - 0.5) * 2 * k;
	return `translate(${x}px, ${y}px) rotate(${(random(`sr${frame}`) - 0.5) * k * 0.04}deg)`;
};

export const Vignette: React.FC<{strength?: number; color?: string}> = ({strength = 0.75, color = '0,0,0'}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at center, rgba(${color},0) 50%, rgba(${color},${strength}) 100%)`,
			pointerEvents: 'none',
		}}
	/>
);

export const Flash: React.FC<{at: number; color?: string; len?: number; peak?: number}> = ({at, color = 'white', len = 12, peak = 1}) => {
	const frame = useCurrentFrame();
	const o = interpolate(frame, [at, at + 1, at + len], [0, peak, 0], clamp);
	return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none', mixBlendMode: 'screen'}} />;
};

/** Documentary-style subtitles: the line builds word by word, the newest word is warm white. */
export const Captions: React.FC<{ids: string[]; bottom?: number}> = ({ids, bottom = 96}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const line = ids.map((id) => L[id]).find((l) => frame >= l.from && frame < l.to + 14);
	if (!line) return null;
	const out = interpolate(frame, [line.to + 6, line.to + 14], [1, 0], clamp);
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: bottom, opacity: out}}>
			<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1400, gap: '0 16px'}}>
				{line.words.map((w, i) => {
					const s = spring({frame: frame - w.f, fps, config: {damping: 18, stiffness: 220}});
					const next = line.words[i + 1]?.f ?? line.to;
					const active = frame >= w.f && frame < next + 2;
					return (
						<span
							key={i}
							style={{
								fontFamily: FONT,
								fontWeight: 700,
								fontSize: 54,
								color: active ? '#ffd79a' : 'white',
								textShadow: '0 2px 18px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)',
								opacity: frame >= w.f ? 0.35 + 0.65 * s : 0,
								transform: `translateY(${(1 - s) * 14}px)`,
								display: 'inline-block',
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

export {Character} from './Character';

/** Survival timer HUD. */
export const Timer: React.FC<{seconds: number; dead: boolean}> = ({seconds, dead}) => {
	const s = Math.max(0, seconds);
	const mm = String(Math.floor(s / 60)).padStart(2, '0');
	const ss = (s % 60).toFixed(2).padStart(5, '0');
	const accent = dead ? '#ff5a4d' : '#ffd79a';
	return (
		<div
			style={{
				fontFamily: FONT,
				background: dead ? 'linear-gradient(180deg, rgba(120,10,10,0.85), rgba(60,0,0,0.85))' : 'rgba(12,8,10,0.45)',
				border: `1.5px solid ${dead ? 'rgba(255,110,100,0.8)' : 'rgba(255,255,255,0.18)'}`,
				borderRadius: 20,
				padding: '16px 30px 14px',
				color: 'white',
				textAlign: 'center',
				backdropFilter: 'blur(14px)',
				boxShadow: dead ? '0 0 80px rgba(255,40,40,0.55)' : '0 10px 40px rgba(0,0,0,0.35)',
			}}
		>
			<div style={{fontSize: 17, fontWeight: 700, letterSpacing: 5, color: accent, opacity: 0.95}}>{dead ? 'SURVIVED' : 'SURVIVAL TIME'}</div>
			<div style={{fontSize: 70, fontWeight: 800, fontVariantNumeric: 'tabular-nums', lineHeight: 1.05, letterSpacing: -1}}>
				{mm}:{ss}
			</div>
		</div>
	);
};

/** Bottom deep-time bar: where in Earth's history we are. */
export const DeepTimeBar: React.FC<{progress: number; label: string; opacity?: number}> = ({progress, label, opacity = 1}) => (
	<div style={{position: 'absolute', left: 160, right: 160, top: 64, opacity, fontFamily: FONT}}>
		<div style={{display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: 700, letterSpacing: 4}}>
			<span>EARTH FORMS</span>
			<span>TODAY</span>
		</div>
		<div style={{height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2, marginTop: 10, position: 'relative'}}>
			<div style={{position: 'absolute', left: `${progress * 100}%`, top: -6, width: 15, height: 15, marginLeft: -7.5, borderRadius: 8, background: '#ffd79a', boxShadow: '0 0 18px #ffb04a'}} />
			<div style={{position: 'absolute', left: `${progress * 100}%`, top: 18, color: '#ffd79a', fontSize: 17, fontWeight: 800, letterSpacing: 3, whiteSpace: 'nowrap'}}>{label}</div>
		</div>
	</div>
);

/** A thin HUD label with a leader line to a point. */
export const Callout: React.FC<{at: number; x: number; y: number; dx: number; dy: number; title: string; sub?: string; color?: string; until?: number}> = ({
	at,
	until,
	x,
	y,
	dx,
	dy,
	title,
	sub,
	color = '#ffd79a',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const end = until ?? at + 150;
	if (frame < at || frame > end) return null;
	const s = spring({frame: frame - at, fps, config: {damping: 16, stiffness: 160}}) * interpolate(frame, [end - 10, end], [1, 0], clamp);
	const lineP = interpolate(frame - at, [0, 9], [0, 1], {extrapolateRight: 'clamp', easing: (t) => 1 - (1 - t) ** 3});
	const typed = Math.floor(interpolate(frame - at, [5, 16], [0, title.length], clamp));
	const ex = x + dx * lineP;
	const ey = y + dy * lineP;
	const tail = dx >= 0 ? 150 : -150;
	return (
		<>
			<svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width="1" height="1">
				<circle cx={x} cy={y} r={14 * s} fill="none" stroke={color} strokeWidth="2" opacity={0.8} />
				<circle cx={x} cy={y} r={4.5} fill={color} opacity={s} />
				<polyline points={`${x},${y} ${ex},${ey} ${ex + tail * interpolate(frame - at, [8, 16], [0, 1], clamp)},${ey}`} stroke={color} strokeWidth="2" fill="none" />
			</svg>
			<div
				style={{
					position: 'absolute',
					left: x + dx + (dx >= 0 ? 6 : -6),
					top: y + dy - 50,
					transform: dx >= 0 ? undefined : 'translateX(-100%)',
					fontFamily: FONT,
					color: 'white',
					opacity: s,
					textAlign: dx >= 0 ? 'left' : 'right',
					textShadow: '0 2px 14px rgba(0,0,0,0.8)',
				}}
			>
				<div style={{fontSize: 34, fontWeight: 800, color, letterSpacing: 2, whiteSpace: 'nowrap'}}>{title.slice(0, typed)}</div>
			</div>
			{sub && (
				<div
					style={{
						position: 'absolute',
						left: x + dx + (dx >= 0 ? 6 : -6),
						top: y + dy + 8,
						transform: dx >= 0 ? undefined : 'translateX(-100%)',
						fontFamily: FONT,
						fontSize: 20,
						fontWeight: 600,
						color: 'rgba(255,255,255,0.8)',
						whiteSpace: 'nowrap',
						opacity: interpolate(frame - at, [12, 20], [0, 1], clamp),
						textShadow: '0 2px 10px rgba(0,0,0,0.8)',
					}}
				>
					{sub}
				</div>
			)}
		</>
	);
};
