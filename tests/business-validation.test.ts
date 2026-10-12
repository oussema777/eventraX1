import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { businessContactError, offeringError } from '../src/utils/businessValidation.ts';
import en from '../src/i18n/locales/en.ts';
import fr from '../src/i18n/locales/fr.ts';
import ar from '../src/i18n/locales/ar.ts';

test('contact validation rejects missing email and unsafe/invalid websites', () => {
  assert.ok(businessContactError('', ''));
  assert.ok(businessContactError('invalid', ''));
  assert.ok(businessContactError('owner@example.test', 'javascript:alert(1)'));
  assert.ok(businessContactError('owner@example.test', 'example.test'));
  assert.equal(businessContactError('owner@example.test', 'https://example.test'), null);
  assert.equal(businessContactError('', '', false), null);
});

test('offering validation accepts free products but rejects invalid prices and fractional inventory', () => {
  assert.equal(offeringError('Free product', 0, 0), null);
  assert.equal(offeringError('Service', '', null), null);
  assert.ok(offeringError(' ', 10));
  for (const price of [-1, 'invalid', Infinity]) assert.ok(offeringError('Product', price));
  for (const quantity of [-1, 1.5, 'invalid']) assert.ok(offeringError('Product', 10, quantity));
});

test('business translation references resolve in each supported language, including fallback', () => {
  const files = fs.readdirSync('src/components/business').filter(f => f.endsWith('.tsx')).map(f => `src/components/business/${f}`);
  files.push('src/pages/BusinessProductPage.tsx');
  const keys = [...new Set(files.flatMap(file => [...fs.readFileSync(file, 'utf8').matchAll(/\bt\(['"]([^'"]+)['"]/g)].map(m => m[1])))];
  const lookup = (data: any, path: string) => path.split('.').reduce((value, part) => value?.[part], data);
  for (const locale of [en, fr, ar]) {
    for (const key of keys.filter(k => /^(business|productsManagement)/.test(k))) {
      assert.equal(typeof (lookup(locale, key) ?? lookup(en, key)), 'string', `Missing: ${key}`);
    }
    assert.equal(Object.keys(locale.businessFlows.sizes).length, 5);
  }
});
