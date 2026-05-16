/* ═══════════════════════════════════════════════════════
   main.js  – Splash animations | 4 Themes | Portfolio
═══════════════════════════════════════════════════════ */

// ── SPLASH ─────────────────────────────────────────────
;(function () {
  var splash   = document.getElementById('splash');
  var textEl   = document.getElementById('splash-text');
  var progress = document.getElementById('splash-progress');
  var canvas   = document.getElementById('splash-stars');
  var ctx      = canvas.getContext('2d');

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  var splashDone = false;

  /* ── Nebula blobs (background glow) ── */
  var blobs = [
    { x: canvas.width*.2,  y: canvas.height*.3, r: 280, c: [133,76,230],  a: 0 },
    { x: canvas.width*.8,  y: canvas.height*.6, r: 240, c: [204,0,187],   a: 0 },
    { x: canvas.width*.5,  y: canvas.height*.8, r: 200, c: [0,70,209],    a: 0 },
    { x: canvas.width*.7,  y: canvas.height*.2, r: 180, c: [133,76,230],  a: 0 },
  ];
  var blobT = 0;

  /* ── Stars + particles ── */
  var colors = ['#854ce6','#cc00bb','#ffffff','#0046d1'];
  var particles = [];
  for (var i = 0; i < 280; i++) {
    var c = colors[Math.floor(Math.random()*colors.length)];
    particles.push({
      x:Math.random()*canvas.width, y:Math.random()*canvas.height,
      r:Math.random()*2+0.2, a:Math.random(),
      s:(Math.random()*0.006+0.001)*(Math.random()>.5?1:-1),
      vx:(Math.random()-.5)*.2, vy:(Math.random()-.5)*.2, hex:c,
    });
  }

  /* ── Shooting stars ── */
  var meteors = [];
  function spawnMeteor() {
    meteors.push({ x:Math.random()*canvas.width, y:0, len:80+Math.random()*120, speed:8+Math.random()*10, a:1 });
    setTimeout(spawnMeteor, 800+Math.random()*1200);
  }
  spawnMeteor();

  function hexToRgba(hex, a) {
    var r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+a.toFixed(2)+')';
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Nebula blobs */
    blobT += 0.008;
    blobs.forEach(function(b, i) {
      b.a = 0.12 + 0.06 * Math.sin(blobT + i*1.3);
      var grad = ctx.createRadialGradient(b.x + Math.sin(blobT+i)*40, b.y + Math.cos(blobT+i)*30, 0,
                                          b.x, b.y, b.r);
      grad.addColorStop(0, 'rgba('+b.c[0]+','+b.c[1]+','+b.c[2]+','+b.a+')');
      grad.addColorStop(1, 'rgba('+b.c[0]+','+b.c[1]+','+b.c[2]+',0)');
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.fillStyle = grad; ctx.fill();
    });

    /* Particles */
    particles.forEach(function(p) {
      p.a+=p.s; if(p.a>1||p.a<0.05) p.s*=-1;
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0) p.x=canvas.width; if(p.x>canvas.width) p.x=0;
      if(p.y<0) p.y=canvas.height; if(p.y>canvas.height) p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=hexToRgba(p.hex,p.a); ctx.fill();
    });

    /* Meteors */
    for (var m = meteors.length-1; m >= 0; m--) {
      var mt = meteors[m];
      ctx.save();
      ctx.translate(mt.x, mt.y); ctx.rotate(Math.PI/4);
      var mg = ctx.createLinearGradient(0,0,0,mt.len);
      mg.addColorStop(0,'rgba(255,255,255,0)');
      mg.addColorStop(1,'rgba(255,255,255,'+mt.a.toFixed(2)+')');
      ctx.strokeStyle = mg; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-mt.len); ctx.stroke();
      ctx.restore();
      mt.x += mt.speed; mt.y += mt.speed;
      mt.a -= 0.015;
      if (mt.y > canvas.height || mt.a <= 0) meteors.splice(m,1);
    }

    if (!splashDone) requestAnimationFrame(drawParticles);
  }
  drawParticles();

  /* ── Hello words (16 languages + name reveal at end) ── */
  var words = [
    { text: 'Hello',          lang: 'English',    anim: 'anim-drop'  },
    { text: 'नमस्ते',         lang: 'Hindi',      anim: 'anim-pop'   },
    { text: 'Hola',           lang: 'Spanish',    anim: 'anim-slide' },
    { text: 'Bonjour',        lang: 'French',     anim: 'anim-drop'  },
    { text: 'مرحبا',           lang: 'Arabic',     anim: 'anim-fade'  },
    { text: 'こんにちは',      lang: 'Japanese',   anim: 'anim-pop'   },
    { text: '你好',             lang: 'Chinese',    anim: 'anim-slide' },
    { text: 'Hallo',          lang: 'German',     anim: 'anim-drop'  },
    { text: 'Привет',         lang: 'Russian',    anim: 'anim-glitch'},
    { text: '안녕하세요',      lang: 'Korean',     anim: 'anim-pop'   },
    { text: 'Merhaba',        lang: 'Turkish',    anim: 'anim-slide' },
    { text: 'Ciao',           lang: 'Italian',    anim: 'anim-drop'  },
    { text: 'Olá',            lang: 'Portuguese', anim: 'anim-fade'  },
    { text: 'שלום',           lang: 'Hebrew',     anim: 'anim-pop'   },
    { text: 'สวัสดี',          lang: 'Thai',       anim: 'anim-slide' },
    { text: 'Hello Again! 👋', lang: '— Thank You —', anim: 'anim-final'},
  ];

  var idx   = 0;
  var total = words.length;

  function showNext() {
    if (idx >= total) {
      splashDone = true;
      progress.style.width = '100%';
      createRipple();
      setTimeout(function () {
        splash.style.transition = 'opacity 1s ease';
        splash.style.opacity    = '0';
        setTimeout(function () {
          splash.style.display = 'none';
          var main = document.getElementById('main-content');
          main.style.display   = 'block';
          main.style.opacity   = '0';
          main.style.transition = 'opacity 0.9s ease';
          void main.offsetHeight;
          main.style.opacity = '1';
          setTimeout(initMain, 100);
        }, 1000);
      }, 700);
      return;
    }

    var w    = words[idx];
    var anim = w.anim || 'anim-drop';

    textEl.className = '';
    void textEl.offsetHeight;

    var isLast = (idx === total - 1);
    textEl.innerHTML =
      '<span class="splash-word ' + anim + (isLast ? ' splash-final' : '') + '">' + w.text + '</span>' +
      '<span class="splash-lang">' + w.lang + '</span>';

    progress.style.width = ((idx + 1) / total * 100) + '%';
    idx++;
    var delay = isLast ? 1200 : 420;
    setTimeout(showNext, delay);
  }

  /* Ripple effect on canvas at the end */
  function createRipple() {
    var cx = canvas.width / 2, cy = canvas.height / 2;
    var r = 0, maxR = Math.max(canvas.width, canvas.height);
    function rippleFrame() {
      if (r > maxR || splashDone) return;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(133,76,230,' + (1 - r / maxR).toFixed(2) + ')';
      ctx.lineWidth = 3;
      ctx.stroke();
      r += 18;
      requestAnimationFrame(rippleFrame);
    }
    rippleFrame();
  }

  showNext();
})();

