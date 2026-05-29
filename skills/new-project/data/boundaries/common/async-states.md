# Async UI State Standard

Every feature view that touches async data must explicitly handle four states. Cross-cutting rule — applies to every stack.

## The Four States

| State | When | What to render |
|---|---|---|
| **Loading** | Request is in flight, no prior data | Skeleton with reserved space (not a generic spinner unless the surface is too small for a skeleton) |
| **Empty** | Request succeeded with no data | Action-oriented copy + a single primary call-to-action |
| **Error** | Request failed | User-safe message + retry action when the failure is recoverable |
| **Success** | Request succeeded with data | The main content |

## Optimistic State (Optional)

Add an optimistic state **only** when rollback is obvious and cheap — e.g., toggling a like button, renaming an item. If rollback would lose user work, skip optimism and show a loading state on the affected control.

## Don'ts

- Do not show only the success path. Loading/empty/error are not optional.
- Do not put a generic full-page spinner over a layout that has stable structure (header, sidebar). Reserve space and skeleton the dynamic region instead.
- Do not surface raw error objects. Render `error.message` from an `AppError`. See `boundaries/common/coding-style.md` for the error contract.
- Do not log the user out on every 401. Distinguish session-expired (re-auth flow) from forbidden (show error, keep session).

## Reduced Motion

Skeleton shimmer and any state-transition animation must respect `prefers-reduced-motion: reduce`. Fall back to a static placeholder.

## Mobile / Touch Surfaces

Loading skeletons and error states must remain reachable above the keyboard on mobile. Empty-state CTAs are part of the 44px touch-target rule.

## Verification

For each feature view, you should be able to answer:

1. What renders when the request takes 3 seconds?
2. What renders when the response is `[]`?
3. What renders when the request returns 500?
4. What renders when the request returns 401?

If you can't answer, the view is incomplete.
