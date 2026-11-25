import { copyFile, mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import MarkdownIt from 'markdown-it';
import { parse } from 'yaml';

const markdown = new MarkdownIt({ html: false });
const escape = markdown.utils.escapeHtml;
const repo = 'https://github.com/Open-Source-Legal/opensource.legal-content';
const contribute = repo + '/blob/main/CONTRIBUTING.md';

function parseArticle(filename, source) {
  const slug = filename.slice(0, -3);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug === 'index') {
    throw new Error('Use a lowercase, hyphenated filename other than index.md');
  }
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]+)$/.exec(source.replace(/\r\n/g, '\n'));
  if (!match || !match[2].trim()) throw new Error('Expected YAML front matter followed by Markdown text');
  const meta = parse(match[1]);
  for (const key of ['title', 'date', 'summary', 'author']) {
    if (typeof meta?.[key] !== 'string' || !meta[key].trim()) throw new Error('Missing ' + key);
  }
  const date = new Date(meta.date + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date) || !Number.isFinite(+date) || date.toISOString().slice(0, 10) !== meta.date) {
    throw new Error('Use a valid publication date in YYYY-MM-DD format');
  }
  const { title, summary, author } = meta;
  const byline = '<time datetime="' + meta.date + '">' + meta.date + '</time> · ' + escape(author);
  const searchText = [title, summary, author, match[2]].join(' ').toLowerCase().replace(/\s+/g, ' ');
  return { slug, path: '/articles/' + slug, date: meta.date, title, summary, byline, searchText, body: markdown.render(match[2]) };
}

export async function buildArticles(root, dist) {
  const source = join(root, 'content/articles');
  const assets = dist;
  const output = join(assets, 'articles');
  const template = await readFile(join(root, 'templates/article-page.html'), 'utf8');
  function page(title, description, path, content) {
    const fields = { title: escape(title), description: escape(description), path, content, contribute };
    return template.replace(/{{(\w+)}}/g, (_, key) => fields[key]);
  }

  const articles = [];
  const files = await readdir(source, { withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  for (const entry of files) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) throw new Error('Expected a Markdown file in content/articles: ' + entry.name);
    try {
      articles.push(parseArticle(entry.name, await readFile(join(source, entry.name), 'utf8')));
    } catch (error) {
      throw new Error('content/articles/' + entry.name + ': ' + error.message);
    }
  }
  articles.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  await mkdir(output, { recursive: true });
  const filenames = new Set(articles.map(article => article.slug + '.html'));
  for (const filename of await readdir(output)) {
    if (filename.endsWith('.html') && !filenames.has(filename)) await unlink(join(output, filename));
  }
  for (const article of articles) {
    const { title, summary, path, slug, byline, body } = article;
    const html = `<article><a href="/articles">All articles</a><h1>${escape(title)}</h1>
      <p class="summary">${escape(summary)}</p><p class="byline">${byline}</p>${body}
      <p><a href="${repo}/edit/main/content/articles/${slug}.md">Edit this article on GitHub</a></p></article>`;
    await writeFile(join(output, slug + '.html'), page(title, summary, path, html));
  }

  const rows = articles.map(article => `<li data-search="${escape(article.searchText)}">
    <p class="byline">${article.byline}</p><h2><a href="${article.path}">${escape(article.title)}</a></h2>
    <p>${escape(article.summary)}</p></li>`).join('\n');
  const archive = `<h1>Articles</h1><p class="summary">Guides and field notes on open source legal tools.</p>
    <div hidden id="search-controls"><label for="article-search">Search articles</label>
    <input type="search" id="article-search"><p id="result-count" role="status"></p></div>
    <ul class="results">${rows}</ul>
    <a href="${contribute}#write-an-article">Submit an article</a>
    <script defer src="/article-search.js"></script>`;
  await writeFile(join(assets, 'articles.html'), page('Articles', 'Search guides and field notes on open source legal tools.', '/articles', archive));
  for (const name of ['articles.css', 'article-search.js']) {
    await copyFile(join(root, 'templates', name), join(assets, name));
  }

  const links = articles.slice(0, 3).map(article =>
    `<li><a href="${article.path}">${escape(article.title)}</a><p>${escape(article.summary)}</p></li>`
  ).join('\n');
  const latest = links ? `<section class="latest-articles"><h2>Latest articles</h2><ul>${links}</ul><a href="/articles">Browse all articles</a></section>` : '';
  await writeFile(join(dist, 'latest-articles.html'), latest);
  return articles;
}
