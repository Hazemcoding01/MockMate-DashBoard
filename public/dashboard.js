// ================== Auth info ==================
const userName = localStorage.getItem('userName') || 'User';
const welcomeEl = document.getElementById('welcomeName');
const avatarEl = document.getElementById('userAvatar');

if (welcomeEl) {
  welcomeEl.textContent = 'Hello, ' + userName;
}
if (avatarEl) {
  avatarEl.textContent =
    (userName || 'U').trim().charAt(0).toUpperCase() || 'U';
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
  });
}

// ================== Sidebar navigation ==================
const navLinks = document.querySelectorAll('.nav-link');
const sections = {
  tracks: document.getElementById('tracksSection'),
  skills: document.getElementById('skillsSection'),
  questions: document.getElementById('questionsSection')
};

navLinks.forEach((btn) => {
  btn.addEventListener('click', () => {
    navLinks.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.getAttribute('data-section');
    Object.keys(sections).forEach((key) => {
      if (!sections[key]) return;
      sections[key].classList.toggle('active', key === target);
    });
  });
});

const skillTrackSelect = document.getElementById('skillTrack');
const qTrack = document.getElementById('qTrack');
const qSkillsSelect = document.getElementById('qSkillsSelect');

// مصفوفة skills العامة (نستخدمها فى دروب ليست السؤال)
let allSkills = [];

// ================== Tracks (API) ==================
let tracks = [];
let editingTrackId = null;

const tracksTableBody = document.getElementById('tracksTableBody');
const tracksEmptyText = document.getElementById('tracksEmptyText');
const trackForm = document.getElementById('trackForm');
const trackMessage = document.getElementById('trackMessage');

// تحميل Tracks من الـ API
async function loadTracks() {
  const token = localStorage.getItem('token');
  tracksTableBody.innerHTML = '';
  tracksEmptyText.style.display = 'none';

  try {
    const response = await fetch('/api/tracks?PageIndex=1&PageSize=100', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Load tracks error:', data);
      tracks = [];
      tracksEmptyText.style.display = 'block';
      tracksEmptyText.textContent =
        data.message || data.title || 'Error while loading tracks.';
      return;
    }

    let list;
    if (Array.isArray(data.data)) list = data.data;
    else if (Array.isArray(data)) list = data;
    else list = [];

    tracks = list;
    renderTracks();
  } catch (err) {
    console.error('Load tracks fetch error:', err);
    tracks = [];
    tracksEmptyText.style.display = 'block';
    tracksEmptyText.textContent =
      'Connection error while loading tracks.';
  }
}

