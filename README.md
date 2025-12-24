𝐬𝐚𝐟𝐞𝐩𝐥𝐚𝐜𝐞𝐟𝐨𝐮𝐧𝐝 

SafePlace AI Therapist is a full-stack web application that provides mental health support through AI-driven interactions. Users can chat with an AI therapist to discuss feelings, receive advice, and track mental well-being.

The project consists of a frontend (React) and a backend (Node.js/Express) with a database for storing user interactions.

Features

Chat with an AI therapist in real-time

Track session history

Responsive and user-friendly interface

Secure backend API

Tech Stack
Frontend

React 18 (Functional Components & Hooks)

TypeScript

Tailwind CSS + Custom Styling

React Router for navigation

Framer Motion for animations

Backend

Node.js + Express

RESTful API endpoints

MongoDB / any preferred database (update as needed)

Environment-based configuration for secrets
<img width="3837" height="1737" alt="image" src="https://github.com/user-attachments/assets/71018c9e-d42d-4037-916b-67e0dec62d79" /><img width="3804" height="1563" alt="image" src="https://github.com/user-attachments/assets/05bcb48e-6a67-40da-aeae-0ff62bf1730a" />
<img width="3837" height="1737" alt="image" src="https://github.com/user-attachments/assets/b3a9f0ae-6242-419b-87fa-2e0c449a66bc" />
<img width="3783" height="1743" alt="image" src="https://github.com/user-attachments/assets/6f145e4c-84e6-4807-bd72-e8281ebbd5ad" />
<img width="3780" height="1749" alt="image" src="https://github.com/user-attachments/assets/245838be-7901-496e-bfdb-c202958e45e1" />


1. Clone the repository
git clone https://github.com/bhavya2511/safeplacefound---ai-THERAPIST.git
cd safeplacefound---ai-THERAPIST

2. Backend setup

Navigate to the backend folder:

cd backend


Install dependencies:

npm install


Create a .env file with your secrets (e.g., OpenAI API key):

OPENAI_API_KEY=your_api_key_here
PORT=5000


Start the backend server:

node server.js


⚠️ Make sure port 5000 is free or change the PORT in .env.

3. Frontend setup

Navigate to the frontend folder:

cd safeplace_frontend


Install dependencies:

npm install


Start the React app:

npm start


The frontend will run at http://localhost:5173 (or default Vite port).

Important Notes

Do not commit .env files — GitHub push protection will block secrets.

Use .env.local or .env ignored in .gitignore for storing API keys.

If pushing to GitHub, remove all secrets from commit history using git filter-repo.

Contributing

Fork the repository

Create a new branch: git checkout -b feature/your-feature

Make changes and commit: git commit -m "Add feature"

Push your branch and create a pull request

License

This project is licensed under the MIT License.
