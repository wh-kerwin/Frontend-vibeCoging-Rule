# DESIGN.md

This file defines the visual direction for AI-assisted UI generation in this project. It is intentionally written in plain Markdown so coding agents can read it before building pages, components, and design-system tokens.

## 0. How To Use This File

Default selected inspiration: **VoltAgent** from `VoltAgent/awesome-design-md`.

When starting a new project, choose one design reference:

- `VoltAgent`: developer tool, AI agent, CLI, technical dashboard, docs-heavy product.
- `Vercel`: precise monochrome SaaS, deployment platform, infra dashboard.
- `Linear`: productivity app, issue tracker, elegant dense workspace.
- `Supabase`: backend platform, database console, open-source developer product.
- `Cursor`: AI coding product, dark editor-like interface.
- `Notion`: knowledge base, workspace, calm document-first product.
- `Stripe`: payment, fintech, polished API/product marketing.
- `Apple`: premium consumer product, image-led landing page.
- `Airbnb`: marketplace, travel, lifestyle product with strong photography.

If the user names a different project from `https://github.com/VoltAgent/awesome-design-md`, use that project's `DESIGN.md` as the main visual reference and preserve the engineering guardrails below.

## 1. Vibe Coding Design Philosophy

The UI should feel fast, intentional, and technically confident. It should not look like a generic template. Every screen must make the product's job obvious within the first viewport, and every component should be easy for an AI agent to reproduce consistently.

Core principles:

- Build the actual usable interface first, not a decorative landing shell.
- Prefer dense but readable layouts for tools, dashboards, editors, consoles, and admin systems.
- Use visual hierarchy through spacing, contrast, typography, and state, not random decoration.
- Keep the design tokenized so Vue, React, Electron, and React Native implementations can share the same taste.
- Make async states beautiful enough to ship: loading, empty, error, success.
- Keep interaction states explicit: hover, focus, active, disabled, selected, loading.

## 2. Selected Design Reference: VoltAgent

Use this when the product is a developer-facing tool, AI platform, automation system, coding workspace, agent console, observability surface, or internal technical product.

### Atmosphere

The interface should feel like a focused engineering command center: dark, quiet, technical, and alive with a single high-signal accent. It should be closer to a precise IDE or terminal dashboard than a friendly SaaS homepage.

Visual mood:

- Near-black canvas.
- Warm charcoal containers.
- Emerald accent used sparingly.
- Code, logs, diagrams, command blocks, and structured data as first-class visual content.
- Subtle glow only for active, powered-on, or selected states.
- Minimal decorative elements.

Avoid:

- Generic purple-blue gradients.
- Large pastel cards.
- Over-rounded SaaS surfaces.
- Cute illustrations.
- Random accent colors.
- Marketing-heavy split hero layouts.

## 3. Tokens

Concrete token presets live as standalone CSS files under `shared/snippets/styles/`. When `/new-project` runs, the workflow writes one of these into the generated project's `src/shared/styles/tokens.css`.

| Preset file | Suitable for | Atmosphere |
|---|---|---|
| `shared/snippets/styles/tokens.shadcn.css` | Product apps, dashboards, admin tools, content sites | shadcn `new-york` OKLCH palette — neutral, light/dark via `.dark` class |
| `shared/snippets/styles/tokens.voltagent.css` | Developer tools, AI agent platforms, observability surfaces, technical dashboards | Dark engineering command-center — near-black canvas, emerald accent |

To add a new preset (e.g. for Vercel or Linear-style reference), create another `tokens.<name>.css` next to those, then list it here and update the workflow matrix for any stack that should expose it as a Stage 2 option.

### Naming convention

Every preset must define this minimum variable surface so primitives stay portable across presets:

- `--background`, `--foreground`
- `--card`, `--card-foreground`, `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--radius`

Optional but recommended for dev-tool presets: `--surface`, `--surface-raised`, `--border-strong`, `--primary-soft`, `--warning`, `--info`.

### Radius

```css
:root {
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-pill: 9999px;
}
```

Rules:

- Cards and panels use `8px`.
- Buttons and inputs use `6px`.
- Code and inline technical containers use `4px` or `6px`.
- Pills are only for tags, badges, status labels, and compact filters.
- Do not use large rounded cards unless another selected reference explicitly requires it.

### Spacing

Use an 8px-based rhythm:

```txt
2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96
```

Rules:

- Dense surfaces may use `12-16px` internal padding.
- Main cards use `20-24px`.
- Feature sections use `64-96px` vertical rhythm.
- Dashboards should use tighter spacing than marketing pages.

## 4. Typography

Use system fonts for speed and native rendering.

```css
:root {
  --font-heading: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-body: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}
```

Scale:

| Role | Size | Weight | Line height | Use |
|---|---:|---:|---:|---|
| Display | 48-60px | 400-600 | 1.0-1.1 | First-viewport product signal |
| Page title | 32-40px | 500-600 | 1.1-1.2 | App pages, section leads |
| Section title | 24-28px | 500-600 | 1.2-1.3 | Panels and feature groups |
| Card title | 16-20px | 500-600 | 1.35-1.45 | Cards, dialogs, lists |
| Body | 14-16px | 400 | 1.5-1.65 | Reading text |
| Caption | 12-13px | 400-500 | 1.35-1.5 | Metadata |
| Code | 12-14px | 400-600 | 1.35-1.55 | Commands, logs, snippets |

For app surfaces, do not use oversized hero typography inside sidebars, cards, tables, forms, or dialogs.

## 5. Components

### Buttons

Primary technical CTA:

