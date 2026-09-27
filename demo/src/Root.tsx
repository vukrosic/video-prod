import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ColdOpen} from './ColdOpen';
import timeline from './timeline.json';

const Root: React.FC = () => (
	<Composition
		id="ColdOpen"
		component={ColdOpen}
		durationInFrames={timeline.durationFrames}
		fps={timeline.fps}
		width={1920}
		height={1080}
	/>
);

registerRoot(Root);
