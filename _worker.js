export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const match = url.pathname.match(/^\/products\/([^/]+)\/?$/);

    if (match) {
      const slug = match[1];

      if (slug !== 'product') {
        const templateURL = new URL(request.url);
        templateURL.pathname = '/products/product';

        const response = await env.ASSETS.fetch(
          new Request(templateURL, {
            method: 'GET',
            headers: request.headers,
            redirect: 'follow'
          })
        );

        if (!response.ok) {
          return response;
        }

        let html = await response.text();

        /*
         * Masukkan slug ke <body>
         */
        html = html.replace(
          /<body([^>]*)>/i,
          '<body$1 data-product-slug="' + slug + '">'
        );

        const headers = new Headers(response.headers);

        headers.delete('location');

        return new Response(html, {
          status: 200,
          headers: headers
        });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
