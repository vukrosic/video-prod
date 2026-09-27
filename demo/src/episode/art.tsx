// SVG illustrations: creatures, plants and props. Each takes `t` (seconds) for idle animation where useful.
import React from 'react';
import {random} from 'remotion';

type P = {t?: number; w?: number; style?: React.CSSProperties};
const svgStyle = (s?: React.CSSProperties): React.CSSProperties => ({overflow: 'visible', display: 'block', ...s});

/* ---------------------------------------------------------------- Archean */
export const Stromatolites: React.FC<P & {count?: number}> = ({w = 900, count = 5, style}) => (
	<svg width={w} height={w * 0.28} viewBox="0 0 900 250" style={svgStyle(style)}>
		<defs>
			<linearGradient id="strom" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#8a8a5a" />
				<stop offset="0.25" stopColor="#7d6f55" />
				<stop offset="1" stopColor="#3b3129" />
			</linearGradient>
		</defs>
		{new Array(count).fill(0).map((_, i) => {
			const x = 40 + i * (820 / count) + random(`sx${i}`) * 40;
			const s = 0.7 + random(`ss${i}`) * 0.6;
			const wd = 150 * s;
			const ht = 120 * s;
			const y = 230;
			return (
				<g key={i}>
					<path d={`M${x} ${y} Q${x - 4} ${y - ht} ${x + wd / 2} ${y - ht - 6} Q${x + wd + 4} ${y - ht} ${x + wd} ${y} Z`} fill="url(#strom)" />
					{[0.25, 0.45, 0.65, 0.85].map((k) => (
						<path
							key={k}
							d={`M${x + wd * 0.04} ${y - ht * k * 0.9} Q${x + wd / 2} ${y - ht * (k * 0.9 + 0.12)} ${x + wd * 0.96} ${y - ht * k * 0.9}`}
							stroke="rgba(30,22,16,0.45)"
							strokeWidth="2.5"
							fill="none"
						/>
					))}
					<path d={`M${x + wd * 0.12} ${y - ht * 0.8} Q${x + wd / 2} ${y - ht - 12} ${x + wd * 0.88} ${y - ht * 0.8}`} stroke="#5f8f45" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
				</g>
			);
		})}
	</svg>
);

/** Circular magnifier showing a microbe mat. */
export const MicrobeLens: React.FC<P & {oxy?: number; dying?: number}> = ({t = 0, w = 420, oxy = 0, dying = 0, style}) => (
	<svg width={w} height={w} viewBox="0 0 400 400" style={svgStyle(style)}>
		<defs>
			<clipPath id="lens">
				<circle cx="200" cy="200" r="190" />
			</clipPath>
			<radialGradient id="lensBg" cx="0.5" cy="0.4" r="0.7">
				<stop offset="0" stopColor="#1f5a55" />
				<stop offset="1" stopColor="#07201f" />
			</radialGradient>
		</defs>
		<g clipPath="url(#lens)">
			<rect width="400" height="400" fill="url(#lensBg)" />
			{new Array(46).fill(0).map((_, i) => {
				const x = random(`mx${i}`) * 400;
				const y = random(`my${i}`) * 400;
				const r = random(`mr${i}`) * 180;
				const len = 26 + random(`ml${i}`) * 26;
				const alive = random(`md${i}`) > dying;
				const wob = Math.sin(t * 2 + i) * 3;
				return (
					<g key={i} transform={`translate(${x + wob} ${y}) rotate(${r})`}>
						<rect x={-len / 2} y="-9" width={len} height="18" rx="9" fill={alive ? '#58c27a' : '#5b6660'} stroke={alive ? '#2f8a50' : '#3a403c'} strokeWidth="2.5" />
						<circle cx={-len / 4} cy="0" r="3" fill={alive ? '#b8f5a2' : '#7c847f'} />
					</g>
				);
			})}
			{oxy > 0 &&
				new Array(24).fill(0).map((_, i) => {
					const x = random(`bx${i}`) * 400;
					const y = 400 - ((t * (40 + random(`bv${i}`) * 50) + random(`by${i}`) * 400) % 440);
					return <circle key={i} cx={x + Math.sin(t * 3 + i) * 6} cy={y} r={5 + random(`br${i}`) * 7} fill="none" stroke="rgba(200,255,255,0.8)" strokeWidth="2" opacity={oxy} />;
				})}
		</g>
		<circle cx="200" cy="200" r="190" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="8" />
		<circle cx="200" cy="200" r="198" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="4" />
	</svg>
);

/** Filament of cyanobacteria cells releasing oxygen bubbles. */
export const Cyano: React.FC<P & {cells?: number; seed?: string; bubbles?: number}> = ({t = 0, w = 300, cells = 9, seed = 'a', bubbles = 1, style}) => (
	<svg width={w} height={w * 0.8} viewBox="0 0 300 240" style={svgStyle(style)}>
		{new Array(cells).fill(0).map((_, i) => {
			const x = 20 + i * 30;
			const y = 180 + Math.sin(i * 0.8 + t * 1.5 + random(seed) * 6) * 16;
			return <ellipse key={i} cx={x} cy={y} rx="16" ry="13" fill="#3fbf6f" stroke="#1f7a45" strokeWidth="3" />;
		})}
		{bubbles > 0 &&
			new Array(10).fill(0).map((_, i) => {
				const x = 20 + ((i * 37) % 260);
				const life = (t * 0.6 + random(`${seed}b${i}`)) % 1;
				return <circle key={i} cx={x + Math.sin(life * 8) * 6} cy={170 - life * 170} r={4 + life * 6} fill="rgba(210,250,255,0.25)" stroke="rgba(220,255,255,0.9)" strokeWidth="2" opacity={(1 - life) * bubbles} />;
			})}
	</svg>
);

