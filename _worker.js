export default {
  async fetch(request, env) {
    return new Response(
      'WORKER TEST - ' + new URL(request.url).hostname,
      {
        headers: {
          'content-type': 'text/plain; charset=UTF-8'
        }
      }
    );
  }
};
