import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {
	BEAT,
	Callout,
	Captions,
	Character,
	DeepTimeBar,
	E,
	FONT,
	Flash,
	Grain,
	L,
	MagmaTexture,
	Timer,
	Vignette,
	beatPulse,
	shake,
} from './fx';
import timeline from './timeline.json';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Scene boundaries (absolute frames), all derived from the audio timeline.
const A_END = L.hit.from; // void + year counter
const B_END = E.surface; // space impact
const C_END = E.death; // magma surface
const D_END = E.title; // death card
const ARRIVE = L.breath.from; // character materializes, timer starts
// Timer runs in slow motion so it reads exactly 1.00 s at the moment of death.
const SLOWMO = 1 / ((C_END - ARRIVE) / timeline.fps);

/* ---------------- Scene A: "You wake up." + 4.5 billion year counter ---------------- */
const SceneA: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const glow = 0.35 + 0.4 * beatPulse(frame, 5);
	const wake = L.wake;
	const ago = L.ago;
	const wakeOut = interpolate(frame, [ago.from - 4, ago.from + 6], [1, 0], clamp);
	const countStart = ago.from + 2;
	const countEnd = ago.to - 6;
	const p = interpolate(frame, [countStart, countEnd], [0, 1], {...clamp, easing: Easing.bezier(0.2, 0.6, 0.1, 1)});
	const years = Math.round(p * 4_500_000_000);
	const slam = spring({frame: frame - countEnd, fps, config: {damping: 9, stiffness: 300}});
	const counterIn = spring({frame: frame - countStart, fps, config: {damping: 14}});
	// whip-pan out to the next scene
	const whip = interpolate(frame, [A_END - 6, A_END], [0, -2200], {...clamp, easing: Easing.in(Easing.cubic)});

	return (
		<AbsoluteFill style={{background: '#050304', transform: `${shake(frame, countEnd, 22, 10)} translateX(${whip}px)`, filter: whip ? `blur(${-whip / 120}px)` : undefined}}>
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 55%, rgba(255,90,20,${glow}) 0%, rgba(120,20,5,${glow * 0.5}) 30%, transparent 65%)`}} />
			{/* "YOU WAKE UP." word slams */}
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: wakeOut, transform: `scale(${1 + (1 - wakeOut) * 0.3})`}}>
				<div style={{display: 'flex', gap: 36}}>
					{wake.words.map((w, i) => {
						const s = spring({frame: frame - w.f, fps, config: {damping: 10, stiffness: 320}});
						return (
							<span
								key={i}
								style={{
									fontFamily: FONT,
									fontWeight: 900,
									fontSize: 170,
									color: 'white',
									letterSpacing: -4,
									opacity: s,
									transform: `scale(${interpolate(s, [0, 1], [2.2, 1])})`,
									filter: `blur(${(1 - s) * 18}px)`,
									display: 'inline-block',
								}}
							>
								{w.w.toUpperCase()}
							</span>
						);
					})}
				</div>
			</AbsoluteFill>
			{/* rolling year counter */}
			{frame >= countStart && (
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: counterIn}}>
					<div
						style={{
							fontFamily: FONT,
							fontWeight: 900,
							fontSize: 190,
							color: '#ffb347',
							fontVariantNumeric: 'tabular-nums',
							letterSpacing: -6,
							textShadow: `0 0 ${40 + slam * 60}px rgba(255,120,30,0.9)`,
							transform: `scale(${1 + (frame >= countEnd ? (1 - slam) * 0.35 : 0)})`,
						}}
					>
						{years.toLocaleString('en-US')}
					</div>
					<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: 'white', letterSpacing: 26, marginTop: 10}}>YEARS AGO</div>
				</AbsoluteFill>
			)}
			<Flash at={countEnd} color="#ffb347" len={10} peak={0.6} />
		</AbsoluteFill>
	);
};

/* ---------------- Scene B: Theia hits the young Earth ---------------- */
const Stars: React.FC<{drift: number}> = ({drift}) => {
	const frame = useCurrentFrame();
	return (
		<svg width="1920" height="1080" style={{position: 'absolute'}}>
			{new Array(220).fill(0).map((_, i) => {
				const depth = 0.3 + random(`d${i}`) * 0.7;
				const x = (random(`x${i}`) * 2200 - drift * depth) % 2200;
				const y = random(`y${i}`) * 1080;
				const tw = 0.5 + 0.5 * Math.sin(frame / 6 + i);
				return <circle key={i} cx={x < 0 ? x + 2200 : x} cy={y} r={depth * 2.2} fill="white" opacity={0.35 + tw * 0.5 * depth} />;
			})}
		</svg>
	);
};

const SceneB: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame - A_END;
	const impact = E.impact;
	const zoom = interpolate(frame, [A_END, impact, B_END], [1.25, 1.05, 1.35], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const whipIn = interpolate(frame, [A_END, A_END + 8], [2200, 0], {...clamp, easing: Easing.out(Easing.cubic)});
	// Theia approaches Earth and touches it on the impact frame.
	const ap = interpolate(frame, [A_END, impact], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const earth = {x: 1120, y: 560, r: 300};
	const theia = {x: interpolate(ap, [0, 1], [-60, earth.x - 360]), y: interpolate(ap, [0, 1], [-60, earth.y - 190]), r: 150};
	const hit = frame >= impact;
	const since = frame - impact;
	const ring = interpolate(since, [0, 40], [0, 1800], {...clamp, easing: Easing.out(Easing.cubic)});
	const ringO = interpolate(since, [0, 40], [1, 0], clamp);
	const contact = {x: earth.x - 250, y: earth.y - 165};
	const chroma = hit ? Math.exp(-since / 8) * 14 : 0;

	return (
		<AbsoluteFill style={{background: '#02030a', transform: `translateX(${whipIn}px) ${shake(frame, impact, 60, 14)}`, overflow: 'hidden'}}>
			<Stars drift={t * 3} />
			<AbsoluteFill style={{transform: `scale(${zoom})`, filter: chroma ? `drop-shadow(${chroma}px 0 0 rgba(255,0,60,0.7)) drop-shadow(${-chroma}px 0 0 rgba(0,200,255,0.7))` : undefined}}>
				{/* Earth: molten sphere */}
				<div
					style={{
						position: 'absolute',
						left: earth.x - earth.r,
						top: earth.y - earth.r,
						width: earth.r * 2,
						height: earth.r * 2,
						borderRadius: '50%',
						overflow: 'hidden',
						boxShadow: `0 0 ${120 + (hit ? 200 * Math.exp(-since / 20) : 0)}px rgba(255,100,20,0.75)`,
					}}
				>
					<MagmaTexture width={earth.r * 2} height={earth.r * 2} id="earth" freq="0.012 0.02" seed={5} offset={t * 1.5} />
					<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.15), transparent 45%, rgba(0,0,0,0.75) 80%)'}} />
				</div>
				{/* Theia */}
				{!hit && (
					<>
						<div
							style={{
								position: 'absolute',
								left: theia.x - theia.r - 220 * ap,
								top: theia.y - theia.r - 120 * ap,
								width: theia.r * 2 + 220 * ap,
								height: 26,
								transform: `rotate(28deg)`,
								transformOrigin: 'right center',
								background: 'linear-gradient(90deg, transparent, rgba(255,160,90,0.35))',
								filter: 'blur(8px)',
							}}
						/>
						<div
							style={{
								position: 'absolute',
								left: theia.x - theia.r,
								top: theia.y - theia.r,
								width: theia.r * 2,
								height: theia.r * 2,
								borderRadius: '50%',
								background: 'radial-gradient(circle at 60% 60%, #b9a28a, #6b5646 60%, #2a2018 100%)',
								boxShadow: `0 0 ${40 * ap}px rgba(255,140,60,${ap})`,
							}}
						/>
					</>
				)}
				{/* shockwave + debris */}
				{hit && (
					<svg width="1920" height="1080" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
						<circle cx={contact.x} cy={contact.y} r={ring} fill="none" stroke="#fff4d6" strokeWidth={30 * ringO + 2} opacity={ringO} />
						<circle cx={contact.x} cy={contact.y} r={ring * 0.6} fill="none" stroke="#ffb347" strokeWidth={14 * ringO} opacity={ringO} />
						<circle cx={contact.x} cy={contact.y} r={interpolate(since, [0, 30], [260, 90], clamp)} fill="#fff1c4" opacity={interpolate(since, [0, 30], [1, 0.3], clamp)} style={{filter: 'blur(20px)'}} />
						{new Array(90).fill(0).map((_, i) => {
							const a = -Math.PI * 0.9 + random(`a${i}`) * Math.PI * 1.1;
							const v = 8 + random(`v${i}`) * 26;
							const d = v * since * Math.exp(-since / 60);
							const sz = 3 + random(`s${i}`) * 9;
							return <circle key={i} cx={contact.x + Math.cos(a) * d} cy={contact.y + Math.sin(a) * d} r={sz} fill={random(`c${i}`) > 0.5 ? '#ffd27a' : '#ff6a1a'} opacity={interpolate(since, [0, 50], [1, 0], clamp)} />;
						})}
					</svg>
				)}
			</AbsoluteFill>
			{/* labels */}
			{!hit && <Callout at={L.hit.from + 20} x={earth.x + 210} y={earth.y - 140} dx={170} dy={-110} title="EARTH" sub="age: ~70 million years" />}
			{!hit && <Callout at={L.hit.words[L.hit.words.length - 3].f} x={theia.x} y={theia.y} dx={-120} dy={140} title="THEIA" sub="the size of Mars" color="#9fd3ff" />}
			<Flash at={impact} len={14} />
			<Captions ids={['hit']} />
		</AbsoluteFill>
	);
};

/* ---------------- Scene C: the magma surface ---------------- */
const Embers: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<svg width="1920" height="1080" style={{position: 'absolute', left: 0, top: 0}}>
			{new Array(110).fill(0).map((_, i) => {
				const speed = 2 + random(`es${i}`) * 5;
				const x0 = random(`ex${i}`) * 1920;
				const y = 1100 - ((frame * speed + random(`ey${i}`) * 1200) % 1200);
				const x = x0 + Math.sin(frame / 14 + i) * 30;
				const r = 1.5 + random(`er${i}`) * 4;
				return <circle key={i} cx={x} cy={y} r={r} fill={random(`ec${i}`) > 0.4 ? '#ffcf5a' : '#ff6a1a'} opacity={0.4 + 0.6 * random(`eo${i}`)} style={{filter: 'blur(1px)'}} />;
			})}
		</svg>
	);
};

const SceneC: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = frame - B_END;
	const arrived = frame >= ARRIVE;
	const punch = 1 + 0.025 * beatPulse(frame, 7);
	// wide pan, then push in on the character during the breath
	const push = interpolate(frame, [ARRIVE, C_END], [1, 1.9], {...clamp, easing: Easing.in(Easing.cubic)});
	const panX = interpolate(frame, [B_END, ARRIVE], [140, 0], {...clamp, easing: Easing.out(Easing.cubic)});
	const breath = interpolate(frame, [E.inhale, E.inhale + 24], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	const appear = spring({frame: frame - ARRIVE, fps, config: {damping: 9, stiffness: 220}});
	const timerSec = arrived ? Math.min(1, ((frame - ARRIVE) / fps) * SLOWMO) : 0;
	const redness = interpolate(frame, [E.inhale, C_END], [0, 0.55], clamp);
	const glitch = frame >= C_END - 6;

	return (
		<AbsoluteFill style={{overflow: 'hidden', background: '#1a0503', transform: shake(frame, B_END, 26, 12)}}>
			<AbsoluteFill style={{transform: `translateX(${panX}px) scale(${punch * push})`, transformOrigin: '960px 560px'}}>
				{/* sky */}
				<AbsoluteFill style={{background: 'linear-gradient(180deg, #1c0504 0%, #5a1206 35%, #c2410c 58%, #ff8a2a 66%)'}} />
				{/* drifting haze */}
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: ((t * (1 + i) * 1.2 + i * 600) % 2600) - 700,
							top: 180 + i * 90,
							width: 900,
							height: 160,
							borderRadius: '50%',
							background: 'rgba(255,140,60,0.18)',
							filter: 'blur(40px)',
						}}
					/>
				))}
				{/* magma sea in perspective */}
				<div style={{position: 'absolute', left: -600, top: 690, width: 3120, height: 900, transform: 'perspective(700px) rotateX(58deg)', transformOrigin: 'top center'}}>
					<MagmaTexture width={3120} height={900} id="sea" seed={11} offset={t * 2.2} />
				</div>
				{/* horizon glow */}
				<div style={{position: 'absolute', left: 0, right: 0, top: 640, height: 120, background: 'linear-gradient(180deg, transparent, rgba(255,200,90,0.55), transparent)', filter: 'blur(12px)'}} />
				{/* crust rock the character stands on */}
				<svg width="1920" height="1080" style={{position: 'absolute', left: 0, top: 0}}>
					<path d="M720 905 L820 872 L1010 866 L1150 884 L1210 925 L1120 960 L860 968 L740 945 Z" fill="#170605" stroke="#ff7a1a" strokeWidth="5" />
					<path d="M820 905 L900 915 L980 900" stroke="#ff9a3c" strokeWidth="3" fill="none" opacity="0.7" />
				</svg>
				{/* character */}
				{arrived && (
					<div
						style={{
							position: 'absolute',
							left: 960 - 100,
							top: 880 - 430,
							transform: `scaleY(${appear}) scaleX(${interpolate(appear, [0, 1], [1.8, 1])})`,
							transformOrigin: 'bottom center',
							filter: frame - ARRIVE < 4 ? 'brightness(8)' : undefined,
						}}
					>
						<Character breath={breath} bob={Math.sin(frame / 8) * 1.2} />
					</div>
				)}
				<Embers />
			</AbsoluteFill>
			{/* heat + red vignette as you die */}
			<Vignette strength={0.7} />
			<AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 30%, rgba(200,0,0,${redness}) 100%)`}} />
			{/* HUD callouts before arrival */}
			{!arrived && (
				<>
					<Callout at={B_END + 18} x={560} y={800} dx={-120} dy={-190} title="~2,000°C" sub="magma ocean" />
					<Callout at={L.air.words[5].f} x={1400} y={430} dx={100} dy={-150} title="VAPORIZED ROCK" sub="that's the air" />
				</>
			)}
			{/* HUD */}
			{arrived && (
				<>
					<div style={{position: 'absolute', right: 60, top: 50, transform: `scale(${appear})`, transformOrigin: 'top right'}}>
						<Timer seconds={timerSec} dead={false} />
					</div>
					<div style={{position: 'absolute', left: 60, top: 60, fontFamily: FONT, fontWeight: 900, fontSize: 30, color: 'white', letterSpacing: 4, display: 'flex', alignItems: 'center', gap: 14}}>
						<span style={{width: 22, height: 22, borderRadius: 11, background: '#ff2a2a', opacity: Math.floor(frame / 8) % 2 ? 1 : 0.2}} />
						SLOW MOTION {SLOWMO.toFixed(1)}×
					</div>
				</>
			)}
			<DeepTimeBar progress={0.0} label="4.5 BYA" opacity={arrived ? 0 : interpolate(frame, [B_END + 10, B_END + 20], [0, 1], clamp)} />
			<Captions ids={['air', 'breath']} />
			{/* death glitch: RGB slices */}
			{glitch && (
				<AbsoluteFill style={{mixBlendMode: 'screen'}}>
					{new Array(8).fill(0).map((_, i) => (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: (random(`gl${frame}${i}`) - 0.5) * 200,
								top: random(`gt${frame}${i}`) * 1080,
								width: 1920,
								height: 20 + random(`gh${frame}${i}`) * 80,
								background: i % 2 ? 'rgba(255,0,60,0.5)' : 'rgba(0,220,255,0.4)',
							}}
						/>
					))}
				</AbsoluteFill>
			)}
			<Flash at={B_END} color="#ffb347" len={10} peak={0.8} />
			<Flash at={ARRIVE} len={8} peak={0.7} />
		</AbsoluteFill>
	);
};

