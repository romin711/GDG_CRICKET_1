# SeniorMind AI

SeniorMind AI is a full-stack app that generates structured engineering guidance using Google Gemini.
It supports:

- Senior mode for deep technical analysis and failure-mode thinking
- Junior mode for simpler explanations
- Scale context: startup, medium, large
- Optional architecture critique input

## Project Structure

```text
.
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   ├── build/
│   └── package.json
└── README.md
```

## Tech Stack

- Backend: Node.js, Express, dotenv, CORS, @google/generative-ai
- Frontend: React 18, react-markdown, remark-gfm

## Requirements

- Node.js 18.x to 20.x
- npm
- Gemini API key from https://aistudio.google.com/app/apikey

## Setup

Install dependencies in each package directory:

```bash
cd backend && npm install
cd ../frontend && npm install
```

Create backend environment file:

```bash
cd backend
cp .env.example .env
```

Add values to backend/.env:

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash
PORT=3001
```

Optional frontend environment override (if backend is not on localhost:3001):

```env
REACT_APP_API_BASE_URL=http://localhost:3001
```

## Run

Start backend:

```bash
cd backend
npm run dev
```

Start frontend in a second terminal:

```bash
cd frontend
npm start
```

Open http://localhost:3000

## Quick Test

Check backend health:

```bash
curl http://localhost:3001/health
```

Test response generation:

```bash
curl -X POST http://localhost:3001/generate \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Design a URL shortener",
    "mode": "senior",
    "scale": "startup",
    "userArchitecture": ""
  }'
```

## API

### Health Check

- Method: GET
- Path: /health
- Response:

```json
{ "status": "ok" }
```

### Generate Engineering Response

- Method: POST
- Path: /generate
- Content-Type: application/json

Request body:

```json
{
  "query": "Design a notification system",
  "mode": "senior",
  "scale": "startup",
  "userArchitecture": "optional architecture text"
}
```

Required fields:

- query
- mode (junior | senior)
- scale (startup | medium | large)

Success response:

```json
{
  "result": "...markdown response..."
}
```

Error response example:

```json
{
  "error": "Missing required fields: query, mode, scale"
}
```

## Usage Notes

- Toggle mode to switch depth and explanation style
- Pick scale to bias recommendations for user/load size
- Use Architecture Critic to include your current design for direct critique
- Use Ctrl+Enter (or Cmd+Enter on macOS) to submit from the query box

## Troubleshooting

- 500 with API key message: verify GEMINI_API_KEY in backend/.env
- Model error: set GEMINI_MODEL to a currently supported Gemini model
- CORS/network issues: ensure backend is running and REACT_APP_API_BASE_URL is correct
- Frontend cannot reach backend: confirm backend is listening on PORT and frontend URL is using the same host

## Docker

Both apps include Dockerfiles.

Backend container:

```bash
cd backend
docker build -t seniormind-backend .
docker run --rm -p 3001:3001 --env-file .env seniormind-backend
```

Frontend container:

```bash
cd frontend
docker build \
  --build-arg REACT_APP_API_BASE_URL=http://localhost:3001 \
  -t seniormind-frontend .
docker run --rm -p 8080:8080 seniormind-frontend
```

Open http://localhost:8080 when running frontend in Docker.

## Deployment Notes

- frontend/cloudbuild.yaml builds and pushes frontend image with REACT_APP_API_BASE_URL as a build arg.
- frontend/nginx.conf is used by the frontend Docker image to serve the React build on port 8080.

## Scripts

Backend:

- npm run dev
- npm start

Frontend:

- npm start
- npm run build