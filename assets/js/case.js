/* ============================================================
   子页面渲染：根据 ?id= 渲染对应案例的完整详情。
   ============================================================ */
(function () {
  'use strict';
  var D = window.PORTFOLIO_DATA;
  var mount = document.getElementById('caseMount');
  if (!D) { mount.innerHTML = '<div class="empty-note">数据未加载。</div>'; return; }

  var id = new URLSearchParams(location.search).get('id');
  var c = null;
  for (var i = 0; i < D.cases.length; i++) {
    if (D.cases[i].id === id) { c = D.cases[i]; break; }
  }
  if (!c) {
    mount.innerHTML = '<div class="empty-note">未找到该项目。<a href="index.html">← 返回作品集</a></div>';
    return;
  }

  var res = (c.type === 'ip')
    ? window.CaseApp.renderIPCase(c)
    : window.CaseApp.renderStandardCase(c);

  var toc = '<nav class="case-toc" aria-label="本合集目录">' +
    '<span class="ctoc-k">本合集 · INDEX</span>' +
    res.toc.map(function (t) {
      return '<a href="#' + t.id + '" data-toc="' + t.id + '">' +
        '<b class="ct-num">' + t.num + '</b>' +
        '<span class="ct-zh">' + t.label + '</span>' +
        (t.en ? '<span class="ct-en">' + t.en + '</span>' : '') + '</a>';
    }).join('') +
    '</nav>';

  mount.innerHTML = '<a class="back-link" href="index.html">← 返回作品集</a>' + toc + res.html;
  document.title = c.title + ' · 孙国华作品集';
  window.CaseApp.bindAll();
  initCaseTOC();

  function initCaseTOC() {
    var links = Array.prototype.slice.call(mount.querySelectorAll('.case-toc a[data-toc]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('data-toc')] = a; });
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('data-toc')); }).filter(Boolean);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          var a = map[en.target.id];
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    targets.forEach(function (t) { io.observe(t); });
  }
})();