/* ---------------- Scene D: death card ---------------- */
const SceneD: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const since = frame - C_END;
	const timerIn = spring({frame: since, fps, config: {damping: 10, stiffness: 240}});
	const skullAt = C_END + BEAT * 2;
	const skull = spring({frame: frame - skullAt, fps, config: {damping: 8, stiffness: 300}});
	const visit = L.visit;
	return (
		<AbsoluteFill style={{background: '#070707', transform: shake(frame, C_END, 30, 8)}}>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 50}}>
				<div style={{transform: `scale(${interpolate(timerIn, [0, 1], [2.5, 1.5])})`, opacity: timerIn}}>
					<Timer seconds={1} dead />
				</div>
				<div style={{display: 'flex', gap: 22, minHeight: 100}}>
					{visit.words
						.filter((w) => frame >= w.f)
						.map((w, i) => {
							const s = spring({frame: frame - w.f, fps, config: {damping: 11, stiffness: 260}});
							return (
								<span key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: 84, color: i === 3 ? '#ffd23f' : 'white', opacity: s, transform: `translateY(${(1 - s) * 30}px)`, display: 'inline-block'}}>
									{w.w}
								</span>
							);
						})}
				</div>
			</AbsoluteFill>
			{frame >= skullAt && (
				<div style={{position: 'absolute', right: 70, top: 60, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: 'white', transform: `scale(${skull})`, transformOrigin: 'top right'}}>
					☠ <span style={{color: '#ff4d4d'}}>×1</span>
				</div>
			)}
			<Flash at={C_END} color="#ff1a1a" len={10} peak={0.9} />
		</AbsoluteFill>
	);
};

