import { copyFile, mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import MarkdownIt from 'markdown-it';
import { parse } from 'yaml';
import { benchmarkIndex, benchmarkSubject } from './benchmark-index.mjs';

const markdown = new MarkdownIt({ html: false });
const escape = markdown.utils.escapeHtml;
const repo = 'https://github.com/Open-Source-Legal/opensource.legal-content';
const site = 'https://opensource.legal';
const license = 'https://creativecommons.org/licenses/by-nc/4.0/';
const contribute = repo + '/blob/main/CONTRIBUTING.md';

function parseArticle(filename, source, section) {
  const slug = filename.slice(0, -3);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug === 'index') {
    throw new Error('Use a lowercase, hyphenated filename other than index.md');
  }
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]+)$/.exec(source.replace(/\r\n/g, '\n'));
  if (!match || !match[2].trim()) throw new Error('Expected YAML front matter followed by Markdown text');
  const meta = parse(match[1]);
  const required = ['title', 'date', 'summary', 'author'];
  if (section === 'benchmarks') required.push('publisher', 'access', 'homepage');
  for (const key of required) {
    if (typeof meta?.[key] !== 'string' || !meta[key].trim()) throw new Error('Missing ' + key);
  }
  const date = new Date(meta.date + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date) || !Number.isFinite(+date) || date.toISOString().slice(0, 10) !== meta.date) {
    throw new Error('Use a valid publication date in YYYY-MM-DD format');
  }
  const { title, summary, author } = meta;
  const byline = '<time datetime="' + meta.date + '">' + meta.date + '</time> · ' + escape(author);
  const context = section === 'benchmarks' ? escape(meta.publisher) + ' · ' + escape(meta.access) : '';
  const subject = section === 'benchmarks' ? benchmarkSubject(meta.subject) : undefined;
  let directoryEntry;
  let licenseLinks = '';
  if (section === 'benchmarks') {
    if (!Array.isArray(meta.licenses) || !meta.licenses.length) throw new Error('List the benchmark license terms and their sources');
    for (const term of meta.licenses) {
      if (![term?.id, term?.label, term?.url].every(v => typeof v === 'string' && v.trim()) ||
          !URL.canParse(term.url) || !['http:', 'https:'].includes(new URL(term.url).protocol)) {
        throw new Error('Each license needs an id, label and HTTP source URL');
      }
    }
    licenseLinks = meta.licenses.map(term => `<a href="${escape(term.url)}">${escape(term.label)}</a>`).join(' · ');
    directoryEntry = {
      title, description: summary, category: 'Legal AI Datasets & Benchmarks',
      github_url: meta.github_url, homepage: meta.homepage, license: meta.licenses[0].id,
      license_label: meta.licenses.map(term => term.label).join(' · '),
      licenses: meta.licenses, benchmark_path: '/benchmarks/' + slug,
      publisher: meta.publisher, access: meta.access, subject: subject.title,
    };
  }
  const searchText = [directoryEntry?.license_label, directoryEntry?.licenses.map(term => term.id).join(' '), title, summary, author, meta.publisher, meta.access, subject?.title, match[2]].join(' ').toLowerCase().replace(/\s+/g, ' ');
  return { slug, section, path: '/' + section + '/' + slug, date: meta.date, title, summary, author, byline, context, publisher: meta.publisher, access: meta.access, subject, directoryEntry, licenseLinks, searchText, body: markdown.render(match[2]) };
}

export const collections = [
  { section: 'articles', title: 'Articles', item: 'article', plural: 'articles',
    summary: 'Practical guides to using open source legal tools and datasets.', submit: 'Submit an article', anchor: 'write-an-article' },
  { section: 'benchmarks', title: 'Benchmarks', item: 'benchmark', plural: 'benchmarks',
    summary: 'Find evaluations for legal research, contract negotiation and document tools. See what each test measures and which materials you can use.', submit: 'Suggest a benchmark', anchor: 'add-a-benchmark' },
  { section: 'blog', title: 'Blog', item: 'post', plural: 'posts',
    summary: 'Project updates, field notes and observations from the open source legal community.', submit: 'Submit a blog post', anchor: 'write-a-blog-post' },
];

function newestFirst(a, b) {
  return b.date.localeCompare(a.date) || a.path.localeCompare(b.path);
}