export const BandedIron: React.FC<P> = ({w = 700, style}) => (
	<svg width={w} height={w * 0.6} viewBox="0 0 700 420" style={svgStyle(style)}>
		<defs>
			<clipPath id="bif">
				<path d="M30 60 L640 20 L690 380 L60 410 Z" />
			</clipPath>
		</defs>
		<g clipPath="url(#bif)">
			<rect width="700" height="420" fill="#4b4642" />
			{new Array(22).fill(0).map((_, i) => (
				<path
					key={i}
					d={`M0 ${i * 20 + 5} Q175 ${i * 20 + (i % 2 ? 12 : -4)} 350 ${i * 20 + 6} T700 ${i * 20 + 2} L700 ${i * 20 + 14} Q525 ${i * 20 + 18} 350 ${i * 20 + 14} T0 ${i * 20 + 14} Z`}
					fill={i % 2 ? '#b8392a' : '#6d6a66'}
					opacity={i % 2 ? 0.95 : 0.8}
				/>
			))}
			<path d="M30 60 L640 20 L690 380 L60 410 Z" fill="url(#bifShade)" />
		</g>
		<defs>
			<linearGradient id="bifShade" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor="white" stopOpacity="0.15" />
				<stop offset="1" stopColor="black" stopOpacity="0.35" />
			</linearGradient>
		</defs>
		<path d="M30 60 L640 20 L690 380 L60 410 Z" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="4" />
	</svg>
);

/* ---------------------------------------------------------------- Cambrian */
export const Trilobite: React.FC<P & {c?: string}> = ({t = 0, w = 120, c = '#8a6a4f', style}) => (
	<svg width={w} height={w * 1.35} viewBox="0 0 100 135" style={svgStyle(style)}>
		{new Array(7).fill(0).map((_, i) => (
			<g key={i}>
				<line x1="22" y1={48 + i * 8} x2={10 - Math.sin(t * 12 + i) * 3} y2={50 + i * 8} stroke="#4a3526" strokeWidth="2.5" strokeLinecap="round" />
				<line x1="78" y1={48 + i * 8} x2={90 + Math.sin(t * 12 + i) * 3} y2={50 + i * 8} stroke="#4a3526" strokeWidth="2.5" strokeLinecap="round" />
			</g>
		))}
		<path d="M10 40 Q12 6 50 4 Q88 6 90 40 Q70 34 50 34 Q30 34 10 40 Z" fill={c} stroke="#3e2c1f" strokeWidth="2" />
		{new Array(8).fill(0).map((_, i) => (
			<path key={i} d={`M${20 + i * 0.6} ${40 + i * 9} Q50 ${44 + i * 9} ${80 - i * 0.6} ${40 + i * 9} L${80 - i * 0.6} ${48 + i * 9} Q50 ${52 + i * 9} ${20 + i * 0.6} ${48 + i * 9} Z`} fill={i % 2 ? c : '#7a5c43'} stroke="#3e2c1f" strokeWidth="1.5" />
		))}
		<path d="M28 112 Q50 134 72 112 Q50 118 28 112 Z" fill={c} stroke="#3e2c1f" strokeWidth="2" />
		<rect x="42" y="12" width="16" height="98" rx="8" fill="rgba(255,235,210,0.18)" />
		<path d="M24 22 Q30 16 36 22" stroke="#1e1510" strokeWidth="4" fill="none" strokeLinecap="round" />
		<path d="M64 22 Q70 16 76 22" stroke="#1e1510" strokeWidth="4" fill="none" strokeLinecap="round" />
	</svg>
);

