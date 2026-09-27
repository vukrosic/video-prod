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

/** 1 on a beat, decaying to 0 before the next one. */
export const beatPulse = (frame: number, decay = 6) => Math.exp(-((frame % BEAT) / BEAT) * decay);

/** Camera shake that starts at `start` and decays. Returns a CSS translate. */
export const shake = (frame: number, start: number, amp: number, decayFrames = 20) => {
	if (frame < start) return 'translate(0px, 0px)';
	const k = Math.exp(-(frame - start) / decayFrames) * amp;
	const x = (random(`sx${frame}`) - 0.5) * 2 * k;
	const y = (random(`sy${frame}`) - 0.5) * 2 * k;
	return `translate(${x}px, ${y}px)`;
};

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.09}) => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
			<svg width="100%" height="100%" viewBox="0 0 480 270" preserveAspectRatio="none">
				<filter id="grain">
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
					<feColorMatrix type="saturate" values="0" />
				</filter>
				<rect width="480" height="270" filter="url(#grain)" />
			</svg>
		</AbsoluteFill>
	);
};

export const Vignette: React.FC<{strength?: number; color?: string}> = ({strength = 0.75, color = '0,0,0'}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at center, rgba(${color},0) 45%, rgba(${color},${strength}) 100%)`,
			pointerEvents: 'none',
		}}
	/>
);

export const Flash: React.FC<{at: number; color?: string; len?: number; peak?: number}> = ({
	at,
	color = 'white',
	len = 12,
	peak = 1,
}) => {
	const frame = useCurrentFrame();
	const o = interpolate(frame, [at, at + 1, at + len], [0, peak, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return <AbsoluteFill style={{background: color, opacity: o, pointerEvents: 'none'}} />;
};

/** TikTok-style word-by-word captions with the active word highlighted. */
export const Captions: React.FC<{ids: string[]}> = ({ids}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const line = ids.map((id) => L[id]).find((l) => frame >= l.from && frame < l.to + 12);
	if (!line) return null;
	const shown = line.words.filter((w) => frame >= w.f);
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 110}}>
			<div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 1500, gap: '0 22px'}}>
				{shown.map((w, i) => {
					const s = spring({frame: frame - w.f, fps, config: {damping: 11, stiffness: 260}});
					const active = i === shown.length - 1;
					return (
						<span
							key={i}
							style={{
								fontFamily: FONT,
								fontWeight: 900,
								fontSize: 76,
								textTransform: 'uppercase',
								color: active ? '#ffd23f' : 'white',
								WebkitTextStroke: '12px black',
								paintOrder: 'stroke fill',
								transform: `scale(${interpolate(s, [0, 1], [1.5, 1])}) translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
								opacity: s,
								display: 'inline-block',
								letterSpacing: -1,
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

