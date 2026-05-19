# Shared Design System Rules

## Tokens

Define tokens once and map them into the stack-specific tool:

- `color.background`
- `color.foreground`
- `color.muted`
- `color.border`
- `color.primary`
- `color.primaryForeground`
- `color.danger`
- `radius.sm`
- `radius.md`
- `radius.lg`
- `space.1` through `space.12`

Concrete CSS variable presets ship in `shared/snippets/styles/`:

- `tokens.shadcn.css` — shadcn `new-york` OKLCH palette (default for product apps).
- `tokens.voltagent.css` — dark engineering command-center palette (default for dev tools, AI agents, dashboards).

Add more presets here when a new visual reference is adopted. See `design.md` for the chooser logic.

## Component Layers

- Primitive: button, input, dialog, popover, table.
- Pattern: search bar, filter panel, entity card, page header.
- Feature: user list, order editor, billing settings.

Primitive components cannot import feature code.

## UI State Standard

See `boundaries/common/async-states.md` for the canonical async UI state contract.
