/**
 * DriftWall — 3D Infinite Drifting Gallery Component
 * Vanilla JavaScript implementation for non-React websites
 */

(function () {
  const CREATIVE_ITEMS = [
    // Artwork
    { image: 'images/artwork/artwork .jpg', title: 'Traditional Artwork 1' },
    { image: 'images/artwork/artwork 2.jpg', title: 'Traditional Artwork 2' },
    { image: 'images/artwork/artwork 3.jpg', title: 'Traditional Artwork 3' },
    { image: 'images/artwork/artwork 4.jpg', title: 'Traditional Artwork 4' },

    // Card Design
    { image: 'images/card-design/ID front Executive.png', title: 'Executive ID Front' },
    { image: 'images/card-design/ID back Executive.png', title: 'Executive ID Back' },

    // Digital Art
    { image: 'images/digital-art/Digital art Sohan.jpg', title: 'Digital Portrait Sohan' },
    { image: 'images/digital-art/Digital art Rakib.jpg', title: 'Digital Portrait Rakib' },
    { image: 'images/digital-art/Digital art Shakil.jpg', title: 'Digital Portrait Shakil' },
    { image: 'images/digital-art/digital art 5.jpg', title: 'Digital Vector Art' },

    // Logos
    { image: 'images/logo-design/SHBO logo.png', title: 'SHBO Youth NGO Logo' },
    { image: 'images/logo-design/ECF (1) 1.png', title: 'ECF Brand Logo' },

    // Poster Designs
    { image: 'images/poster-designs/16 DECEMBER ECDC.png', title: '16 December Victory Day Poster' },
    { image: 'images/poster-designs/Frame 60.png', title: 'Event Campaign Frame 60' },
    { image: 'images/poster-designs/Frame 61.png', title: 'Event Campaign Frame 61' },
    { image: 'images/poster-designs/Member-bright.jpg', title: 'Member Recognition Bright' },
    { image: 'images/poster-designs/Member-dark.jpg', title: 'Member Recognition Dark' },
    { image: 'images/poster-designs/New member,.png', title: 'New Member Recruitment' },
    { image: 'images/poster-designs/Instagram post - 1.png', title: 'Instagram Campaign' },
    { image: 'images/poster-designs/436227766_435355098998230_6814224491385162364_n 1.png', title: 'Event Banner 1' },
    { image: 'images/poster-designs/438224429_441885241678549_4883960390211288496_n 1.png', title: 'Event Banner 2' },
    { image: 'images/poster-designs/438225135_439472508586489_641336861919367485_n 1.png', title: 'Event Banner 3' },
    { image: 'images/poster-designs/439900155_447100977823642_7123492878624500217_n 1.png', title: 'Event Banner 4' },
    { image: 'images/poster-designs/444484455_464308886102851_1100194780237663909_n 1.png', title: 'Event Banner 5' },
    { image: 'images/poster-designs/447062534_1180449959932610_8333918475680416419_n 1.png', title: 'Event Banner 6' },
    { image: 'images/poster-designs/Untitled design (9).png', title: 'Design Poster 9' },
    { image: 'images/poster-designs/Untitled design (10).png', title: 'Design Poster 10' },
    { image: 'images/poster-designs/original-8c8ff5de09c04fcaa461190e4ff85378 1.png', title: 'Branding Poster' },

    // Typography
    { image: 'images/typography/typography 1.jpg', title: 'Typography Art 1' },
    { image: 'images/typography/typography 2.jpg', title: 'Typography Art 2' },
    { image: 'images/typography/typography 3.jpg', title: 'Typography Art 3' },
    { image: 'images/typography/typography 4.jpg', title: 'Typography Art 4' },
    { image: 'images/typography/typography 5.jpg', title: 'Typography Art 5' },
    { image: 'images/typography/typogtaphy6.jpg', title: 'Typography Art 6' },
    { image: 'images/typography/typography 7.jpg', title: 'Typography Art 7' },
    { image: 'images/typography/typography9.jpg', title: 'Typography Art 9' },
    { image: 'images/typography/typography 10.jpg', title: 'Typography Art 10' },
    { image: 'images/typography/typography 11.jpg', title: 'Typography Art 11' },
    { image: 'images/typography/typography 13.jpg', title: 'Typography Art 13' },
    { image: 'images/typography/typography 14.jpg', title: 'Typography Art 14' }
  ];

  function columnFactor(index, variance) {
    const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
    return 1 + variance * pseudo;
  }

  function initDriftWall(container, config = {}) {
    if (!container || container.dataset.driftWallInit) return;
    container.dataset.driftWallInit = 'true';

    const items = config.items || CREATIVE_ITEMS;
    const columns = config.columns || 5;
    const tileWidth = config.tileWidth || 200;
    const tileHeight = config.tileHeight || 132;
    const gap = config.gap || 18;
    const tilt = config.tilt !== undefined ? config.tilt : 16;
    const turn = config.turn !== undefined ? config.turn : -14;
    const roll = config.roll !== undefined ? config.roll : 0;
    const perspective = config.perspective || 1200;
    const depth = config.depth || 120;
    const speed = config.speed || 42;
    const direction = config.direction || 'up';
    const variance = config.variance !== undefined ? config.variance : 0.45;
    const parallax = config.parallax !== undefined ? config.parallax : 0.6;
    const lift = config.lift || 64;
    const fade = config.fade !== undefined ? config.fade : 0.6;
    const dim = config.dim !== undefined ? config.dim : 0.28;
    const overlayColor = config.overlayColor || '#060010';
    const radius = config.radius || 14;
    const pauseOnHover = !!config.pauseOnHover;

    container.classList.add('drift-wall');
    container.style.setProperty('--dw-tile-w', `${tileWidth}px`);
    container.style.setProperty('--dw-tile-h', `${tileHeight}px`);
    container.style.setProperty('--dw-gap', `${gap}px`);
    container.style.setProperty('--dw-radius', `${radius}px`);
    container.style.setProperty('--dw-perspective', `${perspective}px`);
    container.style.setProperty('--dw-lift', `${lift}px`);
    container.style.setProperty('--dw-dim', dim);
    container.style.setProperty('--dw-overlay', overlayColor);
    container.style.setProperty('--dw-edge', `${Math.max(0, (1 - fade) * 100)}%`);

    const planeEl = document.createElement('div');
    planeEl.className = 'drift-wall__plane';
    container.appendChild(planeEl);

    // Group items into columns
    const columnItems = Array.from({ length: columns }, () => []);
    items.forEach((item, i) => columnItems[i % columns].push(item));

    let containerHeight = container.clientHeight || 600;

    const columnMeta = columnItems.map(col => {
      const unit = tileHeight + gap;
      const copyHeight = Math.max(unit, col.length * unit);
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1);
      return { copyHeight, copies };
    });

    const dirSign = direction === 'up' ? 1 : -1;
    const baseVelocities = columnItems.map((_, c) => {
      const altSign = c % 2 === 0 ? 1 : -1;
      return speed * columnFactor(c, variance) * dirSign * altSign;
    });

    const offsets = columnMeta.map((meta, c) => meta.copyHeight * ((c * 0.37) % 1));
    const velocities = columnItems.map(() => 0);
    const trackRefs = [];

    // Render HTML Columns & Tracks
    columnItems.forEach((col, c) => {
      const meta = columnMeta[c];
      const colEl = document.createElement('div');
      colEl.className = 'drift-wall__col';

      const trackEl = document.createElement('div');
      trackEl.className = 'drift-wall__track';
      trackRefs.push(trackEl);

      for (let copy = 0; copy < meta.copies; copy++) {
        col.map((item, itemIdx) => {
          const tileId = `${c}-${copy}-${itemIdx}`;
          const tileEl = document.createElement('a');
          tileEl.className = 'drift-wall__tile';
          tileEl.dataset.tileId = tileId;
          tileEl.dataset.col = c;
          tileEl.href = 'creative.html';

          tileEl.innerHTML = `
            <span class="drift-wall__inner">
              <img src="${item.image}" alt="${item.title || ''}" loading="lazy" decoding="async" draggable="false" />
              <span class="drift-wall__overlay" aria-hidden="true"></span>
            </span>
          `;

          trackEl.appendChild(tileEl);
        });
      }

      colEl.appendChild(trackEl);
      planeEl.appendChild(colEl);
    });

    // Motion & Pointer Animation Logic
    let pointer = { x: 0, y: 0 };
    let pointerDamped = { x: 0, y: 0 };
    let hoveredCol = -1;
    let wallHovered = false;
    let activeTileId = null;
    let lastTs = null;
    let rafId = null;

    function applyPlaneTransform(px, py) {
      planeEl.style.transform =
        `translate(-50%, -50%) scale(1.18) ` +
        `rotateX(${tilt + py}deg) rotateY(${turn + px}deg) rotateZ(${roll}deg) ` +
        `translateZ(${-depth}px)`;
    }

    function animate(ts) {
      if (lastTs === null) lastTs = ts;
      const dt = Math.min(0.05, Math.max(0, ts - lastTs) / 1000);
      lastTs = ts;

      const maxTilt = parallax * 8;
      const targetX = pointer.x * maxTilt;
      const targetY = -pointer.y * maxTilt;
      const damp = 1 - Math.exp(-dt / 0.12);

      pointerDamped.x += (targetX - pointerDamped.x) * damp;
      pointerDamped.y += (targetY - pointerDamped.y) * damp;
      applyPlaneTransform(pointerDamped.x, pointerDamped.y);

      for (let c = 0; c < trackRefs.length; c++) {
        const meta = columnMeta[c];
        if (!meta) continue;

        const paused = wallHovered && pauseOnHover;
        const factor = paused || hoveredCol === c ? 0 : 1;
        const target = baseVelocities[c] * factor;

        const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
        velocities[c] += (target - velocities[c]) * ease;
        let next = (offsets[c] || 0) + velocities[c] * dt;
        next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
        offsets[c] = next;

        const el = trackRefs[c];
        if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`;
      }

      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    // Event Listeners
    container.addEventListener('pointermove', e => {
      const rect = container.getBoundingClientRect();
      if (parallax > 0) {
        pointer.x = (e.clientX - rect.left) / rect.width - 0.5;
        pointer.y = (e.clientY - rect.top) / rect.height - 0.5;
      }
      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const tile = hit ? hit.closest('[data-tile-id]') : null;
      if (tile) {
        const id = tile.dataset.tileId;
        if (id !== activeTileId) {
          activeTileId = id;
          hoveredCol = Number(tile.dataset.col);
          container.querySelectorAll('.drift-wall__tile.is-active').forEach(t => t.classList.remove('is-active'));
          tile.classList.add('is-active');
        }
      }
    });

    container.addEventListener('pointerenter', () => {
      wallHovered = true;
    });

    container.addEventListener('pointerleave', () => {
      wallHovered = false;
      pointer = { x: 0, y: 0 };
      hoveredCol = -1;
      activeTileId = null;
      container.querySelectorAll('.drift-wall__tile.is-active').forEach(t => t.classList.remove('is-active'));
    });
  }

  // Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    const wallElem = document.getElementById('creative-drift-wall');
    if (wallElem) {
      initDriftWall(wallElem, {
        columns: 5,
        tileWidth: 200,
        tileHeight: 132,
        gap: 18,
        tilt: 16,
        turn: -14,
        perspective: 1200,
        depth: 120,
        speed: 42,
        direction: 'up',
        variance: 0.45,
        parallax: 0.6,
        lift: 64,
        fade: 0.6,
        dim: 0.28,
        overlayColor: '#060010',
        radius: 14
      });
    }
  });

  window.initDriftWall = initDriftWall;
})();
