const NAME = 'ThatGuyIAmThatGuyNoBodyElseIsThatGuy6767';
const $ = (selector) => document.querySelector(selector);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const state = { mode: 'orbit', override: null, progress: 0, scroll: 0, pointerX: 0, pointerY: 0, warp: 0, warpTarget: 0, burst: 0, paused: reducedMotion.matches, dark: false, time: 0 };
let sceneApi;
let audio;
let audioEnabled = false;
let audioStarting = false;

$('#year').textContent = new Date().getFullYear();
const fragments = [...NAME].map((character, index) => {
  const fragment = document.createElement('span');
  fragment.className = 'name-fragment';
  fragment.textContent = character;
  fragment.style.transitionDelay = `${(index % 4) * 20}ms`;
  fragment.style.setProperty('--scatter-x', `${Math.sin(index * 2.17) * 14}px`);
  fragment.style.setProperty('--scatter-turn', `${Math.cos(index * 1.71) * 11}deg`);
  $('#name-fragments').append(fragment);
  return fragment;
});

function updateScroll() {
  const travel = document.documentElement.scrollHeight - window.innerHeight;
  state.progress = Math.max(0, Math.min(1, window.scrollY / Math.max(travel, 1)));
  state.scroll = state.progress * 3;
  const rail = $('.name-rail');
  const track = $('#name-fragments');
  const slots = Math.max(3, Math.floor((rail.clientHeight - 30) / (innerWidth < 760 ? 53 : 78)));
  const visible = Math.min(NAME.length, Math.floor(state.progress * (NAME.length - slots)) + slots);
  fragments.forEach((fragment, index) => fragment.classList.toggle('revealed', index < visible));
  const trackTravel = Math.max(0, track.scrollHeight - rail.clientHeight + 55);
  track.style.transform = `translateY(${-state.progress * trackTravel}px)`;
  $('#rail-counter').textContent = `${String(visible).padStart(2, '0')} / ${NAME.length}`;
  $('#scroll-progress').style.transform = `scaleY(${state.progress})`;
  // A deliberate mode selection lasts until the visitor starts scrolling again.
  state.override = null;
  const mode = state.progress < .24 ? 'orbit' : state.progress < .53 ? 'drift' : state.progress < .81 ? 'chaos' : 'orbit';
  setMode(mode, false);
  sceneApi?.wake();
}
window.addEventListener('scroll', updateScroll, { passive: true });
window.addEventListener('resize', updateScroll, { passive: true });

function setMode(mode, manual = true) {
  state.mode = mode;
  if (manual) state.override = mode;
  document.querySelectorAll('[data-mode]').forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (manual) {
    state.burst = 1;
    sceneApi?.wake();
    $('#scene-status').textContent = 'Hi, welcome to my technology.';
  }
}
document.querySelectorAll('[data-mode]').forEach((button) => button.addEventListener('click', () => setMode(button.dataset.mode)));

