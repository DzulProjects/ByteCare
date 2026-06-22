# ByteCare — Corporate Website

Official corporate website for **ByteCare Sdn Bhd** — a Healthcare Intelligence & Digital Transformation company.

> **Connecting Care Through Technology**

This is the **basic v1** of the site: a fast, static, single-page marketing website built with plain HTML, CSS, and JavaScript (no build step). It is designed to be easy to extend into a multi-page site or migrate to a framework (e.g. Next.js / Astro) later.

## Tech stack

- **HTML5** — semantic, single-page (`index.html`)
- **CSS3** — custom design system (`css/styles.css`), no framework
- **Vanilla JS** — tiny, dependency-free (`js/main.js`)
- **Inter** font via Google Fonts (brand primary typeface)

No dependencies, no bundler — just open and go.

## Project structure

```
ByteCare/
├── index.html            # All sections (hero, solutions, products, etc.)
├── css/
│   └── styles.css        # Design system + components
├── js/
│   └── main.js           # Nav toggle, sticky header, scroll reveal
├── assets/               # Brand logos (transparent PNG)
│   ├── logo-light.png    # Wordmark lockup for light backgrounds (header)
│   ├── logo-dark.png     # Wordmark lockup for dark backgrounds (footer)
│   ├── favicon.png       # "B" mark favicon / app icon
│   └── og-image.png      # Social share (Open Graph) image
└── README.md
```

## Sections

Home (hero) · Solutions · Products · Industries · About Us · Contact

**Products showcased:** eDialysis · eFarma · ByteClaims · ByteAnalytics · ByteAssist AI · ByteConnect

## Brand reference

Implemented from the *ByteCare Brand Guideline Book v1.0*.

| Token | Value | Usage |
| --- | --- | --- |
| ByteCare Black | `#0D0D0F` | Primary typography, headers |
| ByteCare Purple | `#7C3AED` | Buttons, highlights, CTAs |
| Electric Purple | `#A855F7` | Accent / gradients |
| Light Gray | `#E5E7EB` | Borders |
| Dark Gray | `#374151` | Secondary text |
| White | `#FFFFFF` | Backgrounds |

- **Typeface:** Inter (Heading 700 / line-height 120% / letter-spacing -2%; Body 400 / line-height 160%)
- **Style:** Enterprise SaaS, Stripe/Linear/Vercel-inspired, minimal, high whitespace
- **Primary CTA:** Book Consultation · **Secondary CTA:** Explore Solutions

## Run locally

It is just static files. Either:

1. **Open directly** — double-click `index.html`, or
2. **Serve locally** (recommended, avoids any path quirks):

```powershell
# Python 3
python -m http.server 5500
# then open http://localhost:5500
```

```powershell
# Node (if installed)
npx serve .
```

## Deploy

Static site — host anywhere. Recommended: **Cloudflare Pages** (matches the `bytecare.com.my` / `bytecare.my` domains).

**Cloudflare Pages:**
1. Push this repo to GitHub.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Build settings: **Framework preset = None**, **Build command = (empty)**, **Build output directory = `/`**.
4. Add custom domain `bytecare.com.my` (and `bytecare.my`).

## Roadmap (next steps)

- Split into multi-page (dedicated Solutions / Products / Industries / About / Contact pages)
- Real contact form (Cloudflare Pages Functions / Formspree)
- Per-product detail pages
- Blog / insights section
- SEO: `sitemap.xml`, `robots.txt`, structured data
- Optional migration to Next.js or Astro

## License

© ByteCare Sdn Bhd. All rights reserved.

---

*Built with assistance from Oz (Warp).*
