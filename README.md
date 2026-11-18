# kartikrana.work

Personal portfolio of Kartik Rana: a light, professional liquid glass design. It is a static site (HTML, CSS and vanilla JS) with no build step for the page itself.

## Files

```
index.html                    The page
404.html                      "Page not found" page
css/styles.css                All styling; colour tokens for light and dark themes are at the top
js/main.js                    Theme toggle and the All projects list
assets/                       Favicon and project screenshots (full size + 800px versions for phones)
scripts/fetch-repos.mjs       Builds data/repos.json from the GitHub API
.github/workflows/deploy.yml  Snapshots repos and deploys the site to GitHub Pages
CNAME                         Custom domain (kartikrana.work)
```

## All projects (built for hundreds of repos)

The **All projects** list shows your public, non-fork repositories, excluding this portfolio website, with search, a language filter, sorting and a **Show more** button (12 at a time, 6 on phones).

- **Updates itself.** The deploy workflow runs on every push and once a day. It snapshots all your repos into `data/repos.json` (paging through the GitHub API, up to 5,000 repos) and publishes the site. Visitors load that one file instead of calling GitHub, so there are no rate limits. To refresh right away: **Actions → Deploy site → Run workflow**.
- **Feature a repo:** add the topic `portfolio-featured` to it on GitHub. It is pinned to the top with a *Featured* badge.
- **Hide a repo:** add the topic `portfolio-hide`.
- Forks are never listed. Archived repos show an *Archived* badge.
- Repos showcased in the big project cards are skipped automatically: each card has `data-repo="RepoName"`.
- Views can be shared as links, e.g. `https://kartikrana.work/#projects?q=game&lang=Python&sort=stars`.

## Preview locally

```bash
node scripts/fetch-repos.mjs   # optional: builds data/repos.json (otherwise the page calls the GitHub API directly)
python -m http.server 8000
```

## Performance

On phones and low-end devices (small screen, touch, ≤4 GB memory or ≤4 CPU cores, data saver, or reduced transparency) the page switches to a **lite mode**: same look, but no backdrop blur, no masked layers and no fixed full-screen layer. Off-screen sections are skipped until needed. See the *Lite mode* block at the end of `css/styles.css`.

## Hosting

GitHub Pages, deployed by the workflow (**Settings → Pages → Source: GitHub Actions**), with HTTPS enforced. DNS for `kartikrana.work` is at Porkbun:

| Type  | Host | Value |
|-------|------|-------|
| A     | @    | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 |
| CNAME | www  | kartik-rana137.github.io |

## Editing

- **Copy:** the hero, project cards, About, Education and Skills are plain HTML in `index.html`.
- **New showcased project:** copy one of the `<article class="project ..." data-repo="...">` blocks in `index.html` and set `data-repo` to the repo name.
- **Email:** the contact section has a commented-out email button. Uncomment it and add your address.
