// GLSL fragment shaders. Coordinates: `uv` is y-up, centred, in units of frame height.

const NOISE = `
float hash1(float n){ return fract(sin(n) * 43758.5453123); }
float hash2(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 hash22(vec2 p){ float n = hash2(p); return vec2(n, hash2(p + n + 17.1)); }
float hash3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
vec3 hash33(vec3 p){ return vec3(hash3(p), hash3(p + 11.7), hash3(p + 29.3)); }
float noise2(vec2 x){
	vec2 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash2(i), hash2(i + vec2(1, 0)), f.x), mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), f.x), f.y);
}
float noise3(vec3 x){
	vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
	return mix(mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
	           mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm2(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * noise2(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; } return s; }
float fbm3(vec3 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * noise3(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
// distance to the nearest cell border (F2 - F1), for cracked crust
float voronoiEdge2(vec2 x){
	vec2 n = floor(x), f = fract(x); float d1 = 8.0, d2 = 8.0;
	for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
		vec2 g = vec2(float(i), float(j)); vec2 r = g + hash22(n + g) - f; float d = dot(r, r);
		if (d < d1){ d2 = d1; d1 = d; } else if (d < d2) d2 = d;
	}
	return sqrt(d2) - sqrt(d1);
}
float voronoiEdge3(vec3 x){
	vec3 n = floor(x), f = fract(x); float d1 = 8.0, d2 = 8.0;
	for (int k = -1; k <= 1; k++) for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
		vec3 g = vec3(float(i), float(j), float(k)); vec3 r = g + hash33(n + g) - f; float d = dot(r, r);
		if (d < d1){ d2 = d1; d1 = d; } else if (d < d2) d2 = d;
	}
	return sqrt(d2) - sqrt(d1);
}
// nearest feature point distance + that cell's hash, for craters
vec2 voronoiF1_3(vec3 x){
	vec3 n = floor(x), f = fract(x); float d1 = 8.0, id = 0.0;
	for (int k = -1; k <= 1; k++) for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++){
		vec3 g = vec3(float(i), float(j), float(k)); vec3 r = g + hash33(n + g) * 0.8 + 0.1 - f; float d = length(r);
		if (d < d1){ d1 = d; id = hash3(n + g + 3.3); }
	}
	return vec2(d1, id);
}
// black body-ish ramp for molten rock, t in [0, 1+]
vec3 lavaRamp(float t){
	t = clamp(t, 0.0, 1.6);
	vec3 c = mix(vec3(0.05, 0.005, 0.0), vec3(0.75, 0.08, 0.0), smoothstep(0.0, 0.35, t));
	c = mix(c, vec3(1.0, 0.42, 0.05), smoothstep(0.3, 0.7, t));
	c = mix(c, vec3(1.0, 0.85, 0.35), smoothstep(0.65, 1.0, t));
	return mix(c, vec3(1.0, 1.0, 0.85), smoothstep(1.0, 1.6, t));
}
vec3 tonemap(vec3 c){ c = 1.0 - exp(-c * 1.15); return pow(c, vec3(0.92)); }
`;

const STARS = `
vec3 starfield(vec2 uv){
	vec3 col = vec3(0.0);
	for (int L = 0; L < 3; L++){
		float fl = float(L);
		float dens = 22.0 + fl * 30.0;
		vec2 g = uv * dens + fl * 13.1;
		vec2 id = floor(g), f = fract(g);
		float h = hash2(id + fl * 7.0);
		if (h > 0.72){
			vec2 pos = hash22(id + 3.1) * 0.8 + 0.1;
			float d = length(f - pos) * (1080.0 / dens) ;  // distance in ~pixels
			float tw = 0.65 + 0.35 * sin(uTime * (1.5 + h * 4.0) + h * 40.0);
			float b = exp(-d * d * (0.9 + fl * 0.6)) * tw * (1.3 - fl * 0.35);
			vec3 tint = mix(vec3(0.75, 0.85, 1.0), vec3(1.0, 0.85, 0.7), hash2(id + 9.0));
			col += tint * b;
		}
	}
	return col;
}
`;

