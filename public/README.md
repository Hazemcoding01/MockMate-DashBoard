# MockMate Admin Dashboard

لوحة تحكم (Dashboard) لإدارة إعدادات مقابلات الـ AI للشركات (Tracks / Skills / Questions) فوق API خارجي جاهز.

---

## 💻 الـ Tech Stack

### Frontend
- **HTML**:
  - `login.html`
  - `register.html`
  - `dashboard.html`
- **CSS**:
  - `login.css`
  - `register.css`
  - `dashboard.css`
- **Vanilla JavaScript** (من غير Framework):
  - `login.js`
  - `register.js`
  - `dashboard.js`
- استخدام `fetch` للتعامل مع الـ API عن طريق الـ Node server.

### Backend (محلي)
- **Node.js + Express** في ملف:
  - `server.js`
- السيرفر هنا مش الباك إند الأساسي، ده:
  - **Reverse Proxy** قدام API خارجي:
    - `const API_BASE_URL = 'https://ahmedsalah1-001-site1.ktempurl.com';`
  - بيستقبل طلبات من الفرونت على `http://localhost:3000/api/...`
  - ويبعته للـ API الأصلي بنفس الـ body والـ headers (خاصة Authorization).

### Backend فعلي (خارجي)
- REST API مستضاف أونلاين (غالبًا .NET Web API).
- انت بتستهلكه بس، مش جزء من الكود في المشروع ده.

---

## 📁 هيكل المشروع (Structure)

    project-root/
    │
    ├─ server.js                # Node.js + Express proxy server
    │
    └─ public/
       ├─ login.html            # صفحة تسجيل الدخول
       ├─ login.css
       ├─ login.js
       │
       ├─ register.html         # صفحة إنشاء حساب (Admin/User)
       ├─ register.css
       ├─ register.js
       │
       ├─ dashboard.html        # لوحة التحكم (Tracks / Skills / Questions)
       ├─ dashboard.css
       └─ dashboard.js

السيرفر بيقدّم ملفات الفرونت كـ static:

    app.use(express.static('public'));

أي ملف جوّه `public` تقدر توصله عن طريق:  
`http://localhost:3000/اسم-الملف.html`

---

## 🚀 طريقة التشغيل (Run)

### 1) المتطلبات
- Node.js (يفضَّل 14 أو أعلى)
- npm

### 2) تثبيت الـ dependencies

من رووت المشروع (نفس المكان اللي فيه `server.js`):

    npm install express node-fetch@2

### 3) تشغيل السيرفر

    node server.js

هتلاقي في الـ console:

    Server is running on http://localhost:3000

### 4) تفتح الفرونت في المتصفح

- صفحة Login:
  - `http://localhost:3000/login.html`
- صفحة Register:
  - `http://localhost:3000/register.html`
- صفحة Dashboard (محميّة – محتاجة token من الـ login):
  - `http://localhost:3000/dashboard.html`

---

## 🔐 الـ Authentication

### Register (`register.html` + `register.js`)

فورم لإنشاء يوزر جديد يحتوي على:

- `username`
- `displayName`
- `email`
- `phoneNumber`
- `role` (Admin / User) – بتتبعت من الـ UI
- `password` + `confirmPassword`

الطلب:

- من الفرونت:
  - `POST /api/users`
- داخل `server.js` بيتحوّل إلى:
  - `POST {API_BASE_URL}/api/users`

مثال Payload:

    {
      "username": "admin1",
      "email": "admin@company.com",
      "phoneNumber": "01000000000",
      "passWord": "12345678",
      "displayName": "Admin One",
      "role": "Admin"
    }

### Login (`login.html` + `login.js`)

الفورم:

- `email`
- `password`

الطلب:

- `POST /api/users/login`

لو الـ login نجح:

- بياخد `token` (أو `accessToken` لو موجود) من الـ response.
- بيحفظه في `localStorage`:

    localStorage.setItem('token', token);
    localStorage.setItem('userName', userName);

- بعد كده:

    window.location.href = 'dashboard.html';

### Auth Guard في الصفحات

- في `login.html`:
  - لو فيه `token` في `localStorage` → redirect إلى `dashboard.html`.
- في `dashboard.html`:
  - لو **مفيش** `token` → redirect إلى `login.html`.

---

## 🧭 Dashboard – الوظائف الأساسية

كل ده في `dashboard.html` + `dashboard.js`.

### 1) Tracks Management

#### جلب التراكس

- Endpoint عن طريق الـ proxy:
  - `GET /api/tracks?PageIndex=1&PageSize=100`
- فعليًا بتروح إلى:
  - `GET {API_BASE_URL}/api/tracks?PageIndex=1&PageSize=100`

مثال Response واحد:

    {
      "id": 5,
      "name": "AI & Machine Learning Engineering",
      "createdAt": "2026-02-28T15:25:58.9066667",
      "skillCount": 12
    }

الجدول في الـ Dashboard يعرض:

- رقم تسلسلي
- اسم الـ Track (`name`)
- عدد الـ Skills (`skillCount`)
- Actions (Edit / Delete)

#### إضافة / تعديل Track

الفورم على اليمين يحتوي:

- `trackName`
- `trackDescription`

Create:

- `POST /api/tracks`
- body:

      {
        "name": "Track name",
        "description": "Track description"
      }

Update:

- `PUT /api/tracks/{id}?name=NewName`
- الـ API نفسه بيستخدم `name` من الـ query لـ Update، والـ body حالياً غير مؤثر حسب الـ Swagger.

#### حذف Track

من زرار Delete في Actions:

- `DELETE /api/tracks/{id}`

---

### 2) Skills Management

#### جلب الـ Skills

Endpoint:

