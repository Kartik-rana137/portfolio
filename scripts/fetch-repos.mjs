// Builds data/repos.json: a snapshot of every public repository owned by the GitHub user.
// Runs in the deploy workflow (daily + on push). No dependencies; Node 20+.
//
//   node scripts/fetch-repos.mjs            # uses GITHUB_TOKEN if set (5,000 req/h), else anonymous (60 req/h)
//
// Control what the site shows with GitHub topics on each repo (no site edits needed):
//   portfolio-featured  -> pinned to the top of the projects list with a "Featured" badge
//   portfolio-hide      -> left out of the site entirely

import { mkdir, writeFile } from 'node:fs/promises';

const USER = process.env.GITHUB_USER || 'Kartik-rana137';
const PORTFOLIO_REPO = `${USER}/portfolio`.toLowerCase();
const OUT = new URL('../data/repos.json', import.meta.url);
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'portfolio-repo-snapshot',
  'X-GitHub-Api-Version': '2022-11-28',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
};

async function fetchAll() {
  const repos = [];
  for (let page = 1; page <= 50; page++) {            // 50 x 100 = up to 5,000 repos
    const url = `https://api.github.com/users/${USER}/repos?type=owner&sort=pushed&per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`GitHub API ${res.status} on page ${page}: ${await res.text()}`);
    const batch = await res.json();
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  return repos;
}

const raw = await fetchAll();
const repos = raw
  .filter((r) => !r.private && !r.fork && r.full_name.toLowerCase() !== PORTFOLIO_REPO
    && !(r.topics || []).includes('portfolio-hide'))
  .map((r) => ({
    name: r.name,
    description: r.description || '',
    url: r.html_url,
    homepage: r.homepage || '',
    language: r.language || '',
    topics: (r.topics || []).filter((t) => !t.startsWith('portfolio-')),
    featured: (r.topics || []).includes('portfolio-featured'),
    archived: r.archived,
    stars: r.stargazers_count,
    created: r.created_at,
    pushed: r.pushed_at
  }));

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(OUT, JSON.stringify({ user: USER, generated: new Date().toISOString(), count: repos.length, repos }) + '\n');
console.log(`Wrote ${repos.length} repositories (of ${raw.length} fetched) to data/repos.json`);
