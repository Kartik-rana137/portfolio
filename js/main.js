/* Kartik Rana · portfolio */
(function () {
  'use strict';

  var GITHUB_USER = 'Kartik-rana137';
  // Repos hidden from the "More on GitHub" grid: ones featured above, and this site's own repo.
  var FEATURED = ['marsexplorer', 'portfolio'];

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme toggle ---------- */
  var toggle = document.getElementById('theme-toggle');
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function updateToggleLabel() {
    if (!toggle) return;
    toggle.setAttribute('aria-label', currentTheme() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  if (toggle) {
    updateToggleLabel();
    toggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      updateToggleLabel();
    });
  }

  /* ---------- Bubbles ---------- */
  var bubbleBox = document.getElementById('bubbles');
  if (bubbleBox && !reduceMotion) {
    var count = window.innerWidth < 640 ? 9 : 16;
    for (var i = 0; i < count; i++) {
      var b = document.createElement('span');
      var size = 14 + Math.random() * 46;
      b.className = 'bubble';
      b.style.width = b.style.height = size.toFixed(0) + 'px';
      b.style.left = (Math.random() * 100).toFixed(1) + '%';
      b.style.setProperty('--dur', (11 + Math.random() * 12).toFixed(1) + 's');
      b.style.setProperty('--delay', (-Math.random() * 20).toFixed(1) + 's');
      b.style.setProperty('--sway', ((Math.random() - 0.5) * 80).toFixed(0) + 'px');
      bubbleBox.appendChild(b);
    }
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- OrwellBlue illustration: rolling event ledger ---------- */
  var ledger = document.getElementById('ob-events');
  if (ledger && !reduceMotion) {
    var events = [
      ['agent-01', 'tool_call list_dir', 'ok', 'allow'],
      ['agent-05', 'tool_call write_file', 'ok', 'allow'],
      ['agent-03', 'net egress 10.0.0.8', 'warn', 'flag'],
      ['policy', 'rule no_shell_exec', 'ok', 'pass'],
      ['agent-02', 'exec curl | sh', 'bad', 'deny'],
      ['chain', 'sha256 3b7a…c04d', 'ok', 'verified'],
      ['agent-05', 'tool_call read_file', 'ok', 'allow']
    ];
    var n = 0, t = new Date(); t.setHours(12, 4, 15, 0);
    var tick = function () {
      t = new Date(t.getTime() + 1000 + Math.random() * 2000);
      var ev = events[n++ % events.length];
      var li = document.createElement('li');
      li.className = 'new';
      var time = document.createElement('b');
      time.textContent = t.toTimeString().slice(0, 8);
      var tag = document.createElement('i');
      tag.className = ev[2];
      tag.textContent = ev[3];
      li.appendChild(time);
      li.appendChild(document.createTextNode(' ' + ev[0] + ' ' + ev[1] + ' '));
      li.appendChild(tag);
      ledger.insertBefore(li, ledger.firstChild);
      while (ledger.children.length > 5) ledger.removeChild(ledger.lastChild);
    };
    var timer = null;
    var ledgerIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !timer) timer = setInterval(tick, 2200);
        else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
      });
    }) : null;
    if (ledgerIO) ledgerIO.observe(ledger);
  }

  /* ---------- Live repositories from GitHub ---------- */
  var grid = document.getElementById('repo-grid');
  var LANG_COLORS = {
    TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5', Java: '#b07219',
    HTML: '#e34c26', CSS: '#663399', Shell: '#89e051', 'C++': '#f34b7d', C: '#555555',
    'C#': '#178600', Go: '#00ADD8', Rust: '#dea584', Kotlin: '#A97BFF', Swift: '#F05138',
    Dart: '#00B4AB', 'Jupyter Notebook': '#DA5B0B', Vue: '#41b883', Svelte: '#ff3e00'
  };
  var CACHE_KEY = 'gh-repos-v1';
  var CACHE_MS = 30 * 60 * 1000;

  function relTime(iso) {
    var days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days < 1) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return days + ' days ago';
    var months = Math.round(days / 30);
    if (months < 12) return months + (months === 1 ? ' month ago' : ' months ago');
    var years = Math.round(days / 365);
    return years + (years === 1 ? ' year ago' : ' years ago');
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function render(repos) {
    var list = repos
      .filter(function (r) { return !r.fork && !r.archived && FEATURED.indexOf(r.name.toLowerCase()) === -1; })
      .sort(function (a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); })
      .slice(0, 6);
    if (!list.length) return; // keep the friendly empty-state message

    grid.textContent = '';
    list.forEach(function (r) {
      var a = el('a', 'repo');
      a.href = r.html_url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.appendChild(el('span', 'repo-name', r.name));
      a.appendChild(el('p', 'repo-desc', r.description || 'No description yet.'));
      var foot = el('div', 'repo-foot');
      if (r.language) {
        var lang = el('span');
        var dot = el('span', 'lang-dot');
        dot.style.background = LANG_COLORS[r.language] || '#8aa';
        lang.appendChild(dot);
        lang.appendChild(document.createTextNode(r.language));
        foot.appendChild(lang);
      }
      if (r.stargazers_count) foot.appendChild(el('span', null, '★ ' + r.stargazers_count));
      foot.appendChild(el('span', null, 'Updated ' + relTime(r.pushed_at)));
      a.appendChild(foot);
      grid.appendChild(a);
    });
  }

  if (grid && window.fetch) {
    var cached = null;
    try { cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null'); } catch (e) {}
    if (cached && Date.now() - cached.t < CACHE_MS) {
      render(cached.d);
    } else {
      fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?per_page=100&sort=pushed', {
        headers: { Accept: 'application/vnd.github+json' }
      })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) {
          var slim = data.map(function (r) {
            return {
              name: r.name, description: r.description, language: r.language, html_url: r.html_url,
              stargazers_count: r.stargazers_count, pushed_at: r.pushed_at, fork: r.fork, archived: r.archived
            };
          });
          try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), d: slim })); } catch (e) {}
          render(slim);
        })
        .catch(function () { /* offline or rate-limited: the static message stays */ });
    }
  }
})();
