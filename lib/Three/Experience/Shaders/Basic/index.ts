const BasicShader = {
  uniforms: {},
  fragmentShader: `#ifdef LINT
  precision mediump float;
  uniform mat4 viewMatrix;
  uniform vec3 cameraPosition;
  #endif
  
  #define M_PI 3.14159265358979323846
  
  varying vec4 vColor;
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main(){
    gl_FragColor=vec4(vUv,1.,1.);
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
  
  varying vec4 vColor;
  varying vec2 vUv;
  varying vec3 vNormal;
  
  void main(){
    vUv=uv;
    vNormal=normal;
    vColor=vec4(1.,1.,1.,1.);
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectionPosition=projectionMatrix*viewPosition;
    gl_Position=projectionPosition;
  }`,
}

export default BasicShader
