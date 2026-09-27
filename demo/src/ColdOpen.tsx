import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BEAT, Callout, Captions, Character, DeepTimeBar, E, FONT, Flash, L, Timer, Vignette, beatPulse, clamp, shake} from './fx';
import {Shader} from './Shader';
import {MAGMA, SPACE} from './shaders';
import timeline from './timeline.json';

// Scene boundaries (absolute frames), all derived from the audio timeline.
const A_END = L.hit.from; // waking up + year counter
const B_END = E.surface; // space: Theia hits Earth
const C_END = E.death; // on the magma surface
const D_END = E.title; // death card
const ARRIVE = L.breath.from; // character appears, timer starts
// Timer runs in slow motion so it reads exactly 1.00 s at the moment of death.
const SLOWMO = 1 / ((C_END - ARRIVE) / timeline.fps);
const fps = timeline.fps;

const MAGMA_BASE = {uHorizon: -0.12, uCamH: 1.0, uHeat: 0, uZoom: 1, uFocus: [0, 0]};

/* ---------------- Scene A: you open your eyes; a 4.5 billion year counter ---------------- */
const SceneA: React.FC = () => {
	const frame = useCurrentFrame();
	const {wake, ago} = L;
	// eyelids: groggy half-open on "wake", a blink, then open on "up"
	const open = interpolate(
		frame,
		[wake.words[1].f - 4, wake.words[1].f + 4, wake.words[2].f - 3, wake.words[2].f, wake.words[2].f + 10],
		[0, 0.3, 0.3, 0.02, 0.9],
		{...clamp, easing: Easing.inOut(Easing.quad)},
	);
	const blur = interpolate(frame, [wake.words[1].f, ago.from + 10], [28, 6], clamp);
	const countStart = ago.from + 2;
	const countEnd = ago.to - 6;
	const p = interpolate(frame, [countStart, countEnd], [0, 1], {...clamp, easing: Easing.bezier(0.3, 0.1, 0.1, 1)});
	const years = Math.round(p * 4_500_000_000);
	const slam = spring({frame: frame - countEnd, fps, config: {damping: 10, stiffness: 260}});
	const counterIn = spring({frame: frame - countStart, fps, config: {damping: 18}});
	const dim = interpolate(frame, [ago.from - 4, ago.from + 8], [0, 0.55], clamp);
	const whip = interpolate(frame, [A_END - 7, A_END], [0, -2400], {...clamp, easing: Easing.in(Easing.cubic)});

	return (
		<AbsoluteFill style={{background: 'black', transform: `${shake(frame, countEnd, 16, 10)} translateX(${whip}px)`, filter: whip ? `blur(${-whip / 90}px)` : undefined}}>
			<Shader frag={MAGMA} scale={0.5} uniforms={{...MAGMA_BASE, uPan: frame * 0.004}} style={{filter: `blur(${blur}px) brightness(${0.8 + 0.2 * open})`, transform: 'scale(1.08)'}} />
			<AbsoluteFill style={{background: `rgba(0,0,0,${dim})`}} />
			{/* eyelids */}
			<AbsoluteFill style={{background: `radial-gradient(1500px ${Math.max(open * 820, 1)}px at 50% 50%, rgba(0,0,0,0) 62%, #000 100%)`}} />
			{frame >= countStart && (
				<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: counterIn}}>
					<div
						style={{
							fontFamily: FONT,
							fontWeight: 800,
							fontSize: 176,
							fontVariantNumeric: 'tabular-nums',
							letterSpacing: -5,
							background: 'linear-gradient(180deg, #fff6e6 20%, #ffb35a 100%)',
							WebkitBackgroundClip: 'text',
							color: 'transparent',
							filter: `drop-shadow(0 0 ${30 + slam * 40}px rgba(255,120,40,0.55))`,
							transform: `scale(${(frame >= countEnd ? 1 + (1 - slam) * 0.18 : 1) * (0.96 + 0.04 * counterIn)})`,
						}}
					>
						{years.toLocaleString('en-US')}
					</div>
					<div style={{fontFamily: FONT, fontWeight: 600, fontSize: 40, color: 'rgba(255,255,255,0.85)', letterSpacing: 22, marginTop: 4}}>YEARS AGO</div>
				</AbsoluteFill>
			)}
			<Flash at={countEnd} color="#ffb35a" len={12} peak={0.35} />
			<Captions ids={['wake']} />
		</AbsoluteFill>
	);
};

