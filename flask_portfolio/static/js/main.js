/* ═══════════════════════════════════════════════════════
   main.js  – Splash (multilang + animations) | 3 Themes
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
  var DELAY = 420; // ms per word

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
  initLang();
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
  var dots    = document.querySelectorAll('.theme-dot');
  if (!picker) return;

  var saved = localStorage.getItem('theme') || 'purple';
  applyTheme(saved);

  /* Click trigger to toggle */
  trigger.addEventListener('click', function(e) {
    e.stopPropagation();
    picker.classList.toggle('open');
    /* close lang picker if open */
    var lp = document.getElementById('lang-picker');
    if (lp) lp.classList.remove('open');
  });

  /* Close on outside click */
  document.addEventListener('click', function(e) {
    if (!picker.contains(e.target)) picker.classList.remove('open');
  });

  /* Dot selection */
  dots.forEach(function(dot) {
    dot.addEventListener('click', function(e) {
      e.stopPropagation();
      applyTheme(dot.dataset.theme);
      localStorage.setItem('theme', dot.dataset.theme);
      picker.classList.remove('open');
    });
  });

  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    dots.forEach(function(d){ d.classList.toggle('active', d.dataset.theme === t); });
  }
}

/* ── LANGUAGE SWITCHER (8 Indian Languages) ─────────── */
function initLang() {
  var picker  = document.getElementById('lang-picker');
  var trigger = document.getElementById('lang-trigger');
  var opts    = document.querySelectorAll('.lang-opt');
  if (!picker) return;

  var cur = localStorage.getItem('lang') || 'en';
  applyLang(cur);

  /* Click to toggle */
  trigger.addEventListener('click', function(e){
    e.stopPropagation();
    picker.classList.toggle('open');
    /* close theme picker if open */
    var tp = document.getElementById('theme-picker');
    if (tp) tp.classList.remove('open');
  });

  /* Close on outside click */
  document.addEventListener('click', function(e){
    if (!picker.contains(e.target)) picker.classList.remove('open');
  });

  /* Language option selection */
  opts.forEach(function(o){
    o.addEventListener('click', function(e){
      e.stopPropagation();
      cur = o.dataset.lang;
      localStorage.setItem('lang', cur);
      applyLang(cur);
      picker.classList.remove('open');
    });
  });

  var T = {
    en: {
      'nav-about':'About','nav-skills':'Skills','nav-achieve':'Achievements',
      'nav-projects':'Projects','nav-edu':'Education','nav-contact':'Contact',
      'hero-hi':'Hi, I am','hero-iam':'I am a ',
      'hero-desc':'Motivated BCA student skilled in Web Development, UI/UX & Python.',
      'hero-resume':'Check Resume',
      'sec-skills':'Skills','sec-skills-desc':'Technical skills I have built over time.',
      'sec-achieve':'Achievements','sec-achieve-desc':'My hackathon wins and accomplishments.',
      'sec-projects':'Projects','sec-projects-desc':'Projects that showcase my skills.',
      'sec-edu':'Education','sec-edu-desc':'My academic journey from school to college.',
      'sec-contact':'Contact','sec-contact-desc':'Feel free to reach out for any opportunities!',
      'sec-download':'Download Portfolio','sec-download-desc':'Download complete source code of this portfolio!',
      'dl-title':'AsifRaza_Portfolio.zip','dl-desc':'Flask · HTML · CSS · JS · All Assets',
      'dl-btn':'Download ZIP','form-title':'Email Me 🚀','btn-send':'Send',
      'btn-code':'Code','btn-demo':'Demo','label-skills':'Skills:','label-grade':'Grade:',
      'earth-label':'🌍 Open to Opportunities Worldwide','footer-copy':'© 2025 Asif Raza. All rights reserved.',
      'ph-email':'Your Email','ph-name':'Your Name','ph-subject':'Subject','ph-msg':'Message'
    },
    hi: {
      'nav-about':'परिचय','nav-skills':'कौशल','nav-achieve':'उपलब्धियाँ',
      'nav-projects':'परियोजनाएँ','nav-edu':'शिक्षा','nav-contact':'संपर्क',
      'hero-hi':'नमस्ते, मैं हूँ','hero-iam':'मैं एक ',
      'hero-desc':'वेब डेवलपमेंट, UI/UX और Python में कुशल BCA छात्र।',
      'hero-resume':'रिज्यूमे देखें',
      'sec-skills':'कौशल','sec-skills-desc':'मेरे तकनीकी कौशल जो मैंने समय के साथ बनाए।',
      'sec-achieve':'उपलब्धियाँ','sec-achieve-desc':'मेरी हैकाथॉन जीत और उपलब्धियाँ।',
      'sec-projects':'परियोजनाएँ','sec-projects-desc':'कुछ परियोजनाएँ जो मेरे कौशल दर्शाती हैं।',
      'sec-edu':'शिक्षा','sec-edu-desc':'स्कूल से कॉलेज तक की मेरी शैक्षणिक यात्रा।',
      'sec-contact':'संपर्क करें','sec-contact-desc':'किसी भी प्रश्न के लिए संपर्क करें!',
      'sec-download':'पोर्टफोलियो डाउनलोड करें','sec-download-desc':'इस पोर्टफोलियो का पूरा सोर्स कोड डाउनलोड करें!',
      'dl-title':'AsifRaza_Portfolio.zip','dl-desc':'Flask · HTML · CSS · JS · सभी फाइलें',
      'dl-btn':'ZIP डाउनलोड करें','form-title':'मुझे ईमेल करें 🚀','btn-send':'भेजें',
      'btn-code':'कोड','btn-demo':'डेमो','label-skills':'कौशल:','label-grade':'ग्रेड:',
      'earth-label':'🌍 दुनियाभर के अवसरों के लिए तैयार','footer-copy':'© 2025 Asif Raza. सर्वाधिकार सुरक्षित।',
      'ph-email':'आपका ईमेल','ph-name':'आपका नाम','ph-subject':'विषय','ph-msg':'संदेश'
    },
    mr: {
      'nav-about':'परिचय','nav-skills':'कौशल्ये','nav-achieve':'उपलब्धी',
      'nav-projects':'प्रकल्प','nav-edu':'शिक्षण','nav-contact':'संपर्क',
      'hero-hi':'नमस्कार, मी आहे','hero-iam':'मी एक ',
      'hero-desc':'वेब डेव्हलपमेंट, UI/UX आणि Python मध्ये कुशल BCA विद्यार्थी।',
      'hero-resume':'रेझुमे पहा',
      'sec-skills':'कौशल्ये','sec-skills-desc':'माझी तांत्रिक कौशल्ये.',
      'sec-achieve':'उपलब्धी','sec-achieve-desc':'माझ्या हॅकेथॉन विजय.',
      'sec-projects':'प्रकल्प','sec-projects-desc':'माझ्या कौशल्यांचे प्रदर्शन.',
      'sec-edu':'शिक्षण','sec-edu-desc':'शाळेपासून महाविद्यालयापर्यंतचा माझा प्रवास.',
      'sec-contact':'संपर्क','sec-contact-desc':'कोणत्याही प्रश्नासाठी संपर्क करा!',
      'sec-download':'पोर्टफोलिओ डाउनलोड करा','sec-download-desc':'पोर्टफोलिओचा सोर्स कोड डाउनलोड करा!',
      'dl-title':'AsifRaza_Portfolio.zip','dl-desc':'Flask · HTML · CSS · JS · सर्व फाइल्स',
      'dl-btn':'ZIP डाउनलोड करा','form-title':'मला ईमेल करा 🚀','btn-send':'पाठवा',
      'btn-code':'कोड','btn-demo':'डेमो','label-skills':'कौशल्ये:','label-grade':'ग्रेड:',
      'earth-label':'🌍 जगभरातील संधींसाठी तयार','footer-copy':'© 2025 Asif Raza. सर्व हक्क राखीव.',
      'ph-email':'तुमचा ईमेल','ph-name':'तुमचे नाव','ph-subject':'विषय','ph-msg':'संदेश'
    },
    bn: {
      'nav-about':'পরিচিতি','nav-skills':'দক্ষতা','nav-achieve':'অর্জন',
      'nav-projects':'প্রকল্প','nav-edu':'শিক্ষা','nav-contact':'যোগাযোগ',
      'hero-hi':'হ্যালো, আমি','hero-iam':'আমি একজন ',
      'hero-desc':'ওয়েব ডেভেলপমেন্ট, UI/UX ও Python-এ দক্ষ BCA শিক্ষার্থী।',
      'hero-resume':'রেজুমে দেখুন',
      'sec-skills':'দক্ষতা','sec-skills-desc':'আমার প্রযুক্তিগত দক্ষতাসমূহ।',
      'sec-achieve':'অর্জন','sec-achieve-desc':'আমার হ্যাকাথন জয় ও সাফল্য।',
      'sec-projects':'প্রকল্প','sec-projects-desc':'আমার দক্ষতা প্রদর্শনকারী প্রকল্পসমূহ।',
      'sec-edu':'শিক্ষা','sec-edu-desc':'স্কুল থেকে কলেজ পর্যন্ত আমার শিক্ষা যাত্রা।',
      'sec-contact':'যোগাযোগ','sec-contact-desc':'যেকোনো প্রশ্নে যোগাযোগ করুন!',
      'sec-download':'পোর্টফোলিও ডাউনলোড','sec-download-desc':'পোর্টফোলিওর সোর্স কোড ডাউনলোড করুন!',
      'dl-title':'AsifRaza_Portfolio.zip','dl-desc':'Flask · HTML · CSS · JS · সব ফাইল',
      'dl-btn':'ZIP ডাউনলোড','form-title':'আমাকে ইমেইল করুন 🚀','btn-send':'পাঠান',
      'btn-code':'কোড','btn-demo':'ডেমো','label-skills':'দক্ষতা:','label-grade':'গ্রেড:',
      'earth-label':'🌍 বিশ্বব্যাপী সুযোগের জন্য প্রস্তুত','footer-copy':'© 2025 Asif Raza. সর্বস্বত্ব সংরক্ষিত।',
      'ph-email':'আপনার ইমেইল','ph-name':'আপনার নাম','ph-subject':'বিষয়','ph-msg':'বার্তা'
    },
    te: {
      'nav-about':'పరిచయం','nav-skills':'నైపుణ్యాలు','nav-achieve':'విజయాలు',
      'nav-projects':'ప్రాజెక్టులు','nav-edu':'విద్య','nav-contact':'సంప్రదింపు',
      'hero-hi':'నమస్కారం, నేను','hero-iam':'నేను ఒక ',
      'hero-desc':'వెబ్ డెవలప్‌మెంట్, UI/UX మరియు Python లో నిపుణుడైన BCA విద్యార్థి।',
      'hero-resume':'రెజ్యూమే చూడండి',
      'sec-skills':'నైపుణ్యాలు','sec-skills-desc':'నా సాంకేతిక నైపుణ్యాలు.',
      'sec-achieve':'విజయాలు','sec-achieve-desc':'నా హ్యాకథాన్ విజయాలు.',
      'sec-projects':'ప్రాజెక్టులు','sec-projects-desc':'నా నైపుణ్యాలు చూపే ప్రాజెక్టులు.',
      'sec-edu':'విద్య','sec-edu-desc':'పాఠశాల నుండి కళాశాల వరకు నా విద్యా ప్రయాణం.',
      'sec-contact':'సంప్రదింపు','sec-contact-desc':'ఏదైనా అడగాలంటే సంప్రదించండి!',
      'sec-download':'పోర్ట్‌ఫోలియో డౌన్‌లోడ్','sec-download-desc':'సోర్స్ కోడ్ డౌన్‌లోడ్ చేయండి!',
      'dl-title':'AsifRaza_Portfolio.zip','dl-desc':'Flask · HTML · CSS · JS · అన్ని ఫైళ్ళు',
      'dl-btn':'ZIP డౌన్‌లోడ్','form-title':'నాకు ఇమెయిల్ చేయండి 🚀','btn-send':'పంపండి',
      'btn-code':'కోడ్','btn-demo':'డెమో','label-skills':'నైపుణ్యాలు:','label-grade':'గ్రేడ్:',
      'earth-label':'🌍 ప్రపంచవ్యాప్త అవకాశాలకు సిద్ధం','footer-copy':'© 2025 Asif Raza. అన్ని హక్కులు (',
      'ph-email':'మీ ఇమెయిల్','ph-name':'మీ పేరు','ph-subject':'విషయం','ph-msg':'సందేశం'
    },
    ta: {
      'nav-about':'அறிமுகம்','nav-skills':'திறன்கள்','nav-achieve':'சாதனைகள்',
      'nav-projects':'திட்டங்கள்','nav-edu':'கல்வி','nav-contact':'தொடர்பு',
      'hero-hi':'வணக்கம், நான்','hero-iam':'நான் ஒரு ',
      'hero-desc':'வலை மேம்பாடு, UI/UX மற்றும் Python-ல் திறமையான BCA மாணவன்.',
      'hero-resume':'ரெஸ்யூமே பார்க்க',
      'sec-skills':'திறன்கள்','sec-skills-desc':'என் தொழில்நுட்ப திறன்கள்.',
      'sec-achieve':'சாதனைகள்','sec-achieve-desc':'என் ஹேக்கத்தான் வெற்றிகள்.',
      'sec-projects':'திட்டங்கள்','sec-projects-desc':'என் திறன்களை காட்டும் திட்டங்கள்.',
      'sec-edu':'கல்வி','sec-edu-desc':'பள்ளி முதல் கல்லூரி வரை என் கல்வி பயணம்.',
      'sec-contact':'தொடர்பு','sec-contact-desc':'எந்த கேள்விக்கும் தொடர்பு கொள்ளுங்கள்!',
      'sec-download':'போர்ட்ஃபோலியோ பதிவிறக்கம்','sec-download-desc':'மூல குறியீட்டை பதிவிறக்கம் செய்யுங்கள்!',
      'dl-title':'AsifRaza_Portfolio.zip','dl-desc':'Flask · HTML · CSS · JS · அனைத்து கோப்புகளும்',
      'dl-btn':'ZIP பதிவிறக்கம்','form-title':'என்னை மின்னஞ்சல் செய்யுங்கள் 🚀','btn-send':'அனுப்பு',
      'btn-code':'குறியீடு','btn-demo':'டெமோ','label-skills':'திறன்கள்:','label-grade':'தரம்:',
      'earth-label':'🌍 உலகளாவிய வாய்ப்புகளுக்கு தயார்','footer-copy':'© 2025 Asif Raza. அனைத்து உரிமைகளும் ',
      'ph-email':'உங்கள் மின்னஞ்சல்','ph-name':'உங்கள் பெயர்','ph-subject':'தலைப்பு','ph-msg':'செய்தி'
    },
    gu: {
      'nav-about':'પરિચય','nav-skills':'કૌશલ્ય','nav-achieve':'સિદ્ધિઓ',
      'nav-projects':'પ્રોજેક્ટ','nav-edu':'શિક્ષણ','nav-contact':'સંપર્ક',
      'hero-hi':'નમસ્તે, હું છું','hero-iam':'હું એક ',
      'hero-desc':'વેબ ડેવ., UI/UX અને Python માં નિપુણ BCA વિદ્યાર્થી.',
      'hero-resume':'રેઝ્યૂમે જુઓ',
      'sec-skills':'કૌશલ્ય','sec-skills-desc':'મારી તકનીકી કૌશલ્ય.',
      'sec-achieve':'સિદ્ધિઓ','sec-achieve-desc':'મારી હેકેથોન જીત.',
      'sec-projects':'પ્રોજેક્ટ','sec-projects-desc':'મારા કૌશલ્ય દર્શાવતા પ્રોજેક્ટ.',
      'sec-edu':'શિક્ષણ','sec-edu-desc':'શાળાથી કૉલેજ સુધીની મારી સફર.',
      'sec-contact':'સંપર્ક','sec-contact-desc':'કોઈ પ્રશ્ન માટે સંપર્ક કરો!',
      'sec-download':'પોર્ટફોલિયો ડાઉનલોડ','sec-download-desc':'સ્ત્રોત કોડ ડાઉનલોડ કરો!',
      'dl-title':'AsifRaza_Portfolio.zip','dl-desc':'Flask · HTML · CSS · JS · બધી ફાઇલો',
      'dl-btn':'ZIP ડાઉનલોડ','form-title':'મને ઇમેઇલ કરો 🚀','btn-send':'મોકલો',
      'btn-code':'કોડ','btn-demo':'ડેમો','label-skills':'કૌશલ્ય:','label-grade':'ગ્રેડ:',
      'earth-label':'🌍 વૈશ્વિક તકો માટે તૈયાર','footer-copy':'© 2025 Asif Raza. સર્વ હક્ક.',
      'ph-email':'તમારો ઇમેઇલ','ph-name':'તમારું નામ','ph-subject':'વિષય','ph-msg':'સંદેશ'
    },
    pa: {
      'nav-about':'ਜਾਣ-ਪਛਾਣ','nav-skills':'ਕੁਸ਼ਲਤਾਵਾਂ','nav-achieve':'ਪ੍ਰਾਪਤੀਆਂ',
      'nav-projects':'ਪ੍ਰੋਜੈਕਟ','nav-edu':'ਸਿੱਖਿਆ','nav-contact':'ਸੰਪਰਕ',
      'hero-hi':'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਹਾਂ','hero-iam':'ਮੈਂ ਇੱਕ ',
      'hero-desc':'ਵੈੱਬ ਡਿਵੈਲਪਮੈਂਟ, UI/UX ਅਤੇ Python ਵਿੱਚ ਕੁਸ਼ਲ BCA ਵਿਦਿਆਰਥੀ।',
      'hero-resume':'ਰੈਜ਼ੂਮੇ ਦੇਖੋ',
      'sec-skills':'ਕੁਸ਼ਲਤਾਵਾਂ','sec-skills-desc':'ਮੇਰੀਆਂ ਤਕਨੀਕੀ ਕੁਸ਼ਲਤਾਵਾਂ।',
      'sec-achieve':'ਪ੍ਰਾਪਤੀਆਂ','sec-achieve-desc':'ਮੇਰੀਆਂ ਹੈਕਾਥਾਨ ਜਿੱਤਾਂ।',
      'sec-projects':'ਪ੍ਰੋਜੈਕਟ','sec-projects-desc':'ਮੇਰੀਆਂ ਕੁਸ਼ਲਤਾਵਾਂ ਦਿਖਾਉਣ ਵਾਲੇ ਪ੍ਰੋਜੈਕਟ।',
      'sec-edu':'ਸਿੱਖਿਆ','sec-edu-desc':'ਸਕੂਲ ਤੋਂ ਕਾਲਜ ਤੱਕ ਦਾ ਸਫ਼ਰ।',
      'sec-contact':'ਸੰਪਰਕ','sec-contact-desc':'ਕਿਸੇ ਵੀ ਸਵਾਲ ਲਈ ਸੰਪਰਕ ਕਰੋ!',
      'sec-download':'ਪੋਰਟਫੋਲੀਓ ਡਾਊਨਲੋਡ','sec-download-desc':'ਸੋਰਸ ਕੋਡ ਡਾਊਨਲੋਡ ਕਰੋ!',
      'dl-title':'AsifRaza_Portfolio.zip','dl-desc':'Flask · HTML · CSS · JS · ਸਾਰੀਆਂ ਫਾਈਲਾਂ',
      'dl-btn':'ZIP ਡਾਊਨਲੋਡ','form-title':'ਮੈਨੂੰ ਈਮੇਲ ਕਰੋ 🚀','btn-send':'ਭੇਜੋ',
      'btn-code':'ਕੋਡ','btn-demo':'ਡੈਮੋ','label-skills':'ਕੁਸ਼ਲਤਾਵਾਂ:','label-grade':'ਗ੍ਰੇਡ:',
      'earth-label':'🌍 ਵਿਸ਼ਵ ਭਰ ਦੇ ਮੌਕਿਆਂ ਲਈ ਤਿਆਰ','footer-copy':'© 2025 Asif Raza. ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ।',
      'ph-email':'ਤੁਹਾਡੀ ਈਮੇਲ','ph-name':'ਤੁਹਾਡਾ ਨਾਮ','ph-subject':'ਵਿਸ਼ਾ','ph-msg':'ਸੁਨੇਹਾ'
    }
  };

  function applyLang(lang) {
    var d = T[lang] || T['en'];
    opts.forEach(function(o){ o.classList.toggle('active', o.dataset.lang === lang); });
    /* Text elements */
    document.querySelectorAll('[data-key]').forEach(function(el){
      var k = el.getAttribute('data-key');
      if (d[k] !== undefined) el.textContent = d[k];
    });
    /* Placeholder elements */
    document.querySelectorAll('[data-key-ph]').forEach(function(el){
      var k = el.getAttribute('data-key-ph');
      if (d[k] !== undefined) el.placeholder = d[k];
    });
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
