// Last Ice Age, Today, end card.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame} from 'remotion';
import {Callout, FONT, Flash, Vignette} from '../fx';
import {Campfire, Germ, HistoryClock, LivingRoom, Mammoth} from './art';
import {Actor, At, Badge, Land, SectionFrame, Space, Title, useT} from './common';
import {EP, FPS, LAND, LN, SEC, clamp, mixLand, ramp, wordAt} from './lib';
import {Checklist, Stat, TimerCard} from './ui';

const ease = Easing.inOut(Easing.cubic);

/* =============================================================== ICE AGE */
const PEOPLE = [
	{x: 1330, s: 0.9, coat: '#7a5230', skin: ['#c98a62', '#b07650'] as [string, string], hair: '#1a1210', flip: true},
	{x: 1560, s: 0.82, coat: '#6a4428', skin: ['#8d5a3c', '#744830'] as [string, string], hair: '#120c08', flip: true},
	{x: 1760, s: 0.95, coat: '#86603a', skin: ['#e8b48e', '#d19a74'] as [string, string], hair: '#4a2a18', flip: true},
];

export const IceAge: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = SEC.iceage;
	const t = useT();
	const L = LN;
	const u = {...LAND.iceage, uPan: (frame - sec.from) * 0.0015};
	const peopleIn = L.i4.from - 20;
	const coatOn = L.i5.from + 20;
	const twist = ramp(frame, L.i6.from, L.i6.from + 30) * (1 - ramp(frame, L.i8.from - 10, L.i8.from + 20));
	const spread = ramp(frame, L.i7.from, wordAt('i7', 'immune'), (x) => x);
	const sick = ramp(frame, wordAt('i7', 'measles'), wordAt('i7', 'immune'));
	const mamX = (frame - sec.from) * 0.9;
	return (
		<SectionFrame from={sec.from} to={sec.to}>
			<Land u={u} style={{filter: `saturate(${1 - twist * 0.4}) brightness(${1 - twist * 0.15})`}} />
			{[
				{x: 200, y: 700, s: 0.42, st: 0.8},
				{x: 520, y: 690, s: 0.34, st: 0.8},
				{x: 380, y: 720, s: 0.55, st: 1},
			].map((m, i) => (
				<At key={i} x={m.x + mamX * (0.6 + i * 0.15)} y={m.y} s={m.s} w={420} h={294}>
					<Mammoth t={t + i * 1.3} step={m.st} c={i === 1 ? '#4a3020' : '#5a3a24'} />
				</At>
			))}
			{frame >= coatOn - 10 && (
				<At x={1150} y={1000} w={160} h={200}>
					<Campfire t={t} w={140} />
				</At>
			)}
			{PEOPLE.map((p, i) => {
				const at = peopleIn + i * 8;
				if (frame < at) return null;
				const walk = interpolate(frame, [at, at + 50], [260, 0], {...clamp, easing: Easing.out(Easing.cubic)});
				return (
					<Actor
						key={i}
						uid={`p${i}`}
						x={p.x + walk}
						y={945 + i * 6}
						s={p.s}
						flip={p.flip}
						coat={p.coat}
						skin={p.skin}
						hair={p.hair}
						light="above"
						rim="#fff0d8"
						pain={sick * (0.4 + 0.2 * i)}
						smile={frame > L.i5.from && sick < 0.1 ? 0.6 : frame > L.i8.from + 20 ? 0.5 : 0}
						pose={walk > 1 ? 'run' : 'down'}
						phase={frame * 0.3}
						bob={Math.sin(t * 2 + i) * 1.2}
					/>
				);
			})}
			<Actor
				x={800}
				y={955}
				arrive={L.i3.from}
				light="above"
				rim="#fff0d8"
				coat={frame >= coatOn ? '#6f4a2c' : undefined}
				frost={frame < coatOn ? ramp(frame, L.i3.from + 10, L.i3.from + 60) * 0.25 : 0}
				look={frame > peopleIn && frame < L.i6.from ? 1 : 0}
				smile={frame > L.i5.from ? 0.7 * (1 - twist) : 0}
				pain={frame < coatOn ? 0.2 : 0}
				bob={frame < coatOn ? Math.sin(frame * 2.3) * 1.5 : Math.sin(t * 2) * 1.2}
			/>
			{/* germs drifting from you to them */}
			{twist > 0.02 &&
				new Array(10).fill(0).map((_, i) => {
					const r = (k: string) => random(`gm${k}${i}`);
					const target = PEOPLE[i % 3];
					const p = Math.min(1, Math.max(0, spread * 1.6 - r('d') * 0.6));
					const x = 800 + (target.x - 800) * p + Math.sin(t * 2 + i) * 30 - 30;
					const y = 620 + r('y') * 200 - Math.sin(p * Math.PI) * 120;
					return (
						<div key={i} style={{position: 'absolute', left: x, top: y, opacity: twist, transform: `scale(${0.6 + r('s') * 0.6})`}}>
							<Germ t={t + i} w={56} c={i % 2 ? '#ff5a8a' : '#ff8a5a'} />
						</div>
					);
				})}
			<Callout at={wordAt('i1', 'Ice')} x={560 + mamX * 0.75} y={560} dx={120} dy={-160} title="WOOLLY MAMMOTHS" color="#e8d8c0" />
			<div style={{position: 'absolute', right: 110, top: 220}}>
				<Stat at={wordAt('i2', 'hundred')} until={L.i3.from + 10} value="−120 M" label="SEA LEVEL VS. TODAY" color="#9fd8ff" size={120} />
			</div>
			<Callout at={wordAt('i4', 'humans')} x={1560} y={560} dx={-120} dy={-180} title="HOMO SAPIENS" sub="exactly like you" color="#ffd79a" />
			{frame >= L.i5.from && frame < L.i6.from && (
				<div style={{position: 'absolute', left: 120, right: 120, top: 190, opacity: interpolate(frame, [L.i6.from - 14, L.i6.from - 2], [1, 0], clamp)}}>
					<Checklist
						columns={3}
						items={[
							{label: 'Hunt', ok: true, at: wordAt('i5', 'hunt')},
							{label: 'Make tools', ok: true, at: wordAt('i5', 'tools')},
							{label: 'Build fires', ok: true, at: wordAt('i5', 'fires')},
						]}
					/>
				</div>
			)}
			<div style={{position: 'absolute', left: 0, right: 0, top: 250, display: 'flex', justifyContent: 'center'}}>
				<Badge at={wordAt('i6', 'twist')} until={L.i7.from} text="THE TWIST" rot={-3} bg="#ff5a8a" size={56} />
			</div>
			<Callout at={wordAt('i7', 'measles')} x={1330} y={560} dx={-200} dy={-160} title="MEASLES" sub="probably only a few thousand years old" color="#ff8aa8" />
			<Callout at={wordAt('i7', 'immune')} x={800} y={600} dx={-170} dy={-120} title="YOUR IMMUNE SYSTEM" sub="has seen things theirs never has" color="#ff8aa8" />
			<Vignette strength={0.5} />
		</SectionFrame>
	);
};

