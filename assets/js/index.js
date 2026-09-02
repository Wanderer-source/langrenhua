/* ============================================================
   首页 Hub 渲染
   仅依赖 shared.js 暴露的 CaseApp 与 cases.js 数据。
   ============================================================ */
(function () {
  'use strict';
  var D = window.PORTFOLIO_DATA;
  if (!D) { console.error('PORTFOLIO_DATA 未加载'); return; }
  var META = D.meta;

  function $(s) { return document.querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  /* 导航：简化为 5 项，作品放第一位 */
  var navLinks = [
    { id: 'works', label: '作品' },
    { id: 'about', label: '关于' },
    { id: 'capabilities', label: '能力' },
    { id: 'method', label: '方法' },
    { id: 'contact', label: '联系' }
  ];
  $('#navLinks').innerHTML = navLinks.map(function (l) {
    return '<a href="#' + l.id + '" data-nav="' + l.id + '">' + l.label + '</a>';
  }).join('');

  /* Hero：文案去 AI 感 */
  $('#heroEn').textContent = 'AIGC VISUAL DESIGNER · 视觉设计师';
  $('#heroTitle').innerHTML = '<span>做能卖货的</span><span><em>视觉</em>，从一张原图开始</span>';
  $('#heroLede').textContent = META.lede;
  $('#heroStats').innerHTML = '<div class="stat-grid">' + META.stats.map(function (s) {
    return '<div class="stat"><b>' + s.num + '</b><span class="stat-label">' + s.label + '</span><span class="stat-sub">' + s.sub + '</span></div>';
  }).join('') + '</div>';

  $('#heroBadges').innerHTML = [
    { k: 'FOCUS', v: '电商视觉 · 商业影像 · IP' },
    { k: 'DOMAIN', v: 'sun-portfolio' },
    { k: 'STATUS', v: '求职中 · AVAILABLE' }
  ].map(function (b) {
    return '<div class="hbadge"><span class="hb-k">' + b.k + '</span><span class="hb-v">' + b.v + '</span></div>';
  }).join('');

  /* 作品：案例卡片 + 筛选 + 影像作品 */
  function coverOf(c) {
    if (c.banner) return c.banner.src;
    if (c.id === 'langrenhua') return 'assets/img/langrenhua/cover.jpg';
    return '';
  }
  $('#caseCards').innerHTML = D.cases.map(function (c) {
    return '<a class="case-card reveal" href="case.html?id=' + c.id + '" data-filter="' + (c.filter || 'all') + '" style="--theme:' + c.theme.hex + ';--glow:' + c.theme.glow + '">' +
      '<div class="cc-cover"><img loading="lazy" decoding="async" src="' + coverOf(c) + '" alt="' + c.title + '" onerror="this.style.opacity=0"></div>' +
      '<div class="cc-body">' +
      '<span class="cc-num">' + c.num + '</span>' +
      '<span class="cc-cat">' + c.cat + '</span>' +
      '<h3 class="cc-title">' + c.title + '</h3>' +
      '<p class="cc-sub">' + c.sub + '</p>' +
      '<span class="cc-go">查看项目 →</span>' +
      '</div></a>';
  }).join('');

  var filterDefs = [
    { k: 'all', t: '全部' },
    { k: 'ecom', t: '电商套图' },
    { k: 'ip', t: 'IP 形象' }
  ];
  var fEl = $('#workFilter');
  fEl.innerHTML = filterDefs.map(function (f, i) {
    return '<button class="wf-tab' + (i === 0 ? ' active' : '') + '" type="button" data-filter="' + f.k + '">' + f.t + '</button>';
  }).join('');
  fEl.addEventListener('click', function (e) {
    var b = e.target.closest('.wf-tab');
    if (!b) return;
    var f = b.getAttribute('data-filter');
    $all('.wf-tab', fEl).forEach(function (x) { x.classList.remove('active'); });
    b.classList.add('active');
    $all('#caseCards .case-card').forEach(function (card) {
      var show = (f === 'all') || card.getAttribute('data-filter') === f;
      card.style.display = show ? '' : 'none';
    });
  });

  $('#shortGrid').innerHTML = D.shorts.map(function (v) { return window.CaseApp.videoItemHTML(v, true); }).join('');
  $('#adsGrid').innerHTML = (D.ads || []).map(function (v) { return window.CaseApp.videoItemHTML(v, false); }).join('');

  /* 关于 */
  $('#aboutGrid').innerHTML = META.capabilities.map(function (cap) {
    return '<div class="about-item reveal"><h3>' + cap.title + '</h3><p>' + cap.text + '</p>' +
      '<div class="tag-row">' + cap.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div></div>';
  }).join('');

  /* 能力标签云 */
  var capSet = [];
  META.capabilities.forEach(function (c) { c.tags.forEach(function (t) { if (capSet.indexOf(t) < 0) capSet.push(t); }); });
  ['提示词工程', '分镜脚本', 'AI 海报设计', '场景概念设计', '品牌 KV', '流程标准化', '团队赋能培训', '电商视觉体系', 'TVC 创意策划', '后期精修', 'AI 视频生成', '产品一致性控制']
    .forEach(function (t) { if (capSet.indexOf(t) < 0) capSet.push(t); });
  $('#capCloud').innerHTML = capSet.map(function (t, i) {
    var sz = (i % 4 === 0) ? ' lg' : (i % 3 === 0) ? ' md' : '';
    return '<span class="cap-chip' + sz + '">' + t + '</span>';
  }).join('');

  /* 方法：标准流程 + 本地工作流 + 工具栈 + 提示词，合并到一个板块 */
  var wfSteps = [
    { num: '01', zh: '需求拆解与创意方向', en: 'BRIEF & DIRECTION',
      pts: ['对接品牌基因与核心传播诉求', '确定风格 / 时长 / 目标平台', '制定情绪板与视觉调性方案'],
      tools: ['ChatGPT', '品牌 Brief'] },
    { num: '02', zh: '脚本策划与分镜设计', en: 'SCRIPT & STORYBOARD',
      pts: ['撰写结构化文案与口播 / 旁白脚本', '输出逐镜分镜表与镜头语言规划', '用专属 Skills 提效'],
      tools: ['ChatGPT', 'Midjourney'] },
    { num: '03', zh: 'AI 视频生成与提示词工程', en: 'AI VIDEO GENERATION',
      pts: ['针对 Seedance / Wan 优化提示词参数', '匹配音乐节奏与转场节点', '批量生成并筛选最优片段'],
      tools: ['Seedance 2.0', 'Wan 2.7'] },
    { num: '04', zh: '后期精修与剪辑合成', en: 'POST & EDIT',
      pts: ['画面裁切、调速与色彩统一校正', '字幕 / 音效 / BGM 多轨混音', '转场特效与品牌水印植入'],
      tools: ['剪映', 'Photoshop', 'Magnific'] },
    { num: '05', zh: '成片交付与数据复盘', en: 'DELIVERY & REVIEW',
      pts: ['按平台规格导出（抖音 / 快手 / 小红书）', '客户反馈迭代至定稿', '投放后数据追踪与效果复盘'],
      tools: ['剪映'] }
  ];

  var wfStepsHtml = '<div class="block reveal"><div class="block-head"><h3>标准流程</h3><span class="block-count">5 步</span></div>' +
    '<div class="wf-steps">' + wfSteps.map(function (s) {
      return '<div class="wf-step reveal"><div class="wf-num">' + s.num + '</div>' +
        '<div class="wf-head"><h3>' + s.zh + '</h3><span class="wf-en">' + s.en + '</span></div>' +
        '<ul class="wf-pts">' + s.pts.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
        '<div class="wf-tools">' + s.tools.map(function (t) { return '<span class="wf-tool">' + t + '</span>'; }).join('') + '</div></div>';
    }).join('') + '</div></div>';

  /* 本地工作流（ComfyUI） */
  var cf = D.comfy;
  var comfyHtml = '';
  if (cf) {
    var cs = cf.case;
    var caseHtml = cs ? (
      '<div class="cf-case reveal"><div class="cf-case-head"><h4>' + cs.title + '</h4><span class="cf-en">' + cs.en + '</span></div>' +
      '<div class="cf-ba">' +
      '<figure><div class="cf-shot"><img loading="lazy" decoding="async" src="' + cs.before.src + '" alt="' + cs.before.label + '" onerror="this.style.opacity=0"></div><figcaption>' + cs.before.label + '</figcaption></figure>' +
      '<span class="cf-arrow">&rarr;</span>' +
      '<figure><div class="cf-shot"><img loading="lazy" decoding="async" src="' + cs.after.src + '" alt="' + cs.after.label + '" onerror="this.style.opacity=0"></div><figcaption>' + cs.after.label + '</figcaption></figure>' +
      '</div><p class="cf-case-desc">' + cs.desc + '</p></div>'
    ) : '';

    var showcaseHtml = '';
    if (cf.showcase) {
      var sc = cf.showcase;
      showcaseHtml = '<div class="block reveal" style="margin-top: 48px;"><div class="block-head"><h3>' + sc.title + '</h3><span class="block-count">' + sc.en + '</span></div>' +
        '<div class="video-grid">' + window.CaseApp.videoItemHTML(sc, false) + '</div>' +
        '<p class="block-label">' + sc.desc + '</p></div>';
    }

    comfyHtml = '<div class="block reveal" style="margin-top: 48px;"><div class="block-head"><h3>' + cf.title + '</h3><span class="block-count">' + cf.en + '</span></div>' +
      '<p class="cf-lede">' + cf.lede + '</p>' +
      '<div class="cf-grid">' + cf.items.map(function (it) {
        return '<figure class="cf-card reveal">' +
          '<div class="cf-shot"><img loading="lazy" decoding="async" src="' + it.src + '" alt="' + it.name + '" onerror="this.style.opacity=0"></div>' +
          '<figcaption><div class="cf-name"><span class="cf-i-num">' + it.num + '</span>' + it.name + '<em>' + it.en + '</em></div>' +
          '<p class="cf-desc">' + it.desc + '</p>' +
          '<div class="cf-tags">' + it.tags.map(function (t) { return '<span>' + t + '</span>'; }).join('') + '</div>' +
          (it.shots ? '<div class="cf-shots">' + it.shots.map(function (s) { return '<img loading="lazy" decoding="async" src="' + s + '" alt="' + it.name + ' 工作流截图" onerror="this.style.opacity=0">'; }).join('') + '</div>' : '') +
          '</figcaption></figure>';
      }).join('') + '</div>' + caseHtml + '</div>' + showcaseHtml;
  }

  /* 工具栈 + 提示词 */
  var md = D.method;
  var versionsHtml = '<div class="block reveal" style="margin-top: 48px;"><div class="block-head"><h3>同一支 TVC · 四版提示词</h3><span class="block-count">跨模型适配</span></div>' +
    '<div class="ver-table">' + md.versions.map(function (v) {
      return '<div class="ver-row"><span class="ver-v">' + v.version + '</span>' +
        '<span class="ver-p">' + v.platform + '</span>' +
        '<span class="ver-s">' + v.structure + '</span>' +
        '<span class="ver-d">' + v.duration + '</span></div>';
    }).join('') + '</div></div>';

  var toolsHtml = '<div class="block reveal" style="margin-top: 48px;"><div class="block-head"><h3>工具栈</h3></div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;">' + md.tools.map(function (g) {
      return '<div class="tool-group"><span class="tool-k">' + g.title + '</span>' +
        '<div class="tag-row">' + g.items.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div></div>';
    }).join('') + '</div></div>';

  var promptHtml = '<div class="block reveal" style="margin-top: 48px;"><div class="block-head"><h3>提示词写法对照</h3><span class="block-count">A 版 vs D 版</span></div>' +
    '<div class="prompt-grid"><pre class="prompt">' + esc(md.promptA) + '</pre>' +
    '<pre class="prompt">' + esc(md.promptD) + '</pre></div></div>';

  $('#methodBox').innerHTML = wfStepsHtml + comfyHtml + toolsHtml + versionsHtml + promptHtml;

  /* 联系 + 音乐 */
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

  /* 音乐：移到联系区，作为个人标签弱化展示 */
  var m = META.music;
  var mvHtml = '';
  if (m.mv && m.mv.embed) {
    var mvInner = (m.mv.type === 'file')
      ? '<video class="mv-video" controls preload="metadata" playsinline poster="' + (m.mv.poster || '') + '" src="' + m.mv.embed + '"></video>'
      : '<iframe src="' + m.mv.embed + '" scrolling="no" border="0" frameborder="no" framespacing="0" allow="fullscreen; autoplay; picture-in-picture; encrypted-media" loading="lazy"></iframe>';
    mvHtml =
      '<div class="mv-embed reveal">' +
        '<div class="mv-head"><span class="mv-tag">官方 MV</span><h4>' + (m.mv.caption || ('《' + m.title + '》MV')) + '</h4></div>' +
        '<div class="mv-frame" style="background-image:url(' + (m.mv.poster || '') + ')">' + mvInner + '</div>' +
      '</div>';
  }
  $('#musicCard').innerHTML =
    '<div class="music-inner">' +
    '<div class="music-info"><span class="music-tag">个人音乐 · 网易云音乐</span>' +
    '<h3>《' + m.title + '》</h3>' +
    '<p>' + (m.desc || '') + '</p>' +
    '<div class="music-actions">' +
    '<button class="music-play" id="musicPlay" type="button" aria-pressed="false">▶ 播放背景音乐</button>' +
    '<a class="music-link" href="' + m.link + '" target="_blank" rel="noopener">在网易云打开 ↗</a>' +
    '</div>' +
    '<p class="music-note">开启后在全站持续播放，切换页面不中断，可用右下角开关随时关闭。</p>' +
    '</div>' +
    '<div class="music-player"><iframe frameborder="0" src="' + m.embed + '" width="100%" height="86" loading="lazy"></iframe></div>' +
    '</div>' + mvHtml;

  window.CaseApp.bindAll();

  /* 原创音乐板块的播放按钮：复用全站背景音乐同一音源与状态 */
  (function () {
    var mp = document.getElementById('musicPlay');
    if (!mp || !window.CaseApp.bgm) return;
    var bgm = window.CaseApp.bgm;
    function sync(e) {
      var ready = bgm.isReady();
      var on = e && e.detail ? e.detail.playing : bgm.isPlaying();
      var intend = e && e.detail ? e.detail.intend : bgm.isIntend();
      mp.style.display = ready ? '' : 'none';
      var active = on || (intend && ready);
      mp.classList.toggle('on', !!active);
      mp.setAttribute('aria-pressed', active ? 'true' : 'false');
      mp.textContent = active ? '⏸ 暂停背景音乐' : '▶ 播放背景音乐';
    }
    mp.addEventListener('click', function () {
      if (!bgm.isReady()) {
        var pl = document.querySelector('.music-player');
        if (pl && pl.scrollIntoView) pl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      bgm.toggle();
    });
    document.addEventListener('bgmchange', sync);
    sync();
    setTimeout(sync, 1500);
  })();
})();
