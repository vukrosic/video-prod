// Carboniferous, Great Dying, Late Cretaceous.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame} from 'remotion';
import {Callout, FONT, Flash, Vignette, shake} from '../fx';
import {Shader} from '../Shader';
import {MAGMA} from '../shaders';
import {Arthropleura, Boulder, Campfire, DeadTree, Fern, Fire, Hut, Lightning, Mammal, Meganeura, ScaleTree, TRexHead, TallyRock, Triceratops} from './art';
import {Actor, At, BG_SCALE, Badge, Land, Particles, SectionFrame, Space, SpeciesGrid, Title, deathDesat, useT} from './common';
import {FPS, LAND, LN, SEC, clamp, mixLand, ramp, wordAt} from './lib';
import {Checklist, DEAD_AT, Gauge, Stat, Thermo, timerValue, ERA} from './ui';

const ease = Easing.inOut(Easing.cubic);
const wrap = (x: number, w: number) => ((x % w) + w) % w;

/* =============================================================== CARBONIFEROUS */
type Tree = {x: number; s: number; y: number; H: number; tint: string; seed: string};
const FAR: Tree[] = new Array(12).fill(0).map((_, i) => ({x: i * 210 + random(`fx${i}`) * 90, s: 0.26 + random(`fs${i}`) * 0.08, y: 660, H: 900, tint: '#5a6a3a', seed: `f${i}`}));
const MID: Tree[] = new Array(7).fill(0).map((_, i) => ({x: i * 380 + random(`mx${i}`) * 120, s: 0.5 + random(`ms${i}`) * 0.12, y: 745, H: 900, tint: '#4a5f28', seed: `m${i}`}));
const NEAR: Tree[] = [
	{x: 120, s: 1.25, y: 1120, H: 900, tint: '#3f5522', seed: 'n1'},
	{x: 1830, s: 1.1, y: 1100, H: 900, tint: '#3f5522', seed: 'n2'},
];

const Forest: React.FC<{pan: number; burn: number; t: number}> = ({pan, burn, t}) => {
	const burnT = (x: number) => burn * 2.4 - Math.abs(x - 1500) / 800; // spreads outward from the strike
	const layer = (trees: Tree[], par: number, opacity: number, span: number) =>
		trees.map((tr) => {
			const x = wrap(tr.x - pan * par, span) - 200;
			const b = Math.max(0, Math.min(1, burnT(x)));
			return (
				<React.Fragment key={tr.seed}>
					<At x={x} y={tr.y} s={tr.s} w={260} h={tr.H} style={{opacity, filter: b > 0 ? `brightness(${1 - b * 0.6}) sepia(${b * 0.6})` : undefined}}>
						<ScaleTree t={t} h={tr.H} tint={tr.tint} seed={tr.seed} />
					</At>
					{b > 0.05 && (
						<At x={x} y={tr.y + 10} s={tr.s * 4.2 * b} w={200} h={260}>
							<Fire t={t} w={200} seed={tr.x} />
						</At>
					)}
				</React.Fragment>
			);
		});
	return (
		<>
			{layer(FAR, 0.25, 0.55, 2520)}
			{layer(MID, 0.5, 0.9, 2660)}
		</>
	);
};

