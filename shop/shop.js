(function () {

  'use strict';

  const productList = document.getElementById('product-list');

  if (!productList) {
    return;
  }

  const products = [
    'linkbio',
    'nstore'
  ];

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
        <article class="product-card">

          <a
            class="product-image"
            href="/products/${item.slug}"
          >
            <img
              src="${image}"
              alt="${product.name || ''}"
              loading="lazy"
              decoding="async"
            >
          </a>

          <div class="product-content">

            <span class="product-category">
              ${product.category || 'Templates'}
            </span>

            <h3>
              <a href="/products/${item.slug}">
                ${product.name || ''}
              </a>
            </h3>

            <p>
              ${description}
            </p>

            <div class="product-footer">

              <strong>
                ${product.price || ''}
              </strong>

              <a
                href="/products/${item.slug}"
                class="product-link"
              >
                View Product
              </a>

            </div>

          </div>

        </article>
      `;

    }).join('');

  })

  .catch(function (error) {

    console.error(error);

    productList.innerHTML =
      '<p>Unable to load products.</p>';

  });

})();