/* ══════════════════════════════════════════════════════
   MAIN INIT
══════════════════════════════════════════════════════ */
function initMain() {
  initNavbar();
  initStarCanvas();
  initTypewriter();
  initTilt();
  initReveal();
  initTheme();
  initContactForm();
}

/* ── NAVBAR ─────────────────────────────────────────── */
function initNavbar() {
  var hamburger  = document.getElementById('hamburger');
  var mobileMenu = document.getElementById('mobile-menu');
  hamburger.addEventListener('click', function () { mobileMenu.classList.toggle('open'); });
  document.querySelectorAll('.mobile-link').forEach(function (l) {
    l.addEventListener('click', function () { mobileMenu.classList.remove('open'); });
  });
  var navLinks = document.querySelectorAll('.nav-link');
  var sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', function () {
    var cur = '';
    sections.forEach(function (s) { if (window.scrollY >= s.offsetTop - 90) cur = s.id; });
    navLinks.forEach(function (l) { l.classList.toggle('active-link', l.getAttribute('href') === '#' + cur); });
  });
}

/* ── STAR CANVAS (hero) ─────────────────────────────── */
function initStarCanvas() {
  var canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d'), stars = [];
  function resize() {
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; stars = [];
    for (var i = 0; i < Math.floor(canvas.width * canvas.height / 2800); i++) {
      stars.push({ x: Math.random()*canvas.width, y: Math.random()*canvas.height,
        r: Math.random()*1.5+0.3, a: Math.random(), s: Math.random()*0.004+0.001 });
    }
  }
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stars.forEach(function(s){ s.a+=s.s; if(s.a>1||s.a<0) s.s*=-1;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,'+s.a.toFixed(2)+')'; ctx.fill(); });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize); resize(); draw();
}

/* ── TYPEWRITER ─────────────────────────────────────── */
function initTypewriter() {
  var el = document.getElementById('typewriter');
  var roles = (typeof BIO_ROLES !== 'undefined') ? BIO_ROLES : ['Web Developer'];
  var ri=0, ci=0, del=false;
  function tick() {
    var word = roles[ri];
    el.textContent = del ? word.slice(0,ci--) : word.slice(0,ci++);
    var delay = del ? 55 : 95;
    if (!del && ci > word.length)  { delay=2000; del=true; }
    if ( del && ci < 0)            { del=false; ci=0; ri=(ri+1)%roles.length; delay=450; }
    setTimeout(tick, delay);
  }
  tick();
}

/* ── TILT ───────────────────────────────────────────── */
function initTilt() {
  document.querySelectorAll('.tilt-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-0.5, y=(e.clientY-r.top)/r.height-0.5;
      card.style.transform='perspective(600px) rotateY('+(x*12)+'deg) rotateX('+(-y*12)+'deg) scale(1.02)';
    });
    card.addEventListener('mouseleave', function(){ card.style.transform=''; });
  });
}