export const Anomalocaris: React.FC<P> = ({t = 0, w = 520, style}) => (
	<svg width={w} height={w * 0.45} viewBox="0 0 400 180" style={svgStyle(style)}>
		<defs>
			<linearGradient id="anoBody" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#d9745a" />
				<stop offset="1" stopColor="#8a3b2e" />
			</linearGradient>
		</defs>
		{/* tail fan */}
		<g transform={`rotate(${Math.sin(t * 3) * 6} 40 90)`}>
			<path d="M40 90 L2 62 Q14 90 2 118 Z" fill="#b8563f" />
			<path d="M40 90 L8 48 Q22 70 18 90 Z M40 90 L8 132 Q22 110 18 90 Z" fill="#a24a36" />
		</g>
		{/* swimming flaps */}
		{new Array(11).fill(0).map((_, i) => {
			const x = 50 + i * 24;
			const wave = Math.sin(t * 6 - i * 0.7) * 10;
			return (
				<g key={i}>
					<path d={`M${x} 78 Q${x + 12} ${48 + wave} ${x + 28} ${60 + wave} Q${x + 20} 76 ${x + 22} 80 Z`} fill="#c9624a" opacity="0.9" />
					<path d={`M${x} 102 Q${x + 12} ${132 - wave} ${x + 28} ${120 - wave} Q${x + 20} 104 ${x + 22} 100 Z`} fill="#9a4232" opacity="0.9" />
				</g>
			);
		})}
		{/* body */}
		<ellipse cx="180" cy="90" rx="148" ry="24" fill="url(#anoBody)" />
		{new Array(12).fill(0).map((_, i) => (
			<line key={i} x1={60 + i * 22} y1="70" x2={60 + i * 22} y2="110" stroke="rgba(60,20,15,0.35)" strokeWidth="3" />
		))}
		{/* head, eyes on stalks */}
		<ellipse cx="330" cy="90" rx="34" ry="22" fill="#d9745a" />
		<line x1="330" y1="74" x2="342" y2="52" stroke="#8a3b2e" strokeWidth="5" />
		<line x1="330" y1="106" x2="342" y2="128" stroke="#8a3b2e" strokeWidth="5" />
		<ellipse cx="344" cy="48" rx="11" ry="9" fill="#1f1a1a" />
		<ellipse cx="344" cy="132" rx="11" ry="9" fill="#1f1a1a" />
		<circle cx="347" cy="45" r="3" fill="white" opacity="0.7" />
		{/* grasping appendages */}
		{[-1, 1].map((s) => {
			const curl = Math.sin(t * 2.4) * 8;
			return (
				<g key={s}>
					<path d={`M360 ${90 + s * 10} Q392 ${90 + s * 20} 396 ${90 + s * (44 + curl)} Q392 ${90 + s * (62 + curl)} 374 ${90 + s * (60 + curl)}`} stroke="#e08a6a" strokeWidth="9" fill="none" strokeLinecap="round" />
					{[0, 1, 2, 3].map((k) => (
						<line key={k} x1={378 + k * 5} y1={90 + s * (22 + k * 9)} x2={370 + k * 5} y2={90 + s * (22 + k * 9 + 4)} stroke="#f2b39a" strokeWidth="3" strokeLinecap="round" />
					))}
				</g>
			);
		})}
	</svg>
);

export const Jelly: React.FC<P & {seed?: number}> = ({t = 0, w = 120, seed = 0, style}) => {
	const pulse = 1 + Math.sin(t * 2.2 + seed) * 0.08;
	return (
		<svg width={w} height={w * 1.8} viewBox="0 0 100 180" style={svgStyle(style)}>
			{[25, 40, 55, 70, 80].map((x, i) => (
				<path key={i} d={`M${x} 48 Q${x + Math.sin(t * 2 + i + seed) * 10} 100 ${x + Math.sin(t * 1.5 + i) * 6} 170`} stroke="rgba(255,190,230,0.55)" strokeWidth="2.5" fill="none" />
			))}
			<path d={`M${50 - 42 * pulse} 50 Q50 ${-10 * pulse} ${50 + 42 * pulse} 50 Q50 40 ${50 - 42 * pulse} 50 Z`} fill="rgba(255,170,220,0.55)" stroke="rgba(255,220,245,0.9)" strokeWidth="2" />
		</svg>
	);
};

/* ---------------------------------------------------------------- Carboniferous */
/** Lepidodendron: scale tree with a diamond-patterned trunk and forked crown. */
export const ScaleTree: React.FC<P & {h?: number; tint?: string; seed?: string}> = ({t = 0, w = 260, h = 1000, tint = '#4a5a2a', seed = 's', style}) => {
	const sway = Math.sin(t * 0.7 + random(seed) * 6) * 2;
	const trunk = '#3c3325';
	return (
		<svg width={w} height={h} viewBox={`0 0 260 ${h}`} style={svgStyle(style)}>
			<defs>
				<pattern id={`lep-${seed}`} width="18" height="24" patternUnits="userSpaceOnUse">
					<rect width="18" height="24" fill={trunk} />
					<path d="M9 1 L17 12 L9 23 L1 12 Z" fill="#524532" stroke="#2a2319" strokeWidth="1.5" />
				</pattern>
			</defs>
			<g transform={`rotate(${sway} 130 ${h})`} opacity={1}>
				<path d={`M112 ${h} L120 200 L140 200 L150 ${h} Z`} fill={`url(#lep-${seed})`} />
				{/* forked crown */}
				{[
					'M130 210 Q100 150 70 110',
					'M130 210 Q160 150 190 110',
					'M70 110 Q55 80 40 60',
					'M70 110 Q85 80 95 55',
					'M190 110 Q175 80 165 55',
					'M190 110 Q205 80 222 60',
				].map((d, i) => (
					<path key={i} d={d} stroke={trunk} strokeWidth={i < 2 ? 14 : 9} fill="none" strokeLinecap="round" />
				))}
				{[
					[40, 60],
					[95, 55],
					[165, 55],
					[222, 60],
					[70, 110],
					[190, 110],
				].map(([x, y], i) => (
					<g key={i}>
						{new Array(18).fill(0).map((_, k) => {
							const a = (k / 18) * Math.PI * 2;
							return <line key={k} x1={x} y1={y} x2={x + Math.cos(a) * 58} y2={y + Math.sin(a) * 40 + 14} stroke={tint} strokeWidth="8" strokeLinecap="round" />;
						})}
						<ellipse cx={x} cy={y + 6} rx="36" ry="26" fill={tint} />
						<ellipse cx={x - 8} cy={y - 2} rx="18" ry="10" fill="rgba(255,255,220,0.12)" />
					</g>
				))}
			</g>
		</svg>
	);
};