/** Space: nebula, stars, a planet (molten or later eras), Theia approaching, impact ejecta. */
export const SPACE = `
uniform vec3 uCam;      // zoom, centre x, centre y
uniform vec3 uEarth;    // x, y, radius (world units, y up)
uniform vec3 uTheia;    // x, y, radius (0 hides it)
uniform vec2 uContact;  // impact point
uniform float uImpact;  // seconds since impact (<0 before)
uniform float uMode;    // 0 molten, 1 Hadean ocean, 2 snowball, 3 Carboniferous, 4 today
uniform float uSpin;
uniform float uNebula;
uniform float uFreeze;  // 0..1 ice creeping from the poles to the equator
${NOISE}
${STARS}
const vec3 SUN = normalize(vec3(-0.75, 0.45, 0.55));

vec3 molten(vec3 q, vec3 n, float diff){
	float t = uTime * 0.05;
	vec3 qw = q * 5.5 + (vec3(fbm3(q * 2.0), fbm3(q * 2.0 + 5.0), fbm3(q * 2.0 + 9.0)) - 0.5) * 2.4;
	float e = voronoiEdge3(qw + vec3(0.0, t, 0.0));
	float warp = fbm3(q * 2.0 + vec3(t * 2.0));
	float pools = smoothstep(0.5, 0.68, fbm3(q * 1.4 + warp * 1.5 + vec3(t)));
	float cracks = (1.0 - smoothstep(0.0, 0.04 + 0.07 * warp, e)) * (0.55 + 0.6 * noise3(q * 9.0));
	float heat = max(cracks * (0.8 + 0.4 * warp), pools * (0.8 + 0.5 * warp));
	float halo = exp(-e / 0.15) * 0.3 + pools * 0.15;
	vec3 crust = vec3(0.06, 0.04, 0.035) * (0.45 + 1.0 * fbm3(q * 14.0)) + vec3(1.0, 0.3, 0.05) * halo * 0.35;
	return crust * (0.25 + 1.4 * diff) + lavaRamp(heat) * 1.4;
}

vec3 terran(vec3 q, vec3 n, float sdiff, float mode){
	float diff = max(sdiff, 0.0);
	float h = fbm3(q * 1.7 + 4.0) + 0.15 * fbm3(q * 7.0);
	float lat = abs(q.y);
	float landT = mode < 1.5 ? 0.66 : 0.56;
	float land = smoothstep(landT, landT + 0.015, h);
	vec3 ocean = vec3(0.01, 0.07, 0.18), ground = vec3(0.13, 0.25, 0.08);
	if (mode < 1.5){ ocean = vec3(0.02, 0.1, 0.1); ground = vec3(0.09, 0.07, 0.06); }
	else if (mode < 3.5){ ocean = vec3(0.01, 0.1, 0.22); ground = mix(vec3(0.04, 0.2, 0.05), vec3(0.1, 0.3, 0.07), fbm3(q * 9.0)); }
	else { ground = mix(vec3(0.08, 0.22, 0.06), vec3(0.45, 0.35, 0.2), smoothstep(0.35, 0.7, fbm3(q * 3.0 + 9.0)) * smoothstep(0.55, 0.2, lat)); }
	vec3 surf = mix(ocean, ground * (0.8 + 0.4 * fbm3(q * 14.0)), land);
	float ice = mode > 1.5 && mode < 2.5 ? smoothstep(0.06, 0.14, lat + 0.25 * (fbm3(q * 5.0) - 0.5))
	          : smoothstep(0.78, 0.86, lat + 0.08 * fbm3(q * 6.0));
	if (mode < 1.5) ice = 0.0;
	ice = max(ice, smoothstep(0.0, 0.08, lat - (1.0 - uFreeze) * 1.05 + 0.25 * (fbm3(q * 4.0) - 0.5)) * step(0.001, uFreeze));
	vec3 iceCol = mix(vec3(0.55, 0.68, 0.8), vec3(0.85, 0.9, 0.95), fbm3(q * 8.0));
	iceCol *= 1.0 - 0.35 * (1.0 - smoothstep(0.0, 0.05, voronoiEdge3(q * 6.0)));
	surf = mix(surf, iceCol, ice);
	float spec = (1.0 - land) * (1.0 - ice) * pow(max(dot(reflect(-SUN, n), vec3(0, 0, 1)), 0.0), 30.0) * 0.8;
	vec3 col = surf * (0.03 + 1.25 * diff) + vec3(1.0, 0.95, 0.85) * spec * step(0.0, diff);
	// Hadean: volcanic islands glow
	if (mode < 1.5) col += lavaRamp(0.8) * land * smoothstep(0.78, 0.9, fbm3(q * 20.0)) * 1.2;
	// Today: city lights on the night side
	if (mode > 3.5) col += vec3(1.0, 0.7, 0.35) * land * (1.0 - ice) * smoothstep(0.6, 0.85, noise3(q * 60.0)) * smoothstep(0.1, -0.2, sdiff) * 0.9;
	float cl = smoothstep(0.5, 0.78, fbm3(q * 2.6 + vec3(uTime * 0.02, 0.0, 0.0) + 20.0));
	if (mode < 1.5) cl = smoothstep(0.42, 0.7, fbm3(q * 2.2 + 20.0));
	col = mix(col, vec3(0.95) * (0.04 + 1.1 * diff), cl * 0.85);
	return col;
}

void main(){
	vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
	vec2 p = uv / uCam.x + uCam.yz;
	vec3 col = vec3(0.0);

	// background: faint nebula, sun bloom from the upper left, stars (slight parallax)
	vec2 bp = uv + uCam.yz * 0.15;
	float neb = fbm2(bp * 1.6 + 3.0);
	float neb2 = fbm2(bp * 3.2 - neb + 11.0);
	col += mix(vec3(0.05, 0.02, 0.09), vec3(0.18, 0.06, 0.03), neb2) * smoothstep(0.35, 0.85, neb) * uNebula;
	col += vec3(1.0, 0.7, 0.4) * 0.25 * exp(-length(uv - vec2(-1.1, 0.75)) * 2.2);
	col += starfield(bp);

	// Earth
	vec2 d = (p - uEarth.xy) / uEarth.z;
	float r2 = dot(d, d);
	float dist = sqrt(r2);
	bool molt = uMode < 0.5;
	vec3 glowCol = molt ? vec3(1.0, 0.35, 0.06) : (uMode > 1.5 && uMode < 2.5 ? vec3(0.6, 0.8, 1.0) : vec3(0.3, 0.55, 1.0));
	// halo outside the limb
	float halo = exp(-max(dist - 1.0, 0.0) * (molt ? 9.0 : 18.0)) * (molt ? 0.9 : 0.55);
	if (!molt) halo *= smoothstep(-0.6, 0.6, dot(normalize(d + 1e-4), SUN.xy) + 0.3);
	if (r2 < 1.0){
		vec3 n = vec3(d, sqrt(1.0 - r2));
		float cs = cos(uSpin), sn = sin(uSpin);
		vec3 q = vec3(cs * n.x + sn * n.z, n.y, -sn * n.x + cs * n.z);
		float diff = dot(n, SUN);
		vec3 surf = molt ? molten(q, n, max(diff, 0.0)) : terran(q, n, diff, uMode);
		float fres = pow(1.0 - n.z, 3.0);
		surf += glowCol * fres * (molt ? 1.2 : 1.0) * (molt ? 1.0 : smoothstep(-0.3, 0.4, diff));
		// impact heating spreading from the contact point
		if (uImpact >= 0.0){
			float cd = length(p - uContact) / uEarth.z;
			float front = 0.25 + 1.6 * (1.0 - exp(-uImpact * 0.9));
			float heat = smoothstep(front, front * 0.4, cd) * exp(-uImpact * 0.35);
			surf += lavaRamp(1.1 + heat * 0.5) * heat * 2.2;
		}
		float aa = smoothstep(1.0, 1.0 - 3.0 / (uRes.y * uEarth.z * uCam.x), dist);
		col = mix(col, surf, aa);
	}
	col += glowCol * halo * (r2 < 1.0 ? 0.0 : 1.0);

	// Theia: a cratered, sunlit protoplanet
	if (uTheia.z > 0.0){
		vec2 td = (p - uTheia.xy) / uTheia.z;
		float tr2 = dot(td, td);
		if (tr2 < 1.0){
			vec3 n = vec3(td, sqrt(1.0 - tr2));
			vec3 q = n + vec3(uTime * 0.03, 0.0, 0.0);
			vec3 alb = mix(vec3(0.16, 0.14, 0.13), vec3(0.46, 0.41, 0.36), fbm3(q * 3.0));
			alb *= 1.0 - 0.35 * smoothstep(0.5, 0.65, fbm3(q * 1.3 + 7.0));
			for (int c = 0; c < 2; c++){
				vec2 v = voronoiF1_3(q * (3.0 + float(c) * 4.0) + float(c) * 9.0);
				if (v.y > 0.45){
					float rr = 0.18 + 0.2 * v.y;
					float pit = smoothstep(rr, rr * 0.5, v.x);
					float rim = smoothstep(rr * 0.75, rr, v.x) * smoothstep(rr * 1.35, rr, v.x);
					alb *= 1.0 - pit * 0.4 + rim * 0.35;
				}
			}
			float diff = max(dot(n, SUN), 0.0);
			// face toward Earth lit by its glow
			vec3 toE = normalize(vec3(uEarth.xy - uTheia.xy, 0.2));
			vec3 c = alb * (0.02 + 1.3 * diff) + vec3(1.0, 0.35, 0.08) * alb * 1.6 * pow(max(dot(n, toE), 0.0), 2.0);
			float aa = smoothstep(1.0, 1.0 - 3.0 / (uRes.y * uTheia.z * uCam.x), sqrt(tr2));
			col = mix(col, c, aa);
		}
	}

	// impact: flash, fireball, ejecta spray and debris
	if (uImpact >= 0.0){
		vec2 dp = p - uContact;
		float r = length(dp);
		vec2 outward = normalize(uContact - uEarth.xy);
		float cosA = dot(dp / max(r, 1e-4), outward);
		float fb = exp(-r * r / (0.004 + uImpact * 0.02)) * (3.5 * exp(-uImpact * 1.6) + 0.4 * exp(-uImpact * 0.3));
		col += vec3(1.0, 0.9, 0.7) * fb;
		// ejecta plume: streaky cone expanding away from the planet
		float front = 0.75 * (1.0 - exp(-uImpact * 1.4)) + 0.05;
		float ang = atan(dp.y, dp.x);
		float streak = pow(noise2(vec2(ang * 18.0, 0.0)) * noise2(vec2(ang * 47.0, 3.0)), 1.5);
		float band = smoothstep(front + 0.02, front - 0.08, r) * smoothstep(0.0, front * 0.6, r);
		float cone = smoothstep(0.1, 0.7, cosA);
		col += lavaRamp(0.5 + 0.5 * streak) * band * cone * streak * 2.2 * exp(-uImpact * 0.6);
		// fireball: a turbulent orange cloud swelling from the contact point
		float R = 0.06 + 0.3 * (1.0 - exp(-uImpact * 1.1));
		float fn = fbm2(dp * 14.0 + vec2(uImpact * 0.8));
		float fire = smoothstep(R, R * 0.15, r * (0.75 + 0.6 * fn)) * smoothstep(-0.4, 0.3, cosA);
		col += lavaRamp(0.55 + 0.7 * fire * exp(-uImpact * 0.4)) * fire * 2.0 * exp(-uImpact * 0.35);
		// debris chunks
		for (int i = 0; i < 48; i++){
			float fi = float(i);
			float a = atan(outward.y, outward.x) + (hash1(fi * 3.1) - 0.5) * 2.6;
			float v = 0.25 + 0.75 * hash1(fi * 7.7);
			float tr = v * (1.0 - exp(-uImpact * 1.2)) * 0.9;
			vec2 dir = vec2(cos(a), sin(a));
			vec2 pc = uContact + dir * tr;
			vec2 rel = p - pc;
			float along = dot(rel, dir), perp = dot(rel, vec2(-dir.y, dir.x));
			float len = 0.004 + 0.05 * exp(-uImpact * 1.5) * v;
			float sz = 0.0025 + 0.004 * hash1(fi * 1.3);
			float g = exp(-(perp * perp) / (sz * sz) - max(-along, 0.0) * max(-along, 0.0) / (len * len) - max(along, 0.0) * max(along, 0.0) / (sz * sz));
			col += lavaRamp(0.95 - uImpact * 0.2 + hash1(fi) * 0.3) * g * 1.6 * exp(-uImpact * 0.25);
		}
	}

	gl_FragColor = vec4(tonemap(col), 1.0);
}
`;

