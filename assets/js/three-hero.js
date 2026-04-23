/*
 * Hero 3D — "Living Neural Network"
 * ----------------------------------------------------------------
 *  - Luminous point-nodes rendered as additive sprites (180 core +
 *    60 outer orbital ring that rotates independently)
 *  - Edge graph between nearby nodes (same indigo accent, additive)
 *  - 10 "signal pulses" that travel along random edges, retargeting
 *    when they arrive (the network actually looks *active* instead
 *    of static)
 *  - Twinkle: a handful of nodes scaled by a sine wave each frame
 *  - Breathing wireframe icosahedron at the core
 *  - Spring-damped mouse parallax (feels weighty, not whippy)
 *  - Respects prefers-reduced-motion
 */
(function () {
  const container = document.getElementById("hero-3d");
  if (!container || typeof THREE === "undefined") return;

  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Scene setup ----
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 6.4;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const ACCENT = new THREE.Color(0x818cf8);
  const ACCENT_BRIGHT = new THREE.Color(0xa5b4fc);
  const PULSE_WHITE = new THREE.Color(0xe8ecff);

  // ---- Soft radial sprite (one texture, shared across all point systems) ----
  function makeSoftSprite() {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0.0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(220,226,255,0.85)");
    g.addColorStop(0.45, "rgba(129,140,248,0.35)");
    g.addColorStop(1.0, "rgba(129,140,248,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }
  const spriteTex = makeSoftSprite();

  // ---- Reusable Points shader (per-vertex size, perspective-correct, additive) ----
  const pointVertex = `
    attribute float size;
    varying float vSize;
    uniform float uPixelRatio;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * 110.0 * uPixelRatio * (1.0 / -mv.z);
      gl_Position = projectionMatrix * mv;
      vSize = size;
    }
  `;
  const pointFragment = `
    uniform sampler2D uTex;
    uniform vec3 uColor;
    varying float vSize;
    void main() {
      vec4 t = texture2D(uTex, gl_PointCoord);
      // brighter points get a tiny extra punch, keeps variety
      gl_FragColor = vec4(uColor, 1.0) * t * (0.75 + vSize * 0.35);
    }
  `;
  function makePointsMat(color) {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTex: { value: spriteTex },
        uColor: { value: color.clone() },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: pointVertex,
      fragmentShader: pointFragment,
    });
  }

  // ---- Core node cloud ----
  const group = new THREE.Group();
  scene.add(group);

  const NODE_COUNT = 180;
  const spread = 5.8;
  const connectionDist = 1.9;

  const nodePositions = new Float32Array(NODE_COUNT * 3);
  const nodeSizes = new Float32Array(NODE_COUNT);
  const baseSizes = new Float32Array(NODE_COUNT);
  for (let i = 0; i < NODE_COUNT; i++) {
    // Slightly cluster toward center by cubing a [-1,1] random — more nodes
    // near the core, sparser at edges. Looks more like an organic cluster.
    const cluster = (r) => Math.sign(r) * Math.pow(Math.abs(r), 1.4) * spread;
    nodePositions[i * 3]     = cluster(Math.random() * 2 - 1);
    nodePositions[i * 3 + 1] = cluster(Math.random() * 2 - 1);
    nodePositions[i * 3 + 2] = cluster(Math.random() * 2 - 1);
    const s = 0.28 + Math.pow(Math.random(), 2) * 0.75;
    nodeSizes[i] = s;
    baseSizes[i] = s;
  }
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePositions, 3));
  nodeGeo.setAttribute("size", new THREE.BufferAttribute(nodeSizes, 1));
  const nodeMat = makePointsMat(ACCENT);
  const nodes = new THREE.Points(nodeGeo, nodeMat);
  group.add(nodes);

  // ---- Edges ----
  const edgePairs = []; // flat [a,b, a,b, ...]
  const edgeVerts = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    for (let j = i + 1; j < NODE_COUNT; j++) {
      const ax = nodePositions[i * 3];
      const ay = nodePositions[i * 3 + 1];
      const az = nodePositions[i * 3 + 2];
      const bx = nodePositions[j * 3];
      const by = nodePositions[j * 3 + 1];
      const bz = nodePositions[j * 3 + 2];
      const dx = ax - bx, dy = ay - by, dz = az - bz;
      if (dx * dx + dy * dy + dz * dz < connectionDist * connectionDist) {
        edgeVerts.push(ax, ay, az, bx, by, bz);
        edgePairs.push(i, j);
      }
    }
  }
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute("position", new THREE.Float32BufferAttribute(edgeVerts, 3));
  const edgeMat = new THREE.LineBasicMaterial({
    color: ACCENT,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const edges = new THREE.LineSegments(edgeGeo, edgeMat);
  group.add(edges);

  // ---- Breathing icosahedron at the core ----
  const icoGeo = new THREE.IcosahedronGeometry(1.9, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: ACCENT,
    wireframe: true,
    transparent: true,
    opacity: 0.09,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  group.add(ico);

  // second, larger, even fainter icosahedron for depth
  const icoOuterMat = icoMat.clone();
  icoOuterMat.opacity = 0.045;
  const icoOuter = new THREE.Mesh(new THREE.IcosahedronGeometry(2.8, 1), icoOuterMat);
  group.add(icoOuter);

  // ---- Outer orbital ring (flattened disc of brighter points) ----
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);
  const RING_COUNT = 60;
  const ringPositions = new Float32Array(RING_COUNT * 3);
  const ringSizes = new Float32Array(RING_COUNT);
  for (let i = 0; i < RING_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 5.5 + Math.random() * 3.5;
    const flatten = 0.35;
    ringPositions[i * 3]     = Math.cos(theta) * r;
    ringPositions[i * 3 + 1] = (Math.random() - 0.5) * 2 * flatten;
    ringPositions[i * 3 + 2] = Math.sin(theta) * r;
    ringSizes[i] = 0.22 + Math.random() * 0.55;
  }
  const ringGeo = new THREE.BufferGeometry();
  ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPositions, 3));
  ringGeo.setAttribute("size", new THREE.BufferAttribute(ringSizes, 1));
  const ringPoints = new THREE.Points(ringGeo, makePointsMat(ACCENT_BRIGHT));
  ringGroup.add(ringPoints);

  // ---- Signal pulses traveling along random edges ----
  const PULSE_COUNT = Math.min(12, Math.max(4, Math.floor(edgePairs.length / 40)));
  const pulsePositions = new Float32Array(PULSE_COUNT * 3);
  const pulseSizesAttr = new Float32Array(PULSE_COUNT).fill(1.5);
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute("position", new THREE.BufferAttribute(pulsePositions, 3));
  pulseGeo.setAttribute("size", new THREE.BufferAttribute(pulseSizesAttr, 1));
  const pulseMat = makePointsMat(PULSE_WHITE);
  const pulses = new THREE.Points(pulseGeo, pulseMat);
  group.add(pulses);

  const numEdges = edgePairs.length / 2;
  const pulseState = [];
  for (let i = 0; i < PULSE_COUNT; i++) {
    pulseState.push({
      edge: Math.floor(Math.random() * numEdges),
      t: Math.random(),
      speed: 0.006 + Math.random() * 0.014,
    });
  }

  // ---- Mouse with spring physics ----
  const target = { x: 0, y: 0 };
  const spring = { x: 0, y: 0, vx: 0, vy: 0 };
  window.addEventListener("mousemove", (e) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  });
  window.addEventListener("touchmove", (e) => {
    if (!e.touches[0]) return;
    target.x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
    target.y = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ---- Animate ----
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Spring-damped parallax: feels heavier than a simple lerp
    const K = 0.045, DAMP = 0.88;
    spring.vx += (target.x - spring.x) * K;
    spring.vy += (target.y - spring.y) * K;
    spring.vx *= DAMP;
    spring.vy *= DAMP;
    spring.x += spring.vx;
    spring.y += spring.vy;

    // Core group rotates toward mouse + a slow auto-spin
    const spin = reduceMotion ? 0 : 0.0007;
    group.rotation.x += (spring.y * 0.28 - group.rotation.x) * 0.05;
    group.rotation.y += (spring.x * 0.28 - group.rotation.y) * 0.05;
    group.rotation.z += spin;

    // Outer ring: independent slow spin + small tilt wobble — gives depth
    if (!reduceMotion) {
      ringGroup.rotation.y = -t * 0.05;
      ringGroup.rotation.x = Math.sin(t * 0.12) * 0.1 + spring.y * 0.12;
      ringGroup.rotation.z = Math.cos(t * 0.09) * 0.08;
    }

    // Breathing + counter-rotating icosahedra
    const breathe = 1 + Math.sin(t * 0.55) * 0.04;
    ico.scale.setScalar(breathe);
    ico.rotation.y = t * 0.09;
    ico.rotation.x = t * 0.06;
    icoOuter.scale.setScalar(1 + Math.sin(t * 0.4 + 1.5) * 0.02);
    icoOuter.rotation.y = -t * 0.04;
    icoOuter.rotation.z = t * 0.03;

    // Twinkle: modulate a handful of node sizes each frame so the
    // cloud feels alive without expensive full-buffer updates.
    const sizeAttr = nodeGeo.attributes.size;
    const twinkleCount = 14;
    for (let k = 0; k < twinkleCount; k++) {
      const idx = (Math.floor(t * 60) + k * 13) % NODE_COUNT;
      const mod = 1 + Math.sin(t * 2.4 + idx * 0.37) * 0.55;
      sizeAttr.array[idx] = baseSizes[idx] * mod;
    }
    sizeAttr.needsUpdate = true;

    // Edge opacity gently breathes too
    edgeMat.opacity = 0.085 + Math.sin(t * 0.45) * 0.035;

    // Move signal pulses along their edges; retarget on arrival
    const pPos = pulseGeo.attributes.position;
    for (let i = 0; i < PULSE_COUNT; i++) {
      const p = pulseState[i];
      p.t += p.speed;
      if (p.t >= 1) {
        p.edge = Math.floor(Math.random() * numEdges);
        p.t = 0;
        p.speed = 0.006 + Math.random() * 0.014;
      }
      const a = edgePairs[p.edge * 2];
      const b = edgePairs[p.edge * 2 + 1];
      const ax = nodePositions[a * 3];
      const ay = nodePositions[a * 3 + 1];
      const az = nodePositions[a * 3 + 2];
      const bx = nodePositions[b * 3];
      const by = nodePositions[b * 3 + 1];
      const bz = nodePositions[b * 3 + 2];
      pPos.array[i * 3]     = ax + (bx - ax) * p.t;
      pPos.array[i * 3 + 1] = ay + (by - ay) * p.t;
      pPos.array[i * 3 + 2] = az + (bz - az) * p.t;
    }
    pPos.needsUpdate = true;

    renderer.render(scene, camera);
  }
  animate();

  // ---- Resize ----
  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    nodeMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    ringPoints.material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    pulseMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  });
})();
