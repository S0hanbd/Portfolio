document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamically add 'reveal' class to all major cards and sections
    const elementsToReveal = document.querySelectorAll(`
        .bento-card, 
        .section-header-card, 
        .project-bento-card, 
        .exp-bento-card, 
        .skill-bento-card, 
        .edu-bento-card, 
        .award-card, 
        .contact-bento-card,
        .hero-subcard,
        .hero-avatar-card,
        .hero-accent-card,
        .hero-social-card
    `);

    elementsToReveal.forEach((el, index) => {
        el.classList.add('reveal');
        // Add a slight stagger delay based on index if they are in the same row/grid
        // For simplicity, we just add the base class.
    });

    // 2. Set up IntersectionObserver
    const revealOptions = {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "0px 0px -50px 0px" // Trigger slightly before it comes into view
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                // Optional: Stop observing once revealed if you don't want them to animate out
                // observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // 3. Observe all elements with the 'reveal' class
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 4. Light / Dark Theme Switcher with localStorage persistence
    const initThemeToggle = () => {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        document.body.setAttribute('data-theme', currentTheme);

        const toggleBtns = document.querySelectorAll('#theme-toggle-btn, .theme-toggle-btn');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const activeTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', activeTheme);
                document.body.setAttribute('data-theme', activeTheme);
                localStorage.setItem('theme', activeTheme);
            });
        });
    };
    initThemeToggle();

    // 4b. Mobile Navigation Drawer Controller
    const initMobileNav = () => {
        const menuBtn = document.getElementById('mobile-menu-btn');
        const drawer = document.getElementById('mobile-nav-drawer');
        if (!menuBtn || !drawer) return;

        const toggleDrawer = (open) => {
            const isOpen = open !== undefined ? open : !drawer.classList.contains('open');
            drawer.classList.toggle('open', isOpen);
            menuBtn.classList.toggle('active', isOpen);
            menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            drawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
            if (isOpen) {
                document.body.classList.add('nav-drawer-open');
            } else {
                document.body.classList.remove('nav-drawer-open');
            }
        };

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDrawer();
        });

        // Close when clicking links
        const mobileLinks = drawer.querySelectorAll('.mobile-nav-link, .mobile-contact-btn');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                toggleDrawer(false);
            });
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (drawer.classList.contains('open') && !drawer.contains(e.target) && !menuBtn.contains(e.target)) {
                toggleDrawer(false);
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && drawer.classList.contains('open')) {
                toggleDrawer(false);
            }
        });

        // Close on viewport resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 860 && drawer.classList.contains('open')) {
                toggleDrawer(false);
            }
        });
    };
    initMobileNav();

    // 5. ClickSpark Canvas Port
    const canvas = document.createElement('canvas');
    canvas.id = 'click-spark-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let sparks = [];

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const getSparkColor = () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light' || document.body.getAttribute('data-theme') === 'light';
        return isLight ? '#4f46e5' : '#ffffff';
    };

    const sparkSize = 14;
    const sparkRadius = 25;
    const sparkCount = 7;
    const duration = 500;
    const extraScale = 1.0;

    const easeOut = (t) => t * (2 - t);

    let animationId = null;

    const draw = (timestamp) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const currentSparkColor = getSparkColor();

        sparks = sparks.filter(spark => {
            const elapsed = timestamp - spark.startTime;
            if (elapsed >= duration) {
                return false;
            }

            const progress = elapsed / duration;
            const eased = easeOut(progress);

            const distance = eased * sparkRadius * extraScale;
            const lineLength = sparkSize * (1 - eased);

            const x1 = spark.x + distance * Math.cos(spark.angle);
            const y1 = spark.y + distance * Math.sin(spark.angle);
            const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
            const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

            ctx.strokeStyle = currentSparkColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            return true;
        });

        if (sparks.length > 0) {
            animationId = requestAnimationFrame(draw);
        } else {
            animationId = null;
        }
    };

    document.addEventListener('click', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        const now = performance.now();

        const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
            x,
            y,
            angle: (2 * Math.PI * i) / sparkCount,
            startTime: now
        }));

        sparks.push(...newSparks);

        if (!animationId) {
            animationId = requestAnimationFrame(draw);
        }
    });

    // 6. GSAP Masonry Layout for Creative Showcase Photos
    function initMasonryGalleries() {
        const galleries = document.querySelectorAll('.gallery-grid');
        if (!galleries.length) return;

        galleries.forEach(gallery => {
            gallery.classList.add('masonry-active');
            const items = Array.from(gallery.querySelectorAll('.gallery-card'));
            if (!items.length) return;

            // Add color overlay to each card if missing
            items.forEach(item => {
                const imgWrapper = item.querySelector('.gallery-img-wrapper');
                if (imgWrapper && !imgWrapper.querySelector('.color-overlay')) {
                    const overlay = document.createElement('div');
                    overlay.className = 'color-overlay';
                    imgWrapper.appendChild(overlay);
                }
            });

            let hasMounted = false;

            const layout = () => {
                const width = gallery.getBoundingClientRect().width;
                if (!width) return;

                // Responsive columns matching Masonry hook: 1500px -> 5, 1000px -> 4, 600px -> 3, 400px -> 2, else 1
                let columns = 1;
                if (width >= 1500) columns = 5;
                else if (width >= 1000) columns = 4;
                else if (width >= 600) columns = 3;
                else if (width >= 400) columns = 2;
                else columns = 1;

                const columnWidth = width / columns;
                const colHeights = new Array(columns).fill(0);

                items.forEach((item, index) => {
                    const col = colHeights.indexOf(Math.min(...colHeights));
                    const x = columnWidth * col;
                    const y = colHeights[col];

                    const img = item.querySelector('img');
                    let itemHeight = columnWidth * 0.85; // default fallback
                    if (img && img.naturalWidth && img.naturalHeight) {
                        itemHeight = (img.naturalHeight / img.naturalWidth) * columnWidth;
                    }

                    colHeights[col] += itemHeight;

                    const animationProps = {
                        x: x,
                        y: y,
                        width: columnWidth,
                        height: itemHeight
                    };

                    if (typeof gsap !== 'undefined') {
                        if (!hasMounted) {
                            const initialState = {
                                opacity: 0,
                                x: x,
                                y: window.innerHeight + 200,
                                width: columnWidth,
                                height: itemHeight,
                                filter: 'blur(10px)'
                            };

                            gsap.fromTo(item, initialState, {
                                opacity: 1,
                                ...animationProps,
                                filter: 'blur(0px)',
                                duration: 0.6,
                                ease: 'power3.out',
                                delay: index * 0.05
                            });
                        } else {
                            gsap.to(item, {
                                ...animationProps,
                                duration: 0.6,
                                ease: 'power3.out',
                                overwrite: 'auto'
                            });
                        }
                    } else {
                        item.style.transform = `translate(${x}px, ${y}px)`;
                        item.style.width = `${columnWidth}px`;
                        item.style.height = `${itemHeight}px`;
                        item.style.opacity = '1';
                    }

                    // Hover interactions matching React props: scaleOnHover=true, hoverScale=0.95
                    if (!item.dataset.hasHoverEvents) {
                        item.dataset.hasHoverEvents = 'true';
                        item.addEventListener('mouseenter', () => {
                            if (typeof gsap !== 'undefined') {
                                gsap.to(item, {
                                    scale: 0.95,
                                    duration: 0.3,
                                    ease: 'power2.out'
                                });
                            }
                        });
                        item.addEventListener('mouseleave', () => {
                            if (typeof gsap !== 'undefined') {
                                gsap.to(item, {
                                    scale: 1.0,
                                    duration: 0.3,
                                    ease: 'power2.out'
                                });
                            }
                        });
                    }
                });

                const maxHeight = Math.max(...colHeights);
                gallery.style.height = `${maxHeight}px`;
                hasMounted = true;
            };

            // Preload images before positioning
            const images = gallery.querySelectorAll('img');
            let loadedCount = 0;
            const checkAllLoaded = () => {
                loadedCount++;
                if (loadedCount >= images.length) {
                    layout();
                }
            };

            if (images.length === 0) {
                layout();
            } else {
                images.forEach(img => {
                    if (img.complete) {
                        checkAllLoaded();
                    } else {
                        img.addEventListener('load', checkAllLoaded);
                        img.addEventListener('error', checkAllLoaded);
                    }
                });
            }

            // Dynamic resize recalculation
            window.addEventListener('resize', layout);
        });
    }

    initMasonryGalleries();
});


