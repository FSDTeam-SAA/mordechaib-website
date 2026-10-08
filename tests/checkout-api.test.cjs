const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const mod = { exports: {} };
new Function('module', 'exports', ts.transpileModule(fs.readFileSync('src/lib/checkout-api.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText)(mod, mod.exports);
const { checkoutBody, startCheckout } = mod.exports;
const products = [{ _id: 'product', isInquiryOnly: false, tiers: [{}, {}, {}] }];
const originalFetch = global.fetch;
const originalBase = process.env.NEXT_PUBLIC_BACKEND_API_URL;
after(() => { global.fetch = originalFetch; if (originalBase === undefined) delete process.env.NEXT_PUBLIC_BACKEND_API_URL; else process.env.NEXT_PUBLIC_BACKEND_API_URL = originalBase; });
process.env.NEXT_PUBLIC_BACKEND_API_URL = 'https://api.test/api/v1/';
test('payload preserves two tiers from the same product, removes duplicates, and uses current origin', () => {
  assert.deepEqual(checkoutBody('plan', ['product:0', 'product:2', 'product:0'], products, 'https://app.test'), {
    planId: 'plan', successUrl: 'https://app.test/dashboard/billing?success=true', cancelUrl: 'https://app.test/dashboard/billing?canceled=true', addons: [{ addonProductId: 'product', tierIndex: 0 }, { addonProductId: 'product', tierIndex: 2 }],
  });
  assert.deepEqual(checkoutBody('plan', [], products, 'http://localhost:3000').addons, []);
  assert.equal(checkoutBody('plan', [], products, 'https://app.test').billingCycle, undefined);
  assert.equal(checkoutBody('plan', [], products, 'https://app.test', 'year').billingCycle, 'year');
  assert.throws(() => checkoutBody('plan', ['product:3'], products, 'https://app.test'), /unavailable/);
  assert.throws(() => checkoutBody('plan', ['product:0'], [{ ...products[0], isInquiryOnly: true }], 'https://app.test'), /unavailable/);
});
test('checkout uses POST, bearer token and returns checkoutUrl from backend envelope', async () => {
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.test/api/v1/billing/checkout-session-with-addons');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer session-token');
    assert.equal(JSON.parse(options.body).planId, 'plan');
    assert.equal(JSON.parse(options.body).billingCycle, undefined);
    return Response.json({ success: true, data: { checkoutUrl: 'https://checkout.stripe.com/c/pay/test' } });
  };
  assert.equal(await startCheckout('plan', [], products, 'https://app.test', 'session-token'), 'https://checkout.stripe.com/c/pay/test');
});
test('unauthenticated checkout never calls server; backend and missing URL failures reject', async () => {
  global.fetch = () => { throw new Error('Unexpected request'); };
  await assert.rejects(startCheckout('plan', [], products, 'https://app.test', ''), /sign in/);
  global.fetch = async () => Response.json({ success: false, message: 'Already subscribed' }, { status: 400 });
  await assert.rejects(startCheckout('plan', [], products, 'https://app.test', 'token'), /Already subscribed/);
  global.fetch = async () => Response.json({ success: true, data: { checkoutUrl: null } });
  await assert.rejects(startCheckout('plan', [], products, 'https://app.test', 'token'), /checkout link/);
});
