const field = document.querySelector('#article-search');
const rows = Array.from(document.querySelectorAll('.results li'));
const status = document.querySelector('#result-count');
document.querySelector('#search-controls').hidden = false;

function filterArticles() {
  const terms = field.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  let matches = 0;
  for (const row of rows) {
    row.hidden = !terms.every(term => row.dataset.search.includes(term));
    if (!row.hidden) matches++;
  }
  status.textContent = matches ? matches + (matches === 1 ? ' article' : ' articles') : 'No articles match this search.';
}

field.addEventListener('input', filterArticles);
filterArticles();
