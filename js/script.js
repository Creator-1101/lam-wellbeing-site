// script.js

document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.site-header');
    const toggleButton = document.querySelector('.nav-toggle');
  
    toggleButton.addEventListener('click', () => {
      header.classList.toggle('open');
    });
  });
  