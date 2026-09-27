import React from 'react';

export type Pose = 'down' | 'up' | 'cross' | 'hold' | 'sit' | 'run';
export type CharacterProps = {
	/** 0..1 inhale: chest, wide eyes, open mouth */
	breath?: number;
	/** 0..1 squint and grimace */
	pain?: number;
	/** 0..1 cheeks puffed (holding breath) */
	puff?: number;
	/** 0..1 smile */
	smile?: number;
	dead?: boolean;
	bob?: number;
	/** pupil offset -1..1 */
	look?: number;
	pose?: Pose;
	/** run cycle phase (radians) for pose 'run' */
	phase?: number;
	/** where the key light comes from: glowing ground ('below') or the sky ('above') */
	light?: 'below' | 'above';
	rim?: string;
	shirt?: [string, string];
	pants?: [string, string];
	skin?: [string, string];
	hair?: string;
	/** fur coat colour (Ice Age people) */
	coat?: string;
	/** unique id prefix when several characters share a frame */
	uid?: string;
};

/** The recurring main character (and, recoloured, everyone else). Drawn in a 160x330 box, feet at y=327. */
export const Character: React.FC<CharacterProps> = ({
	breath = 0,
	pain = 0,
	puff = 0,
	smile = 0,
	dead = false,
	bob = 0,
	look = 0,
	pose = 'down',
	phase = 0,
	light = 'below',
	rim = '#ffb04a',
	shirt = ['#35c9b6', '#1c9285'],
	pants = ['#3a5a8f', '#2b4675'],
	skin = ['#f3c09c', '#e9a07a'],
	hair = '#3a2419',
	coat,
	uid = 'c',
}) => {
	const id = (s: string) => `${uid}-${s}`;
	const eyeOpen = dead ? 1 : Math.max(0.12, 1 + breath * 0.35 - pain * 0.85 - puff * 0.25);
	const chest = 1 + breath * 0.07 + puff * 0.03;
	const brow = -breath * 5 + pain * 3 - puff * 2;
	const sk2 = skin[1];
	const hand = skin[0];

	// arm paths from the shoulders (40,146) and (120,146)
	let armL = `M40 146 Q${31 - breath * 3} 184 ${35 - breath * 4} 216`;
	let armR = `M120 146 Q${129 + breath * 3} 184 ${125 + breath * 4} 216`;
	let hL: [number, number] = [35 - breath * 4, 219];
	let hR: [number, number] = [125 + breath * 4, 219];
	if (pose === 'up') {
		armL = 'M40 140 Q18 110 22 72';
		armR = 'M120 140 Q142 110 138 72';
		hL = [22, 66];
		hR = [138, 66];
	} else if (pose === 'cross') {
		armL = 'M44 150 Q40 182 100 170';
		armR = 'M116 150 Q120 186 60 178';
		hL = [102, 169];
		hR = [58, 177];
	} else if (pose === 'hold') {
		armL = 'M40 146 Q38 178 66 184';
		armR = 'M120 146 Q122 178 94 184';
		hL = [70, 184];
		hR = [90, 184];
	} else if (pose === 'run') {
		const s = Math.sin(phase);
		armL = `M40 146 Q${34 + s * 14} 176 ${40 + s * 26} ${204 - Math.abs(s) * 10}`;
		armR = `M120 146 Q${126 - s * 14} 176 ${120 - s * 26} ${204 - Math.abs(s) * 10}`;
		hL = [40 + s * 26, 206 - Math.abs(s) * 10];
		hR = [120 - s * 26, 206 - Math.abs(s) * 10];
	}

	const legs =
		pose === 'sit' ? (
			<>
				<path d="M50 196 L110 196 L114 238 Q112 246 100 246 L60 246 Q48 246 46 238 Z" fill={`url(#${id('jeans')})`} />
				<path d="M80 204 L80 244" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
				<path d="M56 240 L78 240 L76 300 L60 300 Z" fill={`url(#${id('jeans2')})`} />
				<path d="M84 240 L106 240 L102 300 L86 300 Z" fill={`url(#${id('jeans2')})`} />
				<rect x="52" y="294" width="30" height="14" rx="7" fill="#2a2320" />
				<rect x="80" y="294" width="30" height="14" rx="7" fill="#211b19" />
			</>
		) : pose === 'run' ? (
			<>
				<g transform={`rotate(${Math.sin(phase) * 28} 66 198)`}>
					<path d="M52 196 L80 196 L79 318 L61 318 Z" fill={`url(#${id('jeans')})`} />
					<rect x="54" y="312" width="30" height="15" rx="7.5" fill="#2a2320" />
				</g>
				<g transform={`rotate(${-Math.sin(phase) * 28} 94 198)`}>
					<path d="M80 196 L108 196 L99 318 L81 318 Z" fill={`url(#${id('jeans2')})`} />
					<rect x="78" y="312" width="30" height="15" rx="7.5" fill="#211b19" />
				</g>
			</>
		) : (
			<>
				<path d="M52 196 L80 196 L79 318 L61 318 Z" fill={`url(#${id('jeans')})`} />
				<path d="M80 196 L108 196 L99 318 L81 318 Z" fill={`url(#${id('jeans2')})`} />
				<path d="M80 204 L80 300" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
				<rect x="54" y="312" width="30" height="15" rx="7.5" fill="#2a2320" />
				<rect x="78" y="312" width="30" height="15" rx="7.5" fill="#211b19" />
				{!coat && (
					<>
						<rect x="54" y="322" width="30" height="5" rx="2.5" fill="#e9e3da" />
						<rect x="78" y="322" width="30" height="5" rx="2.5" fill="#d8d2c9" />
					</>
				)}
			</>
		);

	const eyes = dead ? (
		[66, 94].map((x) => (
			<g key={x} stroke="#241611" strokeWidth="3" strokeLinecap="round">
				<path d={`M${x - 5} 57 L${x + 5} 67`} />
				<path d={`M${x + 5} 57 L${x - 5} 67`} />
			</g>
		))
	) : (
		[66, 94].map((x) => (
			<g key={x}>
				<ellipse cx={x} cy="62" rx="6.5" ry={7.5 * eyeOpen} fill="white" />
				<circle cx={x + look * 2} cy="62.5" r={3.6 * Math.min(1, eyeOpen)} fill="#241611" />
				<circle cx={x + 1.4 + look * 2} cy="60.8" r={1.1 * Math.min(1, eyeOpen)} fill="white" />
			</g>
		))
	);

	let mouth: React.ReactNode;
	if (puff > 0.05) mouth = <ellipse cx="80" cy="85" rx={4 - puff * 2} ry={1.5} fill="#7a3328" />;
	else if (dead) mouth = <path d="M72 86 Q80 82 88 86" stroke="#7a3328" strokeWidth="3" fill="none" strokeLinecap="round" />;
	else if (breath > 0.05 || pain > 0.05) mouth = <ellipse cx="80" cy="84" rx={3.5 + breath * 3 + pain * 4} ry={2 + breath * 6 - pain * 1} fill="#5a1f1a" />;
	else if (smile > 0.05) mouth = <path d={`M71 ${82} Q80 ${82 + 7 * smile} 89 82 Z`} fill="#5a1f1a" stroke="#7a3328" strokeWidth="2" strokeLinejoin="round" />;
	else mouth = <path d="M73 83 Q80 87 87 83" stroke="#7a3328" strokeWidth="3" fill="none" strokeLinecap="round" />;

	const torso = coat ? (
		<g>
			<path d="M42 110 Q80 98 118 110 L130 150 L118 158 L116 250 Q80 262 44 250 L42 158 L30 150 Z" fill={`url(#${id('coat')})`} />
			<path d="M44 250 Q80 262 116 250" stroke="#e8dcc6" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.85" />
			<path d="M58 106 Q80 122 102 106" stroke="#e8dcc6" strokeWidth="9" fill="none" strokeLinecap="round" />
			<path d="M80 118 L80 250" stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
		</g>
	) : (
		<g>
			<path d="M46 110 Q80 100 114 110 L134 146 L117 156 L112 144 L112 200 Q80 207 48 200 L48 144 L43 156 L26 146 Z" fill={`url(#${id('shirt')})`} />
			<path d="M68 104 Q80 116 92 104" stroke="rgba(0,0,0,0.25)" strokeWidth="4" fill="none" strokeLinecap="round" />
		</g>
	);

	const front = pose === 'cross' || pose === 'hold';
	const arms = (
		<>
			<path d={armL} stroke={coat ?? `url(#${id('skin')})`} strokeWidth={coat ? 17 : 14} strokeLinecap="round" fill="none" />
			<path d={armR} stroke={coat ?? `url(#${id('skin2')})`} strokeWidth={coat ? 17 : 14} strokeLinecap="round" fill="none" />
			<circle cx={hL[0]} cy={hL[1]} r="8.5" fill={hand} />
			<circle cx={hR[0]} cy={hR[1]} r="8.5" fill={sk2} />
		</>
	);
	const body = (
		<g>
			{legs}
			{!front && arms}
			<g transform={`translate(80 150) scale(${chest} ${1 + breath * 0.025}) translate(-80 -150)`}>{torso}</g>
			{front && arms}
			<rect x="72" y="88" width="16" height="20" rx="4" fill={sk2} />
			<g transform={`rotate(${-breath * 6} 80 96)`}>
				<ellipse cx="46" cy="66" rx="6" ry="8" fill={sk2} />
				<ellipse cx="114" cy="66" rx="6" ry="8" fill={sk2} />
				<ellipse cx="80" cy="62" rx={34 + puff * 2} ry="36" fill={`url(#${id('skin')})`} />
				<path d="M45 58 Q42 24 76 22 Q112 20 116 52 Q108 40 96 38 Q98 46 90 44 Q72 38 58 44 Q50 48 45 58 Z" fill={hair} />
				{coat && <path d="M44 60 Q40 30 58 22 M116 60 Q120 30 102 22" stroke={hair} strokeWidth="8" fill="none" strokeLinecap="round" />}
				{!dead && (
					<>
						<path d={`M58 ${48 + brow} Q66 ${44 + brow - pain * 2} 73 ${48 + brow + pain * 2}`} stroke={hair} strokeWidth="3.5" fill="none" strokeLinecap="round" />
						<path d={`M87 ${48 + brow + pain * 2} Q94 ${44 + brow - pain * 2} 102 ${48 + brow}`} stroke={hair} strokeWidth="3.5" fill="none" strokeLinecap="round" />
					</>
				)}
				{eyes}
				<ellipse cx="58" cy="76" rx={6 + puff * 4} ry={3.5 + puff * 3} fill="#ff7a6b" opacity={0.35 + puff * 0.25} />
				<ellipse cx="102" cy="76" rx={6 + puff * 4} ry={3.5 + puff * 3} fill="#ff7a6b" opacity={0.35 + puff * 0.25} />
				{mouth}
			</g>
		</g>
	);

	const bounce =
		light === 'below'
			? [
					['#1a0610', 0.45],
					['#ff6a1a', 0.08],
					['#ff7a1a', 0.45],
				]
			: [
					['#fff4dd', 0.18],
					['#000000', 0.0],
					['#0a1020', 0.35],
				];
	return (
		<svg width="240" height="495" viewBox="0 0 160 330" style={{overflow: 'visible'}}>
			<defs>
				<linearGradient id={id('skin')} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={skin[0]} />
					<stop offset="1" stopColor={skin[1]} />
				</linearGradient>
				<linearGradient id={id('skin2')} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={skin[1]} />
					<stop offset="1" stopColor={skin[1]} />
				</linearGradient>
				<linearGradient id={id('shirt')} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor={shirt[0]} />
					<stop offset="1" stopColor={shirt[1]} />
				</linearGradient>
				<linearGradient id={id('coat')} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor={coat ?? '#000'} />
					<stop offset="1" stopColor="#3a2414" />
				</linearGradient>
				<linearGradient id={id('jeans')} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={pants[0]} />
					<stop offset="1" stopColor={pants[1]} />
				</linearGradient>
				<linearGradient id={id('jeans2')} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor={pants[1]} />
					<stop offset="1" stopColor={pants[1]} />
				</linearGradient>
				<linearGradient id={id('bounce')} x1="0" y1="0" x2="0" y2="1">
					{bounce.map(([c, o], i) => (
						<stop key={i} offset={[0, 0.55, 1][i]} stopColor={c as string} stopOpacity={o as number} />
					))}
				</linearGradient>
				<filter id={id('white')}>
					<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
				</filter>
				<mask id={id('sil')} maskUnits="userSpaceOnUse" x="-40" y="-40" width="240" height="420">
					<g filter={`url(#${id('white')})`}>{body}</g>
				</mask>
				<filter id={id('rim')} x="-30%" y="-30%" width="160%" height="160%">
					<feOffset in="SourceAlpha" dx={light === 'below' ? -2.5 : 2.5} dy={light === 'below' ? -4 : 3} result="off" />
					<feComposite in="SourceAlpha" in2="off" operator="out" result="edge" />
					<feGaussianBlur in="edge" stdDeviation="1.1" result="edgeB" />
					<feFlood floodColor={rim} />
					<feComposite in2="edgeB" operator="in" result="rimC" />
					<feComposite in="rimC" in2="SourceAlpha" operator="in" result="rimIn" />
					<feGaussianBlur in="SourceAlpha" stdDeviation="8" result="halo" />
					<feFlood floodColor={rim} floodOpacity={light === 'below' ? 0.35 : 0.12} />
					<feComposite in2="halo" operator="in" result="haloC" />
					<feMerge>
						<feMergeNode in="haloC" />
						<feMergeNode in="SourceGraphic" />
						<feMergeNode in="rimIn" />
					</feMerge>
				</filter>
			</defs>
			<g transform={`translate(0 ${bob})`} filter={`url(#${id('rim')})`}>
				{body}
				<rect x="-40" y="-40" width="240" height="420" fill={`url(#${id('bounce')})`} mask={`url(#${id('sil')})`} />
			</g>
		</svg>
	);
};