- `GET /api/skills`

فعليًا:

- `GET {API_BASE_URL}/api/skills`

مثال Response:

    { "id": 11, "name": "CSS" }

الجدول يعرض:

- رقم
- اسم الـ Skill
- Actions (Edit / Delete)

> مفيش عمود Track في الجدول لأن الـ API في GET ما بيرجعش علاقة واضحة بين الـ Skill والـ Track.

#### إضافة / تعديل Skill

الفورم:

- `skillName`
- `skillTrack` (اختياري، بيحوّل لقيمة `trackIds` في البايلود)

Create:

- `POST /api/skills`
- body:

      {
        "name": "CSS",
        "trackIds": [trackId?]
      }

Update:

- `PUT /api/skills/{id}`
- body:

      {
        "name": "CSS",
        "trackIds": [...]
      }

#### حذف Skill

من زرار Delete:

- `DELETE /api/skills/{id}`

---

### 3) Questions Management

#### جلب الأسئلة

Endpoint:

- `GET /api/questions`

مثال Response:

    {
      "id": 67,
      "title": "Data Leakage",
      "seniorityLevel": "Senior",
      "questionType": "MCQ",
      "createdAt": "2026-02-28T15:26:06.84",
      "skills": ["Python", "SQL Server"]
    }

في `dashboard.js`:

- في `mapQuestionFromApi` بيتحوّل لـ object مناسب للـ UI:

    {
      id: apiQ.id,
      title: apiQ.title,
      text: apiQ.text || '',
      type: 'Coding' أو 'MCQ' حسب `questionType`,
      seniority: apiQ.seniorityLevel || '',
      trackName: '',
      skills: apiQ.skills || [],
      createdAt: apiQ.createdAt || null
    }

الجدول يعرض:

- رقم
- العنوان
- النوع
- الـ Seniority
- Actions (Edit / Delete)

#### تفاصيل السؤال (Question Details)

في الكارت على اليمين (`#questionDetails`):

- حاليًا يعرض:
  - Title
  - Type
  - Seniority
  - Created At

- تم إزالة:
  - Track
  - Skills (كسطر مستقل)
  - Question Text  
  عشان مش راجعين بشكل كامل من `GET /api/questions`.

#### إضافة / تعديل سؤال

عند الضغط على **+ Add Question** أو على Edit:

نوعين من الأسئلة:

##### أ) MCQ

EndPoints:

- `POST /api/questions/mcq`
- `PUT  /api/questions/mcq/{id}`

Payload:

    {
      "title": "Question title",
      "text": "Full text",
      "seniorityLevel": "Junior/Mid/Senior",
      "skillIds": [1],
      "options": [
        { "optionText": "Option 1", "isCorrect": true },
        { "optionText": "Option 2", "isCorrect": false },
        { "optionText": "Option 3", "isCorrect": false },
        { "optionText": "Option 4", "isCorrect": false }
      ]
    }

##### ب) Coding

EndPoints:

- `POST /api/questions/coding`
- `PUT  /api/questions/coding/{id}`

Payload:

    {
      "title": "Coding Question",
      "text": "Full question text",
      "seniorityLevel": "Senior",
      "skillIds": [1],
      "templates": [
        {
          "languageId": 1,
          "timeLimit": 1000,
          "memoryLimit": 256,
          "defaultCode": "// starter code",
          "driverCode": "// driver / test harness code"
        }
      ],
      "testCases": [
        {
          "input": "1 2",
          "expectedOutput": "3",
          "isHidden": false
        }
      ]
    }

#### حذف سؤال

من زرار Delete:

- `DELETE /api/questions/{id}`

---

## 🌐 Proxy Logic (server.js) – ملخص سريع

تقديم ملفات الـ frontend:

    app.use(express.static('public'));

تمرير طلبات الـ API إلى السيرفر الخارجي مع `Authorization` لو موجود في الـ headers.

أمثلة Routes:

- Users:
  - `app.post('/api/users', ...)`
  - `app.post('/api/users/login', ...)`
- Tracks:
  - `app.get('/api/tracks', ...)`
  - `app.get('/api/tracks/:id', ...)`
  - `app.post('/api/tracks', ...)`
  - `app.put('/api/tracks/:id', ...)`
  - `app.delete('/api/tracks/:id', ...)`
- Skills:
  - `app.get('/api/skills', ...)`
  - `app.get('/api/skills/:id', ...)`
  - `app.post('/api/skills', ...)`
  - `app.put('/api/skills/:id', ...)`
  - `app.delete('/api/skills/:id', ...)`
- Questions:
  - `app.get('/api/questions', ...)`
  - `app.get('/api/questions/:id', ...)`
  - `app.post('/api/questions/coding', ...)`
  - `app.post('/api/questions/mcq', ...)`
  - `app.put('/api/questions/coding/:id', ...)`
  - `app.put('/api/questions/mcq/:id', ...)`
  - `app.delete('/api/questions/:id', ...)`

---

## ⚠️ ملاحظات عامة

- لازم اتصال النت يكون سليم، وأي redirect من مزوّد الخدمة (زي صفحة TE Data) هيوقف الاتصال بالـ API الخارجي.
- التوكن في `localStorage` ممكن ينتهي صلاحيته:
  - وقتها هتشوف 401 من `/api/tracks` أو `/api/questions`.
  - لازم تعمل Login من جديد (أو تضيف منطق Auto-Logout في الكود على 401/403).
- الـ UI متظبط إنه:
  - مايعرضش فيلدز مش راجعة فعلًا من الـ API (مثلاً Track في Skills).
  - يستخدم الفيلدز الصح (`skillCount` في Tracks بدل `description` مثلاً).

---