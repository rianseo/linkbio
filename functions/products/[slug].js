export async function onRequestGet(context) {
  const slug = context.params.slug;

  if (!slug || slug === 'product') {
    return context.next();
  }

  const url = new URL(context.request.url);

  url.pathname = '/products/product';

  return context.env.ASSETS.fetch(url);
}