function burst() {
  state.burst = 1.6;
  sceneApi?.wake();
}
$('#burst').addEventListener('click', burst);
$('#scene').addEventListener('pointerdown', burst);
$('#explore').addEventListener('click', () => {
  burst();
  $('.drift-section').scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth' });
});
$('#back-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));

const finePointer = matchMedia('(pointer: fine)');
const cursor = $('#cursor');
window.addEventListener('pointermove', (event) => {
  state.pointerX = event.clientX / innerWidth * 2 - 1;
  state.pointerY = -(event.clientY / innerHeight * 2 - 1);
  document.documentElement.style.setProperty('--glass-x', `${50 + state.pointerX * 35}%`);
  document.documentElement.style.setProperty('--glass-y', `${50 - state.pointerY * 35}%`);
  $('#coordinates').textContent = `X ${state.pointerX >= 0 ? '+' : ''}${state.pointerX.toFixed(2)} / Y ${state.pointerY >= 0 ? '+' : ''}${state.pointerY.toFixed(2)}`;
  if (finePointer.matches && !reducedMotion.matches) {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
    cursor.classList.add('visible');
    cursor.classList.toggle('hover', Boolean(event.target.closest('button')));
  }
  sceneApi?.wake();
}, { passive: true });
document.addEventListener('pointerleave', () => cursor.classList.remove('visible'));

$('#theme-toggle').addEventListener('click', () => {
  state.dark = !state.dark;
  document.body.classList.toggle('dark', state.dark);
  $('#theme-toggle').setAttribute('aria-label', state.dark ? 'Switch to light theme' : 'Switch to dark theme');
  $('meta[name="theme-color"]').content = state.dark ? '#171915' : '#eeece5';
  sceneApi?.wake();
});

function syncMotion() {
  document.body.classList.toggle('paused', state.paused);
  $('#motion-toggle').setAttribute('aria-pressed', String(state.paused));
  $('#motion-toggle').setAttribute('aria-label', state.paused ? 'Resume animation' : 'Pause animation');
  $('#motion-toggle').title = state.paused ? 'Resume animation' : 'Pause animation';
  if (state.paused) setWarp(false);
  sceneApi?.wake();
}
$('#motion-toggle').addEventListener('click', () => {
  state.paused = !state.paused;
  syncMotion();
});
reducedMotion.addEventListener('change', () => {
  state.paused = reducedMotion.matches;
  syncMotion();
});

function setWarp(active) {
  if (state.paused || reducedMotion.matches) active = false;
  state.warpTarget = active ? 1 : 0;
  document.body.classList.toggle('warping', active);
  $('#warp > span').textContent = active ? 'Into the unknown' : 'Hold to warp';
  if (active) sceneApi?.wake();
}
$('#warp').addEventListener('pointerdown', (event) => {
  $('#warp').setPointerCapture(event.pointerId);
  setWarp(true);
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach((event) => $('#warp').addEventListener(event, () => setWarp(false)));
$('#warp').addEventListener('keydown', (event) => {
  if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); setWarp(true); }
});
$('#warp').addEventListener('keyup', (event) => {
  if (event.code === 'Space' || event.code === 'Enter') { event.preventDefault(); setWarp(false); }
});
window.addEventListener('keydown', (event) => {
  if (event.code === 'Space' && (event.target === document.body || event.target === $('#scene'))) {
    event.preventDefault();
    setWarp(true);
  }
});
window.addEventListener('keyup', (event) => { if (event.code === 'Space') setWarp(false); });
window.addEventListener('blur', () => setWarp(false));
$('#warp').addEventListener('blur', () => setWarp(false));

// Optional, locally synthesized ambience. Sound is created only after a click.
$('#sound-toggle').addEventListener('click', async () => {
  if (audioStarting) return;
  audioStarting = true;
  try {
    if (!audio) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context = new AudioContext();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;
      gain.gain.value = 0;
      filter.connect(gain).connect(context.destination);
      [55, 82.41, 110.15].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = index === 1 ? 'sine' : 'triangle';
        oscillator.frequency.value = frequency;
        oscillator.connect(filter);
        oscillator.start();
      });
      audio = { context, gain, filter };
    }
    await audio.context.resume();
    audioEnabled = !audioEnabled;
    audio.gain.gain.setTargetAtTime(audioEnabled ? .035 : 0, audio.context.currentTime, .5);
    $('#sound-toggle').setAttribute('aria-pressed', String(audioEnabled));
    $('#sound-toggle').setAttribute('aria-label', audioEnabled ? 'Mute ambient sound' : 'Enable ambient sound');
  } catch {
    $('#scene-status').textContent = 'AMBIENT SOUND IS UNAVAILABLE IN THIS BROWSER.';
  } finally { audioStarting = false; }
});

syncMotion();
updateScroll();

