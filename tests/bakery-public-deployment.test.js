const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.join(__dirname, '..');

test('public Hausammann deployments disable voice even when a shared API key exists', async () => {
  const { bakeryDemoVoiceEnabled } = await import(pathToFileURL(path.join(root, 'src/bakery-demo-runtime.mjs')));
  assert.equal(bakeryDemoVoiceEnabled({}), true);
  for (const env of [{ VERCEL: '1' }, { VERCEL_ENV: 'production' }, { VERCEL_ENV: 'preview' }]) {
    assert.equal(bakeryDemoVoiceEnabled(env), false);
    for (const brand of ['hausammann']) {
      const source = fs.readFileSync(path.join(root, `app/api/${brand}-demo/realtime-token/route.js`), 'utf8')
        .replace(/^import .*;\n/gm, '').replace(/export /g, '');
      let calls = 0;
      const createHandler = new Function('bakeryDemoVoiceEnabled', 'NextResponse', 'fetch', 'process', `${source}\nreturn POST;`);
      const handler = createHandler(() => bakeryDemoVoiceEnabled(env),
        { json: (body, init) => Response.json(body, init) },
        async () => { calls += 1; throw new Error('No upstream calls allowed'); },
        { env: { ...env, OPENAI_API_KEY: 'test-key-never-sent' } });
      const response = await handler();
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0');
      assert.equal(calls, 0);
      assert.deepEqual(await response.json(), { error: 'Voice is unavailable on this public demo.' });
    }
  }
});
