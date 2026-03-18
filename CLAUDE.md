## DEFAULT REPO
This is the canonical codebase. All edits go here. Never edit files in the stemcyte (Next.js) repo. The Next.js build is deprecated — Astro is the production site.

## PROJECT: StemCyte Website (Astro + Cloudflare)

Astro-based rebuild of stemcyte.com — a cord blood banking company in Baldwin Park, CA.

---

## TECH STACK
- Framework: Astro (static output)
- Interactive islands: React (for forms, animations, physics)
- Hosting: Cloudflare Pages
- Fonts: @fontsource (Playfair Display, Lato, Source Serif 4)
- Styles: Global CSS + scoped <style> in .astro files
- Images: Astro built-in <Image> component

---

## AESTHETIC DIRECTION
Simple, warm, trustworthy, grown-up. Not cold clinical, not cutesy baby brand.

Inspirations: Apple (minimalism), Babylist (warm parent-friendly), One Medical (modern healthcare), Aesop (typographic restraint)

Key principles:
- Plum/cream/lavender palette — deliberately not sterile whites and blues
- Generous whitespace, 80px section spacing
- Playfair Display for headlines, Lato for body, Source Serif 4 for numbers/stats
- Cinematic hero photos with radial vignettes
- Subtle shadows, pill buttons, content-first layouts
- No decoration for decoration's sake
- REGENECYTE® always includes the ® symbol
- Never use italic Playfair Display for product names — use Lato bold or matching weight

---

## DESIGN TOKENS
- Primary: #6C1A55 (deep plum)
- Body bg: #FAF7F2 (warm sandy cream) / alt: #FAF9F7
- Alt section bg: #F3F0F8 (light lavender)
- Deep lavender: #EDE8F5
- Footer: #3D0F31 (deep plum)
- Buttons: pill (border-radius: 100px)
- Cards: shadow (0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03))
- Section dividers: 1px solid #E8E2DC
- CTA banner gradient: linear-gradient(160deg, #6C1A55, #3D0F31)

---

## CRITICAL CONTENT RULES — DO NOT VIOLATE
- MaxCell processing does NOT exist. Never reference it.
- Public Bank Access is NOT free or included. Paid add-on ($299, or free with CB&T only).
- Do NOT say "standard-of-care" or "FDA-approved" for cord blood treatments.
- StemCyte-sponsored clinical trials: 3 (not 7). No "FDA-approved StemCyte trials" language.
- REGENECYTE® always with ® symbol.

---

## FILE STRUCTURE
```
src/
  components/       # .astro components (Nav, Footer, shared UI)
  components/islands/ # React components for interactive parts (forms, physics, canvas)
  layouts/          # BaseLayout.astro (global wrapper)
  pages/            # .astro page files (file-based routing)
  styles/           # global.css
public/
  images/           # All static images
  robots.txt
  llms.txt
```

---

## HERO PATTERN (all pages with dark hero)
```astro
<section id="hero" class="hero">
  <Image src="/images/Hero_X.jpeg" alt="..." class="hero-bg" />
  <div class="vig"></div>
  <div class="ct">
    <!-- hero content -->
  </div>
</section>
```
The `id="hero"` is required — Nav uses it for scroll detection (transparent → cream). Pages without `id="hero"` get solid cream nav automatically.

---

## REACT ISLANDS
Interactive components live in `src/components/islands/` as `.jsx` files. Use them in `.astro` files with hydration directives:
- `client:visible` — loads when scrolled into view (preferred for most)
- `client:load` — loads immediately (for above-fold forms)

Example:
```astro
---
import PricingForm from '../components/islands/PricingForm.jsx';
---
<PricingForm client:load />
```