async function buildCollection(root, dist, page, collection) {
  const { section, title, item, plural, summary } = collection;
  const source = join(root, 'content', section);
  const files = await readdir(source, { withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const posts = [];
  for (const entry of files) {
    const relative = 'content/' + section + '/' + entry.name;
    if (!entry.isFile() || !entry.name.endsWith('.md')) throw new Error('Expected a Markdown file: ' + relative);
    try {
      posts.push(parseArticle(entry.name, await readFile(join(source, entry.name), 'utf8'), section));
    } catch (error) {
      throw new Error(relative + ': ' + error.message);
    }
  }
  posts.sort(newestFirst);
  const output = join(dist, section);
  await mkdir(output, { recursive: true });
  const filenames = new Set(posts.flatMap(post => [post.slug + '.html', post.slug + '.md']));
  for (const filename of await readdir(output)) {
    if (/\.(?:html|md)$/.test(filename) && !filenames.has(filename)) await unlink(join(output, filename));
  }
  for (const post of posts) {
    const html = `<article><a href="/${section}">All ${plural}</a><h1>${escape(post.title)}</h1>
      <p class="summary">${escape(post.summary)}</p>
      ${post.context ? `<p>${post.context}</p><p><strong>Benchmark license</strong> · ${post.licenseLinks}</p>` : ''}<p class="byline">${post.context ? 'Reviewed ' : ''}${post.byline}</p>${post.body}
      <p><a href="${repo}/edit/main/content/${section}/${post.slug}.md">Edit this ${item} on GitHub</a></p></article>`;
    await copyFile(join(source, post.slug + '.md'), join(output, post.slug + '.md'));
    const schema = {
      '@type': { articles: 'Article', blog: 'BlogPosting', benchmarks: 'WebPage' }[section],
      author: post.author === 'Open Source Legal' ? { '@type': 'Organization', name: post.author, url: site } : { '@type': 'Thing', name: post.author },
      [section === 'benchmarks' ? 'lastReviewed' : 'datePublished']: post.date,
      license,
    };
    await writeFile(join(output, post.slug + '.html'), page(post.title, post.summary, post.path, html, schema, true));
  }

  const archive = section === 'benchmarks'
    ? benchmarkIndex(posts, contribute, escape)
    : writingIndex(posts, collection);
  await writeFile(join(dist, section + '.html'), page(title, summary, '/' + section, archive, {
    '@type': 'CollectionPage',
    mainEntity: { '@type': 'ItemList', numberOfItems: posts.length, itemListElement: posts.map((post, i) => ({
      '@type': 'ListItem', position: i + 1, name: post.title, url: site + post.path,
    })) },
  }));
  return posts;
}

function writingIndex(posts, { title, item, plural, summary, anchor, submit }) {
  const rows = posts.map(post => `<li data-search="${escape(post.searchText)}">
    <p class="byline">${post.context || post.byline}</p><h2><a href="${post.path}">${escape(post.title)}</a></h2>
    <p>${escape(post.summary)}</p></li>`).join('\n');
  const listing = rows ? `<div hidden id="search-controls"><label for="article-search">Search ${plural}</label>
    <input type="search" id="article-search" data-singular="${item}" data-plural="${plural}"><p id="result-count" role="status"></p></div>
    <ul class="results">${rows}</ul><script defer src="/article-search.js"></script>` : `<p>No ${plural} have been published yet.</p>`;
  return `<h1>${title}</h1><p class="summary">${summary}</p>${listing}
    <a href="${contribute}#${anchor}">${submit}</a>`;
}

function latestList(posts, mixed) {
  if (!posts.length) return '';
  const links = posts.slice(0, 3).map(post => {
    const label = post.section === 'blog' ? 'Blog' : 'Article';
    const meta = mixed ? `<small>${label} · <time datetime="${post.date}">${post.date}</time></small>` : '';
    return `<li>${meta}<a href="${post.path}">${escape(post.title)}</a><p>${escape(post.summary)}</p></li>`;
  }).join('\n');
  const browse = mixed ? '<a href="/articles">All articles</a> · <a href="/blog">All blog posts</a>' : '<a href="/articles">Browse all articles</a>';
  return `<section class="latest-articles"><h2>${mixed ? 'Latest articles and posts' : 'Latest articles'}</h2><ul>${links}</ul>${browse}</section>`;
}

export async function buildArticles(root, dist) {
  const template = await readFile(join(root, 'templates/article-page.html'), 'utf8');
  function page(title, description, path, content, schema, hasMarkdown = false) {
    const url = site + path;
    const graph = {
      '@context': 'https://schema.org', ...schema,
      url, name: title, description, inLanguage: 'en',
      isPartOf: { '@id': site + '/#website' },
    };
    if (['Article', 'BlogPosting'].includes(schema['@type'])) {
      graph.headline = title;
      graph.mainEntityOfPage = url;
    }
    const fields = {
      title: escape(title), description: escape(description), path, content, contribute,
      ogType: graph.headline ? 'article' : 'website',
      markdownLink: hasMarkdown ? '<link rel="alternate" type="text/markdown" href="' + url + '.md">' : '',
      graph: JSON.stringify(graph).replace(/</g, '\\u003c'),
    };
    return template.replace(/{{(\w+)}}/g, (_, key) => fields[key]);
  }
  const posts = [];
  for (const collection of collections) {
    posts.push(...await buildCollection(root, dist, page, collection));
  }
  posts.sort(newestFirst);
  for (const name of ['articles.css', 'article-search.js']) {
    await copyFile(join(root, 'templates', name), join(dist, name));
  }
  const feed = {
    version: 'https://jsonfeed.org/version/1.1', title: 'Open Source Legal',
    home_page_url: site + '/', feed_url: site + '/feed.json', language: 'en',
    description: 'Articles, blog posts and benchmark notes from Open Source Legal.',
    items: posts.map(post => {
      const url = site + post.path;
      return {
        id: url, url, title: post.title, content_text: post.summary,
        authors: [{ name: post.author }], tags: [post.section],
        [post.section === 'benchmarks' ? 'date_modified' : 'date_published']: post.date + 'T00:00:00Z',
        attachments: [{ url: url + '.md', mime_type: 'text/markdown', title: 'Full text in Markdown' }],
      };
    }),
  };
  await writeFile(join(dist, 'feed.json'), JSON.stringify(feed, null, 2) + '\n');
  // The deployed legacy homepage still requests its article-only fragment.
  await writeFile(join(dist, 'latest-articles.html'), latestList(posts.filter(post => post.section === 'articles'), false));
  await writeFile(join(dist, 'latest-writing.html'), latestList(posts.filter(post => post.section !== 'benchmarks'), true));
  return posts;
}
