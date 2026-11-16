/* Kartik Rana · portfolio */
(function () {
  'use strict';

  var GITHUB_USER = 'Kartik-rana137';
  // Never listed in All projects (this site). Repos showcased above are skipped automatically via data-repo.
  var HIDE = ['portfolio'];

  var root = document.documentElement;

  /* ---------- Year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Theme toggle ---------- */
  var toggle = document.getElementById('theme-toggle');
  function currentTheme() {
    var set = root.getAttribute('data-theme');
    return set === 'dark' ? 'dark' : 'light'; // light unless the visitor picked dark
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

  /* ---------- All projects (scales to hundreds of repos) ----------
     Data comes from data/repos.json, a snapshot the deploy workflow builds daily from the GitHub API.
     If it is missing (e.g. local preview), fall back to the live API, paging through every repo. */
  var grid = document.getElementById('repo-grid');
  // cards added per "Show more" (fewer on phones to keep the page short and light)
  var PAGE = window.matchMedia && window.matchMedia('(max-width: 640px)').matches ? 6 : 12;
  var LANG_COLORS = {
    TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5', Java: '#b07219',
    HTML: '#e34c26', CSS: '#663399', Shell: '#89e051', 'C++': '#f34b7d', C: '#555555',
    'C#': '#178600', Go: '#00ADD8', Rust: '#dea584', Kotlin: '#A97BFF', Swift: '#F05138',
    Dart: '#00B4AB', 'Jupyter Notebook': '#DA5B0B', Vue: '#41b883', Svelte: '#ff3e00',
    PHP: '#4F5D95', Ruby: '#701516', Lua: '#000080', GDScript: '#355570', 'Objective-C': '#438eff'
  };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
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

  // Normalise a live-API repo into the snapshot's shape
  function fromApi(r) {
    var topics = r.topics || [];
    return {
      name: r.name, description: r.description || '', url: r.html_url, homepage: r.homepage || '',
      language: r.language || '', topics: topics.filter(function (t) { return t.indexOf('portfolio-') !== 0; }),
      featured: topics.indexOf('portfolio-featured') !== -1, hidden: topics.indexOf('portfolio-hide') !== -1,
      fork: r.fork, archived: r.archived, stars: r.stargazers_count, created: r.created_at, pushed: r.pushed_at
    };
  }
  function fetchLive(page, acc) {
    return fetch('https://api.github.com/users/' + GITHUB_USER + '/repos?type=owner&sort=pushed&per_page=100&page=' + page,
      { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (batch) {
        acc = acc.concat(batch.map(fromApi));
        return batch.length === 100 && page < 20 ? fetchLive(page + 1, acc) : acc;
      });
  }
  function loadRepos() {
    return fetch('data/repos.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { return d.repos; })
      .catch(function () {
        var KEY = 'gh-repos-v2', cached = null;
        try { cached = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) {}
        if (cached && Date.now() - cached.t < 30 * 60 * 1000) return cached.d;
        return fetchLive(1, []).then(function (list) {
          try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), d: list })); } catch (e) {}
          return list;
        });
      });
  }

  function card(r) {
    var a = el('a', 'repo' + (r.featured ? ' is-featured' : ''));
    a.href = r.url; a.target = '_blank'; a.rel = 'noopener';
    var head = el('div', 'repo-top');
    head.appendChild(el('span', 'repo-name', r.name));
    if (r.featured) head.appendChild(el('span', 'repo-badge', 'Featured'));
    else if (r.archived) head.appendChild(el('span', 'repo-badge is-muted', 'Archived'));
    a.appendChild(head);
    a.appendChild(el('p', 'repo-desc', r.description || 'No description yet.'));
    if (r.topics && r.topics.length) {
      var tl = el('div', 'repo-topics');
      r.topics.slice(0, 3).forEach(function (t) { tl.appendChild(el('span', null, t)); });
      a.appendChild(tl);
    }
    var foot = el('div', 'repo-foot');
    if (r.language) {
      var lang = el('span'), dot = el('span', 'lang-dot');
      dot.style.background = LANG_COLORS[r.language] || '#8aa0b7';
      lang.appendChild(dot); lang.appendChild(document.createTextNode(r.language));
      foot.appendChild(lang);
    }
    if (r.stars) foot.appendChild(el('span', null, '★ ' + r.stars));
    foot.appendChild(el('span', null, 'Updated ' + relTime(r.pushed)));
    a.appendChild(foot);
    return a;
  }

  if (grid && window.fetch) {
    var countEl = document.getElementById('repo-count');
    var tools = document.getElementById('repo-tools');
    var search = document.getElementById('repo-search');
    var langSel = document.getElementById('repo-lang');
    var sortSel = document.getElementById('repo-sort');
    var moreBtn = document.getElementById('repo-more');
    var emptyEl = document.getElementById('repo-empty');

    // Repos showcased in the cards above (data-repo="name" or "owner/name") are not repeated here
    var skip = HIDE.map(function (n) { return n.toLowerCase(); });
    document.querySelectorAll('[data-repo]').forEach(function (n) {
      skip.push(n.getAttribute('data-repo').split('/').pop().toLowerCase());
    });

    var all = [], view = [], shown = 0;
    var SORTS = {
      updated: function (a, b) { return new Date(b.pushed) - new Date(a.pushed); },
      newest: function (a, b) { return new Date(b.created) - new Date(a.created); },
      stars: function (a, b) { return (b.stars - a.stars) || (new Date(b.pushed) - new Date(a.pushed)); },
      name: function (a, b) { return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }); }
    };

    var more = function () {
      var frag = document.createDocumentFragment();
      view.slice(shown, shown + PAGE).forEach(function (r) { frag.appendChild(card(r)); });
      grid.appendChild(frag);
      shown = Math.min(shown + PAGE, view.length);
      moreBtn.hidden = shown >= view.length;
      moreBtn.textContent = 'Show more (' + (view.length - shown) + ' left)';
      countEl.textContent = !view.length ? 'No matching projects'
        : 'Showing ' + shown + ' of ' + view.length +
          (view.length !== all.length ? ' matching' : '') + ' project' + (view.length === 1 ? '' : 's');
    };
    var apply = function () {
      var q = search.value.trim().toLowerCase();
      var lang = langSel.value, sort = SORTS[sortSel.value] || SORTS.updated;
      view = all.filter(function (r) {
        if (lang && r.language !== lang) return false;
        if (!q) return true;
        return (r.name + ' ' + r.description + ' ' + r.topics.join(' ') + ' ' + r.language).toLowerCase().indexOf(q) !== -1;
      }).sort(function (a, b) { return (b.featured - a.featured) || sort(a, b); });
      grid.textContent = ''; shown = 0;
      more();
      emptyEl.hidden = view.length > 0;
      emptyEl.textContent = 'No projects match that search.';
      // keep the current view in the URL so it can be shared, without adding history entries
      var params = [];
      if (q) params.push('q=' + encodeURIComponent(q));
      if (lang) params.push('lang=' + encodeURIComponent(lang));
      if (sortSel.value !== 'updated') params.push('sort=' + sortSel.value);
      if (params.length || /^#projects\?/.test(location.hash)) {
        try { history.replaceState(null, '', params.length ? '#projects?' + params.join('&') : '#projects'); } catch (e) {}
      }
    };

    // restore a shared view from the URL, e.g. #projects?q=ai&lang=Python&sort=stars
    var fromUrl = function () {
      var m = location.hash.match(/^#projects\?(.*)$/);
      search.value = ''; langSel.value = ''; sortSel.value = 'updated';
      if (m) m[1].split('&').forEach(function (kv) {
        var p = kv.split('='), v = decodeURIComponent(p[1] || '');
        if (p[0] === 'q') search.value = v;
        if (p[0] === 'lang') langSel.value = v;
        if (p[0] === 'sort' && SORTS[v]) sortSel.value = v;
      });
      if (langSel.value === '' && m && /(^|&)lang=/.test(m[1])) langSel.value = '';   // unknown language: show all
      apply();
    };

    var timer;
    search.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(apply, 150); });
    langSel.addEventListener('change', apply);
    sortSel.addEventListener('change', apply);
    moreBtn.addEventListener('click', more);

    loadRepos().then(function (repos) {
      all = repos.filter(function (r) { return !r.fork && !r.hidden && skip.indexOf(r.name.toLowerCase()) === -1; });
      if (!all.length) {
        countEl.textContent = '';
        emptyEl.hidden = false;
        emptyEl.textContent = 'More projects are on the way. New public repositories appear here automatically.';
        return;
      }
      // language filter options, most used first
      var counts = {};
      all.forEach(function (r) { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
      Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || a.localeCompare(b); })
        .forEach(function (l) { var o = el('option', null, l + ' (' + counts[l] + ')'); o.value = l; langSel.appendChild(o); });
      tools.hidden = all.length < 4;   // search/filter controls appear once there is enough to browse
      fromUrl();
      // a shared link opened while already on the page (only the #hash changes)
      window.addEventListener('hashchange', function () { if (/^#projects\?/.test(location.hash)) fromUrl(); });
    }).catch(function () {
      countEl.textContent = '';
      emptyEl.hidden = false;
      emptyEl.textContent = 'Couldn’t load projects right now. See them all on GitHub.';
    });
  }
})();
