/**
 * Interactive WebGL Gradient Waves Shader Background
 * Custom WebGL2 Raymarching Plasma Wave Engine
 * Configured for Sohanur Rahman Sohan's Portfolio
 */

(function () {
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [1, 1, 1];
    return [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255];
  }

  const vertexShaderSource = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

  const fragmentShaderSource = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}`;

  function initGradientWaves() {
    let canvas = document.getElementById('gradient-waves-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'gradient-waves-canvas';
      canvas.className = 'gradient-waves-background';
      document.body.prepend(canvas);
    }

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false
    });

    if (!gl) {
      console.warn('WebGL2 not supported for GradientWaves background');
      return;
    }

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen Triangle
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       3, -1,
      -1,  3
    ]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform Locations
    const uLocs = {
      iResolution: gl.getUniformLocation(program, 'iResolution'),
      iTime: gl.getUniformLocation(program, 'iTime'),
      uSpeed: gl.getUniformLocation(program, 'uSpeed'),
      uAmplitude: gl.getUniformLocation(program, 'uAmplitude'),
      uWaveScale: gl.getUniformLocation(program, 'uWaveScale'),
      uWaveRatio: gl.getUniformLocation(program, 'uWaveRatio'),
      uSwell: gl.getUniformLocation(program, 'uSwell'),
      uTurbulence: gl.getUniformLocation(program, 'uTurbulence'),
      uTilt: gl.getUniformLocation(program, 'uTilt'),
      uZoom: gl.getUniformLocation(program, 'uZoom'),
      uHeight: gl.getUniformLocation(program, 'uHeight'),
      uFogDepth: gl.getUniformLocation(program, 'uFogDepth'),
      uSteps: gl.getUniformLocation(program, 'uSteps'),
      uBrightness: gl.getUniformLocation(program, 'uBrightness'),
      uOpacity: gl.getUniformLocation(program, 'uOpacity'),
      uGrain: gl.getUniformLocation(program, 'uGrain'),
      uGrainIntensity: gl.getUniformLocation(program, 'uGrainIntensity'),
      uMouse: gl.getUniformLocation(program, 'uMouse'),
      uParallax: gl.getUniformLocation(program, 'uParallax'),
      uEnableMouse: gl.getUniformLocation(program, 'uEnableMouse'),
      uHorizonColor: gl.getUniformLocation(program, 'uHorizonColor'),
      uWaveColor: gl.getUniformLocation(program, 'uWaveColor'),
      uCrestColor: gl.getUniformLocation(program, 'uCrestColor')
    };

    // Set Uniform Values (User Parameters)
    gl.uniform1f(uLocs.uSpeed, 0.4);
    gl.uniform1f(uLocs.uAmplitude, 2.5);
    gl.uniform1f(uLocs.uWaveScale, 0.6);
    gl.uniform1f(uLocs.uWaveRatio, 0.9);
    gl.uniform1f(uLocs.uSwell, 35.0);
    gl.uniform1f(uLocs.uTurbulence, 20.0);
    gl.uniform1f(uLocs.uTilt, 1.11);
    gl.uniform1f(uLocs.uZoom, 1.0);
    gl.uniform1f(uLocs.uHeight, 5.5);
    gl.uniform1f(uLocs.uFogDepth, 15.0);
    gl.uniform1f(uLocs.uSteps, 70.0);
    gl.uniform1f(uLocs.uBrightness, 1.25); // Subtle color pop
    gl.uniform1f(uLocs.uOpacity, 0.85); // Richer color vibrance
    gl.uniform1f(uLocs.uGrain, 1.0);
    gl.uniform1f(uLocs.uGrainIntensity, 0.05);
    gl.uniform1f(uLocs.uParallax, 0.5);
    gl.uniform1i(uLocs.uEnableMouse, 1);


    const horizonRGB = hexToRgb('#5227FF');
    const waveRGB = hexToRgb('#FF9FFC');
    const crestRGB = hexToRgb('#FFFFFF');

    gl.uniform3fv(uLocs.uHorizonColor, new Float32Array(horizonRGB));
    gl.uniform3fv(uLocs.uWaveColor, new Float32Array(waveRGB));
    gl.uniform3fv(uLocs.uCrestColor, new Float32Array(crestRGB));

    // Mouse Tracking
    const currentMouse = [0.5, 0.5];
    const targetMouse = [0.5, 0.5];

    window.addEventListener('mousemove', e => {
      targetMouse[0] = e.clientX / window.innerWidth;
      targetMouse[1] = 1.0 - (e.clientY / window.innerHeight);
    });

    // Resize Handler
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth * dpr;
      const height = window.innerHeight * dpr;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
        gl.uniform2f(uLocs.iResolution, width, height);
      }
    }
    window.addEventListener('resize', resize);
    resize();

    // Render Loop
    const startTime = performance.now();
    function render(currentTime) {
      const elapsed = (currentTime - startTime) * 0.001;
      gl.uniform1f(uLocs.iTime, elapsed);

      // Smooth mouse lerping
      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
      gl.uniform2f(uLocs.uMouse, currentMouse[0], currentMouse[1]);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGradientWaves);
  } else {
    initGradientWaves();
  }
})();