export const Fern: React.FC<P & {c?: string; seed?: string}> = ({t = 0, w = 300, c = '#3f7a2c', seed = 'f', style}) => (
	<svg width={w} height={w * 0.8} viewBox="0 0 300 240" style={svgStyle(style)}>
		{[-60, -30, 0, 25, 55].map((ang, i) => {
			const sway = Math.sin(t * 1.3 + i + random(seed) * 5) * 3;
			return (
				<g key={i} transform={`rotate(${ang + sway} 150 240)`}>
					<path d="M150 240 Q145 120 170 20" stroke={c} strokeWidth="5" fill="none" />
					{new Array(12).fill(0).map((_, k) => {
						const y = 220 - k * 17;
						const x = 150 + (k * k) * 0.14;
						const len = 42 - k * 3;
						return (
							<g key={k}>
								<path d={`M${x} ${y} Q${x - len * 0.6} ${y - 10} ${x - len} ${y - 2}`} stroke={c} strokeWidth="7" fill="none" strokeLinecap="round" />
								<path d={`M${x} ${y} Q${x + len * 0.6} ${y - 10} ${x + len} ${y - 2}`} stroke={c} strokeWidth="7" fill="none" strokeLinecap="round" />
							</g>
						);
					})}
				</g>
			);
		})}
	</svg>
);

/** Top-down giant dragonfly, head to the right. */
export const Meganeura: React.FC<P> = ({t = 0, w = 420, style}) => {
	const flap = Math.sin(t * 40);
	const wing = (x: number, dir: 1 | -1, back: boolean) => (
		<g transform={`translate(${x} 0) scale(1 ${dir * (0.45 + 0.55 * Math.abs(flap))}) rotate(${back ? -10 : 8})`}>
			<path d="M-10 -4 Q-30 -90 -16 -176 Q6 -190 20 -170 Q24 -80 12 -4 Z" fill="rgba(220,240,255,0.32)" stroke="rgba(230,245,255,0.85)" strokeWidth="1.5" />
			<path d="M0 -6 L-2 -172 M-8 -30 L-18 -160 M6 -30 L14 -160" stroke="rgba(230,245,255,0.45)" strokeWidth="1" />
			<circle cx="4" cy="-164" r="3" fill="rgba(40,50,60,0.6)" />
		</g>
	);
	return (
		<svg width={w} height={w * 0.86} viewBox="-10 -190 440 380" style={svgStyle(style)}>
			{wing(160, 1, true)}
			{wing(160, -1, true)}
			{wing(182, 1, false)}
			{wing(182, -1, false)}
			{new Array(10).fill(0).map((_, i) => (
				<rect key={i} x={10 + i * 14} y="-5" width="15" height="10" rx="4" fill={i % 2 ? '#1f5a6a' : '#2c7a86'} />
			))}
			<ellipse cx="172" cy="0" rx="26" ry="12" fill="#2c6a55" />
			<circle cx="204" cy="0" r="14" fill="#1a3a33" />
			<circle cx="210" cy="-7" r="8" fill="#4ad0c0" />
			<circle cx="210" cy="7" r="8" fill="#4ad0c0" />
		</svg>
	);
};

export const Arthropleura: React.FC<P> = ({t = 0, w = 900, style}) => (
	<svg width={w} height={w * 0.16} viewBox="0 0 900 140" style={svgStyle(style)}>
		{new Array(28).fill(0).map((_, i) => {
			const x = 20 + i * 30;
			const lift = Math.max(0, Math.sin(t * 8 - i * 0.6)) * 8;
			return (
				<g key={i}>
					<line x1={x + 10} y1="96" x2={x + 4 - lift * 0.5} y2={128 - lift} stroke="#3a2a1c" strokeWidth="5" strokeLinecap="round" />
					<line x1={x + 20} y1="96" x2={x + 26 + lift * 0.5} y2={128 - (8 - lift)} stroke="#2a1d13" strokeWidth="5" strokeLinecap="round" />
				</g>
			);
		})}
		{new Array(28).fill(0).map((_, i) => {
			const x = 16 + i * 30;
			const bob = Math.sin(t * 4 - i * 0.5) * 2;
			return (
				<g key={i}>
					<rect x={x} y={52 + bob} width="34" height="50" rx="14" fill={i % 2 ? '#6b4a2e' : '#7d5836'} stroke="#3a2718" strokeWidth="2.5" />
					<rect x={x + 4} y={56 + bob} width="26" height="12" rx="6" fill="rgba(255,220,170,0.2)" />
				</g>
			);
		})}
		<ellipse cx="870" cy="78" rx="28" ry="24" fill="#5a3d25" />
		<path d="M886 64 Q910 30 930 26 M886 70 Q916 50 940 52" stroke="#3a2718" strokeWidth="4" fill="none" strokeLinecap="round" />
		<circle cx="880" cy="70" r="4" fill="#111" />
	</svg>
);

