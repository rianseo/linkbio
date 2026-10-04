document.addEventListener('DOMContentLoaded', function () {
  const slider = document.querySelector('.product-image');

  if (!slider) return;

  const images = Array.from(slider.querySelectorAll('img'));

  if (images.length <= 1) return;

  let current = 0;
  let startX = 0;
  let startY = 0;
  let moved = false;

  const threshold = 45;

  slider.classList.add('product-slider');

  // Slides
  images.forEach((img, index) => {
    img.classList.add('product-slide');
    img.draggable = false;

    if (index === 0) {
      img.classList.add('active');
    } else {
      img.classList.remove('active');
    }
  });

  // Previous button - SVG dipertahankan
  const prev = document.createElement('button');
  prev.className = 'product-slider-prev';
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Previous image');
  prev.innerHTML = '<svg fill="none" height="22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="22"><g transform="translate(12.000000, 12.000000) rotate(-270.000000) translate(-12.000000, -12.000000) translate(5.500000, 4.000000)"><line x1="6.7743" y1="15.7501" x2="6.7743" y2="0.7501"></line><path d="M12.7988,9.6998 C12.7988,9.6998 9.5378,15.7498 6.7758,15.7498 C4.0118,15.7498 0.7498,9.6998 0.7498,9.6998"></path></g></svg>';

  // Next button - SVG dipertahankan
  const next = document.createElement('button');
  next.className = 'product-slider-next';
  next.type = 'button';
  next.setAttribute('aria-label', 'Next image');
  next.innerHTML = '<svg fill="none" height="22" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="22"><g transform="translate(12.000000, 12.000000) rotate(-90.000000) translate(-12.000000, -12.000000) translate(5.500000, 4.000000)"><line x1="6.7743" y1="15.7501" x2="6.7743" y2="0.7501"></line><path d="M12.7988,9.6998 C12.7988,9.6998 9.5378,15.7498 6.7758,15.7498 C4.0118,15.7498 0.7498,9.6998 0.7498,9.6998"></path></g></svg>';

  slider.appendChild(prev);
  slider.appendChild(next);

  // Dots
  const dots = document.createElement('div');
  dots.className = 'product-slider-dots';

  images.forEach((img, index) => {
    const dot = document.createElement('button');

    dot.type = 'button';
    dot.className = 'product-slider-dot';
    dot.setAttribute('aria-label', 'Go to image ' + (index + 1));

    if (index === 0) {
      dot.classList.add('active');
    }

    dot.addEventListener('click', function () {
      goToSlide(index);
    });

    dots.appendChild(dot);
  });

  slider.appendChild(dots);

  const dotItems = Array.from(
    dots.querySelectorAll('.product-slider-dot')
  );

  // Change slide
  function goToSlide(index) {
    images[current].classList.remove('active');
    dotItems[current].classList.remove('active');

    current = (index + images.length) % images.length;

    images[current].classList.add('active');
    dotItems[current].classList.add('active');
  }

  // Navigation buttons
  prev.addEventListener('click', function () {
    goToSlide(current - 1);
  });

  next.addEventListener('click', function () {
    goToSlide(current + 1);
  });

  // Swipe support for mobile
  slider.addEventListener('touchstart', function (event) {
    if (event.touches.length !== 1) return;

    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    moved = false;
  }, { passive: true });

  slider.addEventListener('touchmove', function (event) {
    if (event.touches.length !== 1) return;

    const diffX = event.touches[0].clientX - startX;
    const diffY = event.touches[0].clientY - startY;

    if (
      Math.abs(diffX) > 10 &&
      Math.abs(diffX) > Math.abs(diffY)
    ) {
      moved = true;
    }
  }, { passive: true });

  slider.addEventListener('touchend', function (event) {
    if (!startX) return;

    const diffX = event.changedTouches[0].clientX - startX;
    const diffY = event.changedTouches[0].clientY - startY;

    if (
      Math.abs(diffX) >= threshold &&
      Math.abs(diffX) > Math.abs(diffY)
    ) {
      if (diffX < 0) {
        goToSlide(current + 1);
      } else {
        goToSlide(current - 1);
      }
    }

    startX = 0;
    startY = 0;
  }, { passive: true });

  // Prevent image drag on desktop
  slider.addEventListener('dragstart', function (event) {
    if (event.target.tagName === 'IMG') {
      event.preventDefault();
    }
  });

  // Keyboard navigation
  slider.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') {
      goToSlide(current - 1);
    } else if (event.key === 'ArrowRight') {
      goToSlide(current + 1);
    }
  });

  slider.setAttribute('tabindex', '0');
});

document.addEventListener('DOMContentLoaded', function () {

  const animatedItems = document.querySelectorAll(
    '.product-nav, .product-image, .product-content, .product-button'
  );

  if (!animatedItems.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {

        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          entry.target.classList.remove('is-visible');
        }

      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  animatedItems.forEach(function (item) {
    observer.observe(item);
  });

});
