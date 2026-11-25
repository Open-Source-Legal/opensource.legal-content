const field = document.querySelector('#article-search');
const rows = Array.from(document.querySelectorAll('[data-search]'));
const status = document.querySelector('#result-count');
const groups = document.querySelectorAll('.bench-group');
const empty = document.querySelector('.bench-empty');
document.querySelector('#search-controls').hidden = false;

function filterArticles() {
  const terms = field.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  let matches = 0;
  for (const row of rows) {
    row.hidden = !terms.every(term => row.dataset.search.includes(term));
    if (!row.hidden) matches++;
  }
  for (const group of groups) {
    group.hidden = !group.querySelector('[data-search]:not([hidden])');
  }
  if (empty) empty.hidden = matches > 0;
  const singular = field.dataset.singular || 'article';
  const plural = field.dataset.plural || 'articles';
  status.textContent = matches ? matches + ' ' + (matches === 1 ? singular : plural) : 'No ' + plural + ' match this search.';
}

function clearSearch() {
  field.value = '';
  filterArticles();
}

for (const link of document.querySelectorAll('.bench-contents a')) {
  link.addEventListener('click', clearSearch);
}
empty?.querySelector('button').addEventListener('click', () => {
  clearSearch();
  field.focus();
});
field.addEventListener('input', filterArticles);
filterArticles();
