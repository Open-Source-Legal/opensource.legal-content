const subjects = {
  'contracts-documents': {
    title: 'Contracts & documents',
    description: 'Test contract redlines, document conversion and fidelity to the original Word file.',
  },
  'legal-reasoning': {
    title: 'Legal AI & reasoning',
    description: 'Evaluate how models reason through legal questions and how agents complete legal assignments.',
  },
  'research-collections': {
    title: 'Research collections',
    description: 'Browse published studies and follow individual results back to their methods.',
  },
  'other': {
    title: 'Other benchmarks',
    description: '',
  },
};

export function benchmarkSubject(key = 'other') {
  if (typeof key !== 'string' || !Object.hasOwn(subjects, key)) {
    throw new Error('Unknown benchmark subject. Choose one of ' + Object.keys(subjects).join(', '));
  }
  return subjects[key];
}

export function benchmarkIndex(posts, contribute, escape) {
  const contents = [];
  const sections = [];
  for (const [id, subject] of Object.entries(subjects)) {
    const entries = posts.filter(post => post.subject === subject);
    if (!entries.length) continue;
    contents.push(`<li><a href="#${id}"><span>${escape(subject.title)}</span><span class="bench-total">${entries.length}</span></a></li>`);
    const cards = entries.map(post => `<li class="bench-card" data-search="${escape(post.searchText)}">
      <p class="bench-publisher">${escape(post.publisher)}</p>
      <h3><a href="${post.path}">${escape(post.title)}</a></h3>
      <p class="bench-summary">${escape(post.summary)}</p>
      <p class="bench-access"><span>Materials</span> ${escape(post.access)}</p>
      <p class="bench-license"><span>License</span> ${post.licenseLinks}</p>
    </li>`).join('\n');
    sections.push(`<section class="bench-group" id="${id}" aria-labelledby="${id}-title">
      <div class="bench-heading"><h2 id="${id}-title">${escape(subject.title)}</h2>${subject.description ? '<p>' + escape(subject.description) + '</p>' : ''}</div>
      <ul class="bench-entries">${cards}</ul></section>`);
  }
  return `<div class="bench-index">
    <div class="bench-mast"><div><h1>Benchmarks</h1>
      <p>A field guide to evaluating legal tools. Explore the tasks, methods and materials behind each result.</p></div>
      ${contents.length ? `<div class="bench-contents" role="navigation" aria-label="Browse by subject"><h2>Browse by subject</h2><ul>${contents.join('')}</ul></div>` : ''}</div>
    <div class="bench-tools">
      ${posts.length ? `<div hidden id="search-controls"><label for="article-search">Search benchmarks</label><input id="article-search" type="search" placeholder="Search benchmarks" data-singular="entry" data-plural="entries"><span id="result-count" role="status"></span></div>` : ''}
      <a class="bench-suggest" href="${contribute}#add-a-benchmark">Suggest a benchmark <span aria-hidden="true">↗</span></a>
    </div>
    ${sections.join('\n') || '<p>No benchmarks have been published yet.</p>'}
    ${posts.length ? '<div class="bench-empty" hidden><h2>No matching entries</h2><p>Try another tool, publisher or subject.</p><button type="button">Clear search</button></div><script defer src="/article-search.js"></script>' : ''}
  </div>`;
}