- Surface: `--surface`
- Text: `--primary-soft`
- Border or focus outline: `--primary`
- Radius: `--radius-sm`
- Padding: `10-12px 14-16px`
- Hover: slightly brighter text, subtle green border or background tint.

Secondary button:

- Transparent or `--surface`.
- Border: `1px solid --border`.
- Text: `--foreground`.
- Hover: `--surface-raised`.

Danger button:

- Use `--danger` only for destructive actions.
- Never use danger as decorative color.

### Cards And Panels

Default panel:

- Background: `--surface`.
- Border: `1px solid --border`.
- Radius: `--radius-md`.
- Shadow: none by default.

Active panel:

- Border: `1px or 2px solid --primary`.
- Optional soft glow only if selected or live.

Do not put cards inside cards unless the inner element is a distinct repeated item such as a row, metric, or file block.

### Inputs

- Background: `--surface`.
- Border: `1px solid --border`.
- Text: `--foreground`.
- Placeholder: `--muted`.
- Focus: visible `--focus` ring.
- Error: border/text uses `--danger`.
- Height: at least 36px on desktop and 44px on touch-first surfaces.

### Navigation

Developer-tool layout:

- Left sidebar for persistent product areas.
- Top bar for breadcrumbs, project switcher, search, and account controls.
- Command palette is encouraged for tool-heavy apps.
- Active nav state uses a green accent strip, dot, or border.

Marketing/docs layout:

- Sticky top nav.
- Dark canvas.
- Product name must be visible in the first viewport.
- Code command or product screenshot can be the primary hero object.

### Code Blocks

Code is a visual object, not filler.

- Font: `--font-mono`.
- Background: `--surface`.
- Border: `1px solid --border`.
- Radius: `--radius-sm`.
- Line numbers optional for docs.
- Copy action should be icon-based with tooltip.
- Preserve horizontal scroll on narrow screens rather than wrapping complex code.

## 6. Layout

### App Layout

Use for dashboards, consoles, editors, admin tools:

```txt
Shell
  Sidebar
  Main
    TopBar
    PageHeader
    ContentGrid / DataSurface / EditorSurface
```

Rules:

- Keep navigation predictable and compact.
- Prioritize scanability over decoration.
- Tables, forms, filters, logs, and charts should align to a consistent grid.
- Empty states should include one clear action.

### Landing / Product Page Layout

Use only when a public-facing page is needed:

- First viewport should reveal product identity, primary value, and a real product signal.
- Prefer full-bleed product screenshots, code blocks, or interactive technical scenes.
- Avoid split-card hero compositions.
- Keep a hint of the next section visible below the fold.

### Responsive

Breakpoints:

```txt
mobile: < 640px
tablet: 640px - 1023px
desktop: 1024px - 1439px
wide: >= 1440px
```

Rules:

- Mobile stacks vertically.
- Touch targets are at least 44px.
- Sidebars collapse to drawer or bottom nav depending on app type.
- Dense tables need horizontal scroll or responsive row cards.
- Code blocks scroll horizontally.

## 7. Motion

Motion should communicate state, not decorate randomly.

Use:

- 120-180ms for hover and press.
- 180-240ms for menus, popovers, dialogs.
- Slow subtle pulse only for live/active technical indicators.

Avoid:

- Large bouncing movement.
- Aggressive page transitions.
- Decorative motion that competes with content.

Respect reduced-motion preferences.

## 8. Implementation Mapping

The generated project gets one `tokens.css` file written into `src/shared/styles/tokens.css` (from `shared/snippets/styles/tokens.<preset>.css`). Every stack reads the same variables from there.

### Vue / React (Tailwind v4 + optional UnoCSS)

Token vars + `@theme inline` are the contract. Tailwind utilities (`bg-primary`, `text-muted-foreground`, etc.) read the vars automatically; UnoCSS shortcuts (`surface-card`, `focus-ring`) are defined in `uno.config.ts`. No JS theme config required.

Recommended UnoCSS shortcuts (already in the matrix-generated `uno.config.ts`):

```ts
{
  'v-stack': 'flex flex-col',
  'h-stack': 'flex items-center',
  'surface-card': 'rounded-lg border border-border bg-card text-card-foreground shadow-sm',
  'focus-ring': 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
}
```

### Electron

Renderer follows the chosen framework's design (vue/react matrix). Native window chrome, menus, and IPC status components should remain quiet and utilitarian.

### React Native

Translate the same taste without assuming web CSS:

- Dark canvas.
- Compact cards.
- Accent active states from the preset.
- 44px touch targets.
- Native typography scale.
- No hover-only affordances.

When NativeWind is selected, Tailwind utility class names work; otherwise the equivalent values come from `StyleSheet.create` and the preset's hex values.

## 9. Agent Prompt Guide

When asking an AI agent to build UI, use:

```txt
Read AGENTS.md and design.md first.
Use the selected DESIGN.md style: VoltAgent-inspired developer tool.
Build the actual usable screen, not a marketing placeholder.
Use dark technical surfaces, warm charcoal borders, restrained emerald accents, typed data states, and component boundaries from the stack architecture.
```

To switch style:

```txt
Use the <project-name> DESIGN.md from https://github.com/VoltAgent/awesome-design-md as the visual reference, but keep this repository's engineering rules from AGENTS.md and projects.rules.
```

## 10. Design Quality Checklist

- The first screen clearly communicates the product or workflow.
- Token values are centralized.
- UI includes loading, empty, error, and success states.
- Interactive states are visible.
- Text fits on mobile and desktop.
- No cards inside cards unless structurally necessary.
- No generic gradient/orb decoration.
- No unbounded custom colors.
- Layout remains usable at mobile, tablet, desktop, and wide sizes.
- The result looks like a specific product, not a generic template.
