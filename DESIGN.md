---
version: alpha
name: Team Planner — Paper and Ink
description: A calm, information-dense planning workspace with neutral surfaces, understated Manrope typography and an ink-blue interaction accent.
colors:
  primary: '#284f83'
  on-primary: '#ffffff'
  background: '#f6f6f4'
  surface: '#ffffff'
  surface-secondary: '#eaece9'
  foreground: '#282b30'
  muted: '#60656c'
  border: '#d5d9d6'
  accent-soft: '#e1e7ef'
  primary-dark: '#a6c7ee'
  on-primary-dark: '#242628'
  background-dark: '#242628'
  surface-dark: '#393d40'
  surface-secondary-dark: '#2e3133'
  foreground-dark: '#eceeed'
  muted-dark: '#b8bebb'
  border-dark: '#535b58'
  accent-soft-dark: '#34475e'
typography:
  brand:
    fontFamily: Manrope Variable
    fontSize: 1.5rem
    fontWeight: 500
    lineHeight: 2rem
  page-title:
    fontFamily: Manrope Variable
    fontSize: 1.25rem
    fontWeight: 500
    lineHeight: 1.75rem
  section-title:
    fontFamily: Manrope Variable
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.5rem
  body:
    fontFamily: Manrope Variable
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Manrope Variable
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.625
  metadata:
    fontFamily: Manrope Variable
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1rem
rounded:
  text-link: 2px
  base: 4px
  field: 6px
  panel: 8px
spacing:
  xs: 4px
  sm: 8px
  compact: 12px
  md: 16px
  lg: 24px
components:
  page:
    backgroundColor: '{colors.background}'
    textColor: '{colors.foreground}'
    typography: '{typography.body}'
    padding: '{spacing.lg}'
  page-dark:
    backgroundColor: '{colors.background-dark}'
    textColor: '{colors.foreground-dark}'
  board-column:
    backgroundColor: '{colors.surface-secondary}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.panel}'
    padding: '{spacing.md}'
  board-column-dark:
    backgroundColor: '{colors.surface-secondary-dark}'
    textColor: '{colors.foreground-dark}'
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.foreground}'
  card-dark:
    backgroundColor: '{colors.surface-dark}'
    textColor: '{colors.foreground-dark}'
  metadata:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.muted}'
    typography: '{typography.metadata}'
  metadata-dark:
    backgroundColor: '{colors.surface-dark}'
    textColor: '{colors.muted-dark}'
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
  button-primary-dark:
    backgroundColor: '{colors.primary-dark}'
    textColor: '{colors.on-primary-dark}'
  text-area:
    backgroundColor: '{colors.surface-secondary}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.field}'
  text-area-dark:
    backgroundColor: '{colors.surface-secondary-dark}'
    textColor: '{colors.foreground-dark}'
  drop-indicator:
    backgroundColor: '{colors.accent-soft}'
    textColor: '{colors.primary}'
  drop-indicator-dark:
    backgroundColor: '{colors.accent-soft-dark}'
    textColor: '{colors.primary-dark}'
  separator:
    backgroundColor: '{colors.border}'
    height: 1px
  separator-dark:
    backgroundColor: '{colors.border-dark}'
    height: 1px
---

# Team Planner design system

## Overview

Team Planner is a working tool for the fictional Fjord Systems team. Its visual
identity is neutral paper and ink: quiet, professional and readable during repeated
planning work. Cards, labels and relationships carry the hierarchy; decoration
should not compete with the work items.

This is the starting point for every new component and interaction. It records the
existing visual direction and the interaction requirements we are implementing.
The first edition is a draft for review with Alessandro, not a new visual redesign.
Interaction requirements below are contracts, not claims that every flow is finished.

Use HeroUI 3 styled components for controls and React Aria for collection and drag
interactions. Use Tailwind CSS 4 for layout and small adaptations. Reuse the board's
existing components before adding another implementation of the same pattern.

