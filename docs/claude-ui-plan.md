# Claude-Inspired UI Plan

## Goal

Reframe the portfolio as a calm, conversational workspace inspired by Claude's visual language: warm neutrals, strong reading hierarchy, generous whitespace, and a focused chat-first experience. This is inspiration, not a pixel-for-pixel copy; retain the portfolio identity, content, and accessibility.

## Design Direction

- **Palette:** warm off-white page background, near-black text, muted gray borders, and one restrained terracotta/orange accent. Define reusable color variables in the global stylesheet.
- **Typography:** use a highly legible sans-serif system stack. Favor 16px body copy, comfortable line height, and clear title/subtitle contrast.
- **Surfaces:** use subtle 1px borders, 10–14px corner radii, and minimal shadows. Avoid gradients, glowing effects, and competing accent colors in the main workspace.
- **Motion:** preserve only purposeful feedback (message streaming, button hover, panel transitions); respect `prefers-reduced-motion`.

## Layout

1. Update `src/Components/AppShell.jsx` to provide a persistent desktop sidebar and a compact mobile header.
2. Use the sidebar for identity, primary navigation, and a small status/footer area. The active route should be obvious through a filled or tinted state.
3. Make each route a centered reading column (`max-width` about 760–900px) with consistent vertical spacing.
4. Redesign `src/Components/PortfolioChat.jsx` as the focal interaction: conversation above, sticky rounded composer below, compact prompt suggestions for empty state, and clear loading/error states.
5. Restyle Projects, Certificates, Tools, and Contact pages as editorial content with simple bordered cards rather than dense panels.

## Implementation Sequence

1. Inventory existing components and consolidate global tokens in `src/Styles/index.css`.
2. Build the shell, responsive navigation, and page container before changing page-specific content.
3. Implement the chat layout and validate the client/API development flow.
4. Restyle one page at a time, preserving routes and data modules under `src/data/`.
5. Remove superseded CSS only after visual comparison confirms no remaining dependency.

## Acceptance Checks

- Mobile navigation works at 768px and below; keyboard focus is visible everywhere.
- Text, borders, buttons, and error states meet accessible contrast expectations.
- Existing routes, chat behavior, and content continue to work.
- Run `npm run lint`, `npm run build`, and manual checks with `npm run dev` (plus `npm run dev:api` for chat changes).
