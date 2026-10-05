export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/debug-assets') {
      const assetURL = new URL('/products/product.html', request.url);

      const response = await env.ASSETS.fetch(
        new Request(assetURL, {
          method: 'GET',
          headers: request.headers
        })
      );

      return new Response(
        JSON.stringify({
          host: url.hostname,
          assetURL: assetURL.href,
          status: response.status,
          location: response.headers.get('location'),
          contentType: response.headers.get('content-type'),
          cacheStatus: response.headers.get('cf-cache-status')
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
