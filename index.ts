Deno.serve(() => {
  return new Response("Hello world!", {
    headers: { "content-type": "text/plain" },
    status: 200,
  });
});
