export async function onRequestGet(context) {
  const slug = context.params.slug;

  if (!slug || slug === 'product') {
    return context.next();
  }

  const productUrl = new URL(context.request.url);

  productUrl.pathname = '/products/product.html';

  return context.env.ASSETS.fetch(productUrl);
}
