(function () {

  'use strict';

  const productList = document.getElementById('product-list');

  if (!productList) {
    return;
  }

  const products = [
    'linkbio',
    'nstore',
    'iqone'
  ];

  /*
   * Product animation
   */
  function initProductAnimation() {

    const animatedItems = productList.querySelectorAll('.product-card');

    if (!animatedItems.length) {
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {

        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
  entry.target.classList.add('is-visible');
  observer.unobserve(entry.target);
}

        });

      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    animatedItems.forEach(function (item, index) {

      item.style.transitionDelay = (index * 0.08) + 's';

      observer.observe(item);

    });

  }


  /*
   * Load products
   */
  Promise.all(

    products.map(function (slug) {

      return fetch('/products/data/' + slug + '.json')

        .then(function (response) {

          if (!response.ok) {

            throw new Error(
              'Product data not found: ' + slug
            );

          }

          return response.json();

        })

        .then(function (data) {

          return {
            slug: slug,
            data: data
          };

        });

    })

  )

  .then(function (items) {

    productList.innerHTML = items.map(function (item) {

      const product = item.data;

      const image =
        Array.isArray(product.images) &&
        product.images.length
          ? product.images[0]
          : '';

      const description =
        Array.isArray(product.description)
          ? product.description[0]
          : (product.description || '');

      return `
        <article class='product-card'>
          <a href='/products/${item.slug}' title='${product.name || ''}'>

            <div class='product-image'>

              <img
                alt='${product.name || ''}'
                decoding='async'
                loading='lazy'
                src='${image}'
              />

              <span class='product-category'>
                ${product.category || 'Theme'}
              </span>

            </div>

            <div class='product-content'>

              <div class='entry-meta'>

                <div class='entry-title'>
                  <h2>${product.name || ''}</h2>
                </div>

                <div class='product-price'>
                  <strong class='item-price'>
                    ${product.price || ''}
                  </strong>

                  <strike class='off-price'>
                    $26.95
                  </strike>
                </div>

              </div>

              <div class='entry-more'>
                <svg
                  fill='none'
                  height='16'
                  stroke='currentColor'
                  stroke-width='1.8'
                  viewBox='0 0 24 24'
                  width='16'>
                  <path
                    d='m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25'
                    stroke-linecap='round'
                    stroke-linejoin='round'/>
                </svg>
              </div>

            </div>

          </a>
        </article>
      `;

    }).join('');


    /*
     * IMPORTANT:
     * Jalankan observer setelah product-card
     * sudah masuk ke DOM.
     */
    initProductAnimation();

  })

  .catch(function (error) {

    console.error(error);

    productList.innerHTML =
      '<p>Unable to load products.</p>';

  });

})();
