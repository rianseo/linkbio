(function () {

  'use strict';

  const productList = document.getElementById('product-list');

  if (!productList) {
    return;
  }

  const products = [
    'mrv',
    'iqone',
    'linkbio',
    'nstore'
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

      /*
       * Price
       */
      const price =
        product.price !== undefined &&
        product.price !== null
          ? product.price
          : '';

      /*
       * Old price
       */
      const oldPrice =
        product.oldPrice !== undefined &&
        product.oldPrice !== null &&
        String(product.oldPrice).trim() !== ''
          ? product.oldPrice
          : '';

      /*
       * Old price HTML
       */
      const oldPriceHTML = oldPrice
        ? `<strike class='off-price'>${oldPrice}</strike>`
        : '';

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
                    ${price}
                  </strong>

                  ${oldPriceHTML}

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


/* Search JS AI */
(function () {

  'use strict';

  const form = document.getElementById('aiSearchForm');
  const input = document.getElementById('aiSearchInput');
  const results = document.getElementById('aiSearchResults');

  if (!form || !input || !results) {
    return;
  }

  const SEARCH_API =
    'https://search.rianseo.workers.dev/api/search';


  /*
   * Escape HTML
   */
  function escapeHTML(value) {

    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  }


  /*
   * Get product slug
   */
  function getProductSlug(url) {

    try {

      const parsedURL =
        new URL(url);

      const match =
        parsedURL.pathname.match(
          /^\/products\/([^/]+)\/?$/
        );

      return match
        ? decodeURIComponent(match[1])
        : '';

    } catch (error) {

      console.error(
        'Invalid product URL:',
        url
      );

      return '';

    }

  }


  /*
   * Extract Product URL
   *
   * Supports:
   *
   * Product URL:
   * [https://rianseo.site/products/linkbio](https://rianseo.site/products/linkbio)
   *
   * And also:
   *
   * Product URL: [URL](URL)
   */
  function extractProductURL(text) {

    /*
     * Markdown URL anywhere in the text
     */
    const markdownMatch =
      text.match(
        /\[https?:\/\/[^\]]+\]\((https?:\/\/[^)]+)\)/i
      );


    if (markdownMatch) {

      return markdownMatch[1];

    }


    /*
     * Plain URL fallback
     */
    const plainURLMatch =
      text.match(
        /https?:\/\/[^\s)]+/i
      );


    if (plainURLMatch) {

      return plainURLMatch[0];

    }


    return '';

  }


  /*
   * Load product JSON
   */
  async function loadProduct(slug) {

    if (!slug) {
      return null;
    }

    try {

      const response =
        await fetch(
          '/products/data/' +
          encodeURIComponent(slug) +
          '.json'
        );


      if (!response.ok) {

        throw new Error(
          'Product data not found: ' +
          slug +
          ' (' +
          response.status +
          ')'
        );

      }


      return await response.json();

    } catch (error) {

      console.error(
        'Product JSON:',
        slug,
        error
      );

      return null;

    }

  }


  /*
   * Create product card
   */
  function createProductCard(
    product,
    url
  ) {

    if (!product) {
      return '';
    }


    const name =
      product.name || 'Product';


    const category =
      product.category || 'Theme';


    const image =
      Array.isArray(product.images) &&
      product.images.length
        ? product.images[0]
        : '';


    const description =
      Array.isArray(product.description)
        ? product.description[0]
        : (product.description || '');


    const price =
      product.price !== undefined &&
      product.price !== null
        ? product.price
        : '';


    const oldPrice =
      product.oldPrice !== undefined &&
      product.oldPrice !== null &&
      String(product.oldPrice).trim() !== ''
        ? product.oldPrice
        : '';


    const oldPriceHTML =
      oldPrice
        ? `
          <strike class="off-price">
            ${escapeHTML(oldPrice)}
          </strike>
        `
        : '';


    return `
      <article class="ai-search-item">
<a href="${escapeHTML(url)}" title="${escapeHTML(name)}">
        ${
          image
            ? `
              <div class="ai-search-image">

                <img
                  src="${escapeHTML(image)}"
                  alt="${escapeHTML(name)}"
                  loading="lazy"
                  decoding="async"
                />

              </div>
            `
            : ''
        }


        <div class="ai-search-content">
          <h3>
            ${escapeHTML(name)}
          </h3>
          ${
            description
              ? `
                <p>
                  ${escapeHTML(description)}
                </p>
              `
              : ''
          }


          <div class="ai-search-price">

            ${
              price
                ? `
                  <strong class="item-price">
                    ${escapeHTML(price)}
                  </strong>
                `
                : ''
            }

            ${oldPriceHTML}

          </div>

        </div>
</a>
      </article>
    `;

  }


  /*
   * Search
   */
  form.addEventListener(
    'submit',
    async function (event) {

      event.preventDefault();


      const query =
        input.value.trim();


      if (!query) {

        results.innerHTML =
          '<span>Please enter a search query.</span>';

        return;

      }


      results.innerHTML =
        '<span>Searching...</span>';


      try {

        /*
         * =========================
         * AI SEARCH
         * =========================
         */

        const response =
          await fetch(
            SEARCH_API +
            '?q=' +
            encodeURIComponent(query)
          );


        if (!response.ok) {

          throw new Error(
            'Search request failed: ' +
            response.status
          );

        }


        const json =
          await response.json();


        if (
          !json.success ||
          !json.data ||
          !Array.isArray(json.data.chunks)
        ) {

          results.innerHTML =
            '<p>No results found.</p>';

          return;

        }


        const chunks =
          json.data.chunks;


        if (!chunks.length) {

          results.innerHTML =
            '<p>No results found.</p>';

          return;

        }


        /*
         * =========================
         * LOAD PRODUCTS
         * =========================
         */

        const productPromises =
          chunks.map(
            async function (chunk) {

              const text =
                chunk.text || '';


              /*
               * Extract URL
               */
              const url =
                extractProductURL(text);


              if (!url) {

                console.warn(
                  'Product URL not found:',
                  text
                );

                return null;

              }


              /*
               * Extract slug
               */
              const slug =
                getProductSlug(url);


              if (!slug) {

                console.warn(
                  'Product slug not found:',
                  url
                );

                return null;

              }


              /*
               * Load JSON
               */
              const product =
                await loadProduct(slug);


              if (!product) {

                return null;

              }


              return {
                product: product,
                url: url
              };

            }
          );


        const products =
          await Promise.all(
            productPromises
          );


        /*
         * Remove failed products
         */
        const validProducts =
          products.filter(
            function (item) {

              return item !== null;

            }
          );


        if (!validProducts.length) {

          results.innerHTML =
            '<p>No products found.</p>';

          return;

        }


        /*
         * =========================
         * RENDER
         * =========================
         */

        results.innerHTML =
          validProducts
            .map(function (item) {

              return createProductCard(
                item.product,
                item.url
              );

            })
            .join('');


      } catch (error) {

        console.error(
          'AI Search:',
          error
        );


        results.innerHTML =
          '<p>Unable to connect to search service.</p>';

      }

    }
  );

})();