/* ── SCROLL REVEAL ──────────────────────────────────── */
function initReveal() {
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
}

/* ── THEME PICKER ───────────────────────────────────── */
function initTheme() {
  var html    = document.documentElement;
  var picker  = document.getElementById('theme-picker');
  var trigger = document.getElementById('theme-trigger');
  var allDots = document.querySelectorAll('.theme-dot');

  var saved = localStorage.getItem('theme') || 'purple';
  applyTheme(saved);

  if (picker && trigger) {
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      picker.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
      if (!picker.contains(e.target)) picker.classList.remove('open');
    });
  }

  allDots.forEach(function(dot) {
    dot.addEventListener('click', function(e) {
      e.stopPropagation();
      applyTheme(dot.dataset.theme);
      localStorage.setItem('theme', dot.dataset.theme);
      if (picker) picker.classList.remove('open');
    });
  });

  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    allDots.forEach(function(d){ d.classList.toggle('active', d.dataset.theme === t); });
  }
}

/* ── CONTACT FORM ───────────────────────────────────── */
function initContactForm() {
  var form=document.getElementById('contact-form'), feedback=document.getElementById('form-feedback'), sendBtn=document.getElementById('send-btn');
  if (!form) return;
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    var payload={from_email:form.from_email.value.trim(),from_name:form.from_name.value.trim(),subject:form.subject.value.trim(),message:form.message.value.trim()};
    if (!payload.from_email||!payload.from_name||!payload.message){feedback.textContent='Please fill all fields.';feedback.className='form-feedback error';return;}
    sendBtn.disabled=true; sendBtn.textContent='Sending…';
    try {
      var res=await fetch('/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      var data=await res.json();
      if(data.status==='ok'){feedback.textContent='✅ Message sent!';feedback.className='form-feedback success';form.reset();}
      else throw new Error(data.message);
    } catch(err){feedback.textContent='❌ '+err.message;feedback.className='form-feedback error';}
    finally{sendBtn.disabled=false;sendBtn.textContent='Send';}
  });
}
