const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');

const app = express();

const API_BASE_URL = 'http://mockmate-001-site1.mtempurl.com';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function getAuthHeader(req) {
  return req.headers['authorization']
    ? { Authorization: req.headers['authorization'] }
    : {};
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/users', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + '/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Register proxy error:', err);
    res.status(500).json({ message: 'Proxy register error' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + '/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Login proxy error:', err);
    res.status(500).json({ message: 'Proxy login error' });
  }
});

app.get('/api/tracks', async (req, res) => {
  try {
    const url = new URL(API_BASE_URL + '/api/tracks');

    if (req.query.SearchTerm) url.searchParams.append('SearchTerm', req.query.SearchTerm);
    if (req.query.PageIndex) url.searchParams.append('PageIndex', req.query.PageIndex);
    if (req.query.PageSize) url.searchParams.append('PageSize', req.query.PageSize);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Get tracks proxy error:', err);
    res.status(500).json({ message: 'Proxy get all tracks error' });
  }
});

app.get('/api/tracks/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/tracks/${req.params.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Get track by id proxy error:', err);
    res.status(500).json({ message: 'Proxy get track by id error' });
  }
});

app.post('/api/tracks', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + '/api/tracks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Create track proxy error:', err);
    res.status(500).json({ message: 'Proxy create track error' });
  }
});

app.put('/api/tracks/:id', async (req, res) => {
  try {
    const url = new URL(API_BASE_URL + `/api/tracks/${req.params.id}`);
    if (req.query.name) url.searchParams.append('name', req.query.name);

    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Update track proxy error:', err);
    res.status(500).json({ message: 'Proxy update track error' });
  }
});

app.delete('/api/tracks/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/tracks/${req.params.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) }
    });

    let data = {};
    try {
      data = await response.json();
    } catch {}

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Delete track proxy error:', err);
    res.status(500).json({ message: 'Proxy delete track error' });
  }
});

app.get('/api/skills', async (req, res) => {
  try {
    const url = new URL(API_BASE_URL + '/api/skills');

    if (req.query.trackId) url.searchParams.append('trackId', req.query.trackId);
    if (req.query.skillName) url.searchParams.append('skillName', req.query.skillName);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Get skills proxy error:', err);
    res.status(500).json({ message: 'Proxy get all skills error' });
  }
});

app.get('/api/skills/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/skills/${req.params.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Get skill by id proxy error:', err);
    res.status(500).json({ message: 'Proxy get skill by id error' });
  }
});

app.post('/api/skills', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + '/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Create skill proxy error:', err);
    res.status(500).json({ message: 'Proxy create skill error' });
  }
});

app.put('/api/skills/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/skills/${req.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Update skill proxy error:', err);
    res.status(500).json({ message: 'Proxy update skill error' });
  }
});

app.delete('/api/skills/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/skills/${req.params.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) }
    });

    let data = {};
    try {
      data = await response.json();
    } catch {}

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Delete skill proxy error:', err);
    res.status(500).json({ message: 'Proxy delete skill error' });
  }
});

app.get('/api/questions', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + '/api/questions', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Get questions proxy error:', err);
    res.status(500).json({ message: 'Proxy get all questions error' });
  }
});

app.get('/api/questions/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/questions/${req.params.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Get question by id proxy error:', err);
    res.status(500).json({ message: 'Proxy get question by id error' });
  }
});

app.post('/api/questions/coding', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + '/api/questions/coding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Create coding question proxy error:', err);
    res.status(500).json({ message: 'Proxy create coding question error' });
  }
});

app.post('/api/questions/mcq', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + '/api/questions/mcq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Create mcq question proxy error:', err);
    res.status(500).json({ message: 'Proxy create mcq question error' });
  }
});

app.put('/api/questions/coding/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/questions/coding/${req.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Update coding question proxy error:', err);
    res.status(500).json({ message: 'Proxy update coding question error' });
  }
});

app.put('/api/questions/mcq/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/questions/mcq/${req.params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Update mcq question proxy error:', err);
    res.status(500).json({ message: 'Proxy update mcq question error' });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/questions/${req.params.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader(req) }
    });

    let data = {};
    try {
      data = await response.json();
    } catch {}

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Delete question proxy error:', err);
    res.status(500).json({ message: 'Proxy delete question error' });
  }
});

app.get('/ping', (req, res) => {
  res.send('Server is working');
});

module.exports = app;