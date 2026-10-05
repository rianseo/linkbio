export async function onRequest(context) {
  const slug = context.params.slug;

  if (!slug || slug === 'product') {
    return context.next();
  }

  const url = new URL(context.request.url);

  url.pathname = '/products/product.html';

  return fetch(new Request(url, context.request));
}
