// Boring Billion, Snowball Earth, Cambrian.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame} from 'remotion';
import {Character} from '../Character';
import {Callout, FONT, Flash, Vignette} from '../fx';
import {Anomalocaris, Boulder, Jelly, Trilobite} from './art';
import {Actor, AirBar, At, Badge, Land, Particles, Sea, SectionFrame, Space, Tank, Title, deathDesat, useT} from './common';
import {FPS, LAND, LN, SEC, clamp, mixLand, ramp, wordAt} from './lib';
import {Checklist, DEAD_AT, DeepBar, Stat, Thermo, TimerCard, deathFrames, formatAgo} from './ui';

const ease = Easing.inOut(Easing.cubic);

/* =============================================================== BORING BILLION */
const PANEL_BG = [
	'linear-gradient(180deg, #5a6c80 0%, #9aa6ad 55%, #3a3a3a 56%, #242424 100%)',
	'linear-gradient(180deg, #3d5570 0%, #8ea0a8 55%, #4a3a30 56%, #2a2019 100%)',
	'linear-gradient(180deg, #6a7888 0%, #b0b8b8 55%, #5a4632 56%, #33261c 100%)',
	'linear-gradient(180deg, #2e4a66 0%, #7a94a4 55%, #3a4a50 56%, #1c2226 100%)',
	'linear-gradient(180deg, #506070 0%, #a4acb0 55%, #6a3a26 56%, #3a2016 100%)',
	'linear-gradient(180deg, #44607a 0%, #92a8b4 55%, #3a3530 56%, #221e1b 100%)',
];
const TIMES = ['02:14', '01:58', '02:41', '02:05', '02:27', '01:49'];

