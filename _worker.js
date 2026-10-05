export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const match = url.pathname.match(/^\/products\/([^/]+)\/?$/);

    if (match && match[1] !== 'product') {
      const slug = match[1];

      const assetURL = new URL('/products/product.html', request.url);

      const assetResponse = await env.ASSETS.fetch(
        new Request(assetURL, {
          method: 'GET',
          headers: request.headers
        })
      );

      if (!assetResponse.ok) {
        return new Response(
          'Product template not found: ' + assetResponse.status,
          {
            status: 404,
            headers: {
              'content-type': 'text/plain; charset=UTF-8'
            }
          }
        );
      }

      let html = await assetResponse.text();

      html = html.replace(
        /<body([^>]*)>/i,
        '<body$1 data-product-slug="' + slug + '">'
      );

      return new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=UTF-8'
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
