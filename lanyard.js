/**
 * Interactive 3D Physics Lanyard ID Card Simulation
 * Supports multi-container mounting for Hero Section & Gallery Showcase
 */

(function () {
  function initSingleLanyard(container) {
    if (!container || container.dataset.lanyardActive) return;
    container.dataset.lanyardActive = 'true';

    if (typeof THREE === 'undefined') {
      console.warn('Three.js not loaded yet for Lanyard simulation.');
      return;
    }

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup - Zoomed closer for a much bigger, impactful 3D card
    const aspect = (container.clientWidth || 400) / (container.clientHeight || 480);
    const camera = new THREE.PerspectiveCamera(22, aspect, 0.1, 1000);
    camera.position.set(0, 0, 14.5);



    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Balanced Studio Lighting (Preventing Overexposure)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(6, 12, 8);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa5b4fc, 0.4); // Soft rim light
    dirLight2.position.set(-6, -6, -4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 0.3, 50);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);


    // 5. Textures: Black Lanyard Strap with Repeating White Atom Icons
    const bandCanvas = document.createElement('canvas');
    bandCanvas.width = 512;
    bandCanvas.height = 64;
    const bandCtx = bandCanvas.getContext('2d');

    // Dark charcoal gray strap background
    bandCtx.fillStyle = '#27272a';
    bandCtx.fillRect(0, 0, 512, 64);

    // Draw repeating atom emblem icons
    function drawAtomIcon(ctx, x, y, radius) {
      ctx.save();
      ctx.translate(x, y);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;

      for (let angle of [0, Math.PI / 3, -Math.PI / 3]) {
        ctx.beginPath();
        ctx.rotate(angle);
        ctx.ellipse(0, 0, radius, radius * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.rotate(-angle);
      }

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (let x = 64; x < 512; x += 128) {
      drawAtomIcon(bandCtx, x, 32, 14);
    }

    const bandTexture = new THREE.CanvasTexture(bandCanvas);
    bandTexture.wrapS = THREE.RepeatWrapping;
    bandTexture.wrapT = THREE.RepeatWrapping;
    bandTexture.repeat.set(4, 1);

    // 6. Card Front & Back Texture Loader (Direct PNG Image)
    const textureLoader = new THREE.TextureLoader();
    const frontTexPath = 'images/Sohan Official.png';
    const backTexPath = 'images/card-design/ID back Executive.png';

    const cardFrontTexture = textureLoader.load(frontTexPath);
    cardFrontTexture.colorSpace = THREE.SRGBColorSpace;

    const cardBackTexture = textureLoader.load(backTexPath);
    cardBackTexture.colorSpace = THREE.SRGBColorSpace;




    // 7. Card 3D Mesh with Smooth Rounded Corners
    const cardGroup = new THREE.Group();

    const cardWidth = 2.8;
    const cardHeight = 4.2;
    const cardRadius = 0.22;

    // Create 2D Rounded Rectangle Shape
    const shape = new THREE.Shape();
    const x = -cardWidth / 2, y = -cardHeight / 2, w = cardWidth, h = cardHeight, r = cardRadius;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const extrudeSettings = {
      depth: 0.04,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.02
    };

    const cardGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    cardGeo.center();

    // Re-normalize UV coordinates so texture maps [0, 1] across full 3D card face
    const pos = cardGeo.attributes.position;
    const uvs = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      const u = (pos.getX(i) + cardWidth / 2) / cardWidth;
      const v = (pos.getY(i) + cardHeight / 2) / cardHeight;
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
    }
    cardGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));


    const frontMat = new THREE.MeshStandardMaterial({
      map: cardFrontTexture,
      roughness: 0.65,
      metalness: 0.0
    });

    const backMat = new THREE.MeshStandardMaterial({
      map: cardBackTexture,
      roughness: 0.65,
      metalness: 0.0
    });

    const cardMesh = new THREE.Mesh(cardGeo, frontMat);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    cardGroup.add(cardMesh);

    // Polished Silver Metallic Ring & Clasp Hook Hardware
    const silverMetalMat = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      metalness: 0.95,
      roughness: 0.15
    });

    const ringGeo = new THREE.TorusGeometry(0.2, 0.04, 16, 32);
    const ringMesh = new THREE.Mesh(ringGeo, silverMetalMat);
    ringMesh.position.set(0, cardHeight / 2 + 0.2, 0);
    cardGroup.add(ringMesh);

    const claspGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.35, 16);
    const claspMesh = new THREE.Mesh(claspGeo, silverMetalMat);
    claspMesh.position.set(0, cardHeight / 2 + 0.42, 0);
    cardGroup.add(claspMesh);


    scene.add(cardGroup);

    // 8. Physics Rope Simulation
    const isHero = container.classList.contains('hero-lanyard-wrapper');
    const anchorX = isHero ? 4.2 : 0;
    const anchorY = isHero ? 6.4 : 5.2;

    const anchorPoint = new THREE.Vector3(anchorX, anchorY, 0);
    const numSegments = 8;
    const nodes = [];
    const restLength = 0.52;
    const ropeHangLength = isHero ? 3.8 : 4.6;

    for (let i = 0; i <= numSegments; i++) {
      const t = i / numSegments;
      nodes.push({
        pos: new THREE.Vector3(anchorX, anchorY - t * ropeHangLength, 0),
        oldPos: new THREE.Vector3(anchorX, anchorY - t * ropeHangLength, 0),
        vel: new THREE.Vector3(0, 0, 0),
        pinned: i === 0
      });
    }



    let bandMesh;
    function updateBandGeometry() {
      const points = nodes.map(n => n.pos);
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.07, 8, false);

      if (!bandMesh) {
        const bandMat = new THREE.MeshStandardMaterial({
          map: bandTexture,
          roughness: 0.5,
          metalness: 0.1,
          side: THREE.DoubleSide
        });
        bandMesh = new THREE.Mesh(tubeGeo, bandMat);
        scene.add(bandMesh);
      } else {
        bandMesh.geometry.dispose();
        bandMesh.geometry = tubeGeo;
      }
    }

    // 9. Interactive Drag & Mouse Handling
    let isDragging = false;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragTarget = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    function getMousePos(e) {
      const rect = container.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onPointerDown(e) {
      getMousePos(e);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([cardMesh, ringMesh, claspMesh]);
      if (intersects.length > 0) {
        isDragging = true;
        container.style.cursor = 'grabbing';
      }
    }

    function onPointerMove(e) {
      getMousePos(e);
      raycaster.setFromCamera(mouse, camera);

      if (isDragging) {
        raycaster.ray.intersectPlane(plane, dragTarget);
      } else {
        const intersects = raycaster.intersectObjects([cardMesh, ringMesh, claspMesh]);
        container.style.cursor = intersects.length > 0 ? 'grab' : 'auto';
      }
    }

    function onPointerUp() {
      isDragging = false;
      container.style.cursor = 'auto';
    }

    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Physics Step
    const gravity = new THREE.Vector3(0, -18, 0);
    const damping = 0.94;

    function stepPhysics(delta) {
      const lastNode = nodes[nodes.length - 1];

      if (isDragging) {
        lastNode.pos.lerp(dragTarget, 0.65);
        lastNode.oldPos.copy(lastNode.pos);
      }

      for (let i = 1; i < nodes.length; i++) {
        const n = nodes[i];
        if (n.pinned) continue;

        const vel = n.pos.clone().sub(n.oldPos).multiplyScalar(damping);
        n.oldPos.copy(n.pos);
        n.pos.add(vel).addScaledVector(gravity, delta * delta);
      }

      for (let iter = 0; iter < 5; iter++) {
        for (let i = 0; i < nodes.length - 1; i++) {
          const n1 = nodes[i];
          const n2 = nodes[i + 1];

          const diff = n2.pos.clone().sub(n1.pos);
          const dist = diff.length();
          if (dist === 0) continue;

          const error = dist - restLength;
          const correction = diff.normalize().multiplyScalar(error * 0.5);

          if (!n1.pinned) n1.pos.add(correction);
          if (!n2.pinned) n2.pos.sub(correction);
        }
        nodes[0].pos.copy(anchorPoint);
      }

      const bottomNode = nodes[nodes.length - 1];
      const prevNode = nodes[nodes.length - 2];

      const swingDir = bottomNode.pos.clone().sub(prevNode.pos).normalize();
      const nodeVel = bottomNode.pos.clone().sub(bottomNode.oldPos);

      const targetRotZ = -swingDir.x * 1.5 - nodeVel.x * 3.0;
      const targetRotX = swingDir.z * 1.1 + Math.abs(nodeVel.y) * 0.8;
      const targetRotY = -nodeVel.x * 4.5;

      cardGroup.rotation.z += (targetRotZ - cardGroup.rotation.z) * 0.16;
      cardGroup.rotation.x += (targetRotX - cardGroup.rotation.x) * 0.16;
      cardGroup.rotation.y += (targetRotY - cardGroup.rotation.y) * 0.12;

      const claspLocalOffset = new THREE.Vector3(0, cardHeight / 2 + 0.52, 0);
      claspLocalOffset.applyQuaternion(cardGroup.quaternion);
      cardGroup.position.copy(bottomNode.pos).sub(claspLocalOffset);
    }


    let lastTime = performance.now();
    function animate() {
      requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      stepPhysics(delta);
      updateBandGeometry();

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
  }

  function initAllLanyards() {
    const containers = document.querySelectorAll('.lanyard-wrapper');
    containers.forEach(container => {
      initSingleLanyard(container);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllLanyards);
  } else {
    initAllLanyards();
  }
})();
