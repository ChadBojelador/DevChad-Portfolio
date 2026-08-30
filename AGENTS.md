# Repository Guidelines

## Project Structure & Module Organization

This workspace contains the `Web-Portfolio/` application. Work from that directory for all development commands. The Vite/React client lives in `Web-Portfolio/src/`: reusable UI is in `Components/`, route-level views are in `pages/`, static content is in `data/`, styles are in `Styles/`, and images/video are in `assets/`. Serverless chat endpoints are in `Web-Portfolio/api/`; public, directly served files belong in `public/`. Planning and implementation notes are kept in `docs/` and the root Markdown files of the application.

## Build, Test, and Development Commands

Run commands from `Web-Portfolio/`:

- `npm install` installs the locked dependencies.
- `npm run dev` starts the Vite development server.
- `npm run build` creates the production bundle.
- `npm run preview` serves the built bundle locally for a final check.
- `npm run lint` runs ESLint across the project.

Inspect `package.json` before adding a new script; keep tooling consistent with the existing Vite, Tailwind, and ESLint setup.

## Coding Style & Naming Conventions

Use JavaScript/JSX with two-space indentation, semicolons, and single quotes where the surrounding file does. Name React components and component files in PascalCase (`ProjectPanel.jsx`); use camelCase for utilities and data modules (`chatContext.js`). Keep component-specific CSS close to the existing `src/Styles/` convention and avoid duplicating shared styling. Prefer small, focused components and data-driven rendering over repeated markup.

## Testing Guidelines

There is currently no dedicated automated test suite. At minimum, run `npm run lint` and `npm run build` before submitting changes. Manually verify responsive behavior and affected routes with `npm run dev`. If adding tests, place them beside the feature or in a clearly named test directory and use descriptive names such as `Navigation.test.jsx`.

## Commit & Pull Request Guidelines

Keep commits focused and use short, imperative subjects, for example `Add certificate filter` or `Fix chat API fallback`. Pull requests should explain the user-visible change, note configuration or API impacts, link relevant issues, and include screenshots or a short recording for UI changes. Never commit secrets: keep local values in ignored environment files such as `contact.env`.

## Portfolio Product Brief

Build a personal, single-page portfolio for Chad, positioned for AI Engineer roles. The primary audience is recruiters. The experience should quickly establish Chad's focus on full-stack AI applications, then make About, Projects, and early-career Experience easy to scan.

### Experience Direction

- Use a light theme by default and offer an optional dark theme. Persist the user's theme preference.
- The visual language is cute, futuristic, and polished: restrained glassmorphism, soft depth, rounded forms, translucent surfaces, and gentle Apple Motion-inspired animation.
- Keep animation subtle and purposeful: floating, fades, blur transitions, and small hover feedback. Respect `prefers-reduced-motion`.
- Design mobile-first and verify every section, navigation control, and interaction at narrow viewport widths.
- Use the future mascot only in the welcome screen initially. It may later be incorporated into the hero; do not invent a mascot asset or character design before one is supplied.

### Welcome Screen

- Show the welcome screen once per browser session, before the portfolio content.
- Present the exact prompt: "Are you in the mood for music?"
- Offer two choices: "I'm in the mood" and "I'm not in the mood".
- Choosing the first option starts the supplied background audio and enters the portfolio. Choosing the second enters silently.
- Provide a clearly discoverable mute/unmute control after entry. 

### Required Sections

Implement the portfolio as one scrolling page with anchored navigation:

1. Hero - use the working headline: "Meet Chad! An AI Engineer that made an impact." Include a concise AI Engineer positioning statement and primary recruiter-facing calls to action.
2. About - short professional bio plus an easy-to-scan tools/technology list.
3. Projects - data-driven cards that support a title, summary, stack, image, GitHub link, live demo, and optional case-study link. Leave clear placeholder states until project information is supplied.
4. Experience - early-career timeline or cards for hackathons and certifications. Do not fabricate employers, achievements, dates, or credentials.
5. Contact - LinkedIn, GitHub, and email links. Use placeholders or omit individual links until their real destinations are provided.

### Deferred Functionality

- A real AI chatbot is planned for a later phase. Do not add a client-side API key, server endpoint, chatbot UI, or provider dependency until Chad supplies the desired provider, content scope, and deployment configuration.
- When implemented, all model calls must go through a server-side endpoint with credentials held only in environment variables; never expose keys in the Vite client bundle.

### Delivery Checks

- Preserve the existing Vite/React stack and current project conventions.
- Keep portfolio content in editable data modules where appropriate rather than hard-coding repeated cards.
- Test keyboard navigation, visible focus states, color contrast, theme switching, welcome-screen session behavior, audio mute control, and responsive layouts before delivery.