/* ---------------- Scene E: title slam over an era montage ---------------- */
const ERAS = [
	{bg: 'radial-gradient(circle at 50% 70%, #ffb347, #c2410c 40%, #1c0504 80%)', tag: '4.5 BILLION YEARS AGO'},
	{bg: 'radial-gradient(circle at 70% 30%, #e8e3d8 0 12%, #1b2a3a 13%, #081018 80%)', tag: '4 BILLION YEARS AGO'},
	{bg: 'linear-gradient(180deg, #e9f4ff, #9cc7e8 60%, #ffffff)', tag: '650 MILLION YEARS AGO'},
	{bg: 'linear-gradient(180deg, #0f3d1e, #2f7a36 55%, #0b2412)', tag: '300 MILLION YEARS AGO'},
	{bg: 'radial-gradient(circle at 25% 25%, #fff3c4 0 4%, #ff8a2a 8%, #3a1a3a 35%, #10081a 80%)', tag: '66 MILLION YEARS AGO'},
	{bg: 'linear-gradient(180deg, #0a1030, #26306a 60%, #f5b04a 100%)', tag: 'TODAY'},
];

const SceneE: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const since = frame - D_END;
	const era = ERAS[Math.floor(since / BEAT) % ERAS.length];
	const punch = 1 + 0.05 * beatPulse(frame, 8);
	const lines = [
		{text: 'HOW LONG WOULD', at: D_END, size: 130, color: 'white'},
		{text: 'YOU SURVIVE', at: D_END + BEAT, size: 190, color: '#ffb347'},
		{text: "IN EVERY ERA OF EARTH'S HISTORY?", at: D_END + BEAT * 2, size: 64, color: 'white'},
	];
	return (
		<AbsoluteFill style={{background: '#000', transform: shake(frame, D_END, 40, 10), overflow: 'hidden'}}>
			<AbsoluteFill style={{background: era.bg, opacity: 0.55, filter: 'blur(6px) saturate(1.3)', transform: `scale(${1.1 * punch})`}} />
			<AbsoluteFill style={{background: 'rgba(0,0,0,0.35)'}} />
			<div style={{position: 'absolute', left: 60, bottom: 50, fontFamily: FONT, fontWeight: 900, fontSize: 28, letterSpacing: 6, color: 'rgba(255,255,255,0.8)'}}>{era.tag}</div>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', transform: `scale(${punch})`}}>
				{lines.map((l, i) => {
					const s = spring({frame: frame - l.at, fps, config: {damping: 9, stiffness: 280}});
					if (frame < l.at) return <div key={i} style={{height: l.size * 1.05}} />;
					return (
						<div
							key={i}
							style={{
								fontFamily: FONT,
								fontWeight: 900,
								fontSize: l.size,
								lineHeight: 1.05,
								color: l.color,
								letterSpacing: l.size > 100 ? -4 : 3,
								textShadow: '0 10px 40px rgba(0,0,0,0.6)',
								transform: `scale(${interpolate(s, [0, 1], [2.6, 1])})`,
								opacity: s,
								filter: `blur(${(1 - s) * 14}px)`,
							}}
						>
							{l.text}
						</div>
					);
				})}
			</AbsoluteFill>
			<Flash at={D_END} len={10} />
			<Flash at={D_END + BEAT} len={8} peak={0.5} />
			<Flash at={D_END + BEAT * 2} len={8} peak={0.4} />
		</AbsoluteFill>
	);
};

export const ColdOpen: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames - 1], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: 'black'}}>
			{frame < A_END && <SceneA />}
			{frame >= A_END && frame < B_END && <SceneB />}
			{frame >= B_END && frame < C_END && <SceneC />}
			{frame >= C_END && frame < D_END && <SceneD />}
			{frame >= D_END && <SceneE />}
			<Grain />
			<Vignette strength={0.45} />
			<AbsoluteFill style={{background: 'black', opacity: fadeOut}} />
			<Audio src={staticFile('mix.wav')} />
		</AbsoluteFill>
	);
};