/** Flames: layered teardrops flickering. */
export const Fire: React.FC<P & {seed?: number}> = ({t = 0, w = 200, seed = 0, style}) => (
	<svg width={w} height={w * 1.3} viewBox="0 0 200 260" style={svgStyle({...style, mixBlendMode: 'screen'})}>
		{[
			['#ff4a0a', 1.0],
			['#ff9a1a', 0.72],
			['#ffe27a', 0.42],
		].map(([c, s], i) => {
			const k = s as number;
			const fl = Math.sin(t * 13 + seed + i) * 8 + Math.sin(t * 7.3 + seed * 2) * 6;
			return (
				<path
					key={i}
					d={`M${100 - 70 * k} 250 Q${100 - 80 * k} ${170 - 40 * k} ${100 + fl * 0.5} ${250 - 230 * k + fl} Q${100 + 80 * k} ${170 - 40 * k} ${100 + 70 * k} 250 Z`}
					fill={c as string}
					opacity={0.9}
					style={{filter: `blur(${2 + i}px)`}}
				/>
			);
		})}
	</svg>
);

export const Lightning: React.FC<P & {seed?: string}> = ({w = 300, seed = 'l', style}) => {
	let x = 150;
	const pts: string[] = [`${x},0`];
	for (let i = 1; i <= 12; i++) {
		x += (random(`${seed}${i}`) - 0.5) * 90;
		pts.push(`${x},${i * 70}`);
	}
	return (
		<svg width={w} height={w * 2.8} viewBox="0 0 300 840" style={svgStyle(style)}>
			<polyline points={pts.join(' ')} stroke="#dfe9ff" strokeWidth="18" fill="none" opacity="0.35" style={{filter: 'blur(10px)'}} />
			<polyline points={pts.join(' ')} stroke="white" strokeWidth="6" fill="none" strokeLinejoin="round" />
		</svg>
	);
};

/* ---------------------------------------------------------------- Permian */
export const DeadTree: React.FC<P & {seed?: string; c?: string}> = ({w = 220, seed = 'd', c = '#2a1a12', style}) => (
	<svg width={w} height={w * 1.8} viewBox="0 0 220 400" style={svgStyle(style)}>
		<path d="M100 400 L106 150 L114 150 L122 400 Z" fill={c} />
		{[
			[110, 160, 60, 60],
			[110, 200, 170, 110],
			[110, 250, 40, 170],
			[80, 95, 50, 40],
			[150, 140, 190, 80],
		].map(([x1, y1, x2, y2], i) => (
			<path key={i} d={`M${x1} ${y1} Q${(x1 + x2) / 2 + (random(`${seed}${i}`) - 0.5) * 30} ${(y1 + y2) / 2} ${x2} ${y2}`} stroke={c} strokeWidth={i < 3 ? 8 : 5} fill="none" strokeLinecap="round" />
		))}
	</svg>
);

/* ---------------------------------------------------------------- Cretaceous */
export const Triceratops: React.FC<P & {c?: string; step?: number}> = ({t = 0, w = 420, c = '#6f7a3a', step = 0, style}) => {
	const leg = (x: number, ph: number) => {
		const a = Math.sin(t * 3 * step + ph) * 12 * step;
		return <rect x={x} y="150" width="30" height="70" rx="12" fill={c} transform={`rotate(${a} ${x + 15} 150)`} />;
	};
	return (
		<svg width={w} height={w * 0.55} viewBox="0 0 420 230" style={svgStyle(style)}>
			<defs>
				<linearGradient id="tri" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={c} />
					<stop offset="1" stopColor="#3a4220" />
				</linearGradient>
			</defs>
			{leg(92, 0)}
			{leg(222, Math.PI)}
			<path d="M20 120 Q10 100 60 92 Q120 60 220 70 Q280 76 300 110 Q300 170 250 175 L100 175 Q40 170 20 120 Z" fill="url(#tri)" />
			<path d="M2 118 Q20 110 40 112" stroke={c} strokeWidth="14" strokeLinecap="round" />
			{leg(120, Math.PI)}
			{leg(250, 0)}
			{/* frill + head */}
			<path d="M270 40 Q330 10 350 60 Q360 110 320 140 Q280 120 270 40 Z" fill="#8a6a3a" stroke="#5a4222" strokeWidth="4" />
			{new Array(6).fill(0).map((_, i) => (
				<circle key={i} cx={282 + i * 12} cy={36 + Math.abs(i - 2.5) * 6} r="6" fill="#c2a060" />
			))}
			<path d="M300 90 Q350 80 390 110 Q400 130 380 140 L320 150 Q296 130 300 90 Z" fill={c} />
			<path d="M378 116 Q412 118 404 146 Q392 132 378 136 Z" fill="#3a3222" />
			<path d="M330 88 L352 30 L344 90 Z M352 92 L380 42 L366 98 Z" fill="#efe6cf" />
			<path d="M384 112 L398 94 L392 116 Z" fill="#efe6cf" />
			<circle cx="342" cy="104" r="5" fill="#111" />
		</svg>
	);
};

