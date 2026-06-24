'use strict';

gsap.registerPlugin(ScrollTrigger);

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// 1. Loader
const loader = $('#loader');
const loaderBar = $('#loaderProgress');
const loaderPercent = $('#loaderPercent');
let progress = 0;

const loadTimer = setInterval(() => {
  progress += Math.random() * 10;

  if (progress >= 100) {
    progress = 100;
    clearInterval(loadTimer);
    gsap.to(loader, { opacity: 0, duration: 0.8, onComplete: () => loader.remove() });
  }

  if (loaderBar) loaderBar.style.width = progress + '%';
  if (loaderPercent) loaderPercent.textContent = Math.floor(progress) + '%';
}, 120);

// 2. Custom cursor + hover glow
const cursor = $('#cursor');
if (cursor) {
  window.addEventListener('mousemove', (event) => {
    gsap.to(cursor, { x: event.clientX, y: event.clientY, duration: 0.15 });
  });

  document.querySelectorAll('a, button, .tilt-card, .project-card__visual').forEach((item) => {
    item.addEventListener('mouseenter', () => cursor.classList.add('active'));
    item.addEventListener('mouseleave', () => cursor.classList.remove('active'));
  });
}

// 3. Mobile menu
const navToggle = $('#navToggle');
const navMenu = $('#navMenu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');

    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
  });
}

// 4. Header background change on scroll (Tối ưu bằng GSAP)
const header = $('.header');
if (header) {
  ScrollTrigger.create({
    trigger: document.body,
    start: 'top -50', // Tương đương khi cuộn xuống quá 50px
    onEnter: () => header.classList.add('scrolled'),
    onLeaveBack: () => header.classList.remove('scrolled')
  });
}

// 5. Typing effect for 'Tôi đang học'
const typingText = $('#typingText');
const words = ['HTML', 'CSS', 'JavaScript', 'UI Design'];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
  if (!typingText) return;

  const currentWord = words[wordIndex];
  typingText.textContent = currentWord.slice(0, charIndex);

  if (!isDeleting && charIndex < currentWord.length) {
    charIndex++;
    setTimeout(typeEffect, 120);
    return;
  }

  if (isDeleting && charIndex > 0) {
    charIndex--;
    setTimeout(typeEffect, 60);
    return;
  }

  isDeleting = !isDeleting;
  if (!isDeleting) wordIndex = (wordIndex + 1) % words.length;

  setTimeout(typeEffect, isDeleting ? 700 : 1200);
}

typeEffect();

gsap.utils.toArray('.scroll-reveal').forEach((element) => {
  gsap.fromTo(
    element,
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: element, start: 'top 85%' }
    }
  );
});

// 6. Tilt cards + click pulse
$$('[data-tilt]').forEach((card) => {
  card.addEventListener('click', () => {
    gsap.fromTo(card, { scale: 1 }, { scale: 1.03, duration: 0.12, yoyo: true, repeat: 1 });
  });

  card.addEventListener('mousemove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    gsap.to(card, {
      rotateX: (y - 0.5) * -10,
      rotateY: (x - 0.5) * 10,
      duration: 0.25,
      transformPerspective: 800
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.4 });
  });
});

// 7. Parallax + mouse drift
const hero = $('#hero');
const bgLayer = $('#threeCanvas');
const bgOverlay = document.querySelector('.ambient-overlays');

gsap.utils.toArray('[data-parallax]').forEach((element) => {
  gsap.to(element, {
    y: -80 * Number(element.dataset.parallax),
    scrollTrigger: { trigger: element, scrub: true }
  });
});

if (hero) {
  window.addEventListener('mousemove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 10;
    const y = (event.clientY / window.innerHeight - 0.5) * 10;
    gsap.to(hero, { rotateX: y * 0.2, rotateY: x * 0.2, duration: 0.3, ease: 'power2.out' });
  });

  window.addEventListener('mouseleave', () => {
    gsap.to(hero, { rotateX: 0, rotateY: 0, duration: 0.6 });
  });
}

