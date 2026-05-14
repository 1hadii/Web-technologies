var hamburger = document.getElementById('hamburger');
var sidebar = document.getElementById('sidebar');
var overlay = document.getElementById('sidebar-overlay');
var closeBtn = document.getElementById('sidebar-close');

// Open sidebar
hamburger.addEventListener('click', function () {
  sidebar.classList.add('open');
  overlay.classList.add('active');
});

// Close sidebar via X button
closeBtn.addEventListener('click', function () {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
});

// Close sidebar when clicking the dark overlay
overlay.addEventListener('click', function () {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
});