/** The magma-ocean surface seen from a few metres up: cracked crust, glowing seams, ash sky, embers. */
export const MAGMA = `
uniform float uHorizon; // screen y of the horizon (uv units)
uniform float uCamH;
uniform float uPan;
uniform float uHeat;    // extra red-out as you die
uniform float uZoom;    // camera push-in around uFocus
uniform vec2 uFocus;
${NOISE}

vec3 lavaAt(vec2 w, float t){
	float flow = uTime * 0.08;
	vec2 q = w * 0.55 + vec2(0.0, flow);
	float warp = fbm2(q * 0.7 + flow * 0.5);
	vec2 qw = q + (vec2(fbm2(q * 0.9 + 3.0), fbm2(q * 0.9 + 7.0)) - 0.5) * 1.1;
	float e = voronoiEdge2(qw);
	float e2 = voronoiEdge2(qw * 2.7 + 5.0);
	float pools = smoothstep(0.6, 0.76, fbm2(q * 0.35 + warp + 5.0));
	float detail = exp(-t * 0.03);
	float width = 0.03 + 0.05 * warp + t * 0.003;
	float n = noise2(q * 3.0 + flow * 4.0);
	float cracks = (1.0 - smoothstep(0.0, width, e)) * (0.6 + 0.6 * n);
	float fine = (1.0 - smoothstep(0.0, width * 0.45, e2)) * 0.5 * smoothstep(0.35, 0.75, n);
	float heat = max(max(cracks, fine), pools * (0.85 + 0.4 * warp));
	heat = mix(0.3, heat, detail);
	float halo = exp(-e / (0.12 + t * 0.004)) * 0.4 + pools * 0.25;
	vec3 crust = vec3(0.04, 0.026, 0.024) * (0.35 + 1.3 * fbm2(w * 4.0)) + vec3(0.9, 0.22, 0.04) * halo * 0.3;
	return crust + lavaRamp(heat) * 1.5;
}

void main(){
	vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
	uv = (uv - uFocus) / uZoom + uFocus;
	// heat shimmer
	uv += vec2(noise2(uv * 18.0 + vec2(0.0, uTime * 3.0)) - 0.5, noise2(uv * 18.0 - uTime * 2.0) - 0.5) * 0.0025;
	float hy = uv.y - uHorizon;
	vec3 col;
	vec3 hazeCol = vec3(1.0, 0.42, 0.12);
	if (hy < 0.0){
		// ground: intersect the lava plane
		vec3 rd = normalize(vec3(uv.x, hy, 1.1));
		float t = uCamH / -rd.y;
		vec2 w = vec2(rd.x * t + uPan, rd.z * t);
		col = lavaAt(w, t);
		// sky glow reflected at grazing angles
		float fres = pow(1.0 - clamp(-rd.y * 3.0, 0.0, 1.0), 4.0);
		col += hazeCol * 0.35 * fres;
		col = mix(col, hazeCol * 1.25, 1.0 - exp(-t * 0.028));
	} else {
		// ash sky lit from below by the magma
		float up = hy;
		vec3 sky = mix(hazeCol * 1.3, vec3(0.4, 0.08, 0.03), smoothstep(0.0, 0.2, up));
		sky = mix(sky, vec3(0.05, 0.01, 0.012), smoothstep(0.15, 0.55, up));
		vec2 cp = vec2((uv.x + uPan * 0.02) / (up + 0.15), 1.0 / (up + 0.15)) * 0.5 + vec2(uTime * 0.04, 0.0);
		vec2 wq = cp + vec2(fbm2(cp * 0.8 + uTime * 0.02), fbm2(cp * 0.8 + 4.0)) * 1.2;
		float cl = fbm2(wq);
		float cl2 = fbm2(wq * 2.3 + 3.0);
		float dens = smoothstep(0.38, 0.72, cl);
		float lit = exp(-up * 3.5);
		vec3 cloudCol = mix(vec3(0.045, 0.012, 0.012), vec3(1.0, 0.33, 0.07), lit * (0.35 + 0.65 * smoothstep(0.35, 0.75, cl2)));
		sky = mix(sky, cloudCol, dens * 0.92);
		// distant volcano silhouettes
		float m = 0.03 + 0.05 * fbm2(vec2((uv.x + uPan * 0.05) * 3.0, 1.0)) + 0.09 * pow(max(0.0, 1.0 - abs(uv.x + 0.55 + uPan * 0.05) * 3.5), 2.0)
		        + 0.06 * pow(max(0.0, 1.0 - abs(uv.x - 0.7 + uPan * 0.05) * 4.0), 2.0);
		// eruption plume over the big volcano (behind the mountains)
		vec2 pl = vec2(uv.x + 0.55 + uPan * 0.05, up - 0.115);
		if (pl.y > 0.0){
			float wdt = 0.025 + pl.y * 0.4;
			float pn = fbm2(vec2(pl.x / wdt * 1.2, pl.y * 5.0 - uTime * 0.35));
			float plume = smoothstep(1.0, 0.35, abs(pl.x) / wdt + (0.5 - pn) * 0.9) * smoothstep(0.6, 0.15, pl.y);
			vec3 ash = mix(vec3(0.16, 0.05, 0.035), vec3(0.45, 0.14, 0.05), smoothstep(0.35, 0.7, pn));
			sky = mix(sky, mix(ash, vec3(1.0, 0.4, 0.08), exp(-pl.y * 9.0)), plume * 0.75);
		}
		sky += lavaRamp(1.0) * exp(-length(pl) * 70.0) * 1.5;
		if (up < m){
			float rim = exp(-(m - up) * 60.0);
			sky = mix(vec3(0.06, 0.018, 0.018), hazeCol, 0.2 + 0.55 * exp(-up * 40.0)) + hazeCol * rim * 0.25;
		}
		col = sky;
	}

	// embers: rising bokeh sparks, three depth layers
	for (int L = 0; L < 3; L++){
		float fl = float(L);
		float sc = 7.0 + fl * 6.0;
		vec2 g = uv * sc + vec2(uPan * (0.6 - fl * 0.15), -uTime * (0.9 - fl * 0.2) * sc * 0.12);
		g.x += sin(g.y * 0.8 + fl) * 0.3;
		vec2 id = floor(g), f = fract(g);
		float h = hash2(id + fl * 19.0);
		if (h > 0.7){
			vec2 pos = hash22(id + 5.0) * 0.7 + 0.15;
			float d = length(f - pos);
			float sz = (0.012 + 0.035 * hash2(id + 2.0)) * (1.6 - fl * 0.4);
			float b = exp(-d * d / (sz * sz)) * (0.55 + 0.45 * sin(uTime * 7.0 + h * 30.0));
			col += lavaRamp(0.55 + 0.35 * hash2(id + 8.0)) * b * (1.3 - fl * 0.3);
		}
	}
	col += hazeCol * 0.35 * exp(-abs(hy) * 30.0);

	col = mix(col, col * vec3(1.4, 0.35, 0.3), uHeat);
	gl_FragColor = vec4(tonemap(col), 1.0);
}
`;

