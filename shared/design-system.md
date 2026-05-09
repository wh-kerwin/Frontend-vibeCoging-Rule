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

## Component Layers

- Primitive: button, input, dialog, popover, table.
- Pattern: search bar, filter panel, entity card, page header.
- Feature: user list, order editor, billing settings.

Primitive components cannot import feature code.

## UI State Standard

Every async feature view supports:

- Loading: skeleton or stable reserved space.
- Empty: action-oriented copy.
- Error: retry when possible.
- Success: main content.
- Optimistic state: only when rollback is obvious.

