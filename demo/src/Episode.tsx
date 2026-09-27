// Full episode: the cold open, then eleven stops through Earth's history with a persistent HUD.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {ColdOpen} from './ColdOpen';
import {EP, FPS, LN, SEC, clamp} from './episode/lib';
import {Archean, Hadean, Oxidation, Rules} from './episode/scenes1';
import {Boring, Cambrian, Snowball} from './episode/scenes2';
import {Carboniferous, Cretaceous, Dying} from './episode/scenes3';
import {IceAge, Today} from './episode/scenes4';
import {DEAD_AT, DeathTally, DeepBar, ERA, EraCard, EpCaptions, ORDER, TimerCard, keyFrame, timerValue} from './episode/ui';
import timeline from './timeline.json';

export const COLD_FRAMES = timeline.durationFrames;
export const EPISODE_FRAMES = COLD_FRAMES + EP.durationFrames;

const SCENES: Record<string, React.FC> = {
	rules: Rules,
	hadean: Hadean,
	archean: Archean,
	oxidation: Oxidation,
	boring: Boring,
	snowball: Snowball,
	cambrian: Cambrian,
	carboniferous: Carboniferous,
	dying: Dying,
	cretaceous: Cretaceous,
	iceage: IceAge,
	today: Today,
};

// When the timer turns green ("still alive") in the eras you survive.
const ALIVE_FROM: Record<string, number> = {
	cambrian: LN.c5.from,
	carboniferous: LN.k2.from,
	iceage: LN.i5.from,
	today: LN.y1.from,
};

/** Survival timer, top right, driven by the era's keys. A death pops it into the centre first. */
const HudTimer: React.FC<{id: string}> = ({id}) => {
	const frame = useCurrentFrame();
	const sec = SEC[id];
	const timer = ERA[id].timer;
	if (!timer) return null;
	const start = keyFrame(timer.keys[0]);
	const hide = timer.hideAfter ? (SEC[timer.hideAfter] ? SEC[timer.hideAfter].from : LN[timer.hideAfter].from) : sec.to;
	if (frame < start - 6 || frame > hide + 12) return null;
	const deadAt = DEAD_AT[id];
	const dead = deadAt !== undefined && frame >= deadAt;
	const alive = ALIVE_FROM[id] !== undefined && frame >= ALIVE_FROM[id];
	const appear = spring({frame: frame - (start - 6), fps: FPS, config: {damping: 14, stiffness: 200}});
	const out = interpolate(frame, [hide, hide + 12], [1, 0], clamp);
	const sec_ = timerValue(frame, timer.keys);
	// death: fly to the centre, big, then back to the corner
	const d = dead ? frame - deadAt! : -1;
	const centre = d < 0 ? 0 : interpolate(d, [0, 8, 62, 78], [0, 1, 1, 0], {...clamp, easing: Easing.inOut(Easing.cubic)});
	const pop = d < 0 ? 0 : spring({frame: d, fps: FPS, config: {damping: 9, stiffness: 260}});
	const x = interpolate(centre, [0, 1], [0, -(1920 / 2 - 70 - 150)]);
	const y = interpolate(centre, [0, 1], [0, 1080 / 2 - 56 - 110]);
	const scale = 1 + centre * (0.9 + (1 - pop) * 0.3);
	return (
		<div style={{position: 'absolute', right: 70, top: 56, opacity: Math.min(appear, out), transform: `translate(${x}px, ${y}px) scale(${scale * (0.7 + 0.3 * appear)})`, transformOrigin: 'center', zIndex: 5}}>
			<TimerCard seconds={sec_} state={dead ? 'dead' : alive ? 'alive' : 'live'} />
		</div>
	);
};

/** Where we are in deep time, top centre. Rolls to the new era at each section start. */
const HudDeepBar: React.FC<{id: string}> = ({id}) => {
	const frame = useCurrentFrame();
	const sec = SEC[id];
	const i = ORDER.indexOf(id);
	if (id === 'rules' || id === 'boring') return null;
	const firstLine = sec.lines[0].from;
	const prev = ERA[ORDER[i - 1]].ago;
	const roll = interpolate(frame, [sec.from + 2, sec.from + 40], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	const ago = prev + (ERA[id].ago - prev) * roll;
	const o = interpolate(frame, [firstLine - 4, firstLine + 10, sec.to - 12, sec.to], [0, 1, 1, 0], clamp);
	return (
		<div style={{position: 'absolute', left: (1920 - 620) / 2, top: 50, opacity: o}}>
			<DeepBar ago={ago} width={620} label={ERA[id].when} />
		</div>
	);
};

const Death: React.FC<{id: string}> = ({id}) => {
	const frame = useCurrentFrame();
	const d = DEAD_AT[id];
	if (d === undefined || frame < d || frame > d + 30) return null;
	const o = interpolate(frame, [d, d + 1, d + 18], [0, 0.55, 0], clamp);
	return <AbsoluteFill style={{background: '#ff2a1a', opacity: o, mixBlendMode: 'screen'}} />;
};

const Body: React.FC = () => {
	const frame = useCurrentFrame();
	const sec = EP.sections.find((s) => frame >= s.from && frame < s.to) ?? EP.sections[EP.sections.length - 1];
	const Scene = SCENES[sec.id];
	const tallyO = sec.id === 'rules' ? 0 : interpolate(frame, [SEC.hadean.lines[0].from - 10, SEC.hadean.lines[0].from + 10, SEC.today.lines[5].from, SEC.today.lines[5].from + 20], [0, 1, 1, 0], clamp);
	return (
		<AbsoluteFill style={{background: 'black'}}>
			<Scene />
			<Death id={sec.id} />
			<div style={{opacity: tallyO}}>
				<DeathTally />
			</div>
			<HudDeepBar id={sec.id} />
			<HudTimer id={sec.id} />
			<EraCard id={sec.id} />
			<EpCaptions />
		</AbsoluteFill>
	);
};

export const Episode: React.FC = () => (
	<AbsoluteFill style={{background: 'black'}}>
		<Sequence durationInFrames={COLD_FRAMES}>
			<ColdOpen />
		</Sequence>
		<Sequence from={COLD_FRAMES}>
			<Body />
			<Audio src={staticFile('episode.m4a')} />
		</Sequence>
	</AbsoluteFill>
);

/** Just the part after the cold open (for development and chunked renders). */
export const EpisodeBody: React.FC = () => (
	<AbsoluteFill>
		<Body />
		<Audio src={staticFile('episode.m4a')} />
	</AbsoluteFill>
);
