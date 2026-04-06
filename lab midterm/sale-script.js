$(document).ready(function () {

  var AUTOPLAY_INTERVAL = 5000;
  var TOTAL_CARDS = $('#product-carousel > div').length;
  var $carousel = $('#product-carousel');

  // Initialize Slick Carousel
  $carousel.slick({
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    speed: 500,
    cssEase: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    arrows: false,
    dots: true,
    autoplay: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 1 }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1 }
      }
    ]
  });

  // Custom Prev / Next Buttons (jQuery)
  $('#carousel-prev').on('click', function () {
    $carousel.slick('slickPrev');
  });
  $('#carousel-next').on('click', function () {
    $carousel.slick('slickNext');
  });

  // Slide Counter – updates on every slide change
  function updateCounter() {
    var currentSlide = $carousel.slick('slickCurrentSlide') + 1;
    $('#slide-counter').text('Showing ' + currentSlide + ' of ' + TOTAL_CARDS);
  }
  updateCounter();
  $carousel.on('afterChange', function () {
    updateCounter();
  });

  // AI-Enhanced Auto-Play with Hover Pause
  // Auto-advances every 5 seconds, pauses when mouse hovers over a product card
  var progressTimer = null;
  var isPaused = false;
  var elapsed = 0;
  var lastTimestamp = null;
  var $fill = $('#autoplay-fill');

  function animateProgress(timestamp) {
    if (isPaused) {
      lastTimestamp = null;
      return;
    }
    if (!lastTimestamp) lastTimestamp = timestamp;
    var delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
    elapsed += delta;

    var percent = Math.min((elapsed / AUTOPLAY_INTERVAL) * 100, 100);
    $fill.css('width', percent + '%');

    if (elapsed >= AUTOPLAY_INTERVAL) {
      $carousel.slick('slickNext');
      elapsed = 0;
    }
    progressTimer = requestAnimationFrame(animateProgress);
  }

  function startAutoplay() {
    isPaused = false;
    lastTimestamp = null;
    progressTimer = requestAnimationFrame(animateProgress);
  }

  function pauseAutoplay() {
    isPaused = true;
    if (progressTimer) {
      cancelAnimationFrame(progressTimer);
      progressTimer = null;
    }
  }

  // Reset progress bar on manual slide change
  $carousel.on('beforeChange', function () {
    elapsed = 0;
    $fill.css('width', '0%');
  });

  // Pause on hover, resume on mouse leave
  $(document).on('mouseenter', '.product-card', function () {
    pauseAutoplay();
  });
  $(document).on('mouseleave', '.product-card', function () {
    startAutoplay();
  });

  startAutoplay();

});