export const TRexHead: React.FC<P & {open?: number}> = ({w = 500, open = 0, style}) => (
	<svg width={w} height={w * 0.7} viewBox="0 0 500 350" style={svgStyle(style)}>
		<defs>
			<linearGradient id="rex" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#5a4a38" />
				<stop offset="1" stopColor="#2e251c" />
			</linearGradient>
		</defs>
		<path d="M0 120 Q60 40 200 50 Q330 50 440 100 Q480 120 470 150 L260 170 Q120 190 0 260 Z" fill="url(#rex)" />
		<g transform={`rotate(${open * 16} 220 170)`}>
			<path d="M40 250 Q140 190 260 180 L450 170 Q450 200 420 210 L230 240 Q120 260 60 300 Z" fill="#43372a" />
			{new Array(9).fill(0).map((_, i) => (
				<path key={i} d={`M${250 + i * 22} ${180 - 1} l8 -18 l8 18 Z`} fill="#efe6cf" />
			))}
		</g>
		{new Array(10).fill(0).map((_, i) => (
			<path key={i} d={`M${240 + i * 22} 165 l9 22 l9 -22 Z`} fill="#f5eedb" />
		))}
		<circle cx="300" cy="100" r="12" fill="#e8b33a" />
		<ellipse cx="302" cy="100" rx="3" ry="10" fill="#111" />
		<path d="M275 82 Q305 70 330 86" stroke="#2a2018" strokeWidth="8" fill="none" strokeLinecap="round" />
	</svg>
);

export const Hut: React.FC<P> = ({w = 380, style}) => (
	<svg width={w} height={w * 0.7} viewBox="0 0 380 266" style={svgStyle(style)}>
		{new Array(11).fill(0).map((_, i) => (
			<line key={i} x1={40 + i * 30} y1="262" x2={190 + (i - 5) * 6} y2="20" stroke={i % 2 ? '#6b4a2a' : '#7d5a34'} strokeWidth="10" strokeLinecap="round" />
		))}
		<path d="M30 262 Q60 150 190 30 Q320 150 350 262 Z" fill="#4f7a2a" opacity="0.8" />
		{new Array(14).fill(0).map((_, i) => (
			<path key={i} d={`M${60 + i * 19} ${250 - (i % 3) * 30} q20 -40 40 0`} fill="#3f6a22" opacity="0.9" />
		))}
		<path d="M150 262 Q190 170 230 262 Z" fill="#1a130c" />
	</svg>
);

export const TallyRock: React.FC<P & {marks?: number}> = ({w = 260, marks = 40, style}) => (
	<svg width={w} height={w * 0.6} viewBox="0 0 260 156" style={svgStyle(style)}>
		<path d="M10 150 Q0 60 60 30 Q140 0 210 30 Q260 60 250 150 Z" fill="#7a7266" stroke="#4a443c" strokeWidth="4" />
		{new Array(Math.min(marks, 60)).fill(0).map((_, i) => {
			const g = Math.floor(i / 5);
			const k = i % 5;
			const x = 40 + (g % 6) * 30 + k * 5;
			const y = 60 + Math.floor(g / 6) * 36;
			return k === 4 ? <line key={i} x1={x - 22} y1={y + 22} x2={x + 2} y2={y + 4} stroke="#2e2a24" strokeWidth="3" /> : <line key={i} x1={x} y1={y} x2={x} y2={y + 26} stroke="#2e2a24" strokeWidth="3" />;
		})}
	</svg>
);

export const Mammal: React.FC<P> = ({t = 0, w = 200, style}) => (
	<svg width={w} height={w * 0.6} viewBox="0 0 200 120" style={svgStyle(style)}>
		<path d="M20 90 Q0 80 10 60" stroke="#6a4a36" strokeWidth="5" fill="none" strokeLinecap="round" />
		<ellipse cx="80" cy="80" rx="58" ry="32" fill="#8a6446" />
		<ellipse cx="80" cy="92" rx="44" ry="16" fill="#b08a68" />
		<ellipse cx="146" cy="68" rx="32" ry="26" fill="#8a6446" />
		<path d="M170 70 Q192 74 176 82" fill="#8a6446" />
		<circle cx="190" cy="74" r="5" fill="#2a1a12" />
		<ellipse cx="130" cy="44" rx="12" ry="16" fill="#9a7456" transform="rotate(-20 130 44)" />
		<circle cx="158" cy="62" r={7} fill="#140c08" />
		<circle cx="160" cy="59" r="2.2" fill="white" />
		<line x1="176" y1="76" x2={196} y2={72 + Math.sin(t * 8) * 2} stroke="#3a2a20" strokeWidth="1.5" />
		<line x1="176" y1="78" x2={196} y2={82 + Math.sin(t * 8) * 2} stroke="#3a2a20" strokeWidth="1.5" />
		<rect x="50" y="100" width="12" height="18" rx="5" fill="#6a4a36" />
		<rect x="110" y="100" width="12" height="18" rx="5" fill="#6a4a36" />
	</svg>
);