const DeathMontage: React.FC = () => {
	const frame = useCurrentFrame();
	const b2 = LN.b2.from;
	const deaths = deathFrames().filter((f) => f >= b2 - 60 && f < b2 + 200);
	const out = interpolate(frame, [LN.b2.to - 20, LN.b2.to], [1, 0], clamp);
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: out}}>
			<div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 460px)', gap: 26, marginTop: 40}}>
				{deaths.map((d, i) => {
					const s = spring({frame: frame - (d - 14), fps: FPS, config: {damping: 14, stiffness: 200}});
					if (frame < d - 14) return <div key={i} />;
					const stamp = spring({frame: frame - d - 4, fps: FPS, config: {damping: 9, stiffness: 300}});
					return (
						<div key={i} style={{width: 460, height: 260, borderRadius: 18, overflow: 'hidden', position: 'relative', background: PANEL_BG[i % 6], transform: `scale(${s}) rotate(${(random(`bp${i}`) - 0.5) * 4}deg)`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '3px solid rgba(255,255,255,0.8)'}}>
							<div style={{position: 'absolute', left: 230 - 120 * 0.42, top: 250 - 490 * 0.42, transform: `scale(0.42) rotate(${interpolate(frame, [d - 6, d + 6], [0, 84], {...clamp, easing: Easing.in(Easing.quad)})}deg)`, transformOrigin: '0 0'}}>
								<div style={{transformOrigin: '120px 490px', filter: frame >= d ? 'grayscale(0.7)' : undefined}}>
									<Character uid={`m${i}`} light="above" rim="#dfe8f0" puff={frame < d - 6 ? 1 : 0} dead={frame >= d} />
								</div>
							</div>
							<div style={{position: 'absolute', right: 14, top: 12, fontFamily: FONT, fontSize: 38, fontWeight: 900, color: '#ff5a4d', opacity: frame >= d ? stamp : 0, transform: `scale(${1 + (1 - stamp)})`, textShadow: '0 2px 10px rgba(0,0,0,0.6)'}}>
								{TIMES[i % 6]}
							</div>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

const EarthMoon: React.FC<{at: number; until: number}> = ({at, until}) => {
	const frame = useCurrentFrame();
	if (frame < at || frame > until) return null;
	const s = spring({frame: frame - at, fps: FPS, config: {damping: 16}});
	const o = interpolate(frame, [until - 12, until], [1, 0], clamp);
	const d = interpolate(frame, [at, until], [230, 420], {...clamp, easing: ease});
	const hours = Math.round(interpolate(frame, [at + 20, wordAt('b3', 'eighteen')], [10, 18], clamp));
	return (
		<div style={{position: 'absolute', left: 170, top: 330, width: 1600, height: 480, opacity: Math.min(s, o), fontFamily: FONT}}>
			<svg width="1600" height="480" style={{overflow: 'visible'}}>
				<defs>
					<radialGradient id="emE" cx="0.35" cy="0.35" r="0.7">
						<stop offset="0" stopColor="#6fa8dc" />
						<stop offset="1" stopColor="#123456" />
					</radialGradient>
				</defs>
				<circle cx="200" cy="220" r="120" fill="url(#emE)" />
				<path d="M110 180 Q150 150 200 170 Q230 200 190 230 Q150 240 120 220 Z" fill="#8a7a5a" opacity="0.8" />
				<circle cx={200 + d} cy="220" r="34" fill="#cfd4da" />
				<line x1="340" y1="330" x2={200 + d} y2="330" stroke="#ffd79a" strokeWidth="3" strokeDasharray="10 8" />
				<path d={`M${200 + d - 16} 318 L${200 + d} 330 L${200 + d - 16} 342`} stroke="#ffd79a" strokeWidth="3" fill="none" />
				<text x={270 + d / 2} y="372" fill="#ffd79a" fontSize="28" fontWeight="800" textAnchor="middle" letterSpacing="2">
					THE MOON DRIFTS AWAY
				</text>
				{/* day length dial */}
				<g transform="translate(1250 220)">
					<circle r="150" fill="rgba(10,12,20,0.7)" stroke="rgba(255,255,255,0.35)" strokeWidth="3" />
					<path d={`M0 -130 A130 130 0 ${hours / 24 > 0.5 ? 1 : 0} 1 ${Math.sin((hours / 24) * Math.PI * 2) * 130} ${-Math.cos((hours / 24) * Math.PI * 2) * 130}`} stroke="#ffd79a" strokeWidth="22" fill="none" />
					{new Array(24).fill(0).map((_, i) => (
						<line key={i} x1={Math.sin((i / 24) * Math.PI * 2) * 100} y1={-Math.cos((i / 24) * Math.PI * 2) * 100} x2={Math.sin((i / 24) * Math.PI * 2) * 112} y2={-Math.cos((i / 24) * Math.PI * 2) * 112} stroke="white" strokeWidth="2" opacity="0.6" />
					))}
					<text y="18" fill="white" fontSize="64" fontWeight="900" textAnchor="middle">
						{hours}h
					</text>
					<text y="200" fill="white" fontSize="28" fontWeight="800" textAnchor="middle" letterSpacing="3">
						ONE DAY
					</text>
				</g>
			</svg>
		</div>
	);
};

export const Boring: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = SEC.boring;
	const L = LN;
	const ago = interpolate(frame, [L.b2.from, L.b2.to], [1.8e9, 0.8e9], {...clamp, easing: ease});
	const zoomOut = ramp(frame, L.b4.from - 10, L.b4.from + 40);
	const red = interpolate(frame, [wordAt('b5', 'suffocate'), L.b5.to], [0, 4.0 / 4.54], {...clamp, easing: ease});
	const barIn = spring({frame: frame - L.b4.from - 10, fps: FPS, config: {damping: 16, stiffness: 120}});
	const dramatic = ramp(frame, L.b7.from, L.b7.to + 20);
	const planetDim = frame < L.b1.to ? 1 : frame < L.b3.to + 10 ? 0.35 : 1 - zoomOut * 0.6;
	return (
		<SectionFrame from={sec.from} to={sec.to}>
			<Space zoom={interpolate(zoomOut, [0, 1], [1.05, 0.55]) * (1 + dramatic * 0.3)} cx={0} cy={0} earth={[0, 0, 0.38]} mode={1} spin={(frame - sec.from) * 0.0035} style={{filter: `brightness(${planetDim})`}} />
			<Title at={wordAt('b1', 'Boring')} until={L.b1.to + 12} text="THE BORING BILLION" sub="1.8 – 0.8 BILLION YEARS AGO" size={120} />
			{frame >= L.b1.to && frame < L.b2.to && (
				<div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontFamily: FONT, fontSize: 64, fontWeight: 900, color: 'white', fontVariantNumeric: 'tabular-nums', textShadow: '0 4px 30px rgba(0,0,0,0.7)'}}>{formatAgo(Math.round(ago / 1e7) * 1e7)}</div>
			)}
			<DeathMontage />
			<EarthMoon at={L.b3.from} until={L.b3.to + 16} />
			{frame >= L.b4.from && (
				<div style={{position: 'absolute', left: 210, top: 330, width: 1500, opacity: barIn * (1 - dramatic * 0.2), transform: `translateY(${(1 - barIn) * 40}px)`}}>
					<DeepBar ago={0.8e9} big width={1500} red={red} label="" />
					<div style={{display: 'flex', justifyContent: 'space-between', marginTop: 34, fontFamily: FONT}}>
						<div style={{fontSize: 34, fontWeight: 800, color: '#ff6a5d', letterSpacing: 3, opacity: red > 0.05 ? 1 : 0}}>YOU SUFFOCATE WITHIN MINUTES</div>
						<div style={{fontSize: 34, fontWeight: 800, color: '#8dffb0', letterSpacing: 3, opacity: ramp(frame, L.b7.from, L.b7.from + 10)}}>← THE REST</div>
					</div>
				</div>
			)}
			<div style={{position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center'}}>
				<Stat at={wordAt('b6', 'ninety')} until={SEC.boring.to} value="~90%" label="OF EARTH'S HISTORY WOULD KILL YOU" color="#ff6a5d" size={150} />
			</div>
			<Flash at={L.b7.to + 10} color="#fff2d6" len={10} peak={0.3} />
			<Vignette strength={0.55} />
		</SectionFrame>
	);
};

/* =============================================================== SNOWBALL EARTH */
export const Snowball: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = SEC.snowball;
	const t = useT();
	const L = LN;
	const deadAt = DEAD_AT.snowball!;
	const landAt = L.s3.from - 12;
	const freeze = ramp(frame, L.s1.from + 10, wordAt('s2', 'equator') + 30);
	// hypothetical second attempt with an oxygen tank
	const tankAt = L.s4.from + 6;
	const tryTwo = frame >= tankAt;
	const frost = ramp(frame, wordAt('s4', 'cold'), L.s4.to - 10);
	const frozeAt = L.s4.to - 16;
	const melt = ramp(frame, wordAt('s5', 'melted') - 10, wordAt('s5', 'melted') + 70);
	const u = {...mixLand(LAND.snowball, {...LAND.cambrian, uSnow: 0}, melt), uLandType: melt > 0.5 ? 0 : 1, uPan: (frame - landAt) * 0.002};
	const shiver = frost > 0.05 && frame < frozeAt ? Math.sin(frame * 2.7) * 3 * frost : 0;
	const tankSec = tryTwo ? interpolate(frame, [tankAt, frozeAt], [0, 3 * 3600], {...clamp, easing: Easing.in(Easing.quad)}) : 0;
	const bodyFade = 1 - ramp(frame, L.s5.from, L.s5.from + 30);
	return (
		<SectionFrame from={sec.from} to={sec.to} desat={tryTwo ? 0 : deathDesat(frame, deadAt)}>
			{frame < landAt ? (
				<AbsoluteFill>
					<Space zoom={interpolate(frame, [sec.from, landAt], [0.85, 1.15])} earth={[0, 0, 0.36]} mode={1} freeze={freeze} spin={(frame - sec.from) * 0.004} />
					<Title at={wordAt('s2', 'snowball')} until={landAt} text="SNOWBALL EARTH" size={120} y={330} />
					<Callout at={wordAt('s2', 'equator')} x={1080} y={560} dx={200} dy={-170} title="ICE AT THE EQUATOR" sub="maybe" color="#cfe8ff" />
				</AbsoluteFill>
			) : (
				<AbsoluteFill>
					<Land u={u} />
					{!tryTwo && (
						<Actor x={900} y={950} arrive={L.s3.from} collapse={deadAt - 16} light="above" rim="#dfeaff" puff={ramp(frame, L.s3.from + 20, L.s3.from + 40)} pain={ramp(frame, L.s3.from + 40, deadAt - 16)} bob={Math.sin(t * 2) * 1.2} />
					)}
					{tryTwo && (
						<AbsoluteFill style={{opacity: bodyFade}}>
							<At x={1030} y={950} w={70} h={182}>
								<Tank />
							</At>
							<svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width="1" height="1">
								<path d={`M1030 790 Q1000 700 ${930 + shiver} ${640}`} stroke="#9ab" strokeWidth="6" fill="none" />
							</svg>
							<Actor x={900 + shiver} y={950} arrive={tankAt} collapse={frozeAt} light="above" rim="#dfeaff" frost={frost} pose="cross" pain={frost * 0.8} bob={0} dead={frame >= frozeAt + 10} />
							<Particles n={30} seed="brr" color="rgba(255,255,255,0.8)" size={5} speed={30} dir={1} area={[700, 350, 450, 300]} opacity={frost} />
						</AbsoluteFill>
					)}
					<div style={{position: 'absolute', right: 90, top: 230}}>
						<AirBar
							at={L.s3.from + 10}
							until={L.s4.from}
							o2="TOO LOW"
							o2Color="#ffb04a"
							parts={[
								{label: 'N₂', v: 86, color: '#7ab8ff'},
								{label: 'O₂', v: 5, color: '#8dffb0'},
								{label: '', v: 9, color: '#9aa'},
							]}
						/>
					</div>
					{tryTwo && frame < L.s5.from && (
						<>
							<div style={{position: 'absolute', left: 90, top: 220, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start'}}>
								<Badge at={tankAt} text="⟲ TRY AGAIN, WITH OXYGEN" rot={-2} bg="#8dffb0" size={36} />
								<div style={{marginTop: 10}}>
									<TimerCard seconds={tankSec} state={frame >= frozeAt ? 'dead' : 'live'} />
								</div>
							</div>
							<div style={{position: 'absolute', right: 110, top: 300}}>
								<Thermo temp={interpolate(frame, [wordAt('s4', 'temperatures'), wordAt('s4', 'temperatures') + 40], [0, -40], clamp)} label="FAR BELOW FREEZING" appear={ramp(frame, wordAt('s4', 'temperatures') - 6, wordAt('s4', 'temperatures') + 10)} />
							</div>
						</>
					)}
					{/* frost creeping in from the edges */}
					<AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent ${70 - frost * 30}%, rgba(220,240,255,${frost * 0.85}) 100%)`, opacity: bodyFade}} />
					<Flash at={landAt} color="#ffffff" len={10} peak={0.5} />
					<Flash at={tankAt} color="#bfffd8" len={8} peak={0.35} />
					<Flash at={wordAt('s5', 'exploded')} color="#fff2d6" len={12} peak={0.35} />
				</AbsoluteFill>
			)}
			<Vignette strength={0.5} />
		</SectionFrame>
	);
};

/* =============================================================== CAMBRIAN */
const Dizzy: React.FC<{x: number; y: number; amount: number}> = ({x, y, amount}) => {
	const t = useT();
	if (amount <= 0.01) return null;
	return (
		<svg style={{position: 'absolute', left: x - 80, top: y - 30, overflow: 'visible', opacity: amount}} width="160" height="60">
			{[0, 1, 2].map((i) => {
				const a = t * 4 + (i * Math.PI * 2) / 3;
				return <path key={i} transform={`translate(${80 + Math.cos(a) * 70} ${30 + Math.sin(a) * 16})`} d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z" fill="#ffe27a" />;
			})}
		</svg>
	);
};

const CambrianSea: React.FC = () => {
	const frame = useCurrentFrame();
	const t = useT();
	const L = LN;
	const pan = (frame - L.c11.from) * 0.004;
	const anoAt = wordAt('c12', 'Anomalocaris') - 30;
	const anoX = interpolate(frame, [anoAt, anoAt + 240], [-700, 2100], clamp);
	return (
		<AbsoluteFill>
			<Sea pan={pan} water={[0.08, 0.42, 0.55]} deep={[0.01, 0.06, 0.14]} sand={[0.6, 0.52, 0.4]} floorY={-0.12} />
			{[
				{x: 260, y: 170, w: 90, s: 1, b: 2},
				{x: 1500, y: 120, w: 130, s: 2, b: 0},
				{x: 1180, y: 330, w: 70, s: 3, b: 3},
				{x: 520, y: 380, w: 110, s: 4, b: 0},
			].map((j) => (
				<div key={j.s} style={{position: 'absolute', left: j.x + Math.sin(t * 0.4 + j.s) * 30, top: j.y - ((t * 14 + j.s * 40) % 80), filter: j.b ? `blur(${j.b}px)` : undefined}}>
					<Jelly t={t} w={j.w} seed={j.s} />
				</div>
			))}
			{/* trilobites crawling on the seafloor */}
			{[
				{x: 300, y: 880, s: 1.0, v: 18},
				{x: 760, y: 930, s: 1.3, v: 12},
				{x: 1300, y: 860, s: 0.8, v: 22},
				{x: 1650, y: 960, s: 1.4, v: 10},
				{x: 1050, y: 800, s: 0.6, v: 16},
			].map((b, i) => (
				<div key={i} style={{position: 'absolute', left: b.x + ((frame - L.c11.from) / FPS) * b.v, top: b.y, transform: `rotate(90deg) scale(${b.s})`, transformOrigin: 'center'}}>
					<Trilobite t={t + i} w={90} c={i % 2 ? '#8a6a4f' : '#7a5c46'} />
				</div>
			))}
			{frame >= anoAt && (
				<div style={{position: 'absolute', left: anoX, top: 420 + Math.sin(t * 1.3) * 30}}>
					<Anomalocaris t={t} w={620} />
				</div>
			)}
			<Title at={wordAt('c11', 'Cambrian')} until={wordAt('c11', 'Cambrian') + 110} text="THE CAMBRIAN EXPLOSION" size={100} y={-300} />
			<Callout at={wordAt('c12', 'Trilobites')} x={860} y={940} dx={120} dy={-200} title="TRILOBITES" sub="armoured seafloor crawlers" />
			{frame >= anoAt + 30 && <Callout at={wordAt('c12', 'Anomalocaris')} x={anoX + 560} y={520} dx={60} dy={-180} title="ANOMALOCARIS" sub="one of the first big predators" color="#ff9a7a" />}
		</AbsoluteFill>
	);
};

export const Cambrian: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = SEC.cambrian;
	const t = useT();
	const L = LN;
	const diveAt = L.c11.from - 12;
	const backAt = L.c13.from - 12;
	const inSea = frame >= diveAt && frame < backAt;
	const breathIn = wordAt('c1', 'breath');
	const exhale = L.c5.from - 4;
	const puff = ramp(frame, breathIn + 8, breathIn + 20) * (1 - ramp(frame, exhale - 3, exhale + 3));
	const tension = ramp(frame, L.c2.from - 20, exhale);
	const relief = ramp(frame, exhale, exhale + 14);
	const breath = ramp(frame, breathIn - 4, breathIn + 6) * (1 - ramp(frame, breathIn + 8, breathIn + 16)) + relief * (0.5 + 0.5 * Math.sin(t * 5)) * (1 - ramp(frame, L.c6.from, L.c6.from + 20));
	const dizzy = ramp(frame, wordAt('c6', 'dizzy') - 5, wordAt('c6', 'dizzy') + 10) * (1 - ramp(frame, L.c7.from - 10, L.c7.from + 10));
	const pushIn = 1 + 0.22 * tension * (1 - relief);
	const panSpeed = frame > L.c9.from ? (frame - L.c9.from) * 0.006 : 0;
	const days = ramp(frame, L.c14.from, L.c14.to + 60, (x) => x);
	const dayCycle = frame > L.c14.from ? 0.5 - 0.5 * Math.cos(((frame - L.c14.from) / FPS) * Math.PI * 1.6) : 0;
	const u = {...LAND.cambrian, uPan: (frame - sec.from) * 0.002 + panSpeed, uDark: dayCycle * 0.75 * (1 - ramp(frame, L.c15.from, L.c15.from + 20)), uStars: dayCycle};
	const sitting = frame >= L.c14.from;
	const holding = frame >= backAt && frame < L.c14.from;
	const charX = 960;
	const focusY = 700;
	return (
		<SectionFrame from={sec.from} to={sec.to}>
			{inSea ? (
				<CambrianSea />
			) : (
				<AbsoluteFill style={{transform: `scale(${pushIn})`, transformOrigin: `${charX}px ${focusY}px`}}>
					<Land u={u} />
					{sitting && (
						<At x={charX} y={958} w={240} h={140}>
							<Boulder />
						</At>
					)}
					<Actor
						x={charX}
						y={950}
						shadow={!sitting}
						arrive={L.c1.from}
						light="above"
						rim="#fff0d8"
						puff={puff}
						pain={tension * 0.5 * (1 - relief) + dizzy * 0.35 + (holding ? 0.15 : 0)}
						breath={breath}
						smile={relief * (1 - dizzy) * (holding ? 0 : 1) * (1 - ramp(frame, L.c8.from, L.c8.from + 20)) + (sitting ? 0.4 : 0)}
						sway={dizzy * Math.sin(t * 2.2) * 7}
						look={frame > L.c8.from && frame < L.c11.from ? Math.sin(t * 1.3) : 0}
						pose={sitting ? 'sit' : holding ? 'hold' : 'down'}
						bob={Math.sin(t * 2) * 1.2}
					/>
					{holding && (
						<div style={{position: 'absolute', left: charX - 44, top: 950 - 490 + 250 - 60, transform: 'rotate(-80deg)'}}>
							<Trilobite t={t} w={62} />
						</div>
					)}
					<Dizzy x={charX} y={950 - 490 + 10} amount={dizzy} />
				</AbsoluteFill>
			)}
			{!inSea && (
				<>
					<div style={{position: 'absolute', left: 90, top: 250, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start'}}>
						<Badge at={L.c2.from} until={L.c5.from + 60} text="NEW RECORD" rot={-4} />
					</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 230, display: 'flex', justifyContent: 'center'}}>
						<Badge at={L.c5.from + 4} until={L.c6.from + 30} text="YOU'RE BREATHING" rot={0} bg="#3ddc84" size={60} />
					</div>
					<Callout at={wordAt('c6', 'mountain')} x={charX + 20} y={560} dx={200} dy={-130} title="LIKE A HIGH MOUNTAIN" sub="dizzy · short of breath · headache" color="#ffe27a" />
					<div style={{position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center'}}>
						<Badge at={wordAt('c7', 'alive')} until={L.c8.to} text="ALIVE!" rot={-3} bg="#3ddc84" size={70} />
					</div>
					{frame >= L.c9.from && frame < L.c11.from && (
						<div style={{position: 'absolute', left: 120, right: 120, top: 180, opacity: interpolate(frame, [L.c11.from - 20, L.c11.from - 8], [1, 0], clamp)}}>
							<Checklist
								columns={4}
								items={[
									{label: 'Plants', ok: false, at: wordAt('c9', 'plants')},
									{label: 'Grass', ok: false, at: wordAt('c9', 'grass')},
									{label: 'Trees', ok: false, at: wordAt('c9', 'trees')},
									{label: 'Soil', ok: false, at: wordAt('c9', 'soil')},
									{label: 'Insects', ok: false, at: wordAt('c9', 'insects')},
									{label: 'Wood', ok: false, at: wordAt('c10', 'wood')},
									{label: 'Fire', ok: false, at: wordAt('c10', 'fire')},
									{label: 'Shelter', ok: false, at: wordAt('c10', 'shelter')},
								]}
							/>
						</div>
					)}
					<Callout at={wordAt('c9', 'bare')} x={1500} y={700} dx={-60} dy={-140} title="BARE ROCK" sub="no soil anywhere" />
					{holding && (
						<>
							<Callout at={wordAt('c13', 'raw')} x={charX - 20} y={950 - 490 + 200} dx={-190} dy={-120} title="RAW" sub="no fire, remember" color="#ff9a7a" />
							<Callout at={wordAt('c13', 'poisonous')} x={charX + 40} y={950 - 490 + 60} dx={200} dy={-80} title="POISONOUS?" sub="no idea" color="#ffe27a" />
						</>
					)}
					{sitting && (
						<div style={{position: 'absolute', left: 90, bottom: 190, fontFamily: FONT, color: 'white', fontSize: 34, fontWeight: 800, letterSpacing: 3, opacity: ramp(frame, L.c14.from, L.c14.from + 10), textShadow: '0 2px 14px black'}}>
							DAY {Math.max(1, Math.round(1 + days * 20))}
						</div>
					)}
					<div style={{position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center'}}>
						<Badge at={L.c15.from} text="YOUR FIRST SURVIVAL STORY" rot={-2} bg="#3ddc84" size={52} />
					</div>
				</>
			)}
			<Flash at={diveAt} color="#9fe8ff" len={10} peak={0.5} />
			<Flash at={backAt} color="#fff2d6" len={10} peak={0.4} />
			<Flash at={exhale} color="#bfffd8" len={10} peak={0.35} />
			<Vignette strength={0.45 + tension * 0.3 * (1 - relief)} />
		</SectionFrame>
	);
};
