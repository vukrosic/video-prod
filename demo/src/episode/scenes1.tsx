// Rules, Hadean, Archean, Great Oxidation.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame} from 'remotion';
import {Callout, FONT, Flash, Vignette} from '../fx';
import {MicrobeLens, Stromatolites, Cyano, BandedIron} from './art';
import {Actor, AirBar, Badge, Land, Particles, Sea, SectionFrame, deathDesat, horizonPx, useT} from './common';
import {FPS, LAND, LN, SEC, clamp, mixLand, ramp, wordAt} from './lib';
import {Checklist, DEAD_AT, DeepBar, Gauge, TimerCard} from './ui';

const ease = Easing.inOut(Easing.cubic);

/* =============================================================== RULES */
const RuleCard: React.FC<{n: number; at: number; out: number; title: string; sub?: string; children?: React.ReactNode}> = ({n, at, out, title, sub, children}) => {
	const frame = useCurrentFrame();
	if (frame < at) return null;
	const s = spring({frame: frame - at, fps: FPS, config: {damping: 15, stiffness: 170}});
	const o = interpolate(frame, [out, out + 12], [1, 0], clamp);
	return (
		<div
			style={{
				fontFamily: FONT,
				opacity: Math.min(s, o),
				transform: `translateX(${(1 - s) * 80 + (1 - o) * 80}px)`,
				background: 'rgba(12,16,26,0.72)',
				border: '1.5px solid rgba(255,255,255,0.14)',
				borderRadius: 24,
				padding: '22px 30px',
				backdropFilter: 'blur(10px)',
				marginBottom: 22,
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
				<span style={{width: 50, height: 50, borderRadius: 25, background: '#ffd79a', color: '#141414', fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{n}</span>
				<div>
					<div style={{color: 'white', fontSize: 38, fontWeight: 800, letterSpacing: 1}}>{title}</div>
					{sub && <div style={{color: 'rgba(255,255,255,0.65)', fontSize: 22, fontWeight: 600, marginTop: 2}}>{sub}</div>}
				</div>
			</div>
			{children && <div style={{marginTop: 18}}>{children}</div>}
		</div>
	);
};

export const Rules: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = SEC.rules;
	const t = useT();
	const {r1, r2, r3, r4, r5, r6} = LN;
	const cardsOut = r5.from - 6;
	const clockStart = wordAt('r4', 'start');
	const clockStop = wordAt('r4', 'stop');
	const clockSec = frame < clockStart ? 0 : Math.min(frame, clockStop) - clockStart;
	const barIn = spring({frame: frame - r5.from - 4, fps: FPS, config: {damping: 16, stiffness: 140}});
	const green = interpolate(frame, [wordAt('r5', 'pretty'), wordAt('r5', 'humans', true) + 10], [0, 1], {...clamp, easing: ease});
	const wrong = frame >= r6.from;
	const wrongP = spring({frame: frame - r6.from, fps: FPS, config: {damping: 8, stiffness: 300}});
	const shakeX = wrong ? Math.sin(frame * 3.1) * 14 * Math.exp(-(frame - r6.from) / 8) : 0;
	const charX = interpolate(frame, [r5.from - 10, r5.from + 20], [520, 960], {...clamp, easing: ease});
	const title = spring({frame: frame - r1.from, fps: FPS, config: {damping: 14}});
	const titleOut = interpolate(frame, [r5.from - 10, r5.from + 4], [1, 0], clamp);
	return (
		<SectionFrame from={sec.from} to={sec.to}>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 40% 60%, #243150 0%, #111726 55%, #06080d 100%)'}} />
			{/* blueprint grid */}
			<AbsoluteFill
				style={{
					backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
					backgroundSize: '80px 80px',
					backgroundPosition: `${-frame * 0.4}px ${frame * 0.2}px`,
					maskImage: 'radial-gradient(ellipse at 50% 60%, black 20%, transparent 75%)',
				}}
			/>
			<Particles n={40} seed="rules" color="rgba(180,210,255,0.5)" size={4} speed={14} blur={1} />
			{/* floor glow */}
			<div style={{position: 'absolute', left: charX - 260, top: 900, width: 520, height: 90, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,210,150,0.35), transparent 70%)'}} />
			<Actor x={charX} y={940} arrive={r1.from} light="above" rim="#9cc8ff" smile={wrong ? 0 : green} pain={wrong ? 0.35 * wrongP : 0} look={frame > r2.from && frame < cardsOut ? 1 : 0} pose={green > 0.5 && !wrong ? 'up' : 'down'} bob={Math.sin(t * 2) * 1.5} />
			<div style={{position: 'absolute', left: 120, top: 90, opacity: title * titleOut, fontFamily: FONT, fontSize: 30, fontWeight: 800, letterSpacing: 12, color: '#ffd79a'}}>THE RULES</div>
			<div style={{position: 'absolute', left: 900, top: 150, width: 860}}>
				<RuleCard n={1} at={r2.from} out={cardsOut} title="Come as you are">
					<Checklist
						columns={2}
						items={[
							{label: 'T-shirt & jeans', ok: true, at: wordAt('r2', 'normal')},
							{label: 'Tools', ok: false, at: wordAt('r2', 'tools')},
							{label: 'Food', ok: false, at: wordAt('r2', 'food')},
							{label: 'Spacesuit', ok: false, at: wordAt('r2', 'spacesuit')},
						]}
					/>
				</RuleCard>
				<RuleCard n={2} at={r3.from} out={cardsOut} title="You arrive on land" sub="or the closest thing to land that exists" />
				<RuleCard n={3} at={r4.from} out={cardsOut} title="The clock">
					<div style={{display: 'flex', gap: 30, alignItems: 'center'}}>
						<TimerCard seconds={clockSec} state={frame >= clockStop ? 'dead' : 'live'} />
						<div style={{color: 'rgba(255,255,255,0.8)', fontSize: 26, fontWeight: 600, lineHeight: 1.4}}>
							starts when you arrive
							<br />
							stops when you die
						</div>
					</div>
				</RuleCard>
			</div>
			{frame >= r5.from && (
				<div style={{position: 'absolute', left: 260, top: 200, width: 1400, opacity: barIn, transform: `translate(${shakeX}px, ${(1 - barIn) * 40}px)`}}>
					<DeepBar ago={0} big width={1400} label="" red={green} fill={wrong ? 'linear-gradient(90deg, #ff3b2f, #ff6a3d)' : 'linear-gradient(90deg, #3ddc84, #8dffb0)'} />
					<div style={{display: 'flex', justifyContent: 'center', marginTop: 40, fontFamily: FONT, fontSize: 40, fontWeight: 800, letterSpacing: 4, color: wrong ? '#ff6a5d' : '#8dffb0', opacity: green}}>
						{wrong ? 'NOPE.' : '4.5 BILLION YEARS OF HUMAN-FRIENDLY PLANET?'}
					</div>
				</div>
			)}
			{wrong && <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 40%, rgba(200,0,0,0.35))', opacity: wrongP}} />}
			<Flash at={r6.from} color="#ff3a2a" len={10} peak={0.4} />
			<Vignette strength={0.6} />
		</SectionFrame>
	);
};

/* =============================================================== HADEAN */
/** A little dial that spins once per (short) day. */
const DayDial: React.FC<{at: number; until: number; label: string; sub: string; speed: number}> = ({at, until, label, sub, speed}) => {
	const frame = useCurrentFrame();
	if (frame < at || frame > until) return null;
	const s = spring({frame: frame - at, fps: FPS, config: {damping: 14}});
	const o = interpolate(frame, [until - 10, until], [1, 0], clamp);
	const a = ((frame - at) / FPS) * speed * 360;
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 24, fontFamily: FONT, opacity: Math.min(s, o), transform: `scale(${0.8 + 0.2 * s})`, padding: '18px 28px', borderRadius: 22, background: 'rgba(8,10,14,0.6)', border: '1.5px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)'}}>
			<svg width="120" height="120" viewBox="0 0 120 120">
				<circle cx="60" cy="60" r="56" fill="#0d1624" stroke="rgba(255,255,255,0.4)" strokeWidth="3" />
				<path d="M60 4 A56 56 0 0 1 60 116 Z" fill="#1a2a44" />
				<circle cx={60 + Math.sin((a * Math.PI) / 180) * 40} cy={60 - Math.cos((a * Math.PI) / 180) * 40} r="10" fill="#ffd79a" />
				<circle cx={60 - Math.sin((a * Math.PI) / 180) * 40} cy={60 + Math.cos((a * Math.PI) / 180) * 40} r="7" fill="#cfd6e0" />
				<circle cx="60" cy="60" r="16" fill="#3a6aa0" />
			</svg>
			<div>
				<div style={{fontSize: 40, fontWeight: 800, color: 'white'}}>{label}</div>
				<div style={{fontSize: 22, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: 2}}>{sub}</div>
			</div>
		</div>
	);
};

