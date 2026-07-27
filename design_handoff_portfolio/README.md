# Handoff: CS Portfolio Site (Persona-Inspired)

## Overview
Single-page personal portfolio for Aadhitya Balaji (CS/Data Science student, UW–Madison). Visual language is inspired by Persona 3 Reload's menu UI (bold type, angular/diagonal accents, a rotating "glass shard" motif) but restrained for a professional engineering portfolio — not a literal recreation of any game UI.

## About the Design Files
The bundled file (`Portfolio.dc.html`) is a **design reference built in HTML** — a working prototype showing intended look, layout, and interaction, not production code to copy as-is. The task is to **recreate this design in your target codebase's environment** (React, Vue, plain JS, etc.), using your project's existing conventions — or choose the most appropriate framework if this is a fresh project.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and interactions below are final; recreate pixel-close.

## Screens / Views
Single scrolling page, six sections, each `min-height` ~viewport-tall with generous vertical padding (140–160px top/bottom).

1. **Hero (Intro)** — Left-aligned: small eyebrow row (44px line + "PORTFOLIO // 2026" label), large name headline "Aadhitya Balaji" (light-weight, ~48–116px responsive via `clamp`), role/tagline row, one-line description, two buttons (solid "View Projects" with angled clipped corner, outlined "Get in Touch"), then a small "01 — Intro" scroll marker below the buttons in normal flow (not absolutely positioned, to avoid overlap at short viewports).

2. **About** — Number "02" + heading "About". Two-column responsive grid (`auto-fit, minmax(280px,1fr)` — stacks to one column on narrow viewports): left column is a stat list (Education/Majors/GPA as label→value rows with bottom borders); right column is two paragraphs of bio copy plus 4 tag chips (outlined, blue text).

