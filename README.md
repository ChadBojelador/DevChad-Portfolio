# Chad's Portfolio

Get to know me through an interactive portfolio of my AI projects, team experiences, and the ideas I’m building next.

Built for recruiters and collaborators, this site shares my work as an aspiring AI Engineer through product stories, early-career milestones, and a playful futuristic visual style.

## Highlights

- A welcome screen with optional background music and light/dark mode
- Responsive single-page portfolio with About, Projects, Early Chapters, and Contact sections
- Interactive GInsights project story with a walkthrough and testable prototype
- Early Chapters roadmap for IThink, hackathons, competitions, and industry connections
- Subtle glassmorphism, motion, and accessible keyboard controls
- A streaming semantic portfolio assistant backed by FastAPI, Gemini, and Supabase pgvector

## Built with

- React
- Vite
- GSAP
- OGL
- CSS

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal.

## Portfolio assistant setup

The chat is deliberately server-side: browser code never receives Gemini or Supabase credentials.

1. Create a Supabase project and run [api/schema.sql](api/schema.sql) in its SQL editor.
2. Copy `.env.example` to a private `.env` file and fill in the backend values.
3. Install the Python service dependencies: `python -m pip install -r api/requirements.txt`.
4. Run `python scripts/ingest_portfolio.py` whenever files in `knowledge/` change.
5. Run `uvicorn api.main:app --reload --port 8000 --env-file .env` in a second terminal, then run `npm run dev`.

`knowledge/` is the source of truth for chatbot facts. It uses small, meaningful records instead of embedding pages. Update it alongside portfolio content, then rerun ingestion. The Vite proxy maps the frontend's `/api/chat` requests to FastAPI during local development; set `VITE_CHAT_API_URL` when deploying the API separately.

The Gemini migration retains the existing 1,536-dimension vector schema. Run `python scripts/ingest_portfolio.py` before using chat so the existing OpenAI embeddings are replaced with Gemini embeddings.

## Scripts

```bash
npm run dev      # Start the development server
npm run lint     # Check source files with ESLint
npm run build    # Create a production build
npm run preview  # Preview the production build locally
```

## Project structure

```text
src/
  Components/  Reusable interface components
  Styles/      Shared component styles
  data/        Editable portfolio content
  App.jsx      Application layout and interactions
public/        Images, audio, and project prototype assets
```

## Notes

Portfolio content and early-chapter milestones are designed to be easy to update from the data modules in `src/data/`.
