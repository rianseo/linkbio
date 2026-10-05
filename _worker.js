export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    return new Response(
      JSON.stringify({
        hostname: url.hostname,
        pathname: url.pathname,
        worker: 'PRODUCT-TEST-001'
      }, null, 2),
      {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store'
        }
      }
    );
  }
};
