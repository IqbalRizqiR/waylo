# Waylo — Design Direction

Status: v1.0, derived from the Figma file "WORKSPACE (Copy)".
Filter on top of this file: `antislop` (root skill). This file is the soul; antislop only rejects slop.

## Design Read

Reading this as: a two-sided career and talent marketplace for Indonesian learners and company HRD teams, in a clean professional Indigo and Poppins visual language, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 1

- ENERGY 2: confident but not loud. One clear focal point per screen, generous whitespace, no decorative noise.
- RHYTHM 2: consistent card shells with deliberate breaks (stat row, chart block, split panels), not one repeated template.
- MOTION 1: hover and focus states plus data-transition states only. No scroll choreography, no bounce.

## Identity

Waylo connects career discovery, skill growth, and hiring in one ecosystem. The visual language must read as **trustworthy, structured, calm, and slightly energetic**, appropriate for students and for HRD buyers at the same time.

Identity motif: the **indigo pill nav and gradient primary action**, paired with a soft blue-tinted elevation shadow (`rgba(0,30,192,0.15)`) used consistently on every elevated surface. Repeated across learner and company hubs so a screenshot can be recognized as Waylo without the logo.

## Palette (max 2 core + 1 accent)

| Token | Value | Purpose (one line) |
|---|---|---|
| `primary` | `#001EC0` | Brand indigo. Nav, headings, links, key emphasis. |
| `cta-gradient` | `#2F59FE → #2F22D1` | Reserved for the single primary action per view, so the eye finds the one thing to do. |
| `augment` | `#2F59FE` | Secondary indigo for chart lines and active tab underlines. |
| `teal-mark` | `#0FC7A7 → #037483` | Logo mark only. Never used as a UI accent (dose cap). |
| `success` | `#01CA2C` | Positive deltas and completed states only. |
| `ink` | `#000000` | Headings on white. |
| `text-secondary` | `#444444` | Body and secondary labels. |
| `text-muted` | `#757575` | Placeholder and de-emphasized metadata. |
| `surface` | `#FFFFFF` | Card and page surface. |
| `surface-alt` | `#FCFCFD` | App background and nav shell. |
| `tile` | `#E1E5FF` | Stat tile and calendar icon backgrounds. |
| `chip-border` | `#667EFF` | Skill chip outline. |

Charts and illustrations use only `primary`, `augment`, `tile`, and neutral greys. No rainbow.

## Typography

**Poppins** (Google Fonts), weights 300 / 400 / 500 / 600 / 700, letter-spacing `-0.025em`.

Reason: Poppins is the brand typeface chosen in the source Figma. Its geometric humanist letterforms read friendly and modern, which fits an education and career product aimed at learners and HRD without looking corporate-generic. It is not the model default; it is the brand's choice.

Scale (fluid where noted):

| Role | Size / weight |
|---|---|
| Display (welcome) | clamp(2.75rem, 5vw, 4.7rem) / 500 |
| Page title | 2.25rem (36px) / 500 |
| Section title | 1.5rem (24px) / 600 |
| Card title | 1.25rem (20px) / 500 |
| Body | 1rem (16px) / 400 |
| Caption / meta | 0.8125rem (13px) / 300 |

## Shape and elevation

Radius encodes affordance, not decoration:

- Pill `46px`: buttons, nav shell, primary actions.
- Input `45px`: text fields (paired with the pill scale so forms feel native).
- Card `14px`: content containers and panels.
- Chip `18px`: skill and status chips.
- Tile `14px`: icon tiles.

Elevation: one shadow token `0 0 10px rgba(0,30,192,0.15)` marks elevated surfaces (cards, nav shell, primary CTA row). Larger `0 0 25px` is reserved for the nav shell and the auth card only. Elevation signals "interactive surface", not "everything floats".

## Icons

**MingCute** (via Iconify), matching the source Figma. One coherent set, chosen for content relevance: board, person, calendar, users, bell, search, check, forbid, lock, eye. Substitutions are only made when MingCute has no fitting glyph, and the reason is noted at the call site. No sparkle, star, magic, or robot icons.

## Imagery

- Logo wordmark and mark exported from Figma into `public/brand/`.
- Welcome and login hero photography exported from Figma into `public/brand/`.
- People avatars are **initials placeholders** until real user photos exist. Never stock faces presented as real users.

## Content honesty rules (binding)

- Every statistic shown in the UI comes from the demo seed dataset and is labeled as demo data in the README. No invented production numbers.
- No testimonials are rendered until real, attributable quotes exist. The Figma login quote is intentionally omitted.
- Every nav item points at a route that exists, or renders disabled with a visible "Segera hadir" label.
- Every data view ships empty, loading, and error states.

## Theme decision (R-21)

Waylo v1 ships a **light theme only**. Reason: the brand identity and the entire source design are built on a white/near-white surface with indigo ink, and the product is a consumer and HRD web app rather than a developer or terminal tool, so there is no strong identity reason for a dark default. No theme toggle is shipped, so no broken second mode exists (R-34). A dark theme is a tracked follow-up, not a deferred request; if added, it must be a fully working mode.

## Motion

MOTION 1. Allowed: color/opacity transitions on hover and focus (150ms), skeleton shimmer while loading, progress-bar fill. Not allowed: entrance fade-up on every element, parallax, auto-playing carousels, scale bounce.