import React, {useLayoutEffect, useRef} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';

/** Full-frame GLSL fragment shader, redrawn synchronously every frame.
 *
 * The fragment source gets `uRes` (canvas size in px), `uTime` (seconds) and any float/vec uniforms
 * passed in `uniforms`. `time` overrides uTime (freeze frames). `scale` renders at a fraction of 1080p and lets the browser upscale.
 */
type Uniforms = Record<string, number | number[]>;

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const HEADER = `precision highp float;
uniform vec2 uRes;
uniform float uTime;
`;

type GLState = {gl: WebGLRenderingContext; prog: WebGLProgram; locs: Map<string, WebGLUniformLocation | null>};

const compile = (gl: WebGLRenderingContext, type: number, src: string) => {
	const s = gl.createShader(type)!;
	gl.shaderSource(s, src);
	gl.compileShader(s);
	if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader error');
	return s;
};

export const Shader: React.FC<{frag: string; uniforms?: Uniforms; scale?: number; time?: number; style?: React.CSSProperties}> = ({
	frag,
	uniforms = {},
	scale = 1,
	time,
	style,
}) => {
	const frame = useCurrentFrame();
	const {width, height, fps} = useVideoConfig();
	const canvas = useRef<HTMLCanvasElement>(null);
	const state = useRef<GLState | null>(null);
	const w = Math.round(width * scale);
	const h = Math.round(height * scale);

	useLayoutEffect(() => {
		if (!state.current) {
			const gl = canvas.current!.getContext('webgl', {preserveDrawingBuffer: true, antialias: false})!;
			const prog = gl.createProgram()!;
			gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
			gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, HEADER + frag));
			gl.linkProgram(prog);
			if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link error');
			gl.useProgram(prog);
			gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
			const loc = gl.getAttribLocation(prog, 'p');
			gl.enableVertexAttribArray(loc);
			gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
			state.current = {gl, prog, locs: new Map()};
		}
		const {gl, prog, locs} = state.current;
		const set = (name: string, v: number | number[]) => {
			if (!locs.has(name)) locs.set(name, gl.getUniformLocation(prog, name));
			const l = locs.get(name)!;
			if (l === null) return;
			if (typeof v === 'number') gl.uniform1f(l, v);
			else if (v.length === 2) gl.uniform2fv(l, v);
			else if (v.length === 3) gl.uniform3fv(l, v);
			else gl.uniform4fv(l, v);
		};
		gl.viewport(0, 0, w, h);
		set('uRes', [w, h]);
		set('uTime', time ?? frame / fps);
		for (const [k, v] of Object.entries(uniforms)) set(k, v);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.finish();
	});

	return (
		<AbsoluteFill style={style}>
			<canvas ref={canvas} width={w} height={h} style={{width: '100%', height: '100%'}} />
		</AbsoluteFill>
	);
};
