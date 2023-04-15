import { Application, Router } from 'https://deno.land/x/oak@v12.1.0/mod.ts';
import { jarvisHandler, jarvisValidate } from './webhooks/jarvis/index.ts';

const router = new Router();
router.get('', async (ctx) => {
  await ctx.send({
    root: `${Deno.cwd()}`,
    index: 'index.html',
  });
});
router.post('/webhooks/jarvis', async (ctx) => {
  ctx.response.status = 200;
  if (!jarvisValidate(ctx.request)) return;
  await Promise.all((await ctx.request.body({ type: 'json' }).value).events.map(jarvisHandler));
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port: 8000 });
