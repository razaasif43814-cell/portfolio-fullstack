/* ═══════════════════════════════════════════════════════
   custom_3d.js  – Premium 3D Graphics Engine v2
   Hero : Interactive Core + DNA Helix + Star Field
   Earth: Glowing Globe + Atmosphere + Drag-to-Spin
═══════════════════════════════════════════════════════ */

/* ── Shared theme color helper ─────────────────────── */
function getThemeColors() {
  const t = document.documentElement.getAttribute('data-theme') || 'purple';
  const map = {
    purple: { c1: 0x854ce6, c2: 0xcc00bb },
    orange: { c1: 0xe8630a, c2: 0xffa040 },
    rose:   { c1: 0xff0080, c2: 0xff6600 },
    red:    { c1: 0xdc143c, c2: 0xff4500 },
  };
  return map[t] || map.purple;
}

/* ══════════════════════════════════════════════════════
   1. HERO – Morphing Core + DNA Helix + Rings
══════════════════════════════════════════════════════ */
function initCustomHero3D() {
  const canvas = document.getElementById('custom-hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = window.innerWidth, H = window.innerHeight;
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  /* ── CENTRAL ICOSAHEDRON CORE ── */
  const coreGeo = new THREE.IcosahedronGeometry(1.4, 3);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x854ce6,
    metalness: 0.7, roughness: 0.15,
    emissive: 0x220044, emissiveIntensity: 0.6,
    transparent: true, opacity: 0.92,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  /* Wireframe shell */
  const wireGeo = new THREE.IcosahedronGeometry(1.46, 3);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xaa44ff, wireframe: true, transparent: true, opacity: 0.22,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wire);

  /* ── FLOATING MINI-ICOSAHEDRA ── */
  const floaters = [];
  const fData = [
    { x: -3.4, y:  1.6, z: -1.2, s: 0.22, sp: 0.5, ph: 0.0 },
    { x:  3.5, y:  1.0, z: -1.5, s: 0.18, sp: 0.6, ph: 1.1 },
    { x: -2.4, y: -2.0, z: -2.0, s: 0.20, sp: 0.4, ph: 2.2 },
    { x:  2.9, y: -1.8, z: -1.0, s: 0.16, sp: 0.7, ph: 3.3 },
    { x:  0.2, y:  3.1, z: -2.2, s: 0.24, sp: 0.3, ph: 4.4 },
    { x: -1.8, y:  2.7, z: -3.0, s: 0.15, sp: 0.55,ph: 5.5 },
  ];
  fData.forEach(d => {
    const m = new THREE.Mesh(
      new THREE.IcosahedronGeometry(d.s, 1),
      new THREE.MeshStandardMaterial({
        color: 0x9955ff, metalness: 0.6, roughness: 0.3,
        emissive: 0x220044, emissiveIntensity: 0.8,
        transparent: true, opacity: 0.85,
      })
    );
    m.position.set(d.x, d.y, d.z);
    m.userData = d;
    scene.add(m);
    floaters.push(m);
  });

  /* ── DNA HELIX PARTICLES ── */
  const hCount = 1200;
  const hPos   = new Float32Array(hCount * 3);
  const hCol   = new Float32Array(hCount * 3);
  const turns = 6, helixR = 3.2;
  for (let i = 0; i < hCount; i++) {
    const frac   = i / hCount;
    const angle  = frac * Math.PI * 2 * turns;
    const y      = frac * 14 - 7;
    const strand = (i % 2 === 0) ? 1 : -1;
    hPos[i*3]   = Math.cos(angle) * helixR * strand;
    hPos[i*3+1] = y;
    hPos[i*3+2] = Math.sin(angle) * helixR * strand - 2;
    // gradient: purple → pink
    hCol[i*3]   = 0.52 + frac * 0.3;
    hCol[i*3+1] = 0.30 - frac * 0.1;
    hCol[i*3+2] = 0.90 - frac * 0.2;
  }
  const helixGeo = new THREE.BufferGeometry();
  helixGeo.setAttribute('position', new THREE.BufferAttribute(hPos, 3));
  helixGeo.setAttribute('color',    new THREE.BufferAttribute(hCol, 3));
  const helixMat = new THREE.PointsMaterial({
    size: 0.06, vertexColors: true,
    transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const helix = new THREE.Points(helixGeo, helixMat);
  scene.add(helix);

  /* ── BACKGROUND STARS ── */
  const sCount = 2500;
  const sPos   = new Float32Array(sCount * 3);
  for (let i = 0; i < sCount * 3; i++) sPos[i] = (Math.random() - 0.5) * 80;
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
  scene.add(new THREE.Points(sGeo, new THREE.PointsMaterial({
    size: 0.04, color: 0xffffff, transparent: true, opacity: 0.55,
  })));

  /* ── ORBITING RINGS ── */
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.012, 8, 120),
    new THREE.MeshBasicMaterial({ color: 0x854ce6, transparent: true, opacity: 0.55 })
  );
  ring1.rotation.x = Math.PI / 3;
  scene.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.6, 0.008, 8, 100),
    new THREE.MeshBasicMaterial({ color: 0xcc00bb, transparent: true, opacity: 0.35 })
  );
  ring2.rotation.x = -Math.PI / 4;
  ring2.rotation.y =  Math.PI / 6;
  scene.add(ring2);

  /* ── LIGHTING ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const pt1 = new THREE.PointLight(0xaa44ff, 3.0, 20);
  pt1.position.set(3, 4, 4);
  scene.add(pt1);
  const pt2 = new THREE.PointLight(0xff00cc, 2.0, 15);
  pt2.position.set(-3, -3, 3);
  scene.add(pt2);

  /* ── MOUSE PARALLAX ── */
  let mx = 0, my = 0, smx = 0, smy = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ── ANIMATE ── */
  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    smx += (mx - smx) * 0.04;
    smy += (my - smy) * 0.04;

    core.rotation.x = t * 0.18 + smy * 0.4;
    core.rotation.y = t * 0.25 + smx * 0.4;
    wire.rotation.x = -t * 0.12 - smy * 0.25;
    wire.rotation.y = -t * 0.20 + smx * 0.25;

    const pulse = 1 + Math.sin(t * 2.2) * 0.04;
    core.scale.setScalar(pulse);
    wire.scale.setScalar(pulse * 1.02);

    floaters.forEach(f => {
      f.position.y = f.userData.y + Math.sin(t * f.userData.sp + f.userData.ph) * 0.35;
      f.rotation.x = t * 0.6;
      f.rotation.z = t * 0.4;
    });

    helix.rotation.y = t * 0.12 + smx * 0.3;
    helix.rotation.x = smy * 0.15;

    ring1.rotation.z = t * 0.35;
    ring2.rotation.z = -t * 0.22;

    /* Theme sync — safe color updates */
    const col = getThemeColors();
    coreMat.color.setHex(col.c1);
    wireMat.color.setHex(col.c2);
    ring1.material.color.setHex(col.c1);
    ring2.material.color.setHex(col.c2);
    pt1.color.setHex(col.c1);
    pt2.color.setHex(col.c2);
    floaters.forEach(f => f.material.color.setHex(col.c1));

    renderer.render(scene, camera);
  })();

  /* ── RESIZE ── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* ══════════════════════════════════════════════════════
   2. EDUCATION – Glowing Globe with Atmosphere
══════════════════════════════════════════════════════ */
function initCustomEarth3D() {
  const container = document.getElementById('custom-earth-wrapper');
  if (!container || typeof THREE === 'undefined') return;

  const SIZE = 300;
  container.innerHTML = `
    <div id="earth-canvas-host" style="
      width:${SIZE}px;height:${SIZE}px;margin:0 auto;
      position:relative;display:inline-block;
      border-radius:50%;
      box-shadow:0 0 60px var(--primary-glow),0 0 120px rgba(133,76,230,.15);
      cursor:grab;
      overflow:hidden;
    "></div>
    <p class="earth-label mt-1" style="text-align:center;color:var(--text-2);font-weight:600;font-size:15px;">
      🌍 Open to Opportunities Worldwide
    </p>`;

  const host = document.getElementById('earth-canvas-host');

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 4.5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(SIZE, SIZE);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  /* IMPORTANT: canvas must NOT have border-radius — container clips it */
  renderer.domElement.style.display = 'block';
  host.appendChild(renderer.domElement);

  /* ── GLOBE ── */
  const globeGeo = new THREE.SphereGeometry(1.5, 64, 64);
  const globeMat = new THREE.MeshStandardMaterial({
    color: 0x1a3a6e, metalness: 0.2, roughness: 0.7,
    emissive: 0x0a1a3a, emissiveIntensity: 0.5,
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  /* ── SURFACE DOTS ── */
  const dCount = 800, dR = 1.52;
  const dPos = new Float32Array(dCount * 3);
  const dCol = new Float32Array(dCount * 3);
  for (let i = 0; i < dCount; i++) {
    const phi   = Math.acos(1 - 2 * Math.random());
    const theta = Math.random() * Math.PI * 2;
    dPos[i*3]   = dR * Math.sin(phi) * Math.cos(theta);
    dPos[i*3+1] = dR * Math.cos(phi);
    dPos[i*3+2] = dR * Math.sin(phi) * Math.sin(theta);
    const b = Math.random();
    dCol[i*3] = 0.2 + b * 0.5; dCol[i*3+1] = 0.6 + b * 0.2; dCol[i*3+2] = 0.9;
  }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  dGeo.setAttribute('color',    new THREE.BufferAttribute(dCol, 3));
  scene.add(new THREE.Points(dGeo, new THREE.PointsMaterial({
    size: 0.045, vertexColors: true,
    transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false,
  })));

  /* ── WIREFRAME GRID ── */
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.51, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0x3355aa, wireframe: true, transparent: true, opacity: 0.10 })
  ));

  /* ── ATMOSPHERE ── */
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.72, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x4466ff, transparent: true, opacity: 0.07, side: THREE.BackSide })
  ));
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.62, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x6688ff, transparent: true, opacity: 0.05 })
  ));

  /* ── ORBIT RING ── */
  const oRingMat = new THREE.MeshBasicMaterial({ color: 0x854ce6, transparent: true, opacity: 0.7 });
  const oRing    = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.015, 8, 100), oRingMat);
  oRing.rotation.x = Math.PI / 2.5;
  scene.add(oRing);

  /* ── SATELLITE ── */
  const satMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const sat    = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), satMat);
  scene.add(sat);

  /* ── LIGHTING ── */
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(5, 3, 5);
  scene.add(sun);
  const fill = new THREE.PointLight(0x4488ff, 1.2, 20);
  fill.position.set(-4, -2, -2);
  scene.add(fill);

  /* ── DRAG ROTATION ── */
  let drag = false, px = 0, py = 0, rotX = 0, rotY = 0, velX = 0, velY = 0;

  renderer.domElement.addEventListener('mousedown',  e => { drag = true;  px = e.clientX; py = e.clientY; host.style.cursor='grabbing'; });
  renderer.domElement.addEventListener('touchstart', e => { drag = true;  px = e.touches[0].clientX; py = e.touches[0].clientY; }, { passive: true });
  window.addEventListener('mouseup',   () => { drag = false; host.style.cursor='grab'; });
  window.addEventListener('touchend',  () => { drag = false; });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    velX = (e.clientX - px) * 0.005; velY = (e.clientY - py) * 0.005;
    rotY += velX; rotX += velY; px = e.clientX; py = e.clientY;
  });
  window.addEventListener('touchmove', e => {
    if (!drag) return;
    velX = (e.touches[0].clientX - px) * 0.005; velY = (e.touches[0].clientY - py) * 0.005;
    rotY += velX; rotX += velY; px = e.touches[0].clientX; py = e.touches[0].clientY;
  }, { passive: true });

  /* ── ANIMATE ── */
  const clock2 = new THREE.Clock();
  (function animEarth() {
    requestAnimationFrame(animEarth);
    const t = clock2.getElapsedTime();

    if (!drag) { velX *= 0.95; velY *= 0.95; rotY += velX + 0.004; rotX += velY; rotX *= 0.98; }
    globe.rotation.y = rotY;
    globe.rotation.x = Math.max(-0.5, Math.min(0.5, rotX));

    /* Satellite orbit */
    const orR = 2.05, spd = 0.45;
    sat.position.x = Math.cos(t * spd) * orR;
    sat.position.y = Math.sin(t * spd) * orR * 0.45;
    sat.position.z = Math.sin(t * spd) * orR * 0.5;

    oRing.rotation.z = t * 0.3;

    /* Theme sync */
    const col = getThemeColors();
    oRingMat.color.setHex(col.c1);
    fill.color.setHex(col.c1);

    renderer.render(scene, camera);
  })();
}

/* ══════════════════════════════════════════════════════
   SAFE BOOT – works for both fresh load and cached splash
══════════════════════════════════════════════════════ */
(function boot() {
  /* Wait for THREE.js to be available */
  function tryInit() {
    if (typeof THREE === 'undefined') { setTimeout(tryInit, 100); return; }
    initCustomHero3D();
    initCustomEarth3D();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
