/**
 * FallingText Physics Engine with Matter.js
 * Vanilla JavaScript implementation for non-React websites
 */

(function () {
  function initFallingText(container, options = {}) {
    if (!container || container.dataset.fallingTextInit) return;
    container.dataset.fallingTextInit = 'true';

    if (typeof Matter === 'undefined') {
      console.warn('Matter.js library is required for FallingText simulation.');
      return;
    }

    let items = [];
    if (Array.isArray(options.skills)) {
      items = options.skills;
    } else if (Array.isArray(options.words)) {
      items = options.words;
    } else {
      const rawText = options.text || container.dataset.text || '';
      if (rawText.includes(',')) {
        items = rawText.split(',').map(s => s.trim()).filter(Boolean);
      } else {
        items = rawText.split(' ').map(s => s.trim()).filter(Boolean);
      }
    }

    const highlightWords = options.highlightWords || ['C++', 'Java', 'Python', 'Algorithms', 'Data Structures', 'Git', 'OOP', 'UI/UX Design', 'Project Management'];
    const highlightClass = options.highlightClass || 'highlighted';
    const trigger = options.trigger || 'hover';
    const backgroundColor = options.backgroundColor || 'transparent';
    const wireframes = options.wireframes || false;
    const gravity = options.gravity !== undefined ? options.gravity : 0.56;
    const mouseConstraintStiffness = options.mouseConstraintStiffness !== undefined ? options.mouseConstraintStiffness : 0.9;
    const fontSize = options.fontSize || '1.05rem';

    container.classList.add('falling-text-container');

    const textTarget = document.createElement('div');
    textTarget.className = 'falling-text-target';
    textTarget.style.fontSize = fontSize;
    textTarget.style.lineHeight = '1.8';

    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'falling-text-canvas';

    container.innerHTML = '';
    container.appendChild(textTarget);
    container.appendChild(canvasContainer);

    // Format skill items into pill spans
    const newHTML = items
      .map(item => {
        const trimmed = item.trim();
        const isHighlighted = highlightWords.some(hw => hw.toLowerCase() === trimmed.toLowerCase());
        return `<span class="word ${isHighlighted ? highlightClass : ''}">${trimmed}</span>`;
      })
      .join(' ');
    textTarget.innerHTML = newHTML;

    let effectStarted = false;

    function startPhysics() {
      if (effectStarted) return;
      effectStarted = true;

      const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } = Matter;

      const containerRect = container.getBoundingClientRect();
      const width = containerRect.width;
      const height = containerRect.height;

      if (width <= 0 || height <= 0) return;

      const engine = Engine.create();
      engine.world.gravity.y = gravity;

      const render = Render.create({
        element: canvasContainer,
        engine,
        options: {
          width,
          height,
          background: backgroundColor,
          wireframes
        }
      });

      const boundaryOptions = {
        isStatic: true,
        render: { fillStyle: 'transparent' }
      };

      // Inset static physics boundaries with generous padding inside the card box
      const wallThickness = 100;
      const floorPadding = 65;
      const wallPadding = 50;

      const floor = Bodies.rectangle(width / 2, height - floorPadding + wallThickness / 2, width, wallThickness, boundaryOptions);
      const leftWall = Bodies.rectangle(wallPadding - wallThickness / 2, height / 2, wallThickness, height, boundaryOptions);
      const rightWall = Bodies.rectangle(width - wallPadding + wallThickness / 2, height / 2, wallThickness, height, boundaryOptions);
      const ceiling = Bodies.rectangle(width / 2, 15 - wallThickness / 2, width, wallThickness, boundaryOptions);

      const wordSpans = textTarget.querySelectorAll('.word');
      const wordBodies = Array.from(wordSpans).map(elem => {
        const rect = elem.getBoundingClientRect();
        const x = (rect.left - containerRect.left) + rect.width / 2;
        const y = (rect.top - containerRect.top) + rect.height / 2;

        const body = Bodies.rectangle(x, y, rect.width, rect.height, {
          render: { fillStyle: 'transparent' },
          restitution: 0.7,
          frictionAir: 0.015,
          friction: 0.3
        });

        Matter.Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.2) * 2
        });
        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.04);

        return { elem, body };
      });

      wordBodies.forEach(({ elem, body }) => {
        elem.style.position = 'absolute';
        elem.style.left = `${body.position.x}px`;
        elem.style.top = `${body.position.y}px`;
        elem.style.transform = 'translate(-50%, -50%)';
      });

      const mouse = Mouse.create(container);
      mouse.pixelRatio = window.devicePixelRatio || 1;

      const mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: mouseConstraintStiffness,
          render: { visible: false }
        }
      });

      render.mouse = mouse;

      World.add(engine.world, [
        floor,
        leftWall,
        rightWall,
        ceiling,
        mouseConstraint,
        ...wordBodies.map(wb => wb.body)
      ]);

      const runner = Runner.create();
      Runner.run(runner, engine);
      Render.run(render);

      function updateLoop() {
        if (!effectStarted) return;
        wordBodies.forEach(({ body, elem }) => {
          const { x, y } = body.position;
          elem.style.left = `${x}px`;
          elem.style.top = `${y}px`;
          elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
        });
        Matter.Engine.update(engine);
        requestAnimationFrame(updateLoop);
      }
      updateLoop();
    }

    if (trigger === 'auto') {
      startPhysics();
    } else if (trigger === 'scroll') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            startPhysics();
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(container);
    } else if (trigger === 'hover') {
      container.addEventListener('mouseenter', startPhysics, { once: true });
    } else if (trigger === 'click') {
      container.addEventListener('click', startPhysics, { once: true });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const el = document.getElementById('falling-skills-container');
    if (el) {
      initFallingText(el, {
        skills: [
          'C', 'C++', 'Java', 'Python', 'SQL', 'HTML5', 'CSS3',
          'Data Structures', 'Algorithms', 'OOP', 'DBMS', 'Git', 'GitHub',
          'Notion Workflows', 'MS Office', 'UI/UX Design', 'Project Management',
          'Event Marketing', 'Crisis Logistics'
        ],
        highlightWords: ['C++', 'Java', 'Python', 'Algorithms', 'Data Structures', 'Git', 'OOP', 'UI/UX Design', 'Project Management'],
        highlightClass: 'highlighted',
        trigger: 'hover',
        gravity: 0.56,
        mouseConstraintStiffness: 0.9,
        fontSize: '1.05rem'
      });
    }
  });

  window.initFallingText = initFallingText;
})();
