// script.js

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const toggleButton = document.querySelector('.nav-toggle');
  
  toggleButton.addEventListener('click', () => {
    header.classList.toggle('open');
  });

  // Tab switching logic
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      button.classList.add('active');

      // Hide all tab contents
      tabContents.forEach(content => content.classList.remove('active'));

      // Show selected tab content
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
});
