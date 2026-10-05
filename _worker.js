export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/debug-product') {
      const assetURL = new URL('/products/product.html', request.url);

      const response = await env.ASSETS.fetch(
        new Request(assetURL, request)
      );

      let html = await response.text();

      const bodyMatch = html.match(/<body[^>]*>/i);

      return new Response(
        JSON.stringify({
          host: url.hostname,
          status: response.status,
          bodyTag: bodyMatch ? bodyMatch[0] : null,
          hasProductSlug: /data-product-slug/i.test(html),
          htmlLength: html.length
        }, null, 2),
        {
          headers: {
            'content-type': 'application/json; charset=UTF-8',
            'cache-control': 'no-store'
          }
        }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
