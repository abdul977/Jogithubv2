import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'vite';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GITHUB_CLIENT_ID = process.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.VITE_GITHUB_CLIENT_SECRET;

app.post('/api/auth/github', async (req, res) => {
  const { code, state } = req.body;

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        state
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.status(500).json({ error: 'Failed to exchange code for token' });
  }
});

// Create Vite server
const vite = await createServer({
  server: { middlewareMode: true },
  appType: 'spa',
});

// Use Vite's connect instance as middleware
app.use(vite.middlewares);

const PORT = process.env.PORT || 5173;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});