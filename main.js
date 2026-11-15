// --- 1. NAVIGATION ---
function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tabId);
  });

  document.querySelectorAll('.panel').forEach(panel => {
    panel.classList.remove('active-panel');
  });

  const target = document.getElementById(tabId);
  if (target) target.classList.add('active-panel');

  document.body.classList.toggle('view-detail', tabId !== 'home');

  if (tabId === 'portfolio') {
    // wait one frame so the stage has its real size
    requestAnimationFrame(() => explode(currentFilter));
  }
}

document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', () => switchTab(link.dataset.tab));
});

// --- 2. PORTFOLIO DATA ---
// Replace img paths with Amirreza's real images (put them in /assets).
// c1 / c2 are the placeholder gradient colors shown until the image loads.
const projects = [
  { type: 'painting', title: 'Painting 1', desc: 'Oil on canvas, 2024', img: 'assets/painting-1.jpg', c1: '#3b2a4a', c2: '#14141c' },
  { type: 'painting', title: 'Painting 2', desc: 'Acrylic on canvas, 2024', img: 'assets/painting-2.jpg', c1: '#2a3f4a', c2: '#101418' },
  { type: 'painting', title: 'Painting 3', desc: 'Oil on canvas, 2023', img: 'assets/painting-3.jpg', c1: '#4a3a2a', c2: '#181410' },
  { type: 'painting', title: 'Painting 4', desc: 'Mixed media, 2023', img: 'assets/painting-4.jpg', c1: '#2a4a3b', c2: '#101814' },
  { type: 'painting', title: 'Painting 5', desc: 'Acrylic on paper, 2022', img: 'assets/painting-5.jpg', c1: '#4a2a35', c2: '#181014' },
  { type: 'painting', title: 'Painting 6', desc: 'Oil on canvas, 2022', img: 'assets/painting-6.jpg', c1: '#33334a', c2: '#101018' },

  { type: 'illustration', title: 'Illustration 1', desc: 'Digital, 2024', img: 'assets/illustration-1.jpg', c1: '#4a3f2a', c2: '#18150f' },
  { type: 'illustration', title: 'Illustration 2', desc: 'Ink, 2024', img: 'assets/illustration-2.jpg', c1: '#2a2a2a', c2: '#0e0e0e' },
  { type: 'illustration', title: 'Illustration 3', desc: 'Digital, 2023', img: 'assets/illustration-3.jpg', c1: '#2a4a4a', c2: '#0f1818' },
  { type: 'illustration', title: 'Illustration 4', desc: 'Watercolor, 2023', img: 'assets/illustration-4.jpg', c1: '#4a2a4a', c2: '#180f18' },
  { type: 'illustration', title: 'Illustration 5', desc: 'Digital, 2022', img: 'assets/illustration-5.jpg', c1: '#3a4a2a', c2: '#141810' },
  { type: 'illustration', title: 'Illustration 6', desc: 'Ink, 2022', img: 'assets/illustration-6.jpg', c1: '#4a332a', c2: '#181210' }
];

// --- 3. EXPLOSION LAYOUT ---
const stage = document.getElementById('stage');
let currentFilter = 'all';
let explodeToken = 0;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function rand(min, max) { return min + Math.random() * (max - min); }

