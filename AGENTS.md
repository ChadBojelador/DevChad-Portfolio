# Repository Guidelines

## Project Structure & Module Organization

This React 19 portfolio uses Vite. Entry and routing live in `src/main.jsx`; pages, UI, and styles are in `src/pages/`, `src/Components/`, and `src/Styles/`. Keep content in `src/data/` and media in `src/assets/` or `public/`. The `api/` directory contains the Vercel chat endpoint.

## Build, Test, and Development Commands

- `npm install` installs locked dependencies from `package-lock.json`.
- `npm run dev` starts the Vite client with hot reload.
- `npm run dev:api` watches and runs the local chat API on the configured port; run it alongside `npm run dev` when changing chat features.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the production bundle locally.
- `npm run lint` runs ESLint across JavaScript and JSX. Run it before submitting changes.

There is no automated test suite. Verify UI changes in the browser and run both `npm run lint` and `npm run build` before opening a pull request. Add focused tests for new non-visual logic.

## Coding Style & Naming Conventions

Use ES modules, two-space indentation, single quotes, and semicolons in application source. Name components in PascalCase (`ProjectPanel.jsx`) and helpers/data modules in camelCase (`chatContext.js`). Keep data separate from rendering. Follow existing CSS naming and place styles in `src/Styles/` unless the component owns a colocated stylesheet. Address ESLint errors rather than disabling rules.

## UI Redesign Documentation

For the Claude-inspired redesign, treat `docs/claude-ui-plan.md` as the scope and acceptance criteria. Follow its order: tokens and shell, then chat, then route pages. Do not use Claude branding or copy it pixel-for-pixel. Update `sessions.md` after each verified session: add the dated entry at the top, record validation, update status, and mark completed checklist items. Keep both documents accurate as decisions change.

## Security & Configuration

Do not commit secrets. Local environment files (`.env`, `*.local`) are ignored; keep API keys and chat settings there. Treat `contact.env` as sensitive and never expose server-only variables in client code. Update Vite proxy settings and API port configuration together when changing local chat networking.

## Commit & Pull Request Guidelines

Use concise Conventional Commit-style subjects, such as `feat: implement project showcase page` or `fix: update Node.js runtime configuration`. Keep commits scoped to one change. Pull requests should explain the result, link the relevant issue when applicable, include screenshots or a recording for visual changes, and state validation performed.