function renderTracks() {
  tracksTableBody.innerHTML = '';

  if (!tracks.length) {
    tracksEmptyText.style.display = 'block';
  } else {
    tracksEmptyText.style.display = 'none';
  }

  tracks.forEach((track, index) => {
    const skillsCount =
      typeof track.skillCount === 'number' ? track.skillCount : '-';

    const tr = document.createElement('tr');
    tr.dataset.id = track.id;
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><span class="badge">${track.name}</span></td>
      <td>${skillsCount}</td>
      <td>
        <button class="btn-small edit-track-btn" data-id="${track.id}">Edit</button>
        <button class="btn-small delete-track-btn" data-id="${track.id}">Delete</button>
      </td>
    `;
    tracksTableBody.appendChild(tr);
  });

  refreshTrackOptions();
}

// كليك على أزرار Edit / Delete فى جدول التراكس
tracksTableBody.addEventListener('click', async (e) => {
  const target = e.target;

  if (target.classList.contains('edit-track-btn')) {
    const id = Number(target.dataset.id);
    startEditTrack(id);
  } else if (target.classList.contains('delete-track-btn')) {
    const id = Number(target.dataset.id);
    if (!confirm('Are you sure you want to delete this track?')) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/tracks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let data = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok) {
        console.error('Delete track error:', data);
        alert(data.message || data.title || 'Error while deleting track.');
        return;
      }

      await loadTracks();
      await loadSkills(); // عشان Skills Count تتظبط
    } catch (err) {
      console.error('Delete track fetch error:', err);
      alert('Connection error while deleting track.');
    }
  }
});

// بدء تعديل Track (يملى الفورم)
function startEditTrack(id) {
  const track = tracks.find((t) => t.id === id);
  if (!track) return;

  editingTrackId = id;
  trackMessage.textContent = '';
  trackMessage.className = 'message';

  document.getElementById('trackName').value = track.name || '';
  document.getElementById('trackDescription').value = track.description || '';
}

// إضافة / تعديل Track
trackForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  trackMessage.textContent = '';
  trackMessage.className = 'message';

  const name = document.getElementById('trackName').value.trim();
  const description = document
    .getElementById('trackDescription')
    .value.trim();

  if (!name || !description) {
    trackMessage.textContent = 'Please fill all fields.';
    trackMessage.classList.add('error');
    return;
  }

  const token = localStorage.getItem('token');
  const payload = { name, description };

  const isEdit = !!editingTrackId;
  let url = '/api/tracks';
  let method = 'POST';

  if (isEdit) {
    url = `/api/tracks/${editingTrackId}?name=${encodeURIComponent(name)}`;
    method = 'PUT';
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: method === 'POST' ? JSON.stringify(payload) : null
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Save track error:', data);
      trackMessage.textContent =
        data.message || data.title || 'Error while saving track.';
      trackMessage.classList.add('error');
      return;
    }

    trackMessage.textContent = isEdit
      ? 'Track updated successfully.'
      : 'Track added successfully.';
    trackMessage.classList.add('success');

    editingTrackId = null;
    trackForm.reset();

    await loadTracks();
  } catch (err) {
    console.error('Save track fetch error:', err);
    trackMessage.textContent =
      'Connection error while saving track.';
    trackMessage.classList.add('error');
  }
});

// ================== Skills (API) ==================
let skills = [];
let editingSkillId = null;

const skillsTableBody = document.getElementById('skillsTableBody');
const skillsEmptyText = document.getElementById('skillsEmptyText');
const skillForm = document.getElementById('skillForm');
const skillMessage = document.getElementById('skillMessage');
const skillFormTitle = document.getElementById('skillFormTitle');
const cancelSkillEditBtn = document.getElementById('cancelSkillEdit');
const skillNameInput = document.getElementById('skillName');

// تحميل Skills من الـ API (للتابل + دروب ليست السؤال)
async function loadSkills() {
  const token = localStorage.getItem('token');
  skillsTableBody.innerHTML = '';
  skillsEmptyText.style.display = 'none';

  try {
    const response = await fetch('/api/skills', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Load skills error:', data);
      skills = [];
      skillsEmptyText.style.display = 'block';
      skillsEmptyText.textContent =
        data.message || data.title || 'Error while loading skills.';
      return;
    }

    const list = Array.isArray(data.data) ? data.data : (
      Array.isArray(data) ? data : []
    );

    skills = list;
    allSkills = list;

    fillSkillsDropdown();
    renderSkills();
  } catch (err) {
    console.error('Load skills fetch error:', err);
    skills = [];
    skillsEmptyText.style.display = 'block';
    skillsEmptyText.textContent =
      'Connection error while loading skills.';
  }
}

function renderSkills() {
  skillsTableBody.innerHTML = '';

  if (!skills.length) {
    skillsEmptyText.style.display = 'block';
  } else {
    skillsEmptyText.style.display = 'none';
  }

  skills.forEach((skill, index) => {
    const tr = document.createElement('tr');
    tr.dataset.id = skill.id;
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${skill.name || skill.skillName || '-'}</td>
      <td>
        <button class="btn-small edit-skill-btn" data-id="${skill.id}">Edit</button>
        <button class="btn-small delete-skill-btn" data-id="${skill.id}">Delete</button>
      </td>
    `;
    skillsTableBody.appendChild(tr);
  });
}