/* =============================================================== TODAY */
export const Today: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = SEC.today;
	const t = useT();
	const L = LN;
	const clockAt = L.y2.from - 6;
	const futureAt = L.y6.from - 12;
	const outsideAt = L.y7.from - 16;
	const endAt = L.y8.to + 30;
	const clockIn = spring({frame: frame - clockAt, fps: FPS, config: {damping: 16}});
	const hand = interpolate(frame, [clockAt + 10, L.y3.to], [0, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
	const showRed = ramp(frame, L.y3.from - 4, L.y3.from + 30);
	const showGreen = ramp(frame, L.y4.from, L.y4.from + 30);
	const showHuman = ramp(frame, wordAt('y5', 'five') - 10, wordAt('y5', 'five') + 6);
	const zoomHuman = ramp(frame, L.y5.from, wordAt('y5', 'five') + 10);
	const brighter = ramp(frame, wordAt('y6', 'brighter') - 10, L.y6.to);
	const future = {...mixLand({...LAND.cretaceous, uLandType: 2}, {...LAND.dying, uLava: 0, uCoast: 1000}, brighter), uSunSize: 0.035 + brighter * 0.07, uSunPos: [0.1, 0.28] as [number, number], uHaze: brighter * 0.35, uFog: [0.9, 0.85, 0.75] as [number, number, number]};
	const futureSec = Math.exp(interpolate(frame, [wordAt('y6', 'timer'), L.y6.to], [Math.log(73 * 365 * 86400), 0], {...clamp, easing: Easing.in(Easing.cubic)}));
	const dusk = ramp(frame, outsideAt, L.y8.to, (x) => x);
	const sunset = {...LAND.today, uPan: (frame - outsideAt) * 0.001, uSunPos: [0.35, 0.02 - dusk * 0.05] as [number, number], uStars: 0.3 + dusk * 0.5};
	const inhale = ramp(frame, wordAt('y8', 'air') - 6, wordAt('y8', 'air') + 8) * (1 - ramp(frame, L.y8.to, L.y8.to + 20));
	return (
		<SectionFrame from={sec.from} to={sec.to}>
			{frame < futureAt && (
				<AbsoluteFill>
					<AbsoluteFill style={{filter: `brightness(${1 - clockIn * 0.55}) blur(${clockIn * 4}px)`}}>
						<LivingRoom t={t} />
						<Actor x={960} y={880} arrive={L.y1.from - 20} light="above" rim="#ffcf8a" pose="sit" smile={0.6} shadow={false} bob={Math.sin(t * 2) * 1} />
					</AbsoluteFill>
					{frame >= clockAt && (
						<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
							<div style={{transform: `scale(${(0.7 + 0.3 * clockIn) * (1 + zoomHuman * 1.6)}) translateY(${zoomHuman * 300}px)`, opacity: clockIn}}>
								<HistoryClock p={hand} showRed={showRed} showGreen={showGreen} showHuman={showHuman} size={680} />
							</div>
						</AbsoluteFill>
					)}
					<Callout at={L.y3.from + 20} x={640} y={420} dx={-120} dy={-150} title="NO AIR TO BREATHE" sub="first ~21 hours" color="#ff6a5d" />
					<Callout at={L.y4.from + 20} x={1080} y={250} dx={220} dy={-60} title="SURVIVABLE" sub="last 2–3 hours" color="#8dffb0" />
					{zoomHuman > 0.5 && (
						<div style={{position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center', fontFamily: FONT, fontSize: 56, fontWeight: 900, color: '#ffd79a', opacity: showHuman, textShadow: '0 4px 30px rgba(0,0,0,0.8)'}}>HUMANS: THE LAST ~5 SECONDS</div>
					)}
				</AbsoluteFill>
			)}
			{frame >= futureAt && frame < outsideAt && (
				<AbsoluteFill>
					<Land u={future} />
					<AbsoluteFill style={{background: `radial-gradient(ellipse at 60% 30%, rgba(255,240,200,${brighter * 0.5}), transparent 60%)`}} />
					<div style={{position: 'absolute', left: 0, right: 0, top: 200, display: 'flex', justifyContent: 'center'}}>
						<Stat at={L.y6.from + 20} until={outsideAt} value="~1 BILLION YEARS" label="FROM NOW: TOO HOT FOR OCEANS" color="#ffd79a" size={100} />
					</div>
					{frame >= wordAt('y6', 'timer') && (
						<div style={{position: 'absolute', right: 70, top: 56}}>
							<TimerCard seconds={futureSec} state={futureSec < 2 ? 'dead' : 'live'} />
						</div>
					)}
					<Flash at={futureAt} color="#fff2d6" len={10} peak={0.5} />
				</AbsoluteFill>
			)}
			{frame >= outsideAt && frame < endAt && (
				<AbsoluteFill style={{opacity: interpolate(frame, [endAt - 16, endAt], [1, 0], clamp)}}>
					<Land u={sunset} />
					<Actor x={1060} y={975} light="above" rim="#ffb070" breath={inhale} smile={0.3 + inhale * 0.6} look={-0.6} bob={Math.sin(t * 1.6) * 1} />
					<Title at={wordAt('y8', 'air')} until={endAt} text="ENJOY THE AIR." sub="IT TOOK 4 BILLION YEARS TO MAKE" size={96} y={-280} />
					<Flash at={outsideAt} color="#ffcf9a" len={12} peak={0.35} />
				</AbsoluteFill>
			)}
			{frame >= endAt && <EndCard from={endAt} />}
			<Vignette strength={0.5} />
		</SectionFrame>
	);
};

const EndCard: React.FC<{from: number}> = ({from}) => {
	const frame = useCurrentFrame();
	const s = spring({frame: frame - from - 6, fps: FPS, config: {damping: 14}});
	const s2 = spring({frame: frame - from - 26, fps: FPS, config: {damping: 12}});
	const s3 = spring({frame: frame - from - 50, fps: FPS, config: {damping: 12}});
	const fade = interpolate(frame, [EP.durationFrames - 20, EP.durationFrames - 1], [1, 0], clamp);
	return (
		<AbsoluteFill style={{opacity: fade}}>
			<Space zoom={0.9} cx={-0.35} cy={0} earth={[0, 0, 0.42]} mode={4} spin={2.2 + (frame - from) * 0.003} />
			<AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, transparent 75%)'}} />
			<div style={{position: 'absolute', left: 130, top: 330, fontFamily: FONT}}>
				<div style={{fontSize: 34, fontWeight: 800, letterSpacing: 12, color: '#ffd79a', opacity: s}}>NEXT TIME</div>
				<div style={{fontSize: 92, fontWeight: 900, color: 'white', lineHeight: 1.05, marginTop: 20, opacity: s2, transform: `translateY(${(1 - s2) * 30}px)`, letterSpacing: -2}}>
					How long would you
					<br />
					survive on every planet?
				</div>
				<div style={{display: 'inline-block', marginTop: 50, padding: '18px 38px', borderRadius: 40, background: '#ff3b2f', color: 'white', fontSize: 34, fontWeight: 900, letterSpacing: 4, opacity: s3, transform: `scale(${0.8 + 0.2 * s3})`}}>SUBSCRIBE</div>
			</div>
		</AbsoluteFill>
	);
};