3. **Skills** — Number "03" + heading "Skills". Responsive grid of 5 category cards (Languages, ML & Data Science, Cloud & DevOps, Data & Web, AI Tooling), each a plain dark panel with a blue category label and a list of skill items (small bullet + text). No background box behind the grid (removed per feedback — just the section's base background shows through the 2px gaps).

4. **Projects & Research** — Number "04" + heading. Single-column layout, **card stack first, then description below** (cards are compact, ~200px tall, capped at 380px wide): 3 overlapping rotated cards (numeral + title, small blue folded-corner triangle) that the user **clicks to cycle** — front card animates out/down then re-settles at the back of the stack (two-phase "shuffle" transition, ~320ms kick-out then ~450ms cubic-bezier settle). Below the stack: role label (blue), project title, summary paragraph, tag chips, and date range — all crossfade when the front project changes. No "metric" callout line (removed per feedback — was flagged as unnecessary data). Small progress dots under the text indicate position in the 3-card cycle.

5. **Experience** — Number "05" + heading "Experience". Vertical timeline: a thin left rail line with small rotated-diamond markers per entry (org name + period on one line, role in blue below, description paragraph). 4 entries: PickleIQ, Wisconsin Consulting Club, UW-Madison Comp Bio & ML Lab, Leadership Initiatives.

6. **Contact** — Number "06" + heading "Let's Build Something." (large, light-weight). One-line pitch paragraph. Three buttons (Email/LinkedIn/GitHub, same style as hero). **Plain-text email directly below the buttons** (`aadhi.balaji07@gmail.com`, `user-select: all` so one click selects it for copy-paste — this was an explicit requirement, don't rely on the mailto link alone). Footer row with location + copyright.

## Interactions & Behavior

- **Left tick nav** (fixed, vertical center, left:28px): one small pill per section, active one wider (34px vs 18px) and blue; click scrolls smoothly to that section.
- **Top-right tab bar** (fixed, top:28px right:28px): text labels (Intro/About/Skills/Projects/Experience/Contact) with a sliding 2px blue underline under the active tab; click scrolls smoothly to that section. Both this and the left nav drive off the same `active` state and the same `scrollTo(sectionKey)` handler.
- **Active-section detection**: NOT purely IntersectionObserver (found unreliable near boundaries in testing) — computed every scroll-tick by checking which section's `getBoundingClientRect()` spans a fixed line at `window.innerHeight * 0.4`. IntersectionObserver (threshold 0.2) is still used only to trigger each section's one-time fade/slide-in reveal.
- **Scroll-reveal**: each section's inner content wrapper starts at `opacity:0, translateY(36px)` and transitions to `opacity:1, translateY(0)` over ~0.8s the first time it's scrolled into view (state persists — doesn't re-hide on scroll-out).
- **Cursor**: custom ring (18px circle, blue border, `mix-blend-mode: difference`) + small solid dot, both tracking real mouse position via a `mousemove` listener (no added lag/easing — the user explicitly wants it to track 1:1). Ring grows to 38px and turns off-white when hovering any `[data-hoverable]` element. Real system cursor is hidden via `cursor: none` on `body` (pointer:fine media query only, so touch devices keep native behavior).
- **Progress bar**: 3px fixed top bar, blue fill width = scroll percentage.
- **"Glass shard" motif**: a fixed, semi-transparent faceted polygon (irregular 7-point `clip-path`) anchored off the right edge of the viewport, ~40vw/56vh, containing the active section's name in large faint uppercase text (skewed -8deg, no counter-rotation — text tilts with the shard). Rotation and a `hue-rotate` filter are driven continuously by overall scroll percentage (`rotate: -8 + scrollPct/100 * 22deg`), NOT stepped per-section — this was specifically requested to avoid jarring jumps at section boundaries. All section content has right-padding (`clamp(290px, 39vw, 440px)`) tuned so nothing overlaps the shard's real footprint (shard's left edge ≈ `100vw - 34vw` given its `width:40vw; right:-6vw` positioning — if you resize the shard, recompute this clearance to match).
- **Project card stack click**: `advanceStack()` — sets a `shufflingIdx` flag on the current front card (kicks it to `translate(70px,50px) rotate(18deg) scale(0.85)` , opacity 0.4) for 320ms, then reorders the array and clears the flag, landing the card at the back position. Cards are keyed by stable project index (not by stack position) so the same DOM node animates continuously across the reorder.

## State Management
- `active` (string): current section key, drives both nav variants + shard label.
- `visible` (map): which sections have completed their reveal-in animation.
- `scrollPct` (0–100): drives progress bar + shard rotation/hue.
- `projectOrder` (array of 3 indices) + `shufflingIdx`: drive the project card stack.

## Design Tokens
- **Background**: `#0b0b0c` (primary), `#111113` (alternating section band)
- **Text**: `#f2f0ea` (primary, warm off-white), various `rgba(242,240,234, 0.4–0.8)` for secondary/muted
- **Accent**: `#4a7de3` (blue — used for links, active states, numerals, borders)
- **Fonts**: Inter (weights 200–800) for everything — headings use weight 300 at large sizes (`clamp(28px,3.4vw,40px)` for section titles, up to `clamp(48px,8vw,116px)` for the hero name), body copy 14–20px weight 400, labels/eyebrows 10–12px weight 600–700 with `letter-spacing: 0.05–0.28em`
- **Section padding**: `140–160px` vertical, `clamp(140px,9vw,220px)` left / `clamp(290px,39vw,440px)` right (right side wider to clear the fixed shard)
- **Buttons**: solid blue with angled clipped bottom-right corner (`clip-path: polygon(0 0,100% 0,100% 70%,94% 100%,0 100%)`) for primary; 1px outline for secondary

## Assets
No images/icons used — everything is CSS (gradients, clip-path polygons, borders). No external assets to hand off.

## Files
- `Portfolio.dc.html` — the complete single-file design/prototype. Template + logic are both inline in this file (search for `class Component extends DCLogic` for the behavior/state logic).