/** A general outdoor scene for every era: sky (sun, giant moon, clouds, stars), distant mountains, and a
 *  ground plane that is land near the camera and water beyond `uCoast` (rock, ice, grass or mud). */
export const LANDSCAPE = `
uniform float uHorizon, uCamH, uPan, uFogDist, uCoast, uLandType, uClouds, uStars, uWave, uLava, uSnow, uMtn, uHaze, uMoonSize, uSunSize, uDark;
uniform vec3 uSkyTop, uSkyHor, uFog, uSunCol, uWater, uLand, uLand2, uCloudCol, uMtnCol, uLavaCol;
uniform vec2 uSunPos, uMoonPos;
${NOISE}
vec3 skyAt(vec3 rd, vec3 sun){
	float up = clamp(rd.y * 2.2, 0.0, 1.0);
	vec3 c = mix(uSkyHor, uSkyTop, pow(up, 0.7));
	float s = max(dot(rd, sun), 0.0);
	c += uSunCol * (pow(s, 12.0) * 0.35 + pow(s, 200.0) * 0.6);
	return c;
}
void main(){
	vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
	vec3 rd = normalize(vec3(uv.x, uv.y - uHorizon, 1.1));
	vec3 sun = normalize(vec3(uSunPos.x, uSunPos.y - uHorizon, 1.1));
	vec3 col;
	float hy = uv.y - uHorizon;
	if (hy >= 0.0){
		col = skyAt(rd, sun);
		// stars
		if (uStars > 0.0){
			vec2 g = uv * 90.0; vec2 id = floor(g); vec2 f = fract(g);
			float h = hash2(id);
			if (h > 0.93){ float d = length(f - hash22(id + 2.0)); col += vec3(0.9, 0.95, 1.0) * exp(-d * d * 400.0) * uStars * (0.5 + 0.5 * sin(uTime * 3.0 + h * 50.0)); }
		}
		// sun disc
		float sd = length(uv - uSunPos);
		if (uSunSize > 0.0){
			col = mix(col, uSunCol * 2.2, smoothstep(uSunSize, uSunSize * 0.92, sd));
			col += uSunCol * exp(-sd / (uSunSize * 3.0)) * 0.35;
		}
		// moon: cratered, lit from the sun's side
		if (uMoonSize > 0.0){
			vec2 md = (uv - uMoonPos) / uMoonSize;
			float r2 = dot(md, md);
			if (r2 < 1.0){
				vec3 n = vec3(md, sqrt(1.0 - r2));
				float mare = smoothstep(0.45, 0.62, fbm2(md * 1.6 + 3.0));
				float cr = fbm2(md * 7.0);
				vec3 alb = mix(vec3(0.78, 0.76, 0.72), vec3(0.42, 0.41, 0.42), mare) * (0.8 + 0.35 * cr);
				vec3 L = normalize(vec3(uSunPos - uMoonPos, 0.35));
				float lit = smoothstep(-0.05, 0.25, dot(n, L));
				vec3 mc = alb * (0.06 + 1.1 * lit);
				col = mix(col, mc + uSkyHor * 0.12, smoothstep(1.0, 0.985, sqrt(r2)));
			}
			col += vec3(0.8, 0.85, 1.0) * exp(-max(length(uv - uMoonPos) - uMoonSize, 0.0) / (uMoonSize * 0.25)) * 0.12;
		}
		// clouds (perspective layer)
		if (uClouds > 0.0){
			vec2 cp = vec2((uv.x + uPan * 0.03) / (hy + 0.12), 1.0 / (hy + 0.12)) * 0.45 + vec2(uTime * 0.02, 0.0);
			vec2 wq = cp + vec2(fbm2(cp * 0.8), fbm2(cp * 0.8 + 4.0)) * 0.9;
			float cl = fbm2(wq);
			float dens = smoothstep(1.0 - uClouds * 0.75, 1.05 - uClouds * 0.45, cl) * smoothstep(0.0, 0.06, hy);
			float litc = 0.55 + 0.45 * smoothstep(0.3, 0.8, fbm2(wq * 2.0 + 7.0));
			col = mix(col, uCloudCol * litc, dens);
		}
		// distant mountains
		if (uMtn > 0.0){
			float x = uv.x + uPan * 0.1;
			float r1 = 1.0 - abs(2.0 * noise2(vec2(x * 2.2, 1.0)) - 1.0);
			float r2 = 1.0 - abs(2.0 * noise2(vec2(x * 5.5, 7.0)) - 1.0);
			float m = uMtn * (0.012 + 0.11 * r1 * r1 + 0.035 * r2 * r2 + 0.01 * noise2(vec2(x * 30.0, 2.0)));
			float m2 = uMtn * (0.01 + 0.06 * pow(1.0 - abs(2.0 * noise2(vec2(x * 3.3 + 5.0, 4.0)) - 1.0), 2.0));
			if (hy < m){
				float snowLine = m * 0.72 + 0.01 * noise2(vec2(x * 40.0, 0.0));
				float snow = smoothstep(snowLine, snowLine + 0.006, hy) * step(0.5, uLandType) * step(uLandType, 2.5) * step(0.06, m);
				float shade = 0.75 + 0.25 * noise2(vec2(x * 60.0, hy * 60.0));
				vec3 mc = mix(uMtnCol * shade, vec3(0.86, 0.9, 0.95), snow * 0.85);
				col = mix(mc, uFog, 0.55 + 0.3 * exp(-hy * 30.0));
			}
			if (hy < m2){
				col = mix(uMtnCol * 0.8, uFog, 0.3 + 0.2 * exp(-hy * 40.0));
			}
		}
		// lava glow along the horizon
		col += uLavaCol * uLava * exp(-hy * 22.0) * 0.9;
	} else {
		float t = uCamH / -rd.y;
		vec2 w = vec2(rd.x * t + uPan, rd.z * t);
		float coast = uCoast + (fbm2(vec2(w.x * 0.15, 1.0)) - 0.5) * uCoast * 0.5;
		vec3 ground;
		if (w.y > coast){
			// water: noise normal, reflects sky and sun
			vec2 q = w * 0.9 + vec2(0.0, uTime * 0.25);
			float e = 0.05;
			float h0 = fbm2(q), hx = fbm2(q + vec2(e, 0.0)), hz = fbm2(q + vec2(0.0, e));
			vec3 n = normalize(vec3((h0 - hx) * uWave * 6.0, 1.0, (h0 - hz) * uWave * 6.0));
			vec3 rf = reflect(rd, n);
			float fres = 0.04 + 0.96 * pow(1.0 - max(dot(-rd, n), 0.0), 5.0);
			ground = mix(uWater, skyAt(rf, sun), fres * 0.9);
			ground += uSunCol * pow(max(dot(rf, sun), 0.0), 300.0) * 3.0 * step(0.001, uSunSize);
			float foam = smoothstep(0.25, 0.0, w.y - coast - 0.05 * sin(uTime * 1.3 + w.x)) * smoothstep(0.45, 0.7, fbm2(w * 2.5 + uTime * 0.4));
			ground = mix(ground, vec3(0.85), foam * 0.55);
		} else {
			float n1 = fbm2(w * 0.7), n2 = fbm2(w * 3.5 + 5.0);
			if (uLandType < 0.5){ // rock
				ground = mix(uLand, uLand2, smoothstep(0.35, 0.7, n1)) * (0.6 + 0.7 * n2);
			} else if (uLandType < 1.5){ // ice / snow drifts
				float drift = fbm2(vec2(w.x * 0.4, w.y * 1.2));
				ground = mix(uLand, uLand2, smoothstep(0.3, 0.7, drift)) * (0.92 + 0.12 * n2);
			} else if (uLandType < 2.5){ // grass
				float tufts = fbm2(w * 6.0 + 3.0);
				ground = mix(uLand, uLand2, smoothstep(0.3, 0.75, n1)) * (0.75 + 0.3 * mix(0.5, tufts, exp(-t * 0.12)) + 0.2 * n2);
			} else { // mud / cracked earth
				float e = voronoiEdge2(w * 1.2);
				ground = mix(uLand, uLand2, n1) * (0.75 + 0.35 * n2) * (0.55 + 0.45 * smoothstep(0.0, 0.06, e));
			}
			// wet sand band at the waterline
			ground = mix(ground, ground * 0.6 + uWater * 0.3, smoothstep(coast - 0.6, coast, w.y) * step(uCoast, 900.0));
		}
		// lava glow reflects off the ground far away
		ground += uLavaCol * uLava * exp(-t * 0.02) * 0.0;
		col = mix(ground, uFog, 1.0 - exp(-t / uFogDist));
		col += uLavaCol * uLava * exp(hy * 18.0) * 0.5;
	}
	// falling snow / ash
	if (uSnow > 0.0){
		for (int L = 0; L < 3; L++){
			float fl = float(L);
			float sc = 9.0 + fl * 7.0;
			vec2 g = uv * sc + vec2(uTime * (1.2 + fl) + uPan, uTime * (1.6 - fl * 0.3) * sc * 0.05);
			vec2 id = floor(g), f = fract(g);
			float h = hash2(id + fl * 13.0);
			if (h > 0.5){
				float d = length(f - hash22(id + 4.0));
				float sz = 0.03 + 0.04 * (1.0 - fl / 3.0);
				col = mix(col, vec3(0.95), exp(-d * d / (sz * sz)) * uSnow * (0.8 - fl * 0.2));
			}
		}
	}
	col = mix(col, uFog, uHaze);
	col *= 1.0 - uDark;
	gl_FragColor = vec4(tonemap(col), 1.0);
}
`;

