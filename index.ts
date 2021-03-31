import { serve } from 'https://deno.land/std@0.182.0/http/server.ts';

await serve(() => {
  return new Response('Hello world!', {
    headers: { 'content-type': 'text/plain' },
    status: 200,
  });
});
