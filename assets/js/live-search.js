// Loaded separately with a content fingerprint so live search updates immediately.
(() => {
function animateSearchPlaceholder(input) {
  const words = ['OMD', 'SNClient', 'check_nwc_health', 'Search ...'];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let word = 0, length = 0, deleting = false, timer;

  function tick() {
    length += deleting ? -1 : 1;
    input.placeholder = words[word].slice(0, length);
    let delay = deleting ? 65 : 130;
    if (length === words[word].length) {
      if (word === words.length - 1) {
        word = words.length;
        return;
      }
      deleting = true;
      delay = 1200;
    } else if (length === 0) {
      deleting = false;
      word += 1;
      delay = 400;
    }
    timer = setTimeout(tick, delay);
  }

  function update() {
    clearTimeout(timer);
    if (reducedMotion.matches || word === words.length) {
      word = words.length;
      input.placeholder = 'Search ...';
    } else if (document.activeElement === input || input.value) {
      input.placeholder = '';
    } else {
      input.placeholder = words[word].slice(0, length);
      if (!document.hidden) timer = setTimeout(tick, 400);
    }
  }

  // Only the placeholder changes; example names never become actual queries.
  input.addEventListener('focus', update);
  input.addEventListener('blur', update);
  input.addEventListener('input', update);
  reducedMotion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  update();
}

function initializeLiveSearch() {
  const searchToggle = document.querySelector('.monitoring-navbar__search-toggle');
  const headerSearch = document.getElementById('header-search');
  if (searchToggle && headerSearch) {
    const headerInput = headerSearch.querySelector('input');
    function closeHeaderSearch(restoreFocus = false) {
      headerSearch.classList.remove('is-open');
      searchToggle.setAttribute('aria-expanded', 'false');
      searchToggle.setAttribute('aria-label', 'Open search');
      if (headerInput) headerInput.dispatchEvent(new Event('search:close'));
      if (restoreFocus) searchToggle.focus();
    }
    searchToggle.addEventListener('click', () => {
      if (headerSearch.classList.contains('is-open')) return closeHeaderSearch(true);
      headerSearch.classList.add('is-open');
      searchToggle.setAttribute('aria-expanded', 'true');
      searchToggle.setAttribute('aria-label', 'Close search');
      if (headerInput) headerInput.focus();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && headerSearch.classList.contains('is-open')) closeHeaderSearch(true);
    });
    document.addEventListener('pointerdown', event => {
      if (!headerSearch.contains(event.target) && !searchToggle.contains(event.target) &&
          !event.target.closest('.monitoring-search-results')) closeHeaderSearch();
    });
    window.matchMedia('(min-width: 992px)').addEventListener('change', () => closeHeaderSearch());
  }
  const inputs = [...document.querySelectorAll('.td-search--offline input')];
  if (!inputs.length) return;
  // Retire change-only handlers if a browser still has an older Docsy bundle.
  if (window.jQuery) window.jQuery(inputs).off('change');
  const indexPromises = new Map();
  const details = new Map();
  const searchable = new Map();
  const words = text => String(text || '').toLowerCase().match(/[\p{L}\p{N}]+(?:\.[\p{L}\p{N}]+)*/gu) || [];
  function loadIndex(input) {
    const url = input.dataset.offlineSearchIndexJsonSrc;
    if (!indexPromises.has(url)) {
      const promise = fetch(url)
        .then(response => {
          if (!response.ok) throw new Error('Search index unavailable');
          return response.json();
        }).then(documents => lunr(function () {
          this.ref('ref');
          this.field('title', { boost: 5 });
          this.field('tags', { boost: 3 });
          this.field('description', { boost: 2 });
          this.field('body');
          documents.forEach(doc => {
            this.add(doc);
            details.set(doc.ref, doc);
            searchable.set(doc.ref, {
              title: ' ' + words(doc.title).join(' ') + ' ',
              body: ' ' + words(doc.body).join(' ') + ' ',
              titleTerms: new Set(words(doc.title)),
              terms: new Set(words([doc.title, doc.tags, doc.description, doc.body].flat().join(' ')))
            });
          });
        })).catch(error => { indexPromises.delete(url); throw error; });
      indexPromises.set(url, promise);
    }
    return indexPromises.get(url);
  }
  function matchesTerm(tokens, term) {
    if (tokens.has(term)) return true;
    const numeric = /^\d+(?:\.\d+)*$/.test(term);
    for (const token of tokens) {
      if (!token.startsWith(term)) continue;
      // A major version matches 5.x, but not 50.x or the minor part of 2.5.
      if (!numeric || (/^\d+(?:\.\d+)*$/.test(token) && (term.includes('.') || token[term.length] === '.'))) return true;
    }
    return false;
  }
  function queryMatches(index, query, scope) {
    const queryWords = words(query);
    const terms = [...new Set(queryWords)];
    const phrase = ' ' + queryWords.join(' ') + ' ';
    // Punctuation is normalized to spaces. A version prefix must end at a
    // component boundary: Grafana 12 matches Grafana: 12.4.3, but not 120.4.
    const contentPattern = queryWords.length ? new RegExp('(?:^| )' + queryWords.map(term => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return /^\d+(?:\.\d+)*$/.test(term) ? escaped + '(?:\\.\\d+)*' : escaped;
    }).join(' ') + '(?= |$)') : null;
    // Require every query word in the title, allowing prefixes such as 5 -> 5.70.
    const titlePattern = terms.length ? new RegExp(terms.map(term => {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const boundary = /^\d+$/.test(term) ? '(?=\\.| |$)' : '';
      return '(?=.*(?:^| )' + escaped + boundary + ')';
    }).join('')) : null;
    return index.query(q => {
      lunr.tokenizer(query.toLowerCase()).forEach(token => {
        const term = token.toString();
        q.term(term, { boost: 100 });
        q.term(term, { wildcard: lunr.Query.wildcard.TRAILING, boost: 10 });
        if (term.length >= 3) q.term(term, { wildcard: lunr.Query.wildcard.LEADING | lunr.Query.wildcard.TRAILING });
      });
    }).filter(match => scope === 'all' || (details.get(match.ref).section || match.ref.replace(/^\//, '').split('/')[0]) === scope).map(match => {
      const doc = searchable.get(match.ref);
      const coverage = terms.filter(term => matchesTerm(doc.terms, term)).length;
      const titleCoverage = terms.filter(term => matchesTerm(doc.titleTerms, term)).length;
      // Full title matches precede adjacent phrases found only in content.
      const relevance = terms.length && doc.title === phrase ? 0
        : terms.length && doc.title.includes(phrase) ? 1
        : titlePattern?.test(doc.title) ? 2
        : contentPattern?.test(doc.body) ? 3
        : titleCoverage ? 4
        : terms.length && coverage === terms.length ? 5 : 6;
      return { ...match, relevance, coverage, titleCoverage, bestMatch: relevance < 4 };
    }).sort(compareRelevance);
  }
  function compareRelevance(a, b) {
    return a.relevance - b.relevance || b.titleCoverage - a.titleCoverage || b.coverage - a.coverage || b.score - a.score;
  }
  function sortMatches(matches, order) {
    // Keep best matches first. Other matches form one chronological group,
    // rather than several invisible relevance tiers with separate date orders.
    return matches.sort((a, b) => {
      const aBest = a.bestMatch, bBest = b.bestMatch;
      if (aBest !== bBest) return aBest ? -1 : 1;
      if (aBest) {
        const relevance = a.relevance - b.relevance || b.titleCoverage - a.titleCoverage || b.coverage - a.coverage;
        if (relevance) return relevance;
      }
      const aDate = Date.parse(details.get(a.ref).date), bDate = Date.parse(details.get(b.ref).date);
      if (!Number.isFinite(aDate)) return Number.isFinite(bDate) ? 1 : compareRelevance(a, b);
      if (!Number.isFinite(bDate)) return -1;
      return (order === 'asc' ? aDate - bDate : bDate - aDate) || compareRelevance(a, b);
    });
  }
  let groupNumber = 0;
  function createSortDropdown(container, onChange) {
    const dropdown = document.createElement('div');
    dropdown.className = 'monitoring-sort-dropdown';
    dropdown.innerHTML = '<button type="button" class="monitoring-sort-dropdown__toggle" aria-haspopup="menu" aria-expanded="false">Newest first</button><div class="monitoring-sort-dropdown__menu" role="menu" aria-label="Sort by date within relevance levels" hidden><button type="button" role="menuitemradio" aria-checked="true" data-order="desc">Newest first</button><button type="button" role="menuitemradio" aria-checked="false" data-order="asc">Oldest first</button></div>';
    container.append(dropdown);
    const toggle = dropdown.querySelector('.monitoring-sort-dropdown__toggle');
    const menu = dropdown.querySelector('[role="menu"]');
    const options = [...menu.querySelectorAll('button')];
    let value = 'desc';
    function close() {
      menu.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
    function open() {
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
    }
    toggle.addEventListener('click', () => { if (menu.hidden) open(); else close(); });
    options.forEach(option => option.addEventListener('click', () => {
      value = option.dataset.order;
      toggle.textContent = option.textContent;
      options.forEach(item => item.setAttribute('aria-checked', String(item === option)));
      close();
      toggle.focus({ preventScroll: true });
      onChange();
    }));
    dropdown.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) {
        event.preventDefault();
        event.stopPropagation();
        close();
        toggle.focus({ preventScroll: true });
      } else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        event.stopPropagation();
        open();
        const current = options.indexOf(document.activeElement);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
          : current < 0 ? (event.key === 'ArrowDown' ? 0 : options.length - 1)
          : (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
        options[next].focus();
      }
    });
    document.addEventListener('pointerdown', event => { if (!dropdown.contains(event.target)) close(); });
    document.addEventListener('focusin', event => { if (!dropdown.contains(event.target)) close(); });
    return { get value() { return value; }, close };
  }
  function appendGroupedResult(container, match, item, inline = false) {
    const key = match.bestMatch ? 'best' : 'other';
    let group = container.querySelector('[data-match-group="' + key + '"]');
    if (!group) {
      group = document.createElement(inline ? 'section' : 'div');
      group.dataset.matchGroup = key;
      group.className = 'monitoring-search-results__group';
      const heading = document.createElement('h3');
      heading.className = 'monitoring-search-results__group-title';
      heading.id = 'search-match-group-' + groupNumber++;
      heading.textContent = key === 'best' ? 'Best matches' : 'Other matches';
      group.setAttribute('aria-labelledby', heading.id);
      if (!inline) group.setAttribute('role', 'group');
      const items = document.createElement(inline ? 'ul' : 'div');
      items.className = inline ? 'td-blog-posts-list' : 'monitoring-search-results__group-items';
      group.append(heading, items);
      container.append(group);
    }
    group.lastElementChild.append(item);
  }
  function initializeBlogSearch(input) {
    const root = input.closest('main');
    const resultsSection = root.querySelector('.monitoring-blog-search-results');
    if (!resultsSection) return;
    const originalSections = [...root.querySelectorAll('.td-blog-posts, .td-blog-posts__pagination')];
    const status = resultsSection.querySelector('[role="status"]');
    const list = resultsSection.querySelector('.monitoring-blog-search-results__groups');
    const sort = createSortDropdown(resultsSection.querySelector('.monitoring-blog-search-results__sort'), () => { clearTimeout(timer); search(); });
    const moreControl = resultsSection.querySelector('.monitoring-search-results__more');
    const moreButton = moreControl.querySelector('button');
    const batchSize = Number(input.dataset.offlineSearchMaxResults) || 10;
    let matches = [], shown = 0, sequence = 0, timer;
    input.setAttribute('aria-controls', resultsSection.id);
    function node(tag, className, text) {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text) element.textContent = text;
      return element;
    }
    function card(match) {
      const doc = details.get(match.ref);
      const item = node('li', 'td-blog-posts-list__item');
      if (Number.isFinite(Date.parse(doc.date))) {
        const date = new Date(doc.date);
        const timeline = node('time', 'monitoring-blog-timeline-date', date.toLocaleDateString('en', { month: 'short', day: 'numeric' }));
        timeline.dateTime = doc.date;
        timeline.append(node('span', '', String(date.getFullYear())));
        item.append(timeline);
      }
      const body = node('div', 'td-blog-posts-list__body');
      const heading = node('h5', 'mt-0 mb-1');
      const title = node('a', '', doc.title);
      title.href = input.dataset.offlineSearchBaseHref + match.ref.replace(/^\//, '');
      heading.append(title);
      body.append(heading);
      if (Number.isFinite(Date.parse(doc.date))) {
        const meta = node('p', 'mb-2 mb-md-3');
        const small = node('small', 'text-body-secondary');
        const time = node('time', '', new Date(doc.date).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' }));
        time.dateTime = doc.date;
        small.append(time);
        meta.append(small);
        body.append(meta);
      }
      if (doc.tagLinks?.length) {
        const header = node('header', 'article-meta');
        const taxonomy = node('div', 'taxonomy taxonomy-terms-article taxo-tags');
        taxonomy.append(node('h5', 'taxonomy-title', 'Tags:'));
        const tags = node('ul', 'taxonomy-terms');
        doc.tagLinks.forEach(tag => {
          const li = node('li');
          const a = node('a', 'taxonomy-term');
          a.href = tag.ref;
          a.append(node('span', 'taxonomy-label', tag.title));
          li.append(a);
          tags.append(li);
        });
        taxonomy.append(tags);
        header.append(taxonomy);
        body.append(header);
      }
      body.append(node('p', 'pt-0 mt-0', doc.summary || doc.excerpt));
      const readMore = node('p', 'pt-0');
      const link = node('a', '', 'Read more');
      link.href = title.href;
      link.setAttribute('aria-label', 'Read more - ' + doc.title);
      readMore.append(link);
      body.append(readMore);
      item.append(body);
      return item;
    }
    function renderMore() {
      const end = Math.min(shown + batchSize, matches.length);
      matches.slice(shown, end).forEach(match => appendGroupedResult(list, match, card(match), true));
      shown = end;
      status.textContent = matches.length ? 'Showing ' + shown + ' of ' + matches.length + ' matching articles' : (input.dataset.blogSearchArchive === 'true' ? 'No archived articles found for “' : 'No news found for “') + input.value.trim() + '”.';
      moreControl.hidden = shown >= matches.length;
      moreButton.textContent = 'Load more (' + Math.min(batchSize, matches.length - shown) + ')';
    }
    async function search() {
      const query = input.value.trim(), request = ++sequence;
      const active = Boolean(query);
      originalSections.forEach(section => { section.hidden = active; });
      resultsSection.hidden = !active;
      list.replaceChildren();
      moreControl.hidden = true;
      matches = [];
      shown = 0;
      if (!active) return;
      status.textContent = 'Searching…';
      try {
        const index = await loadIndex(input);
        if (request !== sequence) return;
        matches = sortMatches(queryMatches(index, query, 'blog').filter(match => {
          const doc = details.get(match.ref);
          return doc.kind === 'page' && Boolean(doc.archived) === (input.dataset.blogSearchArchive === 'true')
            && doc.blogSection?.startsWith(input.dataset.blogSearchSection);
        }), sort.value);
        renderMore();
      } catch (_) {
        if (request === sequence) status.textContent = 'Search could not load. Try typing again.';
      }
    }
    input.addEventListener('input', () => {
      ++sequence;
      clearTimeout(timer);
      moreControl.hidden = true;
      if (!input.value.trim()) search();
      else timer = setTimeout(search, 80);
    });
    input.closest('form').addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); search(); });
    moreButton.addEventListener('click', () => {
      const next = shown;
      renderMore();
      list.querySelectorAll('h5 a')[next]?.focus({ preventScroll: true });
    });
  }
  // Start loading immediately, including when the first query arrives before ready.
  const defaultInput = inputs.find(input => input.dataset.blogSearchArchive !== 'true');
  if (defaultInput) loadIndex(defaultInput).catch(() => {});
  inputs.forEach((input, number) => {
    if (input.dataset.liveSearchReady) return;
    input.dataset.liveSearchReady = 'true';
    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'td-search__clear';
    clearButton.title = 'Clear search';
    clearButton.setAttribute('aria-label', 'Clear search');
    clearButton.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
    input.after(clearButton);
    const updateClearButton = () => { clearButton.hidden = !input.value; };
    updateClearButton();
    input.addEventListener('input', updateClearButton);
    clearButton.addEventListener('click', () => {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.focus();
    });
    if (input.dataset.searchMode === 'inline') { initializeBlogSearch(input); return; }
    animateSearchPlaceholder(input);
    const panel = document.createElement('section');
    panel.className = 'monitoring-search-results';
    panel.hidden = true;
    panel.innerHTML = '<div class="monitoring-search-results__header"><span role="status" aria-live="polite"></span><button type="button" aria-label="Close search results">×</button></div><div class="monitoring-search-results__filters" role="group" aria-label="Search in"><button type="button" data-search-scope="all" aria-pressed="true">All</button><button type="button" data-search-scope="docs" aria-pressed="false">Documentation</button><button type="button" data-search-scope="blog" aria-pressed="false">News</button></div><div class="monitoring-search-results__list" role="listbox" aria-label="Search results"></div>';
    document.body.append(panel);
    const sortControl = document.createElement('div');
    sortControl.className = 'monitoring-search-results__sort';
    sortControl.innerHTML = '<span>Sort within matches</span>';
    panel.querySelector('.monitoring-search-results__filters').after(sortControl);
    const sortSelect = createSortDropdown(sortControl, () => { clearTimeout(timer); search(); });
    const moreControl = document.createElement('div');
    moreControl.className = 'monitoring-search-results__more';
    moreControl.hidden = true;
    moreControl.innerHTML = '<button type="button">Load more</button>';
    panel.append(moreControl);
    const moreButton = moreControl.querySelector('button');
    const batchSize = Math.max(1, Math.floor(Number(input.dataset.offlineSearchMaxResults) || 10));
    let results = [], shown = 0;
    const status = panel.querySelector('[role="status"]');
    const list = panel.querySelector('[role="listbox"]');
    list.id = 'monitoring-search-results-' + number;
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', list.id);
    input.setAttribute('aria-expanded', 'false');
    const filters = [...panel.querySelectorAll('[data-search-scope]')];
    let scope = 'all';
    let sequence = 0, timer, selected = -1;
    function close() {
      sortSelect.close();
      ++sequence;
      clearTimeout(timer);
      panel.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
    }
    function position() {
      if (panel.hidden) return;
      const rect = input.getBoundingClientRect();
      if (!rect.width || rect.bottom < 0 || rect.top > innerHeight) return close();
      const width = Math.min(560, innerWidth - 24);
      panel.style.width = width + 'px';
      panel.style.left = Math.max(12, Math.min(rect.left, innerWidth - width - 12)) + 'px';
      panel.style.top = rect.bottom + 8 + 'px';
      panel.style.maxHeight = Math.max(80, innerHeight - rect.bottom - 20) + 'px';
    }
    function show() {
      inputs.forEach(other => { if (other !== input) other.dispatchEvent(new Event('search:close')); });
      panel.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      position();
    }
    function resetResults() {
      results = [];
      shown = 0;
      selected = -1;
      input.removeAttribute('aria-activedescendant');
      list.replaceChildren();
      list.scrollTop = 0;
      moreControl.hidden = true;
    }
    function renderMore() {
      const end = Math.min(shown + batchSize, results.length);
      results.slice(shown, end).forEach((match, offset) => {
        const i = shown + offset;
        const doc = details.get(match.ref), link = document.createElement('a');
        link.className = 'monitoring-search-results__item';
        link.id = list.id + '-' + i;
        link.setAttribute('role', 'option');
        link.setAttribute('aria-selected', 'false');
        link.href = input.dataset.offlineSearchBaseHref + match.ref.replace(/^\//, '');
        const title = document.createElement('strong'), badge = document.createElement('small'), excerpt = document.createElement('span');
        const section = doc.section || match.ref.replace(/^\//, '').split('/')[0];
        title.textContent = doc.title;
        badge.className = 'monitoring-search-results__badge';
        badge.textContent = { docs: 'Documentation', blog: 'Blog', tags: 'Tags', repo: 'Repository' }[section] || 'Page';
        excerpt.textContent = doc.excerpt;
        link.append(badge, title, excerpt);
        if (section === 'blog' && Number.isFinite(Date.parse(doc.date))) {
          const date = document.createElement('time');
          date.dateTime = doc.date;
          date.textContent = new Date(doc.date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' });
          link.append(date);
        }
        appendGroupedResult(list, match, link);
      });
      shown = end;
      const scopeLabel = scope === 'docs' ? 'Documentation' : scope === 'blog' ? 'News' : 'Search';
      status.textContent = scopeLabel + ' results · ' + shown + ' of ' + results.length;
      moreControl.hidden = shown >= results.length;
      moreButton.textContent = 'Load more (' + Math.min(batchSize, results.length - shown) + ')';
      position();
    }
    moreButton.addEventListener('click', () => {
      const next = shown;
      renderMore();
      // Continue from the first new result, including when the final batch hides the button.
      const nextLink = list.querySelectorAll('[role="option"]')[next];
      nextLink?.focus({ preventScroll: true });
      nextLink?.scrollIntoView({ block: 'nearest' });
    });
    async function search() {
      const query = input.value.trim(), request = ++sequence;
      resetResults();
      if (!query) return close();
      status.textContent = 'Searching…';
      show();
      try {
        const index = await loadIndex(input);
        if (request !== sequence) return;
        const matches = queryMatches(index, query, scope);
        if (scope !== 'docs') sortMatches(matches, sortSelect.value);
        const scopeLabel = scope === 'docs' ? 'Documentation' : scope === 'blog' ? 'News' : 'Search';
        status.textContent = matches.length ? scopeLabel + ' results' : 'No ' + (scope === 'all' ? '' : scopeLabel.toLowerCase() + ' ') + 'results for “' + query + '”';
        results = matches;
        if (results.length) renderMore();
        position();
      } catch (_) {
        if (request === sequence) status.textContent = 'Search could not load. Try typing again.';
      }
    }
    input.addEventListener('input', () => {
      ++sequence; // Invalidate any pending query before the next debounce finishes.
      clearTimeout(timer);
      if (!input.value.trim()) return close();
      resetResults();
      status.textContent = 'Searching…';
      show();
      timer = setTimeout(search, 80);
    });
    input.addEventListener('focus', () => { if (input.value.trim() && panel.hidden) search(); });
    input.addEventListener('search:close', close);
    filters.forEach(button => {
      button.addEventListener('click', () => {
        scope = button.dataset.searchScope;
        sortControl.hidden = scope === 'docs';
        filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
        clearTimeout(timer);
        search();
      });
    });
    input.closest('form')?.addEventListener('submit', event => event.preventDefault());
    function keyboard(event) {
      if (event.key === 'Escape') { input.focus(); close(); return; }
      if (event.target.closest('button, select')) return;
      const links = [...list.querySelectorAll('a')];
      if (panel.hidden || !links.length) return;
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const focused = links.indexOf(event.target);
        if (focused >= 0) selected = focused;
        selected = selected < 0
          ? (event.key === 'ArrowDown' ? 0 : links.length - 1)
          : (selected + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
        links.forEach((link, i) => link.setAttribute('aria-selected', String(i === selected)));
        input.setAttribute('aria-activedescendant', links[selected].id);
        if (event.target !== input) links[selected].focus({ preventScroll: true });
        links[selected].scrollIntoView({ block: 'nearest' });
      } else if (event.key === 'Enter' && event.target === input) {
        event.preventDefault();
        links[Math.max(0, selected)].click();
      }
    }
    input.addEventListener('keydown', keyboard);
    panel.addEventListener('keydown', keyboard);
    panel.querySelector('[aria-label="Close search results"]').addEventListener('click', () => { input.focus(); close(); });
    document.addEventListener('pointerdown', event => {
      if (event.target !== input && !panel.contains(event.target)) close();
    });
    document.addEventListener('focusin', event => {
      if (event.target !== input && !panel.contains(event.target)) close();
    });
    window.addEventListener('resize', position);
    document.addEventListener('scroll', event => {
      if (!panel.contains(event.target)) position();
    }, true);
  });

}
// Run after Docsy's ready callbacks so an older bundle cannot restore its handler.
if (window.jQuery) window.jQuery(initializeLiveSearch);
else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeLiveSearch);
else initializeLiveSearch();
})();