/** Under the sea: light shafts, caustics on the seafloor, drifting particles. */
export const UNDERWATER = `
uniform vec3 uWaterCol, uDeepCol, uSandCol;
uniform float uFloorY, uPan, uMurk;
${NOISE}
float caustic(vec2 p){
	float c = 0.0;
	for (int i = 0; i < 2; i++){
		float fi = float(i);
		c += pow(1.0 - smoothstep(0.0, 0.18, voronoiEdge2(p * (1.0 + fi * 0.7) + vec2(uTime * 0.35 * (1.0 + fi), uTime * 0.2))), 2.0);
	}
	return c * 0.5;
}
void main(){
	vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
	float depth = 0.5 - uv.y;
	vec3 col = mix(uWaterCol, uDeepCol, smoothstep(0.0, 1.0, depth));
	// light shafts from the surface
	float x = uv.x + uv.y * 0.25 + uPan * 0.1;
	float rays = pow(fbm2(vec2(x * 5.0, uTime * 0.15)), 3.0) * 2.5;
	col += uWaterCol * rays * smoothstep(1.1, 0.0, depth) * 0.6;
	// surface shimmer at the top
	col += vec3(0.7, 0.95, 1.0) * smoothstep(0.44, 0.5, uv.y) * (0.4 + 0.6 * noise2(vec2(uv.x * 20.0 + uTime, uTime)));
	// seafloor
	if (uv.y < uFloorY){
		float fy = uFloorY - uv.y;
		vec2 w = vec2((uv.x + uPan * 0.5) / (fy + 0.08), 1.0 / (fy + 0.08));
		float n = fbm2(w * 0.6);
		vec3 sand = uSandCol * (0.7 + 0.5 * n);
		sand += vec3(0.8, 1.0, 0.95) * caustic(w * 0.5) * 0.35 * smoothstep(0.0, 0.3, fy);
		float fog = 1.0 - exp(-1.0 / (fy + 0.05) * 0.06);
		col = mix(sand, col, clamp(fog + uMurk * 0.3, 0.0, 1.0));
	}
	// marine snow
	for (int L = 0; L < 2; L++){
		float fl = float(L);
		vec2 g = uv * (14.0 + fl * 10.0) + vec2(uPan * 2.0, -uTime * 0.3);
		vec2 id = floor(g), f = fract(g);
		if (hash2(id + fl) > 0.8){ float d = length(f - hash22(id + 1.0)); col += vec3(0.8, 0.95, 1.0) * exp(-d * d * 300.0) * 0.25; }
	}
	col = mix(col, uDeepCol, uMurk * 0.4);
	gl_FragColor = vec4(tonemap(col), 1.0);
}
`;