/* ---------------------------------------------------------------- Ice Age */
export const Mammoth: React.FC<P & {c?: string; step?: number}> = ({t = 0, w = 420, c = '#5a3a24', step = 0.5, style}) => {
	const leg = (x: number, ph: number) => <rect x={x} y="170" width="40" height="90" rx="14" fill={c} transform={`rotate(${Math.sin(t * 2 + ph) * 8 * step} ${x + 20} 170)`} />;
	return (
		<svg width={w} height={w * 0.7} viewBox="0 0 420 294" style={svgStyle(style)}>
			{leg(70, 0)}
			{leg(220, Math.PI)}
			<path d="M30 170 Q20 60 150 50 Q250 30 320 70 Q360 100 340 190 Q300 215 60 210 Q30 200 30 170 Z" fill={c} />
			{new Array(16).fill(0).map((_, i) => (
				<path key={i} d={`M${50 + i * 17} ${200} q-4 18 3 34`} stroke="#3a2414" strokeWidth="5" fill="none" strokeLinecap="round" />
			))}
			{leg(100, Math.PI)}
			{leg(250, 0)}
			<path d="M300 60 Q340 20 380 60 Q400 100 380 150 Q376 200 392 250 Q378 256 366 250 Q350 200 346 160 Z" fill={c} />
			<path d="M360 150 Q420 170 410 110 Q406 90 396 100 Q400 150 356 136 Z" fill="#efe6cf" />
			<circle cx="352" cy="92" r="5" fill="#111" />
			<path d="M240 40 Q300 20 330 50" stroke="#3a2414" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.5" />
		</svg>
	);
};

export const Campfire: React.FC<P> = ({t = 0, w = 160, style}) => (
	<div style={{position: 'relative', width: w, height: w * 1.2, ...style}}>
		<div style={{position: 'absolute', left: -w * 0.6, top: w * 0.2, width: w * 2.2, height: w * 1.2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,150,50,0.45), transparent 65%)'}} />
		<Fire t={t} w={w} style={{position: 'absolute', left: 0, top: 0}} />
		<svg width={w} height={w * 0.3} viewBox="0 0 160 48" style={{position: 'absolute', left: 0, top: w * 1.05}}>
			<rect x="10" y="18" width="140" height="16" rx="8" fill="#4a2e1a" transform="rotate(8 80 26)" />
			<rect x="10" y="18" width="140" height="16" rx="8" fill="#5a3a22" transform="rotate(-10 80 26)" />
		</svg>
	</div>
);

export const Germ: React.FC<P & {c?: string}> = ({t = 0, w = 60, c = '#ff5a8a', style}) => (
	<svg width={w} height={w} viewBox="0 0 60 60" style={svgStyle(style)}>
		<g transform={`rotate(${t * 40} 30 30)`}>
			{new Array(10).fill(0).map((_, i) => {
				const a = (i / 10) * Math.PI * 2;
				return (
					<g key={i}>
						<line x1={30 + Math.cos(a) * 14} y1={30 + Math.sin(a) * 14} x2={30 + Math.cos(a) * 25} y2={30 + Math.sin(a) * 25} stroke={c} strokeWidth="3" />
						<circle cx={30 + Math.cos(a) * 26} cy={30 + Math.sin(a) * 26} r="3.5" fill={c} />
					</g>
				);
			})}
			<circle cx="30" cy="30" r="16" fill={c} opacity="0.9" />
			<circle cx="25" cy="26" r="4" fill="rgba(255,255,255,0.4)" />
		</g>
	</svg>
);

/* ---------------------------------------------------------------- Today */
export const LivingRoom: React.FC<P & {night?: number}> = ({t = 0, night = 1}) => (
	<svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position: 'absolute', left: 0, top: 0}}>
		<defs>
			<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#2a2440" />
				<stop offset="1" stopColor="#3b3050" />
			</linearGradient>
			<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#0b1030" />
				<stop offset="1" stopColor="#3a2a5a" />
			</linearGradient>
			<radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0" stopColor="#ffcf8a" stopOpacity="0.55" />
				<stop offset="1" stopColor="#ffcf8a" stopOpacity="0" />
			</radialGradient>
			<linearGradient id="couch" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#c0573f" />
				<stop offset="1" stopColor="#8a3a2a" />
			</linearGradient>
		</defs>
		<rect width="1920" height="1080" fill="url(#wall)" />
		{/* window with city at night */}
		<rect x="1180" y="150" width="560" height="460" rx="10" fill="url(#sky)" />
		{new Array(40).fill(0).map((_, i) => (
			<circle key={i} cx={1190 + random(`st${i}`) * 540} cy={160 + random(`sy${i}`) * 200} r={1 + random(`sr${i}`) * 1.5} fill="white" opacity={0.4 + 0.5 * Math.abs(Math.sin(t + i))} />
		))}
		{new Array(12).fill(0).map((_, i) => {
			const bw = 40 + random(`bw${i}`) * 40;
			const bh = 80 + random(`bh${i}`) * 200;
			const x = 1180 + i * 48;
			return (
				<g key={i}>
					<rect x={x} y={610 - bh} width={bw} height={bh} fill="#141028" />
					{new Array(Math.floor(bh / 26)).fill(0).map((__, k) => (
						<rect key={k} x={x + 8 + (k % 2) * 16} y={620 - bh + k * 24} width="8" height="10" fill="#ffd27a" opacity={random(`w${i}-${k}`) > 0.45 ? 0.85 * night : 0.1} />
					))}
				</g>
			);
		})}
		<rect x="1180" y="150" width="560" height="460" rx="10" fill="none" stroke="#1a1528" strokeWidth="18" />
		<line x1="1460" y1="150" x2="1460" y2="610" stroke="#1a1528" strokeWidth="12" />
		{/* floor */}
		<rect x="0" y="860" width="1920" height="220" fill="#2a2030" />
		<rect x="0" y="856" width="1920" height="8" fill="#1a1420" />
		{/* lamp */}
		<ellipse cx="420" cy="420" rx="360" ry="360" fill="url(#lamp)" />
		<rect x="412" y="440" width="12" height="420" fill="#1a1420" />
		<path d="M350 440 L490 440 L450 340 L390 340 Z" fill="#f0c890" />
		{/* plant */}
		<rect x="1700" y="760" width="90" height="100" rx="10" fill="#6a4a3a" />
		{new Array(9).fill(0).map((_, i) => (
			<path key={i} d={`M1745 760 Q${1690 + i * 14} ${640 - (i % 3) * 30} ${1660 + i * 20} ${620 + (i % 2) * 40}`} stroke="#3f7a3a" strokeWidth="12" fill="none" strokeLinecap="round" />
		))}
		{/* couch */}
		<rect x="560" y="600" width="820" height="150" rx="40" fill="url(#couch)" />
		<rect x="520" y="700" width="900" height="130" rx="40" fill="#a84a35" />
		<rect x="500" y="640" width="110" height="200" rx="40" fill="#b8503a" />
		<rect x="1330" y="640" width="110" height="200" rx="40" fill="#b8503a" />
		<rect x="560" y="820" width="30" height="40" fill="#1a1420" />
		<rect x="1350" y="820" width="30" height="40" fill="#1a1420" />
	</svg>
);