// edit / delete فى جدول الـ Skills
skillsTableBody.addEventListener('click', async (e) => {
  const target = e.target;

  if (target.classList.contains('edit-skill-btn')) {
    const id = Number(target.dataset.id);
    startEditSkill(id);
  } else if (target.classList.contains('delete-skill-btn')) {
    const id = Number(target.dataset.id);
    if (!confirm('Are you sure you want to delete this skill?')) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let data = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok) {
        console.error('Delete skill error:', data);
        alert(data.message || data.title || 'Error while deleting skill.');
        return;
      }

      await loadSkills();
    } catch (err) {
      console.error('Delete skill fetch error:', err);
      alert('Connection error while deleting skill.');
    }
  }
});

function startEditSkill(id) {
  const skill = skills.find((s) => s.id === id);
  if (!skill) return;

  editingSkillId = id;
  skillFormTitle.textContent = 'Edit Skill';
  skillMessage.textContent = '';
  skillMessage.className = 'message';

  skillNameInput.value = skill.name || skill.skillName || '';
  skillTrackSelect.value = '';
}

cancelSkillEditBtn.addEventListener('click', () => {
  editingSkillId = null;
  skillFormTitle.textContent = 'Add New Skill';
  skillForm.reset();
  skillMessage.textContent = '';
  skillMessage.className = 'message';
});

skillForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  skillMessage.textContent = '';
  skillMessage.className = 'message';

  const name = skillNameInput.value.trim();

  let trackIds = [];
  const selectedTrackId = skillTrackSelect.value;
  if (selectedTrackId) {
    trackIds = [Number(selectedTrackId)];
  }

  if (!name) {
    skillMessage.textContent = 'Please enter skill name.';
    skillMessage.classList.add('error');
    return;
  }

  const payload = { name, trackIds };
  const token = localStorage.getItem('token');
  const isEdit = !!editingSkillId;
  const url = isEdit ? `/api/skills/${editingSkillId}` : '/api/skills';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Save skill error:', data);
      skillMessage.textContent =
        data.message || data.title || 'Error while saving skill.';
      skillMessage.classList.add('error');
      return;
    }

    skillMessage.textContent = isEdit
      ? 'Skill updated successfully.'
      : 'Skill added successfully.';
    skillMessage.classList.add('success');

    editingSkillId = null;
    skillFormTitle.textContent = 'Add New Skill';
    skillForm.reset();

    await loadSkills();
  } catch (err) {
    console.error('Save skill fetch error:', err);
    skillMessage.textContent = 'Connection error while saving skill.';
    skillMessage.classList.add('error');
  }
}
);
// ================== Questions (from API) ==================
let questions = [];
let selectedQuestionId = null;
let editingQuestionId = null;

const questionsTableBody = document.getElementById('questionsTableBody');
const questionsEmptyText = document.getElementById('questionsEmptyText');
const questionDetailsEl = document.getElementById('questionDetails');
const questionsListSection = document.getElementById('questionsListSection');
const questionEditorSection = document.getElementById('questionEditorSection');
const questionEditorTitle = document.getElementById('questionEditorTitle');
const questionForm = document.getElementById('questionForm');
const questionFormMessage = document.getElementById('questionFormMessage');
const addQuestionBtn = document.getElementById('addQuestionBtn');
const cancelQuestionEditBtn = document.getElementById('cancelQuestionEdit');

const qTitle = document.getElementById('qTitle');
const qText = document.getElementById('qText');
const qType = document.getElementById('qType');
const qSeniority = document.getElementById('qSeniority');
const codingFields = document.getElementById('codingFields');
const mcqFields = document.getElementById('mcqFields');
const qLanguage = document.getElementById('qLanguage');
const qTimeLimit = document.getElementById('qTimeLimit');
const qMemoryLimit = document.getElementById('qMemoryLimit');
const qDefaultCode = document.getElementById('qDefaultCode');
const qDriverCode = document.getElementById('qDriverCode');
const qTestInput = document.getElementById('qTestInput');
const qTestExpected = document.getElementById('qTestExpected');
const opt1 = document.getElementById('opt1');
const opt2 = document.getElementById('opt2');
const opt3 = document.getElementById('opt3');
const opt4 = document.getElementById('opt4');
const qCorrectIndex = document.getElementById('qCorrectIndex');

