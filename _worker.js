export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // /products/linkbio
    // /products/nstore
    // /products/iqone
    // /products/game
    const match = url.pathname.match(/^\/products\/([^/]+)\/?$/);

    if (match && match[1] !== 'product') {
      const slug = match[1];

      // Ambil template utama
      const assetRequest = new Request(
        new URL('/products/product.html', request.url),
        request
      );

      const response = await env.ASSETS.fetch(assetRequest);

      if (!response.ok) {
        return new Response('Product template not found.', {
          status: 404,
          headers: {
            'content-type': 'text/plain; charset=UTF-8'
          }
        });
      }

      let html = await response.text();

      // Masukkan slug ke <body>
      html = html.replace(
        /<body([^>]*)>/i,
        '<body$1 data-product-slug="' + slug + '">'
      );

      return new Response(html, {
        status: response.status,
        headers: {
          'content-type': 'text/html; charset=UTF-8'
        }
      });
    }

    // Semua request lainnya tetap dilayani sebagai asset biasa
    return env.ASSETS.fetch(request);
  }
};
