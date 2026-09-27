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

/** The recurring main character: a person in a t-shirt and jeans, rim-lit by whatever is glowing below.
 *  breath: 0..1 inhale (chest, eyes wide, mouth open); pain: 0..1 squint; look: pupil offset -1..1. */
export const Character: React.FC<{breath?: number; pain?: number; bob?: number; look?: number; rim?: string}> = ({
	breath = 0,
	pain = 0,
	bob = 0,
	look = 0,
	rim = '#ffb04a',
}) => {
	const eyeOpen = Math.max(0.12, 1 + breath * 0.35 - pain * 0.85);
	const chest = 1 + breath * 0.07;
	const brow = -breath * 5 + pain * 3;
	const body = (
		<g>
			{/* legs + shoes */}
			<path d="M52 196 L80 196 L79 318 L61 318 Z" fill="url(#jeans)" />
			<path d="M80 196 L108 196 L99 318 L81 318 Z" fill="url(#jeans2)" />
			<path d="M80 204 L80 300" stroke="#16243f" strokeWidth="2" />
			<rect x="54" y="312" width="30" height="15" rx="7.5" fill="#2a2320" />
			<rect x="78" y="312" width="30" height="15" rx="7.5" fill="#211b19" />
			<rect x="54" y="322" width="30" height="5" rx="2.5" fill="#e9e3da" />
			<rect x="78" y="322" width="30" height="5" rx="2.5" fill="#d8d2c9" />
			{/* arms */}
			<path d={`M40 ${146} Q${31 - breath * 3} 184 ${35 - breath * 4} 216`} stroke="url(#skin)" strokeWidth="14" strokeLinecap="round" fill="none" />
			<path d={`M120 ${146} Q${129 + breath * 3} 184 ${125 + breath * 4} 216`} stroke="url(#skin2)" strokeWidth="14" strokeLinecap="round" fill="none" />
			<circle cx={35 - breath * 4} cy="219" r="8.5" fill="#f0b690" />
			<circle cx={125 + breath * 4} cy="219" r="8.5" fill="#e3a47f" />
			{/* t-shirt, expands with the breath */}
			<g transform={`translate(80 150) scale(${chest} ${1 + breath * 0.025}) translate(-80 -150)`}>
				<path d="M46 110 Q80 100 114 110 L134 146 L117 156 L112 144 L112 200 Q80 207 48 200 L48 144 L43 156 L26 146 Z" fill="url(#shirt)" />
				<path d="M68 104 Q80 116 92 104" stroke="#16786e" strokeWidth="4" fill="none" strokeLinecap="round" />
				<path d="M112 146 L112 200" stroke="#157066" strokeWidth="2" opacity="0.5" />
			</g>
			{/* neck + head */}
			<rect x="72" y="88" width="16" height="20" rx="4" fill="#dc9e78" />
			<g transform={`rotate(${-breath * 6} 80 96)`}>
				<ellipse cx="46" cy="66" rx="6" ry="8" fill="#e3a47f" />
				<ellipse cx="114" cy="66" rx="6" ry="8" fill="#e3a47f" />
				<ellipse cx="80" cy="62" rx="34" ry="36" fill="url(#skin)" />
				{/* hair */}
				<path d="M45 58 Q42 24 76 22 Q112 20 116 52 Q108 40 96 38 Q98 46 90 44 Q72 38 58 44 Q50 48 45 58 Z" fill="#3a2419" />
				<path d="M58 30 Q74 18 96 26" stroke="#5a3a28" strokeWidth="3" fill="none" strokeLinecap="round" />
				{/* brows */}
				<path d={`M58 ${48 + brow} Q66 ${44 + brow - pain * 2} 73 ${48 + brow + pain * 2}`} stroke="#3a2419" strokeWidth="3.5" fill="none" strokeLinecap="round" />
				<path d={`M87 ${48 + brow + pain * 2} Q94 ${44 + brow - pain * 2} 102 ${48 + brow}`} stroke="#3a2419" strokeWidth="3.5" fill="none" strokeLinecap="round" />
				{/* eyes */}
				{[66, 94].map((x) => (
					<g key={x}>
						<ellipse cx={x} cy="62" rx="6.5" ry={7.5 * eyeOpen} fill="white" />
						<circle cx={x + look * 2} cy="62.5" r={3.6 * Math.min(1, eyeOpen)} fill="#241611" />
						<circle cx={x + 1.4 + look * 2} cy="60.8" r={1.1 * Math.min(1, eyeOpen)} fill="white" />
					</g>
				))}
				{/* cheeks + mouth */}
				<ellipse cx="58" cy="76" rx="6" ry="3.5" fill="#ff7a6b" opacity="0.35" />
				<ellipse cx="102" cy="76" rx="6" ry="3.5" fill="#ff7a6b" opacity="0.35" />
				{breath > 0.05 || pain > 0.05 ? (
					<ellipse cx="80" cy="84" rx={3.5 + breath * 3 + pain * 4} ry={2 + breath * 6 - pain * 1} fill="#5a1f1a" />
				) : (
					<path d="M73 83 Q80 87 87 83" stroke="#7a3328" strokeWidth="3" fill="none" strokeLinecap="round" />
				)}
			</g>
		</g>
	);
	return (
		<svg width="240" height="495" viewBox="0 0 160 330" style={{overflow: 'visible'}}>
			<defs>
				<linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#f3c09c" />
					<stop offset="1" stopColor="#e9a07a" />
				</linearGradient>
				<linearGradient id="skin2" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#e3a883" />
					<stop offset="1" stopColor="#d88e69" />
				</linearGradient>
				<linearGradient id="shirt" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#35c9b6" />
					<stop offset="1" stopColor="#1c9285" />
				</linearGradient>
				<linearGradient id="jeans" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#3a5a8f" />
					<stop offset="1" stopColor="#2b4675" />
				</linearGradient>
				<linearGradient id="jeans2" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#2f4b7a" />
					<stop offset="1" stopColor="#223a63" />
				</linearGradient>
				{/* light from below: dark sky on top, glowing magma underneath */}
				<linearGradient id="bounce" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#1a0610" stopOpacity="0.45" />
					<stop offset="0.55" stopColor="#ff6a1a" stopOpacity="0.08" />
					<stop offset="1" stopColor="#ff7a1a" stopOpacity="0.45" />
				</linearGradient>
				<filter id="white">
					<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
				</filter>
				<mask id="silhouette" maskUnits="userSpaceOnUse" x="-40" y="-40" width="240" height="420">
					<g filter="url(#white)">{body}</g>
				</mask>
				<filter id="rim" x="-30%" y="-30%" width="160%" height="160%">
					<feOffset in="SourceAlpha" dx="-2.5" dy="-4" result="off" />
					<feComposite in="SourceAlpha" in2="off" operator="out" result="edge" />
					<feGaussianBlur in="edge" stdDeviation="1.1" result="edgeB" />
					<feFlood floodColor={rim} />
					<feComposite in2="edgeB" operator="in" result="rimC" />
					<feComposite in="rimC" in2="SourceAlpha" operator="in" result="rimIn" />
					<feGaussianBlur in="SourceAlpha" stdDeviation="8" result="halo" />
					<feFlood floodColor={rim} floodOpacity="0.35" />
					<feComposite in2="halo" operator="in" result="haloC" />
					<feMerge>
						<feMergeNode in="haloC" />
						<feMergeNode in="SourceGraphic" />
						<feMergeNode in="rimIn" />
					</feMerge>
				</filter>
			</defs>
			<g transform={`translate(0 ${bob})`} filter="url(#rim)">
				{body}
				<rect x="-40" y="-40" width="240" height="420" fill="url(#bounce)" mask="url(#silhouette)" />
			</g>
		</svg>
	);
};

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
export const Callout: React.FC<{at: number; x: number; y: number; dx: number; dy: number; title: string; sub?: string; color?: string}> = ({
	at,
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
	if (frame < at) return null;
	const s = spring({frame: frame - at, fps, config: {damping: 16, stiffness: 160}});
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