/** A dark crust over glowing lava, generated with SVG noise. Translate it to make it flow. */
export const MagmaTexture: React.FC<{
	width: number;
	height: number;
	id: string;
	freq?: string;
	seed?: number;
	offset?: number;
}> = ({width, height, id, freq = '0.004 0.012', seed = 3, offset = 0}) => (
	<svg width={width} height={height} style={{display: 'block'}}>
		<defs>
			<linearGradient id={`${id}-lava`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#ffe066" />
				<stop offset="0.4" stopColor="#ff8a1c" />
				<stop offset="1" stopColor="#c42a00" />
			</linearGradient>
			<filter id={`${id}-crust`} x={0} y={0} width={width + offset} height={height} filterUnits="userSpaceOnUse">
				<feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves="3" seed={seed} />
				<feColorMatrix type="matrix" values="0 0 0 0 0.09  0 0 0 0 0.03  0 0 0 0 0.02  1.6 0 0 0 -0.35" />
				<feComponentTransfer>
					<feFuncA type="linear" slope="9" intercept="-3.2" />
				</feComponentTransfer>
			</filter>
		</defs>
		<rect width={width} height={height} fill={`url(#${id}-lava)`} />
		<g transform={`translate(${-offset} 0)`}>
			<rect width={width + offset} height={height} filter={`url(#${id}-crust)`} />
		</g>
	</svg>
);

/** The recurring main character: a person in a t-shirt and jeans. */
export const Character: React.FC<{breath?: number; bob?: number; rim?: string}> = ({
	breath = 0,
	bob = 0,
	rim = '#ff7a1a',
}) => (
	<svg width="200" height="440" viewBox="0 0 100 220" style={{filter: `drop-shadow(0 0 10px ${rim})`, overflow: 'visible'}}>
		<g transform={`translate(0 ${bob})`}>
			{/* legs */}
			<rect x="33" y="120" width="15" height="92" rx="7" fill="#27406b" />
			<rect x="52" y="120" width="15" height="92" rx="7" fill="#1f3558" />
			{/* arms */}
			<rect x="15" y="66" width="13" height="64" rx="6.5" fill="#f1b98f" transform={`rotate(${8 + breath * 6} 21 70)`} />
			<rect x="72" y="66" width="13" height="64" rx="6.5" fill="#e5a97e" transform={`rotate(${-8 - breath * 6} 78 70)`} />
			{/* t-shirt torso, expands with the breath */}
			<g transform={`translate(50 95) scale(${1 + breath * 0.1} ${1 + breath * 0.04}) translate(-50 -95)`}>
				<path d="M24 64 Q50 56 76 64 L80 92 L70 92 L70 128 L30 128 L30 92 L20 92 Z" fill="#23b5a4" />
				<path d="M40 60 Q50 70 60 60" stroke="#1a8f82" strokeWidth="3" fill="none" />
			</g>
			{/* head tilts back as the breath comes in */}
			<g transform={`rotate(${-breath * 10} 50 52)`}>
				<rect x="45" y="46" width="10" height="12" fill="#e5a97e" />
				<circle cx="50" cy="32" r="20" fill="#f1b98f" />
				<path d="M30 30 Q32 10 50 11 Q70 10 70 30 Q62 20 50 21 Q38 20 30 30 Z" fill="#3b2a20" />
				<circle cx="43" cy="33" r="2.2" fill="#2a1a12" />
				<circle cx="57" cy="33" r="2.2" fill="#2a1a12" />
				<ellipse cx="50" cy="43" rx={3 + breath * 2} ry={1.5 + breath * 3} fill="#8a3b2a" />
			</g>
		</g>
	</svg>
);

/** Survival timer HUD. */
export const Timer: React.FC<{seconds: number; dead: boolean; scale?: number}> = ({seconds, dead, scale = 1}) => {
	const s = Math.max(0, seconds);
	const mm = String(Math.floor(s / 60)).padStart(2, '0');
	const ss = (s % 60).toFixed(2).padStart(5, '0');
	return (
		<div
			style={{
				fontFamily: FONT,
				transform: `scale(${scale})`,
				transformOrigin: 'top right',
				background: dead ? 'rgba(200,20,20,0.9)' : 'rgba(10,10,14,0.72)',
				border: `3px solid ${dead ? '#ff4d4d' : 'rgba(255,255,255,0.25)'}`,
				borderRadius: 18,
				padding: '14px 26px',
				color: 'white',
				textAlign: 'right',
				boxShadow: dead ? '0 0 60px rgba(255,40,40,0.8)' : 'none',
			}}
		>
			<div style={{fontSize: 22, fontWeight: 800, letterSpacing: 4, opacity: 0.8}}>
				{dead ? '☠ DECEASED' : 'SURVIVAL TIME'}
			</div>
			<div style={{fontSize: 72, fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1.05}}>
				{mm}:{ss}
			</div>
		</div>
	);
};

/** Bottom deep-time bar: where in Earth's history we are. */
export const DeepTimeBar: React.FC<{progress: number; label: string; opacity?: number}> = ({progress, label, opacity = 1}) => (
	<div style={{position: 'absolute', left: 120, right: 120, bottom: 48, opacity, fontFamily: FONT}}>
		<div style={{display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.75)', fontSize: 20, fontWeight: 800, letterSpacing: 3}}>
			<span>4.5 BILLION YEARS AGO</span>
			<span>TODAY</span>
		</div>
		<div style={{height: 8, background: 'rgba(255,255,255,0.18)', borderRadius: 4, marginTop: 10, position: 'relative'}}>
			<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${progress * 100}%`, background: '#ff5a1f', borderRadius: 4}} />
			<div
				style={{
					position: 'absolute',
					left: `${progress * 100}%`,
					top: -12,
					width: 32,
					height: 32,
					marginLeft: -16,
					borderRadius: 16,
					background: '#ffd23f',
					boxShadow: '0 0 24px #ffd23f',
				}}
			/>
			<div style={{position: 'absolute', left: `${progress * 100}%`, top: -58, color: '#ffd23f', fontSize: 22, fontWeight: 900, whiteSpace: 'nowrap'}}>
				▼ {label}
			</div>
		</div>
	</div>
);

/** A HUD-style callout label with a line to a point. */
export const Callout: React.FC<{at: number; x: number; y: number; dx: number; dy: number; title: string; sub?: string; color?: string}> = ({
	at,
	x,
	y,
	dx,
	dy,
	title,
	sub,
	color = '#ffd23f',
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	if (frame < at) return null;
	const s = spring({frame: frame - at, fps, config: {damping: 14, stiffness: 180}});
	const lineP = interpolate(frame - at, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
	const typed = Math.floor(interpolate(frame - at, [4, 16], [0, title.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	return (
		<>
			<svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width="1" height="1">
				<circle cx={x} cy={y} r={10 * s} fill="none" stroke={color} strokeWidth="4" />
				<circle cx={x} cy={y} r={4} fill={color} opacity={s} />
				<line x1={x} y1={y} x2={x + dx * lineP} y2={y + dy * lineP} stroke={color} strokeWidth="3" />
			</svg>
			<div
				style={{
					position: 'absolute',
					left: x + dx + (dx >= 0 ? 12 : -12),
					top: y + dy - 30,
					transform: dx >= 0 ? undefined : 'translateX(-100%)',
					fontFamily: FONT,
					color: 'white',
					opacity: s,
					textAlign: dx >= 0 ? 'left' : 'right',
				}}
			>
				<div style={{fontSize: 40, fontWeight: 900, color, letterSpacing: 1, whiteSpace: 'nowrap'}}>{title.slice(0, typed)}</div>
				{sub && <div style={{fontSize: 24, fontWeight: 700, opacity: 0.85, whiteSpace: 'nowrap'}}>{sub}</div>}
			</div>
		</>
	);
};
