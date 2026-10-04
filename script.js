document.addEventListener('DOMContentLoaded', function () {
  const items = document.querySelectorAll('.bioLink-item');
  if (!items.length) return;
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
      if (!entry.isIntersecting) return;
      const item = entry.target;
      item.style.transitionDelay = `${index * 70}ms`;
      item.classList.add('is-visible');
      observer.unobserve(item);
    });
  }, {
    threshold: 0.12
  });
  items.forEach(item => observer.observe(item));
});
