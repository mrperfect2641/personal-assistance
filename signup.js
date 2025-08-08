// signup.js — robust EmailJS loader + OTP sender, keeps sessionStorage pending
document.addEventListener('DOMContentLoaded', function () {
  const EMAILJS_PUBLIC_KEY = '-lwffzBCjzXhsZ1tD';      // <-- replace
  const EMAILJS_SERVICE_ID = 'service_16aqbd7';      // <-- replace
  const EMAILJS_TEMPLATE_ID = 'template_q7r0t24';    // <-- replace
  const EMAILJS_SDK_URL = 'https://cdn.emailjs.com/sdk/3.2.0/email.min.js';

  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const passwordToggle = document.getElementById('passwordToggle');
  const matchMessage = document.getElementById('match-message');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const form = document.getElementById('signup-form');

  const rules = {
    length: document.getElementById('length-rule'),
    uppercase: document.getElementById('uppercase-rule'),
    lowercase: document.getElementById('lowercase-rule'),
    number: document.getElementById('number-rule'),
    special: document.getElementById('special-rule')
  };

  if (!passwordInput || !confirmPasswordInput || !form || !nameInput || !emailInput) {
    console.warn('signup.js: required elements not found.');
    return;
  }

  if (passwordToggle) {
    passwordToggle.addEventListener('click', function () {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  }

  function updateRule(ruleElement, isValid) {
    if (!ruleElement) return;
    const icon = ruleElement.querySelector('i');
    if (isValid) {
      ruleElement.classList.remove('invalid');
      ruleElement.classList.add('valid');
      if (icon) icon.className = 'fas fa-check-circle';
    } else {
      ruleElement.classList.remove('valid');
      ruleElement.classList.add('invalid');
      if (icon) icon.className = 'fas fa-circle';
    }
  }

  function validatePassword(password) {
    updateRule(rules.length, password.length >= 8);
    updateRule(rules.uppercase, /[A-Z]/.test(password));
    updateRule(rules.lowercase, /[a-z]/.test(password));
    updateRule(rules.number, /\d/.test(password));
    updateRule(rules.special, /[!@#$%^&*(),.?":{}|<>]/.test(password));
  }

  function checkPasswordMatch() {
    const p = passwordInput.value;
    const c = confirmPasswordInput.value;
    if (p === c && p !== '') {
      matchMessage.classList.remove('invalid');
      matchMessage.classList.add('valid');
      matchMessage.innerHTML = '<i class="fas fa-check-circle"></i> Passwords match';
    } else {
      matchMessage.classList.remove('valid');
      matchMessage.classList.add('invalid');
      matchMessage.innerHTML = '<i class="fas fa-times-circle"></i> Passwords must match';
    }
  }

  passwordInput.addEventListener('input', function () {
    validatePassword(this.value);
    checkPasswordMatch();
  });

  confirmPasswordInput.addEventListener('input', checkPasswordMatch);

  function generateOTP(length = 6) {
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(n => (n % 10).toString()).join('').slice(0, length);
  }

  // Dynamically load EmailJS SDK if not present
  function loadEmailJSSDK(publicKey) {
    return new Promise((resolve, reject) => {
      if (window.emailjs && typeof window.emailjs.init === 'function') {
        try {
          window.emailjs.init(publicKey);
        } catch (err) { /* ignore init error if already initialized */ }
        return resolve(window.emailjs);
      }

      // If a script tag already exists and is loading, wait for it
      const existing = Array.from(document.getElementsByTagName('script'))
        .find(s => s.src && s.src.indexOf('emailjs.com') !== -1);

      if (existing) {
        existing.addEventListener('load', () => {
          try { window.emailjs.init(publicKey); } catch (e) {}
          return resolve(window.emailjs);
        });
        existing.addEventListener('error', () => reject(new Error('Failed to load EmailJS script')));
        return;
      }

      // Create script tag
      const script = document.createElement('script');
      script.src = EMAILJS_SDK_URL;
      script.async = true;
      script.onload = function () {
        try { 
          if (window.emailjs && typeof window.emailjs.init === 'function') {
            window.emailjs.init(publicKey);
            resolve(window.emailjs);
          } else {
            reject(new Error('EmailJS loaded but SDK not available on window.emailjs'));
          }
        } catch (err) {
          reject(err);
        }
      };
      script.onerror = function () {
        reject(new Error('Failed to load EmailJS SDK'));
      };
      document.head.appendChild(script);
    });
  }

  // send email via EmailJS (ensure SDK present or load it)
  async function sendOtpEmail(serviceID, templateID, templateParams) {
    try {
      await loadEmailJSSDK(EMAILJS_PUBLIC_KEY);
      if (!window.emailjs || typeof window.emailjs.send !== 'function') {
        throw new Error('EmailJS loaded but emailjs.send not found');
      }
      return window.emailjs.send(serviceID, templateID, templateParams);
    } catch (err) {
      // propagate error to caller so we can fallback
      throw err;
    }
  }

  form.addEventListener('submit', async function onSignup(e) {
  e.preventDefault();

  // Prevent accidental second trigger
  if (form.dataset.submitted === "true") return;
  form.dataset.submitted = "true";

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  const allRulesValid = Object.values(rules).every(rule => rule && rule.classList.contains('valid'));
  const passwordsMatch = password === confirmPassword && password !== '';

  if (!name || !email || !password) {
    alert('Please fill all required fields.');
    if (submitBtn) submitBtn.disabled = false;
    form.dataset.submitted = "false";
    return;
  }
  if (!allRulesValid || !passwordsMatch) {
    alert('Please complete all password requirements and make sure passwords match.');
    if (submitBtn) submitBtn.disabled = false;
    form.dataset.submitted = "false";
    return;
  }

  const otp = generateOTP(6);
  const otpExpiresAt = Date.now() + (10 * 60 * 1000);
  const expiryTime = new Date(otpExpiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  sessionStorage.setItem('pendingRegistration', JSON.stringify({
    name,
    email,
    otp,
    otpExpiresAt,
    password
  }));

  const templateParams = {
    email: email,
    otp: otp,
    time: expiryTime
  };

  try {
    await sendOtpEmail(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    console.info('OTP sent to', email);
    window.location.href = 'verify.html';
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    console.info(`DEV OTP for ${email}: ${otp} (expires in 10 minutes)`);
    alert('Email sending failed. OTP printed in console.');
    window.location.href = 'verify.html';
  }
}, { once: true });


  // Modal handlers (if present)
  window.closeUsernameModal = () => {
    const modal = document.getElementById('usernameExistsModal');
    if (modal) modal.classList.add('d-none');
  };

  window.closeEmailModal = () => {
    const modal = document.getElementById('emailExistsModal');
    if (modal) modal.classList.add('d-none');
  };

  window.redirectToLogin = () => {
    window.location.href = 'login.html';
  };
});
