export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /*
     * PRODUCT ROUTE
     *
     * /products/linkbio
     * /products/nstore
     * /products/iqone
     * /products/game
     */

    const match = url.pathname.match(/^\/products\/([^/]+)\/?$/);

    if (match) {
      const slug = match[1];

      /*
       * Jangan proses template utama sebagai produk.
       */
      if (slug !== 'product') {

        /*
         * Ambil template product.
         */
        const templateURL = new URL(request.url);
        templateURL.pathname = '/products/product';

        const templateRequest = new Request(templateURL, {
          method: 'GET',
          headers: request.headers,
          redirect: 'follow'
        });

        const response = await env.ASSETS.fetch(templateRequest);

        if (!response.ok) {
          return response;
        }

        let html = await response.text();

        /*
         * Kirim slug ke JavaScript.
         */
        const safeSlug = JSON.stringify(slug)
          .replace(/</g, '\\u003c');

        html = html.replace(
          '</head>',
          '<script>window.PRODUCT_SLUG=' +
          safeSlug +
          ';</script></head>'
        );

        /*
         * Jangan kirim Location dari asset server
         * ke browser.
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
     * Semua request lainnya:
     * CSS, JS, gambar, JSON, halaman lain, dll.
     */
    return env.ASSETS.fetch(request);
  }
};
