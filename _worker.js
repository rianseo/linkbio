export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const match = url.pathname.match(/^\/products\/([^/]+)\/?$/);

    if (match && match[1] !== 'product') {
      return new Response(
        'SLUG YANG DITERIMA WORKER: ' + match[1],
        {
          headers: {
            'content-type': 'text/plain; charset=UTF-8'
          }
        }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
