const form = document.getElementById('registerForm');
const messageEl = document.getElementById('message');

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  messageEl.textContent = '';
  messageEl.className = 'message';

  const username = document.getElementById('username').value.trim();
  const displayName = document.getElementById('displayName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phoneNumber = document.getElementById('phoneNumber').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (!username || !displayName || !email || !phoneNumber || !password || !confirmPassword) {
    messageEl.textContent = 'من فضلك املأ كل الحقول';
    messageEl.classList.add('error');
    return;
  }

  if (password.length < 8) {
    messageEl.textContent = 'الباسورد لازم تكون على الأقل 8 حروف/أرقام';
    messageEl.classList.add('error');
    return;
  }

  if (password !== confirmPassword) {
    messageEl.textContent = 'كلمتا المرور غير متطابقتين';
    messageEl.classList.add('error');
    return;
  }

  if (!phoneNumber) {
    messageEl.textContent = 'اكتب رقم التليفون بشكل صحيح';
    messageEl.classList.add('error');
    return;
  }

  // نثبت الـ role على "Admin" فقط
  const payload = {
    username: username,
    email: email,
    phoneNumber: phoneNumber,
    passWord: password,   // مطابق لاسم الحقل في Swagger
    displayName: displayName,
    role: 'Admin'
  };

  console.log('register payload:', payload);

  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('register error response:', data);

      let msg =
        data.message ||
        (data.title === 'validation_error' ? 'خطأ في البيانات المُدخلة' : null) ||
        'حصل خطأ في السيرفر أثناء إنشاء الحساب';

      if (data.validationErrors) {
        const ve = data.validationErrors;
        if (ve.PhoneNumber && ve.PhoneNumber[0]) {
          msg = ve.PhoneNumber[0];
        }
      }

      messageEl.textContent = msg;
      messageEl.classList.add('error');
      return;
    }

    // نخزن الـ displayName في localStorage عشان نستخدمه بعد كده
    localStorage.setItem('userName', displayName);

    messageEl.textContent = 'تم إنشاء حساب الأدمن بنجاح! هتتحول لصفحة تسجيل الدخول بعد لحظات.';
    messageEl.classList.add('success');

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
  } catch (err) {
    console.error('register fetch error:', err);
    messageEl.textContent = 'حصلت مشكلة في الاتصال بالسيرفر المحلي';
    messageEl.classList.add('error');
  }
});