window.addEventListener('mousemove', (event) => {
  const x = (event.clientX / window.innerWidth - 0.5) * 2;
  const y = (event.clientY / window.innerHeight - 0.5) * 2;

  if (bgLayer) gsap.to(bgLayer, { x: x * 18, y: y * 18, duration: 0.35, ease: 'power2.out' });
  if (bgOverlay) gsap.to(bgOverlay, { x: x * 10, y: y * 10, duration: 0.35, ease: 'power2.out' });
});

window.addEventListener('mouseleave', () => {
  if (bgLayer) gsap.to(bgLayer, { x: 0, y: 0, duration: 0.6 });
  if (bgOverlay) gsap.to(bgOverlay, { x: 0, y: 0, duration: 0.6 });
});

// 8. Back to top
const backToTop = $('#backToTop');
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top -300',
    onEnter: () => backToTop.classList.add('visible'),
    onLeaveBack: () => backToTop.classList.remove('visible')
  });
}

// 9. Simple Three.js background
function initThreeJS() {
  const canvas = $('#threeCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Stars
  const starCount = 1200;
  const starGeometry = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starPositions.length; i++) {
    starPositions[i] = (Math.random() - 0.5) * 200;
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ size: 0.5, color: 0xffffff, transparent: true, opacity: 0.6 })
  );
  scene.add(stars);

  // Shapes + hover reaction
  const shapes = [];

  function addShape(geometry, x, y, z, color) {
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.25 })
    );

    mesh.position.set(x, y, z);
    mesh.userData = {
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      speedZ: (Math.random() - 0.5) * 0.2,
      baseX: x,
      baseY: y
    };

    scene.add(mesh);
    shapes.push(mesh);
    mesh.userData.originalOpacity = 0.25;
  }

  // Giữ lại 5 khối và rải tự do (tùm lum) trên màn hình
  addShape(new THREE.IcosahedronGeometry(6, 0), 15, 18, -20, 0xc9a962);
  addShape(new THREE.OctahedronGeometry(4, 0), -30, -10, -15, 0xe8d5a3);
  addShape(new THREE.TetrahedronGeometry(5, 0), -12, 25, -25, 0xa68b4b);
  addShape(new THREE.TorusGeometry(4, 1, 8, 16), 40, -15, -20, 0xd4af37);
  addShape(new THREE.ConeGeometry(3, 7, 16), 5, -22, -10, 0xa68b4b);

  let time = 0;
  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };
  let lastTargetMouse = { x: 0, y: 0 };
  let mouseVelocity = { x: 0, y: 0 };

  window.addEventListener('mousemove', (event) => {
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  window.addEventListener('mouseleave', () => {
    targetMouse.x = 0;
    targetMouse.y = 0;
  });

  function animate() {
    requestAnimationFrame(animate);
    time += 0.015;

    // Calculate mouse velocity for spinning effect
    const dx = targetMouse.x - lastTargetMouse.x;
    const dy = targetMouse.y - lastTargetMouse.y;
    mouseVelocity.x += dx * 0.5;
    mouseVelocity.y += dy * 0.5;
    
    // Friction/damping for velocity
    mouseVelocity.x *= 0.92;
    mouseVelocity.y *= 0.92;

    lastTargetMouse.x = targetMouse.x;
    lastTargetMouse.y = targetMouse.y;

    // Smooth position movement
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    stars.rotation.y += 0.0008 + Math.abs(mouse.x) * 0.0004;
    stars.rotation.x += mouse.y * 0.0003;

    shapes.forEach((shape) => {
      const driftX = mouse.x * 6;
      const driftY = mouse.y * 3;

      // Base auto-rotate (moderately slow) + spin from mouse velocity
      shape.rotation.x += shape.userData.speedX * 0.35 + mouseVelocity.y * 2;
      shape.rotation.y += shape.userData.speedY * 0.35 + mouseVelocity.x * 2;
      shape.rotation.z += shape.userData.speedZ * 0.35;

      shape.position.x = shape.userData.baseX + driftX + Math.sin(time + shape.userData.speedX) * 0.2;
      shape.position.y = shape.userData.baseY + driftY + Math.sin(time * 1.2) * 1.5;
      shape.material.opacity = shape.userData.originalOpacity + Math.abs(mouse.x) * 0.08;
    });

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// Khởi chạy ThreeJS sau cùng để không ảnh hưởng luồng render chính
initThreeJS();