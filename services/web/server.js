import assert from 'assert';
import path from 'path';
import Koa from 'koa';
import Router from 'koa-router';
import send from 'koa-send';

// Assertions
const port = process.env.PORT;
assert(port, 'No port specified');

const app = new Koa();
const router = new Router();

// Heartbeat path
router.get('/heartbeat', async function(ctx) {
  ctx.body = 'beating';
});

// Route serving up public env vars
router.get('/globals', async function(ctx) {
  ctx.body = {
    PORT: process.env.PORT,
    LND_GATEWAY_HOST: process.env.LND_GATEWAY_HOST,
  };
});

// Serve files with extension dots ('.') from build.
// Paths like /thing.js
router.get(/\./, async function(ctx) {
  await send(ctx, ctx.path, { root: path.join(__dirname, 'build') });
});

// Serve main app page (index.html) for all other paths
router.get('/*', async function(ctx) {
  await send(ctx, 'index.html', { root: path.join(__dirname, 'build') });
});

app.use(router.routes());
app.listen(port);

console.log(`listening on port ${port}`);
console.log('If this process is running in a container, it may be mapped to a different host port.');