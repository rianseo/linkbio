document.addEventListener('DOMContentLoaded', function () {

  /*
   * ==========================================
   * PRODUCT DATA
   * ==========================================
   */

  const productName = document.querySelector('.entry-title');
  const productCategory = document.querySelector('.product-category');
  const itemPrice = document.querySelector('.item-price');
  const offPrice = document.querySelector('.off-price');
  const productDescription = document.querySelector('.product-description');
  const productImages = document.querySelector('.product-image');
  const demoButton = document.querySelector('.icon-buy');
  const buyButton = document.querySelector('.product-button > a:last-child');

  /*
   * Ambil nama file dari URL
   *
   * /products/linkbio
   *        ↓
   *      linkbio
   *
   * /products/nstore
   *        ↓
   *      nstore
   */

 const path = window.location.pathname.replace(/\/+$/, '');

const match = path.match(/^\/products\/([^/]+)$/);

const productSlug = match ? match[1] : null;

if (!productSlug || productSlug === 'product') {
  console.error('Product slug not found.');
  return;
}

fetch('/products/data/' + productSlug + '.json')
  .then(function (response) {
    if (!response.ok) {
      throw new Error('Product data not found: ' + productSlug);
    }

    return response.json();
  })
  
    .then(function (product) {

      /*
       * PRODUCT INFO
       */

      if (productName) {
        productName.textContent = product.name || '';
      }

      if (productCategory) {
        productCategory.textContent = product.category || '';
      }

      if (itemPrice) {
        itemPrice.textContent = product.price || '';
      }

      if (offPrice) {
        offPrice.textContent = product.oldPrice || '';
      }

      /*
       * DESCRIPTION
       */

      if (productDescription) {

        productDescription.innerHTML = '';

        if (Array.isArray(product.description)) {
          product.description.forEach(function (text) {

            const paragraph = document.createElement('p');

            paragraph.textContent = text;

            productDescription.appendChild(paragraph);

          });
        }

        /*
         * FEATURES
         */

        if (Array.isArray(product.features) && product.features.length) {

          const title = document.createElement('h3');

          title.textContent = 'Fitur :';

          productDescription.appendChild(title);

          const list = document.createElement('ul');

          product.features.forEach(function (feature) {

            const item = document.createElement('li');

            item.textContent = feature;

            list.appendChild(item);

          });

          productDescription.appendChild(list);
        }
      }

      /*
       * PRODUCT IMAGES
       */

      if (productImages && Array.isArray(product.images)) {

        productImages.innerHTML = '';

        product.images.forEach(function (image, index) {

          const img = document.createElement('img');

          img.src = image;
          img.alt = product.name + ' ' + String(index + 1);

          productImages.appendChild(img);

        });
      }

      /*
       * BUTTONS
       */

      if (demoButton && product.demo) {
        demoButton.href = product.demo;
      }

      if (buyButton && product.buy) {
        buyButton.href = product.buy;
      }

      /*
       * Setelah gambar dimasukkan,
       * jalankan kembali slider.
       */

      initProductSlider();

    })
    .catch(function (error) {

      console.error(error);

    });


  /*
   * ==========================================
   * PRODUCT SLIDER
   * ==========================================
   */

  function initProductSlider() {

    const slider = document.querySelector('.product-image');

    if (!slider) return;

    const images = Array.from(
      slider.querySelectorAll('img')
    );

    if (images.length <= 1) return;

    /*
     * Hindari slider dibuat dua kali
     */

    if (slider.classList.contains('product-slider')) return;

    let current = 0;

    let startX = 0;
    let startY = 0;

    const threshold = 45;

    slider.classList.add('product-slider');


    /*
     * IMAGE INITIALIZATION
     */

    images.forEach(function (img, index) {

      img.classList.add('product-slide');

      img.draggable = false;

      if (index === 0) {
        img.classList.add('active');
      } else {
        img.classList.remove('active');
      }

    });


    /*
     * PREVIOUS BUTTON
     */

    const prev = document.createElement('button');

    prev.className = 'product-slider-prev';

    prev.type = 'button';

    prev.setAttribute(
      'aria-label',
      'Previous image'
    );

    prev.innerHTML = `
      <svg fill="none" height="20" stroke="currentColor"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="1.5" viewBox="0 0 24 24" width="20">
      <path d="m15 18-6-6 6-6"/>
      </svg>
    `;


    /*
     * NEXT BUTTON
     */

    const next = document.createElement('button');

    next.className = 'product-slider-next';

    next.type = 'button';

    next.setAttribute(
      'aria-label',
      'Next image'
    );

    next.innerHTML = `
      <svg fill="none" height="20" stroke="currentColor"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-width="1.5" viewBox="0 0 24 24" width="20">
      <path d="m9 18 6-6-6-6"/>
      </svg>
    `;


    slider.appendChild(prev);
    slider.appendChild(next);


    /*
     * DOTS
     */

    const dots = document.createElement('div');

    dots.className = 'product-slider-dots';

    images.forEach(function (img, index) {

      const dot = document.createElement('button');

      dot.type = 'button';

      dot.className = 'product-slider-dot';

      dot.setAttribute(
        'aria-label',
        'Go to image ' + (index + 1)
      );

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


    /*
     * CHANGE SLIDE
     */

    function goToSlide(index) {

      images[current].classList.remove('active');

      dotItems[current].classList.remove('active');

      current =
        (index + images.length) %
        images.length;

      images[current].classList.add('active');

      dotItems[current].classList.add('active');

    }


    /*
     * BUTTON EVENTS
     */

    prev.addEventListener('click', function () {
      goToSlide(current - 1);
    });

    next.addEventListener('click', function () {
      goToSlide(current + 1);
    });


    /*
     * TOUCH SWIPE
     */

    slider.addEventListener(
      'touchstart',
      function (event) {

        if (event.touches.length !== 1) return;

        startX = event.touches[0].clientX;

        startY = event.touches[0].clientY;

      },
      { passive: true }
    );


    slider.addEventListener(
      'touchend',
      function (event) {

        if (!startX) return;

        const diffX =
          event.changedTouches[0].clientX -
          startX;

        const diffY =
          event.changedTouches[0].clientY -
          startY;

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

      },
      { passive: true }
    );


    /*
     * PREVENT IMAGE DRAG
     */

    slider.addEventListener(
      'dragstart',
      function (event) {

        if (event.target.tagName === 'IMG') {
          event.preventDefault();
        }

      }
    );


    /*
     * KEYBOARD
     */

    slider.addEventListener(
      'keydown',
      function (event) {

        if (event.key === 'ArrowLeft') {
          goToSlide(current - 1);
        }

        if (event.key === 'ArrowRight') {
          goToSlide(current + 1);
        }

      }
    );

    slider.setAttribute('tabindex', '0');

  }


  /*
   * ==========================================
   * PAGE ENTRANCE ANIMATION
   * ==========================================
   */

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
