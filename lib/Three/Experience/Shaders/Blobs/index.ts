import type { IUniform } from 'three'
import { Color } from 'three'

type Uniforms = { [uniform: string]: IUniform }

const DEFAULTS = {
  scale: 1.2,
  // scale: 2.7,
  threshold: 0,
  timeScale: 0.03,
  scaleMin: 0.001,
  scaleMax: 0.01,
  speedMin: 0.001,
  speedMax: 1.0,
  resolution: 1,
  scrollOffset: 0,
}

const uniforms: Uniforms = {
  u_resolution: { value: { x: null, y: null } },
  u_time: { value: 0.0 },
  u_mouse: { value: { x: null, y: null } },
  u_scale: { value: DEFAULTS.scale },
  u_max: { value: new Color(0.9, 0.9, 0.9) },
  u_min: { value: new Color('#fafafa') },
  u_threshold: { value: DEFAULTS.threshold },
  u_timeScale: { value: DEFAULTS.timeScale },
  u_texture: { value: null },
  u_scrollOffset: { value: DEFAULTS.scrollOffset },
}

const BasicShader = {
  uniforms,
  fragmentShader: `#ifdef LINT
precision mediump float;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
#endif
#define M_PI 3.1415926535897932384626433832795
varying vec2 v_uv;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform vec3 u_color;
uniform float u_time;
uniform float u_scale;
uniform vec3 u_max;
uniform vec3 u_min;
uniform float u_threshold;
uniform float u_timeScale;
uniform sampler2D u_texture;
uniform float u_scrollOffset;

//	Simplex 3D Noise 
//	by Ian McEwan, Ashima Arts
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //  x0 = x0 - 0. + 0.0 * C 
  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1. + 3.0 * C.xxx;

// Permutations
  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients
// ( N*N points uniformly over a square, mapped onto an octahedron.)
  float n_ = 1.0/7.0; // N=7
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() { 
  float scale = u_scale /1000.;
  vec4 max = vec4(u_max,1.);
  vec4 min = vec4(u_min,1.);
  float threshold = u_threshold;
  float timeScale = u_timeScale;

  float f = 0.0;
  float time = u_time * timeScale;
  vec2 uv = v_uv * u_resolution * scale;
  uv.y -= u_scrollOffset * u_resolution.y * scale;
  f = snoise(vec3(uv.x, uv.y, time));
  float grad = (v_uv.y)*1.5-1.;
  // float grad = 0.;
  
  // float b = (1.0 - length(v_uv - (vec2(u_mouse.x,u_resolution.y- u_mouse.y)) / u_resolution) * 4.0);

  float aspect = u_resolution.x / u_resolution.y;
  float c = length(
    vec2(
      (v_uv.x*aspect),
      v_uv.y
    )
    - vec2(
      u_mouse.x*aspect,
      u_mouse.y
    )
  )  ;

  float b = ( (1.-(c*3.)))/1.1; 

  
  b = smoothstep(0.0, 1.0, b);
  
  f = (f+b+grad)/3.0;
  f = (f+1.) /2.;
  f = smoothstep(0.4, .6, f);
  float x = smoothstep(0.4, .6, f);

  gl_FragColor = vec4(1.,0.,0.,1.);
  gl_FragColor = mix(min, max, x);
  // gl_FragColor = min;

  // gl_FragColor.a = smoothstep(0.0, .60, f);
  // gl_FragColor.a = grad;
  // gl_FragColor = vec4(vec3(x), 1.0);
  // gl_FragColor = vec4(vec3(b), 1.0);


}`,
  vertexShader: `#ifdef LINT
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
#endif

#define M_PI 3.14159265358979323846

varying vec2 v_uv;
void main() {
  v_uv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
}

export default BasicShader