export const Hadean: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = SEC.hadean;
	const t = useT();
	const L = LN;
	const deadAt = DEAD_AT.hadean!;
	// camera tilt: slightly down at the shore, up to the Moon on h2, back down on h4
	const tiltUp = ramp(frame, L.h2.from - 16, L.h2.from + 40);
	const tiltDown = ramp(frame, L.h4.from - 10, L.h4.from + 40);
	const H = 0.12 + (-0.34 - 0.12) * tiltUp * (1 - tiltDown) + (-0.08 - 0.12) * tiltDown;
	const dy = horizonPx(H) - horizonPx(-0.08);
	const tide = frame > L.h4.from ? Math.sin(((frame - L.h4.from) / FPS) * 1.9) : 0;
	const tideAmp = ramp(frame, L.h4.from, L.h4.from + 30) * (1 - ramp(frame, L.h5.from, L.h5.from + 40));
	const u = {
		...LAND.hadean,
		uHorizon: H,
		uPan: (frame - sec.from) * 0.004,
		uMoonPos: [0.33 - (frame - sec.from) * 0.00002, 0.3 + (H + 0.08)] as [number, number],
		uCoast: 8.5 - 3.6 * (0.5 + 0.5 * tide) * tideAmp,
	};
	// breath-holding story
	const puff = ramp(frame, wordAt('h5', 'hold'), wordAt('h5', 'hold') + 30) * (1 - ramp(frame, wordAt('h6', 'forces') - 4, wordAt('h6', 'forces') + 4));
	const gasp = ramp(frame, wordAt('h6', 'forces'), wordAt('h6', 'forces') + 10);
	const pain = Math.max(ramp(frame, L.h6.from, wordAt('h6', 'forces')) * 0.5, ramp(frame, L.h7.from, deadAt - 16) * 1);
	const faint = ramp(frame, wordAt('h7', 'unconscious') - 20, deadAt);
	const collapse = deadAt - 16;
	const charX = 640;
	const charY = 950 + dy;
	const moonX = 960 + u.uMoonPos[0] * 1080;
	const moonY = 540 - u.uMoonPos[1] * 1080;
	const todayMoon = spring({frame: frame - wordAt('h3', 'several'), fps: FPS, config: {damping: 14}});
	return (
		<SectionFrame from={sec.from} to={sec.to} desat={deathDesat(frame, deadAt)}>
			<Land u={u} />
			<Actor
				x={charX}
				y={charY}
				arrive={L.h1.from}
				collapse={collapse}
				rim="#9fb8c8"
				light="above"
				look={frame < L.h2.from ? Math.sin(t * 0.9) : 0.4}
				smile={ramp(frame, wordAt('h5', 'beautiful'), wordAt('h5', 'beautiful') + 10) * (1 - puff)}
				puff={puff}
				breath={gasp * (1 - pain * 0.3)}
				pain={pain}
				sway={faint * Math.sin(t * 3) * 6}
				bob={Math.sin(t * 2) * 1.2}
			/>
			{/* today's Moon for scale */}
			{frame >= wordAt('h3', 'several') && frame < L.h4.from + 20 && (
				<svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: todayMoon * interpolate(frame, [L.h4.from, L.h4.from + 20], [1, 0], clamp)}} width="1" height="1">
					<circle cx={moonX - 560} cy={moonY + 60} r={80 * todayMoon} fill="rgba(255,255,255,0.08)" stroke="white" strokeWidth="3" strokeDasharray="10 8" />
					<text x={moonX - 560} y={moonY + 190} fill="white" fontFamily="Inter" fontWeight="800" fontSize="26" textAnchor="middle" letterSpacing="3">
						TODAY'S MOON
					</text>
				</svg>
			)}
			<Callout at={wordAt('h1', 'ground')} x={1260} y={930 + dy} dx={90} dy={-140} title="SOLID GROUND" sub="cooled crust" />
			<Callout at={wordAt('h1', 'oceans')} x={1500} y={700 + dy} dx={-80} dy={-160} title="OCEANS" sub="the first seas" color="#9fd8ff" />
			{frame > L.h2.from + 20 && frame < L.h4.from && <Callout at={L.h3.from} x={moonX - 200} y={moonY + 150} dx={-160} dy={140} title="THE MOON" sub="much closer than today" color="#e8eef6" />}
			<div style={{position: 'absolute', left: 90, bottom: 190}}>
				<DayDial at={wordAt('h4', 'Earth')} until={L.h5.from} label="1 DAY < 24 H" sub="EARTH SPINS FAST" speed={1.4} />
			</div>
			{tideAmp > 0.05 && <Callout at={wordAt('h4', 'tides')} x={900} y={760} dx={120} dy={-140} title="HUGE TIDES" sub="pulled by the nearby Moon" color="#9fd8ff" />}
			<div style={{position: 'absolute', right: 90, bottom: 200}}>
				<AirBar
					at={wordAt('h5', 'mostly')}
					until={L.h6.to + 10}
					o2="0%"
					parts={[
						{label: 'CO₂', v: 55, color: '#ffb04a'},
						{label: 'N₂', v: 45, color: '#7ab8ff'},
					]}
				/>
			</div>
			<Callout at={wordAt('h7', 'pulls')} x={charX + 10} y={charY - 300} dx={170} dy={-80} title="O₂ LEAVES YOUR BLOOD" sub="breathing makes it worse" color="#ff8a7a" />
			<div style={{position: 'absolute', left: 1180, top: 420}}>
				<Badge at={wordAt('h8', 'improvement')} text="120× LONGER" rot={-5} />
			</div>
			{/* blackout as you pass out */}
			<AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent ${60 - faint * 50}%, rgba(0,0,0,${faint * 0.95}) 100%)`}} />
			<Vignette strength={0.5} />
		</SectionFrame>
	);
};

/* =============================================================== ARCHEAN */
export const Archean: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = SEC.archean;
	const t = useT();
	const L = LN;
	const deadAt = DEAD_AT.archean!;
	const haze = ramp(frame, wordAt('a4', 'orange') - 20, wordAt('a4', 'orange') + 50);
	const dim = ramp(frame, L.a3.from, L.a3.from + 30) * (1 - ramp(frame, L.a4.from + 40, L.a4.from + 90));
	const u = {...mixLand(LAND.archean, LAND.archeanHaze, haze), uHorizon: -0.08, uPan: (frame - sec.from) * 0.003};
	const puff = ramp(frame, L.a1.from + 20, L.a1.from + 50) * (1 - ramp(frame, L.a5.from - 4, L.a5.from + 4));
	const gasp = ramp(frame, L.a5.from, L.a5.from + 10);
	const pain = Math.max(ramp(frame, L.a3.from, L.a5.from) * 0.45, ramp(frame, L.a5.from + 10, deadAt - 16));
	const lens = spring({frame: frame - wordAt('a2', 'microbes'), fps: FPS, config: {damping: 14}});
	const lensOut = interpolate(frame, [L.a3.from - 10, L.a3.from + 4], [1, 0], clamp);
	const sunX = 960 + u.uSunPos[0] * 1080;
	const sunY = 540 - u.uSunPos[1] * 1080;
	const push = 1 + 0.04 * ramp(frame, sec.from, sec.to, (x) => x);
	return (
		<SectionFrame from={sec.from} to={sec.to} desat={deathDesat(frame, deadAt)}>
			<AbsoluteFill style={{transform: `scale(${push})`}}>
				<Land u={u} style={{filter: `brightness(${1 - dim * 0.22})`}} />
				<div style={{position: 'absolute', left: 1060, top: 690}}>
					<Stromatolites w={520} count={5} />
				</div>
				<div style={{position: 'absolute', left: 250, top: 740}}>
					<Stromatolites w={380} count={4} />
				</div>
				<Actor
					x={1250}
					y={950}
					arrive={L.a1.from}
					collapse={deadAt - 16}
					light="above"
					rim={haze > 0.5 ? '#ffb070' : '#dfe8f0'}
					look={frame < L.a3.from ? -0.8 : 0}
					puff={puff}
					breath={gasp}
					pain={pain}
					bob={Math.sin(t * 2) * 1.2}
				/>
				<div style={{position: 'absolute', left: -120, top: 830}}>
					<Stromatolites w={1000} count={5} />
				</div>
			</AbsoluteFill>
			{frame >= wordAt('a2', 'microbes') && lensOut > 0 && (
				<>
					<svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: lens * lensOut}} width="1" height="1">
						<line x1="330" y1="880" x2="470" y2="560" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
						<circle cx="330" cy="880" r="10" fill="none" stroke="white" strokeWidth="2" />
					</svg>
					<div style={{position: 'absolute', left: 300, top: 150, transform: `scale(${lens})`, opacity: lensOut}}>
						<MicrobeLens t={t} w={420} />
					</div>
				</>
			)}
			<Callout at={wordAt('a2', 'domes')} x={1320} y={780} dx={110} dy={-150} title="STROMATOLITES" sub="mats of microbes, built up layer by layer" />
			<Callout at={wordAt('a2', 'relatives')} x={520} y={380} dx={260} dy={-120} title="YOUR RELATIVES" sub="very, very distant" color="#8dffb0" />
			<Callout at={wordAt('a3', 'Sun')} x={sunX + 20} y={sunY + 20} dx={160} dy={60} title="~75% AS BRIGHT" sub="the faint young Sun" color="#ffe6a8" />
			{frame >= L.a3.from && frame < L.a4.to && (
				<svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', opacity: ramp(frame, L.a3.from + 10, L.a3.from + 30) * (1 - ramp(frame, L.a4.from + 60, L.a4.from + 80))}} width="1" height="1">
					<circle cx={sunX} cy={sunY} r="46" fill="none" stroke="white" strokeWidth="3" strokeDasharray="8 7" />
					<text x={sunX} y={sunY - 62} fill="white" fontFamily="Inter" fontWeight="800" fontSize="22" textAnchor="middle" letterSpacing="3">
						TODAY'S SUN
					</text>
				</svg>
			)}
			<Callout at={wordAt('a4', 'greenhouse')} x={760} y={260} dx={-120} dy={120} title="GREENHOUSE GASES" sub="CO₂ and methane, trapping heat" color="#ffb070" />
			{frame >= wordAt('a4', 'orange') && <Callout at={wordAt('a4', 'orange') + 20} x={1500} y={330} dx={-60} dy={-110} title="METHANE HAZE" sub="an orange sky" color="#ffb070" />}
			<div style={{position: 'absolute', left: 90, bottom: 200}}>
				<AirBar
					at={wordAt('a5', 'air')}
					until={L.a6.from}
					o2="0%"
					parts={[
						{label: 'N₂', v: 70, color: '#7ab8ff'},
						{label: 'CO₂', v: 22, color: '#ffb04a'},
						{label: 'CH₄', v: 8, color: '#ff8a4a'},
					]}
				/>
			</div>
			<Vignette strength={0.5} />
		</SectionFrame>
	);
};

/* =============================================================== GREAT OXIDATION */
const Underwater: React.FC = () => {
	const frame = useCurrentFrame();
	const t = useT();
	const L = LN;
	const lens = spring({frame: frame - wordAt('o4', 'disaster'), fps: FPS, config: {damping: 14}});
	const dying = ramp(frame, wordAt('o4', 'poison') - 10, wordAt('o4', 'poison') + 60);
	const iron = spring({frame: frame - wordAt('o2', 'rocks'), fps: FPS, config: {damping: 16, stiffness: 120}});
	const ironOut = interpolate(frame, [L.o3.from + 20, L.o3.from + 36], [1, 0], clamp);
	const bubbles = 1 + ramp(frame, L.o3.from, L.o3.from + 60) * 2;
	const pan = (frame - SEC.oxidation.from) * 0.006;
	return (
		<AbsoluteFill>
			<Sea pan={pan} water={[0.12, 0.5, 0.45]} deep={[0.01, 0.1, 0.12]} />
			{[
				{x: 180, y: 260, w: 380, s: 'a', d: 0.6},
				{x: 1250, y: 180, w: 300, s: 'b', d: 0.4},
				{x: 760, y: 560, w: 520, s: 'c', d: 1},
				{x: 1450, y: 640, w: 440, s: 'd', d: 0.8},
				{x: 80, y: 700, w: 300, s: 'e', d: 0.5},
			].map((c) => (
				<div key={c.s} style={{position: 'absolute', left: c.x - ((pan * 400 * c.d) % 2400) + (c.x < 600 ? 0 : 0), top: c.y + Math.sin(t * 0.7 + c.x) * 12, filter: c.d < 0.7 ? 'blur(2px)' : undefined, opacity: 0.9}}>
					<Cyano t={t} w={c.w} seed={c.s} bubbles={bubbles} />
				</div>
			))}
			<Particles n={50} seed="oxb" color="rgba(220,255,250,0.55)" size={10} speed={90 * bubbles} dir={-1} />
			{frame >= wordAt('o1', 'oxygen') && <Callout at={wordAt('o1', 'oxygen')} x={960} y={520} dx={140} dy={-150} title="O₂ BUBBLES" sub="waste gas" color="#bff6ff" />}
			<Callout at={wordAt('o1', 'photosynthesis')} x={840} y={640} dx={-140} dy={-150} title="CYANOBACTERIA" sub="the first oxygen makers" color="#8dffb0" />
			{frame >= wordAt('o2', 'rocks') && ironOut > 0 && (
				<div style={{position: 'absolute', left: 1080, top: 300, transform: `translateX(${(1 - iron) * 900}px) rotate(-3deg)`, opacity: ironOut}}>
					<BandedIron w={680} />
					<div style={{fontFamily: FONT, color: 'white', fontSize: 36, fontWeight: 800, marginTop: 16, letterSpacing: 2, textShadow: '0 2px 14px black'}}>BANDED IRON FORMATION</div>
					<div style={{fontFamily: FONT, color: 'rgba(255,255,255,0.8)', fontSize: 22, fontWeight: 600, textShadow: '0 2px 14px black'}}>red stripes of rust, still found in rocks today</div>
				</div>
			)}
			<Callout at={wordAt('o3', 'air')} x={960} y={60} dx={160} dy={170} title="O₂ ESCAPES INTO THE AIR" color="#bff6ff" />
			{frame >= wordAt('o4', 'disaster') && (
				<div style={{position: 'absolute', left: 1180, top: 250, transform: `scale(${lens})`}}>
					<MicrobeLens t={t} w={460} oxy={1} dying={dying} />
					<div style={{fontFamily: FONT, color: '#ff8a7a', fontSize: 36, fontWeight: 800, marginTop: 14, textAlign: 'center', letterSpacing: 2, opacity: dying, textShadow: '0 2px 14px black'}}>OXYGEN = POISON</div>
				</div>
			)}
			<div style={{position: 'absolute', left: 240, top: 300}}>
				<Badge at={wordAt('o4', 'polluted')} text="THE FIRST POLLUTION?" rot={-4} bg="#ff8a7a" />
			</div>
		</AbsoluteFill>
	);
};

export const Oxidation: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = SEC.oxidation;
	const t = useT();
	const L = LN;
	const deadAt = DEAD_AT.oxidation!;
	const shoreAt = L.o5.from - 14;
	const breath = ramp(frame, wordAt('o5', 'oxygen') - 6, wordAt('o5', 'oxygen') + 8) * (1 - ramp(frame, L.o6.from, L.o6.from + 20));
	const smile = ramp(frame, wordAt('o5', 'oxygen'), wordAt('o5', 'oxygen') + 10) * (1 - ramp(frame, L.o6.from + 30, L.o6.from + 60));
	const pain = ramp(frame, L.o6.from + 60, deadAt - 16);
	const pant = frame > L.o7.from ? (0.5 + 0.5 * Math.sin(t * 7)) * 0.7 : 0;
	const o2 = interpolate(frame, [L.o6.from + 10, wordAt('o6', 'percent') + 10], [0, 1], {...clamp, easing: ease});
	const gaugeIn = spring({frame: frame - L.o6.from, fps: FPS, config: {damping: 16}});
	const gaugeOut = interpolate(frame, [L.o8.from, L.o8.from + 12], [1, 0], clamp);
	return (
		<SectionFrame from={sec.from} to={sec.to} desat={deathDesat(frame, deadAt)}>
			{frame < shoreAt ? (
				<Underwater />
			) : (
				<AbsoluteFill>
					<Land u={{...LAND.oxidation, uPan: (frame - shoreAt) * 0.003}} />
					<Actor x={820} y={950} arrive={L.o5.from} collapse={deadAt - 16} light="above" rim="#ffe0c0" breath={Math.max(breath, pant)} smile={smile} pain={pain} sway={pain * Math.sin(t * 2.5) * 5} bob={Math.sin(t * 2) * 1.2} />
					<div style={{position: 'absolute', left: 1020, top: 180, width: 820, display: 'flex', justifyContent: 'flex-end', opacity: gaugeOut}}>
						{frame >= L.o6.from && (
							<Gauge
								title="OXYGEN IN THE AIR"
								max={25}
								value={o2}
								appear={gaugeIn}
								marks={[
									{v: 21, label: 'TODAY 21%'},
									...(frame >= wordAt('o7', 'Everest') ? [{v: 7, label: 'EVEREST ≈7%', color: '#ffd79a'}] : []),
								]}
							/>
						)}
					</div>
					<Callout at={wordAt('o5', 'oxygen')} x={960} y={520} dx={150} dy={-150} title="THERE'S OXYGEN!" sub="just not much" color="#8dffb0" />
					<Flash at={shoreAt} color="#fff2d6" len={10} peak={0.5} />
				</AbsoluteFill>
			)}
			<Vignette strength={0.5} />
		</SectionFrame>
	);
};
