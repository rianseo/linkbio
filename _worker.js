export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    /*
     * =========================
     * ROBOTS.TXT
     * =========================
     */
    if (url.pathname === '/robots.txt') {
      const robots = [
        'User-agent: *',
        'Allow: /',
        '',
        'Sitemap: ' + url.origin + '/sitemap.xml'
      ].join('\n');

      return new Response(robots, {
        status: 200,
        headers: {
          'content-type': 'text/plain; charset=UTF-8',
          'cache-control': 'public, max-age=3600'
        }
      });
    }

    /*
     * =========================
     * SITEMAP.XML
     * =========================
     */
    if (url.pathname === '/sitemap.xml') {

      const products = [
        'linkbio',
        'nstore',
        'iqone',
        'game'
      ];

      const urls = [
        `
        <url>
          <loc>${url.origin}/</loc>
        </url>
        `
      ];

      for (const slug of products) {

        const dataURL = new URL(
          '/products/data/' + slug + '.json',
          request.url
        );

        const response = await env.ASSETS.fetch(
          new Request(dataURL.toString(), {
            method: 'GET'
          })
        );

        if (!response.ok) {
          continue;
        }

        urls.push(`
        <url>
          <loc>${url.origin}/products/${slug}</loc>
        </url>
        `);
      }

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

      return new Response(sitemap, {
        status: 200,
        headers: {
          'content-type': 'application/xml; charset=UTF-8',
          'cache-control': 'public, max-age=3600'
        }
      });
    }

    /*
     * =========================
     * PRODUCT PAGE
     * =========================
     */

    const match = url.pathname.match(
      /^\/products\/([^/]+)\/?$/
    );

    if (match && match[1] !== 'product') {

      const slug = match[1];

      /*
       * Ambil product JSON
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
       * =========================
       * PRODUCT DATA
       * =========================
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
       * =========================
       * ESCAPE HTML
       * =========================
       */

      function escapeHTML(value) {
        return String(value)
          .replace(/&/g, '&amp;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
      }

      /*
       * =========================
       * SEO META
       * =========================
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
       * =========================
       * PRODUCT SLUG
       * =========================
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
     * =========================
     * OTHER REQUESTS
     * =========================
     */

    return env.ASSETS.fetch(request);
  }
};
