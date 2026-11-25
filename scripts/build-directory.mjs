#!/usr/bin/env node
// Enrich oss_directory.json with GitHub stats + license, write dist/directory.json.
//
// Inputs:
//   - oss_directory.json (hand-maintained source of truth)
//   - GH_TOKEN env (optional — bumps GitHub API limit from 60/hr to 5000/hr)
//   - dist/directory.json (optional — used as fallback for entries whose GH lookup fails)
//
// Output:
//   - dist/directory.json with merged stars/forks/language/pushed_at/license per entry

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { buildArticles, collections } from './build-articles.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'oss_directory.json');
const OUT_DIR = join(ROOT, 'dist');
const OUT = join(OUT_DIR, 'directory.json');
const OUT_LLMS = join(OUT_DIR, 'llms.txt');
const OUT_SITEMAP = join(OUT_DIR, 'sitemap.xml');

const SITE = 'https://opensource.legal';

const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'opensource-legal-directory-builder',
  ...(TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {}),
};

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseRepo(githubUrl) {
  if (!githubUrl) return null;
  const m = githubUrl.match(/github\.com\/([^\/]+)\/([^\/?#]+)/);
  if (!m) return null;
  const owner = m[1];
  const repo = m[2].replace(/\.git$/, '');
  // Skip org-only URLs (no repo segment).
  if (!repo || repo === '') return null;
  return `${owner}/${repo}`;
}

async function fetchRepo(slug) {
  const res = await fetch(`https://api.github.com/repos/${slug}`, { headers: HEADERS });
  if (res.status === 404) return { error: 'not_found' };
  if (res.status === 403) {
    const remaining = res.headers.get('x-ratelimit-remaining');
    return { error: `forbidden (rate-limit remaining: ${remaining})` };
  }
  if (!res.ok) return { error: `http_${res.status}` };
  return await res.json();
}

async function loadPriorOutput() {
  if (!existsSync(OUT)) return new Map();
  try {
    const raw = await readFile(OUT, 'utf8');
    const arr = JSON.parse(raw);
    return new Map(arr.map(e => [e.title, e]));
  } catch {
    return new Map();
  }
}

// Build an llms.txt index (https://llmstxt.org/) from the enriched directory.
// Grouped by category so an LLM can ingest the full project list as a canonical source.
function buildLlmsTxt(enriched, articles) {
  const lines = [];
  lines.push('# Open Source Legal');
  lines.push('');
  lines.push('> Open source tools for understanding how law, contracts, and legal systems shape our world. opensource.legal curates and builds community-maintained software for legal document analysis, redlining, annotation, and knowledge sharing.');
  lines.push('');
  lines.push('Open Source Legal is a community publishing open tools and a curated directory of open source legal-technology projects. All listed projects are open source; the GitHub organization is https://github.com/Open-Source-Legal.');
  lines.push('');
  lines.push('## Site');
  lines.push('');
  lines.push(`- [Home](${SITE}/): What Open Source Legal is and its featured projects.`);
  lines.push(`- [Directory](${SITE}/directory): Curated directory of ${enriched.length} open source legal-tech tools across ${new Set(enriched.map(e => e.category)).size} categories.`);
  lines.push(`- [Directory data (JSON)](${SITE}/directory.json): Machine-readable directory with stars, language, and license per project.`);
  lines.push('');

  for (const { section, title } of collections) {
    lines.push('## ' + title, '', `- [${title} index](${SITE}/${section})`);
    for (const post of articles.filter(post => post.section === section)) {
      lines.push(`- [${post.title}](${SITE}${post.path}): ${post.summary}`);
    }
    lines.push('');
  }

  const byCategory = new Map();
  for (const e of enriched) {
    if (!byCategory.has(e.category)) byCategory.set(e.category, []);
    byCategory.get(e.category).push(e);
  }
  for (const [category, items] of byCategory) {
    lines.push(`## ${category}`);
    lines.push('');
    for (const e of items) {
      const url = e.github_url || e.homepage || `${SITE}/directory`;
      const meta = [e.language, e.license_label || e.license].filter(Boolean).join(', ');
      const suffix = meta ? ` (${meta})` : '';
      lines.push(`- [${e.title}](${url})${suffix}: ${e.description}`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd() + '\n';
}

// Sitemap of the actual site pages (project links are external GitHub URLs, so they
// belong in llms.txt / the directory, not the sitemap).
function buildSitemap(articles) {
  const paths = ['/', '/directory', ...collections.map(({ section }) => '/' + section), ...articles.map(article => article.path)];
  const urls = paths.map(path => `  <url><loc>${SITE}${path}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function validateDirectory(entries) {
  if (!Array.isArray(entries)) throw new Error('oss_directory.json must contain an array');
  const slugs = new Set();
  for (const [index, entry] of entries.entries()) {
    for (const key of ['title', 'description', 'category']) {
      if (typeof entry?.[key] !== 'string' || !entry[key].trim()) throw new Error(`Entry ${index + 1}: missing ${key}`);
    }
    const slug = slugify(entry.title);
    if (!slug || slugs.has(slug)) throw new Error(`Missing or duplicate directory slug for ${entry.title}`);
    slugs.add(slug);
    if (!entry.github_url && !entry.homepage) throw new Error(`${entry.title}: provide github_url or homepage`);
    for (const key of ['github_url', 'homepage']) {
      if (entry[key] == null) continue;
      if (typeof entry[key] !== 'string' || !URL.canParse(entry[key])) throw new Error(`${entry.title}: invalid ${key}`);
      const url = new URL(entry[key]);
      if (!['https:', 'http:'].includes(url.protocol) || (key === 'github_url' && url.hostname !== 'github.com')) {
        throw new Error(`${entry.title}: invalid ${key}`);
      }
    }
    for (const key of ['license', 'license_label']) {
      if (entry[key] != null && typeof entry[key] !== 'string') throw new Error(`${entry.title}: invalid ${key}`);
    }
    if (entry.featured != null && typeof entry.featured !== 'boolean' && !Number.isInteger(entry.featured)) {
      throw new Error(`${entry.title}: invalid featured rank`);
    }
  }
}

async function main() {
  const raw = await readFile(SRC, 'utf8');
  const entries = JSON.parse(raw);
  validateDirectory(entries);
  const articles = await buildArticles(ROOT, OUT_DIR);
  const prior = await loadPriorOutput();

  const enriched = [];
  const failures = [];
  const licenseCounts = new Map();

  for (const e of entries) {
    const repoSlug = parseRepo(e.github_url);
    let stars = null, forks = null, language = null, pushed_at = null;
    let license = null, license_label = null;

    if (repoSlug) {
      const data = process.argv.includes('--offline') ? { error: 'offline' } : await fetchRepo(repoSlug);
      if (data.error) {
        if (data.error !== 'offline') failures.push({ title: e.title, repo: repoSlug, reason: data.error });
        // Fall back to last good values if available.
        const last = prior.get(e.title);
        if (last) {
          stars = last.stars ?? null;
          forks = last.forks ?? null;
          language = last.language ?? null;
          pushed_at = last.pushed_at ?? null;
          license = last.license ?? null;
          license_label = last.license_label ?? null;
        }
      } else {
        stars = data.stargazers_count ?? null;
        forks = data.forks_count ?? null;
        language = data.language ?? null;
        pushed_at = data.pushed_at ?? null;
        if (data.license && data.license.spdx_id && data.license.spdx_id !== 'NOASSERTION') {
          license = data.license.spdx_id;
          license_label = data.license.spdx_id;
        }
      }
    }

    // JSON override always wins over API-derived license.
    if (e.license) {
      license = e.license;
      license_label = e.license_label || e.license;
    }

    const out = {
      title: e.title,
      slug: slugify(e.title),
      github_url: e.github_url || null,
      homepage: e.homepage || null,
      description: e.description,
      category: e.category,
      featured: typeof e.featured === 'number' ? e.featured : (e.featured ? 1 : 0),
      stars,
      forks,
      language,
      pushed_at,
      license,
      license_label,
    };
    enriched.push(out);

    const key = license || 'Unknown';
    licenseCounts.set(key, (licenseCounts.get(key) || 0) + 1);
  }

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT, JSON.stringify(enriched, null, 2) + '\n', 'utf8');

  await writeFile(OUT_LLMS, buildLlmsTxt(enriched, articles), 'utf8');
  await writeFile(OUT_SITEMAP, buildSitemap(articles), 'utf8');
  await writeFile(join(OUT_DIR, 'index.html'), '<!doctype html><html lang="en"><title>Open Source Legal</title><link rel="canonical" href="https://opensource.legal/articles"><p><a href="https://opensource.legal/articles">Read Open Source Legal articles</a></p></html>');

  const withRepo = enriched.filter(e => e.github_url).length;
  const withStars = enriched.filter(e => typeof e.stars === 'number').length;
  console.log(`[build-directory] wrote ${OUT}`);
  console.log(`[build-directory] wrote ${OUT_LLMS}`);
  console.log(`[build-directory] wrote ${OUT_SITEMAP}`);
  console.log(`  entries:        ${enriched.length}`);
  console.log(`  with github:    ${withRepo}`);
  console.log(`  with stars:     ${withStars}`);
  console.log(`  auth:           ${TOKEN ? 'token' : 'anonymous (60/hr limit)'}`);
  if (failures.length) {
    console.log(`  failures:       ${failures.length}`);
    for (const f of failures) console.log(`    - ${f.title} (${f.repo}): ${f.reason}`);
  }
  console.log(`  license breakdown:`);
  const sorted = [...licenseCounts.entries()].sort((a, b) => b[1] - a[1]);
  for (const [lic, n] of sorted) console.log(`    ${lic.padEnd(20)} ${n}`);
}

main().catch(err => {
  console.error('[build-directory] fatal:', err);
  process.exit(1);
});
