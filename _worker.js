export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /*
     * Product URL
     *
     */
    const match = url.pathname.match(/^\/products\/([^/]+)\/?$/);

    if (match && match[1] !== 'product') {
      const slug = match[1];

      /*
       * Ambil product.json
       */
      const dataURL = new URL(
        '/products/data/' + slug + '.json',
        request.url
      );

      const dataResponse = await env.ASSETS.fetch(
        new Request(dataURL.toString(), {
          method: 'GET'
        })
      );

      if (!dataResponse.ok) {
        return new Response('Product data not found.', {
          status: 404,
          headers: {
            'content-type': 'text/plain; charset=UTF-8'
          }
        });
      }

      const data = await dataResponse.json();

      /*
       * Ambil template product.html
       */
      const templateURL = new URL(
        '/products/product.html',
        request.url
      );

      const templateResponse = await env.ASSETS.fetch(
        new Request(templateURL.toString(), {
          method: 'GET'
        })
      );

      if (!templateResponse.ok) {
        return new Response('Product template not found.', {
          status: 404,
          headers: {
            'content-type': 'text/plain; charset=UTF-8'
          }
        });
      }

      let html = await templateResponse.text();

      /*
       * Product data
       */
      const title = data.name || 'Blogger Template';

      const description = Array.isArray(data.description)
        ? data.description.join(' ')
        : (data.description || '');

      const image =
        Array.isArray(data.images) && data.images.length
          ? data.images[0]
          : '';

      const productURL =
        url.origin + '/products/' + slug;

      /*
       * Escape HTML attribute
       */
      function escapeHTML(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }

      /*
       * Replace SEO placeholders
       */
      html = html.replaceAll(
        '{{PRODUCT_TITLE}}',
        escapeHTML(title)
      );

      html = html.replaceAll(
        '{{PRODUCT_DESCRIPTION}}',
        escapeHTML(description)
      );

      html = html.replaceAll(
        '{{PRODUCT_URL}}',
        escapeHTML(productURL)
      );

      html = html.replaceAll(
        '{{PRODUCT_IMAGE}}',
        escapeHTML(image)
      );

      /*
       * Masukkan slug ke <body>
       */
      html = html.replace(
        /<body([^>]*)>/i,
        '<body$1 data-product-slug="' +
          escapeHTML(slug) +
          '">'
      );

      return new Response(html, {
        status: 200,
        headers: {
          'content-type': 'text/html; charset=UTF-8',
          'cache-control': 'no-cache'
        }
      });
    }

    /*
     * Semua request lainnya
     */
    return env.ASSETS.fetch(request);
  }
};
