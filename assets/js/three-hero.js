(function () {
  const container = document.getElementById("hero-3d");
  if (!container || typeof THREE === "undefined") return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 6;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // --- Build neural-network-style node cloud ---
  const group = new THREE.Group();
  scene.add(group);

  const nodeCount = 80;
  const spread = 7;
  const connectionDist = 2.8;
  const accent = 0x818cf8;

  const nodeGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const nodes = [];

  for (let i = 0; i < nodeCount; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.6 + Math.random() * 0.4,
    });
    const mesh = new THREE.Mesh(nodeGeo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread
    );
    group.add(mesh);
    nodes.push(mesh);
  }

  // Edges between nearby nodes
  const edgeMat = new THREE.LineBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0.12,
  });

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i].position.distanceTo(nodes[j].position) < connectionDist) {
        const geo = new THREE.BufferGeometry().setFromPoints([
          nodes[i].position.clone(),
          nodes[j].position.clone(),
        ]);
        group.add(new THREE.Line(geo, edgeMat));
      }
    }
  }

  // Add a subtle wireframe icosahedron at center
  const icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: accent,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  group.add(new THREE.Mesh(icoGeo, icoMat));

  // --- Mouse tracking ---
  const mouse = { x: 0, y: 0 };
  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // --- Animate ---
  function animate() {
    requestAnimationFrame(animate);
    group.rotation.x += (mouse.y * 0.3 - group.rotation.x) * 0.015;
    group.rotation.y += (mouse.x * 0.3 - group.rotation.y) * 0.015;
    group.rotation.z += 0.0008;
    renderer.render(scene, camera);
  }
  animate();

  // --- Resize ---
  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
})();
