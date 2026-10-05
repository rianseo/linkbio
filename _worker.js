export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const match = url.pathname.match(/^\/products\/([^/]+)\/?$/);

    if (match && match[1] !== 'product') {
      const slug = match[1];

      const assetURL = new URL(
        '/products/product.html',
        request.url
      );

      const assetRequest = new Request(
        assetURL.toString(),
        {
          method: 'GET'
        }
      );

      const response = await env.ASSETS.fetch(assetRequest);

      if (!response.ok) {
        return new Response(
          'Product template not found.',
          {
            status: 404,
            headers: {
              'content-type': 'text/plain; charset=UTF-8'
            }
          }
        );
      }

      let html = await response.text();

      html = html.replace(
        /<body([^>]*)>/i,
        '<body$1 data-product-slug="' + slug + '">'
      );

      return new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=UTF-8',
          'cache-control': 'no-cache'
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
