export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const match = url.pathname.match(/^\/products\/([^/]+)\/?$/);

    if (match) {
      const slug = match[1];

      // Jangan intercept template utama
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

        const safeSlug = JSON.stringify(slug)
          .replace(/</g, '\\u003c');

        /*
         * Inject SEBELUM isi <head>.
         *
         * Ini penting agar PRODUCT_SLUG sudah tersedia
         * sebelum script-page.js dijalankan.
         */
        html = html.replace(
          /<head([^>]*)>/i,
          '<head$1><script>window.PRODUCT_SLUG=' +
          safeSlug +
          ';</script>'
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
