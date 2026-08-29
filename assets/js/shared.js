/* ============================================================
   作品集 · 共享渲染与交互模块
   首页 (index.js) 与子页 (case.js) 共用：渲染函数 + 灯箱/视频/光晕/进度条。
   新增内容仍只改 assets/data/cases.js，无需改此文件。
   ============================================================ */
(function () {
  'use strict';
  var D = window.PORTFOLIO_DATA;

  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s,  r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function enc(p) { try { return encodeURIComponent(p); } catch (e) { return p; } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* GitHub Pages 在国内访问慢，把大媒体（视频/音频/图）走 jsDelivr CDN 加速 */
  var CDN_BASE = 'https://cdn.jsdelivr.net/gh/Wanderer-source/langrenhua@main/';
  function cdn(u) {
    if (!u) return u;
    if (/^https?:\/\//i.test(u)) return u;
    return CDN_BASE + String(u).replace(/^\.\//, '').replace(/^\//, '');
  }

  function onImgErr(e) {
    var im = e.target;
    im.style.opacity = '0';
    var fig = im.closest('figure');
    if (fig) fig.classList.add('img-fail');
    else { var p = im.closest('.media, .poster-wrap'); if (p) p.classList.add('img-fail'); }
  }

  function makeImg(src, alt, cls) {
    var i = document.createElement('img');
    i.loading = 'lazy';
    i.decoding = 'async';
    i.alt = alt || '';
    if (cls) i.className = cls;
    i.src = src;
    i.addEventListener('error', onImgErr);
    return i;
  }

  /* ---------- 图集（Listing / Detail / 系列图） ---------- */
  function galleryHTML(g, caseTheme) {
    var imgs = [];
    if (g.files && g.files.length) {
      g.files.forEach(function (f, k) {
        imgs.push({ src: 'assets/img/' + g.dir + '/' + f, alt: (g.label || '图') + ' 第 ' + (k + 1) + ' 张' });
      });
    } else {
      var start = g.start || 1;
      for (var i = 0; i < g.n; i++) {
        var idx = start + i;
        imgs.push({
          src: 'assets/img/' + g.dir + '/' + g.prefix + '-' + pad(idx) + '.jpg',
          alt: (g.label || '图') + ' 第 ' + idx + ' 张'
        });
      }
    }
    var ratio = g.ratio ? ' style="aspect-ratio:' + g.ratio.replace('/', '/') + '"' : '';
    var cells = imgs.map(function (m, k) {
      var thumb = m.src.replace(/(\/[^/]+\.jpg)$/, '/thumb$1');
      return '<figure class="g-fig' + (g.ratio ? ' g-ratio' : '') + '" data-lb data-group="' +
        (g.dir + '/' + (g.prefix || 'files')) + '" data-i="' + k + '" data-full="' + m.src + '">' +
        '<img loading="lazy" decoding="async" src="' + thumb + '" alt="' + m.alt + '" onerror="this.style.opacity=0;this.closest(\'figure\').classList.add(\'img-fail\')">' +
        '</figure>';
    }).join('');
    return '<div class="gallery" style="--cols:' + (g.columns || 3) + '">' + cells + '</div>';
  }

  /* ---------- 长图卷轴 ---------- */
  function railHTML(r) {
    var segs = [];
    for (var i = 1; i <= r.n; i++) {
      segs.push('assets/img/' + r.dir + '/' + r.prefix + '-' + pad(i) + '.jpg');
    }
    var inner = segs.map(function (s) {
      return '<img loading="lazy" decoding="async" src="' + s + '" alt="' + (r.label || '长图') + '" onerror="this.style.display=\'none\'">';
    }).join('');
    return '<div class="rail-scroll"><div class="rail-inner">' + inner + '</div>' +
      '<span class="rail-hint">↓ 在框内滚动查看完整详情页</span></div>';
  }

  /* ---------- 视频块 ---------- */
  function videoItemHTML(v, isShort) {
    var cover = v.cover || ('assets/poster/' + enc(v.file) + '.jpg');
    var src = 'assets/video/' + enc(v.file) + '.mp4';
    var cls = isShort ? 'v-item v-short' : 'v-item';
    return '<div class="' + cls + '" data-video="' + src + '" data-name="' + (v.name || v.file) + '">' +
      '<div class="poster-wrap">' +
      '<img class="poster" loading="lazy" decoding="async" src="' + cover + '" alt="' + (v.name || '') + ' 封面" onerror="this.closest(\'.poster-wrap\').classList.add(\'img-fail\')">' +
      '<span class="v-ratio">' + (v.ratio || '16:9') + '</span>' +
      '<button class="play-btn" type="button" aria-label="播放 ' + (v.name || '') + '">▶</button>' +
      '</div>' +
      '<div class="v-meta"><span class="v-name">' + (v.name || v.file) + '</span>' +
      '<span class="v-spec">' + (v.spec || '') + '</span></div>' +
      (v.desc ? '<p class="v-desc">' + v.desc + '</p>' : '') +
      '</div>';
  }

  /* ---------- 策略卡 ---------- */
  function strategyHTML(arr) {
    var cards = arr.map(function (s) {
      return '<div class="strat-card reveal"><span class="strat-tag">' + s.title + '</span>' +
        '<p>' + s.text + '</p></div>';
    }).join('');
    return '<div class="strat-grid">' + cards + '</div>';
  }

  /* ---------- 案例公共头部 ---------- */
  function caseHeader(c) {
    return '<div class="case-head reveal">' +
      '<span class="case-num">' + c.num + '</span>' +
      '<div class="case-titles"><span class="case-cat">' + c.cat + '</span>' +
      '<h2 class="case-title">' + c.title + '</h2>' +
      '<p class="case-sub">' + c.sub + '</p></div></div>';
  }

  function caseMetaHTML(c) {
    return '<div class="case-meta reveal">' +
      '<div><span class="cm-k">交付物</span><span class="cm-v">' + c.meta.deliverables + '</span></div>' +
      '<div><span class="cm-k">规格</span><span class="cm-v">' + c.meta.spec + '</span></div>' +
      '<div><span class="cm-k">角色</span><span class="cm-v">' + c.meta.role + '</span></div>' +
      '</div>';
  }

  /* ---------- 大图块（原图 / banner）复用 ---------- */
  function rawFigHTML(raw, id) {
    return '<figure class="raw-fig" data-lb data-group="raw-' + id + '" data-i="0">' +
      '<img loading="lazy" decoding="async" src="' + raw.src + '" alt="' + (raw.caption || '') + '" onerror="this.style.opacity=0;this.closest(\'figure\').classList.add(\'img-fail\')">' +
      '<figcaption>' + (raw.caption || '') + '</figcaption></figure>';
  }
  function bannerFigHTML(b, id) {
    return '<figure class="banner-fig" data-lb data-group="banner-' + id + '" data-i="0">' +
      '<img loading="lazy" decoding="async" src="' + b.src + '" alt="' + (b.label || 'Banner') + '" onerror="this.style.opacity=0;this.closest(\'figure\').classList.add(\'img-fail\')"></figure>';
  }

  /* ---------- 章节标题（编号 + 中英双语） ---------- */
  function sectionHead(num, label, en, count) {
    return '<div class="block-head"><h3>' +
      (num ? '<span class="bh-num">' + num + '</span>' : '') +
      '<span class="bh-zh">' + label + '</span>' +
      (en ? '<span class="bh-en">' + en + '</span>' : '') + '</h3>' +
      (count ? '<span class="block-count">' + count + '</span>' : '') + '</div>';
  }

  /* ---------- 项目元信息条（分类 / 平台 / 年份） ---------- */
  function projectBarHTML(c) {
    if (!c.pmeta) return '';
    var p = c.pmeta, items = [];
    if (p.category) items.push(['分类', p.category]);
    if (p.platform) items.push(['平台', p.platform]);
    if (p.year) items.push(['年份', p.year]);
    if (!items.length) return '';
    return '<div class="case-pmeta">' + items.map(function (it) {
      return '<div class="pm-item"><span class="pm-k">' + it[0] + '</span><span class="pm-v">' + it[1] + '</span></div>';
    }).join('') + '</div>';
  }

  /* ---------- 产品页加载提示（图片较多时友好提醒） ---------- */
  function caseLoadHintHTML() {
    return '<div class="case-load-hint" role="status">' +
      '<span class="clh-dot" aria-hidden="true"></span>' +
      '<span class="clh-text">本页图片较多，加载可能稍慢，请耐心等待</span>' +
      '</div>';
  }

  /* ---------- 标准电商案例（返回 {html, toc}） ---------- */
  function renderStandardCase(c) {
    var secs = [];
    function block(id, num, label, en, count, inner) {
      secs.push({ id: id, num: num, label: label, en: en });
      return '<div class="block reveal" id="' + id + '">' + sectionHead(num, label, en, count) + inner + '</div>';
    }
    var h = '';
    h += '<section class="case-section" id="case-' + c.id + '" data-theme="' + c.theme.hex + '" style="--theme:' + c.theme.hex + ';--glow:' + c.theme.glow + '">';
    h += caseHeader(c);
    h += caseLoadHintHTML();
    h += projectBarHTML(c);
    h += caseMetaHTML(c);
    h += block('s-strat', '01', '策略 / 视觉 / 难点', 'STRATEGY', c.cat, strategyHTML(c.strategy));
    if (c.raw) h += block('s-raw', '02', '起点 · 产品原图', 'RAW', '', rawFigHTML(c.raw, c.id));
    if (c.listing) h += block('s-listing', '03', 'Listing 套图', 'LISTING', (c.listing.note || ''), '<p class="block-label">' + c.listing.label + '</p>' + galleryHTML(c.listing, c.theme));
    if (c.detail) h += block('s-detail', '04', 'A+ 详情页', 'DETAIL', (c.detail.note || ''), '<p class="block-label">' + c.detail.label + '</p>' + galleryHTML(c.detail, c.theme));
    if (c.long) h += block('s-long', '05', '详情页长图', 'LONG-FORM', (c.long.note || ''), railHTML(c.long));
    if (c.banner) h += block('s-banner', '06', '场景 Banner', 'BANNER', (c.banner.note || ''), bannerFigHTML(c.banner, c.id));
    if (c.videos && c.videos.length) h += block('s-video', '07', '广告片', 'FILM', c.videos.length + ' 支', '<div class="video-grid">' + c.videos.map(function (v) { return videoItemHTML(v, false); }).join('') + '</div>');
    h += '</section>';
    return { html: h, toc: secs };
  }

  /* ---------- IP 案例（浪人华） ---------- */
  function renderIPCase(c) {
    var META = window.PORTFOLIO_DATA.meta;
    var secs = [];
    function block(id, num, label, en, count, inner) {
      secs.push({ id: id, num: num, label: label, en: en });
      return '<div class="block reveal" id="' + id + '">' + sectionHead(num, label, en, count) + inner + '</div>';
    }
    var h = '';
    h += '<section class="case-section case-ip" id="case-' + c.id + '" data-theme="' + c.theme.hex + '" style="--theme:' + c.theme.hex + ';--glow:' + c.theme.glow + '">';
    h += caseHeader(c);
    h += caseLoadHintHTML();
    h += projectBarHTML(c);
    h += caseMetaHTML(c);
    h += block('s-strat', '01', '策略 / 视觉 / 难点', 'STRATEGY', c.cat, strategyHTML(c.strategy));
    (c.sections || []).forEach(function (sec, i) {
      var num = pad(2 + i);
      var en = sec.type === 'video' ? 'FILM' : 'GALLERY';
      if (sec.type === 'gallery') {
        h += block('s-sec' + i, num, sec.label, en, (sec.note || ''), galleryHTML(sec, c.theme));
      } else if (sec.type === 'video') {
        h += block('s-sec' + i, num, (sec.name || '短片'), en, (sec.spec || ''),
          '<div class="video-grid">' + videoItemHTML(sec, false) + '</div>' +
          (sec.desc ? '<p class="block-label">' + sec.desc + '</p>' : ''));
      }
    });
    h += '</section>';
    return { html: h, toc: secs };
  }

  /* ---------- 交互绑定 ---------- */
  function bindVideos() {
    $all('.v-item').forEach(function (item) {
      var play = item.querySelector('.play-btn');
      var handler = function () {
        if (item.querySelector('video')) return;
        var src = item.getAttribute('data-video');
        var name = item.getAttribute('data-name');
        var pw = item.querySelector('.poster-wrap');
        var vid = document.createElement('video');
        vid.controls = true; vid.autoplay = true; vid.playsInline = true;
        vid.src = cdn(src);
        vid.addEventListener('error', function () {
          pw.innerHTML = '<span class="v-err">视频加载失败，请检查网络或本地文件</span>';
        });
        pw.innerHTML = '';
        pw.appendChild(vid);
        vid.play().catch(function () {});
      };
      if (play) play.addEventListener('click', handler);
      item.querySelector('.poster-wrap').addEventListener('click', function (e) {
        if (e.target === play) return; handler();
      });
    });
  }

  function bindLightbox() {
    var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCount = $('#lbCount'), lbList = [];
    if (!lb) return;
    document.addEventListener('click', function (e) {
      var fig = e.target.closest('[data-lb]');
      if (!fig) return;
      var group = fig.getAttribute('data-group');
      var imgs = $all('[data-lb][data-group="' + group + '"]');
      lbList = imgs.map(function (f) {
        var full = f.getAttribute('data-full');
        return full ? full : f.querySelector('img').src;
      });
      var idx = imgs.indexOf(fig);
      openLB(idx);
    });
    var lbIdx = 0;
    function openLB(i) {
      lbIdx = i;
      lbImg.src = lbList[i];
      lbCount.textContent = (i + 1) + ' / ' + lbList.length;
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function nav(d) { lbIdx = (lbIdx + d + lbList.length) % lbList.length; lbImg.src = lbList[lbIdx]; lbCount.textContent = (lbIdx + 1) + ' / ' + lbList.length; }
    $('#lbClose').addEventListener('click', closeLB);
    $('#lbPrev').addEventListener('click', function () { nav(-1); });
    $('#lbNext').addEventListener('click', function () { nav(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLB();
      if (e.key === 'ArrowLeft') nav(-1);
      if (e.key === 'ArrowRight') nav(1);
    });
    function closeLB() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; lbImg.src = ''; }
  }

  function initReveal() {
    var els = $all('.reveal, .sec-head, .about-item, .cap-chip, .case-card, .wf-step, .v-item');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var vh = window.innerHeight || document.documentElement.clientHeight || 800;

    // 进场后清除延迟，避免回落 hover 时仍被 transition-delay 拖慢。
    function markIn(e) { e.classList.add('in'); setTimeout(function () { e.style.transitionDelay = ''; }, 1100); }

    // 兜底：比视口高得多的元素永远无法满足比例阈值（历史上曾导致整页 opacity:0 不可见），
    // 这类元素直接显示，不参与滚动揭示。
    var rest = [];
    els.forEach(function (e) {
      var h = e.offsetHeight || 0;
      if (h > vh * 1.2) { markIn(e); } else { rest.push(e); }
    });
    if (!rest.length) return;

    // 同组兄弟元素错峰：进入视口时依次延迟淡入，形成层次。
    var lastParent = null, grp = 0;
    rest.forEach(function (e) {
      if (e.parentNode !== lastParent) { lastParent = e.parentNode; grp = 0; } else { grp++; }
      e.style.transitionDelay = Math.min(grp * 0.07, 0.45) + 's';
    });

    // threshold 用 0：只要元素顶部进入（下边距收缩 10% 后的）视口即揭示，
    // 避免任何高度的元素因比例阈值永远触发不了。
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { markIn(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    rest.forEach(function (e) { io.observe(e); });

    // 二次兜底：轮询扫描“已到达视口”的元素并补显示。
    // 不依赖 scroll 事件（scroll 事件在部分环境/无头渲染下可能完全不触发），
    // 保证任何情况下内容都不会因揭示动画而永久隐藏（历史上曾整页 opacity:0）。
    var left = rest.slice();
    var rescue = function () {
      if (!left.length) return;
      var v = window.innerHeight || document.documentElement.clientHeight || 800;
      left = left.filter(function (e) {
        if (e.classList.contains('in')) return false;
        var r = e.getBoundingClientRect();
        var arrived = r.height === 0 || (r.top < v * 0.95 && r.bottom > 0);
        if (arrived) markIn(e);
        return !arrived;
      });
    };
    window.addEventListener('scroll', rescue, { passive: true });
    window.addEventListener('resize', rescue);
    var sweep = setInterval(function () {
      rescue();
      if (!left.length) clearInterval(sweep);
    }, 400);
    setTimeout(function () { clearInterval(sweep); }, 20000);
  }

  function initProgress() {
    var bar = $('#progressBar');
    if (!bar) return;
    function upd() {
      var h = document.documentElement;
      var sc = h.scrollTop || document.body.scrollTop;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (sc / max * 100) : 0) + '%';
    }
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  /* 方案A/D 共用：纵深光。方案A（纯黑极简）下 bg-glow 被 CSS 隐藏，则不启动滚动缓动，只保留 --accent 随区块切换。 */
  function initGlow() {
    var glow = $('#bgGlow');
    if (!glow) return;
    var doc = document.documentElement;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var glowVisible = !(glow.offsetParent === null); // display:none 时 offsetParent 为 null

    function target() {
      var max = (document.body.scrollHeight || doc.scrollHeight) - (window.innerHeight || 1);
      var p = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || window.pageYOffset || 0) / max)) : 0;
      return { x: 50 + Math.sin(p * Math.PI * 2) * 9, y: 34 + p * 34 };
    }
    if (glowVisible && !reduce) {
      var cur = target(), tg = target();
      window.addEventListener('scroll', function () { tg = target(); }, { passive: true });
      (function loop() {
        cur.x += (tg.x - cur.x) * 0.045;
        cur.y += (tg.y - cur.y) * 0.045;
        doc.style.setProperty('--sx', cur.x.toFixed(1) + '%');
        doc.style.setProperty('--sy', cur.y.toFixed(1) + '%');
        requestAnimationFrame(loop);
      })();
    } else if (glowVisible && reduce) {
      var t0 = target();
      doc.style.setProperty('--sx', t0.x.toFixed(1) + '%');
      doc.style.setProperty('--sy', t0.y.toFixed(1) + '%');
    }

    var secs = $all('.case-section');
    if ('IntersectionObserver' in window && secs.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var t = en.target.getAttribute('data-theme');
            if (t) doc.style.setProperty('--accent', t);
          }
        });
      }, { threshold: 0.5 });
      secs.forEach(function (s) { io.observe(s); });
    }
  }

  function bindSmoothScroll() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      var t = document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ---------- 背景增强：漂移光晕球 + 轻量粒子 ---------- */
  var bgInited = false;
  function initBackground() {
    if (bgInited) return; bgInited = true;
    // 背景改为克制风格：不再注入漂浮光晕球与漂移粒子（参考同学作品集：纯色/极简，无喧闹动态层）。
    return;
    var orbs = document.createElement('div');
    orbs.className = 'bg-orbs';
    orbs.setAttribute('aria-hidden', 'true');
    orbs.innerHTML = '<span class="orb o1"></span><span class="orb o2"></span><span class="orb o3"></span>';
    document.body.insertBefore(orbs, document.body.firstChild);
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var cv = document.createElement('canvas');
    cv.className = 'bg-particles';
    cv.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(cv, document.body.firstChild);
    var ctx = cv.getContext('2d');
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var N = 46;
    var parts = [];
    function resize() {
      cv.width = window.innerWidth * DPR;
      cv.height = window.innerHeight * DPR;
      cv.style.width = window.innerWidth + 'px';
      cv.style.height = window.innerHeight + 'px';
    }
    function seed() {
      parts = [];
      for (var i = 0; i < N; i++) {
        parts.push({
          x: Math.random() * cv.width, y: Math.random() * cv.height,
          vx: (Math.random() - 0.5) * 0.16 * DPR, vy: (Math.random() - 0.5) * 0.16 * DPR,
          r: (Math.random() * 1.5 + 0.5) * DPR
        });
      }
    }
    function hexToRgb(h) {
      h = (h || '').trim().replace('#', '');
      if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
      var n = parseInt(h, 16);
      if (isNaN(n)) return '242,88,42';
      return ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255);
    }
    resize(); seed();
    window.addEventListener('resize', function () { resize(); seed(); });
    var raf, running = true;
    function tick() {
      if (!running) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#f2582a';
      var rgb = hexToRgb(accent);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = cv.width; else if (p.x > cv.width) p.x = 0;
        if (p.y < 0) p.y = cv.height; else if (p.y > cv.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb + ',0.45)';
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    }
    tick();
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { running = false; if (raf) cancelAnimationFrame(raf); }
      else { running = true; tick(); }
    });
  }

  /* ---------- 背景音乐（真实 audio 元素 + 开关） ----------
     说明：旧实现把网易云播放器塞进 0×0 的屏幕外 iframe，浏览器基本不会播放，
     跨域 autoplay 也会拦截 —— 等于没声音。改为本地音源 <audio loop>，
     开关真正控制 play/pause，并记忆偏好、跨页续播。 */
  var bgmInited = false;
  var BGM = { el: null, ready: false, playing: false, intend: false };

  function initBGM() {
    if (bgmInited) return; bgmInited = true;
    var META = window.PORTFOLIO_DATA && window.PORTFOLIO_DATA.meta;
    var m = META && META.music;
    if (!m) return;

    var src = m.file || '';
    var targetVol = (typeof m.volume === 'number') ? m.volume : 0.5;

    var audio = new Audio();
    audio.loop = true;
    // 音源有数 MB，但 preload=metadata 只取元信息（几 KB），不预下载整首；
    // 真正点播放时浏览器才续拉音频数据，首屏不背整首下载。
    audio.preload = 'metadata';
    audio.volume = 0;
    audio.setAttribute('playsinline', '');
    audio.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
    document.body.appendChild(audio);
    BGM.el = audio;

    /* 音频分析（供背景可视化联动）：把 audio 接到 Web Audio AnalyserNode。
       仅在用户手势后启用，避免无手势时 ctx 被 suspend 而静音。 */
    var AC = window.AudioContext || window.webkitAudioContext;
    var actx = null, analyser = null, freqData = null, userGestured = false;
    function ensureAudioGraph() {
      if (analyser || !userGestured || !AC) return;
      try {
        actx = new AC();
        var srcNode = actx.createMediaElementSource(audio);
        analyser = actx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.82;
        freqData = new Uint8Array(analyser.frequencyBinCount);
        srcNode.connect(analyser);
        analyser.connect(actx.destination);
        if (actx.state === 'suspended' && actx.resume) actx.resume();
      } catch (e) { analyser = null; actx = null; }
    }

    /* 淡入淡出，避免开关时声音突兀 */
    var fadeTimer = null;
    function fadeIn() {
      clearInterval(fadeTimer);
      audio.volume = 0;
      var step = targetVol / 20;
      fadeTimer = setInterval(function () {
        var v = audio.volume + step;
        if (v >= targetVol) { audio.volume = targetVol; clearInterval(fadeTimer); }
        else audio.volume = v;
      }, 50);
    }
    function stopFade() { clearInterval(fadeTimer); }

    /* 跨页续播：记住播放位置（10 分钟内有效） */
    var SS_POS = 'bgmPos', SS_AT = 'bgmPosAt';
    function savePos() {
      try {
        sessionStorage.setItem(SS_POS, String(audio.currentTime || 0));
        sessionStorage.setItem(SS_AT, String(Date.now()));
      } catch (e) {}
    }
    function restorePos() {
      try {
        var p = parseFloat(sessionStorage.getItem(SS_POS) || '0');
        var t = parseInt(sessionStorage.getItem(SS_AT) || '0', 10);
        if (t && Date.now() - t < 600000 && p > 0) { try { audio.currentTime = p; } catch (e) {} }
      } catch (e) {}
    }

    /* 开关 UI：右下角小球仅作为“打开设置”入口，点击弹出面板，面板内的开关才真正控制音乐 */
    var wrap = document.createElement('div');
    wrap.className = 'bgm';
    wrap.innerHTML =
      '<div class="bgm-pop" id="bgmPop" role="dialog" aria-label="背景音乐开关">' +
        '<div class="bgm-pop-row">' +
          '<span class="bgm-pop-label">背景音乐</span>' +
          '<button class="bgm-switch" id="bgmSwitch" type="button" role="switch" aria-checked="false">' +
            '<span class="bgm-switch-knob"></span>' +
          '</button>' +
        '</div>' +
        '<p class="bgm-pop-note" id="bgmPopNote">已关闭</p>' +
      '</div>' +
      '<button class="bgm-btn" id="bgmBtn" type="button" aria-label="打开背景音乐开关">' +
        '<span class="bgm-ico">♪</span>' +
      '</button>';
    document.body.appendChild(wrap);
    var btn = wrap.querySelector('#bgmBtn');
    var pop = wrap.querySelector('#bgmPop');
    var sw = wrap.querySelector('#bgmSwitch');
    var popNote = wrap.querySelector('#bgmPopNote');

    function emit() {
      try {
        document.dispatchEvent(new CustomEvent('bgmchange', {
          detail: { playing: BGM.playing, ready: BGM.ready, intend: !!BGM.intend }
        }));
      } catch (e) {}
      syncBtn();
    }
    function syncBtn() {
      if (!BGM.ready) {
        // 音源未接入时隐藏整个控件，避免展示上出现点了没反应的死按钮
        wrap.style.display = 'none';
        if (sw) sw.setAttribute('aria-checked', 'false');
        if (popNote) popNote.textContent = '音源待接入';
        return;
      }
      wrap.style.display = '';
      var on = BGM.playing || BGM.intend;
      if (sw) sw.setAttribute('aria-checked', on ? 'true' : 'false');
      if (popNote) popNote.textContent = on ? '播放中' : '已关闭';
      // 小球不再直接控制音乐，仅作状态指示（亮起=播放中）+ 弹出入口
      var pending = on && !BGM.playing;   // 想开但被自动播放策略拦截，等首次手势补播
      if (on) btn.classList.add('on'); else btn.classList.remove('on');
      if (pending) btn.classList.add('pending'); else btn.classList.remove('pending');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', pending ? '点击页面任意处开启背景音乐' : (on ? '背景音乐播放中' : '背景音乐已关闭'));
    }

    function tryPlay(cb) {
      var p = null;
      try { p = audio.play(); } catch (e) { p = null; }
      if (p && typeof p.then === 'function') {
        p.then(function () { BGM.playing = true; fadeIn(); emit(); if (cb) cb(true); },
               function () { BGM.playing = false; emit(); if (cb) cb(false); });
      } else {
        BGM.playing = !audio.paused;
        if (BGM.playing) fadeIn();
        emit();
        if (cb) cb(BGM.playing);
      }
    }
    function play(cb) {
      if (!BGM.ready) { emit(); if (cb) cb(false); return; }
      restorePos();
      tryPlay(cb);
    }
    function pause() {
      stopFade();
      try { audio.pause(); } catch (e) {}
      savePos();
      BGM.playing = false;
      emit();
    }
    function setPref(v) { try { localStorage.setItem('bgm', v); } catch (e) {} }

    /* 小球：仅打开/关闭弹出面板，不直接控制音乐 */
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!BGM.ready) {
        // 音源未接入：跳到「原创音乐」板块，用网易云播放器听
        var target = document.getElementById('musicCard') || document.getElementById('film');
        if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        else if (m.link) window.open(m.link, '_blank', 'noopener');
        return;
      }
      pop.classList.toggle('open');
    });

    /* 弹出面板内的开关：才是真正控制音乐的地方 */
    function setMusic(on) {
      userGestured = true; ensureAudioGraph();
      if (!BGM.ready) return;
      // 先更新 intend，再 play/pause（其内的 emit→syncBtn 才能读到正确状态，避免 UI 卡在旧值）
      BGM.intend = on;
      setPref(on ? 'on' : 'off');
      if (on) play(); else pause();
    }
    sw.addEventListener('click', function (e) {
      e.stopPropagation();
      setMusic(!(BGM.playing || BGM.intend));
    });

    /* 点击面板以外区域自动收起 */
    document.addEventListener('click', function (e) {
      if (pop.classList.contains('open') && !wrap.contains(e.target)) pop.classList.remove('open');
    });

    /* 音源可用性 */
    if (src) {
      // 音源走本地相对路径，不依赖外部 CDN：一旦 jsDelivr 访问不稳/断网，
      // 外链加载失败会导致 BGM.ready 永为 false、控件被隐藏、音乐彻底失效。
      // 本地文件随站点同源部署（GitHub Pages 同样可服务），稳定且加载快。
      audio.src = src;
      function markReady() { if (!BGM.ready) { BGM.ready = true; emit(); } }
      // preload=metadata 下 canplay 不一定触发，故两个事件都听
      audio.addEventListener('loadedmetadata', markReady);
      audio.addEventListener('canplay', markReady);
      audio.addEventListener('error', function () { BGM.ready = false; BGM.playing = false; emit(); });
    } else {
      BGM.ready = false;
    }

    syncBtn();
    setInterval(function () { if (BGM.playing) savePos(); }, 5000);
    window.addEventListener('pagehide', function () { if (BGM.playing) savePos(); });

    /* 恢复上次偏好：浏览器通常禁止无手势自动播放，
       先尝试，失败则等用户第一次交互（点击/按键）再补播 */
    var pref = null;
    try { pref = localStorage.getItem('bgm'); } catch (e) {}
    if (pref !== 'off') {
      BGM.intend = true;
      syncBtn();
      function start() {
        if (!BGM.ready) return;
        play(function (ok) { if (ok) offKick(); });
      }
      function kick(e) {
        // 点击/按键落在 BGM 控件本身时，交给控件自己的 handler 决定，
        // 避免自动 play 抢跑导致「开关取反」冲突（点了反而关）
        if (wrap && e && e.target && wrap.contains(e.target)) return;
        userGestured = true; ensureAudioGraph();
        if (BGM.playing) { offKick(); return; }
        start();
      }
      function offKick() {
        document.removeEventListener('pointerdown', kick);
        document.removeEventListener('keydown', kick);
      }
      if (BGM.ready) start();
      else audio.addEventListener('canplay', start, { once: true });
      document.addEventListener('pointerdown', kick);
      document.addEventListener('keydown', kick);
      // 不设置超时：首次交互补播监听一直保留，直到真正播放成功才移除，
      // 避免用户 15 秒内没操作就永久失去“默认开启”机会。
    }

    /* 供「原创音乐」板块复用同一音源 */
    if (window.CaseApp) {
      window.CaseApp.bgm = {
        play: function () { play(); setPref('on'); BGM.intend = true; },
        pause: function () { pause(); setPref('off'); BGM.intend = false; },
        toggle: function () {
          if (!BGM.ready) return false;
          // 基于“有效播放态”取反，先设 intend 再 play/pause，保证 UI 同步
          var on = !(BGM.playing || BGM.intend);
          BGM.intend = on;
          setPref(on ? 'on' : 'off');
          if (on) play(); else pause();
          return on;
        },
        isPlaying: function () { return BGM.playing; },
        isReady: function () { return BGM.ready; },
        isIntend: function () { return !!BGM.intend; },
        getAudioData: function () {
          if (!analyser) return null;
          try {
            analyser.getByteFrequencyData(freqData);
            var n = freqData.length, b = 0, m = 0, t2 = 0;
            var bEnd = Math.max(1, Math.floor(n * 0.12));
            var mEnd = Math.max(bEnd + 1, Math.floor(n * 0.5));
            for (var i = 0; i < n; i++) {
              var v = freqData[i];
              if (i < bEnd) b += v; else if (i < mEnd) m += v; else t2 += v;
            }
            var bass = b / bEnd / 255, mid = m / (mEnd - bEnd) / 255, treble = t2 / (n - mEnd) / 255;
            return { bass: bass, mid: mid, treble: treble, level: (bass + mid + treble) / 3 };
          } catch (e) { return null; }
        }
      };
    }
  }

  /* ---------- 背景氛围特效：漂浮星点 + 音乐联动 + 鼠标互动 ----------
     强度随场景：首页首屏显眼 → 下滑渐弱；产品子页克制专注看图。 */
  var bgfxInited = false;
  function initBackgroundFX() {
    if (bgfxInited) return; bgfxInited = true;
    // 背景改为克制风格：关闭呼吸粒子层（参考同学作品集：纯色/极简，无粒子特效）。
    return;
    if (!('requestAnimationFrame' in window) || !document.createElement('canvas').getContext) return;

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isCase = /case\.html/.test(location.pathname) || location.search.indexOf('id=') >= 0;

    var canvas = document.createElement('canvas');
    canvas.className = 'bg-fx';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var accent = '#5ad1ff';
    try { var av = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(); if (av) accent = av; } catch (e) {}
    function hexToRgb(h) {
      h = h.replace('#', '');
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var nn = parseInt(h, 16);
      return [(nn >> 16) & 255, (nn >> 8) & 255, nn & 255];
    }
    var AR = hexToRgb(accent);

    var baseCount = Math.round(Math.min(170, Math.max(48, (W * H) / 15000)));
    if (isCase) baseCount = Math.round(baseCount * 0.55);
    if (reduce) baseCount = Math.min(baseCount, 24);
    var parts = [];
    function spawn() {
      parts.length = 0;
      for (var i = 0; i < baseCount; i++) {
        parts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
          r: 0.6 + Math.random() * 1.8, ph: Math.random() * Math.PI * 2,
          sp: 0.6 + Math.random() * 0.9, a: 0.25 + Math.random() * 0.5
        });
      }
    }
    spawn();

    var mx = W / 2, my = H / 2, mAct = 0;
    window.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; mAct = 1; }, { passive: true });
    window.addEventListener('pointerdown', function (e) { mx = e.clientX; my = e.clientY; mAct = 1; }, { passive: true });

    var intensity = isCase ? 0.32 : 1, targetI = intensity;
    function calcTarget() {
      if (isCase) { targetI = 0.32; return; }
      var vh = window.innerHeight;
      var s = window.pageYOffset || document.documentElement.scrollTop || 0;
      var f = 1 - Math.min(1, Math.max(0, (s - vh * 0.4) / (vh * 1.1)));
      targetI = 0.38 + 0.62 * f;
    }
    calcTarget();
    window.addEventListener('scroll', calcTarget, { passive: true });

    var t0 = performance.now(), elapsed = 0, paused = false, running = false;
    function startLoop() { if (running) return; running = true; paused = false; t0 = performance.now() - elapsed; requestAnimationFrame(loop); }
    document.addEventListener('visibilitychange', function () { if (document.hidden) paused = true; else startLoop(); });

    function loop() {
      if (paused) { running = false; return; }
      var now = performance.now();
      elapsed = now - t0;
      var time = elapsed / 1000;
      intensity += (targetI - intensity) * 0.06;

      var lvl = 0, bass = 0;
      var bgm = window.CaseApp && window.CaseApp.bgm;
      var ad = bgm && bgm.getAudioData ? bgm.getAudioData() : null;
      if (ad) { lvl = ad.level; bass = ad.bass; }

      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.20)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';

      var mouseR = (90 + bass * 120) * (0.6 + intensity * 0.6);
      var pulse = reduce ? 0 : 1;

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (!reduce) { p.x += p.vx; p.y += p.vy; }
        if (p.x < -12) p.x = W + 12; else if (p.x > W + 12) p.x = -12;
        if (p.y < -12) p.y = H + 12; else if (p.y > H + 12) p.y = -12;

        var dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
        if (d2 < mouseR * mouseR) {
          var d = Math.sqrt(d2) || 1, f = (1 - d / mouseR);
          var push = f * (1.4 + intensity * 1.2);
          p.x += (dx / d) * push; p.y += (dy / d) * push;
        }

        var breath = 0.5 + 0.5 * Math.sin(time * p.sp + p.ph);
        var rr = p.r * (0.7 + breath * 0.5) * (1 + lvl * 1.4 * pulse + bass * 0.8 * pulse);
        var alpha = p.a * (0.35 + breath * 0.5) * (0.5 + intensity * 0.7) * (0.7 + lvl * 0.9 * pulse);
        if (alpha <= 0.012) continue;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr * 3.2);
        g.addColorStop(0, 'rgba(' + AR[0] + ',' + AR[1] + ',' + AR[2] + ',' + alpha + ')');
        g.addColorStop(1, 'rgba(' + AR[0] + ',' + AR[1] + ',' + AR[2] + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rr * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (mAct > 0) {
        var mg = ctx.createRadialGradient(mx, my, 0, mx, my, mouseR * 1.3);
        mg.addColorStop(0, 'rgba(' + AR[0] + ',' + AR[1] + ',' + AR[2] + ',' + (0.05 + intensity * 0.07) + ')');
        mg.addColorStop(1, 'rgba(' + AR[0] + ',' + AR[1] + ',' + AR[2] + ',0)');
        ctx.fillStyle = mg;
        ctx.beginPath(); ctx.arc(mx, my, mouseR * 1.3, 0, Math.PI * 2); ctx.fill();
      }

      if (window.__bgfx) window.__bgfx = { count: parts.length, intensity: +intensity.toFixed(3), level: +lvl.toFixed(3), mouseR: Math.round(mouseR), playing: !!(bgm && bgm.isPlaying && bgm.isPlaying()) };
      requestAnimationFrame(loop);
    }
    window.__bgfx = { count: parts.length, intensity: +intensity.toFixed(3), level: 0, mouseR: 0, playing: false };
    startLoop();
  }

  function bindAll() {
    bindVideos();
    bindLightbox();
    initReveal();
    initProgress();
    initGlow();
    bindSmoothScroll();
    initBackground();
    initBackgroundFX();
    initCursorFX();
    initBGM();
  }

  /* ---------- 鼠标跟随柔光晕 ----------
     仅在精确指针（鼠标）设备启用；触屏 / 晕动症偏好下自动关闭。
     用 rAF 缓动让光晕带一点拖尾，悬停可交互元素时放大。 */
  function initCursorFX() {
    if (!window.matchMedia) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.setAttribute('aria-hidden', 'true');
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    document.body.appendChild(ring);

    var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    var gx = tx, gy = ty, rx = tx, ry = ty;

    function show() { glow.classList.add('on'); ring.classList.add('on'); }
    function hide() { glow.classList.remove('on'); ring.classList.remove('on'); }
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY; show();
    }, { passive: true });
    document.addEventListener('mouseleave', hide);
    window.addEventListener('blur', hide);

    (function loop() {
      gx += (tx - gx) * 0.16; gy += (ty - gy) * 0.16;   // 柔光晕：带拖尾
      rx += (tx - rx) * 0.30; ry += (ty - ry) * 0.30;   // 光标环：跟得更紧
      glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();

    var sel = 'a,button,.case-card,.cap-chip,.wf-tab,.music-play,.g-fig,.wf-step';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest && e.target.closest(sel)) { glow.classList.add('big'); ring.classList.add('big'); }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(sel)) { glow.classList.remove('big'); ring.classList.remove('big'); }
    });
  }

  /* 暴露给首页与子页共用 */
  window.CaseApp = {
    galleryHTML: galleryHTML,
    railHTML: railHTML,
    videoItemHTML: videoItemHTML,
    strategyHTML: strategyHTML,
    caseHeader: caseHeader,
    caseMetaHTML: caseMetaHTML,
    renderStandardCase: renderStandardCase,
    renderIPCase: renderIPCase,
    bindAll: bindAll
  };
})();
