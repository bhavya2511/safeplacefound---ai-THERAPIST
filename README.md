# SafePlace | AI Therapist

SafePlace is a full‑stack web app that provides compassionate, private conversational support using an AI therapist. It combines a React + Vite frontend with a serverless-ready Express backend (connected to MongoDB) so the app can be deployed and run without keeping a personal server online.

link: "https://safeplacefound-ai-therapist.vercel.app/"

<!-- Screenshots (kept as in the original repo) -->
<img width="3837" height="1737" alt="image" src="https://github.com/user-attachments/assets/71018c9e-d42d-4037-916b-67e0dec62d79" /><img width="3804" height="1563" alt="image" src="https://github.com/user-attachments/assets/05bcb48e-6a67-40da-aeae-0ff62bf1730a" />
<img width="3837" height="1737" alt="image" src="https://github.com/user-attachments/assets/b3a9f0ae-6242-419b-87fa-2e0c449a66bc" />
<img width="3783" height="1743" alt="image" src="https://github.com/user-attachments/assets/6f145e4c-84e6-4807-bd72-e8281ebbd5ad" />
<img width="3780" height="1749" alt="image" src="https://github.com/user-attachments/assets/245838be-7901-496e-bfdb-c202958e45e1" />

## What this is
- A friendly AI therapist chat experience that stores user accounts, chat history, and journal entries.
- Frontend: React + TypeScript + Vite; animations via Framer Motion.
- Backend: Express + Mongoose (MongoDB) + OpenAI for AI responses.
- Designed for serverless hosting (Vercel) so the backend does not require keeping a VM running.

## Key features
- Email/password sign up & JWT auth
- Chat with an AI therapist (messages saved to MongoDB)
- Persistent chat and journaling per user
- Serverless-friendly backend (works as /api serverless function)

## Tech stack
- Frontend: React, TypeScript, Vite, Framer Motion
- Backend: Node.js, Express, Mongoose, OpenAI SDK
- Database: MongoDB (Atlas recommended)

## Run locally
1. Clone:
   git clone https://github.com/bhavya2511/safeplacefound---ai-THERAPIST.git
   cd safeplacefound---ai-THERAPIST

2. Backend:
   cd backend
   npm install
   create a `.env` with:
   MONGO_URI=your_mongodb_atlas_uri
   OPENAI_API_KEY=your_openai_key
   JWT_SECRET=some_secret
   PORT=5000
   npm start

3. Frontend:
   cd ../safeplace_frontend
   npm install
   npm run dev

Open the frontend (Vite) local URL and log in / register to talk to the AI.

## Recommended production deployment (no personal server required)
The repository is configured for Vercel (see `vercel.json`) which builds the frontend and exposes the backend as serverless functions under `/api`.

Steps:
1. Create a free Vercel account and connect your GitHub repository.
2. On Vercel, import this repo — the build command and output directory are set in `vercel.json`.
3. In the Vercel project settings -> Environment Variables, add:
   - MONGO_URI (MongoDB Atlas connection string)
   - OPENAI_API_KEY (OpenAI key)
   - JWT_SECRET (strong random secret)
   - VERCEL=true (optional; server.js checks this to avoid binding a port)
4. Deploy. Vercel will build the frontend and deploy the backend as serverless functions; no server to keep alive.

Notes:
- Use MongoDB Atlas (free tier) for a hosted database.
- Keep API keys secret; do not commit `.env` to GitHub.
- The backend is written to handle cold starts and cache a single Mongoose connection per serverless container.

## Alternatives
- Render / Railway / Fly are also valid hosts; the same env vars and build steps apply.

## Contributing
Fork, create a branch, make changes, and open a PR.

## License
MIT

