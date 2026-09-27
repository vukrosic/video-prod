import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ColdOpen} from './ColdOpen';
import {EP} from './episode/lib';
import {EPISODE_FRAMES, Episode, EpisodeBody} from './Episode';
import timeline from './timeline.json';

const Root: React.FC = () => (
	<>
		<Composition id="Episode" component={Episode} durationInFrames={EPISODE_FRAMES} fps={timeline.fps} width={1920} height={1080} />
		<Composition id="EpisodeBody" component={EpisodeBody} durationInFrames={EP.durationFrames} fps={EP.fps} width={1920} height={1080} />
		<Composition id="ColdOpen" component={ColdOpen} durationInFrames={timeline.durationFrames} fps={timeline.fps} width={1920} height={1080} />
	</>
);

registerRoot(Root);
