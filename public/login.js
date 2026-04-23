const form = document.getElementById('loginForm');
const messageEl = document.getElementById('message');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  messageEl.textContent = '';
  messageEl.className = 'message';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    messageEl.textContent = 'من فضلك املأ كل الحقول';
    messageEl.classList.add('error');
    return;
  }

  try {
    fetch('http://mockmate-001-site1.mtempurl.com/api/users/login',  {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json().catch(() => ({}));
    console.log('login response:', data);

    if (!response.ok) {
      const msg =
        data.message ||
        (data.title === 'validation_error' ? 'بيانات غير صحيحة' : null) ||
        'خطأ في تسجيل الدخول';
      messageEl.textContent = msg;
      messageEl.classList.add('error');
      return;
    }

    
    const token = data.token || data.accessToken || 'dummy-token';

    
    let userName = localStorage.getItem('userName') || email;

    
    if (data.displayName) {
      userName = data.displayName;
    } else if (data.user) {
      if (data.user.displayName) {
        userName = data.user.displayName;
      } else if (data.user.name) {
        userName = data.user.name;
      } else if (data.user.userName) {
        userName = data.user.userName;
      }
    } else if (data.userName) {
      userName = data.userName;
    }

    
    localStorage.setItem('token', token);
    localStorage.setItem('userName', userName);

    messageEl.textContent = 'تم تسجيل الدخول بنجاح!';
    messageEl.classList.add('success');

    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  } catch (err) {
    console.error('login fetch error:', err);
    messageEl.textContent = 'حصلت مشكلة في الاتصال بالسيرفر المحلي';
    messageEl.classList.add('error');
  }
});