export const Carboniferous: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = SEC.carboniferous;
	const t = useT();
	const L = LN;
	const lakeAt = L.k10.from - 14;
	const pan = (frame - sec.from) * 1.2;
	const strike = wordAt('k9', 'lightning');
	const burn = ramp(frame, strike + 6, L.k9.to + 20, (x) => x);
	const ominous = ramp(frame, L.k8.from, wordAt('k8', 'fire') + 10);
	const u = {...LAND.carboniferous, uPan: pan / 400, uDark: ominous * 0.25, uSkyHor: burn > 0 ? ([0.62 + burn * 0.3, 0.7 - burn * 0.25, 0.55 - burn * 0.35] as [number, number, number]) : LAND.carboniferous.uSkyHor, uFog: ([0.42 + burn * 0.25, 0.52 - burn * 0.1, 0.38 - burn * 0.15] as [number, number, number])};
	const flyIn = wordAt('k4', 'dragonfly');
	const flyX = interpolate(frame, [L.k4.from - 40, flyIn + 10, L.k4.to, L.k4.to + 50], [-500, 1180, 1260, 2300], {...clamp, easing: ease});
	const flyY = 280 + Math.sin(t * 2.3) * 20;
	const crawl = interpolate(frame, [L.k5.from - 40, L.k6.from + 40], [-620, 1950], clamp);
	const crawling = frame > L.k5.from - 40 && frame < L.k6.from + 40;
	const breath = ramp(frame, wordAt('k2', 'deep') - 4, wordAt('k2', 'breath') + 8) * (1 - ramp(frame, wordAt('k2', 'breath') + 12, wordAt('k2', 'breath') + 24));
	const smile = ramp(frame, wordAt('k2', 'great') - 10, wordAt('k2', 'great')) * (1 - ominous);
	const o2 = interpolate(frame, [wordAt('k2', 'thirty'), wordAt('k2', 'thirty') + 30], [21, 33], {...clamp, easing: ease});
	const gaugeIn = spring({frame: frame - wordAt('k2', 'air'), fps: FPS, config: {damping: 16}});
	const gaugeOut = interpolate(frame, [L.k3.to - 10, L.k3.to + 4], [1, 0], clamp);
	const run = frame > wordAt('k9', 'races') ? (frame - wordAt('k9', 'races')) : 0;
	const charX = 960 - run * 9;
	const years = timerValue(frame, ERA.carboniferous.timer!.keys) / (365 * 86400);
	return (
		<SectionFrame from={sec.from} to={sec.to}>
			{frame < lakeAt ? (
				<AbsoluteFill style={{transform: frame >= strike ? shake(frame, strike, 18, 10) : undefined}}>
					<Land u={u} />
					<Forest pan={pan} burn={burn} t={t} />
					{burn > 0 && <AbsoluteFill style={{background: `radial-gradient(ellipse at 70% 60%, rgba(255,110,30,${burn * 0.35}), rgba(40,10,0,${burn * 0.35}))`, mixBlendMode: 'multiply'}} />}
					{burn > 0 && <Particles n={40} seed="smoke" color="rgba(60,50,45,0.6)" size={70} speed={50} blur={16} opacity={burn} />}
					{burn > 0 && <Particles n={50} seed="emb" color="#ffb040" size={6} speed={120} opacity={burn} />}
					{crawling && (
						<div style={{position: 'absolute', left: crawl, top: 800 - 90}}>
							<Arthropleura t={t} w={560} />
						</div>
					)}
					{crawling && frame >= wordAt('k5', 'two') && frame < L.k5.to + 30 && (
						<svg style={{position: 'absolute', left: crawl, top: 660, overflow: 'visible'}} width="560" height="30">
							<line x1="0" x2="560" y1="15" y2="15" stroke="#ffd79a" strokeWidth="3" />
							<line x1="0" x2="0" y1="3" y2="27" stroke="#ffd79a" strokeWidth="3" />
							<line x1="560" x2="560" y1="3" y2="27" stroke="#ffd79a" strokeWidth="3" />
							<text x="280" y="-8" fill="#ffd79a" fontFamily="Inter" fontWeight="800" fontSize="36" textAnchor="middle">
								UP TO 2.5 M
							</text>
						</svg>
					)}
					<Actor
						x={charX}
						y={960}
						arrive={L.k1.from}
						light="above"
						rim="#fff0c8"
						breath={Math.max(breath, frame > strike ? 0.6 : 0)}
						smile={smile}
						pain={frame > strike ? 0.5 : 0}
						look={frame > L.k4.from && frame < L.k5.to ? 1 : frame > strike ? 1 : 0}
						pose={run > 0 ? 'run' : 'down'}
						phase={frame * 0.5}
						flip={run > 0}
						bob={run > 0 ? Math.abs(Math.sin(frame * 0.5)) * -10 : Math.sin(t * 2) * 1.2}
					/>
					{/* foreground layer */}
					{NEAR.map((tr) => (
						<At key={tr.seed} x={tr.x - (pan * 1.3) % 60} y={tr.y} s={tr.s} w={260} h={tr.H} style={{filter: `brightness(${0.55 - burn * 0.2})`}}>
							<ScaleTree t={t} h={tr.H} tint={tr.tint} seed={tr.seed} />
						</At>
					))}
					{[{x: 330, s: 1.5}, {x: 1540, s: 1.3}, {x: 700, s: 0.9}].map((f, i) => (
						<At key={i} x={f.x} y={1100} s={f.s} w={300} h={240} style={{filter: `brightness(${0.75 - burn * 0.25})`}}>
							<Fern t={t} seed={`fe${i}`} c={i === 2 ? '#4f8a34' : '#3a6a26'} />
						</At>
					))}
					{frame >= L.k4.from - 40 && frame < L.k4.to + 50 && (
						<div style={{position: 'absolute', left: flyX - 200, top: flyY - 180, transform: `rotate(${Math.sin(t * 3) * 4}deg)`}}>
							<Meganeura t={t} w={420} />
						</div>
					)}
					{frame >= wordAt('k4', 'seventy') && frame < L.k4.to && (
						<svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width="1" height="1">
							<line x1={flyX + 40} x2={flyX + 40} y1={flyY - 170} y2={flyY + 170} stroke="#ffd79a" strokeWidth="3" />
							<line x1={flyX + 26} x2={flyX + 54} y1={flyY - 170} y2={flyY - 170} stroke="#ffd79a" strokeWidth="3" />
							<line x1={flyX + 26} x2={flyX + 54} y1={flyY + 170} y2={flyY + 170} stroke="#ffd79a" strokeWidth="3" />
							<text x={flyX + 70} y={flyY + 12} fill="#ffd79a" fontFamily="Inter" fontWeight="800" fontSize="38">
								~70 CM
							</text>
						</svg>
					)}
					{frame >= strike && frame < strike + 8 && (
						<div style={{position: 'absolute', left: 1360, top: -40}}>
							<Lightning w={300} seed={`k${frame}`} />
						</div>
					)}
					<Flash at={strike} color="#e8f0ff" len={8} peak={0.8} />
					<Flash at={strike + 5} color="#e8f0ff" len={5} peak={0.5} />
				</AbsoluteFill>
			) : (
				<AbsoluteFill>
					<Land u={{...LAND.carboniferous, uCoast: 6.5, uFogDist: 14, uPan: (frame - lakeAt) * 0.002, uWater: [0.05, 0.14, 0.12]}} />
					<Forest pan={900} burn={0} t={t} />
					<At x={1180} y={990} w={160} h={220}>
						<Campfire t={t} w={130} />
					</At>
					<At x={930} y={992} w={240} h={140}>
						<Boulder c="#4a4038" />
					</At>
					<Actor x={930} y={985} shadow={false} arrive={lakeAt} light="above" rim="#ffc07a" smile={0.8} pose="sit" bob={Math.sin(t * 2) * 1} />
					{[{x: 250, s: 1.4}, {x: 1700, s: 1.2}].map((f, i) => (
						<At key={i} x={f.x} y={1100} s={f.s} w={300} h={240} style={{filter: 'brightness(0.7)'}}>
							<Fern t={t} seed={`fl${i}`} />
						</At>
					))}
					<div style={{position: 'absolute', left: 90, bottom: 190, fontFamily: FONT, color: 'white', fontSize: 34, fontWeight: 800, letterSpacing: 3, textShadow: '0 2px 14px black'}}>YEAR {Math.max(1, Math.floor(years) + 1)}</div>
					<div style={{position: 'absolute', left: 0, right: 0, top: 260, display: 'flex', justifyContent: 'center'}}>
						<Badge at={L.k11.from} text="BEST ERA SO FAR" rot={-3} bg="#3ddc84" size={60} />
					</div>
					<Flash at={lakeAt} color="#fff2d6" len={10} peak={0.4} />
				</AbsoluteFill>
			)}
			{frame < lakeAt && (
				<>
					<div style={{position: 'absolute', right: 90, top: 190, opacity: gaugeOut}}>
						{frame >= wordAt('k2', 'air') && <Gauge title="OXYGEN IN THE AIR" max={40} value={o2} appear={gaugeIn} marks={[{v: 21, label: 'TODAY 21%'}]} />}
					</div>
					<Callout at={wordAt('k3', 'insects')} x={1080} y={430} dx={170} dy={-120} title="GIANT INSECTS" sub="more oxygen may be part of why" color="#9fffe0" />
					<Callout at={wordAt('k5', 'Arthropleura')} x={crawl + 500} y={760} dx={160} dy={-200} title="ARTHROPLEURA" sub="a giant millipede (plant-eater)" color="#ffcf8a" />
					{frame >= L.k6.from && frame < L.k8.from && (
						<div style={{position: 'absolute', left: 140, right: 140, top: 190, opacity: interpolate(frame, [L.k8.from - 16, L.k8.from - 4], [1, 0], clamp)}}>
							<Checklist
								columns={4}
								items={[
									{label: 'Food', ok: true, at: wordAt('k6', 'food')},
									{label: 'Firewood', ok: true, at: wordAt('k6', 'firewood')},
									{label: 'Shelter', ok: true, at: wordAt('k6', 'shelter')},
									{label: 'No human germs', ok: true, at: wordAt('k7', 'germs')},
								]}
							/>
						</div>
					)}
					<Title at={wordAt('k8', 'fire')} until={L.k9.from + 10} text="FIRE" size={180} color="#ffb04a" />
					<Callout at={wordAt('k9', 'wildfire')} x={1500} y={560} dx={-120} dy={-170} title="WILDFIRE" sub="even damp plants burn" color="#ffb04a" />
				</>
			)}
			<Vignette strength={0.5} />
		</SectionFrame>
	);
};

