/* 
  DhinaCOLLECTION - International Luxury Motion & Visual Engine
  Features: 3D Parallax Hover Zoom, Glass Reflections, Smooth Lerp Interpolation
*/

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('content-loaded');
  initCinematicIntro();
  initNavbarScrollState();
  initScrollRevealObserver();
  initMagneticElements();
  initButtonRipples();
  initHeroParallax();
  initHeroProduct3DHover();
});

/* 1. 2-Second Cinematic Intro Sequence */
function initCinematicIntro() {
  const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
  const hasSeenIntro = sessionStorage.getItem('dhina_intro_played');

  if (!isHomePage && hasSeenIntro) return;

  const introOverlay = document.createElement('div');
  introOverlay.id = 'luxury-cinematic-intro';
  introOverlay.className = 'cinematic-intro-overlay';

  introOverlay.innerHTML = `
    <div class="intro-dark-veil"></div>
    <div class="intro-gold-glow"></div>
    
    <div class="intro-emblem-box">
      <div class="intro-logo-container">
        <img src="assets/logo/logo-light.svg" alt="DhinaCOLLECTION Emblem" class="intro-logo-img">
        <div class="intro-shimmer-sweep"></div>
      </div>
      
      <div class="intro-typography">
        <div class="intro-brand-name">Dhina<span class="intro-gold-text">COLLECTION</span></div>
        <div class="intro-subtitle">LUXURY INDONESIAN CURATIONS</div>
        <div class="intro-establishment">ESTABLISHED SINCE 2024 • RATED 5.3/5</div>
      </div>
    </div>
  `;

  document.body.prepend(introOverlay);

  setTimeout(() => {
    introOverlay.classList.add('intro-shimmer-active');
  }, 400);

  setTimeout(() => {
    introOverlay.classList.add('intro-fade-out');
    sessionStorage.setItem('dhina_intro_played', 'true');
    triggerHeroTextAnimation();

    setTimeout(() => {
      introOverlay.remove();
    }, 700);
  }, 2000);
}

/* 2. Staggered Headline & Content Text Animation */
function triggerHeroTextAnimation() {
  const lines = document.querySelectorAll('.hero-stagger-item');
  lines.forEach((item, index) => {
    setTimeout(() => {
      item.classList.add('stagger-visible');
    }, index * 150);
  });
}

/* 3. Navbar Glassmorphism Scroll Observer */
function initNavbarScrollState() {
  const navbar = document.querySelector('.navbar-sticky');
  if (!navbar) return;

  const checkScroll = () => {
    if (window.scrollY > 30) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();
}

/* 4. Background Motion Parallax */
function initHeroParallax() {
  const heroWrapper = document.querySelector('.hero-wrapper');
  if (!heroWrapper) return;

  heroWrapper.addEventListener('mousemove', (e) => {
    const rect = heroWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    heroWrapper.style.backgroundPosition = `calc(50% + ${x * 15}px) calc(50% + ${y * 15}px)`;
  });

  heroWrapper.addEventListener('mouseleave', () => {
    heroWrapper.style.backgroundPosition = 'center center';
  });
}

/* 5. LUXURY 3D HOVER PARALLAX + SMOOTH ZOOM FOR HERO PRODUCT IMAGE */
function initHeroProduct3DHover() {
  const container = document.getElementById('hero-img-box') || document.querySelector('.hero-slide-img-box');
  if (!container) return;

  const img = document.getElementById('hero-product-img') || container.querySelector('img');
  let reflection = container.querySelector('.glass-reflection-overlay');

  if (!reflection) {
    reflection = document.createElement('div');
    reflection.className = 'glass-reflection-overlay';
    container.appendChild(reflection);
  }

  if (!img) return;

  // Touch device detection for mobile fallback
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  if (isTouchDevice) {
    img.classList.add('mobile-breathing-img');
    return;
  }

  // Smooth lerp state
  let targetX = 0, targetY = 0, targetRotX = 0, targetRotY = 0, targetScale = 1;
  let currentX = 0, currentY = 0, currentRotX = 0, currentRotY = 0, currentScale = 1;
  let isHovered = false;
  let animFrameId = null;

  const lerp = (start, end, factor) => start + (end - start) * factor;

  function update3DMotion() {
    currentX = lerp(currentX, targetX, 0.12);
    currentY = lerp(currentY, targetY, 0.12);
    currentRotX = lerp(currentRotX, targetRotX, 0.12);
    currentRotY = lerp(currentRotY, targetRotY, 0.12);
    currentScale = lerp(currentScale, targetScale, 0.12);

    img.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`;

    if (reflection && isHovered) {
      const refX = ((currentX + 8) / 16) * 100;
      const refY = ((currentY + 8) / 16) * 100;
      reflection.style.background = `radial-gradient(circle at ${refX}% ${refY}%, rgba(255, 255, 255, 0.35) 0%, transparent 65%)`;
    }

    if (isHovered || Math.abs(currentScale - 1) > 0.001 || Math.abs(currentX) > 0.01) {
      animFrameId = requestAnimationFrame(update3DMotion);
    } else {
      img.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)';
      if (reflection) reflection.style.background = 'transparent';
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  container.addEventListener('mouseenter', () => {
    isHovered = true;
    targetScale = 1.08; // 1.08x zoom inside 1.05x-1.10x specs
    img.style.transition = 'none'; // smooth lerp frame rendering
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(update3DMotion);
    }
  });

  container.addEventListener('mousemove', (e) => {
    if (!isHovered) return;
    const rect = container.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5;  // -0.5 to 0.5

    // Precise ±8px and ±3° bounding limit
    targetX = relX * 16;       // ±8px max offset
    targetY = relY * 16;       // ±8px max offset
    targetRotX = -relY * 6;    // ±3° max rotation X
    targetRotY = relX * 6;     // ±3° max rotation Y
  });

  container.addEventListener('mouseleave', () => {
    isHovered = false;
    targetX = 0;
    targetY = 0;
    targetRotX = 0;
    targetRotY = 0;
    targetScale = 1;

    // Smooth exit easing: cubic-bezier(0.22, 1, 0.36, 1) over 600ms
    img.style.transition = 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)';
    img.style.transform = 'translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)';

    if (reflection) {
      reflection.style.background = 'transparent';
    }
  });
}

/* 6. Scroll Reveal Observer */
function initScrollRevealObserver() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -50px 0px',
    threshold: 0.05
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
      }
    });
  }, observerOptions);

  const targetSelectors = [
    '.product-card', '.cat-card', '.review-card', '.trust-item-box',
    '.section-header', '.promo-banner', '.faq-card'
  ];

  targetSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      el.style.setProperty('--reveal-delay', `${(index % 4) * 0.06}s`);
      revealObserver.observe(el);
    });
  });
}

/* 7. Magnetic Hover Parallax */
function initMagneticElements() {
  const magneticBtns = document.querySelectorAll('.btn-primary-gold, .btn-secondary-outline, .card-wishlist-btn');

  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

/* 8. Button Click Ripples */
function initButtonRipples() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .btn-primary-gold, .btn-secondary-outline, .card-action-btn');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const circle = document.createElement('span');
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add('btn-ripple');

    const existingRipple = btn.querySelector('.btn-ripple');
    if (existingRipple) existingRipple.remove();

    btn.appendChild(circle);

    setTimeout(() => circle.remove(), 600);
  });
}