async function initScene() {
  const THREE = await import('./assets/three.module.js');
  const container = $('#scene');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 760 ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const lightBackground = new THREE.Color('#eeece5');
  const darkBackground = new THREE.Color('#171915');
  scene.background = lightBackground.clone();
  scene.backgroundIntensity = 1;
  const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
  camera.position.set(0, 0, 10.8);
  let cameraDistance = 10.8;
  const compositionCenter = new THREE.Vector2(.65, .5);
  const composition = new THREE.Group();
  scene.add(composition);

  // A procedural studio environment gives the copper sculpture broad reflections.
  const environmentCanvas = document.createElement('canvas');
  environmentCanvas.width = 1024;
  environmentCanvas.height = 512;
  const ctx = environmentCanvas.getContext('2d');
  ctx.fillStyle = '#25231f';
  ctx.fillRect(0, 0, 1024, 512);
  const glow = ctx.createLinearGradient(0, 0, 0, 512);
  glow.addColorStop(0, '#a99475');
  glow.addColorStop(.45, '#29241e');
  glow.addColorStop(.8, '#130f0c');
  glow.addColorStop(1, '#6f442d');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1024, 512);
  [[100, 90, 140, 280], [450, 40, 210, 150], [820, 100, 65, 280]].forEach(([x, y, w, h]) => {
    ctx.fillStyle = '#fff5de';
    ctx.fillRect(x, y, w, h);
  });
  const environment = new THREE.CanvasTexture(environmentCanvas);
  environment.mapping = THREE.EquirectangularReflectionMapping;
  environment.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromEquirectangular(environment);
  scene.environment = envTarget.texture;
  environment.dispose();
  pmrem.dispose();

  const sculpture = new THREE.Group();
  composition.add(sculpture);
  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uChaos: { value: 0 },
    uWarp: { value: 0 },
    uBurst: { value: 0 }
  };
  const copper = new THREE.MeshStandardMaterial({ color: '#c06432', metalness: .94, roughness: .29, envMapIntensity: 1.7 });
  copper.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = `uniform float uTime; uniform float uMorph; uniform float uChaos; uniform float uWarp; uniform float uBurst; varying vec3 vSculpture;\n${shader.vertexShader}`;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `
      #include <begin_vertex>
      vSculpture = position;
      float pulse = sin(position.y * 3.0 + uTime * .7) * sin(position.x * 2.5 - uTime * .4);
      transformed *= 1.0 + pulse * (.035 + uChaos * .075) + uBurst * .03;
      float twist = position.y * (uMorph * .22 + uChaos * .32) + sin(uTime * .3) * uChaos * .12;
      float c = cos(twist); float s = sin(twist);
      transformed.xz = mat2(c, -s, s, c) * transformed.xz;
      transformed.y *= 1.0 + uMorph * .22;
      transformed.x += sin(position.y * 4.0 + uTime) * uChaos * .12;
    `);
    shader.fragmentShader = `varying vec3 vSculpture; uniform float uTime; uniform float uChaos;\n${shader.fragmentShader}`;
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
      #include <color_fragment>
      float bands = sin(vSculpture.y * 72.0 + sin(vSculpture.x * 12.0) * 2.5 + vSculpture.z * 16.0);
      diffuseColor.rgb *= .88 + .12 * smoothstep(-.8, .8, bands);
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.14, .72, .58), uChaos * .25);
    `);
  };
  const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.4, .49, innerWidth < 760 ? 220 : 320, 40, 2, 3), copper);
  knot.rotation.set(.5, -.4, -.25);
  sculpture.add(knot);

  // Solid, rounded glass lenses refract the actual copper object behind them.
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: '#ffffff', metalness: 0, roughness: .055,
    transmission: 1, thickness: .65, ior: 1.43,
    clearcoat: 1, clearcoatRoughness: .08,
    envMapIntensity: .85, attenuationColor: '#fff0de', attenuationDistance: 5
  });
  const glassGeometry = new THREE.SphereGeometry(1, innerWidth < 760 ? 32 : 48, 24);
  const glassLenses = [
    { position: [-2.25, 1.8, .9], scale: [.43, .5, .38], tilt: -.35 },
    { position: [1.65, -.6, 2.9], scale: [.78, .4, .25], tilt: -.6 },
    { position: [-1.5, -2.4, 1.3], scale: [.65, .27, .24], tilt: .4 }
  ].map((settings, index) => {
    const lens = new THREE.Mesh(glassGeometry, glassMaterial);
    lens.position.fromArray(settings.position);
    lens.scale.fromArray(settings.scale);
    lens.rotation.set(.15, -.2, settings.tilt);
    lens.userData = { ...settings, phase: index * 2.2 };
    composition.add(lens);
    return lens;
  });

  const key = new THREE.DirectionalLight(0xffe3c0, 4.5);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xff8541, 3.5);
  rim.position.set(5, 1, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 1.5);
  fill.position.set(-5, -2, 2);
  scene.add(fill);
  scene.add(new THREE.AmbientLight(0xcba57a, .35));

  const orbitGroup = new THREE.Group();
  sculpture.add(orbitGroup);
  const rings = [];
  for (let ringIndex = 0; ringIndex < 3; ringIndex++) {
    const vertices = [];
    const radius = 2.9 + ringIndex * .32;
    for (let index = 0; index <= 256; index++) {
      const a = index / 256 * Math.PI * 2;
      vertices.push(Math.cos(a) * radius, Math.sin(a) * radius, 0);
    }
    const ring = new THREE.Line(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)), new THREE.LineBasicMaterial({ color: ringIndex === 1 ? 0x888575 : 0xd16a39, transparent: true, opacity: ringIndex === 1 ? .18 : .5 }));
    ring.rotation.set(.95 + ringIndex * .34, .2 + ringIndex * .4, -.4 + ringIndex * .5);
    orbitGroup.add(ring);
    rings.push(ring);
  }

  const count = innerWidth < 760 ? 1000 : 2200;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const colors = new Float32Array(count * 3);
  const randoms = new Float32Array(count);
  const orange = new THREE.Color('#c86332');
  const gray = new THREE.Color('#736e5b');
  for (let i = 0; i < count; i++) {
    const radius = 2.65 + Math.pow(Math.random(), 1.7) * 2.35;
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - .5) * 3.8;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    sizes[i] = .5 + Math.random() * 1.4;
    randoms[i] = Math.random();
    const color = Math.random() > .6 ? orange : gray;
    color.toArray(colors, i * 3);
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  dustGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  dustGeometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
  dustGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const dustMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexColors: true,
    uniforms: { ...uniforms, uPixelRatio: { value: renderer.getPixelRatio() }, uDark: { value: 0 } },
    vertexShader: `
      attribute float aSize; attribute float aRandom;
      uniform float uTime; uniform float uMorph; uniform float uChaos; uniform float uWarp; uniform float uBurst; uniform float uPixelRatio;
      varying vec3 vColor; varying float vAlpha;
      void main() {
        vec3 p = position;
        float a = uTime * (.025 + aRandom * .025) + uWarp * aRandom * 2.0;
        p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
        p *= 1.0 + uMorph * .13 + uWarp * .7 + uBurst * aRandom * .7;
        p.y += sin(uTime * .5 + aRandom * 60.0) * (.07 + uChaos * .5);
        p.y *= 1.0 + uChaos * .6;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = min(8.0, aSize * uPixelRatio * (10.0 / -mv.z) * (1.0 + uWarp * 1.5));
        vColor = color; vAlpha = .35 + aRandom * .6;
      }`,
    fragmentShader: `
      varying vec3 vColor; varying float vAlpha; uniform float uDark;
      void main() {
        float d = length(gl_PointCoord - .5);
        if(d > .5) discard;
        vec3 c = mix(vColor, vColor * 1.5 + .12, uDark);
        gl_FragColor = vec4(c, (1.0 - smoothstep(.12, .5, d)) * vAlpha);
      }`
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  composition.add(dust);

  // Fragments fly out of their orbit in the third chapter.
  const satellites = new THREE.Group();
  sculpture.add(satellites);
  const satelliteGeometry = new THREE.IcosahedronGeometry(.055, 0);
  const satelliteMaterial = new THREE.MeshStandardMaterial({ color: '#a8552d', metalness: 1, roughness: .28 });
  const fragments3d = [];
  for (let i = 0; i < 35; i++) {
    const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial);
    const angle = i / 35 * Math.PI * 2;
    const radius = 2.8 + Math.random() * .8;
    satellite.userData = { angle, radius, offset: (Math.random() - .5) * 2, scale: .3 + Math.random() * 1.4 };
    satellite.scale.setScalar(satellite.userData.scale);
    satellites.add(satellite);
    fragments3d.push(satellite);
  }

  // Radial lines stretch during warp without needing a post-processing pass.
  const streakCount = 170;
  const streakPositions = new Float32Array(streakCount * 6);
  for (let i = 0; i < streakCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 3.2 + Math.random() * 3;
    const z = (Math.random() - .5) * 5;
    streakPositions.set([Math.cos(angle) * radius, Math.sin(angle) * radius, z, Math.cos(angle) * radius * 1.4, Math.sin(angle) * radius * 1.4, z], i * 6);
  }
  const streaks = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(streakPositions, 3)), new THREE.LineBasicMaterial({ color: '#db6a33', transparent: true, opacity: 0, depthWrite: false }));
  composition.add(streaks);

  // This field lives in the full viewport, independently of the sculpture layout.
  const atmospherePositions = new Float32Array(700 * 3);
  const atmosphereSeeds = new Float32Array(700);
  for (let i = 0; i < 700; i++) {
    atmospherePositions.set([Math.random() - .5, Math.random() - .5, -Math.random() * 2], i * 3);
    atmosphereSeeds[i] = Math.random();
  }
  const atmosphereGeometry = new THREE.BufferGeometry();
  atmosphereGeometry.setAttribute('position', new THREE.BufferAttribute(atmospherePositions, 3));
  atmosphereGeometry.setAttribute('aRandom', new THREE.BufferAttribute(atmosphereSeeds, 1));
  const atmosphereMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTime: uniforms.uTime, uViewSize: { value: new THREE.Vector2() }, uDark: dustMaterial.uniforms.uDark, uPixelRatio: dustMaterial.uniforms.uPixelRatio },
    vertexShader: `
      attribute float aRandom;
      uniform float uTime; uniform vec2 uViewSize; uniform float uPixelRatio;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.x = fract(p.x + .5 + uTime * .001 * (aRandom + .2)) - .5;
        p.y += sin(uTime * .15 + aRandom * 40.0) * .003;
        p.xy *= uViewSize;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (.7 + aRandom) * uPixelRatio;
        vAlpha = .12 + aRandom * .2;
      }`,
    fragmentShader: `
      varying float vAlpha; uniform float uDark;
      void main() {
        float d = length(gl_PointCoord - .5);
        if (d > .5) discard;
        vec3 color = mix(vec3(.44, .34, .25), vec3(.8, .57, .36), uDark);
        gl_FragColor = vec4(color, vAlpha * (1.0 - smoothstep(.1, .5, d)));
      }`
  });
  const atmosphere = new THREE.Points(atmosphereGeometry, atmosphereMaterial);
  atmosphere.frustumCulled = false;
  scene.add(atmosphere);

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / Math.max(height, 1);
    // Reserve a visual area for the object, but render through a full-screen canvas.
    // The offset comes from its world position, never a cropped rendering panel.
    const mobile = width <= 760;
    const objectLeft = mobile ? 0 : width * (width <= 1100 ? .43 : .3);
    const objectRight = mobile ? 52 : width <= 1100 ? 100 : 110;
    const objectTop = mobile ? (width <= 360 ? 385 : 430) : 95;
    const objectBottom = mobile ? 85 : 75;
    const objectWidth = Math.max(width - objectLeft - objectRight, 1);
    const objectHeight = Math.max(height - objectTop - objectBottom, 180);
    compositionCenter.set((objectLeft + objectWidth / 2) / width, (objectTop + objectHeight / 2) / height);
    const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fittedDistance = Math.max(10.8, 6.4 / (2 * halfFov * Math.min(1, objectWidth / objectHeight)));
    cameraDistance = fittedDistance * height / objectHeight;
    camera.position.z = cameraDistance;
    camera.updateProjectionMatrix();
  }
  resize();
  const resizeObserver = new ResizeObserver(() => { resize(); wake(); });
  resizeObserver.observe(container);

  let frame;
  let last = performance.now();
  let darkLerp = 0;
  let morph = 0;
  let chaos = 0;
  let firstFrame = true;
  const lerp = THREE.MathUtils.lerp;
  function animate(now) {
    frame = null;
    if (document.hidden) return;
    const dt = Math.min((now - last) / 1000, .05);
    last = now;
    const animated = !state.paused && !reducedMotion.matches;
    const easing = state.paused || reducedMotion.matches ? 1 : 1 - Math.exp(-dt * 3.4);
    state.warp = lerp(state.warp, state.warpTarget, easing * .8);
    if (animated) {
      state.time += dt * (1 + state.warp * 6);
      state.burst *= Math.exp(-dt * 2);
    } else state.burst = 0;

    const scroll = state.scroll;
    const driftAmount = Math.sin(Math.min(scroll, 3) / 3 * Math.PI);
    const chaosAmount = Math.max(0, 1 - Math.abs(scroll - 1.95) / .85);
    const targetMorph = state.override ? (state.override === 'orbit' ? 0 : 1) : driftAmount;
    const targetChaos = state.override ? (state.override === 'chaos' ? 1 : 0) : chaosAmount;
    morph = lerp(morph, targetMorph, easing);
    chaos = lerp(chaos, targetChaos, easing);
    darkLerp = lerp(darkLerp, state.dark ? 1 : 0, easing);
    scene.background.copy(lightBackground).lerp(darkBackground, darkLerp);
    uniforms.uTime.value = state.time;
    uniforms.uMorph.value = morph;
    uniforms.uChaos.value = chaos;
    uniforms.uWarp.value = state.warp;
    uniforms.uBurst.value = state.burst;
    dustMaterial.uniforms.uDark.value = darkLerp;

    const turn = state.time * .055;
    const pointerFactor = reducedMotion.matches ? 0 : .08;
    sculpture.rotation.y = turn + scroll * 1.2 + state.pointerX * pointerFactor;
    sculpture.rotation.x = -.12 + Math.sin(state.time * .15) * .06 + state.pointerY * pointerFactor + morph * .25;
    sculpture.rotation.z = -.12 + Math.sin(state.time * .1) * .04 + scroll * .16;
    sculpture.position.y = Math.sin(state.time * .5) * .06;
    glassLenses.forEach((lens) => {
      const data = lens.userData;
      lens.position.x = data.position[0] + Math.sin(state.time * .18 + data.phase) * .12 + state.pointerX * pointerFactor;
      lens.position.y = data.position[1] + Math.sin(state.time * .4 + data.phase) * .14;
      lens.rotation.z = data.tilt + Math.sin(state.time * .25 + data.phase) * .1 + scroll * .12;
      lens.rotation.y = -.2 + Math.sin(state.time * .2 + data.phase) * .15;
    });
    knot.rotation.z = -.25 + morph * .55;
    knot.rotation.y = -.4 + chaos * .6;
    const knotScale = 1 + state.burst * .035 - state.warp * .11;
    knot.scale.setScalar(knotScale);
    copper.roughness = .29 - state.warp * .08;
    orbitGroup.rotation.z = state.time * .025 + scroll * .4;
    rings.forEach((ring, index) => {
      ring.scale.setScalar(1 + morph * .1 + chaos * index * .09 + state.burst * .07);
      ring.material.opacity = (index === 1 ? .18 : .45) + darkLerp * .1;
    });
    fragments3d.forEach((satellite, index) => {
      const data = satellite.userData;
      const angle = data.angle + state.time * (.07 + index * .001);
      const radius = data.radius * (1 + chaos * .35 + state.burst * .16);
      satellite.position.set(Math.cos(angle) * radius, data.offset + Math.sin(angle * 2 + state.time * .1) * (chaos * .9 + .2), Math.sin(angle) * radius);
      satellite.rotation.set(state.time * .2 + index, state.time * .15, index);
    });
    dust.rotation.z = -.35 + scroll * .12;
    dust.rotation.x = .2 + morph * .1;
    streaks.material.opacity = state.warp * .45;
    streaks.rotation.z = state.time * .03;
    streaks.scale.setScalar(1 + state.warp * .35);
    camera.position.z = cameraDistance - state.warp * 1.2 + morph * .4;
    const worldHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const worldWidth = worldHeight * camera.aspect;
    composition.position.set((compositionCenter.x - .5) * worldWidth, (.5 - compositionCenter.y) * worldHeight, 0);
    atmosphereMaterial.uniforms.uViewSize.value.set(worldWidth * 1.1, worldHeight * 1.1);
    if (audio && audioEnabled) audio.filter.frequency.setTargetAtTime(350 + state.warp * 900 + chaos * 150, audio.context.currentTime, .2);

    renderer.render(scene, camera);
    if (firstFrame) {
      container.classList.add('ready');
      firstFrame = false;
    }
    if (animated) frame = requestAnimationFrame(animate);
  }
  function wake() {
    if (!frame && !document.hidden) {
      last = performance.now();
      frame = requestAnimationFrame(animate);
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (frame) cancelAnimationFrame(frame);
      frame = null;
      setWarp(false);
      audio?.context.suspend();
    } else {
      wake();
      if (audioEnabled) audio?.context.resume();
    }
  });
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    document.body.classList.add('no-webgl');
    container.classList.remove('ready');
    $('#scene-status').textContent = 'THE ORBIT IS TAKING A BREATHER. RELOAD TO RETURN.';
  });
  wake();
  return { wake };
}

initScene().then((api) => { sceneApi = api; }).catch((error) => {
  console.warn('3D scene unavailable:', error);
  document.body.classList.add('no-webgl');
  $('#scene-status').textContent = 'A QUIETER UNIVERSE. 3D IS UNAVAILABLE HERE.';
  $('#warp').disabled = true;
  $('#motion-toggle').disabled = true;
});
