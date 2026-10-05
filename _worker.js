export default {
  async fetch(request, env) {
    return new Response('WORKER AKTIF');
  }
};

    /*
     * PRODUCT ROUTING
     *
     * /products/linkbio
     * /products/nstore
     * /products/iqone
     *
     * semuanya menggunakan:
     *
     * /products/product
     */

    const match = url.pathname.match(/^\/products\/([^/]+)\/?$/);

    if (match) {
      const slug = match[1];

      /*
       * Jangan intercept file/template internal.
       */
      if (slug !== 'product') {

        /*
         * Ambil template product dari asset server.
         */
        const productURL = new URL(request.url);

        productURL.pathname = '/products/product';

        const productRequest = new Request(productURL, {
          method: 'GET',
          headers: request.headers,
          redirect: 'follow'
        });

        const response = await env.ASSETS.fetch(productRequest);

        /*
         * Kalau template tidak ditemukan,
         * teruskan response aslinya.
         */
        if (!response.ok) {
          return response;
        }

        /*
         * Kirim slug produk ke JavaScript.
         */
        let html = await response.text();

        const productSlug = JSON.stringify(slug)
          .replace(/</g, '\\u003c');

        html = html.replace(
          '</head>',
          '<script>window.PRODUCT_SLUG=' +
          productSlug +
          ';</script></head>'
        );

        /*
         * Buat response baru.
         *
         * Jangan membawa header Location,
         * karena kita tidak ingin browser
         * pindah ke /products/product.
         */
        const headers = new Headers(response.headers);

        headers.delete('location');

        return new Response(html, {
          status: 200,
          headers: headers
        });
      }
    }

    /*
     * Semua request lainnya tetap menggunakan
     * static assets biasa.
     */
    return env.ASSETS.fetch(request);
  }
};
