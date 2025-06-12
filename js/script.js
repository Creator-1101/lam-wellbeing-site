// js/script.js

// Navigation toggle (for mobile hamburger menu)
document.addEventListener('DOMContentLoaded', () => {
  const navToggle = document.querySelector('.nav-toggle');
  const navList   = document.querySelector('.nav-list');
  navToggle.addEventListener('click', () => {
    navList.classList.toggle('nav-list-visible');
  });
  // Add any tab-switching logic here
});

// Contact form submission
const form = document.getElementById('contactForm');
const feedback = document.getElementById('formFeedback');
const ENDPOINT = 'https://europe-west2-project-mimi-462709.cloudfunctions.net/handleContactForm';

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  feedback.classList.remove('visible');
  feedback.textContent = '';

  // Gather form data
  const payload = {
    name:    form.name.value,
    email:   form.email.value,
    phone:   form.phone.value,
    message: form.message.value,
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      form.reset();
      feedback.textContent = 'Thank you! Your message has been sent.';
      feedback.classList.add('visible');
    } else {
      feedback.textContent = 'Error sending form. Please try again later.';
      feedback.classList.add('visible');
    }
  } catch (err) {
    console.error('Submit error', err);
    feedback.textContent = 'Network error. Please try again later.';
    feedback.classList.add('visible');
  }
});