// نملأ دروب ليست Skill فى فورم السؤال من allSkills
function fillSkillsDropdown() {
  if (!qSkillsSelect) return;
  qSkillsSelect.innerHTML = '<option value="">Select skill</option>';

  allSkills.forEach((skill) => {
    const opt = document.createElement('option');
    opt.value = skill.id;
    opt.textContent =
      skill.name || skill.skillName || skill.title || `Skill #${skill.id}`;
    qSkillsSelect.appendChild(opt);
  });
}

// تحميل الأسئلة من الـ API
async function loadQuestions() {
  const token = localStorage.getItem('token');
  questionsTableBody.innerHTML = '';
  questionsEmptyText.style.display = 'none';

  try {
    const response = await fetch('/api/questions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Load questions error:', data);
      questions = [];
      questionsEmptyText.style.display = 'block';
      questionsEmptyText.textContent =
        data.message || data.title || 'Error while loading questions.';
      return;
    }

    const list = Array.isArray(data.data)
      ? data.data
      : (Array.isArray(data) ? data : []);

    questions = list.map(mapQuestionFromApi);
    renderQuestions();
  } catch (err) {
    console.error('Load questions fetch error:', err);
    questions = [];
    questionsEmptyText.style.display = 'block';
    questionsEmptyText.textContent =
      'Connection error while loading questions.';
  }
}

// تحويل السؤال من شكل الـ API لشكل الواجهة
function mapQuestionFromApi(apiQ) {
  const rawType =
    apiQ.questionType || apiQ.type || (apiQ.options ? 'MCQ' : 'Coding') || '';

  let type;
  const lower = String(rawType).toLowerCase();
  if (lower === 'coding') type = 'Coding';
  else if (lower === 'mcq') type = 'MCQ';
  else type = rawType || 'Coding';

  const skillsArr = Array.isArray(apiQ.skills) ? apiQ.skills : [];

  return {
    id: apiQ.id,
    title: apiQ.title,
    text: apiQ.text || '',
    type,
    seniority: apiQ.seniorityLevel || '',
    trackName: '',
    skills: skillsArr,
    createdAt: apiQ.createdAt || null
  };
}