/** A 24-hour clock of Earth's history with the breathable slice highlighted. */
export const HistoryClock: React.FC<{p: number; showRed: number; showGreen: number; showHuman: number; size?: number}> = ({p, showRed, showGreen, showHuman, size = 640}) => {
	const R = 280;
	const arc = (a0: number, a1: number, r: number) => {
		const s = (a: number) => [300 + r * Math.sin(a * Math.PI * 2), 300 - r * Math.cos(a * Math.PI * 2)];
		const [x0, y0] = s(a0);
		const [x1, y1] = s(a1);
		return `M${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${x1} ${y1}`;
	};
	const breathable = 21.4 / 24;
	return (
		<svg width={size} height={size} viewBox="0 0 600 600" style={{overflow: 'visible'}}>
			<circle cx="300" cy="300" r="296" fill="rgba(10,10,20,0.75)" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
			{new Array(24).fill(0).map((_, i) => {
				const a = (i / 24) * Math.PI * 2;
				return <line key={i} x1={300 + Math.sin(a) * 250} y1={300 - Math.cos(a) * 250} x2={300 + Math.sin(a) * (i % 6 ? 262 : 240)} y2={300 - Math.cos(a) * (i % 6 ? 262 : 240)} stroke="white" strokeWidth={i % 6 ? 2 : 5} opacity="0.7" />;
			})}
			{[0, 6, 12, 18].map((h) => {
				const a = (h / 24) * Math.PI * 2;
				return (
					<text key={h} x={300 + Math.sin(a) * 205} y={300 - Math.cos(a) * 205 + 12} fill="white" fontSize="34" fontWeight="800" textAnchor="middle" fontFamily="Inter" opacity="0.8">
						{h === 0 ? '24' : h}
					</text>
				);
			})}
			{showRed > 0 && <path d={arc(0.0001, Math.min(breathable, p) * showRed + 0.0001, R)} stroke="#ff4a3d" strokeWidth="30" fill="none" strokeLinecap="butt" />}
			{showGreen > 0 && p > breathable && <path d={arc(breathable, breathable + (Math.min(p, 0.9999) - breathable) * showGreen, R)} stroke="#3ddc84" strokeWidth="30" fill="none" />}
			{showHuman > 0 && <circle cx="300" cy={300 - R} r={12 + showHuman * 6} fill="#ffd79a" stroke="white" strokeWidth="3" opacity={showHuman} />}
			<line x1="300" y1="300" x2={300 + Math.sin(p * Math.PI * 2) * 230} y2={300 - Math.cos(p * Math.PI * 2) * 230} stroke="white" strokeWidth="8" strokeLinecap="round" />
			<circle cx="300" cy="300" r="14" fill="white" />
		</svg>
	);
};

/** A boulder to sit on: top edge at y=0 of a 240x140 box. */
export const Boulder: React.FC<P & {c?: string}> = ({w = 240, c = '#5a524a', style}) => (
	<svg width={w} height={w * 0.58} viewBox="0 0 240 140" style={svgStyle(style)}>
		<path d="M10 140 Q0 60 50 22 Q120 -6 190 20 Q238 50 232 140 Z" fill={c} />
		<path d="M50 22 Q120 -6 190 20 Q150 30 110 26 Q80 24 50 22 Z" fill="rgba(255,255,255,0.14)" />
		<path d="M10 140 Q20 110 60 120 Q120 132 180 116 Q220 110 232 140 Z" fill="rgba(0,0,0,0.25)" />
	</svg>
);
