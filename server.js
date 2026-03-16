const express = require('express');
const fetch = require('node-fetch'); // تأكد إنك عامل: npm install node-fetch@2
const app = express();
const PORT = 3000;

// Base URL بتاع الـ API الخارجي - رجعناه HTTP تاني
const API_BASE_URL = 'http://ahmedsalah1-001-site1.ktempurl.com';

app.use(express.json());

// يقدم ملفات الفرونت من فولدر public
app.use(express.static('public'));

// Helper بسيط عشان نمرّر الـ Authorization لو جاي من الفرونت
function getAuthHeader(req) {
  return req.headers['authorization']
    ? { Authorization: req.headers['authorization'] }
    : {};
}

/* ================= USERS (Register / Login) ================= */

// Proxy للـ REGISTER: POST /api/users
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
    console.error('Proxy register error:', err);
    res.status(500).json({ message: 'Proxy register error' });
  }
});

// Proxy للـ LOGIN: POST /api/users/login
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
    console.error('Proxy login error:', err);
    res.status(500).json({ message: 'Proxy login error' });
  }
});

/* ================= TRACKS ================= */

// GET /api/tracks - جلب كل الـ Tracks
app.get('/api/tracks', async (req, res) => {
  try {
    const url = new URL(API_BASE_URL + '/api/tracks');
    if (req.query.SearchTerm) url.searchParams.append('SearchTerm', req.query.SearchTerm);
    if (req.query.PageIndex) url.searchParams.append('PageIndex', req.query.PageIndex);
    if (req.query.PageSize) url.searchParams.append('PageSize', req.query.PageSize);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy get all tracks error:', err);
    res.status(500).json({ message: 'Proxy get all tracks error' });
  }
});

// GET /api/tracks/:id - جلب Track واحدة
app.get('/api/tracks/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/tracks/${req.params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy get track by id error:', err);
    res.status(500).json({ message: 'Proxy get track by id error' });
  }
});

// POST /api/tracks - إضافة Track جديدة
app.post('/api/tracks', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + '/api/tracks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy create track error:', err);
    res.status(500).json({ message: 'Proxy create track error' });
  }
});

// PUT /api/tracks/:id - تعديل Track (name فى الـ query)
app.put('/api/tracks/:id', async (req, res) => {
  try {
    const url = new URL(API_BASE_URL + `/api/tracks/${req.params.id}`);
    if (req.query.name) {
      url.searchParams.append('name', req.query.name);
    }

    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy update track error:', err);
    res.status(500).json({ message: 'Proxy update track error' });
  }
});

// DELETE /api/tracks/:id - حذف Track
app.delete('/api/tracks/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/tracks/${req.params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      }
    });

    let data = {};
    try {
      data = await response.json();
    } catch {}

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy delete track error:', err);
    res.status(500).json({ message: 'Proxy delete track error' });
  }
});

/* ================= SKILLS ================= */

// GET /api/skills
app.get('/api/skills', async (req, res) => {
  try {
    const url = new URL(API_BASE_URL + '/api/skills');
    if (req.query.trackId) url.searchParams.append('trackId', req.query.trackId);
    if (req.query.skillName) url.searchParams.append('skillName', req.query.skillName);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy get all skills error:', err);
    res.status(500).json({ message: 'Proxy get all skills error' });
  }
});

// GET /api/skills/:id
app.get('/api/skills/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/skills/${req.params.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy get skill by id error:', err);
    res.status(500).json({ message: 'Proxy get skill by id error' });
  }
});

// POST /api/skills
app.post('/api/skills', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + '/api/skills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy create skill error:', err);
    res.status(500).json({ message: 'Proxy create skill error' });
  }
});

// PUT /api/skills/:id
app.put('/api/skills/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/skills/${req.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy update skill error:', err);
    res.status(500).json({ message: 'Proxy update skill error' });
  }
});

// DELETE /api/skills/:id
app.delete('/api/skills/:id', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + `/api/skills/${req.params.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      }
    });

    let data = {};
    try {
      data = await response.json();
    } catch {}

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy delete skill error:', err);
    res.status(500).json({ message: 'Proxy delete skill error' });
  }
});

/* ================= QUESTIONS ================= */

// GET /api/questions
app.get('/api/questions', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + '/api/questions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      }
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy get all questions error:', err);
    res.status(500).json({ message: 'Proxy get all questions error' });
  }
});

// GET /api/questions/:id
app.get('/api/questions/:id', async (req, res) => {
  try {
    const response = await fetch(
      API_BASE_URL + `/api/questions/${req.params.id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(req)
        }
      }
    );

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy get question by id error:', err);
    res.status(500).json({ message: 'Proxy get question by id error' });
  }
});

// POST /api/questions/coding
app.post('/api/questions/coding', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + '/api/questions/coding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy create coding question error:', err);
    res.status(500).json({ message: 'Proxy create coding question error' });
  }
});

// POST /api/questions/mcq
app.post('/api/questions/mcq', async (req, res) => {
  try {
    const response = await fetch(API_BASE_URL + '/api/questions/mcq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(req)
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy create mcq question error:', err);
    res.status(500).json({ message: 'Proxy create mcq question error' });
  }
});

// PUT /api/questions/coding/:id
app.put('/api/questions/coding/:id', async (req, res) => {
  try {
    const response = await fetch(
      API_BASE_URL + `/api/questions/coding/${req.params.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(req)
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy update coding question error:', err);
    res.status(500).json({ message: 'Proxy update coding question error' });
  }
});

// PUT /api/questions/mcq/:id
app.put('/api/questions/mcq/:id', async (req, res) => {
  try {
    const response = await fetch(
      API_BASE_URL + `/api/questions/mcq/${req.params.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(req)
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json().catch(() => ({}));
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy update mcq question error:', err);
    res.status(500).json({ message: 'Proxy update mcq question error' });
  }
});

// DELETE /api/questions/:id
app.delete('/api/questions/:id', async (req, res) => {
  try {
    const response = await fetch(
      API_BASE_URL + `/api/questions/${req.params.id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(req)
        }
      }
    );

    let data = {};
    try {
      data = await response.json();
    } catch {}

    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy delete question error:', err);
    res.status(500).json({ message: 'Proxy delete question error' });
  }
});

/* ================= TEST ROUTE ================= */

app.get('/ping', (req, res) => {
  res.send('Server is working');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});