// Render الأسئلة
function renderQuestions() {
  questionsTableBody.innerHTML = '';

  if (!questions.length) {
    questionsEmptyText.style.display = 'block';
  } else {
    questionsEmptyText.style.display = 'none';
  }

  questions.forEach((q, index) => {
    const tr = document.createElement('tr');
    tr.dataset.id = q.id;
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${q.title}</td>
      <td>${q.type}</td>
      <td>${q.seniority || '-'}</td>
      <td>
        <button class="btn-small edit-btn" data-id="${q.id}">Edit</button>
        <button class="btn-small delete-btn" data-id="${q.id}">Delete</button>
      </td>
    `;
    questionsTableBody.appendChild(tr);
  });

  if (selectedQuestionId) {
    const exists = questions.some((q) => q.id === selectedQuestionId);
    if (!exists) selectedQuestionId = null;
  }
  renderQuestionDetails();
}

// ======== Question Details (Title/Type/Seniority/CreatedAt فقط) ========
function renderQuestionDetails() {
  questionDetailsEl.innerHTML = '';

  if (!selectedQuestionId) {
    questionDetailsEl.innerHTML =
      '<p class="empty-text">Select a question from the list to view details.</p>';
    return;
  }

  const q = questions.find((x) => x.id === selectedQuestionId);
  if (!q) {
    questionDetailsEl.innerHTML =
      '<p class="empty-text">Question not found.</p>';
    return;
  }

  const createdText = q.createdAt
    ? new Date(q.createdAt).toLocaleString()
    : '-';

  questionDetailsEl.innerHTML = `
    <p><strong>Title:</strong> ${q.title}</p>
    <p><strong>Type:</strong> ${q.type}</p>
    <p><strong>Seniority:</strong> ${q.seniority || '-'}</p>
    <p><strong>Created At:</strong> ${createdText}</p>
  `;
}

// ------- List / Editor toggle -------
function showQuestionsList() {
  questionsListSection.style.display = '';
  questionEditorSection.style.display = 'none';
  questionFormMessage.textContent = '';
  questionFormMessage.className = 'message';
  editingQuestionId = null;
  questionForm.reset();
  codingFields.style.display = 'none';
  mcqFields.style.display = 'none';

  if (qSkillsSelect) {
    qSkillsSelect.value = '';
  }
}

function showQuestionEditor(isEdit) {
  questionsListSection.style.display = 'none';
  questionEditorSection.style.display = '';
  questionEditorTitle.textContent = isEdit ? 'Edit Question' : 'Add Question';
}

addQuestionBtn.addEventListener('click', () => {
  editingQuestionId = null;
  questionForm.reset();
  codingFields.style.display = 'none';
  mcqFields.style.display = 'none';

  if (qSkillsSelect) {
    qSkillsSelect.value = '';
  }

  showQuestionEditor(false);
});

cancelQuestionEditBtn.addEventListener('click', () => {
  showQuestionsList();
});

// ------- Type change toggle -------
qType.addEventListener('change', () => {
  const val = qType.value;
  if (val === 'Coding') {
    codingFields.style.display = '';
    mcqFields.style.display = 'none';
  } else if (val === 'MCQ') {
    codingFields.style.display = 'none';
    mcqFields.style.display = '';
  } else {
    codingFields.style.display = 'none';
    mcqFields.style.display = 'none';
  }
});

// ------- Table click (select row / edit / delete) -------
questionsTableBody.addEventListener('click', async (e) => {
  const target = e.target;

  if (target.classList.contains('edit-btn')) {
    const id = Number(target.dataset.id);
    startEditQuestion(id);
    e.stopPropagation();
    return;
  }

  if (target.classList.contains('delete-btn')) {
    const id = Number(target.dataset.id);
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      let data = {};
      try {
        data = await response.json();
      } catch (_) {}

      if (!response.ok) {
        console.error('Delete question error:', data);
        alert(
          data.message || data.title || 'Error while deleting question.'
        );
        return;
      }

      await loadQuestions();
    } catch (err) {
      console.error('Delete question fetch error:', err);
      alert('Connection error while deleting question.');
    }

    e.stopPropagation();
    return;
  }

  const tr = target.closest('tr');
  if (tr && tr.dataset.id) {
    selectedQuestionId = Number(tr.dataset.id);
    renderQuestionDetails();
  }
});

// ------- Start edit question -------
function startEditQuestion(id) {
  const q = questions.find((x) => x.id === id);
  if (!q) return;

  editingQuestionId = id;
  questionFormMessage.textContent = '';
  questionFormMessage.className = 'message';

  qTitle.value = q.title || '';
  qText.value = q.text || '';
  qType.value = q.type || '';
  qSeniority.value = q.seniority || '';
  qTrack.value = q.trackName || '';

  if (q.type === 'Coding') {
    codingFields.style.display = '';
    mcqFields.style.display = 'none';
  } else if (q.type === 'MCQ') {
    codingFields.style.display = 'none';
    mcqFields.style.display = '';
  } else {
    codingFields.style.display = 'none';
    mcqFields.style.display = 'none';
  }

  if (qSkillsSelect && allSkills.length && q.skills && q.skills.length) {
    const lowerNames = q.skills.map((s) => String(s).toLowerCase());
    let matchedId = '';

    for (const skill of allSkills) {
      const skillName = (
        skill.name ||
        skill.skillName ||
        skill.title ||
        ''
      ).toLowerCase();
      if (skillName && lowerNames.includes(skillName)) {
        matchedId = String(skill.id);
        break;
      }
    }

    qSkillsSelect.value = matchedId || '';
  } else if (qSkillsSelect) {
    qSkillsSelect.value = '';
  }

  showQuestionEditor(true);
}

// ------- Save question (add/edit) -> API -------
questionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  questionFormMessage.textContent = '';
  questionFormMessage.className = 'message';

  const title = qTitle.value.trim();
  const text = qText.value.trim();
  const type = qType.value;
  const seniority = qSeniority.value;
  const trackName = qTrack.value; // مش رايح للـ API دلوقتى

  if (!title || !text || !type || !seniority) {
    questionFormMessage.textContent = 'Please fill required fields.';
    questionFormMessage.classList.add('error');
    return;
  }

  let skillIds = [];
  let skillsArr = [];

  if (qSkillsSelect) {
    const selectedId = qSkillsSelect.value;
    if (selectedId) {
      skillIds = [Number(selectedId)];
      const selectedText =
        qSkillsSelect.options[qSkillsSelect.selectedIndex].textContent.trim();
      skillsArr = [selectedText];
    }
  }

  const token = localStorage.getItem('token');
  let urlBase;
  let payload;

  if (type === 'Coding') {
    urlBase = '/api/questions/coding';

    const timeLimit = qTimeLimit.value ? Number(qTimeLimit.value) : 0;
    const memoryLimit = qMemoryLimit.value ? Number(qMemoryLimit.value) : 0;

    payload = {
      title,
      text,
      seniorityLevel: seniority,
      skillIds,
      templates: [
        {
          languageId: 1,
          timeLimit,
          memoryLimit,
          defaultCode: qDefaultCode.value,
          driverCode: qDriverCode.value
        }
      ],
      testCases: [
        {
          input: qTestInput.value,
          expectedOutput: qTestExpected.value,
          isHidden: false
        }
      ]
    };
  } else if (type === 'MCQ') {
    urlBase = '/api/questions/mcq';

    const optionsTexts = [opt1.value, opt2.value, opt3.value, opt4.value];
    const correctIndex =
      qCorrectIndex.value !== '' ? Number(qCorrectIndex.value) : -1;

    if (optionsTexts.some((t) => !t.trim()) || correctIndex < 0) {
      questionFormMessage.textContent =
        'Fill all options and select the correct one.';
      questionFormMessage.classList.add('error');
      return;
    }

    payload = {
      title,
      text,
      seniorityLevel: seniority,
      skillIds,
      options: optionsTexts.map((t, idx) => ({
        optionText: t.trim(),
        isCorrect: idx === correctIndex
      }))
    };
  } else {
    questionFormMessage.textContent = 'Invalid question type.';
    questionFormMessage.classList.add('error');
    return;
  }

  const isEdit = !!editingQuestionId;
  const url = isEdit ? `${urlBase}/${editingQuestionId}` : urlBase;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Save question error:', data);
      questionFormMessage.textContent =
        data.message || data.title || 'Error while saving question.';
      questionFormMessage.classList.add('error');
      return;
    }

    questionFormMessage.textContent = 'Question saved successfully.';
    questionFormMessage.classList.add('success');

    setTimeout(() => {
      showQuestionsList();
      loadQuestions();
    }, 600);
  } catch (err) {
    console.error('Save question fetch error:', err);
    questionFormMessage.textContent =
      'Connection error while saving question.';
    questionFormMessage.classList.add('error');
  }
});

// ======== helper: refresh selects of tracks ========
function refreshTrackOptions() {
  skillTrackSelect.innerHTML = '<option value="">Select track</option>';
  qTrack.innerHTML = '<option value="">Select track</option>';

  tracks.forEach((track) => {
    const opt1 = document.createElement('option');
    opt1.value = track.id;
    opt1.textContent = track.name;
    skillTrackSelect.appendChild(opt1);

    const opt3 = document.createElement('option');
    opt3.value = track.id;
    opt3.textContent = track.name;
    qTrack.appendChild(opt3);
  });
}

// ================== initial renders ==================
loadTracks();
loadSkills();
loadQuestions();