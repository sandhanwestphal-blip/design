/* ============================================================
   SANDHAN DESIGN — Main JavaScript
   Version: 1.0.0
   ============================================================ */

'use strict';

/* -------- Navigation -------- */
function initNav() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const mobilePanel = document.querySelector('.nav__mobile-panel');
  if (!nav) return;

  // Scroll effect
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active link
  const links = nav.querySelectorAll('.nav__links a, .nav__mobile-panel a');
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Mobile menu
  if (hamburger && mobilePanel) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobilePanel.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    mobilePanel.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobilePanel.classList.remove('open');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

/* -------- Scroll Reveal -------- */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* -------- Animated Counters -------- */
function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const fps = 60;
      const increment = target / (duration / (1000 / fps));
      let current = 0;

      const timer = setInterval(() => {
        current = Math.min(current + increment, target);
        el.textContent = Math.floor(current) + suffix;
        if (current >= target) {
          el.textContent = target + suffix;
          clearInterval(timer);
        }
      }, 1000 / fps);

      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  els.forEach(el => observer.observe(el));
}

/* -------- Kinetic Typography (Scroll Parallax) -------- */
function initKineticText() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const kineticEls = hero.querySelectorAll('[data-kinetic]');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const heroH = hero.offsetHeight;
        const progress = Math.max(0, Math.min(scrollY / heroH, 1));

        kineticEls.forEach(el => {
          const speed = parseFloat(el.dataset.kinetic) || 0.25;
          const dir = el.dataset.kdir === 'down' ? 1 : -1;
          el.style.transform = `translateY(${scrollY * speed * dir}px)`;
          el.style.opacity = Math.max(0, 1 - progress * 2);
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* -------- Three.js Hero Animation -------- */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const parent = canvas.parentElement;
  let W = parent.offsetWidth;
  let H = parent.offsetHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 1000);
  camera.position.z = 32;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Accent color ≈ oklch(0.76 0.158 72) → warm amber
  const col = 0xd4a832;

  // Outer wireframe icosahedron
  const geo1 = new THREE.IcosahedronGeometry(9, 1);
  const mat1 = new THREE.MeshBasicMaterial({ color: col, wireframe: true, opacity: 0.22, transparent: true });
  const mesh1 = new THREE.Mesh(geo1, mat1);
  scene.add(mesh1);

  // Inner wireframe icosahedron (inverted rotation)
  const geo2 = new THREE.IcosahedronGeometry(5.5, 2);
  const mat2 = new THREE.MeshBasicMaterial({ color: col, wireframe: true, opacity: 0.14, transparent: true });
  const mesh2 = new THREE.Mesh(geo2, mat2);
  scene.add(mesh2);

  // Orbital ring
  const geo3 = new THREE.TorusGeometry(13, 0.08, 8, 80);
  const mat3 = new THREE.MeshBasicMaterial({ color: col, opacity: 0.18, transparent: true });
  const ring = new THREE.Mesh(geo3, mat3);
  ring.rotation.x = Math.PI / 2.5;
  scene.add(ring);

  // Particles
  const pCount = 700;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) {
    pPos[i] = (Math.random() - 0.5) * 90;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ color: col, size: 0.12, opacity: 0.35, transparent: true });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // Mouse parallax
  let mx = 0, my = 0;
  let tx = 0, ty = 0;
  document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 1.8;
    my = (e.clientY / window.innerHeight - 0.5) * 1.8;
  }, { passive: true });

  // Animate
  let raf;
  function animate() {
    raf = requestAnimationFrame(animate);
    const t = Date.now() * 0.00018;

    // Smooth follow mouse
    tx += (mx - tx) * 0.04;
    ty += (my - ty) * 0.04;

    mesh1.rotation.x = t * 0.45 + ty * 0.12;
    mesh1.rotation.y = t + tx * 0.12;
    mesh2.rotation.x = -t * 0.65;
    mesh2.rotation.y = -t * 0.45;
    ring.rotation.z = t * 0.2;
    ring.rotation.y = tx * 0.08;
    particles.rotation.y = t * 0.04;
    particles.rotation.x = ty * 0.02;

    renderer.render(scene, camera);
  }
  animate();

  // Pause when not visible
  const visibility = () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else animate();
  };
  document.addEventListener('visibilitychange', visibility);

  // Resize
  window.addEventListener('resize', () => {
    W = parent.offsetWidth;
    H = parent.offsetHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  });
}

/* -------- Testimonial Slider -------- */
function initTestimonialSlider() {
  const slider = document.querySelector('.testimonials__track');
  const prev = document.querySelector('.testimonials__prev');
  const next = document.querySelector('.testimonials__next');
  const dots = document.querySelectorAll('.testimonials__dot');
  if (!slider) return;

  const cards = slider.querySelectorAll('.testimonial-card');
  let current = 0;
  let autoTimer;

  function goTo(idx) {
    current = (idx + cards.length) % cards.length;
    slider.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5500);
  }

  if (prev) prev.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (next) next.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startAuto(); }));

  startAuto();
}

/* -------- FAQ Accordion -------- */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const btn = item.querySelector('.faq-item__btn');
    const body = item.querySelector('.faq-item__body');
    if (!btn || !body) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(i => {
        i.classList.remove('open');
        const b = i.querySelector('.faq-item__body');
        if (b) b.style.maxHeight = '0';
      });
      if (!isOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
}

/* -------- Contact Form -------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Wird gesendet…';
    btn.disabled = true;

    // Simulate (in production: use Formspark/Web3Forms)
    await new Promise(r => setTimeout(r, 1200));

    const success = form.querySelector('.form-success');
    if (success) {
      form.style.display = 'none';
      success.style.display = 'block';
    } else {
      btn.textContent = '✓ Nachricht gesendet!';
      setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 3000);
    }
  });
}

/* -------- Gallery Hover -------- */
function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      items.forEach(i => { if (i !== item) i.style.opacity = '0.45'; });
    });
    item.addEventListener('mouseleave', () => {
      items.forEach(i => { i.style.opacity = ''; });
    });
  });
}

/* -------- Init All -------- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initCounters();
  initKineticText();
  initHeroCanvas();
  initTestimonialSlider();
  initFAQ();
  initContactForm();
  initGallery();
});
