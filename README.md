# curriculAIk — Frontend

React + Vite + Tailwind CSS frontend for the curriculAIk platform.

## Requirements

- Node.js 20+ (22 recommended)
- curriculaik-backend running on port 8000

## Setup

### 1. Clone and install

```bash
git clone git@github.com:sergiogrubio/curriculaik-frontend.git
cd curriculaik-frontend
npm install
```

### 2. Environment variables

```bash
cat > .env << 'ENV'
VITE_API_URL=http://localhost:8000
ENV
```

### 3. Run

```bash
npm run dev
```

App available at http://localhost:5173

## Features

- Trilingual interface: English, Spanish, Catalan
- Three visual themes: Dark Tech, Light Academic, Neutral Corporate
- Currency selector with live exchange rates (USD, EUR, GBP)
- Project management with topic list
- Material generation: notes, slides, exercises, exam
- Cost tracking per project and session
- Visual style configuration per project (colors, fonts, logo)

## Pages
/                          Projects list

/projects/new              Create new project

/projects/:id              Project detail (topics, sources, settings)

/projects/:id/topics/:id   Topic detail (generate materials)

/projects/:id/style        Visual style configuration

/projects/:id/cost         Cost report

/settings                  App settings (theme, language, currency)
