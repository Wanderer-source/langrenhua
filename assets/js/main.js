/* ============================================================
   孙国华 · 作品集 — 数据驱动渲染与交互
   新增内容只需改 assets/data/cases.js + 放图片，无需改此文件。
   ============================================================ */
(function () {
  'use strict';
  var D = window.PORTFOLIO_DATA;
  if (!D) { console.error('PORTFOLIO_DATA 未加载'); return; }
  var META = D.meta;

  /* ---------- 工具 ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function enc(p) { try { return encodeURIComponent(p); } catch (e) { return p; } }

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

  function pad(n) { return (n < 10 ? '0' : '') + n; }

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
    return '<div class="gallery" style="--cols:' + (g.columns || 5) + '">' + cells + '</div>';
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

  /* ---------- 标准电商案例 ---------- */
  function renderStandardCase(c) {
    var h = '';
    h += '<section class="case-section reveal" id="case-' + c.id + '" data-theme="' + c.theme.hex + '" style="--theme:' + c.theme.hex + ';--glow:' + c.theme.glow + '">';
    h += caseHeader(c);
    h += '<div class="case-meta reveal">' +
      '<div><span class="cm-k">交付物</span><span class="cm-v">' + c.meta.deliverables + '</span></div>' +
      '<div><span class="cm-k">规格</span><span class="cm-v">' + c.meta.spec + '</span></div>' +
      '<div><span class="cm-k">角色</span><span class="cm-v">' + c.meta.role + '</span></div>' +
      '</div>';
    h += '<div class="block reveal"><div class="block-head"><h3>策略 / 视觉 / 难点</h3><span class="block-count">' + c.cat + '</span></div>' + strategyHTML(c.strategy) + '</div>';

    if (c.raw) {
      h += '<div class="block reveal"><div class="block-head"><h3>起点 · 产品原图</h3></div>' +
        '<figure class="raw-fig" data-lb data-group="raw-' + c.id + '" data-i="0">' +
        '<img loading="lazy" decoding="async" src="' + c.raw.src + '" alt="' + (c.raw.caption || '') + '" onerror="this.style.opacity=0;this.closest(\'figure\').classList.add(\'img-fail\')">' +
        '<figcaption>' + (c.raw.caption || '') + '</figcaption></figure></div>';
    }
    if (c.listing) {
      h += '<div class="block reveal"><div class="block-head"><h3>Listing 套图</h3><span class="block-count">' + (c.listing.note || '') + '</span></div>' +
        '<p class="block-label">' + c.listing.label + '</p>' + galleryHTML(c.listing, c.theme) + '</div>';
    }
    if (c.detail) {
      h += '<div class="block reveal"><div class="block-head"><h3>A+ 详情页</h3><span class="block-count">' + (c.detail.note || '') + '</span></div>' +
        '<p class="block-label">' + c.detail.label + '</p>' + galleryHTML(c.detail, c.theme) + '</div>';
    }
    if (c.long) {
      h += '<div class="block reveal"><div class="block-head"><h3>详情页长图</h3><span class="block-count">' + (c.long.note || '') + '</span></div>' +
        railHTML(c.long) + '</div>';
    }
    if (c.banner) {
      h += '<div class="block reveal"><div class="block-head"><h3>场景 Banner</h3><span class="block-count">' + (c.banner.note || '') + '</span></div>' +
        '<figure class="banner-fig" data-lb data-group="banner-' + c.id + '" data-i="0">' +
        '<img loading="lazy" decoding="async" src="' + c.banner.src + '" alt="' + (c.banner.label || 'Banner') + '" onerror="this.style.opacity=0;this.closest(\'figure\').classList.add(\'img-fail\')"></figure></div>';
    }
    if (c.videos && c.videos.length) {
      h += '<div class="block reveal"><div class="block-head"><h3>广告片</h3><span class="block-count">' + c.videos.length + ' 支</span></div>' +
        '<div class="video-grid">' + c.videos.map(function (v) { return videoItemHTML(v, false); }).join('') + '</div></div>';
    }
    h += '</section>';
    return h;
  }

  /* ---------- IP 案例（浪人华） ---------- */
  function renderIPCase(c) {
    var h = '';
    h += '<section class="case-section case-ip reveal" id="case-' + c.id + '" data-theme="' + c.theme.hex + '" style="--theme:' + c.theme.hex + ';--glow:' + c.theme.glow + '">';
    h += caseHeader(c);
    h += '<div class="case-meta reveal">' +
      '<div><span class="cm-k">交付物</span><span class="cm-v">' + c.meta.deliverables + '</span></div>' +
      '<div><span class="cm-k">规格</span><span class="cm-v">' + c.meta.spec + '</span></div>' +
      '<div><span class="cm-k">角色</span><span class="cm-v">' + c.meta.role + '</span></div>' +
      '</div>';
    h += '<div class="block reveal"><div class="block-head"><h3>策略 / 视觉 / 难点</h3><span class="block-count">' + c.cat + '</span></div>' + strategyHTML(c.strategy) + '</div>';

    if (c.music) {
      h += '<div class="block reveal"><div class="block-head"><h3>' + (c.music.note || '配乐') + '</h3></div>' +
        '<p class="block-label">' + (c.music.desc || '') + '</p>' +
        '<a class="music-link" href="' + META.music.link + '" target="_blank" rel="noopener">▶ 在网易云收听《' + META.music.title + '》</a></div>';
    }
    (c.sections || []).forEach(function (sec) {
      if (sec.type === 'gallery') {
        h += '<div class="block reveal"><div class="block-head"><h3>' + sec.label + '</h3><span class="block-count">' + (sec.note || '') + '</span></div>' +
          galleryHTML(sec, c.theme) + '</div>';
      } else if (sec.type === 'video') {
        h += '<div class="block reveal"><div class="block-head"><h3>' + (sec.name || '短片') + '</h3><span class="block-count">' + (sec.spec || '') + '</span></div>' +
          '<div class="video-grid">' + videoItemHTML(sec, false) + '</div>' +
          (sec.desc ? '<p class="block-label">' + sec.desc + '</p>' : '') + '</div>';
      }
    });
    h += '</section>';
    return h;
  }

  function caseHeader(c) {
    return '<div class="case-head reveal">' +
      '<span class="case-num">' + c.num + '</span>' +
      '<div class="case-titles"><span class="case-cat">' + c.cat + '</span>' +
      '<h2 class="case-title">' + c.title + '</h2>' +
      '<p class="case-sub">' + c.sub + '</p></div></div>';
  }

  /* ---------- 渲染入口 ---------- */
  function render() {
    // 导航
    var navLinks = [{ id: 'about', label: '关于' }, { id: 'index', label: '目录' }];
    D.cases.forEach(function (c) { navLinks.push({ id: 'case-' + c.id, label: c.num + ' ' + c.title }); });
    navLinks.push({ id: 'film', label: '影像·音乐' }, { id: 'method', label: '方法' }, { id: 'contact', label: '联系' });
    $('#navLinks').innerHTML = navLinks.map(function (l) {
      return '<a href="#' + l.id + '" data-nav="' + l.id + '">' + l.label + '</a>';
    }).join('');

    // Hero
    $('#heroTitle').innerHTML = '<span>' + META.tagline + '</span>';
    $('#heroLede').textContent = META.lede;
    $('#heroStats').innerHTML = '<div class="stat-grid">' + META.stats.map(function (s) {
      return '<div class="stat"><b>' + s.num + '</b><span class="stat-label">' + s.label + '</span><span class="stat-sub">' + s.sub + '</span></div>';
    }).join('') + '</div>';

    // 关于
    $('#aboutGrid').innerHTML = META.capabilities.map(function (cap) {
      return '<div class="about-item reveal"><h3>' + cap.title + '</h3><p>' + cap.text + '</p>' +
        '<div class="tag-row">' + cap.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div></div>';
    }).join('');

    // 目录
    $('#tocList').innerHTML = D.cases.map(function (c) {
      return '<li class="toc-item reveal"><a href="#case-' + c.id + '">' +
        '<span class="toc-num">' + c.num + '</span>' +
        '<span class="toc-body"><span class="toc-cat">' + c.cat + '</span>' +
        '<span class="toc-title">' + c.title + '</span>' +
        '<span class="toc-sub">' + c.sub + '</span></span>' +
        '<span class="toc-arrow">→</span></a></li>';
    }).join('');

    // 案例
    var casesHTML = D.cases.map(function (c) {
      return c.type === 'ip' ? renderIPCase(c) : renderStandardCase(c);
    }).join('');
    $('#cases').innerHTML = casesHTML;

    // 音乐（网易云 iframe）
    var m = META.music;
    $('#musicCard').innerHTML =
      '<div class="music-inner">' +
      '<div class="music-info"><span class="music-tag">IP 主题曲 · 网易云音乐</span>' +
      '<h3>' + m.title + '</h3>' +
      '<p>为「浪人华｜CNS日志」写的配乐，冷夜电子调，用作短片与内容页氛围。点开试听：</p>' +
      '<a class="music-link" href="' + m.link + '" target="_blank" rel="noopener">在网易云打开 ↗</a></div>' +
      '<div class="music-player"><iframe frameborder="0" src="' + m.embed + '" width="100%" height="86"></iframe></div>' +
      '</div>';

    // 短片
    $('#shortGrid').innerHTML = D.shorts.map(function (v) { return videoItemHTML(v, true); }).join('');

    // 方法
    var md = D.method;
    var versions = '<div class="ver-table">' + md.versions.map(function (v) {
      return '<div class="ver-row"><span class="ver-v">' + v.version + '</span>' +
        '<span class="ver-p">' + v.platform + '</span>' +
        '<span class="ver-s">' + v.structure + '</span>' +
        '<span class="ver-d">' + v.duration + '</span></div>';
    }).join('') + '</div>';
    var tools = md.tools.map(function (g) {
      return '<div class="tool-group"><span class="tool-k">' + g.title + '</span>' +
        '<div class="tag-row">' + g.items.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div></div>';
    }).join('');
    $('#methodContent').innerHTML =
      '<div class="block reveal"><div class="block-head"><h3>本地工作流</h3></div>' +
      '<figure class="wf-fig" data-lb data-group="wf" data-i="0">' +
      '<img loading="lazy" decoding="async" src="' + md.workflow.src + '" alt="工作流" onerror="this.style.opacity=0;this.closest(\'figure\').classList.add(\'img-fail\')">' +
      '<figcaption>' + md.workflow.caption + '</figcaption></figure></div>' +
      '<div class="block reveal"><div class="block-head"><h3>同一支 TVC · 四版提示词</h3><span class="block-count">跨模型适配</span></div>' + versions + '</div>' +
      '<div class="block reveal"><div class="block-head"><h3>提示词对照</h3><span class="block-count">A 版 / D 版</span></div>' +
      '<div class="prompt-grid"><pre class="prompt">' + esc(md.promptA) + '</pre>' +
      '<pre class="prompt">' + esc(md.promptD) + '</pre></div></div>' +
      '<div class="block reveal"><div class="block-head"><h3>工具栈</h3></div>' + tools + '</div>';

    // 联系
    var ct = META.contact;
    $('#contactGrid').innerHTML =
      '<div class="contact-line reveal"><a href="mailto:' + ct.email + '">' + ct.email + '</a></div>' +
      '<div class="contact-row reveal">' +
      '<div class="contact-item"><span class="ci-k">邮箱</span><a class="ci-v" href="mailto:' + ct.email + '">' + ct.email + '</a></div>' +
      '<div class="contact-item"><span class="ci-k">电话</span><a class="ci-v" href="tel:' + ct.phone + '">' + ct.phone + '</a></div>' +
      '<div class="contact-item qr-box"><span class="ci-k">微信</span>' +
      '<img class="qr-img" src="' + ct.qr + '" alt="微信二维码" onerror="this.closest(\'.qr-box\').classList.add(\'qr-empty\');this.style.display=\'none\'">' +
      '<span class="qr-tip">扫码加微信</span></div>' +
      '</div>';

    bindAll();
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* ---------- 交互绑定 ---------- */
  var lbImages = [];
  function bindAll() {
    bindVideos();
    bindLightbox();
    initReveal();
    initNav();
    initProgress();
    initGlow();
    bindSmoothScroll();
  }

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
        vid.src = src;
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
    function openLB(i) {
      lbIdx = i;
      lbImg.src = lbList[i];
      lbCount.textContent = (i + 1) + ' / ' + lbList.length;
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    var lbIdx = 0;
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
    window.__closeLB = closeLB;
  }

  function initReveal() {
    var els = $all('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  function initNav() {
    var links = $all('[data-nav]');
    var map = {};
    links.forEach(function (l) { map[l.getAttribute('data-nav')] = l; });
    var sections = ['about', 'index'].concat(D.cases.map(function (c) { return 'case-' + c.id; })).concat(['film', 'method', 'contact']);
    var secEls = sections.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          var act = map[en.target.id];
          if (act) act.classList.add('active');
        }
      });
    }, { threshold: 0.4, rootMargin: '-20% 0px -50% 0px' });
    secEls.forEach(function (s) { io.observe(s); });
  }

  function initProgress() {
    var bar = $('#progressBar');
    function upd() {
      var h = document.documentElement;
      var sc = h.scrollTop || document.body.scrollTop;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (sc / max * 100) : 0) + '%';
    }
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  function initGlow() {
    var glow = $('#bgGlow');
    var pending = false, tx = 50, ty = 18;
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX / window.innerWidth * 100;
      ty = e.clientY / window.innerHeight * 100;
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        glow.style.setProperty('--mx', tx.toFixed(1) + '%');
        glow.style.setProperty('--my', ty.toFixed(1) + '%');
        pending = false;
      });
    }, { passive: true });
    // 案例进入时切换强调色
    var secs = $all('.case-section');
    if ('IntersectionObserver' in window && secs.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var t = en.target.getAttribute('data-theme');
            if (t) document.documentElement.style.setProperty('--accent', t);
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

  /* ---------- 启动 ---------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else { render(); }
})();