function explode(filter) {
  const token = ++explodeToken;
  const list = filter === 'all' ? projects : projects.filter(p => p.type === filter);

  stage.innerHTML = '';

  const W = stage.clientWidth;
  const H = stage.clientHeight;
  const topSpace = 120;           // room for nav + filter bar
  const availH = H - topSpace - 20;
  const n = list.length;

  // grid cells so scattered pieces never pile onto each other
  const cols = Math.max(1, Math.round(Math.sqrt(n * W / availH)));
  const rows = Math.ceil(n / cols);
  const cellW = W / cols;
  const cellH = availH / rows;
  const size = Math.max(80, Math.min(cellW, cellH) * 0.8, 0);
  const cap = Math.min(size, 230);

  const cells = shuffle([...Array(cols * rows).keys()]).slice(0, n);
  const cx = W / 2 - cap / 2;
  const cy = topSpace + availH / 2 - cap / 2;

  list.forEach((p, i) => {
    const col = cells[i] % cols;
    const row = Math.floor(cells[i] / cols);
    const slackX = Math.max(0, cellW - cap);
    const slackY = Math.max(0, cellH - cap);
    const tx = col * cellW + rand(0.1, 0.9) * slackX;
    const ty = topSpace + row * cellH + rand(0.1, 0.9) * slackY;
    const rot = rand(-14, 14);

    const art = document.createElement('div');
    art.className = 'art';
    art.style.width = cap + 'px';
    art.style.height = cap + 'px';
    art.style.setProperty('--c1', p.c1);
    art.style.setProperty('--c2', p.c2);
    // start: collapsed in the center
    art.style.transform = `translate(${cx}px, ${cy}px) scale(0) rotate(0deg)`;

    art.innerHTML = `
      <div class="float" style="--dur:${rand(5, 9).toFixed(1)}s; --delay:${(-rand(0, 6)).toFixed(1)}s; --dx:${rand(-9, 9).toFixed(0)}px; --dy:${rand(-12, 12).toFixed(0)}px;">
        <div class="card">
          <img src="${p.img}" alt="${p.title}" loading="lazy" onerror="this.style.display='none'">
          <div class="label">${p.title}</div>
        </div>
      </div>`;
    art.querySelector('.card').addEventListener('click', () => openLightbox(p));
    stage.appendChild(art);

    // blast outward, staggered from the center
    const dist = Math.hypot(tx - cx, ty - cy);
    const delay = Math.min(0.35, dist / 4000) + i * 0.03;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (token !== explodeToken) return;
      art.style.transitionDelay = delay + 's';
      art.style.opacity = 1;
      art.style.transform = `translate(${tx}px, ${ty}px) scale(1) rotate(${rot}deg)`;
    }));
  });
}

// filter buttons: pieces collapse, then explode again
document.querySelectorAll('.portfolio-bar button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.portfolio-bar button').forEach(b => b.classList.remove('active-filter'));
    btn.classList.add('active-filter');
    currentFilter = btn.dataset.filter;

    const token = ++explodeToken;
    const W = stage.clientWidth, H = stage.clientHeight;
    stage.querySelectorAll('.art').forEach(a => {
      a.classList.add('out');
      a.style.transitionDelay = '0s';
      a.style.opacity = 0;
      a.style.transform = `translate(${W / 2 - 60}px, ${H / 2}px) scale(0) rotate(0deg)`;
    });
    setTimeout(() => { if (token === explodeToken) explode(currentFilter); }, 420);
  });
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (document.getElementById('portfolio').classList.contains('active-panel')) explode(currentFilter);
  }, 250);
});

// --- 4. LIGHTBOX ---
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbTitle = document.getElementById('lightbox-title');
const lbDesc = document.getElementById('lightbox-desc');

function openLightbox(project) {
  lbTitle.innerText = project.title;
  lbDesc.innerText = project.desc;
  lbImg.alt = project.title;
  lbImg.src = project.img;
  lightbox.style.display = 'flex';
  setTimeout(() => lightbox.classList.add('active'), 10);
}

function closeLightbox(e) {
  // clicking inside the glass box should not close it
  if (e && e.target.closest('.lightbox-content') && !e.target.classList.contains('close-btn')) return;
  lightbox.classList.remove('active');
  setTimeout(() => { lightbox.style.display = 'none'; }, 300);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// --- 5. DOT SHADER ---
const canvas = document.getElementById('dotCanvas');
const ctx = canvas.getContext('2d');
let w, h;
let mouse = { x: -1000, y: -1000 };

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('touchmove', e => {
  mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY;
}, { passive: true });

function drawDots() {
  ctx.clearRect(0, 0, w, h);
  const spacing = 30;
  for (let x = 0; x < w; x += spacing) {
    for (let y = 0; y < h; y += spacing) {
      const dist = Math.hypot(mouse.x - x, mouse.y - y);
      const strength = Math.max(0, 1 - dist / 200);
      if (strength > 0) {
        ctx.beginPath();
        ctx.arc(x, y, 1 + strength * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${strength * 0.4})`;
        ctx.fill();
      }
    }
  }
  requestAnimationFrame(drawDots);
}
drawDots();