Format and linting follow [Google Labs DESIGN.md](https://github.com/google-labs-code/design.md)
and its [alpha specification](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md).
The format documents a design system; it does not require Material Design or a
Stitch account. The Stitch `extract-design-md` skill is available for source-code
extraction; creating and maintaining this document does not require installing it.

## Colors

The light palette is neutral off-white with white cards and a single ink-blue
interaction accent. Dark mode uses layered charcoal rather than pure black.
The YAML tokens above describe both modes; `-dark` entries are theme alternatives,
not extra colors to combine with the light palette.

| Role / CSS token       | Light     | Dark      | Application                                     |
| ---------------------- | --------- | --------- | ----------------------------------------------- |
| `--background`         | `#f6f6f4` | `#242628` | Page foundation                                 |
| `--surface`            | `#ffffff` | `#393d40` | Cards and dialogs                               |
| `--surface-secondary`  | `#eaece9` | `#2e3133` | Columns, properties panels and textarea fill    |
| `--foreground`         | `#282b30` | `#eceeed` | Primary text                                    |
| `--muted`              | `#60656c` | `#b8bebb` | Helper text, counts and metadata                |
| `--border`             | `#d5d9d6` | `#535b58` | Dividers and input boundaries                   |
| `--accent` / `primary` | `#284f83` | `#a6c7ee` | Primary actions, focus and interactive emphasis |
| `--accent-foreground`  | `#ffffff` | `#242628` | Text on primary actions                         |
| `--accent-soft`        | `#e1e7ef` | `#34475e` | Drop target and soft interactive emphasis       |

Runtime tokens live in `src/app/globals.css`. Change this document and the runtime
tokens together when a palette decision changes. No generated CSS pipeline is
configured: editing this Markdown alone does not change the running application.

Use HeroUI semantic colors for status: Low priority is `success`, Medium is
`warning`, High is `danger`. Bug uses `danger`, User story uses `accent`, Task uses
`default`. Preserve the kit's light/dark values instead of inventing parallel hex
palettes. Always include a visible label; color alone does not communicate status.

Body text must meet WCAG AA contrast. Do not use the subtle separator color as
text. Interactive field boundaries and focus indicators must also remain
perceivable in both themes; check their actual adjacent colors during UI review.

## Typography

Use locally bundled **Manrope Variable** throughout, with a sans-serif fallback.
The character is understated and human, not heavy or promotional. Default to
regular 400; use medium 500 for the brand, page title and section headings.

- Brand: 24px / 32px, medium. It is not the page h1.
- Page h1: 20px / 28px, medium; column headings: 16px / 24px, medium.
- Card titles: regular, using HeroUI's Card sizing. Wrap long titles naturally.
- Descriptions and form copy: typically 14px, relaxed line height for prose.
- IDs, dates and secondary labels: 12px. Keep actual input text at least 16px on
  small screens, following HeroUI's responsive field typography.

Keep sentence case and left alignment. Preserve user-entered line breaks in
descriptions and comments and allow long words to wrap. Use real heading levels
for structure; do not emulate them with larger paragraphs.

## Layout

Use a fluid, full-width app shell with 24px page padding and a minimum viewport
height. The header groups the brand on the left and theme control on the right;
the source link sits bottom-right. Avoid a marketing-page max-width wrapper.

The base spacing unit is 4px. Prefer 8px for related inline elements, 12px for card
gaps, 16px for column padding/board gaps and 24px for larger sections. Place helper
text close to its input; separate instructions from the field group.

- Board order: New, Active, Blocked, Resolved, Closed.
- Board grid: one column below 768px, two from 768px, five from 1280px.
- Keep the board order in the DOM and allow card content to wrap. Never squeeze
  five columns onto a phone or introduce horizontal page overflow.
- Detail dialog: viewport-bounded height; desktop maximum width 72rem and height
  85dvh from the `sm` breakpoint. At `md`, use a flexible description/comments area
  and a 15rem properties panel. Stack these areas below `md`.
- Blocked reason dialog: compact HeroUI `sm` size, scroll inside; title, body and
  footer remain distinct. The textarea currently provides five visible rows.

Use a Modal for a focused, short task such as entering a blocking reason. Use the
detail Modal for inspecting an item. Use inline messages for field errors and a
Toast for operation outcomes. A required input is not a Toast or a tooltip.

## Elevation & Depth

Differentiate page, column and card through tonal layers first. Columns use the
existing `shadow-md`; retain HeroUI's card and overlay elevation rather than adding
another shadow system. A thin accent ring marks card hover/focus without layout
shift. Dialog backdrops dim the board so the active task is clear.

The custom title underline and drop-indicator transitions last 120ms. Respect
`prefers-reduced-motion` and remove these nonessential transitions in that mode.
Avoid decorative animations, gradients or glass effects in the working board.

## Shapes

The runtime radius base is 4px. Columns and secondary panels use 8px corners;
fields derive a 6px radius from the base; text-like title actions use 2px.
Cards, chips, avatars and dialogs otherwise retain their HeroUI shape language.
Do not assign the base radius directly to every component.

The drag preview and placeholder must use the actual card's measured dimensions
and radius. Keep clipping scoped to the preview/drag source; do not clip keyboard
focus indicators across the board.

## Components

### Work item cards and columns

Reuse `WorkItemCard` and the shared type/priority/assignee components. Show kind
and ID above the title; assignee and priority share a wrapping footer separated
by a subtle divider. Keep avatar initials alongside a readable name, or show
Unassigned. Only the title opens details; the card body remains available for DnD.

Each column has a visible heading, count and a list labelled by that heading.
An empty column says “No work items” and remains a usable drop target. Use the
same full-size card in the drag preview, hide the source during dragging, and
show a card-sized dashed accent placeholder at the insertion position.

Pointer and keyboard moves follow the same state/order rules. Keep the existing
keyboard Move card action discoverable on focus, preserve meaningful focus after
moving or cancelling, and announce destination and position to screen readers.

### Dialogs, forms and actions

Use HeroUI's Modal composition: CloseTrigger, Header/Heading, Body, Footer.
Primary Confirm and secondary Cancel belong in the footer. Keep room beside the
title for the close control and keep long content scrolling inside the dialog.

Compose fields with TextField, TextArea/Input, Description and FieldError as
needed. Prefer a visible Label. The compact Blocked dialog deliberately omits the
redundant visible “Reason” label because its instruction immediately identifies
the only field; retain the accessible name “Reason”. Do not generalize hidden
labels to multi-field forms or replace labels with placeholders.

Textarea fill uses surface-secondary with a visible border using the border token;
keep the kit's focus/error states. A field must not disappear into the dialog
surface. General comments use three rows and a 2000-character maximum; the draft
must be nonblank after trimming before it can be submitted.

Entering Blocked from another state is provisional. Keep the original card in
place while collecting a reason; require **20–2000 characters after trimming**.
Reordering within Blocked does not ask for another reason. Disable Confirm while
invalid, validate again in the handler, and show actionable field feedback without
an error on initial opening. Repeat validation at the server boundary when writes
are implemented.

Blocked uses `isDismissable={false}`: clicking the backdrop does not cancel.
Cancel, the close control and Escape discard the request without moving the card
or adding a comment. Confirm adds the reason once to that item's normal Comments
and completes the saved destination/order. Comments and drafts must survive
cross-column remounts. Announce success/cancellation with the planned HeroUI Toast;
do not claim database persistence while changes are still local.

### Theme, feedback and loading

Follow the system theme until a manual choice is saved. Preserve the existing
pre-paint theme bootstrap and usable behavior when browser storage is unavailable.

When adding data flows, distinguish loading, empty, validation, save failure and
success. Initial loading uses HeroUI Skeleton matching the final layout; background
updates keep usable content visible. Associate errors with their fields and mark
busy regions accessibly. Saved changes, failures and cancellations must not produce
duplicate Toasts or discard an unsent draft on failure.

## Do's and Don'ts

- Start new UI work by reading this file and the nearest existing component.
  Describe the intended user action and its success, error and cancellation states.
- Reuse HeroUI and React Aria primitives, semantic tokens and existing work-item
  components. Avoid a second UI kit or a bespoke control for an existing primitive.
- Keep English UI copy short and concrete. Prefer action labels that describe what
  happens and pair icon-only controls with an accessible name.
- Check both themes, wrapping content, touch targets, keyboard focus and reduced
  motion. Ask Alessandro before using browser automation or Chrome DevTools tests.
- Do not infer that source-level styling or DESIGN.md lint proves rendered
  accessibility. Browser and interaction review are separate checks.
- When changing a design decision, update this file and its implementation
  together, then run `pnpm design:lint` and the relevant code checks. Review new
  design decisions with Alessandro; do not silently redesign established patterns.
- Keep implementation progress and unfinished task lists in the handoff under
  `~/Desktop/PP/`, not here.