/* =============================================================== THE GREAT DYING */
const CO2: React.FC<{from: number; to: number}> = ({from, to}) => {
	const frame = useCurrentFrame();
	if (frame < from || frame > to) return null;
	const o = interpolate(frame, [from, from + 10, to - 10, to], [0, 1, 1, 0], clamp);
	return (
		<AbsoluteFill style={{opacity: o}}>
			{new Array(26).fill(0).map((_, i) => {
				const r = (k: string) => random(`co${k}${i}`);
				const y = 1100 - ((frame - from) * (3 + r('s') * 4) + r('y') * 900) % 1200;
				return (
					<div key={i} style={{position: 'absolute', left: r('x') * 1800 + Math.sin(frame / 20 + i) * 20, top: y, fontFamily: FONT, fontWeight: 900, fontSize: 30 + r('z') * 40, color: 'rgba(255,220,200,0.85)', textShadow: '0 0 20px rgba(255,90,20,0.8)'}}>
						CO₂
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

export const Dying: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = SEC.dying;
	const t = useT();
	const L = LN;
	const deadAt = DEAD_AT.dying!;
	const landAt = L.d4.from - 12;
	const temp = interpolate(frame, [L.d4.from + 20, wordAt('d4', 'forty') + 10], [25, 40], {...clamp, easing: ease});
	const heatPain = ramp(frame, L.d4.from + 30, deadAt - 16);
	const recover = ramp(frame, wordAt('d8', 'recover'), L.d8.to, (x) => x);
	const u = {...mixLand(LAND.dying, {...LAND.cretaceous, uLandType: 3}, recover * 0.6), uPan: (frame - landAt) * 0.002};
	return (
		<SectionFrame from={sec.from} to={sec.to} desat={deathDesat(frame, deadAt) * (1 - recover)}>
			{frame < landAt ? (
				<AbsoluteFill>
					<Shader frag={MAGMA} scale={BG_SCALE} uniforms={{uHorizon: -0.1, uCamH: 1.3, uPan: (frame - sec.from) * 0.004, uHeat: 0.15, uZoom: 1 + (frame - sec.from) * 0.0002, uFocus: [0, 0]}} />
					<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(20,10,10,0.35), transparent 40%)'}} />
					<Title at={L.d1.from - 4} until={L.d2.from + 10} text="THEY DON'T." size={130} />
					<Callout at={wordAt('d2', 'Siberia')} x={900} y={760} dx={140} dy={-230} title="SIBERIAN TRAPS" sub="eruptions lasting hundreds of thousands of years" color="#ffb04a" />
					<div style={{position: 'absolute', left: 120, top: 200}}>
						<Badge at={wordAt('d2', 'continent')} until={L.d3.from} text="LAVA THE SIZE OF A CONTINENT" rot={-3} bg="#ffb04a" size={40} />
					</div>
					<CO2 from={L.d3.from - 6} to={landAt} />
				</AbsoluteFill>
			) : (
				<AbsoluteFill style={{filter: `blur(${heatPain * 1.2}px)`}}>
					<Land u={u} />
					{[{x: 320, y: 760, s: 0.6}, {x: 1540, y: 740, s: 0.5}, {x: 1750, y: 880, s: 1.0}, {x: 150, y: 930, s: 1.1}].map((d, i) => (
						<At key={i} x={d.x} y={d.y} s={d.s} w={220} h={400} style={{opacity: 1 - recover}}>
							<DeadTree seed={`dt${i}`} c="#2a1810" />
						</At>
					))}
					<Actor x={960} y={955} arrive={L.d4.from} collapse={deadAt - 16} light="above" rim="#ffb070" pain={heatPain} breath={0.3 + 0.4 * Math.abs(Math.sin(t * 4)) * heatPain} sway={heatPain * Math.sin(t * 2) * 5} bob={Math.sin(t * 2) * 1.2} />
					{/* sweat drops */}
					{frame < deadAt && heatPain > 0.2 && <Particles n={6} seed="sweat" color="rgba(190,230,255,0.9)" size={9} speed={120} dir={1} area={[900, 480, 120, 120]} opacity={heatPain} />}
					<AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 40%, rgba(255,60,0,${0.35 * heatPain * (1 - recover)}))`}} />
				</AbsoluteFill>
			)}
			{frame >= landAt && (
				<>
					<div style={{position: 'absolute', left: 110, top: 240}}>
						<Thermo temp={temp} min={-20} max={60} label="SEA SURFACE, NEAR THE EQUATOR" appear={ramp(frame, L.d4.from + 10, L.d4.from + 24) * (1 - ramp(frame, L.d5.from, L.d5.from + 12))} />
					</div>
					<Callout at={wordAt('d4', 'bath')} x={380} y={560} dx={160} dy={-80} title="HOT BATH" sub="…the whole ocean" color="#ff8a5a" />
					{frame >= L.d5.from - 10 && frame < L.d6.to && (
						<div style={{position: 'absolute', right: 90, top: 170, opacity: interpolate(frame, [L.d6.to - 12, L.d6.to], [1, 0], clamp)}}>
							<SpeciesGrid at={wordAt('d5', 'ninety') - 20} share={0.9} label="MARINE SPECIES LOST" cols={16} rows={8} />
						</div>
					)}
					<div style={{position: 'absolute', left: 110, top: 300}}>
						<Stat at={wordAt('d6', 'worst')} until={L.d7.from - 4} value="#1" label="WORST MASS EXTINCTION" color="#ff6a5d" size={130} />
					</div>
					<Title at={wordAt('d8', 'reptiles') - 10} until={sec.to} text="A NEW WORLD" sub="RULED BY REPTILES" size={110} y={-200} />
				</>
			)}
			<Flash at={landAt} color="#ffb070" len={10} peak={0.5} />
			<Vignette strength={0.55} />
		</SectionFrame>
	);
};

/* =============================================================== LATE CRETACEOUS */
const Asteroid: React.FC = () => {
	const frame = useCurrentFrame();
	const L = LN;
	const hit = L.t7.from - 6;
	const E: [number, number, number] = [0.12, -0.08, 0.34];
	const C: [number, number] = [E[0] - 0.13, E[1] + 0.1];
	const from = L.t6.from - 20;
	const p = interpolate(frame, [from, hit], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const ax = interpolate(p, [0, 1], [-0.62, C[0]]);
	const ay = interpolate(p, [0, 1], [0.42, C[1]]);
	const zoom = interpolate(frame, [from, hit, hit + 60], [0.95, 1.25, 1.4], {...clamp, easing: ease});
	const since = (frame - hit) / FPS;
	const px = (x: number, y: number) => ({x: 960 + (x - 0.02) * zoom * 1080, y: 540 - (y - 0.02) * zoom * 1080});
	const a = px(ax, ay);
	const c = px(C[0], C[1]);
	return (
		<AbsoluteFill style={{transform: frame >= hit ? shake(frame, hit, 40, 16) : undefined}}>
			<Space zoom={zoom} cx={0.02} cy={0.02} earth={E} rock={[ax, ay, frame < hit ? 0.018 : 0]} contact={C} impact={frame < hit ? -1 : since * 0.6} mode={4} spin={1.9 + frame * 0.0006} />
			{/* glowing tail */}
			{frame < hit && (
				<svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width="1" height="1">
					<line x1={a.x} y1={a.y} x2={a.x - 260} y2={a.y - 160} stroke="url(#tail)" strokeWidth="10" strokeLinecap="round" />
					<defs>
						<linearGradient id="tail" gradientUnits="userSpaceOnUse" x1={a.x} y1={a.y} x2={a.x - 260} y2={a.y - 160}>
							<stop offset="0" stopColor="#ffd79a" stopOpacity="0.9" />
							<stop offset="1" stopColor="#ffd79a" stopOpacity="0" />
						</linearGradient>
					</defs>
				</svg>
			)}
			{frame < hit && <Callout at={wordAt('t6', 'asteroid')} x={a.x} y={a.y} dx={120} dy={170} title="ASTEROID" sub="about 10 km wide" color="#ffd79a" />}
			{frame < hit && <Callout at={wordAt('t6', 'Mexico')} x={c.x} y={c.y} dx={220} dy={120} title="WHAT IS NOW MEXICO" sub="the Chicxulub crater" color="#9fd8ff" />}
			<Flash at={hit} color="#fff4dd" len={14} peak={1} />
		</AbsoluteFill>
	);
};

export const Cretaceous: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = SEC.cretaceous;
	const t = useT();
	const L = LN;
	const deadAt = DEAD_AT.cretaceous!;
	const spaceAt = L.t6.from - 20;
	const backAt = L.t8.from - 20;
	const inSpace = frame >= spaceAt && frame < backAt;
	const evening = ramp(frame, L.t5.from - 30, L.t5.from + 30);
	const red = ramp(frame, backAt, L.t8.from + 60);
	const dark = ramp(frame, L.t9.from, wordAt('t9', 'die') + 20);
	const ancestors = ramp(frame, L.t12.from, L.t12.to);
	const skyRed: [number, number, number] = [0.9, 0.3, 0.1];
	const base = {...LAND.cretaceous, uPan: (frame - sec.from) * 0.0015};
	const u = {
		...base,
		uDark: evening * 0.15 * (1 - red) + dark * 0.72 - ancestors * 0.25,
		uSkyTop: red > 0 ? ([0.1 + 0.3 * red, 0.3 - 0.2 * red, 0.6 - 0.5 * red] as [number, number, number]) : base.uSkyTop,
		uSkyHor: red > 0 ? ([0.62 + (skyRed[0] - 0.62) * red, 0.78 + (skyRed[1] - 0.78) * red, 0.88 + (skyRed[2] - 0.88) * red] as [number, number, number]) : base.uSkyHor,
		uFog: red > 0 ? ([0.6 + 0.2 * red, 0.72 - 0.4 * red - 0.2 * dark, 0.8 - 0.6 * red] as [number, number, number]) : base.uFog,
		uLava: red * 0.8 * (1 - dark * 0.5),
		uLavaCol: [1.0, 0.35, 0.08] as [number, number, number],
		uSunSize: red > 0 ? 0 : base.uSunSize,
		uLand: dark > 0 ? ([0.12 + 0.1 * dark, 0.28 - 0.14 * dark, 0.08] as [number, number, number]) : base.uLand,
		uLand2: dark > 0 ? ([0.3, 0.42 - 0.18 * dark, 0.12] as [number, number, number]) : base.uLand2,
		uSnow: dark * 0.8,
		uClouds: base.uClouds + dark * 0.4,
		uCloudCol: dark > 0 ? ([0.3, 0.28, 0.27] as [number, number, number]) : base.uCloudCol,
	};
	const marks = Math.floor(interpolate(frame, [L.t2.from, L.t4.from + 20], [3, 60], clamp));
	const rex = spring({frame: frame - wordAt('t3', 'teeth') + 12, fps: FPS, config: {damping: 14, stiffness: 120}});
	const rexOut = interpolate(frame, [L.t3.to + 10, L.t3.to + 30], [1, 0], clamp);
	const scared = frame >= wordAt('t3', 'teeth') - 12 && frame < L.t3.to + 20;
	const starP = spring({frame: frame - wordAt('t5', 'star'), fps: FPS, config: {damping: 20}});
	const herdX = (frame - sec.from) * 0.5;
	return (
		<SectionFrame from={sec.from} to={sec.to} desat={deathDesat(frame, deadAt) * (1 - ancestors)}>
			{inSpace ? (
				<Asteroid />
			) : (
				<AbsoluteFill style={{transform: frame >= backAt && frame < backAt + 40 ? shake(frame, backAt, 20, 14) : undefined}}>
					<Land u={u} />
					{/* the new star */}
					{frame >= wordAt('t5', 'star') - 4 && frame < spaceAt && (
						<div style={{position: 'absolute', left: 560 - 60, top: 170 - 60, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,240,210,0.9) 8%, rgba(255,220,170,0.25) 30%, transparent 70%)', transform: `scale(${starP * (1 + 0.1 * Math.sin(t * 9))})`}} />
					)}
					{/* distant herd */}
					{frame < backAt &&
						[0, 1, 2].map((i) => (
							<At key={i} x={300 + i * 190 + herdX + (i === 1 ? 40 : 0)} y={775 + i * 10} s={0.3 + i * 0.04} w={420} h={231}>
								<Triceratops t={t + i} step={1} />
							</At>
						))}
					{frame < backAt && (
						<>
							<At x={1480} y={880} w={380} h={266}>
								<Hut />
							</At>
							<At x={1160} y={960} s={0.75} w={260} h={156}>
								<TallyRock marks={marks} />
							</At>
						</>
					)}
					{/* ancestors: a small mammal digs out of the ash */}
					{frame >= L.t12.from - 10 && (
						<At x={interpolate(frame, [L.t12.from, L.t12.to + 20], [620, 760], clamp)} y={1010} s={ramp(frame, L.t12.from - 10, L.t12.from + 10) * 1.1} w={200} h={120}>
							<Mammal t={t} />
						</At>
					)}
					<Actor
						x={frame < backAt ? 900 : 960}
						y={955}
						arrive={L.t2.from}
						collapse={deadAt - 16}
						light="above"
						rim={red > 0.3 ? '#ff8a4a' : '#fff0d8'}
						pose={scared ? 'cross' : 'down'}
						pain={scared ? 0.6 : red * 0.5 + dark * 0.4}
						look={scared ? -1 : frame >= L.t5.from - 10 && frame < spaceAt ? -0.8 : 0}
						smile={frame > L.t4.from && frame < L.t5.from ? 0.9 : frame < L.t3.from ? 0.4 : 0}
						bob={Math.sin(t * 2) * 1.2}
					/>
					{frame >= L.t3.from && rexOut > 0 && (
						<div style={{position: 'absolute', left: -560 + rex * 420, top: 520, opacity: rexOut}}>
							<TRexHead w={620} open={0.3 + 0.3 * Math.max(0, Math.sin(t * 3))} />
						</div>
					)}
					{/* falling debris streaks */}
					{red > 0 && dark < 0.8 && (
						<AbsoluteFill style={{opacity: red * (1 - dark)}}>
							{new Array(18).fill(0).map((_, i) => {
								const r = (k: string) => random(`db${k}${i}`);
								const p = ((frame * (0.012 + r('s') * 0.01) + r('o')) % 1);
								const x = r('x') * 2200 - 200 + p * 500;
								const y = -100 + p * 900;
								return <div key={i} style={{position: 'absolute', left: x, top: y, width: 4, height: 140, background: 'linear-gradient(180deg, transparent, #ffd79a)', transform: 'rotate(-28deg)', filter: 'blur(1px)', boxShadow: '0 0 12px #ff9a40'}} />;
							})}
						</AbsoluteFill>
					)}
				</AbsoluteFill>
			)}
			{!inSpace && (
				<>
					<div style={{position: 'absolute', left: 120, right: 120, top: 190}}>
						{frame >= L.t2.from && frame < L.t3.from + 10 && (
							<Checklist
								columns={3}
								items={[
									{label: 'Fishing', ok: true, at: wordAt('t2', 'fish')},
									{label: 'Safe plants', ok: true, at: wordAt('t2', 'plants')},
									{label: 'Hiding', ok: true, at: wordAt('t3', 'avoid')},
								]}
							/>
						)}
					</div>
					<Callout at={wordAt('t3', 'snack')} x={940} y={560} dx={160} dy={-150} title="SNACK-SIZED" sub="to anything with big teeth" color="#ff9a7a" />
					<div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center'}}>
						<Badge at={wordAt('t4', 'best')} until={L.t5.from} text="YOUR BEST RUN" rot={-3} bg="#3ddc84" size={60} />
					</div>
					<Callout at={wordAt('t5', 'star')} x={560} y={170} dx={160} dy={80} title="A NEW STAR?" color="#ffe8c0" />
					<Callout at={wordAt('t8', 'sky') + 10} x={1300} y={300} dx={-100} dy={-100} title="GLOWING SKY" sub="debris re-entering the atmosphere" color="#ffb04a" />
					{frame >= L.t9.from && frame < L.t10.from + 10 && (
						<div style={{position: 'absolute', left: 120, right: 120, top: 190, opacity: interpolate(frame, [L.t10.from - 10, L.t10.from + 4], [1, 0], clamp)}}>
							<Checklist
								columns={3}
								items={[
									{label: 'Plants', ok: false, at: wordAt('t9', 'plants')},
									{label: 'Plant-eaters', ok: false, at: wordAt('t9', 'eat')},
									{label: 'Their predators', ok: false, at: L.t9.words[L.t9.words.length - 3].f},
								]}
							/>
						</div>
					)}
					{frame >= L.t10.from - 10 && frame < L.t11.from + 20 && (
						<div style={{position: 'absolute', right: 90, top: 170, opacity: interpolate(frame, [L.t11.from, L.t11.from + 20], [1, 0], clamp)}}>
							<SpeciesGrid at={L.t10.from - 10} share={0.75} label="ALL SPECIES LOST" cols={16} rows={8} />
						</div>
					)}
					<Callout at={wordAt('t12', 'furry')} x={700} y={960} dx={170} dy={-170} title="OUR ANCESTORS" sub="small, furry survivors" color="#ffd79a" />
					<Flash at={backAt} color="#ff8a4a" len={12} peak={0.6} />
				</>
			)}
			<Vignette strength={0.5} />
		</SectionFrame>
	);
};