/* ---------------- Scene B: Theia hits the young Earth ---------------- */
const EARTH = {x: 0.2, y: -0.04, r: 0.3};
const DIR = {x: -0.8, y: 0.6};
const THEIA_R = 0.155;
const CONTACT = {x: EARTH.x + DIR.x * EARTH.r, y: EARTH.y + DIR.y * EARTH.r};
const THEIA_END = {x: EARTH.x + DIR.x * (EARTH.r + THEIA_R * 0.75), y: EARTH.y + DIR.y * (EARTH.r + THEIA_R * 0.75)};

const SceneB: React.FC = () => {
	const frame = useCurrentFrame();
	const impact = E.impact;
	const since = (frame - impact) / fps;
	const zoom = interpolate(frame, [A_END, impact, impact + 3, B_END], [1.5, 1.08, 1.2, 1.32], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const cam = {x: interpolate(frame, [A_END, impact, B_END], [0.05, 0.08, -0.02], clamp), y: interpolate(frame, [A_END, B_END], [0.04, 0.08], clamp)};
	const ap = interpolate(frame, [A_END, impact], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
	const theia = {x: interpolate(ap, [0, 1], [-0.62, THEIA_END.x]), y: interpolate(ap, [0, 1], [0.4, THEIA_END.y])};
	const whipIn = interpolate(frame, [A_END, A_END + 8], [2400, 0], {...clamp, easing: Easing.out(Easing.cubic)});
	const px = (x: number, y: number) => ({x: 960 + (x - cam.x) * zoom * 1080, y: 540 - (y - cam.y) * zoom * 1080});
	const e = px(EARTH.x + 0.21, EARTH.y + 0.21);
	const t = px(theia.x + THEIA_R * 0.55, theia.y - THEIA_R * 0.55);

	return (
		<AbsoluteFill style={{background: 'black', transform: `translateX(${whipIn}px) ${shake(frame, impact, 45, 16)}`, filter: whipIn > 1 ? `blur(${whipIn / 90}px)` : undefined}}>
			<Shader
				frag={SPACE}
				uniforms={{
					uCam: [zoom, cam.x, cam.y],
					uEarth: [EARTH.x, EARTH.y, EARTH.r],
					uTheia: [theia.x, theia.y, frame < impact ? THEIA_R : 0],
					uContact: [CONTACT.x, CONTACT.y],
					uImpact: frame < impact ? -1 : since,
					uMode: 0,
					uSpin: frame * 0.004,
					uNebula: 1,
				}}
			/>
			{frame < impact && (
				<>
					<Callout at={L.hit.words[0].f + 2} x={e.x} y={e.y} dx={110} dy={-90} title="EARTH" sub="~100 million years old" />
					<Callout at={L.hit.words[8].f} x={t.x} y={t.y} dx={-70} dy={150} title="THEIA" sub="the size of Mars" color="#b8dcff" />
				</>
			)}
			<Flash at={impact} color="#ffd49a" len={6} peak={0.55} />
			<Captions ids={['hit']} />
		</AbsoluteFill>
	);
};

/* ---------------- Scene C: the magma surface ---------------- */
/** The slab of cooled crust the character stands on: sunlit-by-magma top, glowing waterline. */
const Rock: React.FC = () => (
	<svg width="1920" height="1080" style={{position: 'absolute', left: 0, top: 0}}>
		<defs>
			<radialGradient id="rockGlow" cx="0.5" cy="0.5" r="0.5">
				<stop offset="0" stopColor="#ffb04a" stopOpacity="0.8" />
				<stop offset="0.6" stopColor="#ff6a1a" stopOpacity="0.35" />
				<stop offset="1" stopColor="#ff5a0a" stopOpacity="0" />
			</radialGradient>
			<linearGradient id="rockTop" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#3b2520" />
				<stop offset="1" stopColor="#5a3326" />
			</linearGradient>
			<linearGradient id="rockFront" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#1a0c0a" />
				<stop offset="0.7" stopColor="#2a110b" />
				<stop offset="1" stopColor="#b8420f" />
			</linearGradient>
		</defs>
		<ellipse cx="960" cy="978" rx="320" ry="56" fill="url(#rockGlow)" />
		<path d="M790 925 L842 902 L918 893 L1000 890 L1072 897 L1140 921 L1098 942 L960 950 L832 944 Z" fill="url(#rockTop)" />
		<path d="M790 925 L832 944 L960 950 L1098 942 L1140 921 L1150 950 L1104 982 L960 992 L826 986 L778 954 Z" fill="url(#rockFront)" />
		<path d="M842 902 L880 925 L870 944 M1000 890 L1020 918 L1098 942 M918 893 L940 915" stroke="#241310" strokeWidth="2" fill="none" opacity="0.8" />
		<path d="M790 925 L832 944 L960 950 L1098 942 L1140 921" stroke="#ffb870" strokeWidth="2" fill="none" opacity="0.55" />
		<path d="M778 954 L826 986 L960 992 L1104 982 L1150 950" stroke="#ffd08a" strokeWidth="3" fill="none" opacity="0.9" style={{filter: 'blur(1.5px)'}} />
		<ellipse cx="960" cy="925" rx="62" ry="9" fill="black" opacity="0.5" style={{filter: 'blur(3px)'}} />
	</svg>
);

const SceneC: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame - B_END;
	const arrived = frame >= ARRIVE;
	const punch = 1 + 0.015 * beatPulse(frame, 7);
	const push = interpolate(frame, [ARRIVE - 10, C_END], [1, 1.75], {...clamp, easing: Easing.in(Easing.cubic)});
	const breath = interpolate(frame, [E.inhale, E.inhale + 22], [0, 1], {...clamp, easing: Easing.inOut(Easing.sin)});
	const pain = interpolate(frame, [E.inhale + 22, C_END - 4], [0, 1], clamp);
	const appear = spring({frame: frame - ARRIVE, fps, config: {damping: 12, stiffness: 200}});
	const timerSec = arrived ? Math.min(1, ((frame - ARRIVE) / fps) * SLOWMO) : 0;
	const heat = interpolate(frame, [E.inhale, C_END], [0, 0.55], clamp);
	const focus = {x: 960, y: 700};
	const beam = interpolate(frame - ARRIVE, [0, 3, 14], [0, 1, 0], clamp);

	return (
		<AbsoluteFill style={{overflow: 'hidden', background: 'black', transform: shake(frame, B_END, 22, 12)}}>
			<Shader
				frag={MAGMA}
				uniforms={{...MAGMA_BASE, uPan: 0.8 + t * 0.006, uHeat: heat, uZoom: push * punch, uFocus: [(focus.x - 960) / 1080, (540 - focus.y) / 1080]}}
			/>
			<AbsoluteFill style={{transform: `scale(${push * punch})`, transformOrigin: `${focus.x}px ${focus.y}px`}}>
				<Rock />
				{arrived && (
					<>
						<div style={{position: 'absolute', left: 960 - 60, top: 0, width: 120, height: 930, background: 'linear-gradient(90deg, transparent, rgba(255,240,210,0.9), transparent)', opacity: beam, filter: 'blur(6px)'}} />
						<div
							style={{
								position: 'absolute',
								left: 960 - 120,
								top: 930 - 495,
								transform: `scaleY(${appear}) scaleX(${interpolate(appear, [0, 1], [0.4, 1])})`,
								transformOrigin: 'bottom center',
							}}
						>
							<Character breath={breath} pain={pain} bob={Math.sin(frame / 9) * 1.5} look={interpolate(frame, [ARRIVE, ARRIVE + 20], [-1, 0], clamp)} />
						</div>
					</>
				)}
			</AbsoluteFill>
			<Vignette strength={0.55} />
			<AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 35%, rgba(170,0,0,${heat}) 100%)`}} />
			{!arrived && (
				<>
					<Callout at={B_END + 16} x={560} y={830} dx={-100} dy={-170} title="~2,000 °C" sub="an ocean of magma" />
					<Callout at={L.air.words[7].f} x={1380} y={330} dx={90} dy={-110} title="VAPORIZED ROCK" sub="that's the air" />
				</>
			)}
			<DeepTimeBar progress={0.0} label="4.5 BILLION YEARS AGO" opacity={arrived ? 0 : interpolate(frame, [B_END + 10, B_END + 22], [0, 1], clamp)} />
			{arrived && (
				<>
					<div style={{position: 'absolute', right: 64, top: 56, transform: `scale(${appear})`, transformOrigin: 'top right'}}>
						<Timer seconds={timerSec} dead={false} />
					</div>
					<div style={{position: 'absolute', left: 64, top: 64, fontFamily: FONT, fontWeight: 700, fontSize: 20, color: 'rgba(255,255,255,0.9)', letterSpacing: 5, display: 'flex', alignItems: 'center', gap: 12}}>
						<span style={{width: 12, height: 12, borderRadius: 6, background: '#ff4d3d', opacity: Math.floor(frame / 8) % 2 ? 1 : 0.25}} />
						SLOW MOTION
					</div>
				</>
			)}
			<Captions ids={['air', 'breath']} />
			<Flash at={B_END} color="#ffb35a" len={10} peak={0.6} />
			<Flash at={ARRIVE} color="#fff2d6" len={8} peak={0.35} />
		</AbsoluteFill>
	);
};

/* ---------------- Scene D: death card over the frozen last moment ---------------- */
const SceneD: React.FC = () => {
	const frame = useCurrentFrame();
	const since = frame - C_END;
	const timerIn = spring({frame: since, fps, config: {damping: 12, stiffness: 220}});
	const skullAt = C_END + BEAT * 2;
	const skull = spring({frame: frame - skullAt, fps, config: {damping: 10, stiffness: 260}});
	const visit = L.visit;
	const drift = interpolate(since, [0, D_END - C_END], [1.75, 1.9]);
	return (
		<AbsoluteFill style={{background: 'black', transform: shake(frame, C_END, 26, 8)}}>
			<Shader
				frag={MAGMA}
				scale={0.5}
				time={(C_END - 1) / fps}
				uniforms={{...MAGMA_BASE, uPan: 0.8 + (C_END - B_END) * 0.006, uHeat: 0.55, uZoom: drift, uFocus: [0, (540 - 700) / 1080]}}
				style={{filter: 'grayscale(1) brightness(0.28) blur(6px)'}}
			/>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(120,0,0,0.25), rgba(0,0,0,0.8) 90%)'}} />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 46}}>
				<div style={{transform: `scale(${interpolate(timerIn, [0, 1], [2.2, 1.35])})`, opacity: timerIn}}>
					<Timer seconds={1} dead />
				</div>
				<div style={{display: 'flex', gap: 18, minHeight: 90}}>
					{visit.words.map((w, i) => {
						const s = spring({frame: frame - w.f, fps, config: {damping: 16, stiffness: 200}});
						return (
							<span key={i} style={{fontFamily: FONT, fontWeight: 700, fontSize: 72, color: 'white', opacity: frame >= w.f ? s : 0, transform: `translateY(${(1 - s) * 24}px)`, display: 'inline-block', letterSpacing: -1}}>
								{w.w}
							</span>
						);
					})}
				</div>
			</AbsoluteFill>
			{frame >= skullAt && (
				<div style={{position: 'absolute', right: 70, top: 60, fontFamily: FONT, fontWeight: 800, fontSize: 44, color: 'white', transform: `scale(${skull})`, transformOrigin: 'top right', letterSpacing: 2}}>
					DEATHS <span style={{color: '#ff5a4d'}}>1</span>
				</div>
			)}
			<Flash at={C_END} color="#ff3a2a" len={12} peak={0.8} />
			<Captions ids={['again']} />
		</AbsoluteFill>
	);
};

/* ---------------- Scene E: title over Earth changing era on every beat ---------------- */
const ERAS = [
	{mode: 0, tag: '4.5 BILLION YEARS AGO'},
	{mode: 1, tag: '4 BILLION YEARS AGO'},
	{mode: 2, tag: '650 MILLION YEARS AGO'},
	{mode: 3, tag: '300 MILLION YEARS AGO'},
	{mode: 4, tag: 'TODAY'},
];

const SceneE: React.FC = () => {
	const frame = useCurrentFrame();
	const since = frame - D_END;
	const era = ERAS[Math.min(Math.floor(since / BEAT), ERAS.length - 1)];
	const punch = 1 + 0.04 * beatPulse(frame, 8);
	const lines = [
		{text: 'HOW LONG WOULD', at: D_END, size: 96, weight: 700, color: 'white', spacing: 4},
		{text: 'YOU SURVIVE', at: D_END + BEAT, size: 188, weight: 900, color: '#ffc56b', spacing: -5},
		{text: "IN EVERY ERA OF EARTH'S HISTORY?", at: D_END + BEAT * 2, size: 50, weight: 700, color: 'white', spacing: 8},
	];
	return (
		<AbsoluteFill style={{background: 'black', transform: shake(frame, D_END, 30, 10), overflow: 'hidden'}}>
			<Shader
				frag={SPACE}
				uniforms={{
					uCam: [0.95 * punch, 0, 0],
					uEarth: [0, 0, 0.42],
					uTheia: [0, 0, 0],
					uContact: [0, 0],
					uImpact: -1,
					uMode: era.mode,
					uSpin: 1.2 + since * 0.012,
					uNebula: 1,
				}}
			/>
			<AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55) 20%, rgba(0,0,0,0.25) 70%)'}} />
			<div style={{position: 'absolute', left: 64, bottom: 56, fontFamily: FONT, fontWeight: 700, fontSize: 22, letterSpacing: 6, color: 'rgba(255,255,255,0.85)'}}>{era.tag}</div>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', transform: `scale(${punch})`}}>
				{lines.map((l, i) => {
					const s = spring({frame: frame - l.at, fps, config: {damping: 12, stiffness: 240}});
					return (
						<div
							key={i}
							style={{
								fontFamily: FONT,
								fontWeight: l.weight,
								fontSize: l.size,
								lineHeight: 1.08,
								color: l.color,
								letterSpacing: l.spacing,
								textShadow: '0 8px 50px rgba(0,0,0,0.7)',
								transform: `scale(${interpolate(s, [0, 1], [1.6, 1])})`,
								opacity: frame >= l.at ? s : 0,
								filter: `blur(${(1 - s) * 10}px)`,
							}}
						>
							{l.text}
						</div>
					);
				})}
			</AbsoluteFill>
			<Flash at={D_END} len={10} peak={0.8} />
			{ERAS.slice(1).map((_, i) => (
				<Flash key={i} at={D_END + BEAT * (i + 1)} len={6} peak={0.25} />
			))}
		</AbsoluteFill>
	);
};

export const ColdOpen: React.FC = () => {
	const frame = useCurrentFrame();
	const durationInFrames = timeline.durationFrames;
	const fadeOut = interpolate(frame, [durationInFrames - 14, durationInFrames - 1], [0, 1], clamp);
	return (
		<AbsoluteFill style={{background: 'black'}}>
			{frame < A_END && <SceneA />}
			{frame >= A_END && frame < B_END && <SceneB />}
			{frame >= B_END && frame < C_END && <SceneC />}
			{frame >= C_END && frame < D_END && <SceneD />}
			{frame >= D_END && <SceneE />}
			<Vignette strength={0.4} />
			<AbsoluteFill style={{background: 'black', opacity: fadeOut}} />
			<Audio src={staticFile('mix.wav')} />
		</AbsoluteFill>
	);
};
