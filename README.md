# kartikrana.work

Personal portfolio of Kartik Rana in a Frutiger Aero style. It is a static site (HTML, CSS and vanilla JS) with no build step.

## Files

```
index.html          The page
404.html            "Page not found" page (GitHub Pages serves it automatically)
css/styles.css      All styling; colour tokens for light and dark themes are at the top
js/main.js          Theme toggle, bubbles, scroll reveal, live GitHub repo list
assets/             Favicon and project images
CNAME               Custom domain for GitHub Pages (kartikrana.work)
.nojekyll           Tells GitHub Pages to serve files as-is
```

The **More on GitHub** grid loads public repos from `github.com/Kartik-rana137` in the visitor's browser, so new repos show up without editing the site. Repos already featured above it are hidden via the `FEATURED` list at the top of `js/main.js`.

## Preview locally

```bash
npx serve .
# or
python -m http.server 8000
```

## Deploy to kartikrana.work with GitHub Pages

1. Create a public repo on GitHub, for example `Kartik-rana137/portfolio`, and push this folder to its `main` branch.
2. In the repo, open **Settings → Pages** and set **Source** to *Deploy from a branch*, with branch `main` and folder `/ (root)`.
3. Under **Custom domain**, enter `kartikrana.work`. The `CNAME` file already contains it.
4. At your domain registrar, add these DNS records:

   | Type  | Host | Value                   |
   |-------|------|-------------------------|
   | A     | @    | 185.199.108.153         |
   | A     | @    | 185.199.109.153         |
   | A     | @    | 185.199.110.153         |
   | A     | @    | 185.199.111.153         |
   | AAAA  | @    | 2606:50c0:8000::153     |
   | AAAA  | @    | 2606:50c0:8001::153     |
   | AAAA  | @    | 2606:50c0:8002::153     |
   | AAAA  | @    | 2606:50c0:8003::153     |
   | CNAME | www  | kartik-rana137.github.io |

5. When DNS has propagated (from a few minutes up to a day), tick **Enforce HTTPS** in Settings → Pages.

Optionally, verify the domain under your GitHub account's **Settings → Pages** so no one else can claim it on GitHub.

## Editing

- **Copy:** the hero, project text and About section are plain HTML in `index.html`.
- **Email:** the contact section has a commented-out email button. Uncomment it and add your address.
- **New featured project:** copy one of the `<article class="project ...">` blocks in `index.html`, then add the repo name to `FEATURED` in `js/main.js` so it isn't listed twice.
